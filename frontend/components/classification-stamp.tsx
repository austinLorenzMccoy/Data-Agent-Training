import type { Difficulty } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAP: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'UNCLASSIFIED', className: 'text-success border-success/40' },
  medium: { label: 'RESTRICTED', className: 'text-xp border-xp/40' },
  hard: { label: 'CLASSIFIED', className: 'text-danger border-danger/40' },
}

export function ClassificationStamp({
  difficulty,
  className,
}: {
  difficulty: Difficulty
  className?: string
}) {
  const { label, className: tone } = MAP[difficulty]
  return (
    <span
      className={cn(
        'inline-block rotate-3 rounded-sm border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
        tone,
        className,
      )}
    >
      {label}
    </span>
  )
}
