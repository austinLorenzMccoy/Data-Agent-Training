'use client'

import type { Question } from '@/lib/types'
import { motion } from 'motion/react'
import { Check, X, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isV4Type } from '@/lib/feature-flags'
import { scoreDomainQuestion } from '@/lib/domain-scoring'

export function FeedbackPanel({
  question,
  correct,
  justificationScore,
  justificationFeedback,
  selection,
  ratio,
}: {
  question: Question
  correct: boolean
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
  selection?: unknown
  ratio?: number
}) {
  const breakdown =
    isV4Type(question.type) && selection !== undefined
      ? scoreDomainQuestion(question, selection)
      : null
  const displayRatio = ratio ?? breakdown?.ratio
  const partial = !correct && (displayRatio ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border p-4 font-mono text-sm',
        correct
          ? 'border-success/40 bg-success/5'
          : partial
            ? 'border-xp/40 bg-xp/5'
            : 'border-destructive/40 bg-destructive/5',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 font-bold uppercase tracking-wider',
          correct ? 'text-success' : partial ? 'text-xp' : 'text-destructive',
        )}
      >
        {correct ? <Check className="size-4" /> : <X className="size-4" />}
        {correct
          ? 'Correct Classification'
          : partial
            ? `Partial credit — ${Math.round((displayRatio ?? 0) * 100)}%`
            : 'Misclassified'}
      </div>

      <p className="mt-3 leading-relaxed text-foreground/80">
        <span className="font-bold text-foreground">Analyst note: </span>
        {question.explanation}
      </p>

      {breakdown && breakdown.diffs.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
          {breakdown.diffs.map((d) => (
            <div
              key={d.field}
              className="flex flex-wrap items-baseline justify-between gap-2 text-xs"
            >
              <span className="text-muted-foreground">{d.field}</span>
              <span className={d.credit === 1 ? 'text-success' : d.credit > 0 ? 'text-xp' : 'text-destructive'}>
                you {d.agent} · gold {d.correct}
                {d.credit === 1 ? ' ✓' : d.credit === 0.5 ? ' ~' : ' ✗'}
              </span>
            </div>
          ))}
        </div>
      )}

      {breakdown?.notes?.map((note) => (
        <p key={note} className="mt-3 text-xs leading-relaxed text-foreground/70">
          {note}
        </p>
      ))}

      {typeof justificationScore === 'number' && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 text-accent">
            <Lightbulb className="size-4" />
            <span className="font-bold uppercase tracking-wider">
              Justification Review — {justificationScore}/2
            </span>
          </div>
          {justificationFeedback && (
            <p className="mt-1 leading-relaxed text-foreground/70">
              {justificationFeedback}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
