'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RecruitDialog } from '@/components/landing/recruit-dialog'
import { useAgent } from '@/components/providers/agent-provider'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { RANKS } from '@/lib/ranks'
import { PASS_THRESHOLD, TYPE_BLURBS, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { guidelineFor } from '@/lib/guidelines'
import { cn } from '@/lib/utils'
import {
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
  BookOpen,
  PenLine,
  Timer,
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
                onClick={signInWithGoogle}
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

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden sm:h-[40rem]">
        <Image
          src="/landing/desk.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/82 to-background" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/20"
        style={{ left: 'max(1.25rem, calc(50% - 22rem))' }}
      />

      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-12 pt-16 text-center">
        <div className="flex items-center gap-2 border-y border-border px-3 py-1">
          <span className="font-heading italic text-primary">¶</span>
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            Datanerds Annotation
          </span>
        </div>

        <h1 className="mt-6 max-w-[16ch] text-balance font-heading text-[2.15rem] font-medium leading-[1.15] text-foreground sm:max-w-none sm:text-5xl">
          Build your eye for{' '}
          <em className="italic text-primary">better AI.</em>
        </h1>

        <p className="mt-5 w-full min-w-0 max-w-prose px-1 text-center leading-relaxed text-muted-foreground">
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

      <section className="relative mx-auto w-full max-w-4xl px-4 pb-12">
          <p className="mb-4 text-center font-sans text-sm font-medium text-muted-foreground">
          Choose a skill to practice
        </p>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
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

      <section className="relative mx-auto max-w-4xl px-4 pb-16">
        <p className="mb-2 text-center text-sm font-medium text-primary">How it works</p>
        <h2 className="mb-8 text-center font-heading text-3xl font-medium tracking-tight">
          Study. Practice. Then sit the test.
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.n} className="agency-card agency-card-accent p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
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
        'agency-card w-full min-w-0 p-5',
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
