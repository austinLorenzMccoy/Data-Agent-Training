import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Agent           = Database['public']['Tables']['agents']['Row']
type AgentBadge      = Database['public']['Tables']['agent_badges']['Row']
type Operation       = Database['public']['Tables']['operations']['Row']
type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row']

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

// Test results are written by the server (/api/operations/finish); the
// browser has no insert permission on `operations`.

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
