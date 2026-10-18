import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Download, ShieldAlert } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { CopyButton } from '@/components/org/forms'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/server'
import { PASS_THRESHOLD, TYPE_NAMES } from '@/lib/scoring'
import { currentUser } from '@/lib/server/http'
import { canManage, examResults, roleIn, type OrgExamRow } from '@/lib/server/orgs'
import { siteOrigin } from '@/lib/server/site-url'
import { rotateInvite, setExamArchived } from '../../../actions'

export const dynamic = 'force-dynamic'

function fmtTime(sec: number | null) {
  if (sec === null) return '—'
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`
}

export default async function ExamResultsPage({ params }: { params: Promise<{ orgId: string; examId: string }> }) {
  const { orgId, examId } = await params
  const user = await currentUser()
  if (!user) redirect(`/login?next=/org/${orgId}/exams/${examId}`)
  const role = await roleIn(orgId, user.id)
  if (!role) notFound()

  const admin = createAdminClient()
  const { data } = await admin.from('org_exams' as never).select('*').eq('id', examId).eq('org_id', orgId).maybeSingle()
  const exam = data as unknown as OrgExamRow | null
  if (!exam) notFound()
  const results = await examResults(examId, admin)
  const link = `${(await siteOrigin())}/exam/${exam.invite_token}`
  const manager = canManage(role)

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow={`${TYPE_NAMES[exam.track]} · ${exam.question_count} questions · ${exam.minutes} min`} title={exam.title}>
        {results.length} candidate{results.length === 1 ? '' : 's'} opened the link. Pass mark {PASS_THRESHOLD}%.
      </PageHero>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/org/${orgId}`} className="text-sm text-primary hover:underline">
            ← All exams
          </Link>
          <span className="flex-1" />
          <Button asChild variant="outline" size="sm">
            <a href={`/api/orgs/${orgId}/exams/${examId}/csv`}>
              <Download className="size-3.5" /> Download CSV
            </a>
          </Button>
          {!exam.archived && <CopyButton value={link} label="Copy invite link" />}
          {manager && (
            <>
              <form action={rotateInvite.bind(null, orgId, examId)}>
                <Button type="submit" variant="outline" size="sm">
                  New invite link
                </Button>
              </form>
              <form action={setExamArchived.bind(null, orgId, examId, !exam.archived)}>
                <Button type="submit" variant="outline" size="sm">
                  {exam.archived ? 'Reopen' : 'Close exam'}
                </Button>
              </form>
            </>
          )}
        </div>

        {results.length === 0 ? (
          <p className="mt-10 text-muted-foreground">Nobody has opened the invite link yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface-raised">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                  <th className="px-4 py-3 text-right font-medium">Correct</th>
                  <th className="px-4 py-3 text-right font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Integrity</th>
                  <th className="px-4 py-3 font-medium">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.flatMap((c) => {
                  const rows = c.attempts.length ? c.attempts : [null]
                  return rows.map((a, i) => (
                    <tr key={`${c.agent_id}-${i}`}>
                      <td className="px-4 py-3">
                        {i === 0 && (
                          <>
                            <span className="block font-medium">{c.name ?? 'Unnamed'}</span>
                            <span className="text-xs text-muted-foreground">{c.email}</span>
                          </>
                        )}
                        {i > 0 && <span className="text-xs text-muted-foreground">attempt {i + 1}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {!a ? 'Not started' : a.status === 'active' ? 'In progress' : a.passed ? (
                          <span className="text-success">Passed</span>
                        ) : (
                          <span className="text-danger">Below pass</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{a?.score ?? '—'}{a?.score != null && '%'}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {a?.questions_total ? `${a.questions_correct}/${a.questions_total}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{fmtTime(a?.time_taken_seconds ?? null)}</td>
                      <td className="px-4 py-3">
                        {a?.integrity_verified === false ? (
                          <span className="flex items-start gap-1 text-xs text-xp" title={a.integrity_reasons.join('\n')}>
                            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                            {a.integrity_reasons[0] ?? 'Flagged'}
                          </span>
                        ) : a?.integrity_verified ? (
                          <span className="text-xs text-success">Clean</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {a?.finished_at ? new Date(a.finished_at).toLocaleString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
