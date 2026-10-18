'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { METHOD_INFO, formatUsd, type ManualMethod } from '@/lib/manual-payments'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  method: ManualMethod
  amount_cents: number
  reference: string
  status: 'pending' | 'approved' | 'rejected'
  review_note: string | null
  period_end: string | null
  created_at: string
  billing_plans: { label: string } | null
}

const STATUS: Record<Payment['status'], { label: string; cls: string }> = {
  pending: { label: 'Waiting for review', cls: 'text-xp' },
  approved: { label: 'Approved', cls: 'text-success' },
  rejected: { label: 'Rejected', cls: 'text-danger' },
}

export function ManualPayments() {
  const [payments, setPayments] = useState<Payment[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/payments/manual')
      .then((r) => (r.ok ? r.json() : { payments: [] }))
      .then((d: { payments: Payment[] }) => {
        if (!cancelled) setPayments(d.payments)
      })
      .catch(() => {
        if (!cancelled) setPayments([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-5" aria-labelledby="manual-pay-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="manual-pay-heading" className="font-heading text-xl font-medium">
            Pay with Airtm, crypto or Grey
          </h2>
          <p className="text-sm text-muted-foreground">No card needed. Each approved payment adds 30 days.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/billing/pay">
            Pay another way <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
      {payments && payments.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span>
                {METHOD_INFO[p.method]?.name ?? p.method} · {formatUsd(p.amount_cents)} · {p.billing_plans?.label}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{p.reference}</span>
              </span>
              <span className={cn('text-xs font-medium', STATUS[p.status].cls)}>
                {STATUS[p.status].label}
                {p.status === 'approved' && p.period_end && ` · until ${new Date(p.period_end).toLocaleDateString('en-GB')}`}
                {p.status === 'rejected' && p.review_note && ` · ${p.review_note}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
