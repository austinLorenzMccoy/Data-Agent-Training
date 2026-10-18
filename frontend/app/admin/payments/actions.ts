'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'
import { newPeriodEnd } from '@/lib/manual-payments'

async function requireAdmin() {
  const user = await currentUser()
  if (!user || !isPlatformAdmin(user)) throw new Error('Not allowed')
  return user
}

/** Approve: give the plan for 30 days (added to time left) and mark it to lapse unless paid again. */
export async function approvePayment(id: string) {
  const user = await requireAdmin()
  const admin = createAdminClient()
  const { data } = await admin.from('manual_payments' as never).select('agent_id, plan_id, status').eq('id', id).single()
  const pay = data as unknown as { agent_id: string; plan_id: number; status: string } | null
  if (!pay || pay.status !== 'pending') return

  const { data: subData } = await admin
    .from('subscriptions')
    .select('plan_id, current_period_end, status')
    .eq('agent_id', pay.agent_id)
    .maybeSingle()
  const sub = subData as unknown as { plan_id: number; current_period_end: string | null; status: string } | null
  const now = new Date()
  const end = newPeriodEnd(
    now,
    sub && sub.status !== 'canceled' ? { planId: sub.plan_id, periodEnd: sub.current_period_end } : null,
    pay.plan_id,
  )

  const fields = {
    plan_id: pay.plan_id,
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: true,
    trial_ends_at: null,
  }
  const { error } = sub
    ? await admin.from('subscriptions').update(fields as never).eq('agent_id', pay.agent_id)
    : await admin.from('subscriptions').insert({ agent_id: pay.agent_id, ...fields } as never)
  if (error) throw new Error(`approvePayment: ${error.message}`)

  await admin
    .from('manual_payments' as never)
    .update({ status: 'approved', reviewed_by: user.id, reviewed_at: now.toISOString(), period_end: end.toISOString() } as never)
    .eq('id', id)
  revalidatePath('/admin/payments')
}

export async function rejectPayment(id: string, form: FormData) {
  const user = await requireAdmin()
  const note = String(form.get('note') ?? '').trim().slice(0, 300) || 'Payment could not be confirmed.'
  await createAdminClient()
    .from('manual_payments' as never)
    .update({ status: 'rejected', review_note: note, reviewed_by: user.id, reviewed_at: new Date().toISOString() } as never)
    .eq('id', id)
    .eq('status', 'pending')
  revalidatePath('/admin/payments')
}
