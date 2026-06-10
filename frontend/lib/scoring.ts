import type {
  Answer,
  AssignmentType,
  GammaCorrectAnswer,
  OperationResult,
  Question,
} from './types'

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

export const TYPE_LABELS: Record<AssignmentType, string> = {
  alpha: 'ALPHA',
  beta: 'BETA',
  gamma: 'GAMMA',
  delta: 'DELTA',
}

export const TYPE_NAMES: Record<AssignmentType, string> = {
  alpha: 'Response Rating',
  beta: 'Comparative Analysis',
  gamma: 'Transcript Clearance',
  delta: 'Response Selection',
}

export function streakBonus(streak: number): number {
  if (streak > 0 && streak % 10 === 0) return XP.STREAK_10
  if (streak > 0 && streak % 5 === 0) return XP.STREAK_5
  if (streak >= 3 && streak % 3 === 0) return XP.STREAK_3
  return 0
}

// Determine MCQ correctness for a question given the agent's selection.
export function isSelectionCorrect(q: Question, selection: unknown): boolean {
  switch (q.type) {
    case 'alpha':
      return selection === q.correctAnswer
    case 'beta':
      return selection === q.correctAnswer // 'A' | 'B'
    case 'delta':
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
  const hasJustification = q.type === 'alpha' || q.type === 'beta'
  return base + (hasJustification ? XP.JUSTIFICATION_FULL : 0)
}

export function hasJustification(type: AssignmentType): boolean {
  return type === 'alpha' || type === 'beta'
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
  const result: Record<AssignmentType, number> = {
    alpha: 0,
    beta: 0,
    gamma: 0,
    delta: 0,
  }
  ;(['alpha', 'beta', 'gamma', 'delta'] as AssignmentType[]).forEach((type) => {
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
