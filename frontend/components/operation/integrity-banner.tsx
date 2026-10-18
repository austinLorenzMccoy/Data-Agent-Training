'use client'

import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { enterFullscreen, type IntegrityReport } from '@/lib/integrity'
import { cn } from '@/lib/utils'

export function IntegrityBanner({
  needsFullscreen,
  warning,
}: {
  needsFullscreen: boolean
  warning: string | null
}) {
  if (!needsFullscreen && !warning) return null
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div role="alert" className="flex max-w-xl items-center gap-3 rounded-md border border-danger/40 bg-surface px-4 py-2.5 text-sm shadow-lg">
        <ShieldAlert className="size-4 shrink-0 text-danger" />
        <span className="text-foreground">
          {warning ?? 'Stay in fullscreen until you finish. Leaving is logged.'}
        </span>
        {needsFullscreen && (
          <Button size="sm" variant="outline" onClick={enterFullscreen}>
            Fullscreen
          </Button>
        )}
      </div>
    </div>
  )
}

export function IntegrityResult({ report, className }: { report: IntegrityReport; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        report.verified
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-danger/40 bg-danger/10 text-danger',
        className,
      )}
    >
      <p className="flex items-center gap-2 font-medium">
        {report.verified ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
        {report.verified ? 'Verified attempt' : 'Unverified attempt'}
      </p>
      {!report.verified && (
        <ul className="mt-1 list-disc pl-6 text-xs text-muted-foreground">
          {report.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
