import { notFound, redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { GradeReviewList, type ReviewRow } from '@/components/org/grade-review'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'

export const dynamic = 'force-dynamic'

// Platform-wide grade review for learner disputes and injection flags.
export default async function AdminReviewPage({ searchParams }: { searchParams: Promise<{ flagged?: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/login?next=/admin/review')
  if (!isPlatformAdmin(user)) notFound()
  const flagged = (await searchParams).flagged === '1'

  let q = createAdminClient()
    .from('grading_log' as never)
    .select('*, agents(alias), operation_attempts(questions, answers)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (flagged) q = q.eq('flagged_injection', true)
  const { data } = await q

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Admin" title="All" accent="AI grades." />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <GradeReviewList rows={(data as unknown as ReviewRow[]) ?? []} path="/admin/review" />
      </div>
    </main>
  )
}
