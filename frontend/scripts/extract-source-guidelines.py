#!/usr/bin/env python3
"""Turn the source guideline files into in-app markdown JSON + figures."""

from __future__ import annotations

import io
import json
import re
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path("/Users/a/Documents/data-agent-training-platform")
DOCS = ROOT / "docs/guidelines"
LIB = ROOT / "frontend/lib"
PUBLIC = ROOT / "frontend/public/guidelines"
EXTRACT = Path("/tmp/guideline-extract")

PQ_HEADINGS = [
    (re.compile(r"^Introduction\b", re.I), "Introduction"),
    (re.compile(r"^Purpose of Search Quality Rating", re.I), "Purpose of Search Quality Rating"),
    (re.compile(r"^Page Quality\b", re.I), "Page Quality"),
    (re.compile(r"^Understanding Websites", re.I), "Understanding websites and pages"),
    (re.compile(r"^Understanding the Purpose", re.I), "Purpose of a web page"),
    (re.compile(r"^Your Money or Your Life", re.I), "Your Money or Your Life (YMYL)"),
    (re.compile(r"^Webpage Content", re.I), "Webpage content"),
    (re.compile(r"^Overall Page Quality Rating", re.I), "Overall Page Quality rating"),
    (re.compile(r"^Page Quality Considerations", re.I), "Page Quality considerations"),
    (re.compile(r"^Lowest Page Quality", re.I), "Lowest Page Quality"),
    (re.compile(r"^Low Page Quality", re.I), "Low Page Quality"),
    (re.compile(r"^Medium Page Quality", re.I), "Medium Page Quality"),
    (re.compile(r"^High Page Quality", re.I), "High Page Quality"),
    (re.compile(r"^Highest Quality Pages", re.I), "Highest quality pages"),
    (re.compile(r"^Very High Level of E-E-A-T", re.I), "Very high E-E-A-T"),
    (re.compile(r"^Important Rating Definitions", re.I), "Rating definitions"),
    (re.compile(r"^Locale and User Location", re.I), "Locale and user location"),
    (re.compile(r"^Know Simple queries", re.I), "Know Simple queries"),
    (re.compile(r"^Visit-in-Person", re.I), "Visit-in-person queries"),
    (re.compile(r"^Slightly Meets", re.I), "Needs Met scale"),
    (re.compile(r"^Examples of Fully Meets", re.I), "Examples of Fully Meets"),
    (re.compile(r"^Examples of Highly Meets", re.I), "Examples of Highly Meets"),
    (re.compile(r"^Examples of Moderately Meets", re.I), "Examples of Moderately Meets"),
    (re.compile(r"^Examples of Slightly Meets", re.I), "Examples of Slightly Meets"),
    (re.compile(r"^Examples of Fails to Meet", re.I), "Examples of Fails to Meet"),
    (re.compile(r"^Needs Met Rating for Clear Non-Porn", re.I), "Porn, foreign language, Did Not Load"),
    (re.compile(r"^Rater-Identified Duplicates", re.I), "Duplicates and extra cases"),
]


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:72] or "section"


def tidy_md(text: str) -> str:
    text = text.replace("\\_", "_").replace("\\'", "'")
    text = text.replace("\\[", "[").replace("\\]", "]").replace("\\*", "*")
    return text


def clean_pdf_text(raw: str) -> str:
    text = raw.replace("\u00ad", "")
    text = re.sub(r"(?m)^\d{1,3}$", "", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # drop dotted TOC lines
    lines = []
    for line in text.splitlines():
        if re.search(r"\.{6,}", line):
            continue
        if re.match(r"^V\.\d+\s+Feb", line, re.I):
            continue
        lines.append(line.rstrip())
    return "\n".join(lines).strip()


def save_webp(data: bytes, dest: Path, max_w: int = 1200) -> None:
    im = Image.open(io.BytesIO(data))
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=78, method=6)


def extract_pq() -> None:
    src = DOCS / "content reviewer.pdf"
    img_dir = PUBLIC / "pq"
    img_dir.mkdir(parents=True, exist_ok=True)
    for old in img_dir.glob("*"):
        old.unlink()

    doc = fitz.open(src)
    seen: set[int] = set()
    chapters: list[dict[str, str]] = []
    current: dict[str, str] | None = None
    fig_n = 0

    for i, page in enumerate(doc):
        raw = page.get_text("text") or ""
        body = clean_pdf_text(raw)
        heading = None
        for pat, title in PQ_HEADINGS:
            if pat.search(body):
                heading = title
                break
        if heading is None and current is None:
            heading = "General Guidelines"
        if heading is not None and (current is None or current["title"] != heading):
            current = {
                "id": f"pq-{len(chapters):02d}-{slug(heading)}",
                "title": heading,
                "markdown": "",
            }
            chapters.append(current)
        assert current is not None
        if body:
            current["markdown"] += ("\n\n" if current["markdown"] else "") + body

        for im in page.get_images(full=True):
            xref = im[0]
            if xref == 6 or xref in seen:
                continue
            seen.add(xref)
            info = doc.extract_image(xref)
            if not info:
                continue
            w, h = info.get("width") or 0, info.get("height") or 0
            if w < 80 or h < 80:
                continue
            fig_n += 1
            name = f"{fig_n:03d}.webp"
            save_webp(info["image"], img_dir / name)
            current["markdown"] += f"\n\n![figure {fig_n}](/guidelines/pq/{name})\n"

    chapters = [c for c in chapters if len(c["markdown"]) > 80]
    out = LIB / "pq-guideline-doc.json"
    out.write_text(json.dumps({"chapters": chapters}, ensure_ascii=False))
    print(f"pq  chapters={len(chapters)}  figs={fig_n}  json={out.stat().st_size}")


def split_on_titles(md: str, titles: list[str]) -> list[dict[str, str]]:
    text = tidy_md(md.replace("\r\n", "\n"))
    text = re.sub(r"\\\.", ".", text)
    hits: list[tuple[int, int, str]] = []
    for title in titles:
        m = re.search(rf"(?m)^\d+\.\s+{re.escape(title)}\s*$", text)
        if not m:
            m = re.search(rf"(?m)^{re.escape(title)}\s*$", text)
        if m:
            hits.append((m.start(), m.end(), title))
    hits.sort()
    chapters: list[dict[str, str]] = []
    if not hits:
        return [{"id": "full", "title": "Full guideline", "markdown": text.strip()}]
    preamble = text[: hits[0][0]].strip()
    if preamble:
        chapters.append({"id": "intro", "title": "Overview", "markdown": preamble})
    for i, (_s, end, title) in enumerate(hits):
        stop = hits[i + 1][0] if i + 1 < len(hits) else len(text)
        chapters.append(
            {
                "id": f"ch-{len(chapters):02d}-{slug(title)}",
                "title": title,
                "markdown": text[end:stop].strip(),
            }
        )
    return chapters


def split_exam_questions(md: str, title: str) -> list[dict[str, str]]:
    text = tidy_md(md.replace("\r\n", "\n"))
    text = re.sub(r"\\\.", ".", text)
    q_re = re.compile(r"(?m)^\*\*(\d{2})\.\s+(.+?)\*\*")
    hits = list(q_re.finditer(text))
    if not hits:
        return [{"id": "full", "title": title, "markdown": text.strip()}]
    preamble = text[: hits[0].start()].strip()
    chapters = []
    if preamble:
        chapters.append({"id": "intro", "title": "Overview", "markdown": preamble})
    blocks = []
    for i, m in enumerate(hits):
        end = hits[i + 1].start() if i + 1 < len(hits) else len(text)
        q = m.group(2).strip()
        body = text[m.end() : end].strip()
        blocks.append(f"### {m.group(1)}. {q}\n\n{body}")
    chapters.append(
        {
            "id": "questions",
            "title": title,
            "markdown": "\n\n".join(blocks),
        }
    )
    return chapters


LIGHTSPEED_TITLES = [
    "Introduction",
    "Glossary of Terms",
    "The 5-Step Grading Process",
    "Satisfaction Principles",
    "Special Case Handling",
    "Overall Preference Rating (OPR)",
    "Common Grading Mistakes to Avoid",
    "Quick Reference Summary",
    "Next Steps & Support",
]

FREYA_TITLES = [
    "Project Overview",
    "Annotation Workflow (7 Steps)",
    "Segmentation & Speaker Labeling Rules",
    "Transcription Guidelines",
    "Tags (Unsure & Truncated)",
    "Audio Quality Evaluation",
    "Pre-Annotated Tasks & Forbidden Zones",
    "Final Review Checklist",
    "Key Recap -- Critical Rules to Remember",
    "Knowledge Check Questions & Answers",
]


def convert_docx_mds() -> None:
    lightspeed = split_on_titles((EXTRACT / "lightspeed.md").read_text(), LIGHTSPEED_TITLES)
    (LIB / "lightspeed-guideline-doc.json").write_text(
        json.dumps({"chapters": lightspeed}, ensure_ascii=False)
    )
    print(f"lightspeed  chapters={len(lightspeed)}")

    guide = split_on_titles((EXTRACT / "freya-guide.md").read_text(), FREYA_TITLES)
    exam_md = tidy_md((EXTRACT / "freya-exam.md").read_text().strip())
    freya = guide + [
        {
            "id": "live-exam",
            "title": "Live exam answers (22)",
            "markdown": exam_md,
        }
    ]
    (LIB / "freya-guideline-doc.json").write_text(json.dumps({"chapters": freya}, ensure_ascii=False))
    print(f"freya  chapters={len(freya)}")

    proficiency = split_exam_questions(
        (EXTRACT / "en-ca.md").read_text(),
        "50-question compilation",
    )
    (LIB / "proficiency-guideline-doc.json").write_text(
        json.dumps({"chapters": proficiency}, ensure_ascii=False)
    )
    print(f"proficiency  chapters={len(proficiency)}")


if __name__ == "__main__":
    EXTRACT.mkdir(exist_ok=True)
    extract_pq()
    convert_docx_mds()
