import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'
import { allQuestionsForAdmin, ensureBank, isExamOnly } from '@/lib/server/bank'
import { ALL_ASSIGNMENT_TYPES, TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'

export const dynamic = 'force-dynamic'

const TARGET = 60

export default async function AdminQuestionsPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/login?next=/admin/questions')
  if (!isPlatformAdmin(user)) notFound()
  const { type, q } = await searchParams
  await ensureBank(true)

  const all = allQuestionsForAdmin()
  const counts = Object.fromEntries(
    ALL_ASSIGNMENT_TYPES.map((t) => [t, all.filter((r) => r.question.type === t && r.status === 'live').length]),
  ) as Record<AssignmentType, number>
  const needle = q?.toLowerCase().trim()
  const rows = all
    .filter((r) => !type || r.question.type === type)
    .filter(
      (r) =>
        !needle ||
        r.question.id.includes(needle) ||
        r.question.operationContext.toLowerCase().includes(needle) ||
        r.question.prompt.toLowerCase().includes(needle),
    )
    .sort((a, b) => a.question.id.localeCompare(b.question.id))

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Admin" title="Question" accent="bank.">
        Add, edit and retire questions without a deploy. Target: {TARGET} live questions per task type.
      </PageHero>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ALL_ASSIGNMENT_TYPES.map((t) => (
            <Link
              key={t}
              href={`/admin/questions?type=${t}`}
              aria-current={type === t ? 'page' : undefined}
              className={'rounded-xl border p-3 text-sm ' + (type === t ? 'border-primary' : 'border-border hover:border-primary/50')}
            >
              <span className="block truncate">{TYPE_NAMES[t]}</span>
              <span className={'font-mono text-lg ' + (counts[t] >= TARGET ? 'text-success' : 'text-xp')}>
                {counts[t]}
                <span className="text-xs text-muted-foreground">/{TARGET}</span>
              </span>
            </Link>
          ))}
        </div>

        <form className="mt-6 flex flex-wrap items-end gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          <label className="flex-1">
            <span className="sr-only">Search</span>
            <input name="q" defaultValue={q} placeholder="Search id, context or prompt" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <button className="rounded-md border border-border px-3 py-2 text-sm">Search</button>
          <Link href="/admin/questions" className="px-2 py-2 text-sm text-muted-foreground">
            Clear
          </Link>
          <Link
            href={`/admin/questions/new?type=${type ?? 'alpha'}`}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            New question
          </Link>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface-raised">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Id</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Context</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Pool</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ question, source, status }) => (
                <tr key={question.id} className={status === 'retired' ? 'opacity-50' : undefined}>
                  <td className="px-4 py-2 font-mono text-xs">
                    <Link href={`/admin/questions/${question.id}`} className="text-primary hover:underline">
                      {question.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{TYPE_NAMES[question.type]}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-muted-foreground">{question.operationContext}</td>
                  <td className="px-4 py-2 text-xs">{status === 'retired' ? 'retired' : source}</td>
                  <td className="px-4 py-2 text-xs">{status === 'retired' ? '—' : isExamOnly(question) ? 'tests only' : 'practice + tests'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
