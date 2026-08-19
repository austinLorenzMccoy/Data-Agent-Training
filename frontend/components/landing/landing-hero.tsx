'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NeuralNoise } from '@/components/neural-noise'
import { RecruitDialog } from '@/components/landing/recruit-dialog'
import { useAgent } from '@/components/providers/agent-provider'
import { Button } from '@/components/ui/button'
import { RANKS } from '@/lib/ranks'
import { TYPE_BLURBS, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
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

const TYPE_DESC = TYPE_BLURBS

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
      <NeuralNoise className="opacity-25" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"
      />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-16 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1">
          <Radar size={14} className="text-primary" />
          <span className="font-sans text-xs font-medium text-muted-foreground">
            Datanerds Annotation
          </span>
        </div>

        <h1 className="mt-6 text-balance font-sans text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Build your eye for
          <br />
          <span className="text-primary text-glow-primary">
            better AI.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Practice making thoughtful calls on AI responses, search results, maps, and audio.
          Learn at your own pace, get useful feedback, and watch your confidence grow.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            onClick={primaryAction}
            size="lg"
            className="bg-primary font-sans font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {enrolled ? `Continue as ${agent!.alias}` : 'Start practicing'}
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border bg-transparent font-sans font-semibold hover:bg-secondary"
          >
            <Link href="/prep#guidelines-brief">Read the study guide</Link>
          </Button>
        </div>

        {special.length > 0 && (
          <a
            href="#specialisations"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[13px] text-primary transition-colors hover:bg-primary/15"
          >
            New · maps, search, and audio
            <ArrowDown size={14} />
          </a>
        )}
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-12">
          <p className="mb-4 text-center font-sans text-sm font-medium text-muted-foreground">
          Choose a skill to practice
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
                <p className="text-[12px] font-medium text-primary">
                  Extra practice
                </p>
                <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight">
                  Maps, search, and audio
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Maps, search quality, and transcription. Same rating scales used
                  on live projects. Each one has a full guideline you can read first.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/training">
                  Open practice
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
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
          How you rank up
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
                    className="text-sm font-semibold"
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
            <h3 className="font-sans text-sm font-semibold">
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
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {TYPE_DESC[type]}
      </p>
      {pack && (
        <Link
          href={`/guidelines/${type}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          Read the guideline
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}
