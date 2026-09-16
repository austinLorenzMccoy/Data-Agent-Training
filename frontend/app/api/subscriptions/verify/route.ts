import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { verifyTransaction, refundTransaction, createSubscription, isPaystackConfigured } from '@/lib/paystack'
import type { Database } from '@/types/database'

type BillingPlan = Database['public']['Tables']['billing_plans']['Row']

export async function POST(request: NextRequest) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: 'Paystack is not configured' }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { reference } = await request.json()
  if (!reference || typeof reference !== 'string') {
    return NextResponse.json({ error: 'missing reference' }, { status: 400 })
  }

  const verified = await verifyTransaction(reference)
  if (!verified.ok || verified.data.status !== 'success') {
    return NextResponse.json({ error: 'transaction not successful' }, { status: 402 })
  }

  // The reference was initialized for a specific agent (see
  // /api/subscriptions/initialize) — without this check, anyone who
  // obtains another user's reference could verify it while signed in as
  // themselves and walk away with a subscription funded by that other
  // user's card.
  if (verified.data.metadata?.agentId !== user.id) {
    return NextResponse.json({ error: 'reference does not belong to this account' }, { status: 403 })
  }

  const planSlug = String(verified.data.metadata?.planSlug ?? 'pro')
  const { data: planRow } = await supabase
    .from('billing_plans').select('*')
    .eq('slug', planSlug).single()
  // See lib/entitlements.ts — the generated client types collapse to
  // `never` here for reasons unrelated to this feature; cast at the boundary.
  const plan = planRow as unknown as BillingPlan | null

  if (!plan || !plan.paystack_plan_code) {
    return NextResponse.json({ error: 'plan is not set up in Paystack yet — missing paystack_plan_code' }, { status: 500 })
  }

  // Refund the verification charge immediately — its only purpose was to
  // capture a reusable authorization_code so createSubscription() below
  // has a prior successful charge to point at. The trial should be
  // genuinely free.
  await refundTransaction(reference)

  const startDate = new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000).toISOString()

  const subscription = await createSubscription({
    customerCode: verified.data.customer.customer_code,
    planCode: plan.paystack_plan_code,
    authorizationCode: verified.data.authorization.authorization_code,
    startDate,
  })

  if (!subscription.ok) {
    return NextResponse.json({ error: subscription.reason === 'not_configured' ? 'Paystack is not configured' : subscription.message }, { status: 502 })
  }

  const admin = createAdminClient()
  const { error: upsertError } = await admin
    .from('subscriptions')
    .update({
      plan_id: plan.id,
      status: 'trialing',
      paystack_customer_code: verified.data.customer.customer_code,
      paystack_subscription_code: subscription.data.subscription_code,
      paystack_email_token: subscription.data.email_token,
      paystack_authorization_code: verified.data.authorization.authorization_code,
      current_period_start: new Date().toISOString(),
      current_period_end: startDate,
      trial_ends_at: startDate,
      cancel_at_period_end: false,
    } as never)
    .eq('agent_id', user.id)

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: 'trialing', trialEndsAt: startDate })
}
