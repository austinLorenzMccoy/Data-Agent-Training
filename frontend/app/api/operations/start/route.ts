import { checkAndConsumeQuota } from '@/lib/entitlements'
import { startAttempt } from '@/lib/server/attempts'
import { supabaseAttemptStore } from '@/lib/server/attempt-store'
import { currentUser, errorResponse, readJson, unauthorized } from '@/lib/server/http'
import { rateLimit, tooMany } from '@/lib/server/rate-limit'
import { examByToken, joinExam, toExamConfig } from '@/lib/server/orgs'

// Starts (or resumes) a timed test. The server draws the questions, fixes
// their order and option shuffle, and sets the deadline; the browser only
// ever receives the questions without their answers.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const limited = await rateLimit('testStart', user.id)
  if (!limited.ok) return tooMany(limited.retryAfter)

  const body = await readJson(req)
  if (!body || (typeof body.track !== 'string' && typeof body.examToken !== 'string')) {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  try {
    // An organisation exam is reached by its invite token; the exam fixes
    // the track, length, timer and attempts, and the organisation pays.
    let orgExam
    if (typeof body.examToken === 'string') {
      const exam = await examByToken(body.examToken)
      if (!exam) return Response.json({ error: 'not_found' }, { status: 404 })
      await joinExam(exam.id, user)
      orgExam = toExamConfig(exam)
    }

    const attempt = await startAttempt({
      store: supabaseAttemptStore(),
      agentId: user.id,
      track: typeof body.track === 'string' ? body.track : '',
      orgExam,
      checkQuota: () => checkAndConsumeQuota(user.id, 'test'),
    })
    return Response.json(attempt, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return errorResponse(err, 'operations/start')
  }
}
