import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { initializeTransaction, isPaystackConfigured } from '@/lib/paystack'

const VERIFICATION_AMOUNT_KOBO = Number(process.env.PAYSTACK_TRIAL_VERIFICATION_AMOUNT_KOBO ?? 10000)

export async function POST(request: NextRequest) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: 'Paystack is not configured' }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { planSlug } = await request.json()
  if (planSlug !== 'pro' && planSlug !== 'elite') {
    return NextResponse.json({ error: 'invalid plan' }, { status: 400 })
  }

  const { data: plan, error: planError } = await supabase
    .from('billing_plans').select('*').eq('slug', planSlug).single()
  if (planError || !plan) {
    return NextResponse.json({ error: 'plan not found' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const reference = `dna_verify_${user.id}_${Date.now()}`

  const result = await initializeTransaction({
    email: user.email,
    // A small card-verification charge, not the plan price — the plan
    // price is only ever charged by the subscription Paystack schedules
    // for us, 7 days out. See lib/paystack.ts for the full trial design.
    amountKobo: VERIFICATION_AMOUNT_KOBO,
    reference,
    callbackUrl: `${siteUrl}/subscriptions/callback`,
    metadata: { purpose: 'card_verification', planSlug, agentId: user.id },
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.reason === 'not_configured' ? 'Paystack is not configured' : result.message }, { status: 502 })
  }

  return NextResponse.json({ authorization_url: result.data.authorization_url })
}
