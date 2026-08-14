'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAgent } from '@/components/providers/agent-provider'
import { cn } from '@/lib/utils'
import { Radar } from 'lucide-react'
import { FEATURE_PROFICIENCY_GATE, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'

const LINKS = [
  { href: '/prep', label: 'Briefing' },
  { href: '/training', label: 'Field Training' },
  { href: '/operation', label: 'Live Operation' },
  { href: '/dossier', label: 'Dossier' },
  { href: '/rankings', label: 'Rankings' },
]

export function SiteNav() {
  const pathname = usePathname()
  const { agent, rank, hydrated } = useAgent()

  // Hide nav during an active operation for immersion
  if (pathname?.startsWith('/operation/run')) return null

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Radar size={18} className="text-primary" />
          <span className="font-mono text-sm font-bold uppercase tracking-widest">
            DNA<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            ...LINKS,
            ...(FEATURE_PROFICIENCY_GATE && REQUIRED_PROFICIENCY_EXAM
              ? [{ href: `/proficiency/${REQUIRED_PROFICIENCY_EXAM}`, label: 'Proficiency' }]
              : FEATURE_PROFICIENCY_GATE
                ? [{ href: '/proficiency/en-CA', label: 'Proficiency' }]
                : []),
          ].map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
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

        <div className="flex items-center gap-2">
          {hydrated && agent ? (
            <Link
              href="/dossier"
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1"
            >
              <span
                className="font-mono text-xs font-bold uppercase tracking-wider"
                style={{ color: rank.color }}
              >
                {agent.alias}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {agent.xp.toLocaleString()} XP
              </span>
            </Link>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Unregistered
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
