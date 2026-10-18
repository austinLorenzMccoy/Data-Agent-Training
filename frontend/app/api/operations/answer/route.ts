import { answerAttempt } from '@/lib/server/attempts'
import { supabaseAttemptStore } from '@/lib/server/attempt-store'
import { currentUser, errorResponse, readJson, unauthorized } from '@/lib/server/http'
import { rateLimit, tooMany } from '@/lib/server/rate-limit'

export const maxDuration = 30

// Records one answer of an active test. Says nothing about correctness.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const limited = await rateLimit('testAnswer', user.id)
  if (!limited.ok) return tooMany(limited.retryAfter)

  const body = await readJson(req)
  if (!body || typeof body.attemptId !== 'string' || typeof body.index !== 'number') {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  try {
    const out = await answerAttempt({
      store: supabaseAttemptStore(),
      agentId: user.id,
      attemptId: body.attemptId,
      index: body.index,
      selection: body.selection,
      justification: typeof body.justification === 'string' ? body.justification : undefined,
    })
    return Response.json(out)
  } catch (err) {
    return errorResponse(err, 'operations/answer')
  }
}
