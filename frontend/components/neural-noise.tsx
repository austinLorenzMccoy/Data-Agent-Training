'use client'

import { useMemo } from 'react'

interface Node {
  x: number
  y: number
  delay: number
  r: number
}

// Deterministic pseudo-random so SSR/CSR match.
// Round to 6 dp to avoid platform-level IEEE 754 drift between Node and browser.
function seeded(i: number): number {
  const x = Math.sin(i * 127.1) * 43758.5453
  return Math.round((x - Math.floor(x)) * 1e6) / 1e6
}

export function NeuralNoise({ className = '' }: { className?: string }) {
  const { nodes, lines } = useMemo(() => {
    const count = 26
    const ns: Node[] = Array.from({ length: count }, (_, i) => ({
      x: seeded(i) * 100,
      y: seeded(i + 100) * 100,
      delay: seeded(i + 200) * 4,
      r: 0.4 + seeded(i + 300) * 0.7,
    }))
    const ls: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = []
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = ns[i].x - ns[j].x
        const dy = ns[i].y - ns[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 22) {
          ls.push({
            x1: ns[i].x,
            y1: ns[i].y,
            x2: ns[j].x,
            y2: ns[j].y,
            delay: seeded(i * j + 1) * 4,
          })
        }
      }
    }
    return { nodes: ns, lines: ls }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {lines.map((l, i) => (
          <line
            key={`l-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#c8973a"
            strokeWidth={0.12}
            style={{
              animation: `line-pulse 6s ease-in-out infinite`,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill="#c8973a"
            style={{
              animation: `node-pulse 5s ease-in-out infinite`,
              animationDelay: `${n.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
