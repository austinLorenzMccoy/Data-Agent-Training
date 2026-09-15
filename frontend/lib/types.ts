// Core domain types for Datanerds Annotation (codename DNA)

import type { EpsilonPayload, ThetaPayload, ZetaPayload } from './domain-types'

export type AssignmentType =
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'delta'
  | 'epsilon'
  | 'zeta'
  | 'eta'
  | 'theta'
  | 'iota'
  | 'kappa'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type AlphaRating = 'CLEAR' | 'AMBIGUOUS' | 'COMPROMISED'

// Transcript clearance flag reasons (GAMMA)
export const FLAG_REASONS = [
  'Spelling errors',
  'Unnecessary repetition',
  'Emoji contamination',
  'Offensive language',
  'Identity exposure',
  'Incoherent/non-human',
  'Physical-world leakage',
  'Rhythmic pattern (rhyming)',
] as const
export type FlagReason = (typeof FLAG_REASONS)[number]

export interface GammaCorrectAnswer {
  decision: 'CLEAR' | 'FLAGGED'
  flags: FlagReason[]
}

export interface Question {
  id: string
  type: AssignmentType
  difficulty: Difficulty
  category: string
  operationContext: string
  prompt: string
  // alpha
  responseA?: string
  // beta
  responseB?: string
  // delta
  responses?: string[]
  // gamma
  transcript?: string
  // alpha: AlphaRating | beta: 'A' | 'B' | gamma: GammaCorrectAnswer | delta: index
  // v4 types store the gold answer inside payload; correctAnswer may be unused.
  correctAnswer: AlphaRating | 'A' | 'B' | GammaCorrectAnswer | number | Record<string, unknown>
  // beta also requires each response rated, optional reference
  ratingA?: AlphaRating
  ratingB?: AlphaRating
  explanation: string
  rubric?: string
  xpValue: number
  tags: string[]
  /** v4 domain payload (map eval, search quality, transcription). */
  payload?: EpsilonPayload | ZetaPayload | ThetaPayload
  audioAssetUrl?: string
}

export interface Answer {
  questionId: string
  type: AssignmentType
  // the agent's structured selection
  selection: unknown
  justification?: string
  correct: boolean
  pointsEarned: number
  pointsPossible: number
  xpEarned: number
  // groq grading result for justifications
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
  timeMs: number
}

export interface OperationSession {
  id: string
  operationName: string
  questionIds: string[]
  currentIndex: number
  answers: Answer[]
  startedAt: number
  durationSec: number
  streak: number
  bestStreak: number
  xpEarned: number
  status: 'launching' | 'active' | 'submitting' | 'complete'
}

export interface OperationResult {
  id: string
  operationName: string
  iqScore: number // 0-100
  passed: boolean
  xpEarned: number
  bestStreak: number
  completedAt: number
  rankAtCompletion: string
  categoryScores: Record<AssignmentType, number> // 0-100 per type
  totalAssignments: number
}

export interface RankTier {
  id: string
  name: string
  xpRequired: number
  color: string
  description: string
}

export interface AgentProfile {
  alias: string
  createdAt: number
  xp: number
  totalAssignments: number
  bestStreak: number
  history: OperationResult[]
  lastLoginDate: string // YYYY-MM-DD
  completedTraining: AssignmentType[]
  onLeaderboard: boolean
}

export interface GroqResult {
  score: 0 | 1 | 2
  feedback: string
  questionId: string
}

export interface LeaderboardEntry {
  alias: string
  iqScore: number
  rank: string
  xp: number
  updatedAt: number
}
