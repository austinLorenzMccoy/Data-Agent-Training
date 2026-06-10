'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { drawOperation } from '@/lib/questions'
import { useAgent } from '@/components/providers/agent-provider'
import { LaunchSequence } from './launch-sequence'
import { OperationHud } from './operation-hud'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { Button } from '@/components/ui/button'
import { gradeJustification } from '@/lib/grade-client'
import { isSelectionCorrect, XP, hasJustification, buildResult, pointsPossible } from '@/lib/scoring'
import type { Answer, Question } from '@/lib/types'

const OPERATION_COUNT = 25
const OPERATION_TIME_MIN = 40

const OPERATION_NAMES = [
  { adjectives: ['PHANTOM', 'SILENT', 'NEURAL', 'SIGNAL', 'DARK', 'ECHO', 'SWIFT', 'COVERT'], nouns: ['GHOST', 'VECTOR', 'PRISM', 'CIPHER', 'NODE', 'ATLAS', 'NEXUS', 'CROWN'] }
]

function randomOperationName(): string {
  const { adjectives, nouns } = OPERATION_NAMES[0]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `OPERATION ${adj} ${noun}`
}

export function OperationController() {
  const router = useRouter()
  const { agent, addXp, logOperation } = useAgent()

  const [state, setState] = useState<'launching' | 'active' | 'submitting' | 'complete'>('launching')
  const [operationName, setOperationName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(OPERATION_TIME_MIN * 60)
  const [flashState, setFlashState] = useState<'correct' | 'wrong' | null>(null)
  const [grading, setGrading] = useState(false)

  // Initialize operation
  useEffect(() => {
    const name = randomOperationName()
    setOperationName(name)
    const qs = drawOperation(OPERATION_COUNT)
    setQuestions(qs)
    setTimeLeft(OPERATION_TIME_MIN * 60)
  }, [])

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
      const correct = isSelectionCorrect(currentQuestion, answer.selection)
      let justificationScore: 0 | 1 | 2 = 0

      // Grade justification if present
      if (answer.justification) {
        try {
          const result = await gradeJustification({
            prompt: currentQuestion.prompt,
            response: 'responseA' in currentQuestion ? currentQuestion.responseA : '',
            justification: answer.justification,
            rubric: currentQuestion.rubric || '',
            decision: answer.selection as string,
          })
          justificationScore = result.score as 0 | 1 | 2
        } catch (err) {
          console.error('Grading error:', err)
          justificationScore = 0
        }
      }

      // Calculate streak first
      const newStreak = correct ? streak + 1 : 0
      const newBestStreak = Math.max(bestStreak, newStreak)

      // Calculate XP and points
      let xpEarned = 0
      if (correct) {
        xpEarned = XP.CORRECT_MCQ
        if (hasJustification(currentQuestion.type)) {
          xpEarned += justificationScore === 2 ? XP.JUSTIFICATION_FULL : justificationScore === 1 ? XP.JUSTIFICATION_PARTIAL : 0
        }
        // Add streak bonus
        if (newStreak === 3) xpEarned += XP.STREAK_3
        else if (newStreak === 5) xpEarned += XP.STREAK_5
        else if (newStreak === 10) xpEarned += XP.STREAK_10
      }
      const pointsEarned = correct ? currentQuestion.xpValue : 0

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
      setFlashState(correct ? 'correct' : 'wrong')
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
    const { rankedUp, from, to } = logOperation(result)

    addXp(result.xpEarned)

    // Redirect to debrief
    router.push(
      `/operation/debrief?iqScore=${Math.round(result.iqScore)}&passed=${result.passed}&xp=${result.xpEarned}&rankedUp=${rankedUp}`
    )
  }

  if (state === 'launching' && questions.length > 0) {
    return (
      <LaunchSequence
        operationName={operationName}
        assignmentCount={questions.length}
        durationSec={OPERATION_TIME_MIN * 60}
        onReady={handleLaunchComplete}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading operation...</p>
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
              {currentIndex >= questions.length ? 'Submitting Report...' : 'Time Expired'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentIndex >= questions.length
                ? 'Processing your intelligence assessment...'
                : 'Your operation time has expired. Submitting your report...'}
            </p>
            <Button
              onClick={handleSubmitOperation}
              className="mt-6 bg-accent hover:bg-accent/90"
              disabled={grading}
            >
              {grading ? 'Processing...' : 'Continue to Debrief'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
