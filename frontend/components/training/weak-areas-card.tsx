'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { Target } from 'lucide-react'
import { useAgent } from '@/components/providers/agent-provider'
import { TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import { PRACTICE_STATS_KEY, weakAreas, type PracticeStats } from '@/lib/weak-areas'
import { ProgressRing } from '@/components/progress-ring'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function readRaw(): string {
  try {
    return localStorage.getItem(PRACTICE_STATS_KEY) ?? '{}'
  } catch {
    return '{}'
  }
}

export function WeakAreasCard({
  enabled,
  onPractice,
}: {
  enabled: AssignmentType[]
  onPractice: (type: AssignmentType) => void
}) {
  const { agent } = useAgent()
  const raw = useSyncExternalStore(subscribe, readRaw, () => '{}')
  const areas = useMemo(() => {
    let stats: PracticeStats = {}
    try {
      stats = JSON.parse(raw) as PracticeStats
    } catch {
      stats = {}
    }
    return weakAreas(agent?.history ?? [], stats, enabled)
  }, [agent?.history, raw, enabled])

  if (areas.length === 0) return null

  return (
    <section
      aria-labelledby="weak-areas-heading"
      className="mt-10 rounded-2xl border border-primary/30 bg-surface-raised p-5 shadow-[0_10px_30px_-18px_rgba(26,23,20,0.35)]"
    >
      <div className="flex items-center gap-2">
        <Target className="size-4 text-primary" />
        <h2 id="weak-areas-heading" className="font-heading text-xl font-medium">
          Work on these <em className="italic text-primary">next</em>
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Your lowest recent scores. A short practice set closes the gap fastest.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {areas.map((w) => (
          <li key={w.type} className="flex items-center gap-4 rounded-xl border border-border bg-background/60 p-3">
            <ProgressRing value={w.score} max={100} size={56} stroke={4} label={`${w.score}`} sub="%" color="var(--primary)" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{TYPE_NAMES[w.type]}</p>
              <p className="text-xs text-muted-foreground">
                {w.basis === 'tests'
                  ? `Average of your last ${w.samples} test${w.samples === 1 ? '' : 's'}`
                  : `From ${w.samples} practice answers`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPractice(w.type)}
              className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Practice
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
