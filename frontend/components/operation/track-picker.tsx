'use client'

import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { TYPE_BLURBS, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAgent } from '@/components/providers/agent-provider'
import { PageHero } from '@/components/page-hero'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SKILL_MECHANIC, SkillScene } from '@/components/graphics/skill-scene'

const TEST_LENGTH = 12

export function TrackPicker({
  onPick,
  locked,
  counts,
}: {
  onPick: (type: AssignmentType) => void
  locked?: Set<AssignmentType>
  counts: Partial<Record<AssignmentType, number>>
}) {
  const { agent } = useAgent()
  const practiced = new Set(agent?.completedTraining ?? [])
  const enabled = getEnabledTypes()
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)

  return (
    <>
    <PageHero eyebrow="Timed test · one task type" title="Sit the" accent="test.">
      Pick one type. You’ll only see that kind of task until time is up.
    </PageHero>
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-3 font-sans text-sm font-medium text-muted-foreground">
        Core tasks
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {core.map((type) => (
          <TrackButton
            key={type}
            type={type}
            locked={locked?.has(type)}
            count={Math.min(TEST_LENGTH, counts[type] ?? 0)}
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
                count={Math.min(TEST_LENGTH, counts[type] ?? 0)}
                needsPractice={!practiced.has(type)}
                onPick={onPick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}

function TrackButton({
  type,
  onPick,
  featured,
  locked,
  needsPractice,
  count,
}: {
  type: AssignmentType
  onPick: (type: AssignmentType) => void
  featured?: boolean
  locked?: boolean
  needsPractice?: boolean
  count: number
}) {
  // A locked card stays clickable: picking it sends you to the English exam.
  const blocked = needsPractice || count === 0
  const minutes = Math.max(10, Math.round(count * 2.5))
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => onPick(type)}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
        featured ? 'border-primary/30 bg-background/50' : 'border-border bg-card',
      )}
    >
      <SkillTile type={type} className="w-full rounded-none px-6 pb-3 pt-5">
        <SkillScene type={type} className="w-full max-w-[17rem] text-[9px] transition-transform duration-300 group-hover:-translate-y-1" />
      </SkillTile>
      <div className="flex flex-1 flex-col p-5 pt-4">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SKILL_ACCENT[type] }}>
        <span>{SKILL_MECHANIC[type].verb} · {SKILL_MECHANIC[type].detail}</span>
        {count > 0 && <span className="font-mono normal-case tracking-normal text-muted-foreground">~{minutes} min</span>}
      </div>
      <h3 className="mt-1 font-heading text-xl font-medium">{TYPE_NAMES[type]}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{TYPE_BLURBS[type]}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {locked
          ? 'English exam first · select to take it'
          : needsPractice
            ? 'Finish practice for this type first'
            : `${count} question${count === 1 ? '' : 's'} · this type only`}
      </p>
      </div>
    </button>
  )
}
