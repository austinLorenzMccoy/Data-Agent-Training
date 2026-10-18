import { getEnabledTypes } from '@/lib/feature-flags'
import { toPublicQuestion } from '@/lib/exam/sanitize'
import { drawPractice, ensureBank } from '@/lib/server/bank'
import { ipKey, rateLimit, tooMany } from '@/lib/server/rate-limit'

const PRACTICE_SET = 8

// A practice set without answers. Questions reserved for timed tests are
// never served here.
export async function GET(req: Request) {
  const limited = await rateLimit('practiceCheck', `q:${ipKey(req)}`)
  if (!limited.ok) return tooMany(limited.retryAfter)

  const type = new URL(req.url).searchParams.get('type') ?? ''
  if (!(getEnabledTypes() as string[]).includes(type)) {
    return Response.json({ error: 'unknown_track' }, { status: 400 })
  }
  await ensureBank()
  const questions = drawPractice(type as never, PRACTICE_SET).map((q) => toPublicQuestion(q))
  return Response.json({ questions }, { headers: { 'Cache-Control': 'no-store' } })
}
