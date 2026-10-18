import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, ClipboardCheck, Users, Webhook } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { ActionButton, AddMemberForm, CopyButton, CreateExamForm, WebhookForm } from '@/components/org/forms'
import { createAdminClient } from '@/lib/supabase/server'
import { getEnabledTypes } from '@/lib/feature-flags'
import { TYPE_NAMES } from '@/lib/scoring'
import { currentUser } from '@/lib/server/http'
import { canManage, getOrg, roleIn, type OrgExamRow } from '@/lib/server/orgs'
import { siteOrigin } from '@/lib/server/site-url'
import { addMember, createExam, removeMember, rotateApiKey, rotateWebhookSecret, saveWebhook, sendTestWebhook } from '../actions'

export const dynamic = 'force-dynamic'

export default async function OrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const user = await currentUser()
  if (!user) redirect(`/login?next=/org/${orgId}`)
  const role = await roleIn(orgId, user.id)
  if (!role) notFound()
  const org = (await getOrg(orgId))!
  const manager = canManage(role)
  const admin = createAdminClient()
  const origin = await siteOrigin()

  const [{ data: examsData }, { data: membersData }, { data: attemptsData }, { data: deliveriesData }] = await Promise.all([
    admin.from('org_exams' as never).select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
    admin.from('org_members' as never).select('agent_id, role, agents(alias)').eq('org_id', orgId),
    admin
      .from('operation_attempts' as never)
      .select('org_exam_id, status, org_exams!inner(org_id), operations:operation_id(iq_score, passed)')
      .eq('org_exams.org_id', orgId),
    admin
      .from('webhook_deliveries' as never)
      .select('id, event, status, tries, last_status, last_error, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(8),
  ])
  const exams = (examsData as unknown as OrgExamRow[]) ?? []
  const members = (membersData as unknown as { agent_id: string; role: string; agents: { alias: string } | null }[]) ?? []
  const attempts =
    (attemptsData as unknown as { org_exam_id: string; status: string; operations: { iq_score: number; passed: boolean } | null }[]) ?? []
  const deliveries =
    (deliveriesData as unknown as { id: string; event: string; status: string; tries: number; last_status: number | null; last_error: string | null; created_at: string }[]) ?? []

  function stats(examId: string) {
    const done = attempts.filter((a) => a.org_exam_id === examId && a.operations)
    const passed = done.filter((a) => a.operations!.passed).length
    const avg = done.length ? Math.round(done.reduce((s, a) => s + a.operations!.iq_score, 0) / done.length) : null
    return { done: done.length, passed, avg }
  }

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Organisation" title={org.name} aside={
        <Link href={`/org/${orgId}/review`} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm text-ink-foreground hover:bg-white/10">
          <ClipboardCheck className="size-4" /> Review AI grades
        </Link>
      }>
        You are {role === 'owner' ? 'the owner' : `a ${role}`} of this organisation.
      </PageHero>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
        <section aria-labelledby="exams-heading">
          <h2 id="exams-heading" className="font-heading text-3xl font-medium">Exams</h2>
          {exams.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No exams yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {exams.map((e) => {
                const s = stats(e.id)
                const link = `${origin}/exam/${e.invite_token}`
                return (
                  <li key={e.id} className="rounded-2xl border border-border bg-surface-raised p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {e.title} {e.archived && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">archived</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {TYPE_NAMES[e.track]} · {e.question_count} questions · {e.minutes} min · {e.max_attempts} attempt
                          {e.max_attempts === 1 ? '' : 's'}
                        </p>
                        <p className="mt-1 text-sm">
                          {s.done} finished · {s.passed} passed{s.avg !== null && ` · average ${s.avg}%`}
                        </p>
                      </div>
                      <Link href={`/org/${orgId}/exams/${e.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        Results <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                    {!e.archived && (
                      <div className="mt-3 flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs">{link}</code>
                        <CopyButton value={link} label="Copy invite link" />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {manager && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-heading text-xl font-medium">New exam</h3>
              <div className="mt-4">
                <CreateExamForm action={createExam.bind(null, orgId)} tracks={getEnabledTypes()} />
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="members-heading">
          <h2 id="members-heading" className="flex items-center gap-2 font-heading text-3xl font-medium">
            <Users className="size-6 text-primary" /> People
          </h2>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface-raised">
            {members.map((m) => (
              <li key={m.agent_id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  {m.agents?.alias ?? 'Member'} <span className="ml-2 text-xs capitalize text-muted-foreground">{m.role}</span>
                </span>
                {manager && m.role !== 'owner' && m.agent_id !== user.id && (
                  <form action={removeMember.bind(null, orgId, m.agent_id)}>
                    <button type="submit" className="text-xs text-danger hover:underline">
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {manager && (
            <div className="mt-4">
              <AddMemberForm action={addMember.bind(null, orgId)} />
            </div>
          )}
        </section>

        {manager && (
          <section aria-labelledby="integrations-heading">
            <h2 id="integrations-heading" className="flex items-center gap-2 font-heading text-3xl font-medium">
              <Webhook className="size-6 text-primary" /> Send results to your system
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-medium">Webhook</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We POST each finished exam as JSON, signed with your secret in the <code>Datanerds-Signature</code> header
                  (<code>t=…,v1=HMAC-SHA256(secret, &quot;t.body&quot;)</code>). Failed deliveries retry for about a day.
                </p>
                <div className="mt-4">
                  <WebhookForm action={saveWebhook.bind(null, orgId)} current={org.webhook_url} />
                </div>
                {org.webhook_url && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionButton action={sendTestWebhook.bind(null, orgId)}>Send a test</ActionButton>
                    <ActionButton action={rotateWebhookSecret.bind(null, orgId)}>New signing secret</ActionButton>
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-medium">Results API</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <code>GET {origin}/api/v1/results?exam_id=…</code> with <code>Authorization: Bearer &lt;key&gt;</code>.
                  {org.api_key_prefix && (
                    <>
                      {' '}
                      Current key starts <code>{org.api_key_prefix}…</code>
                    </>
                  )}
                </p>
                <div className="mt-4">
                  <ActionButton action={rotateApiKey.bind(null, orgId)}>
                    {org.api_key_prefix ? 'Replace API key' : 'Create API key'}
                  </ActionButton>
                </div>
              </div>
            </div>

            {deliveries.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-[32rem] text-sm">
                  <caption className="px-4 pt-3 text-left text-xs text-muted-foreground">Recent deliveries</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">When</th>
                      <th className="px-4 py-2 font-medium">Event</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Tries</th>
                      <th className="px-4 py-2 font-medium">Last response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deliveries.map((d) => (
                      <tr key={d.id}>
                        <td className="px-4 py-2">{new Date(d.created_at).toLocaleString('en-GB')}</td>
                        <td className="px-4 py-2 font-mono text-xs">{d.event}</td>
                        <td className={'px-4 py-2 ' + (d.status === 'delivered' ? 'text-success' : d.status === 'failed' ? 'text-danger' : 'text-xp')}>
                          {d.status}
                        </td>
                        <td className="px-4 py-2">{d.tries}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{d.last_error ?? d.last_status ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
