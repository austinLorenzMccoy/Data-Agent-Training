import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { findCertificate } from '@/lib/server/certificates'
import { PASS_THRESHOLD } from '@/lib/scoring'
import { PrintButton } from '@/components/print-button'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const cert = await findCertificate(code)
  return {
    title: cert ? `${cert.displayName} — ${cert.operationName} certificate` : 'Certificate not found',
    robots: { index: false },
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cert = await findCertificate(code)

  if (!cert) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldX className="mx-auto size-10 text-danger" />
        <h1 className="mt-4 font-heading text-3xl">No certificate with that code</h1>
        <p className="mt-3 text-muted-foreground">Check the code and try again. Codes look like 7KQ2M-X9D4R.</p>
        <Link href="/verify" className="mt-6 inline-block text-primary underline underline-offset-4">
          Check another code
        </Link>
      </main>
    )
  }

  const revoked = !!cert.revokedAt

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 print:py-0">
      <div
        className={
          'mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm print:hidden ' +
          (revoked ? 'border-danger/40 bg-danger/5 text-danger' : 'border-success/40 bg-success/5 text-success')
        }
        role="status"
      >
        {revoked ? <ShieldX className="size-5 shrink-0" /> : <BadgeCheck className="size-5 shrink-0" />}
        <span>
          {revoked
            ? `This certificate was revoked on ${fmtDate(cert.revokedAt!)}${cert.revokedReason ? `: ${cert.revokedReason}` : '.'}`
            : 'Valid certificate, issued by Datanerds Annotation.'}
        </span>
      </div>

      <article className="ink-band relative overflow-hidden rounded-3xl px-8 py-12 text-center sm:px-14 print:rounded-none">
        <div aria-hidden className="ink-grid absolute inset-0" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-accent">
            Datanerds Annotation · Certificate
          </p>
          <p className="mt-10 text-sm text-ink-muted">This certifies that</p>
          <h1 className="mt-2 font-heading text-5xl font-medium italic text-ink-foreground sm:text-6xl">
            {cert.displayName}
          </h1>
          <p className="mt-6 text-sm text-ink-muted">passed the timed test</p>
          <p className="mt-2 font-heading text-3xl text-ink-accent">{cert.operationName}</p>
          <p className="mt-6 text-ink-foreground">
            with a score of <span className="font-heading text-2xl">{cert.score}%</span>{' '}
            <span className="text-ink-muted">(pass mark {PASS_THRESHOLD}%)</span>
          </p>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-white/10 pt-6 text-left text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Issued</p>
              <p className="mt-1 text-ink-foreground">{fmtDate(cert.issuedAt)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">Code</p>
              <p className="mt-1 font-mono text-ink-foreground">{cert.code}</p>
            </div>
          </div>
        </div>
      </article>

      {!cert.integrityVerified && !revoked && (
        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-xp" />
          The test recorded integrity warnings (for example, leaving the test window). The score stands but was not
          sat under clean conditions.
        </p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        This certificate states a result on a Datanerds Annotation practice test. It is not a qualification from, or
        endorsed by, any annotation vendor.
      </p>

      <div className="mt-6 flex gap-3 print:hidden">
        <PrintButton />
        <Link href="/verify" className="inline-flex items-center text-sm text-primary underline underline-offset-4">
          Check another code
        </Link>
      </div>
    </main>
  )
}
