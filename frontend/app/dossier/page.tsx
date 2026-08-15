'use client'

import Link from 'next/link'
import { useAgent } from '@/components/providers/agent-provider'
import { RankBadge } from '@/components/rank-badge'
import { XpProgress } from '@/components/xp-progress'
import { ALL_BADGES } from '@/lib/badges'
import { TYPE_NAMES } from '@/lib/scoring'
import type { OperationResult } from '@/lib/types'
import { CORE_TYPES, getEnabledTypes, isV4Type } from '@/lib/feature-flags'
import { cn } from '@/lib/utils'
import { Shield, Zap, Target, Flame, Clock, CheckCircle2, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function OperationEntry({ op, index }: { op: OperationResult; index: number }) {
  const date = new Date(op.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <div className="flex items-start gap-4 py-3">
      <div className="flex flex-col items-center">
        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold', op.passed ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger')}>
          {op.passed ? '✓' : '✗'}
        </div>
        {index > 0 && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="flex-1 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs font-bold uppercase tracking-wider">{op.operationName}</p>
          <span className="font-mono text-[10px] text-muted-foreground">{date}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span style={{ color: op.passed ? 'var(--success)' : 'var(--danger)' }}>
            IQ {op.iqScore}%
          </span>
          <span>+{op.xpEarned.toLocaleString()} XP</span>
          <span>{op.totalAssignments} assignments</span>
          {op.bestStreak > 0 && <span>🔥 {op.bestStreak} streak</span>}
        </div>
      </div>
    </div>
  )
}

export default function DossierPage() {
  const { agent, rank, hydrated } = useAgent()

  if (!hydrated) {
    return (
      <main className="relative min-h-screen">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading dossier...</p>
        </div>
      </main>
    )
  }

  if (!agent) {
    return (
      <main className="relative min-h-screen">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
          <Shield className="size-12 text-muted-foreground" />
          <h1 className="mt-4 font-mono text-2xl font-bold uppercase tracking-tight">No Dossier Found</h1>
          <p className="mt-3 text-muted-foreground">You haven't enlisted yet. Return to HQ and register as a Data Agent.</p>
          <Button asChild className="mt-6">
            <Link href="/">Return to HQ</Link>
          </Button>
        </div>
      </main>
    )
  }

  const avgIq = agent.history.length > 0
    ? Math.round(agent.history.reduce((s, h) => s + h.iqScore, 0) / agent.history.length)
    : 0

  const initials = agent.alias.slice(0, 2)

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12">

        {/* Header — agent identity */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-xl border-2 font-mono text-xl font-bold"
              style={{ borderColor: `${rank.color}66`, background: `${rank.color}1a`, color: rank.color }}
            >
              {initials}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Agent Dossier · Classified</p>
              <h1 className="mt-0.5 font-mono text-3xl font-bold uppercase tracking-wide" style={{ color: rank.color }}>
                {agent.alias}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enlisted {new Date(agent.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <RankBadge rank={rank} size="lg" />
            <div className="mt-4">
              <XpProgress xp={agent.xp} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Zap} label="Total XP" value={agent.xp.toLocaleString()} color="var(--xp)" />
          <StatCard icon={Target} label="Assignments" value={agent.totalAssignments.toLocaleString()} color="var(--primary)" />
          <StatCard icon={CheckCircle2} label="Avg IQ-Score" value={agent.history.length ? `${avgIq}%` : '—'} color="var(--success)" />
          <StatCard icon={Flame} label="Best Streak" value={agent.bestStreak} color="#ff5c5c" />
        </div>

        {/* Training completed */}
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Field Training Progress</p>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">Core</p>
          <div className="grid gap-2 sm:grid-cols-4">
            {CORE_TYPES.map((t) => {
              const done = agent.completedTraining.includes(t)
              return (
                <div key={t} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5', done ? 'border-success/30 bg-success/5' : 'border-border')}>
                  {done ? <CheckCircle2 className="size-3.5 text-success" /> : <Lock className="size-3.5 text-muted-foreground" />}
                  <span className={cn('font-mono text-xs uppercase tracking-wider', done ? 'text-success' : 'text-muted-foreground')}>
                    {TYPE_NAMES[t]}
                  </span>
                </div>
              )
            })}
          </div>
          {getEnabledTypes().some(isV4Type) && (
            <>
              <p className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-widest text-primary">Specialisation · New</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {getEnabledTypes().filter(isV4Type).map((t) => {
                  const done = agent.completedTraining.includes(t)
                  return (
                    <div key={t} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5', done ? 'border-success/30 bg-success/5' : 'border-primary/25')}>
                      {done ? <CheckCircle2 className="size-3.5 text-success" /> : <Lock className="size-3.5 text-muted-foreground" />}
                      <span className={cn('font-mono text-xs uppercase tracking-wider', done ? 'text-success' : 'text-muted-foreground')}>
                        {TYPE_NAMES[t]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Badge Wall */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Badge Collection</p>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BADGES.map((badge) => {
                const isEarned = badge.earned(agent)
                return (
                  <div
                    key={badge.id}
                    title={isEarned ? badge.name : `Locked — ${badge.requirement}`}
                    className="group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all"
                    style={{
                      borderColor: isEarned ? `${badge.color}66` : 'var(--border)',
                      background: isEarned ? `${badge.color}12` : 'var(--card)',
                    }}
                  >
                    <Shield
                      className={cn('size-6', isEarned ? '' : 'opacity-20')}
                      style={{ color: isEarned ? badge.color : 'var(--muted-foreground)' }}
                    />
                    <p
                      className="text-center font-mono text-[7px] font-bold uppercase leading-tight tracking-wider"
                      style={{ color: isEarned ? badge.color : 'var(--muted-foreground)', opacity: isEarned ? 1 : 0.3 }}
                    >
                      {badge.name.split(' ').slice(0, 2).join(' ')}
                    </p>
                    {!isEarned && (
                      <Lock className="absolute bottom-1.5 right-1.5 size-2.5 text-muted-foreground opacity-40" />
                    )}
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden w-36 -translate-x-1/2 rounded-lg border border-border bg-surface-raised p-2 text-center shadow-lg group-hover:block">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: isEarned ? badge.color : 'var(--muted-foreground)' }}>
                        {badge.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {isEarned ? badge.description : badge.requirement}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Operation History */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Operation Log ({agent.history.length})
            </p>
            {agent.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <Clock className="size-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No operations logged yet.</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/operation">
                    Deploy to Operation <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card px-4 py-2 divide-y divide-border">
                {agent.history.map((op, i) => (
                  <OperationEntry key={op.id} op={op} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
