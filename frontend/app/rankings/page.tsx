'use client'

import { useEffect, useState } from 'react'
import { useAgent } from '@/components/providers/agent-provider'
import { RANKS } from '@/lib/ranks'
import { Shield, Trophy, Crown, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  alias: string
  total_xp: number
  best_iq_score: number
  operations_count: number
  rank_label: string
  rank_icon: string
  rank_colour: string
  rank_tier_id: number
  position: number
}

export default function RankingsPage() {
  const { agent, rank } = useAgent()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRank, setFilterRank] = useState<number | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filterRank) params.set('rank', String(filterRank))
        params.set('limit', '50')

        const res = await fetch(`/api/leaderboard?${params}`)
        if (!res.ok) throw new Error('Failed to fetch rankings')
        const data = await res.json()
        setEntries(data)
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
        setError('Unable to load rankings. Try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [filterRank])

  const agentOnBoard = agent?.onLeaderboard

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12">

        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Leaderboard</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Rankings</h1>
          <p className="mt-3 text-muted-foreground">
            Ranked by XP from the core tasks. Extra-track XP stays on those tracks. Opt in from Progress to appear here.
          </p>
        </div>

        {/* Rank filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRank(null)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all',
              filterRank === null
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground/50'
            )}
          >
            <Users className="size-3" />
            All
          </button>
          {RANKS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setFilterRank(i + 1)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all',
                filterRank === i + 1
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/50'
              )}
              style={filterRank === i + 1 ? { borderColor: `${r.color}66`, color: r.color, background: `${r.color}15` } : {}}
            >
              <Shield className="size-3" />
              {r.name}
            </button>
          ))}
        </div>

        {/* Board */}
        <div className="agency-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <Trophy className="size-4 text-xp" />
            <p className="text-xs font-semibold text-muted-foreground">
              All ranks
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">
                Loading rankings...
              </span>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-danger">{error}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="size-10 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">No one on the board yet.</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Finish a timed test and opt in from Progress to appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map((entry, i) => {
                const isTop3 = i < 3
                const medal = ['🥇', '🥈', '🥉'][i] ?? null

                return (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3',
                      isTop3 && 'bg-primary/3',
                    )}
                  >
                    <span className="w-6 text-center font-mono text-sm">
                      {medal ?? <span className="text-xs text-muted-foreground">{entry.position}</span>}
                    </span>

                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold"
                      style={{ borderColor: `${entry.rank_colour}55`, background: `${entry.rank_colour}15`, color: entry.rank_colour }}
                    >
                      {entry.alias.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{entry.alias}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: entry.rank_colour }}>
                        {entry.rank_label}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-success">{entry.best_iq_score}%</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{entry.total_xp.toLocaleString()} XP</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

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
                    <p className="text-xs text-muted-foreground">No tests yet</p>
                  )}
                  <p className="font-mono text-[10px] text-muted-foreground">{agent.xp.toLocaleString()} XP</p>
                </div>
              </div>
              {!agentOnBoard && (
                <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
                  Opt in from <Link href="/dossier" className="text-primary underline underline-offset-2">Progress</Link> to appear on the board.
                </p>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {!agent && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Crown className="size-4 text-xp" />
            <p className="text-sm text-muted-foreground">Get started and finish a timed test to appear here.</p>
            <Button asChild size="sm">
              <Link href="/">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
