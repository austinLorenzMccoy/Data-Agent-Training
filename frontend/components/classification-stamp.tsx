import type { Difficulty } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAP: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'text-success border-success/40' },
  medium: { label: 'Medium', className: 'text-xp border-xp/40' },
  hard: { label: 'Hard', className: 'text-danger border-danger/40' },
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
        'inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium',
        tone,
        className,
      )}
    >
      {label}
    </span>
  )
}
