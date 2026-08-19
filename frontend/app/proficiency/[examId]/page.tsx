'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NeuralNoise } from '@/components/neural-noise'
import {
  FEATURE_PROFICIENCY_GATE,
} from '@/lib/feature-flags'
import {
  getExam,
  hasPassedProficiency,
  saveProficiencyResult,
  scoreExam,
} from '@/lib/proficiency'
import { cn } from '@/lib/utils'
import { CheckCircle2, Lock, Shield } from 'lucide-react'

export default function ProficiencyPage() {
  const params = useParams<{ examId: string }>()
  const search = useSearchParams()
  const router = useRouter()
  const examId = params.examId
  const exam = getExam(examId)
  const next = search.get('next') || '/training'

  const [phase, setPhase] = useState<'gate' | 'brief' | 'exam' | 'done'>('gate')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  const alreadyPassed = useMemo(() => (exam ? hasPassedProficiency(exam.id) : false), [exam])

  useEffect(() => {
    if (!FEATURE_PROFICIENCY_GATE) {
      setPhase('gate')
      return
    }
    if (alreadyPassed) setPhase('done')
    else setPhase('brief')
  }, [alreadyPassed])

  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft])

  if (!exam) {
    return (
      <main className="relative min-h-screen">
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-mono text-2xl font-bold">Exam not found</h1>
          <Button asChild className="mt-6">
            <Link href="/training">Back to practice</Link>
          </Button>
        </div>
      </main>
    )
  }

  function start() {
    if (!exam) return
    setAnswers({})
    setIndex(0)
    setResult(null)
    setTimeLeft(exam.timeLimitSec)
    setPhase('exam')
  }

  function finish() {
    if (!exam) return
    const scored = scoreExam(exam, answers)
    saveProficiencyResult({
      examId: exam.id,
      score: scored.score,
      passed: scored.passed,
      completedAt: Date.now(),
    })
    setResult(scored)
    setPhase('done')
  }

  const question = exam.questions[index]
  const mins = Math.floor(timeLeft / 60)
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <main className="relative min-h-screen">
      <NeuralNoise className="opacity-30" />
      <div className="relative mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm font-medium text-primary">
          English exam
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold">{exam.label}</h1>

        {!FEATURE_PROFICIENCY_GATE && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <Lock className="size-6 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              The proficiency gate is disabled. Enable{' '}
              <code className="font-mono text-xs">NEXT_PUBLIC_FEATURE_PROFICIENCY_GATE</code> to
              sit this exam.
            </p>
          </div>
        )}

        {FEATURE_PROFICIENCY_GATE && phase === 'brief' && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <p className="leading-relaxed text-muted-foreground">
              This is a timed English exam — {exam.questions.length} questions,{' '}
              {Math.round(exam.timeLimitSec / 60)} minutes, pass mark {exam.passScore}%. You only
              get one attempt, and leaving the page ends it. Passing is saved. You can still
              practice the core tasks either way; some transcription jobs require this exam first.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Study the question types first — answers are not shown during the exam.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={start}>
                Begin exam
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/guidelines/proficiency">Study the exam guide</Link>
              </Button>
            </div>
          </div>
        )}

        {FEATURE_PROFICIENCY_GATE && phase === 'exam' && question && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span>
                {index + 1} / {exam.questions.length}
              </span>
              <span className={cn(timeLeft < 60 && 'text-danger')}>
                {mins}:{secs}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                {question.kind === 'listening' ? 'Listening' : 'Multiple choice'}
              </p>
              <p className="mt-2 text-base leading-relaxed">{question.prompt}</p>
              {question.audioUrl && (
                <audio className="mt-4 w-full" controls src={question.audioUrl} />
              )}
              <div className="mt-5 space-y-2">
                {question.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: c.id }))}
                    className={cn(
                      'block w-full rounded-md border px-3 py-2.5 text-left text-sm',
                      answers[question.id] === c.id
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-foreground hover:border-muted-foreground/50',
                    )}
                  >
                    <span className="mr-2 font-mono text-xs font-bold">{c.id.toUpperCase()}.</span>
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              size="lg"
              disabled={!answers[question.id]}
              onClick={() => {
                if (index + 1 >= exam.questions.length) finish()
                else setIndex((i) => i + 1)
              }}
            >
              {index + 1 >= exam.questions.length ? 'Submit exam' : 'Next question'}
            </Button>
          </div>
        )}

        {FEATURE_PROFICIENCY_GATE && phase === 'done' && (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
            {alreadyPassed || result?.passed ? (
              <>
                <CheckCircle2 className="mx-auto size-10 text-success" />
                <h2 className="mt-4 text-2xl font-bold">You passed</h2>
                <p className="mt-2 text-muted-foreground">
                  {typeof result?.score === 'number'
                    ? `Score ${result.score}%. `
                    : ''}
                  You do not need to retake this exam.
                </p>
              </>
            ) : (
              <>
                <Shield className="mx-auto size-10 text-danger" />
                <h2 className="mt-4 text-2xl font-bold">Below pass mark</h2>
                <p className="mt-2 text-muted-foreground">
                  Score {result?.score ?? 0}%. Core practice stays open. Retake to unlock
                  transcription and other English-heavy tracks.
                </p>
                <Button className="mt-4" variant="outline" onClick={start}>
                  Retake exam
                </Button>
              </>
            )}
            <Button className="mt-6" onClick={() => router.push(next)}>
              Continue
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
