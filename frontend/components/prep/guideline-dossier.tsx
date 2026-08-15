'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GuidelinePack, StudyRow } from '@/lib/guidelines'

function toneClass(tone: StudyRow['tone']) {
  if (tone === 'good') return 'border-success/25 bg-success/5'
  if (tone === 'warn') return 'border-xp/25 bg-xp/5'
  if (tone === 'bad') return 'border-danger/25 bg-danger/5'
  return 'border-border bg-background/40'
}

function Chapter({
  title,
  subtitle,
  intro,
  rows,
  defaultOpen = false,
}: {
  title: string
  subtitle?: string
  intro?: string
  rows: StudyRow[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-background/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
      >
        <div>
          <p className="text-sm font-medium leading-tight">{title}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="space-y-2 border-t border-border px-3.5 py-3">
              {intro && <p className="text-xs leading-relaxed text-muted-foreground">{intro}</p>}
              {rows.map((row, i) => (
                <div
                  key={`${row.label ?? 'r'}-${i}`}
                  className={cn('flex gap-3 rounded-md border px-3 py-2', toneClass(row.tone))}
                >
                  {row.label && (
                    <span className="mt-0.5 w-24 shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                      {row.label}
                    </span>
                  )}
                  <p className="text-xs leading-relaxed text-foreground/90">{row.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function GuidelineDossier({
  pack,
  defaultOpen = false,
}: {
  pack: GuidelinePack
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      id={`guideline-${pack.id}`}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-primary/25 bg-primary/5"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left"
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <BookOpen className="size-3.5" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {pack.eyebrow}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-tight">{pack.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{pack.source}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-primary">
            {open ? 'Collapse' : `${pack.chapters.length} chapters`}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-primary transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-primary/20 px-3.5 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">{pack.why}</p>
          <div className="space-y-2">
            {pack.chapters.map((chapter, i) => (
              <Chapter
                key={chapter.id}
                title={chapter.title}
                subtitle={chapter.subtitle}
                intro={chapter.intro}
                rows={chapter.rows}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
