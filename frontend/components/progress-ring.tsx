// Thin circular meter with the value set in the middle.
export function ProgressRing({
  value,
  max,
  size = 72,
  stroke = 5,
  label,
  sub,
  color = 'var(--xp)',
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  label?: React.ReactNode
  sub?: React.ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="font-heading text-xl font-medium">{label ?? value}</span>
        {sub && <span className="mt-1 text-[10px] text-muted-foreground">{sub}</span>}
      </div>
    </div>
  )
}
