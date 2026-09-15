'use client'

import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { TYPE_BLURBS, TYPE_NAMES } from '@/lib/scoring'
import { getQuestionsByType } from '@/lib/questions'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAgent } from '@/components/providers/agent-provider'
import {
  AudioLines,
  ClipboardCheck,
  Crosshair,
  GitCompare,
  Images,
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
  iota: Images,
  kappa: ClipboardCheck,
}

export function TrackPicker({
  onPick,
  locked,
}: {
  onPick: (type: AssignmentType) => void
  locked?: Set<AssignmentType>
}) {
  const { agent } = useAgent()
  const practiced = new Set(agent?.completedTraining ?? [])
  const enabled = getEnabledTypes()
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-sans text-sm font-medium text-primary">
        Timed test · one task type
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight">Timed test</h1>
      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
        Pick one type. You’ll only see that kind of task until time is up.
      </p>

      <p className="mb-3 mt-8 font-sans text-sm font-medium text-muted-foreground">
        Core tasks
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {core.map((type) => (
          <TrackButton
            key={type}
            type={type}
            locked={locked?.has(type)}
            needsPractice={!practiced.has(type)}
            onPick={onPick}
          />
        ))}
      </div>

      {special.length > 0 && (
        <div className="mt-10 rounded-xl border border-primary/35 bg-primary/5 p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-primary">
                Maps, search, and audio
              </p>
              <h2 className="mt-1 font-sans text-xl font-semibold">Specialist tests</h2>
            </div>
            <span className="rounded-full border border-primary/50 px-2 py-0.5 font-sans text-[10px] font-bold text-primary">
              New
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {special.map((type) => (
              <TrackButton
                key={type}
                type={type}
                featured
                locked={locked?.has(type)}
                needsPractice={!practiced.has(type)}
                onPick={onPick}
              />
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
  needsPractice,
}: {
  type: AssignmentType
  onPick: (type: AssignmentType) => void
  featured?: boolean
  locked?: boolean
  needsPractice?: boolean
}) {
  const Icon = ICONS[type]
  const count = getQuestionsByType(type).length
  const blocked = locked || needsPractice || count === 0
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => onPick(type)}
      className={cn(
        'rounded-xl border p-5 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
        featured ? 'border-primary/30 bg-background/50' : 'border-border bg-card',
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-3 font-sans text-lg font-semibold">{TYPE_NAMES[type]}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{TYPE_BLURBS[type]}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {locked
          ? 'English exam required first'
          : needsPractice
            ? 'Finish practice for this type first'
            : `${count} question${count === 1 ? '' : 's'} · this type only`}
      </p>
    </button>
  )
}
