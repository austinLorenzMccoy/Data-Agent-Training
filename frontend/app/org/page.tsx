import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Building2 } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { CreateOrgForm } from '@/components/org/forms'
import { currentUser } from '@/lib/server/http'
import { canCreateOrg, myOrgs } from '@/lib/server/orgs'
import { createOrg } from './actions'

export const metadata = { title: 'Organisations — Datanerds Annotation' }
export const dynamic = 'force-dynamic'

export default async function OrgIndexPage() {
  const user = await currentUser()
  if (!user) redirect('/login?next=/org')
  const orgs = await myOrgs(user.id)

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="For teams" title="Screen raters" accent="with your own exam.">
        Create an exam, send candidates the link, and read their scores here or in your own system.
      </PageHero>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {orgs.length > 0 && (
          <ul className="space-y-3">
            {orgs.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/org/${o.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface-raised p-5 hover:border-primary/50"
                >
                  <span className="flex items-center gap-3">
                    <Building2 className="size-5 text-primary" />
                    <span>
                      <span className="block font-medium">{o.name}</span>
                      <span className="text-xs capitalize text-muted-foreground">{o.role}</span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {canCreateOrg(user) ? (
          <section className="mt-10 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-xl font-medium">New organisation</h2>
            <div className="mt-4">
              <CreateOrgForm action={createOrg} />
            </div>
          </section>
        ) : (
          orgs.length === 0 && (
            <p className="text-muted-foreground">
              You are not in an organisation yet. Ask your organisation&apos;s admin to add you, or contact Datanerds to
              set one up.
            </p>
          )
        )}
      </div>
    </main>
  )
}
