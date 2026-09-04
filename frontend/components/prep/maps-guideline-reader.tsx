'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import doc from '@/lib/maps-guideline-doc.json'

type Chapter = { id: string; title: string; markdown: string }

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const token = m[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={i++}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={i++}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={i++} className="rounded bg-background px-1 font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>,
      )
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        parts.push(
          <a key={i++} href={link[2]} className="text-primary underline-offset-2 hover:underline">
            {link[1]}
          </a>,
        )
      }
    }
    last = m.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function MarkdownBody({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (img) {
      const group: { alt: string; src: string }[] = []
      while (i < lines.length) {
        const next = lines[i].match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        if (!next) break
        group.push({ alt: next[1], src: next[2] })
        i += 1
        while (i < lines.length && lines[i].trim() === '') i += 1
        if (i < lines.length && /^!\[/.test(lines[i])) continue
        break
      }
      nodes.push(
        <figure key={key++} className="my-3 space-y-2">
          {group.map((g, gi) => (
            <Image
              key={gi}
              src={g.src}
              alt={g.alt}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-full max-w-full rounded-md border border-border bg-white object-contain"
              style={{ width: '100%', height: 'auto' }}
            />
          ))}
        </figure>,
      )
      continue
    }

    const h = line.match(/^(#{2,4})\s+(.+)$/)
    if (h) {
      const level = h[1].length
      const cls =
        level === 2
          ? 'mt-5 text-base font-semibold'
          : level === 3
            ? 'mt-4 text-sm font-semibold'
            : 'mt-3 text-sm font-medium'
      nodes.push(
        <p key={key++} className={cls}>
          {inline(h[2])}
        </p>,
      )
      i += 1
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i += 1
      }
      nodes.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          {items.map((item, ii) => (
            <li key={ii}>{inline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }
      nodes.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
          {items.map((item, ii) => (
            <li key={ii}>{inline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (line.trim() === '' || /^[-*]{3,}$/.test(line.trim()) || /^\s*\|?\s*-{3,}/.test(line)) {
      i += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoted: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^>\s?/, ''))
        i += 1
      }
      nodes.push(
        <blockquote
          key={key++}
          className="my-3 border-l-2 border-primary/40 pl-3 text-sm leading-relaxed text-foreground/90"
        >
          {inline(quoted.join(' '))}
        </blockquote>,
      )
      continue
    }

    const para = [line]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4}\s|[-*]\s|\d+\.\s|!\[|>\s?)/.test(lines[i])
    ) {
      para.push(lines[i])
      i += 1
    }
    nodes.push(
      <p key={key++} className="my-2 text-sm leading-relaxed text-foreground/90">
        {inline(para.join(' '))}
      </p>,
    )
  }

  return <div className="guideline-prose">{nodes}</div>
}

export function GuidelineMarkdownDocument({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="space-y-12">
      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {chapters.map((chapter) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            {chapter.title.replace(/^\d+\.\s*/, '')}
          </a>
        ))}
      </nav>
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="scroll-mt-24">
          <h2 className="mb-4 font-heading text-xl font-medium tracking-tight">{chapter.title}</h2>
          <MarkdownBody markdown={chapter.markdown} />
        </section>
      ))}
    </div>
  )
}

export function MapsGuidelineDocument() {
  return <GuidelineMarkdownDocument chapters={(doc as { chapters: Chapter[] }).chapters} />
}
