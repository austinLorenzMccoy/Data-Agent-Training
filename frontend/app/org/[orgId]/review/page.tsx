import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { GradeReviewList, type ReviewRow } from '@/components/org/grade-review'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { getOrg, roleIn } from '@/lib/server/orgs'

export const dynamic = 'force-dynamic'

const FILTERS = { unreviewed: 'Not yet reviewed', flagged: 'Flagged', low: 'Scored 0', all: 'All' } as const
type Filter = keyof typeof FILTERS

export default async function OrgReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ filter?: string }>
}) {
  const { orgId } = await params
  const filter = ((await searchParams).filter ?? 'unreviewed') as Filter
  const user = await currentUser()
  if (!user) redirect(`/login?next=/org/${orgId}/review`)
  if (!(await roleIn(orgId, user.id))) notFound()
  const org = (await getOrg(orgId))!

  let q = createAdminClient()
    .from('grading_log' as never)
    .select('*, agents(alias), operation_attempts!inner(questions, answers, org_exams!inner(org_id))')
    .eq('operation_attempts.org_exams.org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (filter === 'unreviewed') q = q.is('override_at', null)
  if (filter === 'flagged') q = q.eq('flagged_injection', true)
  if (filter === 'low') q = q.eq('score', 0)
  const { data } = await q
  const rows = (data as unknown as ReviewRow[]) ?? []
  const path = `/org/${orgId}/review`

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow={org.name} title="Review" accent="AI grades.">
        Written reasons are graded by AI. Check them before a hiring decision; a changed grade rescores the result and
        is sent to your system again.
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <nav aria-label="Filter" className="mb-6 flex flex-wrap gap-2">
          <Link href={`/org/${orgId}`} className="mr-auto text-sm text-primary hover:underline">
            ← Organisation
          </Link>
          {(Object.keys(FILTERS) as Filter[]).map((f) => (
            <Link
              key={f}
              href={`${path}?filter=${f}`}
              aria-current={f === filter ? 'page' : undefined}
              className={
                'rounded-full border px-3 py-1 text-sm ' +
                (f === filter ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50')
              }
            >
              {FILTERS[f]}
            </Link>
          ))}
        </nav>
        <GradeReviewList rows={rows} path={path} />
      </div>
    </main>
  )
}
