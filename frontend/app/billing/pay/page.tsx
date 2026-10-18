import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { ManualPay } from '@/components/billing/manual-pay'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { methodDestinations } from '@/lib/server/manual-pay-config'
import { MANUAL_METHODS, PERIOD_DAYS, formatUsd } from '@/lib/manual-payments'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pay your way — Datanerds Annotation' }

export default async function PayPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const user = await currentUser()
  const planSlug = (await searchParams).plan ?? 'pro'
  if (!user) redirect(`/login?next=${encodeURIComponent(`/billing/pay?plan=${planSlug}`)}`)

  const { data } = await createAdminClient()
    .from('billing_plans')
    .select('slug, label, price_usd_cents, is_paid')
    .eq('is_paid', true)
    .order('id')
  const plans = (data as unknown as { slug: string; label: string; price_usd_cents: number | null }[] | null) ?? []
  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0]
  const dest = methodDestinations()
  const methods = MANUAL_METHODS.filter((m) => dest[m]).map((m) => ({ method: m, destination: dest[m]! }))
  const ready = plan?.price_usd_cents && methods.length > 0

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Pay your way" title="Airtm, crypto," accent="or Grey.">
        {plan?.price_usd_cents
          ? `${formatUsd(plan.price_usd_cents)} gives you ${PERIOD_DAYS} days of ${plan.label}. Send it, upload the screenshot, and an admin turns your plan on.`
          : 'Pay without a card. Send the payment, upload the screenshot, and an admin turns your plan on.'}
      </PageHero>
      <div className="mx-auto max-w-5xl px-4 py-12">
        {plans.length > 1 && (
          <nav aria-label="Plan" className="mb-8 flex flex-wrap gap-2">
            {plans.map((p) => (
              <Link
                key={p.slug}
                href={`/billing/pay?plan=${p.slug}`}
                aria-current={p.slug === plan?.slug ? 'page' : undefined}
                className={
                  'rounded-full border px-4 py-1.5 text-sm ' +
                  (p.slug === plan?.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50')
                }
              >
                {p.label}
                {p.price_usd_cents ? ` · ${formatUsd(p.price_usd_cents)}` : ''}
              </Link>
            ))}
          </nav>
        )}

        {ready ? (
          <ManualPay plan={plan.slug} planLabel={plan.label} amount={formatUsd(plan.price_usd_cents!)} methods={methods} />
        ) : (
          <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
            Payment by Airtm, crypto or Grey is not open yet. You can still{' '}
            <Link href="/pricing" className="text-primary underline">
              pay by card
            </Link>
            .
          </p>
        )}

        <p className="mt-10 text-xs text-muted-foreground">
          Manual payments do not renew. Each approved payment adds {PERIOD_DAYS} days; pay again before it ends to keep
          your plan. Prefer card? <Link href="/pricing" className="underline">Pay with Paystack</Link>.
        </p>
      </div>
    </main>
  )
}
