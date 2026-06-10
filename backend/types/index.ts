import type { Database, AnswerLog } from './database'

export type { AnswerLog }

export type Agent           = Database['public']['Tables']['agents']['Row']
export type Operation       = Database['public']['Tables']['operations']['Row']
export type AgentBadge      = Database['public']['Tables']['agent_badges']['Row']
export type RankTier        = Database['public']['Tables']['rank_tiers']['Row']
export type BadgeDefinition = Database['public']['Tables']['badge_definitions']['Row']
export type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

export interface OperationSession {
  questions: Question[]
  currentIndex: number
  answers: Record<string, AnswerLog>
  startTime: number
  endTime: number | null
  currentStreak: number
  bestStreak: number
  xpEarned: number
  operationName: string
  status: 'idle' | 'active' | 'submitted' | 'reviewed'
}

export interface Question {
  id: string
  type: 'alpha' | 'beta' | 'gamma' | 'delta'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  operationContext?: string
  prompt: string
  responseA?: string
  responseB?: string
  responses?: string[]
  transcript?: string
  correctAnswer: string | string[] | Record<string, unknown>
  explanation: string
  rubric?: string
  xpValue: number
  tags: string[]
}

export interface ScoreResult {
  totalPoints: number
  maxPoints: number
  iqScore: number
  passed: boolean
  xpEarned: number
  byCategory: {
    alpha:  { earned: number; max: number }
    beta:   { earned: number; max: number }
    gamma:  { earned: number; max: number }
    delta:  { earned: number; max: number }
  }
}

export interface GroqResult {
  questionId: string
  score: 0 | 1 | 2
  feedback: string
}
