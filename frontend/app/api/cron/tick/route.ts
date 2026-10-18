import { createAdminClient } from '@/lib/supabase/server'
import { ANSWER_GRACE_SEC, finishAttempt } from '@/lib/server/attempts'
import { supabaseAttemptStore } from '@/lib/server/attempt-store'
import { processDue } from '@/lib/server/webhooks'
import { alert } from '@/lib/server/alert'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Housekeeping, called every few minutes by the scheduled workflow with
// `Authorization: Bearer $CRON_SECRET`:
//  1. scores attempts whose time ran out with nobody to press Submit, so an
//     organisation still gets a result (and its webhook) for a candidate who
//     closed the tab;
//  2. retries webhook deliveries that are due.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - (ANSWER_GRACE_SEC + 60) * 1000).toISOString()
  const { data } = await admin
    .from('operation_attempts' as never)
    .select('id, agent_id')
    .eq('status', 'active')
    .lt('expires_at', cutoff)
    .limit(50)
  const stale = (data as unknown as { id: string; agent_id: string }[]) ?? []

  const store = supabaseAttemptStore(admin)
  let finished = 0
  for (const a of stale) {
    try {
      await finishAttempt({ store, agentId: a.agent_id, attemptId: a.id, integrity: null })
      finished++
    } catch (err) {
      await alert('error', 'Could not finish an expired attempt', { attemptId: a.id, message: (err as Error).message })
    }
  }

  const webhooks = await processDue(25, admin)
  return Response.json({ finished, webhooks })
}
