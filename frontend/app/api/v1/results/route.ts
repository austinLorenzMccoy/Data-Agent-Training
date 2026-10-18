import { createAdminClient } from '@/lib/supabase/server'
import { examResults, orgForApiKey } from '@/lib/server/orgs'
import { rateLimit, tooMany } from '@/lib/server/rate-limit'

export const dynamic = 'force-dynamic'

// Results API for organisations.
//   GET /api/v1/results            → the organisation's exams
//   GET /api/v1/results?exam_id=…  → every candidate and attempt for one exam
// Authorization: Bearer dn_live_…
export async function GET(req: Request) {
  const key = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const orgId = key ? await orgForApiKey(key) : null
  if (!orgId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit('testStart', `api:${orgId}`)
  if (!limited.ok) return tooMany(limited.retryAfter)

  const admin = createAdminClient()
  const examId = new URL(req.url).searchParams.get('exam_id')

  if (!examId) {
    const { data } = await admin
      .from('org_exams' as never)
      .select('id, title, track, question_count, minutes, max_attempts, archived, closes_at, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
    return Response.json({ exams: data ?? [] })
  }

  const { data: exam } = await admin
    .from('org_exams' as never)
    .select('id, title, track')
    .eq('id', examId)
    .eq('org_id', orgId)
    .maybeSingle()
  if (!exam) return Response.json({ error: 'not_found' }, { status: 404 })

  return Response.json({ exam, candidates: await examResults(examId, admin) })
}
