import { createAdminClient } from '@/lib/supabase/server'
import { getExam, scoreExam } from '@/lib/server/proficiency'
import { currentUser, readJson, unauthorized } from '@/lib/server/http'
import { rateLimit, tooMany } from '@/lib/server/rate-limit'
import { normalizeReport } from '@/lib/integrity-core'

// Scores the language exam on the server and records the result the
// timed-test gate reads. A pass is never overwritten by a later fail.
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const limited = await rateLimit('proficiency', user.id)
  if (!limited.ok) return tooMany(limited.retryAfter)

  const body = await readJson(req)
  const exam = typeof body?.examId === 'string' ? getExam(body.examId) : undefined
  if (!body || !exam || !body.answers || typeof body.answers !== 'object') {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }

  const { score, passed } = scoreExam(exam, body.answers as Record<string, unknown>)
  const integrity = normalizeReport(body.integrity)
  const admin = createAdminClient()

  const { data: prior } = await admin
    .from('proficiency_results' as never)
    .select('passed, score')
    .eq('agent_id', user.id)
    .eq('exam_id', exam.id)
    .maybeSingle()
  const before = prior as unknown as { passed: boolean; score: number } | null

  if (!before?.passed) {
    const { error } = await admin.from('proficiency_results' as never).upsert(
      { agent_id: user.id, exam_id: exam.id, score, passed, taken_at: new Date().toISOString() } as never,
      { onConflict: 'agent_id,exam_id' },
    )
    if (error) {
      console.error('proficiency/submit:', error.message)
      return Response.json({ error: 'server_error' }, { status: 500 })
    }
  }

  return Response.json({ score, passed, integrity })
}
