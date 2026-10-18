'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Constellation } from '@/components/graphics/constellation'
import { SKILL_SHAPE, SkillArtCard } from '@/components/graphics/skill-art'
import { RecruitDialog } from '@/components/landing/recruit-dialog'
import { useAgent } from '@/components/providers/agent-provider'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { RANKS } from '@/lib/ranks'
import { PASS_THRESHOLD, TYPE_BLURBS, TYPE_NAMES } from '@/lib/scoring'
import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { guidelineFor } from '@/lib/guidelines'
import { Shield, ArrowRight, BookOpen, PenLine, Timer } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    title: 'Study',
    icon: BookOpen,
    body: 'Learn the rating rules. Full vendor guidelines sit in the app, with the original figures.',
  },
  {
    n: '02',
    title: 'Practice',
    icon: PenLine,
    body: 'Work examples with no clock. After each call you see why it was right, partial, or wrong.',
  },
  {
    n: '03',
    title: 'Test',
    icon: Timer,
    body: `Sit a timed packet of one task type. The pass mark is ${PASS_THRESHOLD}%. Ranks follow the score.`,
  },
]

const PROOF = [
  {
    title: 'Written reasons, graded',
    body: 'A rating is not only a click. When the task asks why, the explanation is scored too.',
  },
  {
    title: 'The real rating grids',
    body: 'Maps, search quality, and transcription use the same scales live annotation jobs grade you on.',
  },
  {
    title: 'Field-by-field scoring',
    body: 'Pins, page quality, and transcripts score each field. Close-but-wrong does not get a free pass.',
  },
  {
    title: 'A hard pass line',
    body: `Timed tests require ${PASS_THRESHOLD}%. XP and ranks come from the work, not from showing up.`,
  },
]

export function LandingHero() {
  const { agent, hydrated } = useAgent()
  const { user, signInWithGoogle, isLoading } = useAuth()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const enrolled = hydrated && !!agent
  const enabled = useMemo(() => getEnabledTypes(), [])
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)
  const signedIn = !!user

  function primaryAction() {
    if (enrolled) router.push('/training')
    else setDialogOpen(true)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-heading text-lg italic leading-none text-foreground">
              Datanerds
            </span>
            <span className="text-[11px] text-muted-foreground">Annotation</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden font-sans text-xs text-muted-foreground hover:text-foreground sm:block"
            >
              Pricing
            </Link>
            {signedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="font-sans text-xs"
                >
                  <Link href="/training">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signInWithGoogle('/training')}
                disabled={isLoading}
                size="sm"
                className="font-sans text-xs"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="ink-band relative overflow-hidden">
        <Image
          src="/landing/desk.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover object-[center_32%] opacity-[0.07] grayscale"
        />
        <div aria-hidden className="ink-grid absolute inset-0" />
        <Constellation density={0.00011} />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 sm:pb-28 sm:pt-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
            Datanerds Annotation
          </p>
          <h1 className="mt-5 max-w-[14ch] text-balance font-heading text-[2.9rem] font-medium leading-[1.02] text-ink-foreground sm:text-7xl">
            Build your eye for <em className="italic text-ink-accent">better AI.</em>
          </h1>
          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-ink-muted sm:text-lg">
            Practice making thoughtful calls on AI responses, search results, maps, and audio.
            Learn at your own pace, get useful feedback, and watch your confidence grow.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={primaryAction}
              size="lg"
              className="rounded-full bg-ink-accent px-7 font-sans font-semibold text-ink shadow-[0_8px_24px_-8px_rgba(224,184,79,0.6)] hover:bg-ink-accent/90"
            >
              {enrolled ? `Continue as ${agent!.alias}` : 'Start practicing'}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/25 bg-transparent px-7 font-sans font-semibold text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            >
              <Link href="/prep">Read the study guide</Link>
            </Button>
          </div>

          <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Task types</dt>
              <dd className="mt-1 font-heading text-3xl text-ink-foreground">{enabled.length}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Pass mark</dt>
              <dd className="mt-1 font-heading text-3xl text-ink-foreground">{PASS_THRESHOLD}%</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Ranks</dt>
              <dd className="mt-1 font-heading text-3xl text-ink-foreground">{RANKS.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-14">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Practice areas</p>
            <h2 className="mt-2 font-heading text-4xl font-medium tracking-tight">
              Choose a <em className="italic text-primary">skill.</em>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{enabled.length} task types</p>
        </div>
        <div className="grid min-w-0 grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {core.map((t) => (
            <SkillArtCard
              key={t}
              type={t}
              tag="Core"
              name={TYPE_NAMES[t]}
              blurb={TYPE_BLURBS[t]}
              href="/training"
              shape={SKILL_SHAPE[t]}
            />
          ))}
        </div>
      </section>

      {special.length > 0 && (
        <section id="specialisations" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-16">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Extra practice</p>
              <h2 className="mt-2 font-heading text-4xl font-medium tracking-tight">
                Maps, search, <em className="italic text-primary">and audio.</em>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Same rating scales used on live projects. Each one has a full guideline you can read first.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <Link href="/guidelines">
                All guidelines
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {special.map((t) => (
              <SkillArtCard
                key={t}
                type={t}
                tag="New"
                name={TYPE_NAMES[t]}
                blurb={TYPE_BLURBS[t]}
                href={guidelineFor(t) ? `/guidelines/${t}` : '/training'}
                shape={SKILL_SHAPE[t]}
              />
            ))}
          </div>
        </section>
      )}

      <section className="relative mx-auto max-w-4xl px-4 pb-16">
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">How it works</p>
        <h2 className="mb-8 text-center font-heading text-4xl font-medium tracking-tight">
          Study. Practice. <em className="italic text-primary">Then sit the test.</em>
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.n} className="rounded-2xl border border-border bg-surface-raised p-6 shadow-[0_10px_30px_-18px_rgba(26,23,20,0.35)]">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-full bg-ink font-heading text-ink-accent">
                    {Number(step.n)}
                  </span>
                  <Icon className="size-4 text-primary" />
                </div>
                <h3 className="mt-3 font-heading text-xl font-medium">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-16">
        <p className="mb-2 text-center text-sm font-medium text-primary">Built to hold up</p>
        <h2 className="mb-3 text-center font-heading text-3xl font-medium tracking-tight">
          Training with a pass line, not a vibe.
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
          This is a certification drill, not a quiz app. Scoring, guidelines, and timed tests
          are built the way the live work is judged.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROOF.map((item) => (
            <div key={item.title} className="agency-card p-5">
              <h3 className="font-heading text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 pb-16">
        <div className="ink-band relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10">
          <Constellation density={0.00014} linkDistance={110} />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-accent">Clearance levels</p>
              <h2 className="mt-3 font-heading text-4xl font-medium leading-tight text-ink-foreground">
                Free to start. <em className="italic text-ink-accent">Upgrade</em> when you outgrow it.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
                Recruit Clearance is free forever. Operative and Director raise your daily practice
                cap and monthly Live Operations, with a 7-day free trial.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-full bg-ink-accent px-7 font-semibold text-ink hover:bg-ink-accent/90">
              <Link href="/pricing">
                See clearance levels
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
