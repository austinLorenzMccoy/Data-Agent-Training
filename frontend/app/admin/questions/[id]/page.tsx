import { notFound, redirect } from 'next/navigation'
import { QuestionEditor } from '@/components/admin/question-editor'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'
import { ensureBank, questionById } from '@/lib/server/bank'
import { getQuestionBank } from '@/lib/questions'
import { ALL_ASSIGNMENT_TYPES } from '@/lib/scoring'
import { TEMPLATES } from '@/lib/exam/validate'

export const dynamic = 'force-dynamic'

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/login?next=/admin/questions')
  if (!isPlatformAdmin(user)) notFound()
  const { id } = await params
  await ensureBank(true)

  if (id === 'new') {
    const type = (await searchParams).type ?? 'alpha'
    const template = TEMPLATES[type] ?? { type }
    return <QuestionEditor initial={JSON.stringify({ id: `${type}_new_001`, ...template }, null, 2)} isNew builtIn={false} status={null} />
  }

  // Drafts are not in the live bank; read them straight from the table.
  const { data } = await createAdminClient().from('bank_questions' as never).select('data, status').eq('id', id).maybeSingle()
  const row = data as unknown as { data: unknown; status: 'draft' | 'live' | 'retired' } | null
  const question = row?.data ?? questionById(id)
  if (!question) notFound()
  const builtIn = getQuestionBank(ALL_ASSIGNMENT_TYPES).some((q) => q.id === id)

  return <QuestionEditor initial={JSON.stringify(question, null, 2)} isNew={false} builtIn={builtIn} status={row?.status ?? null} />
}
