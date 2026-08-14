'use client'

import { useMemo, useState } from 'react'
import type { Question } from '@/lib/types'
import type {
  AddressAccuracy,
  AddressIssue,
  EpsilonAnswer,
  EpsilonPayload,
  EpsilonResultAnswer,
  NameAccuracy,
  PinAccuracy,
  RelevanceRating,
  RelevanceSubreason,
} from '@/lib/domain-types'
import {
  ADDRESS_ACCURACY_SCALE,
  ADDRESS_ISSUES,
  NAME_ACCURACY_SCALE,
  PIN_ACCURACY_SCALE,
  RELEVANCE_SCALE,
  RELEVANCE_SUBREASONS,
} from '@/lib/domain-types'
import { AssignmentCard, PromptBlock } from './assignment-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SubmittedAnswer } from './types'

function emptyResult(): EpsilonResultAnswer {
  return {
    relevance: null,
    relevance_subreason: null,
    name_accuracy: null,
    address_accuracy: null,
    address_issue: null,
    pin_accuracy: null,
    business_closed: false,
  }
}

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: T | null
  options: readonly T[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={cn(
              'rounded-md border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-all',
              value === opt
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground/50',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EpsilonAssignment({
  question,
  onSubmit,
  flashState,
  disabled,
}: {
  question: Question
  onSubmit: (answer: SubmittedAnswer) => void
  flashState?: 'correct' | 'wrong' | 'partial' | null
  disabled?: boolean
}) {
  const payload = question.payload as EpsilonPayload
  const [nav, setNav] = useState<boolean | null>(null)
  const [results, setResults] = useState<Record<string, EpsilonResultAnswer>>(() => {
    const init: Record<string, EpsilonResultAnswer> = {}
    for (const r of payload.results) init[r.id] = emptyResult()
    return init
  })

  function patch(id: string, partial: Partial<EpsilonResultAnswer>) {
    setResults((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }))
  }

  const canSubmit = useMemo(() => {
    if (disabled || nav === null) return false
    return payload.results.every((r) => {
      const a = results[r.id]
      if (!a?.relevance || !a.name_accuracy || !a.address_accuracy || !a.pin_accuracy) return false
      if (a.address_accuracy === 'Incorrect' && !a.address_issue) return false
      return true
    })
  }, [disabled, nav, payload.results, results])

  function handleSubmit() {
    const selection: EpsilonAnswer = {
      has_navigational_result: nav,
      results,
    }
    onSubmit({ selection })
  }

  return (
    <AssignmentCard question={question} flashState={flashState}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary">
          {payload.query}
        </span>
        <span className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          User loc · {payload.user_location}
        </span>
      </div>

      <div className="mb-5">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Is there any navigational result?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: true, label: 'Yes' },
            { v: false, label: 'No' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              disabled={disabled}
              onClick={() => setNav(opt.v)}
              className={cn(
                'rounded-md border px-3 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all',
                nav === opt.v
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border hover:border-muted-foreground/50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {payload.results.map((r) => {
          const a = results[r.id]
          return (
            <div key={r.id} className="rounded-lg border border-border bg-background/40 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                    Result {r.id.toUpperCase()}
                  </p>
                  <h3 className="font-sans text-base font-semibold">{r.name_shown}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{r.address_shown}</p>
                </div>
                <div className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.category && <div>{r.category}</div>}
                  {r.distance && <div>{r.distance}</div>}
                </div>
              </div>

              {r.pin_shown && (
                <PromptBlock label="Pin shown">
                  {r.pin_shown.label ?? 'Map pin'} · {r.pin_shown.lat.toFixed(4)}, {r.pin_shown.lng.toFixed(4)}
                </PromptBlock>
              )}

              <OptionRow<RelevanceRating>
                label="Relevance"
                value={a.relevance}
                options={RELEVANCE_SCALE}
                disabled={disabled}
                onChange={(v) => patch(r.id, { relevance: v })}
              />
              <OptionRow<RelevanceSubreason>
                label="Relevance sub-reason (optional)"
                value={a.relevance_subreason}
                options={RELEVANCE_SUBREASONS}
                disabled={disabled}
                onChange={(v) =>
                  patch(r.id, {
                    relevance_subreason: a.relevance_subreason === v ? null : v,
                  })
                }
              />
              <OptionRow<NameAccuracy>
                label="Name accuracy"
                value={a.name_accuracy}
                options={NAME_ACCURACY_SCALE}
                disabled={disabled}
                onChange={(v) => patch(r.id, { name_accuracy: v })}
              />
              <OptionRow<AddressAccuracy>
                label="Address accuracy"
                value={a.address_accuracy}
                options={ADDRESS_ACCURACY_SCALE}
                disabled={disabled}
                onChange={(v) =>
                  patch(r.id, {
                    address_accuracy: v,
                    address_issue: v === 'Incorrect' ? a.address_issue : null,
                  })
                }
              />
              {a.address_accuracy === 'Incorrect' && (
                <OptionRow<AddressIssue>
                  label="Address issue"
                  value={a.address_issue}
                  options={ADDRESS_ISSUES}
                  disabled={disabled}
                  onChange={(v) => patch(r.id, { address_issue: v })}
                />
              )}
              <OptionRow<PinAccuracy>
                label="Pin accuracy"
                value={a.pin_accuracy}
                options={PIN_ACCURACY_SCALE}
                disabled={disabled}
                onChange={(v) => patch(r.id, { pin_accuracy: v })}
              />

              <button
                type="button"
                disabled={disabled}
                onClick={() => patch(r.id, { business_closed: !a.business_closed })}
                className={cn(
                  'mt-1 flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all',
                  a.business_closed
                    ? 'border-danger bg-danger/10 text-danger'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/50',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-sm border',
                    a.business_closed ? 'border-danger bg-danger text-background' : 'border-border',
                  )}
                >
                  {a.business_closed ? '✓' : ''}
                </span>
                Business Closed
              </button>
            </div>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full bg-primary font-mono uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
      >
        Submit Assessment
      </Button>
    </AssignmentCard>
  )
}
