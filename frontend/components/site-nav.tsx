'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAgent } from '@/components/providers/agent-provider'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'

const LINKS = [
  { href: '/prep', label: 'Study' },
  { href: '/guidelines', label: 'Guidelines' },
  { href: '/training', label: 'Practice' },
  { href: '/operation', label: 'Test' },
  { href: '/dossier', label: 'Progress' },
  { href: '/rankings', label: 'Rankings' },
]

export function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { agent, rank, hydrated, reset } = useAgent()
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (pathname?.startsWith('/operation/run')) return null

  const links = [
    ...LINKS,
    ...(FEATURE_PROFICIENCY_GATE
      ? [{ href: `/proficiency/${REQUIRED_PROFICIENCY_EXAM || 'en-CA'}`, label: 'English' }]
      : []),
  ]

  const signedIn = !!user || !!agent

  async function logout() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      // still clear the local cover identity
    }
    reset()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="masthead sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-heading text-lg italic leading-none text-foreground">
            Datanerds
          </span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Annotation
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'shrink-0 rounded-md px-2.5 py-1.5 font-sans text-xs font-medium transition-colors',
                  active
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {hydrated && agent ? (
            <Link
              href="/dossier"
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1"
            >
              <span
                className="font-sans text-xs font-bold"
                style={{ color: rank.color }}
              >
                {agent.alias}
              </span>
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                {agent.xp.toLocaleString()} XP
              </span>
            </Link>
          ) : user ? (
            <Link
              href="/dossier"
              className="rounded-md border border-border px-2.5 py-1 font-sans text-[10px] text-muted-foreground"
            >
              {user.email?.split('@')[0]}
            </Link>
          ) : null}

          {signedIn ? (
            <button
              type="button"
              onClick={logout}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-danger/10 px-2.5 py-1 font-sans text-[10px] font-bold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
            >
              <LogOut className="size-3" />
              {signingOut ? 'Out…' : 'Log out'}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-border px-2.5 py-1 font-sans text-[10px] text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden">
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + '/')
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 font-sans text-[10px] font-medium',
                active ? 'bg-secondary text-foreground' : 'text-muted-foreground',
              )}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
