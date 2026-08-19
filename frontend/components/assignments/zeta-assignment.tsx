'use client'

import { useMemo, useState } from 'react'
import type { Question } from '@/lib/types'
import type {
  EtaLiteFlags,
  EtaRating,
  NmRating,
  PqRating,
  ZetaAnswer,
  ZetaFullFlags,
  ZetaPayload,
} from '@/lib/domain-types'
import { ETA_LABELS, ETA_SCALE, NM_LABELS, NM_SCALE, PQ_SCALE } from '@/lib/domain-types'
import { AssignmentCard, PromptBlock } from './assignment-card'
import { SnapshotViewer } from './snapshot-viewer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SubmittedAnswer } from './types'

function Slider<T extends string>({
  label,
  scale,
  labels,
  value,
  onChange,
  disabled,
}: {
  label: string
  scale: readonly T[]
  labels?: Record<T, string>
  value: T | null
  onChange: (v: T) => void
  disabled?: boolean
}) {
  const idx = value ? scale.indexOf(value) : -1
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="font-mono text-xs font-bold text-primary">
          {value ? (labels?.[value] ?? value) : 'Select a rating'}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={scale.length - 1}
        step={1}
        disabled={disabled}
        value={idx < 0 ? 0 : idx}
        onChange={(e) => onChange(scale[Number(e.target.value)])}
        className="w-full accent-primary"
      />
      <div className="mt-1 flex justify-between gap-1 overflow-hidden">
        {scale.map((tick) => (
          <button
            key={tick}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tick)}
            className={cn(
              'min-w-0 flex-1 truncate text-center font-mono text-[9px] uppercase tracking-wide',
              value === tick ? 'text-primary' : 'text-muted-foreground/70',
            )}
          >
            {tick}
          </button>
        ))}
      </div>
    </div>
  )
}

function FlagBox({
  label,
  on,
  disabled,
  onToggle,
}: {
  label: string
  on: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-all',
        on ? 'border-danger bg-danger/10 text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/50',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px]',
          on ? 'border-danger bg-danger text-background' : 'border-border',
        )}
      >
        {on ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

export function ZetaAssignment({
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
  const payload = question.payload as ZetaPayload
  const lite = payload.rubric === 'lite' || question.type === 'eta'
  const askPq = !lite && (payload.ask_pq ?? !!payload.correct_pq)
  const askNm = !lite && (payload.ask_nm ?? !!payload.correct_nm)

  const [pq, setPq] = useState<PqRating | null>(null)
  const [nm, setNm] = useState<NmRating | null>(null)
  const [satisfaction, setSatisfaction] = useState<EtaRating | null>(null)
  const [fullFlags, setFullFlags] = useState<ZetaFullFlags>({
    porn: false,
    foreign_language: false,
    did_not_load: false,
  })
  const [liteFlags, setLiteFlags] = useState<EtaLiteFlags>({
    wrong_language: false,
    content_unavailable: false,
    inappropriate: false,
  })

  const canSubmit = useMemo(() => {
    if (disabled) return false
    if (lite) return !!satisfaction
    if (askPq && !pq) return false
    if (askNm && !nm) return false
    return askPq || askNm
  }, [askNm, askPq, disabled, lite, nm, pq, satisfaction])

  function handleSubmit() {
    const selection: ZetaAnswer = lite
      ? { satisfaction, flags: liteFlags }
      : { pq: askPq ? pq : undefined, nm: askNm ? nm : undefined, flags: fullFlags }
    onSubmit({ selection })
  }

  return (
    <AssignmentCard question={question} flashState={flashState}>
      {payload.query && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            {payload.query}
          </span>
          {payload.ymyl_topic && (
            <span className="rounded-md border border-danger/40 bg-danger/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-danger">
              YMYL
            </span>
          )}
        </div>
      )}
      {payload.user_intent && <PromptBlock label="User intent">{payload.user_intent}</PromptBlock>}

      <SnapshotViewer url={payload.landing_page_snapshot_url} />

      {lite ? (
        <Slider
          label="Search satisfaction"
          scale={ETA_SCALE}
          labels={ETA_LABELS}
          value={satisfaction}
          onChange={setSatisfaction}
          disabled={disabled}
        />
      ) : (
        <>
          {askPq && (
            <Slider
              label="Page Quality"
              scale={PQ_SCALE}
              value={pq}
              onChange={setPq}
              disabled={disabled}
            />
          )}
          {askNm && (
            <Slider
              label="Needs Met"
              scale={NM_SCALE}
              labels={NM_LABELS}
              value={nm}
              onChange={setNm}
              disabled={disabled}
            />
          )}
        </>
      )}

      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Validation flags
      </p>
      {lite ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <FlagBox
            label="Wrong Language"
            on={liteFlags.wrong_language}
            disabled={disabled}
            onToggle={() => setLiteFlags((f) => ({ ...f, wrong_language: !f.wrong_language }))}
          />
          <FlagBox
            label="Content Unavailable"
            on={liteFlags.content_unavailable}
            disabled={disabled}
            onToggle={() => setLiteFlags((f) => ({ ...f, content_unavailable: !f.content_unavailable }))}
          />
          <FlagBox
            label="Inappropriate Content"
            on={liteFlags.inappropriate}
            disabled={disabled}
            onToggle={() => setLiteFlags((f) => ({ ...f, inappropriate: !f.inappropriate }))}
          />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          <FlagBox
            label="Porn"
            on={fullFlags.porn}
            disabled={disabled}
            onToggle={() => setFullFlags((f) => ({ ...f, porn: !f.porn }))}
          />
          <FlagBox
            label="Foreign Language"
            on={fullFlags.foreign_language}
            disabled={disabled}
            onToggle={() => setFullFlags((f) => ({ ...f, foreign_language: !f.foreign_language }))}
          />
          <FlagBox
            label="Did Not Load"
            on={fullFlags.did_not_load}
            disabled={disabled}
            onToggle={() => setFullFlags((f) => ({ ...f, did_not_load: !f.did_not_load }))}
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Submit
      </Button>
    </AssignmentCard>
  )
}
