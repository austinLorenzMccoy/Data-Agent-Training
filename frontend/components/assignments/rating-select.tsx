'use client'

import type { AlphaRating } from '@/lib/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: AlphaRating; label: string; sub: string; tone: string }[] = [
  { value: 'CLEAR', label: 'CLEAR', sub: 'Good — accurate & compliant', tone: 'success' },
  { value: 'AMBIGUOUS', label: 'AMBIGUOUS', sub: 'Okay — partial issues', tone: 'xp' },
  { value: 'COMPROMISED', label: 'COMPROMISED', sub: 'Bad — fails review', tone: 'danger' },
]

export function RatingSelect({
  value,
  onChange,
  disabled,
  idPrefix = 'rating',
}: {
  value: AlphaRating | null
  onChange: (v: AlphaRating) => void
  disabled?: boolean
  idPrefix?: string
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Rating">
      {OPTIONS.map((o) => {
        const selected = value === o.value
        const color = `var(--${o.tone})`
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            id={`${idPrefix}-${o.value}`}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md border px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
              selected ? 'border-transparent' : 'border-border hover:border-muted-foreground/50',
            )}
            style={
              selected
                ? { borderColor: color, background: `${color}1a`, boxShadow: `0 0 16px ${color}33` }
                : undefined
            }
          >
            <span
              className="block font-mono text-xs font-bold uppercase tracking-wider"
              style={{ color: selected ? color : undefined }}
            >
              {o.label}
            </span>
            <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
              {o.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
