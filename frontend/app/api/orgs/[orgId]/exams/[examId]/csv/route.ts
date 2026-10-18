import { createAdminClient } from '@/lib/supabase/server'
import { currentUser, unauthorized } from '@/lib/server/http'
import { examResults, roleIn } from '@/lib/server/orgs'

function cell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  // Quote, and neutralise spreadsheet formulas in candidate-supplied text.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(_: Request, { params }: { params: Promise<{ orgId: string; examId: string }> }) {
  const { orgId, examId } = await params
  const user = await currentUser()
  if (!user) return unauthorized()
  if (!(await roleIn(orgId, user.id))) return Response.json({ error: 'forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data: exam } = await admin.from('org_exams' as never).select('title').eq('id', examId).eq('org_id', orgId).maybeSingle()
  if (!exam) return Response.json({ error: 'not_found' }, { status: 404 })

  const header = ['name', 'email', 'attempt', 'status', 'score', 'passed', 'correct', 'total', 'seconds', 'integrity', 'integrity_notes', 'started_at', 'finished_at']
  const lines = [header.map(cell).join(',')]
  for (const c of await examResults(examId, admin)) {
    if (c.attempts.length === 0) {
      lines.push([c.name, c.email, '', 'not started', '', '', '', '', '', '', '', '', ''].map(cell).join(','))
    }
    c.attempts.forEach((a, i) => {
      lines.push(
        [
          c.name,
          c.email,
          i + 1,
          a.status,
          a.score,
          a.passed,
          a.questions_correct,
          a.questions_total,
          a.time_taken_seconds,
          a.integrity_verified === null ? '' : a.integrity_verified ? 'clean' : 'flagged',
          a.integrity_reasons.join('; '),
          a.started_at,
          a.finished_at,
        ]
          .map(cell)
          .join(','),
      )
    })
  }

  const title = (exam as unknown as { title: string }).title.replace(/[^\w-]+/g, '-').slice(0, 60)
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${title}-results.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
