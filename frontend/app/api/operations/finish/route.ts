import { finishAttempt } from '@/lib/server/attempts'
import { supabaseAttemptStore } from '@/lib/server/attempt-store'
import { currentUser, errorResponse, readJson, unauthorized } from '@/lib/server/http'

// Scores a test from the answers the server stored and writes the result.
// Safe to call twice; the second call returns the first result.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const body = await readJson(req)
  if (!body || typeof body.attemptId !== 'string') {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  try {
    const out = await finishAttempt({
      store: supabaseAttemptStore(),
      agentId: user.id,
      attemptId: body.attemptId,
      integrity: body.integrity ?? null,
    })
    return Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return errorResponse(err, 'operations/finish')
  }
}
