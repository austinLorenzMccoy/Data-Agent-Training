'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Flame, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function OperationHud({
  index,
  total,
  timeLeft,
  streak,
  xp,
  trackLabel,
}: {
  index: number
  total: number
  timeLeft: number
  streak: number
  xp: number
  trackLabel?: string
}) {
  const danger = timeLeft <= 30
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <span className="text-accent">{trackLabel ?? 'Question'}</span>
          <span className="text-foreground">
            {index + 1}/{total}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${(index / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {streak >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex items-center gap-1 font-mono text-xs font-bold text-streak"
              >
                <Flame className="size-3.5" />
                {streak}x
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1 font-mono text-xs text-xp">
            <Zap className="size-3.5" />
            {xp}
          </div>

          <div
            className={cn(
              'flex items-center gap-1 font-mono text-sm font-bold tabular-nums',
              danger ? 'text-destructive' : 'text-foreground',
              danger && 'animate-pulse',
            )}
          >
            <Clock className="size-3.5" />
            {fmt(Math.max(0, timeLeft))}
          </div>
        </div>
      </div>
    </div>
  )
}
