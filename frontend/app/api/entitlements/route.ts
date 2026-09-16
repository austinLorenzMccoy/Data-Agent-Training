import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getEntitlements } from '@/lib/entitlements'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const entitlements = await getEntitlements(user.id)
  if (!entitlements) {
    return NextResponse.json({ error: 'no subscription on file' }, { status: 404 })
  }

  return NextResponse.json({
    plan: {
      slug: entitlements.plan.slug,
      label: entitlements.plan.label,
      isPaid: entitlements.plan.is_paid,
      practiceDailyLimit: entitlements.plan.practice_daily_limit,
      testsMonthlyLimit: entitlements.plan.tests_monthly_limit,
    },
    status: entitlements.subscription.status,
    cancelAtPeriodEnd: entitlements.subscription.cancel_at_period_end,
    currentPeriodEnd: entitlements.subscription.current_period_end,
    trialEndsAt: entitlements.subscription.trial_ends_at,
    practiceUsedToday: entitlements.practiceUsedToday,
    testsUsedThisMonth: entitlements.testsUsedThisMonth,
  })
}
