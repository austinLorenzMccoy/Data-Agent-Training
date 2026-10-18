import type { Answer, Question } from '@/lib/types'
import { XP, hasJustification, isSelectionCorrect, pointsPossible, selectionScore } from '@/lib/scoring'
import { scoreDomainQuestion } from '@/lib/domain-scoring'
import type { Feedback } from './public'

export interface ScoredAnswer {
  correct: boolean
  ratio: number
  pointsEarned: number
  pointsPossible: number
}

function justificationPoints(score: 0 | 1 | 2 | undefined): number {
  if (score === 2) return XP.JUSTIFICATION_FULL
  if (score === 1) return XP.JUSTIFICATION_PARTIAL
  return 0
}

/**
 * Score one answer against the original (unshuffled) question.
 *
 * Written reasons count toward the score as well as the maximum — before
 * this, `pointsPossible` included the justification but `pointsEarned` did
 * not, so alpha/beta/iota tests topped out near 33%. A reason only earns
 * points when the pick itself earned some: a good argument for the wrong
 * call is still the wrong call.
 */
export function scoreAnswer(q: Question, selection: unknown, justificationScore?: 0 | 1 | 2): ScoredAnswer {
  // Selections arrive from the network; a malformed one scores zero
  // rather than throwing inside a domain scorer.
  let ratio = 0
  let correct = false
  try {
    ratio = selectionScore(q, selection)
    correct = isSelectionCorrect(q, selection)
  } catch {
    ratio = 0
  }
  const base = Math.round(ratio * q.xpValue)
  const reason = hasJustification(q.type) && ratio > 0 ? justificationPoints(justificationScore) : 0
  return { correct, ratio, pointsEarned: base + reason, pointsPossible: pointsPossible(q) }
}

export interface StoredAnswer {
  questionId: string
  selection: unknown
  justification?: string
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
  answeredAt: number
}

/** XP for one answer, given the streak it extends. Mirrors the old client rules. */
export function answerXp(q: Question, scored: ScoredAnswer, justificationScore: 0 | 1 | 2 | undefined, streak: number): number {
  if (scored.ratio <= 0) return 0
  let xp = Math.round(XP.CORRECT_MCQ * scored.ratio)
  if (hasJustification(q.type)) xp += justificationPoints(justificationScore)
  if (scored.correct) {
    if (streak === 3) xp += XP.STREAK_3
    else if (streak === 5) xp += XP.STREAK_5
    else if (streak === 10) xp += XP.STREAK_10
  }
  return xp
}

/**
 * Turn the stored answers of an attempt into scored `Answer`s in question
 * order. Unanswered questions score zero against their full maximum, so
 * running out the clock never raises the percentage.
 */
export function tallyAttempt(
  questions: Question[],
  stored: Record<string, StoredAnswer | undefined>,
): { answers: Answer[]; bestStreak: number } {
  let streak = 0
  let bestStreak = 0
  const answers: Answer[] = questions.map((q, i) => {
    const s = stored[String(i)]
    if (!s) {
      streak = 0
      return {
        questionId: q.id,
        type: q.type,
        selection: null,
        correct: false,
        pointsEarned: 0,
        pointsPossible: pointsPossible(q),
        xpEarned: 0,
        timeMs: 0,
      }
    }
    const scored = scoreAnswer(q, s.selection, s.justificationScore)
    streak = scored.correct ? streak + 1 : 0
    bestStreak = Math.max(bestStreak, streak)
    return {
      questionId: q.id,
      type: q.type,
      selection: s.selection,
      justification: s.justification,
      correct: scored.correct,
      pointsEarned: scored.pointsEarned,
      pointsPossible: scored.pointsPossible,
      xpEarned: answerXp(q, scored, s.justificationScore, streak),
      justificationScore: s.justificationScore,
      justificationFeedback: s.justificationFeedback,
      timeMs: 0,
    }
  })
  return { answers, bestStreak }
}

/** Feedback for a practice answer: correctness, the explanation, and field diffs. */
export function buildFeedback(q: Question, selection: unknown): Feedback {
  const scored = scoreAnswer(q, selection)
  let breakdown: ReturnType<typeof scoreDomainQuestion> | null = null
  try {
    if (q.payload !== undefined) breakdown = scoreDomainQuestion(q, selection)
  } catch {
    breakdown = null
  }
  return {
    correct: scored.correct,
    ratio: scored.ratio,
    explanation: q.explanation,
    diffs: breakdown?.diffs ?? [],
    notes: breakdown?.notes,
  }
}
