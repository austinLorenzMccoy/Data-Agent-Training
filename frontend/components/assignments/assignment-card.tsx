'use client'

import type { Question } from '@/lib/types'
import { TYPE_LABELS, TYPE_NAMES } from '@/lib/scoring'
import { ClassificationStamp } from '@/components/classification-stamp'
import { cn } from '@/lib/utils'

export function AssignmentCard({
  question,
  children,
  flashState,
}: {
  question: Question
  children: React.ReactNode
  flashState?: 'correct' | 'wrong' | 'partial' | null
}) {
  return (
    <div
      className={cn(
        'agency-card agency-card-accent dossier-texture p-5 sm:p-6',
        flashState === 'correct' && 'animate-flash-success',
        flashState === 'partial' && 'animate-flash-success',
        flashState === 'wrong' && 'animate-shake animate-flash-danger',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Assignment Type {TYPE_LABELS[question.type]}
          </p>
          <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-wide">
            {TYPE_NAMES[question.type]}
          </h2>
        </div>
        <ClassificationStamp difficulty={question.difficulty} />
      </div>

      <div className="mb-4 rounded-md border border-border bg-background/50 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Operation Context
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {question.operationContext}
        </p>
      </div>

      {children}
    </div>
  )
}

export function PromptBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="rounded-md border border-border bg-surface-raised/40 p-3 font-mono text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  )
}
