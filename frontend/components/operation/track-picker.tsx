'use client'

import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { TYPE_LABELS, TYPE_NAMES } from '@/lib/scoring'
import { trackForType } from '@/lib/tracks'
import { getQuestionsByType } from '@/lib/questions'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  AudioLines,
  Crosshair,
  GitCompare,
  ListChecks,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react'

const ICONS: Record<AssignmentType, typeof Crosshair> = {
  alpha: Crosshair,
  beta: GitCompare,
  gamma: ShieldCheck,
  delta: ListChecks,
  epsilon: MapPin,
  zeta: Search,
  eta: Search,
  theta: AudioLines,
}

export function TrackPicker({
  onPick,
  locked,
}: {
  onPick: (type: AssignmentType) => void
  locked?: Set<AssignmentType>
}) {
  const enabled = getEnabledTypes()
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
        Sector 03 · Select your packet
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight">Live Operation</h1>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
        Choose one track. The timed test is only that assignment type — map evaluation stays map
        evaluation, transcription stays transcription.
      </p>

      <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        Core disciplines
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {core.map((type) => (
          <TrackButton key={type} type={type} locked={locked?.has(type)} onPick={onPick} />
        ))}
      </div>

      {special.length > 0 && (
        <div className="mt-10 rounded-xl border border-primary/35 bg-primary/5 p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
                Specialisation tracks
              </p>
              <h2 className="mt-1 font-sans text-xl font-semibold">Vendor-faithful packets</h2>
            </div>
            <span className="rounded-full border border-primary/50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              New
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {special.map((type) => (
              <TrackButton key={type} type={type} featured locked={locked?.has(type)} onPick={onPick} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TrackButton({
  type,
  onPick,
  featured,
  locked,
}: {
  type: AssignmentType
  onPick: (type: AssignmentType) => void
  featured?: boolean
  locked?: boolean
}) {
  const Icon = ICONS[type]
  const track = trackForType(type)
  const count = getQuestionsByType(type).length
  return (
    <button
      type="button"
      disabled={locked || count === 0}
      onClick={() => onPick(type)}
      className={cn(
        'rounded-xl border p-5 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
        featured ? 'border-primary/30 bg-background/50' : 'border-border bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {TYPE_LABELS[type]}
        </span>
      </div>
      <h3 className="mt-3 font-sans text-lg font-semibold">{TYPE_NAMES[type]}</h3>
      {track && (
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
          {track.label}
        </p>
      )}
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {locked ? 'Proficiency gate required' : `${count} assignment${count === 1 ? '' : 's'} · this track only`}
      </p>
    </button>
  )
}
