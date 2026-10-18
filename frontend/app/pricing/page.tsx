'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Crown, Shield, Sparkle, Zap } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { Constellation } from '@/components/graphics/constellation'
import { cn } from '@/lib/utils'

interface PlanCard {
  slug: 'free' | 'pro' | 'elite'
  icon: React.ElementType
  clearance: string
  price: string
  cadence: string
  trial?: string
  features: string[]
  accent: boolean
}

const PLANS: PlanCard[] = [
  {
    slug: 'free',
    icon: Shield,
    clearance: 'Recruit Clearance',
    price: '₦0',
    cadence: 'forever',
    features: ['Unlimited guideline reading', '15 practice questions / day', '2 Live Operations / month'],
    accent: false,
  },
  {
    slug: 'pro',
    icon: Zap,
    clearance: 'Operative Clearance',
    price: '₦5,000',
    cadence: '/ month',
    trial: '7-day free trial',
    features: ['Unlimited guideline reading', '150 practice questions / day', '20 Live Operations / month'],
    accent: true,
  },
  {
    slug: 'elite',
    icon: Crown,
    clearance: 'Director Clearance',
    price: '₦10,000',
    cadence: '/ month',
    trial: '7-day free trial',
    features: ['Unlimited guideline reading', 'Effectively unlimited practice', 'Effectively unlimited Live Operations'],
    accent: false,
  },
]

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: 'Guideline reading', values: [true, true, true] },
  { label: 'Practice questions / day', values: ['15', '150', '2,000'] },
  { label: 'Live Operations / month', values: ['2', '20', '100'] },
  { label: 'XP, ranks and badges', values: [true, true, true] },
  { label: '7-day free trial', values: [false, true, true] },
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  async function subscribe(slug: 'pro' | 'elite') {
    if (!user) {
      router.push(`/login?next=/pricing`)
      return
    }
    setLoadingSlug(slug)
    try {
      const res = await fetch('/api/subscriptions/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug: slug }),
      })
      const data = await res.json()
      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } finally {
      setLoadingSlug(null)
    }
  }

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Clearance levels" title="One desk." accent="Every" after=" task type.">
        Every agent starts at Recruit Clearance. Raise it for higher daily practice caps and
        more Live Operations a month. Paid clearances start with a 7-day free trial.
      </PageHero>

      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl p-6',
                plan.accent
                  ? 'ink-band shadow-[0_24px_50px_-24px_rgba(26,23,20,0.7)] md:-my-3 md:py-9'
                  : 'border border-border bg-surface-raised shadow-[0_10px_30px_-18px_rgba(26,23,20,0.3)]',
              )}
            >
              {plan.accent && <Constellation density={0.00025} linkDistance={90} />}
              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-[0.18em]',
                      plan.accent ? 'text-ink-accent' : 'text-muted-foreground',
                    )}
                  >
                    {plan.clearance}
                  </p>
                  <plan.icon className={cn('size-4', plan.accent ? 'text-ink-accent' : 'text-primary')} />
                </div>
                <p className={cn('mt-5 font-heading text-5xl font-medium', plan.accent && 'text-ink-accent')}>
                  {plan.price}
                  <span className={cn('ml-1.5 font-sans text-sm', plan.accent ? 'text-ink-muted' : 'text-muted-foreground')}>
                    {plan.cadence}
                  </span>
                </p>
                {plan.trial && (
                  <p className={cn('mt-1 text-xs', plan.accent ? 'text-ink-muted' : 'text-primary')}>{plan.trial}</p>
                )}

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn('flex items-start gap-2.5 text-sm', plan.accent ? 'text-ink-foreground' : 'text-muted-foreground')}
                    >
                      <Sparkle className={cn('mt-0.5 size-3.5 shrink-0', plan.accent ? 'text-ink-accent' : 'text-primary')} />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.slug === 'free' ? (
                  <Button variant="outline" className="mt-7 rounded-full" disabled>
                    Default plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => subscribe(plan.slug as 'pro' | 'elite')}
                    disabled={loadingSlug === plan.slug}
                    className={cn(
                      'mt-7 rounded-full font-semibold',
                      plan.accent
                        ? 'bg-ink-accent text-ink hover:bg-ink-accent/90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                  >
                    {loadingSlug === plan.slug ? 'Redirecting…' : 'Start free trial'}
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-20 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Side by side</p>
            <h2 className="mt-2 font-heading text-4xl font-medium leading-tight tracking-tight">
              Free vs <em className="italic text-primary">cleared.</em>
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Reading the guidelines is always free. Clearance raises how much you can practice and test.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface-raised">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground" />
                  <th className="px-4 py-3 text-center font-medium">Recruit</th>
                  <th className="px-4 py-3 text-center font-medium">Operative</th>
                  <th className="px-4 py-3 text-center font-medium">Director</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center text-muted-foreground">
                        {v === true ? (
                          <Check className="mx-auto size-4 text-success" />
                        ) : v === false ? (
                          <span aria-label="Not included">—</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
