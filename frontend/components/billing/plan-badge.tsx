'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const PLAN_SHORT_LABEL: Record<string, string> = {
  free: 'Recruit',
  pro: 'Operative',
  elite: 'Director',
}

export function PlanBadge() {
  const { user } = useAuth()
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLabel(null)
      return
    }
    let cancelled = false
    fetch('/api/entitlements')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.plan?.slug) {
          setLabel(PLAN_SHORT_LABEL[data.plan.slug] ?? data.plan.label)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user])

  if (!label) return null

  return (
    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  )
}
