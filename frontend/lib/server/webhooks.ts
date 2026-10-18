import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { alert } from './alert'

// Results webhooks for organisations. Each finished exam attempt becomes a
// delivery row; it is sent at once and retried with backoff from the cron
// route until it succeeds or runs out of tries.
//
// Signature (same scheme as Stripe): header
//   Datanerds-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<body>")>
// Receivers should recompute v1 and reject timestamps older than 5 minutes.

export const MAX_TRIES = 8
const TIMEOUT_MS = 5000

export interface ResultPayload {
  event: 'exam.completed' | 'exam.rescored' | 'test.ping'
  id: string
  created_at: string
  data: Record<string, unknown>
}

export function newWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`
}

export function signPayload(secret: string, body: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  return `t=${timestamp},v1=${v1}`
}

/** Reference verifier — what a receiver should do. Used in tests and docs. */
export function verifySignature(secret: string, body: string, header: string, toleranceSec = 300, now = Date.now()): boolean {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const t = Number(parts.t)
  if (!Number.isFinite(t) || !parts.v1) return false
  if (Math.abs(now / 1000 - t) > toleranceSec) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${body}`).digest('hex'), 'hex')
  const got = Buffer.from(parts.v1, 'hex')
  return expected.length === got.length && timingSafeEqual(expected, got)
}

/** Minutes until the next try: 1, 4, 9, 16 … capped at 6 hours. */
export function backoffMinutes(tries: number): number {
  return Math.min(360, tries * tries)
}

/** Reject webhook targets that would make the server call itself or a private network. */
export function isAllowedWebhookUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false
  if (host.startsWith('[') || host === '::1') return false
  return true
}

interface DeliveryRow {
  id: string
  org_id: string
  url: string
  payload: ResultPayload
  tries: number
}

type Admin = ReturnType<typeof createAdminClient>

async function secretFor(admin: Admin, orgId: string): Promise<string | null> {
  const { data } = await admin.from('organisations' as never).select('webhook_secret').eq('id', orgId).maybeSingle()
  return (data as unknown as { webhook_secret: string | null } | null)?.webhook_secret ?? null
}

/** Send one delivery and record the outcome. Returns true when the receiver answered 2xx. */
export async function attemptDelivery(delivery: DeliveryRow, admin: Admin = createAdminClient()): Promise<boolean> {
  const secret = await secretFor(admin, delivery.org_id)
  const body = JSON.stringify(delivery.payload)
  const tries = delivery.tries + 1
  let status: number | null = null
  let error: string | null = null

  if (!secret || !isAllowedWebhookUrl(delivery.url)) {
    error = !secret ? 'no webhook secret' : 'url not allowed'
  } else {
    try {
      const res = await fetch(delivery.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Datanerds-Webhooks/1',
          'Datanerds-Event': delivery.payload.event,
          'Datanerds-Delivery': delivery.id,
          'Datanerds-Signature': signPayload(secret, body),
        },
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      status = res.status
      if (!res.ok) error = `HTTP ${res.status}`
    } catch (err) {
      error = (err as Error).message.slice(0, 300)
    }
  }

  const delivered = error === null
  const giveUp = !delivered && tries >= MAX_TRIES
  await admin
    .from('webhook_deliveries' as never)
    .update({
      tries,
      status: delivered ? 'delivered' : giveUp ? 'failed' : 'pending',
      last_status: status,
      last_error: error,
      delivered_at: delivered ? new Date().toISOString() : null,
      next_try_at: new Date(Date.now() + backoffMinutes(tries) * 60_000).toISOString(),
    } as never)
    .eq('id', delivery.id)

  if (giveUp) {
    await alert('error', 'Results webhook gave up', { deliveryId: delivery.id, orgId: delivery.org_id, error })
  }
  return delivered
}

/** Queue a payload for an organisation (no-op without a webhook URL) and try it once now. */
export async function enqueue(orgId: string, payload: ResultPayload, attemptId: string | null, admin: Admin = createAdminClient()) {
  const { data: org } = await admin.from('organisations' as never).select('webhook_url').eq('id', orgId).maybeSingle()
  const url = (org as unknown as { webhook_url: string | null } | null)?.webhook_url
  if (!url) return
  const { data, error } = await admin
    .from('webhook_deliveries' as never)
    .insert({ org_id: orgId, event: payload.event, attempt_id: attemptId, url, payload } as never)
    .select('id, org_id, url, payload, tries')
    .single()
  if (error || !data) {
    await alert('error', 'Could not queue results webhook', { orgId, message: error?.message })
    return
  }
  await attemptDelivery(data as unknown as DeliveryRow, admin)
}

/** Retry due deliveries. Called by the cron route. */
export async function processDue(limit = 25, admin: Admin = createAdminClient()): Promise<{ tried: number; delivered: number }> {
  const { data } = await admin
    .from('webhook_deliveries' as never)
    .select('id, org_id, url, payload, tries')
    .eq('status', 'pending')
    .lte('next_try_at', new Date().toISOString())
    .order('next_try_at')
    .limit(limit)
  const rows = (data as unknown as DeliveryRow[]) ?? []
  let delivered = 0
  for (const row of rows) if (await attemptDelivery(row, admin)) delivered++
  return { tried: rows.length, delivered }
}

export interface ResultFacts {
  attemptId: string
  operationId: string
  orgExam: { id: string; title: string; track: string }
  candidate: { id: string; name: string | null; email: string | null }
  score: number
  passed: boolean
  questionsTotal: number
  questionsCorrect: number
  timeTakenSeconds: number | null
  integrity: { verified: boolean; reasons: string[] } | null
  completedAt: string
}

export function resultPayload(event: 'exam.completed' | 'exam.rescored', f: ResultFacts): ResultPayload {
  return {
    event,
    id: `evt_${randomBytes(12).toString('hex')}`,
    created_at: new Date().toISOString(),
    data: {
      attempt_id: f.attemptId,
      result_id: f.operationId,
      exam: f.orgExam,
      candidate: f.candidate,
      score: f.score,
      passed: f.passed,
      questions_total: f.questionsTotal,
      questions_correct: f.questionsCorrect,
      time_taken_seconds: f.timeTakenSeconds,
      integrity: f.integrity,
      completed_at: f.completedAt,
    },
  }
}
