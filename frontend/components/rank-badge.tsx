import type { RankTier } from '@/lib/ranks'
import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

export function RankBadge({
  rank,
  size = 'md',
  showName = true,
  className,
}: {
  rank: RankTier
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}) {
  const dim =
    size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-8 w-8' : 'h-11 w-11'
  const icon = size === 'lg' ? 32 : size === 'sm' ? 16 : 22

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border',
          dim,
        )}
        style={{
          color: rank.color,
          borderColor: `${rank.color}66`,
          background: `${rank.color}1a`,
          boxShadow: 'none',
        }}
        aria-hidden="true"
      >
        <Shield size={icon} strokeWidth={2.25} />
      </div>
      {showName && (
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold"
            style={{ color: rank.color }}
          >
            {rank.name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Rank
          </p>
        </div>
      )}
    </div>
  )
}
