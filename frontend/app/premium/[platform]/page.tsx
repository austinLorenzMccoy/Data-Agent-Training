import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { Button } from '@/components/ui/button'
import { PremiumGate } from '@/components/premium/premium-gate'
import { guidelineFor } from '@/lib/guidelines'
import { platformGuide, type PlatformSection } from '@/lib/platforms'
import { TYPE_NAMES } from '@/lib/scoring'
import { currentUser } from '@/lib/server/http'
import { hasPremium } from '@/lib/server/premium'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const p = platformGuide((await params).platform)
  return { title: p ? `${p.name} assessment guide — Premium — Datanerds Annotation` : 'Premium' }
}

function Section({ s, n }: { s: PlatformSection; n: number }) {
  return (
    <section className="rounded-2xl border border-border bg-surface-raised p-6">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Section {n}</p>
      <h2 className="mt-1 font-heading text-2xl">{s.title}</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">What you get</dt>
          <dd className="mt-0.5 text-muted-foreground">{s.format}</dd>
        </div>
        <div>
          <dt className="font-medium">What is graded</dt>
          <dd className="mt-0.5 text-muted-foreground">{s.graded}</dd>
        </div>
      </dl>
      <h3 className="mt-5 text-sm font-medium">How to approach it</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
        {s.approach.map((a) => <li key={a}>{a}</li>)}
      </ul>
      <h3 className="mt-5 text-sm font-medium text-primary">What fails people</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
        {s.failures.map((f) => <li key={f}>{f}</li>)}
      </ul>
      {s.example && (
        <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm">
          <p className="font-medium">Worked example (ours, not from the platform)</p>
          <p className="mt-1 text-muted-foreground">{s.example.prompt}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-primary">Weak</p>
          <p className="mt-0.5">{s.example.weak}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-success">Strong</p>
          <p className="mt-0.5">{s.example.strong}</p>
        </div>
      )}
    </section>
  )
}

export default async function PlatformGuidePage({ params }: { params: Promise<{ platform: string }> }) {
  const guide = platformGuide((await params).platform)
  if (!guide) notFound()
  const user = await currentUser()
  const premium = user ? await hasPremium(user.id) : false

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow={`Premium · ${guide.name}`} title={guide.name} accent={guide.accent}>
        {guide.blurb}
      </PageHero>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Link href="/premium" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> All platforms
        </Link>

        {premium ? (
          <>
            <p className="rounded-xl border border-border bg-card/60 p-4 text-sm">
              <span className="font-medium">Pass mark: </span>
              <span className="text-muted-foreground">{guide.passBar}</span>
            </p>
            {guide.sections.map((s, i) => <Section key={s.title} s={s} n={i + 1} />)}

            <div className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-semibold">Study and practice for this platform</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {guide.guidelines.map((id) => {
                  const pack = guidelineFor(id)
                  return pack ? (
                    <Link key={id} href={`/guidelines/${id}`} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50">
                      Guideline: {pack.title}
                    </Link>
                  ) : null
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Practice: {guide.practice.map((t) => TYPE_NAMES[t]).join(', ')}
              </p>
              <Button asChild className="mt-4">
                <Link href="/training">Start practice <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <ol className="space-y-2">
              {guide.sections.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm">
                  <span className="font-mono text-muted-foreground">{i + 1}.</span> {s.title}
                </li>
              ))}
            </ol>
            <PremiumGate signedIn={!!user} next={`/premium/${guide.id}`} />
          </>
        )}
      </div>
    </main>
  )
}
