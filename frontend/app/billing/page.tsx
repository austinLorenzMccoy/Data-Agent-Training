'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CreditCard, ArrowRight } from 'lucide-react'

interface EntitlementsResponse {
  plan: {
    slug: string
    label: string
    isPaid: boolean
    practiceDailyLimit: number | null
    testsMonthlyLimit: number | null
  }
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  practiceUsedToday: number
  testsUsedThisMonth: number
}

function limitLabel(used: number, limit: number | null) {
  return limit == null ? `${used} used (unlimited)` : `${used} / ${limit}`
}

export default function BillingPage() {
  const [data, setData] = useState<EntitlementsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    fetch('/api/entitlements')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  async function cancel() {
    setCanceling(true)
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' })
      if (res.ok) {
        const refreshed = await fetch('/api/entitlements')
        if (refreshed.ok) setData(await refreshed.json())
      }
    } finally {
      setCanceling(false)
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-[12px] font-medium text-muted-foreground">Account</p>
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight">Billing</h1>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !data ? (
          <p className="mt-8 text-sm text-muted-foreground">No subscription found.</p>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="agency-card agency-card-accent p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium text-muted-foreground">Current clearance</p>
                  <p className="mt-0.5 text-xl font-bold">{data.plan.label}</p>
                </div>
                <CreditCard className="size-6 text-primary" />
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Status: {data.status}
                {data.cancelAtPeriodEnd && ' · cancels at period end'}
              </p>
              {data.trialEndsAt && data.status === 'trialing' && (
                <p className="mt-1 text-[11px] text-primary">
                  Trial ends {new Date(data.trialEndsAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
              {data.currentPeriodEnd && data.status !== 'trialing' && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Renews {new Date(data.currentPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            <div className="agency-card p-5">
              <p className="mb-3 text-[12px] font-medium text-muted-foreground">Usage this period</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Practice questions today</p>
                  <p className="font-mono text-lg font-bold">
                    {limitLabel(data.practiceUsedToday, data.plan.practiceDailyLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Live Operations this month</p>
                  <p className="font-mono text-lg font-bold">
                    {limitLabel(data.testsUsedThisMonth, data.plan.testsMonthlyLimit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/pricing">
                  {data.plan.isPaid ? 'Change plan' : 'Upgrade'} <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              {data.plan.isPaid && !data.cancelAtPeriodEnd && (
                <Button onClick={cancel} disabled={canceling} variant="destructive" className="flex-1">
                  {canceling ? 'Canceling…' : 'Cancel subscription'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
