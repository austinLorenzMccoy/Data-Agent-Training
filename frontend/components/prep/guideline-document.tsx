'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { GuidelinePack } from '@/lib/guidelines'
import {
  GuidelineMarkdownDocument,
  MapsGuidelineDocument,
} from '@/components/prep/maps-guideline-reader'
import pqDoc from '@/lib/pq-guideline-doc.json'
import lightspeedDoc from '@/lib/lightspeed-guideline-doc.json'
import freyaDoc from '@/lib/freya-guideline-doc.json'
import proficiencyDoc from '@/lib/proficiency-guideline-doc.json'
import dataannotationDoc from '@/lib/dataannotation-guideline-doc.json'
import { cn } from '@/lib/utils'

const MARKDOWN_DOCS = {
  pq: pqDoc,
  lightspeed: lightspeedDoc,
  freya: freyaDoc,
  proficiency: proficiencyDoc,
  dataannotation: dataannotationDoc,
} as const

export function GuidelineDocument({ pack }: { pack: GuidelinePack }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/guidelines"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" />
        All guidelines
      </Link>

      <header className="mt-5 mb-8">
        <p className="text-[12px] font-medium text-primary">
          {pack.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{pack.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{pack.source}</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{pack.why}</p>
      </header>

      <article className="min-w-0">
        {pack.illustrated === 'maps' ? (
          <MapsGuidelineDocument />
        ) : pack.illustrated && pack.illustrated in MARKDOWN_DOCS ? (
          <GuidelineMarkdownDocument
            chapters={MARKDOWN_DOCS[pack.illustrated as keyof typeof MARKDOWN_DOCS].chapters}
          />
        ) : (
          <div className="space-y-8">
            {pack.chapters.map((chapter) => (
              <section key={chapter.id} id={chapter.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold tracking-tight">{chapter.title}</h2>
                {chapter.subtitle && (
                  <p className="mt-1 text-xs text-muted-foreground">{chapter.subtitle}</p>
                )}
                {chapter.intro && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {chapter.intro}
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  {chapter.rows.map((row, i) => (
                    <div
                      key={`${row.label ?? 'r'}-${i}`}
                      className={cn(
                        'flex gap-3 rounded-md border px-3 py-2',
                        row.tone === 'good' && 'border-success/25 bg-success/5',
                        row.tone === 'warn' && 'border-xp/25 bg-xp/5',
                        row.tone === 'bad' && 'border-danger/25 bg-danger/5',
                        (!row.tone || row.tone === 'default') &&
                          'border-border bg-background/40',
                      )}
                    >
                      {row.label && (
                        <span className="mt-0.5 w-24 shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {row.label}
                        </span>
                      )}
                      <p className="text-sm leading-relaxed text-foreground/90">{row.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
