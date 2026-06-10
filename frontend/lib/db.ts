import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Agent           = Database['public']['Tables']['agents']['Row']
type AgentBadge      = Database['public']['Tables']['agent_badges']['Row']
type Operation       = Database['public']['Tables']['operations']['Row']
type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']
type OperationInsert  = Database['public']['Tables']['operations']['Insert']

export type { Agent, AgentBadge, Operation, LeaderboardEntry }

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

export type AnswerLog = Database['public']['Tables']['operations']['Row']['answers'][number]

// ── Agent ───────────────────────────────────────────────────────

export async function fetchAgentProfile(userId: string): Promise<Agent | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agents').select('*').eq('id', userId).single()
  if (error) { console.error('fetchAgentProfile:', error.message); return null }
  return data
}

export async function updateAgentAlias(userId: string, alias: string) {
  const supabase = createClient()
  const { error } = await supabase.from('agents').update({ alias }).eq('id', userId)
  return { error: error?.message ?? null }
}

export async function updateLeaderboardOptIn(userId: string, optIn: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('agents').update({ leaderboard_opt_in: optIn }).eq('id', userId)
  return { error: error?.message ?? null }
}

// ── Badges ──────────────────────────────────────────────────────

export async function fetchAgentBadges(userId: string): Promise<AgentBadge[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agent_badges').select('*').eq('agent_id', userId)
    .order('earned_at', { ascending: false })
  if (error) { console.error('fetchAgentBadges:', error.message); return [] }
  return data
}

// ── Operations ──────────────────────────────────────────────────

export async function fetchAgentOperations(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<Operation[]> {
  const supabase = createClient()
  const query = supabase
    .from('operations').select('*').eq('agent_id', userId)
    .order('created_at', { ascending: false })
  if (options?.limit)  query.limit(options.limit)
  if (options?.offset) query.range(options.offset, options.offset + (options.limit ?? 20) - 1)
  const { data, error } = await query
  if (error) { console.error('fetchAgentOperations:', error.message); return [] }
  return data
}

export async function submitOperation(
  agentId: string,
  operationName: string,
  scoreResult: ScoreResult,
  answers: AnswerLog[],
  timeTakenSeconds: number | null
): Promise<{ operation: Operation | null; error: string | null }> {
  const supabase = createClient()

  const insert: OperationInsert = {
    agent_id:           agentId,
    operation_name:     operationName,
    iq_score:           scoreResult.iqScore,
    xp_earned:          scoreResult.xpEarned,
    questions_total:    answers.length,
    questions_correct:  answers.filter(a => a.isCorrect).length,
    time_taken_seconds: timeTakenSeconds,
    passed:             scoreResult.passed,
    category_scores: {
      alpha: scoreResult.byCategory.alpha.earned / (scoreResult.byCategory.alpha.max || 1) * 100,
      beta:  scoreResult.byCategory.beta.earned  / (scoreResult.byCategory.beta.max  || 1) * 100,
      gamma: scoreResult.byCategory.gamma.earned / (scoreResult.byCategory.gamma.max || 1) * 100,
      delta: scoreResult.byCategory.delta.earned / (scoreResult.byCategory.delta.max || 1) * 100,
    },
    answers,
  }

  const { data, error } = await supabase
    .from('operations').insert(insert).select().single()

  if (error) { console.error('submitOperation:', error.message); return { operation: null, error: error.message } }
  return { operation: data, error: null }
}

// ── Leaderboard ─────────────────────────────────────────────────

export async function fetchLeaderboard(options?: {
  rankTierId?: number; limit?: number
}): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  let query = supabase
    .from('leaderboard').select('*')
    .order('total_xp', { ascending: false }).limit(options?.limit ?? 50)
  if (options?.rankTierId) query = query.eq('rank_tier_id', options.rankTierId)
  const { data, error } = await query
  if (error) { console.error('fetchLeaderboard:', error.message); return [] }
  return data
}
