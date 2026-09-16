import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import type { Answer, OperationResult } from '@/lib/types'

type Agent           = Database['public']['Tables']['agents']['Row']
type AgentBadge      = Database['public']['Tables']['agent_badges']['Row']
type Operation       = Database['public']['Tables']['operations']['Row']
type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']
type OperationInsert  = Database['public']['Tables']['operations']['Insert']

export type { Agent, AgentBadge, Operation, LeaderboardEntry }

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
  const updateData = Object.assign({}, { alias })
  const { error } = await supabase.from('agents').update(updateData as never).eq('id', userId)
  return { error: error?.message ?? null }
}

export async function updateLeaderboardOptIn(userId: string, optIn: boolean) {
  const supabase = createClient()
  const updateData = Object.assign({}, { leaderboard_opt_in: optIn })
  const { error } = await supabase
    .from('agents').update(updateData as never).eq('id', userId)
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
  result: OperationResult,
  answers: Answer[],
  timeTakenSeconds: number | null
): Promise<{ operation: Operation | null; error: string | null }> {
  const supabase = createClient()

  const insert: OperationInsert = {
    agent_id:           agentId,
    operation_name:     result.operationName,
    iq_score:           Math.round(result.iqScore),
    xp_earned:          result.xpEarned,
    questions_total:    answers.length,
    questions_correct:  answers.filter(a => a.correct).length,
    time_taken_seconds: timeTakenSeconds,
    passed:             result.passed,
    category_scores:    result.categoryScores,
    answers:            answers as unknown as AnswerLog[],
  }

  const { data, error } = await supabase
    .from('operations').insert(insert as never).select().single()

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
