'use client'

import { SiteNav } from '@/components/site-nav'
import { useAgent } from '@/components/providers/agent-provider'
import { RANKS, getRank } from '@/lib/ranks'
import { Shield, Trophy, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Simulated leaderboard entries for display when no real data exists
const DEMO_BOARD = [
  { alias: 'VECTOR-9', iqScore: 98, xp: 22400, rank: 'director' },
  { alias: 'SPECTRE', iqScore: 95, xp: 18900, rank: 'senior-analyst' },
  { alias: 'CIPHER-7', iqScore: 93, xp: 15200, rank: 'senior-analyst' },
  { alias: 'PHANTOM', iqScore: 91, xp: 12800, rank: 'senior-analyst' },
  { alias: 'NEXUS', iqScore: 89, xp: 9700, rank: 'analyst' },
  { alias: 'PRISM-4', iqScore: 87, xp: 8100, rank: 'analyst' },
  { alias: 'ATLAS', iqScore: 85, xp: 7300, rank: 'analyst' },
  { alias: 'ECHO-2', iqScore: 83, xp: 5900, rank: 'specialist' },
  { alias: 'SIGNAL', iqScore: 81, xp: 4500, rank: 'specialist' },
  { alias: 'GHOST', iqScore: 78, xp: 3800, rank: 'specialist' },
]

export default function RankingsPage() {
  const { agent, rank } = useAgent()

  const agentOnBoard = agent?.onLeaderboard

  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-4 py-12">

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Sector 05 · Global Intelligence</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Agency Rankings</h1>
          <p className="mt-3 text-muted-foreground">
            Top agents ranked by average IQ-Score across all operations. Opt in from your dossier to appear here.
          </p>
        </div>

        {/* Rank filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {RANKS.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
              style={{ borderColor: `${r.color}44`, color: r.color, background: `${r.color}10` }}
            >
              <Shield className="size-3" />
              {r.name}
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="agency-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <Trophy className="size-4 text-xp" />
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Global Rankings — Demo Board
            </p>
          </div>

          <ul className="divide-y divide-border">
            {DEMO_BOARD.map((entry, i) => {
              const entryRank = RANKS.find((r) => r.id === entry.rank) ?? RANKS[0]
              const isTop3 = i < 3
              const medal = ['🥇', '🥈', '🥉'][i] ?? null

              return (
                <li
                  key={entry.alias}
                  className={cn(
                    'flex items-center gap-4 px-5 py-3',
                    isTop3 && 'bg-primary/3',
                  )}
                >
                  <span className="w-6 text-center font-mono text-sm">
                    {medal ?? <span className="text-xs text-muted-foreground">{i + 1}</span>}
                  </span>

                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold"
                    style={{ borderColor: `${entryRank.color}55`, background: `${entryRank.color}15`, color: entryRank.color }}
                  >
                    {entry.alias.slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold uppercase tracking-wider">{entry.alias}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: entryRank.color }}>
                      {entryRank.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-success">{entry.iqScore}%</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Agent's position */}
          {agent && (
            <div className="border-t border-border bg-primary/5 px-5 py-3">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-mono text-xs text-muted-foreground">—</span>
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold"
                  style={{ borderColor: `${rank.color}55`, background: `${rank.color}15`, color: rank.color }}
                >
                  {agent.alias.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-primary">{agent.alias}</p>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">You</span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: rank.color }}>
                    {rank.name}
                  </p>
                </div>
                <div className="text-right">
                  {agent.history.length > 0 ? (
                    <p className="font-mono text-sm font-bold text-success">
                      {Math.round(agent.history.reduce((s, h) => s + h.iqScore, 0) / agent.history.length)}%
                    </p>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground">No ops yet</p>
                  )}
                  <p className="font-mono text-[10px] text-muted-foreground">{agent.xp.toLocaleString()} XP</p>
                </div>
              </div>
              {!agentOnBoard && (
                <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
                  Opt in via your <Link href="/dossier" className="text-primary underline underline-offset-2">Dossier</Link> to appear on the board.
                </p>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {!agent && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Crown className="size-4 text-xp" />
            <p className="text-sm text-muted-foreground">Enlist and complete operations to claim your position.</p>
            <Button asChild size="sm">
              <Link href="/">Enlist</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
