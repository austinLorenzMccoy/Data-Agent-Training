'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { TrackPicker } from './track-picker'
import { TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import type { PublicQuestion } from '@/lib/exam/public'
import type { AttemptView, FinishView } from '@/lib/exam/attempt-types'
import { useAgent } from '@/components/providers/agent-provider'
import { LaunchSequence } from './launch-sequence'
import { OperationHud } from './operation-hud'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { Button } from '@/components/ui/button'
import { getProficiencyGatedTypes, FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'
import { hasPassedProficiency } from '@/lib/proficiency'
import { saveLastTest } from '@/lib/last-test'
import { UpgradeDialog } from '@/components/billing/upgrade-dialog'
import { enterFullscreen, exitFullscreen, useIntegrityMonitor } from '@/lib/integrity'
import { IntegrityBanner } from './integrity-banner'

type Phase = 'selecting' | 'launching' | 'active' | 'submitting' | 'complete'

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { ok: true, data: data as T }
    return { ok: false, status: res.status, error: String(data.error ?? 'error'), data }
  } catch {
    return { ok: false, status: 0, error: 'network', data: {} }
  }
}

function firstUnanswered(total: number, answered: number[]): number {
  const done = new Set(answered)
  for (let i = 0; i < total; i++) if (!done.has(i)) return i
  return total
}

export function OperationController({ counts }: { counts: Partial<Record<AssignmentType, number>> }) {
  const router = useRouter()
  const { logOperation, addXp } = useAgent()

  const [state, setState] = useState<Phase>('selecting')
  const [quotaBlocked, setQuotaBlocked] = useState(false)
  const [checkingQuota, setCheckingQuota] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<AttemptView | null>(null)
  const [answered, setAnswered] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [sending, setSending] = useState(false)
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const clockOffset = useRef(0)
  const integrity = useIntegrityMonitor(state === 'launching' || state === 'active')

  useEffect(() => exitFullscreen, [])

  const questions: PublicQuestion[] = attempt?.questions ?? []
  // Display only — the start route enforces the gate from the server record.
  const examPassed =
    !FEATURE_PROFICIENCY_GATE || !REQUIRED_PROFICIENCY_EXAM || hasPassedProficiency(REQUIRED_PROFICIENCY_EXAM)
  const gated = new Set(getProficiencyGatedTypes())

  async function startTrack(type: AssignmentType) {
    setStartError(null)
    if (gated.has(type) && !examPassed) {
      router.push(`/proficiency/${REQUIRED_PROFICIENCY_EXAM}?next=/operation`)
      return
    }
    // Must run inside the click handler — browsers refuse fullscreen
    // without a user gesture, and the request below would outlive it.
    enterFullscreen()
    setCheckingQuota(true)
    const res = await post<AttemptView>('/api/operations/start', { track: type })
    setCheckingQuota(false)

    if (!res.ok) {
      exitFullscreen()
      if (res.status === 401) router.push('/login?next=/operation')
      else if (res.status === 402) setQuotaBlocked(true)
      else if (res.error === 'proficiency_required') router.push(`/proficiency/${REQUIRED_PROFICIENCY_EXAM}?next=/operation`)
      else if (res.error === 'busy')
        setStartError(`You have a ${TYPE_NAMES[res.data.track as AssignmentType] ?? 'test'} in progress. Finish it first.`)
      else if (res.error === 'attempt_limit') setStartError('You have used every attempt allowed for this test.')
      else if (res.error === 'rate_limited') setStartError('Too many test starts. Try again later.')
      else setStartError('Could not start the test. Try again.')
      return
    }

    const view = res.data
    clockOffset.current = Date.parse(view.serverNow) - Date.now()
    setAttempt(view)
    setAnswered(view.answered)
    setCurrentIndex(firstUnanswered(view.questions.length, view.answered))
    integrity.reset()
    setState(view.answered.length > 0 ? 'active' : 'launching')
  }

  // The deadline is the server's; the browser only counts down to it.
  useEffect(() => {
    if (!attempt || (state !== 'active' && state !== 'launching')) return
    const tick = () => {
      const left = Math.ceil((Date.parse(attempt.expiresAt) - (Date.now() + clockOffset.current)) / 1000)
      setTimeLeft(Math.max(0, left))
      if (left <= 0 && state === 'active') setState('submitting')
    }
    tick()
    const timer = setInterval(tick, 500)
    return () => clearInterval(timer)
  }, [attempt, state])

  const currentQuestion = questions[currentIndex]

  async function handleSubmitAnswer(answer: SubmittedAnswer) {
    if (!attempt || !currentQuestion || sending) return
    setSending(true)
    setAnswerError(null)
    const res = await post<{ answered: number }>('/api/operations/answer', {
      attemptId: attempt.attemptId,
      index: currentIndex,
      selection: answer.selection,
      justification: answer.justification,
    })
    setSending(false)

    if (!res.ok && res.error !== 'already_answered') {
      if (res.error === 'expired') setState('submitting')
      else setAnswerError(res.status === 0 ? 'Connection lost. Your answer was not saved — submit again.' : 'Could not save that answer. Submit again.')
      return
    }

    const nextAnswered = [...answered, currentIndex]
    setAnswered(nextAnswered)
    const next = firstUnanswered(questions.length, nextAnswered)
    if (next >= questions.length) setState('submitting')
    else setCurrentIndex(next)
  }

  async function handleSubmitOperation() {
    if (!attempt || finishing) return
    setFinishing(true)
    const res = await post<FinishView>('/api/operations/finish', {
      attemptId: attempt.attemptId,
      integrity: integrity.report(),
    })
    setFinishing(false)
    if (!res.ok) {
      setAnswerError('Could not submit the test. Check your connection and try again.')
      return
    }
    exitFullscreen()
    const { result, rankedUp, items, integrity: report } = res.data
    // The server already saved the result; this keeps the on-device profile in step.
    logOperation(result)
    addXp(result.xpEarned)
    saveLastTest({ result, rankedUp, items, integrity: report ?? undefined })
    setState('complete')
    router.push(
      `/operation/debrief?iqScore=${Math.round(result.iqScore)}&passed=${result.passed}&xp=${result.xpEarned}&rankedUp=${rankedUp}`,
    )
  }

  if (state === 'selecting') {
    return (
      <>
        <TrackPicker onPick={startTrack} counts={counts} locked={examPassed ? undefined : gated} />
        {startError && (
          <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] rounded-md border border-danger/40 bg-surface px-4 py-2 text-sm text-danger shadow">
            {startError}
          </div>
        )}
        {checkingQuota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <p className="font-mono text-sm text-muted-foreground">Checking clearance...</p>
          </div>
        )}
        <UpgradeDialog
          open={quotaBlocked}
          onClose={() => setQuotaBlocked(false)}
          reason="You've used all your Live Operations for this month."
        />
      </>
    )
  }

  if (state === 'launching' && attempt && questions.length > 0) {
    return (
      <LaunchSequence
        operationName={attempt.operationName}
        assignmentCount={questions.length}
        durationSec={attempt.durationSec}
        onReady={() => setState('active')}
      />
    )
  }

  if (!currentQuestion && state !== 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-20">
      <OperationHud
        index={Math.min(answered.length, questions.length - 1)}
        total={questions.length}
        timeLeft={timeLeft}
        trackLabel={attempt ? TYPE_NAMES[attempt.track] : undefined}
      />

      <AnimatePresence mode="wait">
        {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-auto max-w-3xl px-4 py-8"
        >
          <AssignmentRenderer
            question={currentQuestion}
            onSubmit={handleSubmitAnswer}
            disabled={sending || state !== 'active'}
          />
          {sending && <p className="mt-3 text-sm text-muted-foreground">Saving your answer…</p>}
          {answerError && <p className="mt-3 text-sm text-danger">{answerError}</p>}
        </motion.div>
        )}
      </AnimatePresence>

      {state === 'submitting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur"
        >
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <h3 className="text-lg font-bold text-foreground">
              {answered.length >= questions.length ? 'All answers saved' : 'Time’s up'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {answered.length >= questions.length
                ? 'Submit to see your score.'
                : 'We’ll score what you finished.'}
            </p>
            <Button
              onClick={handleSubmitOperation}
              className="mt-6 bg-accent hover:bg-accent/90"
              disabled={finishing}
            >
              {finishing ? 'Scoring...' : 'See results'}
            </Button>
            {answerError && <p className="mt-3 text-sm text-danger">{answerError}</p>}
          </div>
        </motion.div>
      )}

      {state === 'active' && (
        <IntegrityBanner
          needsFullscreen={integrity.fullscreenSupported && !integrity.isFullscreen}
          warning={integrity.lastWarning}
        />
      )}
    </div>
  )
}
