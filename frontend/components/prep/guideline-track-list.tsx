'use client'

import Link from 'next/link'
import { ArrowRight, AudioLines, BookOpen, ClipboardCheck, MapPin, Search } from 'lucide-react'
import { specialisationGuidelinePacks, type GuidelinePack } from '@/lib/guidelines'
import { ALL_ASSIGNMENT_TYPES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SkillScene } from '@/components/graphics/skill-scene'

const ICONS: Record<string, typeof MapPin> = {
  epsilon: MapPin,
  zeta: Search,
  eta: Search,
  theta: AudioLines,
  proficiency: BookOpen,
  dataannotation: ClipboardCheck,
}

export function GuidelineTrackList() {
  const packs = specialisationGuidelinePacks()
  return (
    <div id="guidelines-brief" className="scroll-mt-24 space-y-3">
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-2 text-[12px] font-medium text-primary">
          Extra-track guidelines
        </p>
        <h2 className="font-sans text-xl font-semibold tracking-tight">Pick a guideline</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Each one opens as a full-page document. Figures scale to the screen. Nothing downloads.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((pack) => (
          <TrackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  )
}

function TrackCard({ pack }: { pack: GuidelinePack }) {
  const skill = (ALL_ASSIGNMENT_TYPES as string[]).includes(pack.id) ? (pack.id as AssignmentType) : null
  const Icon = ICONS[pack.id] ?? BookOpen
  return (
    <Link
      href={`/guidelines/${pack.id}`}
      className="group flex overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      {skill ? (
        <SkillTile type={skill} className="w-36 rounded-none p-3 sm:w-44">
          <SkillScene type={skill} className="w-full text-[7px] transition-transform duration-300 group-hover:-rotate-2 sm:text-[8px]" />
        </SkillTile>
      ) : (
        <div className="ink-band flex w-36 shrink-0 items-center justify-center sm:w-44" aria-hidden>
          <div className="relative h-24 w-[4.5rem] rotate-[-4deg] rounded-md bg-[#fffdf8] p-2 shadow-lg transition-transform duration-300 group-hover:rotate-0">
            <Icon className="size-4 text-primary" />
            <span className="mt-2 block h-1 w-full rounded bg-[#d9d0bf]" />
            <span className="mt-1 block h-1 w-4/5 rounded bg-[#d9d0bf]" />
            <span className="mt-1 block h-1 w-full rounded bg-[#d9d0bf]" />
            <span className="mt-1 block h-1 w-3/5 rounded bg-[#d9d0bf]" />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: skill ? SKILL_ACCENT[skill] : 'var(--primary)' }}>
          {pack.eyebrow}
        </p>
        <h3 className="mt-1 font-heading text-xl font-medium leading-tight">{pack.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{pack.source}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm text-primary">
          Open guide <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
