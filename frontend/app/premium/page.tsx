import Link from 'next/link'
import { ArrowRight, Check, Crown } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { PremiumGate } from '@/components/premium/premium-gate'
import { PLATFORMS } from '@/lib/platforms'
import { currentUser } from '@/lib/server/http'
import { hasPremium } from '@/lib/server/premium'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Premium — Datanerds Annotation',
  description: 'Members-only guides to the screening assessments on DataAnnotation, Handshake, TryRating and transcription projects.',
}

const PERKS = [
  'A guide to every platform’s screening assessment: each section, how it is graded, and how to approach it',
  'Worked examples of weak and strong written reasons',
  '150 practice questions a day on Operative, effectively unlimited on Director',
  '20 timed tests a month on Operative, 100 on Director',
]

export default async function PremiumPage() {
  const user = await currentUser()
  const premium = user ? await hasPremium(user.id) : false

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Premium membership" title="The members’" accent="desk.">
        Everything in your plan in one place, plus guides to the assessments you will sit on each
        platform before you get paid work.
      </PageHero>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        <section className="rounded-2xl border border-border bg-surface-raised p-6">
          <div className="flex items-center gap-2">
            <Crown className="size-4 text-primary" />
            <h2 className="font-heading text-2xl">{premium ? 'Your membership includes' : 'What membership includes'}</h2>
          </div>
          <ul className="mt-4 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
          {premium && (
            <Link href="/billing" className="mt-4 inline-block text-sm text-primary hover:underline">
              Manage your plan
            </Link>
          )}
        </section>

        {!premium && <PremiumGate signedIn={!!user} next="/premium" />}

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Platform assessments</p>
          <h2 className="mt-2 font-heading text-3xl">Know the test before you sit it.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            What each section asks, how reviewers grade it, and the mistakes that fail people. These
            guides don’t give you a platform’s real answers: the tests check your own judgment, and
            copied answers are spotted and get accounts closed.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/premium/${p.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-5 hover:border-primary/50"
                >
                  <span className="font-heading text-xl">{p.name}</span>
                  <span className="mt-1 flex-1 text-sm text-muted-foreground">{p.blurb}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                    {p.sections.length} sections <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
