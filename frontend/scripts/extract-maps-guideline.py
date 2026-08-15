#!/usr/bin/env python3
"""Split the illustrated TryRating markdown into chapters + public webp files."""

from __future__ import annotations

import base64
import json
import re
from pathlib import Path

SRC = Path(
    "/Users/a/Documents/data-agent-training-platform/docs/guidelines/tryrating_map_guideline_with_images.md"
)
OUT_IMG = Path(
    "/Users/a/Documents/data-agent-training-platform/frontend/public/guidelines/maps"
)
OUT_JSON = Path(
    "/Users/a/Documents/data-agent-training-platform/frontend/lib/maps-guideline-doc.json"
)

IMG_RE = re.compile(
    r"!\[([^\]]*)\]\((data:image/(webp|png|jpeg|jpg);base64,([A-Za-z0-9+/=\n\r]+))\)",
    re.I,
)
H1_RE = re.compile(r"^# (.+)$", re.M)


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:60] or "section"


def main() -> None:
    raw = SRC.read_text()
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    for old in OUT_IMG.glob("*"):
        old.unlink()

    n = 0

    def replace_img(match: re.Match[str]) -> str:
        nonlocal n
        n += 1
        alt = match.group(1).strip() or f"figure {n}"
        ext = match.group(3).lower()
        if ext == "jpeg":
            ext = "jpg"
        payload = re.sub(r"\s+", "", match.group(4))
        name = f"{n:03d}.{ext}"
        (OUT_IMG / name).write_bytes(base64.b64decode(payload))
        return f"![{alt}](/guidelines/maps/{name})"

    rewritten = IMG_RE.sub(replace_img, raw)

    # Drop the leading title + TOC (first H1 is the doc title).
    matches = list(H1_RE.finditer(rewritten))
    if not matches:
        raise SystemExit("no H1 headings found")

    chapters: list[dict[str, str]] = []
    for i, m in enumerate(matches):
        title = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(rewritten)
        body = rewritten[start:end].strip()
        if i == 0 and title.lower().startswith("maps search"):
            continue
        chapters.append(
            {
                "id": f"ch-{i:02d}-{slug(title)}",
                "title": title,
                "markdown": body,
            }
        )

    OUT_JSON.write_text(json.dumps({"chapters": chapters}, ensure_ascii=False))
    sizes = [p.stat().st_size for p in OUT_IMG.glob("*")]
    print(f"images {len(sizes)}  bytes {sum(sizes)}  chapters {len(chapters)}")
    print(f"json {OUT_JSON.stat().st_size} bytes")


if __name__ == "__main__":
    main()
