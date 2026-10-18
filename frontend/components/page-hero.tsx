import { Constellation } from '@/components/graphics/constellation'
import { cn } from '@/lib/utils'

// Ink band with a drifting node graph. Pass `accent` to set one word in italic highlighter.
export function PageHero({
  eyebrow,
  title,
  accent,
  after = '',
  children,
  aside,
  className,
}: {
  eyebrow: string
  title: string
  accent?: string
  after?: string
  children?: React.ReactNode
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('ink-band relative overflow-hidden', className)}>
      <div aria-hidden className="ink-grid absolute inset-0" />
      <Constellation />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-14 pt-16 sm:flex-row sm:items-end sm:justify-between sm:pb-16 sm:pt-20">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-accent">{eyebrow}</p>
          <h1 className="mt-4 text-balance font-heading text-[2.6rem] font-medium leading-[1.05] text-ink-foreground sm:text-6xl">
            {title}
            {accent && (
              <>
                {' '}
                <em className="italic text-ink-accent">{accent}</em>
              </>
            )}
            {after}
          </h1>
          {children && (
            <div className="mt-5 max-w-xl text-pretty leading-relaxed text-ink-muted">{children}</div>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </section>
  )
}
