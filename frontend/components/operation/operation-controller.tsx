'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { drawTrackOperation } from '@/lib/questions'
import { TrackPicker } from './track-picker'
import { TYPE_NAMES } from '@/lib/scoring'
import type { Answer, AssignmentType, Question } from '@/lib/types'
import { useAgent } from '@/components/providers/agent-provider'
import { useAuth } from '@/contexts/AuthContext'
import { LaunchSequence } from './launch-sequence'
import { OperationHud } from './operation-hud'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { Button } from '@/components/ui/button'
import { gradeJustification } from '@/lib/grade-client'
import { isSelectionCorrect, XP, hasJustification, buildResult, pointsPossible, selectionScore } from '@/lib/scoring'
import { getProficiencyGatedTypes, FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'
import { hasPassedProficiency } from '@/lib/proficiency'
import { buildLastTest, saveLastTest } from '@/lib/last-test'
import { submitOperation } from '@/lib/db'
import { UpgradeDialog } from '@/components/billing/upgrade-dialog'
const MAX_TRACK_QUESTIONS = 12
const MINUTES_PER_ASSIGNMENT = 2.5
const MIN_OPERATION_MIN = 10



export function OperationController() {
  const router = useRouter()
  const { agent, addXp, logOperation } = useAgent()
  const { user } = useAuth()

  const [state, setState] = useState<'selecting' | 'launching' | 'active' | 'submitting' | 'complete'>('selecting')
  const [track, setTrack] = useState<AssignmentType | null>(null)
  const [quotaBlocked, setQuotaBlocked] = useState(false)
  const [checkingQuota, setCheckingQuota] = useState(false)
  const [operationName, setOperationName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | 'partial' | null>(null)
  const [grading, setGrading] = useState(false)

  const gated = new Set(getProficiencyGatedTypes())
  const examPassed =
    !FEATURE_PROFICIENCY_GATE ||
    !REQUIRED_PROFICIENCY_EXAM ||
    hasPassedProficiency(REQUIRED_PROFICIENCY_EXAM)

  async function startTrack(type: AssignmentType) {
    if (gated.has(type) && !examPassed) {
      router.push(`/proficiency/${REQUIRED_PROFICIENCY_EXAM}?next=/operation`)
      return
    }

    // Checked before drawing questions, not after submission — a
    // completed test can't be un-counted against the monthly quota.
    setCheckingQuota(true)
    try {
      const res = await fetch('/api/operations/start', { method: 'POST' })
      if (res.status === 402) {
        setQuotaBlocked(true)
        return
      }
      if (!res.ok) return
    } finally {
      setCheckingQuota(false)
    }

    const qs = drawTrackOperation(type, MAX_TRACK_QUESTIONS)
    if (qs.length === 0) return
    const minutes = Math.max(MIN_OPERATION_MIN, Math.round(qs.length * MINUTES_PER_ASSIGNMENT))
    setTrack(type)
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers([])
    setStreak(0)
    setBestStreak(0)
    setTotalXp(0)
    setDurationSec(minutes * 60)
    setTimeLeft(minutes * 60)
    setOperationName(TYPE_NAMES[type])
    setState('launching')
  }

  // Timer countdown
  useEffect(() => {
    if (state !== 'active' || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setState('submitting')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state, timeLeft])

  const currentQuestion = questions[currentIndex]

  async function handleSubmitAnswer(answer: SubmittedAnswer) {
    if (!currentQuestion || grading) return
    setGrading(true)

    try {
      // Grade the answer
      const ratio = selectionScore(currentQuestion, answer.selection)
      const correct = isSelectionCorrect(currentQuestion, answer.selection)
      let justificationScore: 0 | 1 | 2 = 0

      // Grade justification if present
      if (answer.justification) {
        try {
          const result = await gradeJustification(
            currentQuestion,
            answer.justification,
            typeof answer.selection === 'string' ? answer.selection : JSON.stringify(answer.selection),
          )
          justificationScore = result.score as 0 | 1 | 2
        } catch (err) {
          console.error('Grading error:', err)
          justificationScore = 0
        }
      }

      // Calculate streak first
      const newStreak = correct ? streak + 1 : 0
      const newBestStreak = Math.max(bestStreak, newStreak)

      let xpEarned = 0
      if (ratio > 0) {
        xpEarned = Math.round(XP.CORRECT_MCQ * ratio)
        if (hasJustification(currentQuestion.type)) {
          xpEarned += justificationScore === 2 ? XP.JUSTIFICATION_FULL : justificationScore === 1 ? XP.JUSTIFICATION_PARTIAL : 0
        }
        if (correct) {
          if (newStreak === 3) xpEarned += XP.STREAK_3
          else if (newStreak === 5) xpEarned += XP.STREAK_5
          else if (newStreak === 10) xpEarned += XP.STREAK_10
        }
      }
      const pointsEarned = Math.round(ratio * currentQuestion.xpValue)

      // Record answer
      const possiblePoints = pointsPossible(currentQuestion)
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        selection: answer.selection,
        justification: answer.justification,
        correct,
        pointsEarned,
        pointsPossible: possiblePoints,
        xpEarned,
        justificationScore,
        justificationFeedback: '',
        timeMs: 0,
      }

      setAnswers((prev) => [...prev, newAnswer])
      setStreak(newStreak)
      setBestStreak(newBestStreak)
      setTotalXp((prev) => prev + xpEarned)

      // Visual feedback
      setFlashState(correct ? 'correct' : ratio > 0 ? 'partial' : 'wrong')
      setTimeout(() => setFlashState(null), 1000)

      // Move to next question or submit
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setState('submitting')
      }
    } finally {
      setGrading(false)
    }
  }

  function handleLaunchComplete() {
    setState('active')
  }

  function handleSubmitOperation() {
    // Build full result
    const result = buildResult(
      `op_${Date.now()}`,
      operationName,
      answers,
      bestStreak,
      agent?.alias || 'UNKNOWN'
    )

    // Log operation and check for rank up
    const { rankedUp } = logOperation(result)

    addXp(result.xpEarned)
    saveLastTest(buildLastTest(result, rankedUp, questions, answers))

    // localStorage stays the optimistic UI layer; this is the server-truth
    // write that quota checks and the cloud profile read from.
    if (user) {
      submitOperation(user.id, result, answers, durationSec - timeLeft)
    }

    router.push(
      `/operation/debrief?iqScore=${Math.round(result.iqScore)}&passed=${result.passed}&xp=${result.xpEarned}&rankedUp=${rankedUp}`
    )
  }

  if (state === 'selecting') {
    return (
      <>
        <TrackPicker onPick={startTrack} locked={examPassed ? undefined : gated} />
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

  if (state === 'launching' && questions.length > 0) {
    return (
      <LaunchSequence
        operationName={operationName}
        assignmentCount={questions.length}
        durationSec={durationSec}
        onReady={handleLaunchComplete}
      />
    )
  }

  if (!currentQuestion) {
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
        index={currentIndex}
        total={questions.length}
        timeLeft={timeLeft}
        streak={streak}
        xp={totalXp}
        trackLabel={track ? TYPE_NAMES[track] : undefined}
      />

      <AnimatePresence mode="wait">
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
            flashState={flashState}
            disabled={grading || state !== 'active'}
          />
        </motion.div>
      </AnimatePresence>

      {state === 'submitting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur"
        >
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <h3 className="text-lg font-bold text-foreground">
              {currentIndex >= questions.length ? 'Submitting...' : 'Time’s up'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentIndex >= questions.length
                ? 'Scoring your answers...'
                : 'We’ll score what you finished.'}
            </p>
            <Button
              onClick={handleSubmitOperation}
              className="mt-6 bg-accent hover:bg-accent/90"
              disabled={grading}
            >
              {grading ? 'Scoring...' : 'See results'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
