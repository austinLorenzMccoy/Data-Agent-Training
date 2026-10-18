import { createAdminClient } from '@/lib/supabase/server'
import { disableSubscription, isPaystackConfigured } from '@/lib/paystack'
import { currentUser, readJson, unauthorized } from '@/lib/server/http'

// Deletes the signed-in account and everything keyed to it. Deleting the
// auth user cascades through agents → operations, attempts, badges,
// subscriptions, usage counters, grades, proficiency results and manual
// payments; payment screenshots are removed from storage first. A paid
// Paystack subscription is disabled first so billing stops.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const body = await readJson(req)
  if (body?.confirm !== 'DELETE') {
    return Response.json({ error: 'confirmation_required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: subRow } = await admin
    .from('subscriptions')
    .select('paystack_subscription_code, paystack_email_token, status')
    .eq('agent_id', user.id)
    .maybeSingle()
  const sub = subRow as unknown as {
    paystack_subscription_code: string | null
    paystack_email_token: string | null
    status: string
  } | null

  if (sub?.paystack_subscription_code && sub.paystack_email_token && sub.status !== 'canceled') {
    if (!isPaystackConfigured()) {
      return Response.json({ error: 'billing_unavailable' }, { status: 503 })
    }
    const result = await disableSubscription({
      subscriptionCode: sub.paystack_subscription_code,
      emailToken: sub.paystack_email_token,
    })
    if (!result.ok) {
      // Refuse rather than delete an account that would keep being charged.
      return Response.json({ error: 'billing_cancel_failed' }, { status: 502 })
    }
  }

  // Payment screenshots live in storage, outside the cascade.
  const { data: proofs } = await admin.storage.from('payment-proofs').list(user.id, { limit: 1000 })
  if (proofs?.length) {
    await admin.storage.from('payment-proofs').remove(proofs.map((f) => `${user.id}/${f.name}`))
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('account/delete:', error.message)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
