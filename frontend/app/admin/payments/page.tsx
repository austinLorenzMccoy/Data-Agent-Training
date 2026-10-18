import { notFound, redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'
import { METHOD_INFO, formatUsd, type ManualMethod } from '@/lib/manual-payments'
import { approvePayment, rejectPayment } from './actions'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  agent_id: string
  method: ManualMethod
  amount_cents: number
  reference: string
  proof_path: string
  status: 'pending' | 'approved' | 'rejected'
  review_note: string | null
  period_end: string | null
  created_at: string
  billing_plans: { label: string } | null
  agents: { alias: string } | null
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/login?next=/admin/payments')
  if (!isPlatformAdmin(user)) notFound()
  const all = (await searchParams).all === '1'

  const admin = createAdminClient()
  let q = admin
    .from('manual_payments' as never)
    .select('*, billing_plans(label), agents(alias)')
    .order('created_at', { ascending: !all })
    .limit(50)
  if (!all) q = q.eq('status', 'pending')
  const { data } = await q
  const rows = (data as unknown as Row[]) ?? []

  // Proofs are private; sign each for 10 minutes.
  const signed = await Promise.all(
    rows.map(async (r) => (await admin.storage.from('payment-proofs').createSignedUrl(r.proof_path, 600)).data?.signedUrl ?? null),
  )
  const emails = await Promise.all(rows.map(async (r) => (await admin.auth.admin.getUserById(r.agent_id)).data.user?.email ?? ''))

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Admin" title="Payments to" accent="review.">
        Check the screenshot against your Airtm, Binance or Grey account before approving. Approving gives the plan
        for 30 days.
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <a href={all ? '/admin/payments' : '/admin/payments?all=1'} className="text-sm text-primary underline">
          {all ? 'Show pending only' : 'Show recent, all statuses'}
        </a>
        {rows.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Nothing waiting.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((r, i) => (
              <li key={r.id} className="grid gap-4 rounded-2xl border border-border bg-surface-raised p-5 sm:grid-cols-[1fr_14rem]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: METHOD_INFO[r.method].tint }}>
                    {METHOD_INFO[r.method].name} · {formatUsd(r.amount_cents)} · {r.billing_plans?.label}
                  </p>
                  <p className="mt-1 font-medium">
                    {r.agents?.alias ?? 'Learner'} <span className="text-sm text-muted-foreground">{emails[i]}</span>
                  </p>
                  <p className="mt-1 text-sm">
                    Reference <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{r.reference}</code>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(r.created_at).toLocaleString('en-GB')}</p>
                  {r.status === 'pending' ? (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <form action={approvePayment.bind(null, r.id)}>
                        <Button type="submit" className="rounded-full">
                          Approve
                        </Button>
                      </form>
                      <form action={rejectPayment.bind(null, r.id)} className="flex flex-wrap items-end gap-2">
                        <label className="text-xs">
                          <span className="sr-only">Reason for rejecting</span>
                          <input name="note" placeholder="Reason (shown to learner)" className="w-56 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
                        </label>
                        <Button type="submit" variant="outline" className="rounded-full">
                          Reject
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <p className={'mt-3 text-sm ' + (r.status === 'approved' ? 'text-success' : 'text-danger')}>
                      {r.status === 'approved'
                        ? `Approved · plan until ${r.period_end ? new Date(r.period_end).toLocaleDateString('en-GB') : '—'}`
                        : `Rejected · ${r.review_note ?? ''}`}
                    </p>
                  )}
                </div>
                {signed[i] ? (
                  <a href={signed[i]!} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={signed[i]!} alt={`Payment screenshot for ${r.reference}`} className="h-48 w-full object-cover object-top" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Screenshot unavailable</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
