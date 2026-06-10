'use client'

import { useState } from 'react'
import type { AlphaRating, FlagReason, Question } from '@/lib/types'
import { FLAG_REASONS } from '@/lib/types'
import { hasJustification } from '@/lib/scoring'
import { AssignmentCard, PromptBlock } from './assignment-card'
import { RatingSelect } from './rating-select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface SubmittedAnswer {
  selection: unknown
  justification?: string
}

export function AssignmentRenderer({
  question,
  onSubmit,
  flashState,
  disabled,
}: {
  question: Question
  onSubmit: (answer: SubmittedAnswer) => void
  flashState?: 'correct' | 'wrong' | null
  disabled?: boolean
}) {
  // ALPHA
  const [alphaRating, setAlphaRating] = useState<AlphaRating | null>(null)
  // BETA
  const [betaA, setBetaA] = useState<AlphaRating | null>(null)
  const [betaB, setBetaB] = useState<AlphaRating | null>(null)
  const [betaPick, setBetaPick] = useState<'A' | 'B' | null>(null)
  // GAMMA
  const [gammaDecision, setGammaDecision] = useState<'CLEAR' | 'FLAGGED' | null>(null)
  const [gammaFlags, setGammaFlags] = useState<FlagReason[]>([])
  // DELTA
  const [deltaPick, setDeltaPick] = useState<number | null>(null)
  // shared justification
  const [justification, setJustification] = useState('')

  const needsJustification = hasJustification(question.type)

  function toggleFlag(f: FlagReason) {
    setGammaFlags((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )
  }

  function canSubmit(): boolean {
    if (disabled) return false
    if (needsJustification && justification.trim().length < 10) {
      // require a real justification only for alpha/beta
      if (question.type === 'alpha' && !alphaRating) return false
      if (question.type === 'beta' && (!betaA || !betaB || !betaPick)) return false
      return false
    }
    switch (question.type) {
      case 'alpha':
        return !!alphaRating
      case 'beta':
        return !!betaA && !!betaB && !!betaPick
      case 'gamma':
        return gammaDecision === 'CLEAR' || (gammaDecision === 'FLAGGED' && gammaFlags.length > 0)
      case 'delta':
        return deltaPick !== null
      default:
        return false
    }
  }

  function handleSubmit() {
    let selection: unknown
    switch (question.type) {
      case 'alpha':
        selection = alphaRating
        break
      case 'beta':
        selection = betaPick
        break
      case 'gamma':
        selection = { decision: gammaDecision, flags: gammaDecision === 'FLAGGED' ? gammaFlags : [] }
        break
      case 'delta':
        selection = deltaPick
        break
    }
    onSubmit({
      selection,
      justification: needsJustification ? justification.trim() : undefined,
    })
  }

  return (
    <AssignmentCard question={question} flashState={flashState}>
      {/* ALPHA */}
      {question.type === 'alpha' && (
        <>
          <PromptBlock label="Prompt Given to Subject">{question.prompt}</PromptBlock>
          <PromptBlock label="Intelligence Report (Response)">
            {question.responseA}
          </PromptBlock>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your Assessment
          </p>
          <RatingSelect value={alphaRating} onChange={setAlphaRating} disabled={disabled} />
        </>
      )}

      {/* BETA */}
      {question.type === 'beta' && (
        <>
          <PromptBlock label="Prompt Given to Subject">{question.prompt}</PromptBlock>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <PromptBlock label="Field Report A">{question.responseA}</PromptBlock>
              <RatingSelect value={betaA} onChange={setBetaA} disabled={disabled} idPrefix="a" />
            </div>
            <div>
              <PromptBlock label="Field Report B">{question.responseB}</PromptBlock>
              <RatingSelect value={betaB} onChange={setBetaB} disabled={disabled} idPrefix="b" />
            </div>
          </div>
          <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Which is the superior intelligence output?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setBetaPick(p)}
                className={cn(
                  'rounded-md border px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all',
                  betaPick === p
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border hover:border-muted-foreground/50',
                )}
              >
                Report {p}
              </button>
            ))}
          </div>
        </>
      )}

      {/* GAMMA */}
      {question.type === 'gamma' && (
        <>
          <PromptBlock label="Intercepted Transcript">
            <span className="whitespace-pre-wrap">{question.transcript}</span>
          </PromptBlock>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Clearance Decision
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setGammaDecision('CLEAR')
                setGammaFlags([])
              }}
              className={cn(
                'rounded-md border px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all',
                gammaDecision === 'CLEAR'
                  ? 'border-success bg-success/15 text-success'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              Clear (Pass)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setGammaDecision('FLAGGED')}
              className={cn(
                'rounded-md border px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all',
                gammaDecision === 'FLAGGED'
                  ? 'border-danger bg-danger/15 text-danger'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              Flagged (Reject)
            </button>
          </div>
          {gammaDecision === 'FLAGGED' && (
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Select all applicable flags
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FLAG_REASONS.map((f) => {
                  const on = gammaFlags.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleFlag(f)}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-all',
                        on
                          ? 'border-danger bg-danger/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                          on ? 'border-danger bg-danger text-danger-foreground' : 'border-border',
                        )}
                      >
                        {on && <Check size={12} />}
                      </span>
                      {f}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* DELTA */}
      {question.type === 'delta' && (
        <>
          <PromptBlock label="Final Message in Transcript">{question.prompt}</PromptBlock>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Select the optimal reply
          </p>
          <div className="space-y-2">
            {question.responses?.map((r, i) => (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => setDeltaPick(i)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm leading-relaxed transition-all',
                  deltaPick === i
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/50',
                )}
              >
                <span className="mt-0.5 font-mono text-xs font-bold text-primary">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="whitespace-pre-wrap">{r}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Justification */}
      {needsJustification && (
        <div className="mt-4">
          <label
            htmlFor="justification"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Justification — 2-3 sentences (graded)
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Explain your reasoning. Cite the specific flaw or strength that drove your call."
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary"
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit()}
        className="mt-5 w-full bg-primary font-mono uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
      >
        Submit Assessment
      </Button>
    </AssignmentCard>
  )
}
