'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) {
      setError('Missing payment reference.')
      return
    }

    fetch('/api/subscriptions/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          setError(data?.error ?? 'Could not confirm subscription.')
          return
        }
        router.push('/billing')
      })
      .catch(() => setError('Could not confirm subscription.'))
  }, [searchParams, router])

  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-sm text-danger">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              If you were charged, contact support — your card was verified and refunded regardless.
            </p>
          </>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">Confirming subscription…</p>
        )}
      </div>
    </main>
  )
}

export default function SubscriptionCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}
