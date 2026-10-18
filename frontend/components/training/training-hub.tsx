'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useAgent } from '@/components/providers/agent-provider'
import type { AssignmentType } from '@/lib/types'
import type { Feedback, PublicQuestion } from '@/lib/exam/public'
import { TYPE_BLURBS, TYPE_NAMES, XP } from '@/lib/scoring'
import { UpgradeDialog } from '@/components/billing/upgrade-dialog'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { FeedbackPanel } from '@/components/assignments/feedback-panel'
import { PageHero } from '@/components/page-hero'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SKILL_MECHANIC, SkillScene } from '@/components/graphics/skill-scene'
import { WeakAreasCard } from './weak-areas-card'
import { recordPractice } from '@/lib/weak-areas'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react'
import { CORE_TYPES, FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM, getEnabledTypes, getProficiencyGatedTypes, isV4Type } from '@/lib/feature-flags'
import { guidelineFor } from '@/lib/guidelines'
import { hasPassedProficiency } from '@/lib/proficiency'
import { useRouter } from 'next/navigation'

export function TrainingHub() {
  const { agent, completeTraining } = useAgent()
  const router = useRouter()
  const [active, setActive] = useState<AssignmentType | null>(null)
  const enabled = useMemo(() => getEnabledTypes(), [])
  const core = enabled.filter((t) => CORE_TYPES.includes(t))
  const special = enabled.filter(isV4Type)
  const gated = useMemo(() => new Set(getProficiencyGatedTypes()), [])

  function startType(type: AssignmentType) {
    if (
      FEATURE_PROFICIENCY_GATE &&
      REQUIRED_PROFICIENCY_EXAM &&
      gated.has(type) &&
      !hasPassedProficiency(REQUIRED_PROFICIENCY_EXAM)
    ) {
      router.push(`/proficiency/${REQUIRED_PROFICIENCY_EXAM}?next=/training`)
      return
    }
    setActive(type)
  }

  if (active) {
    return (
      <TrainingSession
        type={active}
        onExit={() => setActive(null)}
        onComplete={() => {
          completeTraining(active)
        }}
      />
    )
  }

  return (
    <div className="relative">
      <PageHero eyebrow="Practice at your own pace" title="Practice" accent="without the clock.">
        Build confidence without a timer. Try a few examples, see why an answer works,
        and choose what you would like to practice next.
      </PageHero>
      <div className="relative mx-auto max-w-5xl px-4 pb-16">
        <WeakAreasCard enabled={enabled} onPractice={startType} />

        <p className="mb-3 mt-8 font-sans text-sm font-medium text-muted-foreground">
          Practice areas
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {core.map((type) => (
            <DrillCard
              key={type}
              type={type}
              done={!!agent?.completedTraining.includes(type)}
              onStart={() => startType(type)}
            />
          ))}
        </div>

        {special.length > 0 && (
          <div className="mt-10 rounded-xl border border-primary/35 bg-primary/5 p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-primary">
                  Extra practice
                </p>
                <h2 className="mt-1 font-sans text-xl font-semibold">Maps, search, and audio</h2>
              </div>
              <span className="rounded-full border border-primary/50 px-2 py-0.5 font-sans text-[10px] font-bold text-primary">
                New
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {special.map((type) => (
                <DrillCard
                  key={type}
                  type={type}
                  featured
                  needsEnglish={!!REQUIRED_PROFICIENCY_EXAM && gated.has(type)}
                  done={!!agent?.completedTraining.includes(type)}
                  onStart={() => startType(type)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {CORE_TYPES.every((t) => agent?.completedTraining.includes(t)) ? (
                <ShieldCheck className="size-4 text-success" />
              ) : (
                <Lock className="size-4 text-muted-foreground" />
              )}
              <h3 className="font-sans font-semibold">Ready for a timed test?</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Practice a type, then sit that timed test. No answers until the end.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/operation">Start a timed test</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function DrillCard({
  type,
  done,
  onStart,
  featured = false,
  needsEnglish = false,
}: {
  type: AssignmentType
  done: boolean
  onStart: () => void
  featured?: boolean
  needsEnglish?: boolean
}) {
  const pack = featured ? guidelineFor(type) : undefined
  return (
    <div
      className={cn(
        'group relative flex gap-4 overflow-hidden rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary/50',
        featured ? 'border-primary/30 bg-background/50' : 'border-border',
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: SKILL_ACCENT[type] }}
    >
      <SkillTile type={type} className="w-32 shrink-0 self-start p-2 sm:w-40">
        <SkillScene type={type} className="w-full text-[7px] transition-transform duration-300 group-hover:-rotate-2 sm:text-[8px]" />
      </SkillTile>
      <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SKILL_ACCENT[type] }}>
          {SKILL_MECHANIC[type].verb} · {SKILL_MECHANIC[type].detail}
        </span>
        {featured && (
          <span className="rounded-full border border-primary/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">New</span>
        )}
      </div>
      <h3 className="mt-1 font-heading text-xl font-medium">{TYPE_NAMES[type]}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{TYPE_BLURBS[type]}</p>
      {needsEnglish && (
        <p className="mt-1 text-xs text-muted-foreground">
          Requires the English exam.{' '}
          <Link href={`/proficiency/${REQUIRED_PROFICIENCY_EXAM}?next=/training`} className="text-primary underline underline-offset-2">
            Take it
          </Link>
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 text-sm"
        >
          {done ? (
            <span className="text-success">Done · +{XP.TRAINING_MODULE} XP</span>
          ) : (
            <span className="text-primary">Start practice</span>
          )}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </button>
        {pack && (
          <Link
            href={`/guidelines/${type}`}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Read the guideline
          </Link>
        )}
      </div>
      </div>
    </div>
  )
}

function TrainingSession({
  type,
  onExit,
  onComplete,
}: {
  type: AssignmentType
  onExit: () => void
  onComplete: () => void
}) {
  const [pool, setPool] = useState<PublicQuestion[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<Feedback | null>(null)
  const [grading, setGrading] = useState(false)
  const [completedAll, setCompletedAll] = useState(false)
  const [quotaBlocked, setQuotaBlocked] = useState(false)
  const question: PublicQuestion | undefined = pool?.[index]

  useEffect(() => {
    let cancelled = false
    fetch(`/api/practice/questions?type=${type}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { questions: PublicQuestion[] }) => {
        if (!cancelled) setPool(data.questions)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [type])

  async function handleSubmit(answer: SubmittedAnswer) {
    if (!question || grading) return
    setGrading(true)
    try {
      const res = await fetch('/api/practice/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selection: answer.selection,
          justification: answer.justification,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const feedback = (await res.json()) as Feedback & { quotaExceeded?: boolean }
      if (feedback.quotaExceeded) setQuotaBlocked(true)
      recordPractice(type, feedback.ratio)
      setResult(feedback)
    } catch {
      setLoadError(true)
    } finally {
      setGrading(false)
    }
  }

  function next() {
    if (!pool || index + 1 >= pool.length) {
      setCompletedAll(true)
      onComplete()
      return
    }
    setIndex((i) => i + 1)
    setResult(null)
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="font-sans text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {'<'} Back to practice
        </button>
          <span className="font-sans text-xs font-medium text-accent">
          {TYPE_NAMES[type]} · {pool ? `${Math.min(index + 1, pool.length)}/${pool.length}` : '…'}
        </span>
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${pool?.length ? (index / pool.length) * 100 : 0}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {completedAll ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-xl border border-success/40 bg-success/5 p-8 text-center"
          >
            <ShieldCheck className="mx-auto size-10 text-success" />
            <h2 className="mt-4 font-sans text-2xl font-bold">Practice complete</h2>
            <p className="mt-2 text-muted-foreground">
              You finished {TYPE_NAMES[type]} practice and earned +{XP.TRAINING_MODULE} XP.
            </p>
            <Button className="mt-6" onClick={onExit}>
              Back to practice
            </Button>
          </motion.div>
        ) : question ? (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-6 space-y-4"
          >
            <AssignmentRenderer
              question={question}
              onSubmit={handleSubmit}
              disabled={!!result}
              flashState={
                result
                  ? result.correct
                    ? 'correct'
                    : result.ratio > 0
                      ? 'partial'
                      : 'wrong'
                  : null
              }
            />
            {grading && (
              <p className="text-sm text-muted-foreground">
                Checking your explanation...
              </p>
            )}
            {result && !grading && (
              <>
                <FeedbackPanel feedback={result} />
                <Button onClick={next} className="w-full" size="lg">
                  {pool && index + 1 >= pool.length ? 'Finish practice' : 'Next question'}
                  <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </motion.div>
        ) : loadError ? (
          <p key="error" className="mt-10 text-center text-sm text-danger">
            Could not load practice questions. Check your connection and try again.
          </p>
        ) : (
          <p key="loading" className="mt-10 text-center text-sm text-muted-foreground">
            Loading questions…
          </p>
        )}
      </AnimatePresence>
      <UpgradeDialog
        open={quotaBlocked}
        onClose={() => setQuotaBlocked(false)}
        reason="You've used all your AI-graded practice questions for today."
      />
    </div>
  )
}
