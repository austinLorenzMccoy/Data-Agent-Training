'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useAgent } from '@/components/providers/agent-provider'

const MESSAGES: Record<string, string> = {
  billing_cancel_failed: 'We could not cancel your subscription with Paystack, so nothing was deleted. Try again or cancel billing first.',
  billing_unavailable: 'Billing is unavailable right now, so nothing was deleted. Try again later.',
}

export function DeleteAccount() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { reset } = useAgent()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(MESSAGES[data.error] ?? 'Could not delete the account. Try again.')
        return
      }
      try {
        await signOut()
      } catch {
        // the session is already gone with the user
      }
      reset()
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {
        // storage may be blocked
      }
      router.push('/')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-12 rounded-2xl border border-danger/30 p-5" aria-labelledby="delete-account-heading">
      <h2 id="delete-account-heading" className="font-heading text-xl font-medium">
        Delete your account
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Removes your profile, test results, written answers, badges, certificates and billing record. A paid plan is
        cancelled first. This cannot be undone.
      </p>
      {!open ? (
        <Button variant="outline" className="mt-4 border-danger/40 text-danger" onClick={() => setOpen(true)}>
          Delete account…
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm" htmlFor="delete-confirm">
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button variant="destructive" disabled={typed !== 'DELETE' || busy} onClick={remove}>
              {busy ? 'Deleting…' : 'Permanently delete'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Keep my account
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
