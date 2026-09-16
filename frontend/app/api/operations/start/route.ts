import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAndConsumeQuota } from '@/lib/entitlements'

// Gates entry into a timed test. Checked here, before the test starts,
// because the monthly quota is derived from completed `operations` rows —
// there's no way to "un-count" a test after a user has already sat it.
export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const quota = await checkAndConsumeQuota(user.id, 'test')
  if (!quota.allowed) {
    return NextResponse.json({ error: 'quota_exceeded', ...quota }, { status: 402 })
  }

  return NextResponse.json({ ok: true })
}
