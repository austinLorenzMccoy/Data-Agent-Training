'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useAgent } from '@/components/providers/agent-provider'
import { getQuestionsByType } from '@/lib/questions'
import type { AssignmentType, Question } from '@/lib/types'
import { TYPE_BLURBS, TYPE_NAMES, XP, isSelectionCorrect, hasJustification, selectionScore } from '@/lib/scoring'
import { gradeJustification } from '@/lib/grade-client'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { FeedbackPanel } from '@/components/assignments/feedback-panel'
import { NeuralNoise } from '@/components/neural-noise'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, Crosshair, GitCompare, ShieldCheck, ListChecks, Lock, MapPin, Search, AudioLines } from 'lucide-react'
import { CORE_TYPES, FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM, getEnabledTypes, getProficiencyGatedTypes, isV4Type } from '@/lib/feature-flags'
import { guidelineFor } from '@/lib/guidelines'
import { hasPassedProficiency } from '@/lib/proficiency'
import { useRouter } from 'next/navigation'

const TYPE_ICONS: Record<AssignmentType, typeof Crosshair> = {
  alpha: Crosshair,
  beta: GitCompare,
  gamma: ShieldCheck,
  delta: ListChecks,
  epsilon: MapPin,
  zeta: Search,
  eta: Search,
  theta: AudioLines,
}

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
      <NeuralNoise />
      <div className="relative mx-auto max-w-5xl px-4 py-12">
        <p className="font-sans text-sm font-medium text-accent">
          Practice at your own pace
        </p>
        <h1 className="mt-2 text-pretty font-sans text-4xl font-bold tracking-tight">
          Practice
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Build confidence without a timer. Try a few examples, see why an answer works,
          and choose what you would like to practice next.
        </p>

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
              Pick one task type. The clock is on, and you won’t see answers until the end.
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
}: {
  type: AssignmentType
  done: boolean
  onStart: () => void
  featured?: boolean
}) {
  const Icon = TYPE_ICONS[type]
  const pack = featured ? guidelineFor(type) : undefined
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-colors hover:border-primary/50',
        featured ? 'border-primary/30 bg-background/50' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="flex items-center gap-2">
          {featured && (
            <span className="rounded-full border border-primary/50 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              New
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-4 font-sans text-lg font-semibold">{TYPE_NAMES[type]}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{TYPE_BLURBS[type]}</p>
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
  )
}

interface Result {
  correct: boolean
  ratio: number
  selection: unknown
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
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
  const pool = useMemo(() => getQuestionsByType(type).slice(0, 5), [type])
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [grading, setGrading] = useState(false)
  const [completedAll, setCompletedAll] = useState(false)
  const question: Question | undefined = pool[index]

  async function handleSubmit(answer: SubmittedAnswer) {
    if (!question) return
    const ratio = selectionScore(question, answer.selection)
    const correct = isSelectionCorrect(question, answer.selection)
    setResult({ correct, ratio, selection: answer.selection })
    if (hasJustification(question.type) && answer.justification) {
      setGrading(true)
      const decision =
        typeof answer.selection === 'object'
          ? JSON.stringify(answer.selection)
          : String(answer.selection)
      const graded = await gradeJustification(question, answer.justification, decision)
      setGrading(false)
      setResult({
        correct,
        ratio,
        selection: answer.selection,
        justificationScore: graded.score,
        justificationFeedback: graded.feedback,
      })
    }
  }

  function next() {
    if (index + 1 >= pool.length) {
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
          {TYPE_NAMES[type]} · {Math.min(index + 1, pool.length)}/{pool.length}
        </span>
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${(index / pool.length) * 100}%` }}
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
                <FeedbackPanel
                  question={question}
                  correct={result.correct}
                  selection={result.selection}
                  ratio={result.ratio}
                  justificationScore={result.justificationScore}
                  justificationFeedback={result.justificationFeedback}
                />
                <Button onClick={next} className="w-full" size="lg">
                  {index + 1 >= pool.length ? 'Finish practice' : 'Next question'}
                  <ArrowRight className="size-4" />
                </Button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
