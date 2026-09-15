'use client'

import { useState } from 'react'
import type { AlphaRating, FlagReason, Question } from '@/lib/types'
import { FLAG_REASONS } from '@/lib/types'
import { hasJustification } from '@/lib/scoring'
import { AssignmentCard, PromptBlock } from './assignment-card'
import { RatingSelect } from './rating-select'
import { EpsilonAssignment } from './epsilon-assignment'
import { ZetaAssignment } from './zeta-assignment'
import { ThetaAssignment } from './theta-assignment'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { SubmittedAnswer } from './types'

export type { SubmittedAnswer }

type RendererProps = {
  question: Question
  onSubmit: (answer: SubmittedAnswer) => void
  flashState?: 'correct' | 'wrong' | 'partial' | null
  disabled?: boolean
}

export function AssignmentRenderer(props: RendererProps) {
  if (props.question.type === 'epsilon') return <EpsilonAssignment {...props} />
  if (props.question.type === 'zeta' || props.question.type === 'eta') {
    return <ZetaAssignment {...props} />
  }
  if (props.question.type === 'theta') return <ThetaAssignment {...props} />
  return <CoreAssignment {...props} />
}

function CoreAssignment({
  question,
  onSubmit,
  flashState,
  disabled,
}: RendererProps) {
  // ALPHA
  const [alphaRating, setAlphaRating] = useState<AlphaRating | null>(null)
  // BETA
  const [betaA, setBetaA] = useState<AlphaRating | null>(null)
  const [betaB, setBetaB] = useState<AlphaRating | null>(null)
  const [betaPick, setBetaPick] = useState<'A' | 'B' | null>(null)
  // GAMMA
  const [gammaDecision, setGammaDecision] = useState<'CLEAR' | 'FLAGGED' | null>(null)
  const [gammaFlags, setGammaFlags] = useState<FlagReason[]>([])
  // DELTA / KAPPA
  const [deltaPick, setDeltaPick] = useState<number | null>(null)
  // IOTA
  const [iotaPick, setIotaPick] = useState<'A' | 'B' | null>(null)
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
      if (question.type === 'iota' && !iotaPick) return false
      return false
    }
    switch (question.type) {
      case 'alpha':
        return !!alphaRating
      case 'beta':
        return !!betaA && !!betaB && !!betaPick
      case 'iota':
        return !!iotaPick
      case 'gamma':
        return gammaDecision === 'CLEAR' || (gammaDecision === 'FLAGGED' && gammaFlags.length > 0)
      case 'delta':
      case 'kappa':
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
      case 'iota':
        selection = iotaPick
        break
      case 'gamma':
        selection = { decision: gammaDecision, flags: gammaDecision === 'FLAGGED' ? gammaFlags : [] }
        break
      case 'delta':
      case 'kappa':
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
          <PromptBlock label="User prompt">{question.prompt}</PromptBlock>
          <PromptBlock label="AI response">
            {question.responseA}
          </PromptBlock>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Your rating
          </p>
          <RatingSelect value={alphaRating} onChange={setAlphaRating} disabled={disabled} />
        </>
      )}

      {/* BETA */}
      {question.type === 'beta' && (
        <>
          <PromptBlock label="User prompt">{question.prompt}</PromptBlock>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <PromptBlock label="Response A">{question.responseA}</PromptBlock>
              <RatingSelect value={betaA} onChange={setBetaA} disabled={disabled} idPrefix="a" />
            </div>
            <div>
              <PromptBlock label="Response B">{question.responseB}</PromptBlock>
              <RatingSelect value={betaB} onChange={setBetaB} disabled={disabled} idPrefix="b" />
            </div>
          </div>
          <p className="mb-2 mt-4 text-[11px] font-medium text-muted-foreground">
            Which response is better?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setBetaPick(p)}
                className={cn(
                  'rounded-md border px-3 py-2.5 text-sm font-semibold transition-all',
                  betaPick === p
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border hover:border-muted-foreground/50',
                )}
              >
                Response {p}
              </button>
            ))}
          </div>
        </>
      )}

      {/* IOTA */}
      {question.type === 'iota' && (
        <>
          <PromptBlock label="Scenario">{question.prompt}</PromptBlock>
          <div className="grid gap-4 md:grid-cols-2">
            <PromptBlock label="Response A">{question.responseA}</PromptBlock>
            <PromptBlock label="Response B">{question.responseB}</PromptBlock>
          </div>
          <p className="mb-2 mt-4 text-[11px] font-medium text-muted-foreground">
            Which one wins on the stated axis?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B'] as const).map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setIotaPick(p)}
                className={cn(
                  'rounded-md border px-3 py-2.5 text-sm font-semibold transition-all',
                  iotaPick === p
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border hover:border-muted-foreground/50',
                )}
              >
                Response {p}
              </button>
            ))}
          </div>
        </>
      )}

      {/* GAMMA */}
      {question.type === 'gamma' && (
        <>
          <PromptBlock label="Transcript">
            <span className="whitespace-pre-wrap">{question.transcript}</span>
          </PromptBlock>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Your decision
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
                'rounded-md border px-3 py-2.5 text-sm font-semibold transition-all',
                gammaDecision === 'CLEAR'
                  ? 'border-success bg-success/15 text-success'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              Looks good
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setGammaDecision('FLAGGED')}
              className={cn(
                'rounded-md border px-3 py-2.5 text-sm font-semibold transition-all',
                gammaDecision === 'FLAGGED'
                  ? 'border-danger bg-danger/15 text-danger'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              Flag problems
            </button>
          </div>
          {gammaDecision === 'FLAGGED' && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                What is wrong? Select all that apply
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

      {/* DELTA / KAPPA */}
      {(question.type === 'delta' || question.type === 'kappa') && (
        <>
          <PromptBlock label={question.type === 'kappa' ? 'Scenario' : 'Last message'}>
            {question.prompt}
          </PromptBlock>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            {question.type === 'kappa' ? 'Pick the correct call' : 'Pick the best reply'}
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
            className="mb-1.5 block text-[11px] font-medium text-muted-foreground"
          >
            Why? Two or three sentences
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Point to the specific strength or flaw."
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary"
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit()}
        className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Submit
      </Button>
    </AssignmentCard>
  )
}
