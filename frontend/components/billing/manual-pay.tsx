'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Copy, Lock, ShieldCheck, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { METHOD_INFO, type ManualMethod } from '@/lib/manual-payments'
import { cn } from '@/lib/utils'

const ERRORS: Record<string, string> = {
  reference_required: 'Enter the transaction or order ID.',
  proof_required: 'Attach a screenshot of the payment.',
  proof_invalid: 'The screenshot must be a PNG, JPG or WebP under 5 MB.',
  duplicate_reference: 'That transaction ID has already been submitted.',
  too_many_pending: 'You already have payments waiting for review.',
  method_unavailable: 'This payment method is not available right now.',
  plan_unavailable: 'This plan cannot be paid this way right now.',
  rate_limited: 'Too many attempts. Try again in a while.',
}

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {
          // copy by hand
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
      aria-label={`Copy ${value}`}
    >
      {done ? <Check className="size-3" /> : <Copy className="size-3" />}
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

function MethodCard({ method, destination, amount, plan }: { method: ManualMethod; destination: string; amount: string; plan: string }) {
  const info = METHOD_INFO[method]
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    form.set('method', method)
    form.set('plan', plan)
    try {
      const res = await fetch('/api/payments/manual', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError(ERRORS[data.error] ?? 'Could not submit. Try again.')
      else setSent(true)
    } catch {
      setError('Connection lost. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised p-5 shadow-[0_10px_30px_-18px_rgba(26,23,20,0.35)]"
      style={{ backgroundImage: `radial-gradient(ellipse 70% 60% at 100% 0%, ${info.tint}1f, transparent 70%)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl font-heading text-xl font-semibold text-white" style={{ background: info.tint }}>
          {info.mark}
        </span>
        <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          ● Screenshot review
        </span>
      </div>
      <h3 className="mt-3 font-heading text-2xl font-medium">{info.name}</h3>
      <p className="text-xs text-muted-foreground">{info.currencyNote}</p>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span>
          Pay <strong>{amount}</strong> to <strong className="break-all">{destination}</strong>
        </span>
        <CopyValue value={destination} />
      </p>

      <ol className="mt-4 space-y-2.5 text-sm">
        {info.steps(amount, destination).map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: info.tint }}>
              {i + 1}
            </span>
            <span className="text-foreground/85">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto pt-5">
      {sent ? (
        <div className="rounded-xl border border-success/40 bg-success/5 p-4 text-sm" role="status">
          <p className="font-medium text-success">Submitted for review.</p>
          <p className="mt-1 text-muted-foreground">
            You can see its status on <Link href="/billing" className="underline">Billing</Link>. Your plan starts as soon as it is approved.
          </p>
        </div>
      ) : !open ? (
        <Button onClick={() => setOpen(true)} className="w-full rounded-full" size="lg">
          I&apos;ve paid with {info.name} <ArrowRight className="size-4" />
        </Button>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-background/60 p-4">
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted-foreground">Transaction or order ID</span>
            <input name="reference" required minLength={3} maxLength={120} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-muted-foreground">Screenshot of the payment (PNG, JPG or WebP, under 5 MB)</span>
            <input name="proof" type="file" required accept="image/png,image/jpeg,image/webp" className="mt-1 block w-full text-sm" />
          </label>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            <Upload className="size-4" /> {busy ? 'Uploading…' : 'Submit for review'}
          </Button>
        </form>
      )}
      </div>
    </div>
  )
}

export function ManualPay({
  plan,
  planLabel,
  amount,
  methods,
}: {
  plan: string
  planLabel: string
  amount: string
  methods: { method: ManualMethod; destination: string }[]
}) {
  return (
    <div>
      <div className={cn('grid gap-5', methods.length > 1 && 'md:grid-cols-2', methods.length > 2 && 'lg:grid-cols-3')}>
        {methods.map((m) => (
          <MethodCard key={m.method} method={m.method} destination={m.destination} amount={amount} plan={plan} />
        ))}
      </div>
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5" /> Screenshots are stored privately
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Checked by an admin before {planLabel} starts
        </span>
      </p>
    </div>
  )
}
