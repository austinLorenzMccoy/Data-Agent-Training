import 'server-only'
import { Redis } from '@upstash/redis'

// Fixed-window limits backed by Upstash. With no Upstash env configured
// (local dev, CI) every check passes, so the app still runs.

let redis: Redis | null | undefined

function client(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export const LIMITS = {
  practiceCheck: { max: 120, windowSec: 60 * 10 },
  grade: { max: 40, windowSec: 60 * 10 },
  testStart: { max: 10, windowSec: 60 * 60 },
  testAnswer: { max: 120, windowSec: 60 * 10 },
  proficiency: { max: 10, windowSec: 60 * 60 },
} as const

export type LimitName = keyof typeof LIMITS

export async function rateLimit(name: LimitName, key: string): Promise<{ ok: boolean; retryAfter: number }> {
  const r = client()
  if (!r) return { ok: true, retryAfter: 0 }
  const { max, windowSec } = LIMITS[name]
  const window = Math.floor(Date.now() / 1000 / windowSec)
  const redisKey = `rl:${name}:${key}:${window}`
  try {
    const count = await r.incr(redisKey)
    if (count === 1) await r.expire(redisKey, windowSec)
    const retryAfter = windowSec - (Math.floor(Date.now() / 1000) % windowSec)
    return { ok: count <= max, retryAfter }
  } catch (err) {
    // Fail open: a Redis outage should not lock everyone out of a test.
    console.error('rateLimit:', (err as Error).message)
    return { ok: true, retryAfter: 0 }
  }
}

/** Best-effort client key for anonymous callers. */
export function ipKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim()
}

export function tooMany(retryAfter: number) {
  return Response.json(
    { error: 'rate_limited' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
