import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'

export const dynamic = 'force-dynamic'

const LINKS = [
  { href: '/admin/questions', title: 'Question bank', body: 'Add, edit and retire questions without a deploy.' },
  { href: '/admin/review', title: 'AI grade review', body: 'Check and change grades of written reasons.' },
  { href: '/admin/payments', title: 'Payments to review', body: 'Approve Airtm, Binance Pay and Grey payments.' },
  { href: '/org', title: 'Organisations', body: 'Create organisation accounts for hiring clients.' },
]

export default async function AdminPage() {
  const user = await currentUser()
  if (!user) redirect('/login?next=/admin')
  if (!isPlatformAdmin(user)) notFound()
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Admin" title="Back" accent="office." />
      <ul className="mx-auto grid max-w-4xl gap-4 px-4 py-12 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block h-full rounded-2xl border border-border bg-surface-raised p-5 hover:border-primary/50">
              <span className="font-medium">{l.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{l.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
