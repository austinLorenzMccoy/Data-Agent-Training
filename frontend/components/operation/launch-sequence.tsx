'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const BOOT_LINES = [
  'Establishing secure uplink...',
  'Decrypting assignment packet...',
  'Verifying agent clearance...',
  'Synchronising mission clock...',
  'Channel secured.',
]

export function LaunchSequence({
  operationName,
  assignmentCount,
  durationSec,
  onReady,
}: {
  operationName: string
  assignmentCount: number
  durationSec: number
  onReady: () => void
}) {
  const [line, setLine] = useState(0)
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (line < BOOT_LINES.length) {
      const t = setTimeout(() => setLine((l) => l + 1), 420)
      return () => clearTimeout(t)
    }
    setCount(3)
  }, [line])

  useEffect(() => {
    if (count === null) return
    if (count <= 0) {
      const t = setTimeout(onReady, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount((c) => (c ?? 1) - 1), 800)
    return () => clearTimeout(t)
  }, [count, onReady])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
      <div className="w-full max-w-lg px-6">
        <AnimatePresence mode="wait">
          {count === null ? (
            <motion.div key="boot" exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                  Incoming Transmission
                </p>
                <h2 className="mt-2 font-mono text-2xl font-bold text-foreground">
                  {operationName}
                </h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {assignmentCount} ASSIGNMENTS · ONE TRACK · {Math.round(durationSec / 60)} MIN WINDOW
                </p>
              </div>
              <div className="space-y-1 font-mono text-sm text-success">
                {BOOT_LINES.slice(0, line).map((l, i) => (
                  <motion.div
                    key={l}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-muted-foreground">{'>'}</span>
                    {l}
                    {i === line - 1 && <span className="ml-1 animate-pulse">_</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`count-${count}`}
              initial={{ opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-center"
            >
              {count > 0 ? (
                <span className="font-mono text-8xl font-bold text-accent tabular-nums">
                  {count}
                </span>
              ) : (
                <span className="font-mono text-5xl font-bold uppercase tracking-widest text-success">
                  Deploy
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
