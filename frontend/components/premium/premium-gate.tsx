import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PremiumGate({
  signedIn,
  next,
  unlocks = 'every platform guide',
}: {
  signedIn: boolean
  next: string
  unlocks?: string
}) {
  return (
    <div className="ink-band flex flex-col gap-4 rounded-2xl p-6 text-ink-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 size-5 shrink-0 text-ink-accent" />
        <div>
          <p className="font-heading text-xl">For premium members</p>
          <p className="mt-1 text-sm text-ink-muted">
            Operative and Director clearances, including the 7-day free trial, open {unlocks}.
          </p>
        </div>
      </div>
      <Button asChild className="rounded-full bg-ink-accent font-semibold text-ink hover:bg-ink-accent/90">
        <Link href={signedIn ? '/pricing' : `/login?next=${encodeURIComponent(next)}`}>
          {signedIn ? 'See plans' : 'Sign in'} <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  )
}
