'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAgent } from '@/components/providers/agent-provider'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const PROMPTED_KEY = 'dna_progress_import_prompted'

// One-time, best-effort offer to carry pre-signup localStorage XP onto the
// new server-side agent row. This is an unverifiable, client-asserted
// claim — the server sanity-clamps it and only accepts it once, onto a
// fresh (0 XP) row. See /api/agents/import-local-progress.
export function ImportProgressDialog() {
  const { user } = useAuth()
  const { agent, hydrated } = useAgent()
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!user || !hydrated || !agent || agent.xp <= 0) return
    if (localStorage.getItem(PROMPTED_KEY)) return
    setOpen(true)
  }, [user, hydrated, agent])

  function dismiss() {
    localStorage.setItem(PROMPTED_KEY, '1')
    setOpen(false)
  }

  async function doImport() {
    if (!agent) return
    setImporting(true)
    try {
      await fetch('/api/agents/import-local-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: agent.xp, bestStreak: agent.bestStreak }),
      })
    } finally {
      dismiss()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-progress-title"
    >
      <div className="agency-card agency-card-accent relative w-full max-w-md p-6">
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="text-[12px] font-medium text-primary">Local progress found</p>
        <h2 id="import-progress-title" className="mt-2 text-xl font-bold tracking-tight">
          Import your progress?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This browser has {agent?.xp.toLocaleString()} XP saved from before you signed in. We
          can carry over an approximate total onto your new account — this is a one-time,
          best-effort import, not a full history restore.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            onClick={doImport}
            disabled={importing}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {importing ? 'Importing…' : 'Import XP'}
          </Button>
          <Button onClick={dismiss} variant="outline" className="flex-1">
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
