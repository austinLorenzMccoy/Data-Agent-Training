'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Check, Shield, Zap, Crown } from 'lucide-react'
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
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm font-medium text-primary">Clearance levels</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Pick your clearance
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every agent starts at Recruit Clearance. Raise it for higher daily practice caps and
          more Live Operations a month — paid clearances start with a 7-day free trial.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                'agency-card flex flex-col p-5',
                plan.accent && 'agency-card-accent',
              )}
            >
              <plan.icon className="size-5 text-primary" />
              <p className="mt-3 text-[12px] font-medium text-muted-foreground">{plan.clearance}</p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {plan.price}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{plan.cadence}</span>
              </p>
              {plan.trial && <p className="mt-1 text-[11px] text-primary">{plan.trial}</p>}

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.slug === 'free' ? (
                <Button variant="outline" className="mt-5" disabled>
                  Default plan
                </Button>
              ) : (
                <Button
                  onClick={() => subscribe(plan.slug as 'pro' | 'elite')}
                  disabled={loadingSlug === plan.slug}
                  className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loadingSlug === plan.slug ? 'Redirecting…' : 'Start free trial'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
