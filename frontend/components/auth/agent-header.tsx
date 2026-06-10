'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAgentContext } from '@/contexts/AgentContext'

export function AgentHeader() {
  const { user, signOut } = useAuth()
  const { profile, currentRank } = useAgentContext()

  if (!user) {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-foreground font-bold text-lg tracking-wide">
          ⬡ DATANERDS
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Sign In
        </Link>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link href="/" className="text-foreground font-bold text-lg tracking-wide">
        ⬡ DATANERDS
      </Link>

      <div className="flex items-center gap-4">
        {currentRank && (
          <span
            className="text-xs font-bold px-2 py-1 rounded bg-surface border border-border"
            style={{ color: currentRank.colour_hex }}
          >
            {currentRank.icon} {currentRank.label}
          </span>
        )}

        {profile && (
          <span className="text-xp text-sm font-bold">
            {profile.total_xp.toLocaleString()} XP
          </span>
        )}

        <Link href="/dossier" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
          {profile?.alias ?? user.email?.split('@')[0]}
        </Link>

        <button
          onClick={signOut}
          className="text-muted-foreground hover:text-danger text-xs transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
