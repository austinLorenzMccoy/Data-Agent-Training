import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser, unauthorized } from '@/lib/server/http'
import { rateLimit, tooMany } from '@/lib/server/rate-limit'
import { alert } from '@/lib/server/alert'
import { methodDestinations } from '@/lib/server/manual-pay-config'
import { MANUAL_METHODS, MAX_PROOF_BYTES, PROOF_TYPES, formatUsd, type ManualMethod } from '@/lib/manual-payments'

const MAX_PENDING = 3

// A learner's own manual payments, newest first, for the billing page.
export async function GET() {
  const user = await currentUser()
  if (!user) return unauthorized()
  const { data } = await createAdminClient()
    .from('manual_payments' as never)
    .select('id, method, amount_cents, reference, status, review_note, period_end, created_at, billing_plans(label)')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  return Response.json({ payments: data ?? [] })
}

// Submit proof of an Airtm, Binance Pay or Grey payment for admin review.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const limited = await rateLimit('manualPayment', user.id)
  if (!limited.ok) return tooMany(limited.retryAfter)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }
  const method = String(form.get('method') ?? '') as ManualMethod
  const planSlug = String(form.get('plan') ?? '')
  const reference = String(form.get('reference') ?? '').trim()
  const proof = form.get('proof')

  if (!MANUAL_METHODS.includes(method) || !methodDestinations()[method]) {
    return Response.json({ error: 'method_unavailable' }, { status: 400 })
  }
  if (reference.length < 3 || reference.length > 120) {
    return Response.json({ error: 'reference_required' }, { status: 400 })
  }
  if (!(proof instanceof File) || proof.size === 0) {
    return Response.json({ error: 'proof_required' }, { status: 400 })
  }
  if (proof.size > MAX_PROOF_BYTES || !PROOF_TYPES.includes(proof.type)) {
    return Response.json({ error: 'proof_invalid' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: planRow } = await admin
    .from('billing_plans')
    .select('id, label, price_usd_cents, is_paid')
    .eq('slug', planSlug)
    .maybeSingle()
  const plan = planRow as unknown as { id: number; label: string; price_usd_cents: number | null; is_paid: boolean } | null
  if (!plan || !plan.is_paid || !plan.price_usd_cents) {
    return Response.json({ error: 'plan_unavailable' }, { status: 400 })
  }

  const { count } = await admin
    .from('manual_payments' as never)
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', user.id)
    .eq('status', 'pending')
  if ((count ?? 0) >= MAX_PENDING) {
    return Response.json({ error: 'too_many_pending' }, { status: 409 })
  }

  const ext = proof.type === 'image/png' ? 'png' : proof.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/${randomUUID()}.${ext}`
  const { error: uploadError } = await admin.storage
    .from('payment-proofs')
    .upload(path, Buffer.from(await proof.arrayBuffer()), { contentType: proof.type })
  if (uploadError) {
    await alert('error', 'Manual payment proof upload failed', { message: uploadError.message })
    return Response.json({ error: 'server_error' }, { status: 500 })
  }

  const { error } = await admin.from('manual_payments' as never).insert({
    agent_id: user.id,
    plan_id: plan.id,
    method,
    amount_cents: plan.price_usd_cents,
    reference,
    proof_path: path,
  } as never)
  if (error) {
    await admin.storage.from('payment-proofs').remove([path])
    const duplicate = error.message.includes('idx_manual_payments_reference')
    return Response.json({ error: duplicate ? 'duplicate_reference' : 'server_error' }, { status: duplicate ? 409 : 500 })
  }

  await alert('warning', 'New manual payment to review', {
    method,
    plan: plan.label,
    amount: formatUsd(plan.price_usd_cents),
    review: '/admin/payments',
  })
  return Response.json({ ok: true })
}
