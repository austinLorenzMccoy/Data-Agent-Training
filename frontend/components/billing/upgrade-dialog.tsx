'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X, Lock } from 'lucide-react'

export function UpgradeDialog({
  open,
  onClose,
  reason,
}: {
  open: boolean
  onClose: () => void
  reason: string
}) {
  const router = useRouter()

  if (!open) return null

  function goToPricing() {
    onClose()
    router.push('/pricing')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div className="agency-card agency-card-accent relative w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
          <Lock size={12} />
          Clearance required
        </p>
        <h2 id="upgrade-title" className="mt-2 text-xl font-bold tracking-tight">
          Upgrade to keep going
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {reason} Operative and Director Clearance raise or remove these limits, with a
          7-day free trial.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            onClick={goToPricing}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            See plans
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
