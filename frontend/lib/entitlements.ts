import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type BillingPlan = Database['public']['Tables']['billing_plans']['Row']
type Subscription = Database['public']['Tables']['subscriptions']['Row']

export interface Entitlements {
  plan: BillingPlan
  subscription: Subscription
  practiceUsedToday: number
  testsUsedThisMonth: number
}

export type QuotaAction = 'practice' | 'test'

export type QuotaCheckResult =
  | { allowed: true }
  | { allowed: false; reason: 'quota_exceeded'; limit: number; plan: string }
  | { allowed: false; reason: 'no_subscription' }

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function monthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

async function loadSubscriptionAndPlan(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string
): Promise<{ subscription: Subscription; plan: BillingPlan } | null> {
  // The generated Supabase client types collapse to `never` on these two
  // tables for reasons unrelated to this feature (reproduces on the
  // pre-existing `agents` table too) — cast at the boundary rather than
  // fight the client's generics.
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions').select('*').eq('agent_id', userId).single()
  if (subError || !subscription) return null
  const sub = subscription as unknown as Subscription

  const { data: plan, error: planError } = await supabase
    .from('billing_plans').select('*').eq('id', sub.plan_id).single()
  if (planError || !plan) return null

  return { subscription: sub, plan: plan as unknown as BillingPlan }
}

export async function getEntitlements(userId: string): Promise<Entitlements | null> {
  const supabase = await createServerSupabaseClient()
  const loaded = await loadSubscriptionAndPlan(supabase, userId)
  if (!loaded) return null
  const { subscription, plan } = loaded

  const testsUsedThisMonth = await countTestsStarted(userId)

  const { data: usageRow } = await supabase
    .from('usage_counters').select('count')
    .eq('agent_id', userId).eq('counter_key', 'practice')
    .eq('period_type', 'day').eq('period_key', todayKey())
    .maybeSingle()

  return {
    plan,
    subscription,
    practiceUsedToday: (usageRow as unknown as { count: number } | null)?.count ?? 0,
    testsUsedThisMonth,
  }
}

export async function checkAndConsumeQuota(userId: string, action: QuotaAction): Promise<QuotaCheckResult> {
  const supabase = await createServerSupabaseClient()
  const loaded = await loadSubscriptionAndPlan(supabase, userId)
  if (!loaded) return { allowed: false, reason: 'no_subscription' }
  const { plan } = loaded

  if (action === 'practice') {
    const limit = plan.practice_daily_limit
    if (limit == null) return { allowed: true }

    // Atomic check-and-increment via the security-definer RPC — always
    // increments, then we compare the returned count against the limit.
    // A blocked call still bumps the counter, which is fine: it's a soft
    // rate limit, not a ledger that needs to stay exact at the boundary.
    const { data: count, error } = await supabase.rpc('increment_usage_counter', {
      p_agent_id: userId,
      p_counter_key: 'practice',
      p_period_type: 'day',
      p_period_key: todayKey(),
      p_increment: 1,
    } as never)
    if (error || count == null) return { allowed: false, reason: 'no_subscription' }
    if ((count as number) > limit) return { allowed: false, reason: 'quota_exceeded', limit, plan: plan.slug }
    return { allowed: true }
  }

  // 'test' — counted from attempts started this month, not tests
  // finished: a started test has already shown its questions, so walking
  // away from it must still use up the quota. Checked before the attempt
  // row is created; a race between two tabs is stopped by the one-active-
  // attempt index instead.
  const limit = plan.tests_monthly_limit
  if (limit == null) return { allowed: true }

  const count = await countTestsStarted(userId)
  if (count >= limit) return { allowed: false, reason: 'quota_exceeded', limit, plan: plan.slug }
  return { allowed: true }
}

// Attempts are read with the service role: active attempts are hidden from
// the agent's own client so their question order stays private.
async function countTestsStarted(userId: string): Promise<number> {
  const admin = createAdminClient()
  const { count, error } = await admin
    .from('operation_attempts' as never)
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', userId)
    .gte('started_at', monthStart())
  if (error) throw new Error(`countTestsStarted: ${error.message}`)
  return count ?? 0
}
