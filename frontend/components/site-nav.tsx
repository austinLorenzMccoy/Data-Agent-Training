'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAgent } from '@/components/providers/agent-provider'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/components/sidebar-context'
import { cn, pathHasSidebar } from '@/lib/utils'
import { LogOut, Menu, PanelLeftClose, X, Home } from 'lucide-react'
import { FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'
import { PlanBadge } from '@/components/billing/plan-badge'

const LINKS = [
  { href: '/prep', label: 'Study' },
  { href: '/guidelines', label: 'Guidelines' },
  { href: '/training', label: 'Practice' },
  { href: '/operation', label: 'Test' },
  { href: '/dossier', label: 'Progress' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/billing', label: 'Billing' },
]

const WORKERS_HUB_URL = process.env.NEXT_PUBLIC_WORKERSHUB_URL?.replace(/\/$/, '') || ''

export function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { agent, rank, hydrated, reset } = useAgent()
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()

  const showSidebar = pathHasSidebar(pathname)

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
    <>
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showSidebar ? (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface/95 backdrop-blur-sm transition-transform duration-300',
            !sidebarOpen && '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-5">
            <Link href="/" className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg italic leading-none text-foreground">
                Datanerds
              </span>
              <span className="text-[11px] text-muted-foreground">Annotation</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              className="rounded-md p-1 hover:bg-secondary"
            >
              <PanelLeftClose className="size-4 hidden md:block" />
              <X className="size-4 md:hidden" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              <Home className="size-4" />
              Home
            </Link>
            {links.map((l) => {
              const active = pathname === l.href || pathname?.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <div className="space-y-3 border-t border-border p-3">
            {hydrated && agent ? (
              <Link
                href="/dossier"
                className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-2"
              >
                <span className="font-sans text-xs font-bold" style={{ color: rank.color }}>
                  {agent.alias}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {agent.xp.toLocaleString()} XP
                  </span>
                  <PlanBadge />
                </span>
              </Link>
            ) : user ? (
              <Link
                href="/dossier"
                className="block rounded-md border border-border bg-background px-2.5 py-2 font-sans text-[10px] text-muted-foreground"
              >
                {user.email?.split('@')[0]}
              </Link>
            ) : null}

            {signedIn ? (
              <button
                type="button"
                onClick={logout}
                disabled={signingOut}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-2.5 py-2 font-sans text-[10px] font-bold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
              >
                <LogOut className="size-3" />
                {signingOut ? 'Out…' : 'Log out'}
              </button>
            ) : (
              <Link
                href="/login"
                className="block rounded-md border border-border px-2.5 py-2 text-center font-sans text-[10px] text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
            )}

            {WORKERS_HUB_URL ? (
              <a
                href={WORKERS_HUB_URL}
                className="block rounded-md border border-border px-2.5 py-2 text-center font-sans text-[10px] text-muted-foreground hover:text-foreground"
              >
                Workers
              </a>
            ) : null}
          </div>
        </aside>
      ) : null}

      {showSidebar ? (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className={cn(
                'rounded-md p-1 hover:bg-secondary',
                sidebarOpen && 'md:hidden',
              )}
            >
              <Menu className="size-5" />
            </button>

            <Link href="/" className="hidden items-baseline gap-1.5 md:flex">
              <span className="font-heading text-lg italic leading-none text-foreground">
                Datanerds
              </span>
              <span className="text-[11px] text-muted-foreground">Annotation</span>
            </Link>

            <div className="flex items-center gap-2">
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

          <nav className="hidden gap-1 border-t border-border px-4 py-1.5 md:flex">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-sans text-[10px] font-medium',
                pathname === '/'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Home className="size-3" />
              Home
            </Link>
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
      ) : null}
    </>
  )
}
