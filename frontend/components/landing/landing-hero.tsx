'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NeuralNoise } from '@/components/neural-noise'
import { RecruitDialog } from '@/components/landing/recruit-dialog'
import { useAgent } from '@/components/providers/agent-provider'
import { Button } from '@/components/ui/button'
import { RANKS } from '@/lib/ranks'
import { TYPE_LABELS, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { trackForType } from '@/lib/tracks'
import { guidelineFor } from '@/lib/guidelines'
import { cn } from '@/lib/utils'
import {
  Radar,
  Target,
  GitCompareArrows,
  ShieldCheck,
  ListChecks,
  Shield,
  MapPin,
  Search,
  AudioLines,
  ArrowDown,
  ArrowRight,
} from 'lucide-react'

const TYPE_ICONS: Record<AssignmentType, React.ElementType> = {
  alpha: Target,
  beta: GitCompareArrows,
  gamma: ShieldCheck,
  delta: ListChecks,
  epsilon: MapPin,
  zeta: Search,
  eta: Search,
  theta: AudioLines,
}

const TYPE_DESC: Record<AssignmentType, string> = {
  alpha: 'Rate a single AI response: CLEAR, AMBIGUOUS, or COMPROMISED — and justify it.',
  beta: 'Two field reports on one target. Rate each, then pick the more reliable.',
  gamma: 'Screen an intercepted transcript and flag every anomaly you find.',
  delta: 'Choose the optimal reply for an undercover operative from four candidates.',
  epsilon: 'Rate map POIs: relevance, name, address, pin, and a closed-business flag.',
  zeta: 'Page Quality (10-point) and Needs Met (5-point) on a frozen page snapshot.',
  eta: 'A four-point search-satisfaction scale — the lite on-ramp to Zeta.',
  theta: 'Segment speech, label speakers, transcribe verbatim, and tag spans.',
}

export function LandingHero() {
  const { agent, hydrated } = useAgent()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const enrolled = hydrated && !!agent
  const enabled = useMemo(() => getEnabledTypes(), [])
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)

  function primaryAction() {
    if (enrolled) router.push('/training')
    else setDialogOpen(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeuralNoise className="opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"
      />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-16 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1">
          <Radar size={14} className="text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Datanerds Annotation · codename DNA
          </span>
        </div>

        <h1 className="mt-6 text-balance font-mono text-4xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
          This is not a quiz.
          <br />
          <span className="text-primary text-glow-primary">
            It is your recruitment.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          You are a Data Agent. Your mission: evaluate AI-generated intelligence
          for accuracy, instruction compliance, and quality. Every task is a
          field operation. Every correct call earns XP. Every threshold crossed
          unlocks a new clearance rank.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={primaryAction}
            size="lg"
            className="bg-primary font-mono uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            {enrolled ? `Resume as ${agent!.alias}` : 'Enlist as a Data Agent'}
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-transparent font-mono uppercase tracking-wider hover:bg-secondary"
          >
            <Link href="/prep#guidelines-brief">Read the Briefing</Link>
          </Button>
        </div>

        {special.length > 0 && (
          <a
            href="#specialisations"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/15"
          >
            New briefing · {special.length} specialisation tracks
            <ArrowDown size={14} />
          </a>
        )}
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-12">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Core disciplines
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {core.map((t) => (
            <TypeCard key={t} type={t} />
          ))}
        </div>
      </section>

      {special.length > 0 && (
        <section id="specialisations" className="relative mx-auto max-w-4xl scroll-mt-24 px-4 pb-16">
          <div className="relative overflow-hidden rounded-xl border border-primary/35 bg-primary/5 p-5 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">
                  Now briefing · expansion
                </p>
                <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight">
                  Specialisation tracks
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Vendor-faithful drills — maps, search quality, and transcription.
                  Each track has an expandable source guideline on the briefing.
                  These sit beside the core ladder, not inside the eight identical cards.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 font-mono text-xs uppercase tracking-wider">
                <Link href="/training">
                  Open Field Training
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {special.map((t) => (
                <TypeCard key={t} type={t} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative mx-auto max-w-4xl px-4 pb-24">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          The Clearance Ladder
        </p>
        <div className="agency-card overflow-hidden">
          <ul className="divide-y divide-border">
            {RANKS.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Shield size={16} style={{ color: r.color }} />
                  <span
                    className="font-mono text-sm font-bold uppercase tracking-wide"
                    style={{ color: r.color }}
                  >
                    {r.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {r.xpRequired.toLocaleString()} XP
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RecruitDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

function TypeCard({ type, featured = false }: { type: AssignmentType; featured?: boolean }) {
  const Icon = TYPE_ICONS[type]
  const track = trackForType(type)
  const pack = featured ? guidelineFor(type) : undefined

  return (
    <div
      className={cn(
        'agency-card p-5',
        featured ? 'border-primary/30 bg-background/40' : 'agency-card-accent',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
            <Icon size={20} />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Type {TYPE_LABELS[type]}
            </p>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide">
              {TYPE_NAMES[type]}
            </h3>
          </div>
        </div>
        {featured && (
          <span className="shrink-0 rounded-full border border-primary/50 bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            New
          </span>
        )}
      </div>
      {track && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-foreground/70">
          {track.label}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {TYPE_DESC[type]}
      </p>
      {pack && (
        <Link
          href={`/guidelines/${type}`}
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary hover:underline"
        >
          Study source guideline
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}
