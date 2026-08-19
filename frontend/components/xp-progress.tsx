'use client'

import { rankProgress } from '@/lib/ranks'
import { cn } from '@/lib/utils'

export function XpProgress({
  xp,
  className,
  compact = false,
}: {
  xp: number
  className?: string
  compact?: boolean
}) {
  const { current, next, pct, xpIntoRank, xpForNext } = rankProgress(xp)

  return (
    <div className={cn('w-full', className)}>
      {!compact && (
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="font-medium" style={{ color: current.color }}>{current.name}</span>
          {next ? (
            <span className="text-muted-foreground">{next.name}</span>
          ) : (
            <span className="text-xp">Top rank</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full border border-border bg-background"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Experience progress to next rank"
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})`,
          }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>{xp.toLocaleString()} XP</span>
        {next ? (
          <span>
            {(xpForNext - xpIntoRank).toLocaleString()} XP to {next.name}
          </span>
        ) : (
          <span>Top of the ladder</span>
        )}
      </div>
    </div>
  )
}
