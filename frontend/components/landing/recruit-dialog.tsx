'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgent } from '@/components/providers/agent-provider'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function RecruitDialog({
  open,
  onClose,
  redirectTo = '/training',
}: {
  open: boolean
  onClose: () => void
  redirectTo?: string
}) {
  const { recruit } = useAgent()
  const router = useRouter()
  const [alias, setAlias] = useState('')

  if (!open) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const clean = alias.trim()
    if (clean.length < 2) return
    recruit(clean)
    router.push(redirectTo)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruit-title"
    >
      <div className="agency-card agency-card-accent relative w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Agency Intake Form
        </p>
        <h2
          id="recruit-title"
          className="mt-2 font-mono text-xl font-bold uppercase tracking-wide"
        >
          Establish Your Cover Identity
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose an alias. It is the only name the Agency will know you by — your
          real identity stays classified. Your rank, XP, and operation history
          are stored locally on this device.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label htmlFor="alias" className="sr-only">
            Agent alias
          </label>
          <input
            id="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="e.g. NIGHTJAR"
            maxLength={16}
            autoFocus
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm uppercase tracking-wider text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
          />
          <Button
            type="submit"
            disabled={alias.trim().length < 2}
            className="w-full bg-primary font-mono uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Begin Recruitment
          </Button>
        </form>
      </div>
    </div>
  )
}
