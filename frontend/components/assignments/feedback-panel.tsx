'use client'

import type { Question } from '@/lib/types'
import { motion } from 'motion/react'
import { Check, X, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeedbackPanel({
  question,
  correct,
  justificationScore,
  justificationFeedback,
}: {
  question: Question
  correct: boolean
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border p-4 font-mono text-sm',
        correct
          ? 'border-success/40 bg-success/5'
          : 'border-destructive/40 bg-destructive/5',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 font-bold uppercase tracking-wider',
          correct ? 'text-success' : 'text-destructive',
        )}
      >
        {correct ? <Check className="size-4" /> : <X className="size-4" />}
        {correct ? 'Correct Classification' : 'Misclassified'}
      </div>

      <p className="mt-3 leading-relaxed text-foreground/80">
        <span className="font-bold text-foreground">Analyst note: </span>
        {question.explanation}
      </p>

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
