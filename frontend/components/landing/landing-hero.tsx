'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NeuralNoise } from '@/components/neural-noise'
import { RecruitDialog } from '@/components/landing/recruit-dialog'
import { useAgent } from '@/components/providers/agent-provider'
import { Button } from '@/components/ui/button'
import { RANKS } from '@/lib/ranks'
import { TYPE_LABELS, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
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
} from 'lucide-react'
import { getEnabledTypes } from '@/lib/feature-flags'

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

  function primaryAction() {
    if (enrolled) router.push('/training')
    else setDialogOpen(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <NeuralNoise className="opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background"
      />

      {/* Hero */}
      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-24 text-center">
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
            <Link href="/prep">Read the Briefing</Link>
          </Button>
        </div>
      </section>

      {/* Assignment types */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {getEnabledTypes().length} Assignment Classes
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {getEnabledTypes().map((t) => {
            const Icon = TYPE_ICONS[t]
            return (
              <div key={t} className="agency-card agency-card-accent p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">
                      Type {TYPE_LABELS[t]}
                    </p>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wide">
                      {TYPE_NAMES[t]}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {TYPE_DESC[t]}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Rank ladder */}
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
    </main>
  )
}
