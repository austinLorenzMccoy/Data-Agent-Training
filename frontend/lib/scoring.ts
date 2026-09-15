import type {
  Answer,
  AssignmentType,
  GammaCorrectAnswer,
  OperationResult,
  Question,
} from './types'
import { scoreDomainQuestion } from './domain-scoring'

export const XP = {
  CORRECT_MCQ: 50,
  JUSTIFICATION_FULL: 100,
  JUSTIFICATION_PARTIAL: 40,
  STREAK_3: 15,
  STREAK_5: 30,
  STREAK_10: 75,
  PERFECT_OP: 500,
  SPEED_BONUS: 25,
  TRAINING_MODULE: 200,
  DAILY_LOGIN: 100,
} as const

export const SPEED_BONUS_MS = 30_000
export const PASS_THRESHOLD = 70

/** Internal codes. Do not lead the UI with these. */
export const TYPE_LABELS: Record<AssignmentType, string> = {
  alpha: 'ALPHA',
  beta: 'BETA',
  gamma: 'GAMMA',
  delta: 'DELTA',
  epsilon: 'EPSILON',
  zeta: 'ZETA',
  eta: 'ETA',
  theta: 'THETA',
  iota: 'IOTA',
  kappa: 'KAPPA',
}

export const TYPE_NAMES: Record<AssignmentType, string> = {
  alpha: 'Rate a response',
  beta: 'Compare two responses',
  gamma: 'Review a transcript',
  delta: 'Pick the best reply',
  epsilon: 'Rate map results',
  zeta: 'Rate a search result',
  eta: 'Rate search (simple)',
  theta: 'Transcribe audio',
  iota: 'Compare AI media',
  kappa: 'Judge the annotation',
}

export const TYPE_BLURBS: Record<AssignmentType, string> = {
  alpha: 'Is this AI response good, okay, or bad? Write a short reason.',
  beta: 'Rate each response, then pick the better one.',
  gamma: 'Pass the transcript or flag what is wrong with it.',
  delta: 'Choose the best reply from four options.',
  epsilon: 'Rate each place for relevance, name, address, and pin.',
  zeta: 'Rate the page quality and how well it answers the search.',
  eta: 'A simpler four-point scale for how satisfying a result is.',
  theta: 'Cut the audio into speakers, type what they said, and tag anything unclear.',
  iota: 'Two AI-generated clips or images, one prompt. Pick the winner on the stated axis and say why.',
  kappa: 'Pick the correct rubric, tag, or review call from four options and see why the others fail.',
}

export const ALL_ASSIGNMENT_TYPES: AssignmentType[] = [
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta',
  'iota',
  'kappa',
]

export function streakBonus(streak: number): number {
  if (streak > 0 && streak % 10 === 0) return XP.STREAK_10
  if (streak > 0 && streak % 5 === 0) return XP.STREAK_5
  if (streak >= 3 && streak % 3 === 0) return XP.STREAK_3
  return 0
}

/** Domain-scored questions (epsilon/zeta/theta) carry a rubric payload; iota/kappa reuse the core shape. */
function hasDomainPayload(q: Question): boolean {
  return q.payload !== undefined
}

/** 0–1 credit for a selection. Payload-bearing domains support partial credit. */
export function selectionScore(q: Question, selection: unknown): number {
  if (hasDomainPayload(q)) {
    return scoreDomainQuestion(q, selection).ratio
  }
  return isExactSelection(q, selection) ? 1 : 0
}

// Determine MCQ correctness for a question given the agent's selection.
export function isSelectionCorrect(q: Question, selection: unknown): boolean {
  if (hasDomainPayload(q)) return selectionScore(q, selection) >= 1
  return isExactSelection(q, selection)
}

function isExactSelection(q: Question, selection: unknown): boolean {
  switch (q.type) {
    case 'alpha':
      return selection === q.correctAnswer
    case 'beta':
    case 'iota':
      return selection === q.correctAnswer // 'A' | 'B'
    case 'delta':
    case 'kappa':
      return selection === q.correctAnswer // number index
    case 'gamma': {
      const correct = q.correctAnswer as GammaCorrectAnswer
      const sel = selection as GammaCorrectAnswer | undefined
      if (!sel) return false
      if (sel.decision !== correct.decision) return false
      if (correct.decision === 'CLEAR') return true
      // FLAGGED: flag sets must match exactly
      const a = [...(sel.flags ?? [])].sort()
      const b = [...correct.flags].sort()
      return a.length === b.length && a.every((f, i) => f === b[i])
    }
    default:
      return false
  }
}

// Max possible points for a single question (MCQ + justification if applicable)
export function pointsPossible(q: Question): number {
  const base = q.xpValue
  const hasJustification = q.type === 'alpha' || q.type === 'beta' || q.type === 'iota'
  return base + (hasJustification ? XP.JUSTIFICATION_FULL : 0)
}

export function hasJustification(type: AssignmentType): boolean {
  return type === 'alpha' || type === 'beta' || type === 'iota'
}

// Compute IQ-Score (% of total possible points earned)
export function computeIqScore(answers: Answer[]): number {
  const earned = answers.reduce((s, a) => s + a.pointsEarned, 0)
  const possible = answers.reduce((s, a) => s + a.pointsPossible, 0)
  if (possible === 0) return 0
  return Math.round((earned / possible) * 100)
}

export function computeCategoryScores(
  answers: Answer[],
): Record<AssignmentType, number> {
  const result = {} as Record<AssignmentType, number>
  ALL_ASSIGNMENT_TYPES.forEach((type) => {
    const subset = answers.filter((a) => a.type === type)
    if (subset.length === 0) {
      result[type] = 0
      return
    }
    const earned = subset.reduce((s, a) => s + a.pointsEarned, 0)
    const possible = subset.reduce((s, a) => s + a.pointsPossible, 0)
    result[type] = possible === 0 ? 0 : Math.round((earned / possible) * 100)
  })
  return result
}

export function buildResult(
  opId: string,
  operationName: string,
  answers: Answer[],
  bestStreak: number,
  rankAtCompletion: string,
): OperationResult {
  const iqScore = computeIqScore(answers)
  return {
    id: opId,
    operationName,
    iqScore,
    passed: iqScore >= PASS_THRESHOLD,
    xpEarned: answers.reduce((s, a) => s + a.xpEarned, 0),
    bestStreak,
    completedAt: Date.now(),
    rankAtCompletion,
    categoryScores: computeCategoryScores(answers),
    totalAssignments: answers.length,
  }
}
