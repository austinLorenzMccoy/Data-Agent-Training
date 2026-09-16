import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { disableSubscription, isPaystackConfigured } from '@/lib/paystack'
import type { Database } from '@/types/database'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export async function POST() {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: 'Paystack is not configured' }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: subscriptionRow, error } = await supabase
    .from('subscriptions').select('*').eq('agent_id', user.id).single()
  // See lib/entitlements.ts — the generated client types collapse to
  // `never` here for reasons unrelated to this feature; cast at the boundary.
  const subscription = subscriptionRow as unknown as Subscription | null

  if (error || !subscription?.paystack_subscription_code || !subscription.paystack_email_token) {
    return NextResponse.json({ error: 'no active paid subscription' }, { status: 404 })
  }

  const result = await disableSubscription({
    subscriptionCode: subscription.paystack_subscription_code,
    emailToken: subscription.paystack_email_token,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.reason === 'not_configured' ? 'Paystack is not configured' : result.message }, { status: 502 })
  }

  // Actual downgrade to the free plan happens on the subscription.disable
  // webhook, keeping the webhook the single source of truth for status.
  const admin = createAdminClient()
  await admin
    .from('subscriptions')
    .update({ cancel_at_period_end: true } as never)
    .eq('agent_id', user.id)

  return NextResponse.json({ ok: true })
}
