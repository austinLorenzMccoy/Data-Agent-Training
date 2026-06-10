import type { RankTier } from './types'

export const RANKS: RankTier[] = [
  {
    id: 'recruit',
    name: 'RECRUIT',
    xpRequired: 0,
    color: '#7a7266',      // warm stone — entry level
    description: 'No prior annotation experience. Learning the basics.',
  },
  {
    id: 'operative',
    name: 'OPERATIVE',
    xpRequired: 500,
    color: '#6a9ecf',      // steel blue
    description: 'Understands rating dimensions. Ready for solo assignments.',
  },
  {
    id: 'field-agent',
    name: 'FIELD AGENT',
    xpRequired: 1500,
    color: '#5aab7a',      // sage green (matches success)
    description: 'Handles pairwise comparisons with accuracy.',
  },
  {
    id: 'specialist',
    name: 'SPECIALIST',
    xpRequired: 3500,
    color: '#c07ab8',      // muted mauve — distinct from the warm palette
    description: 'Masters transcript evaluation. Catches subtle errors.',
  },
  {
    id: 'analyst',
    name: 'ANALYST',
    xpRequired: 7000,
    color: '#c8973a',      // gold — matches primary
    description: 'Consistently high accuracy across all task types.',
  },
  {
    id: 'senior-analyst',
    name: 'SENIOR ANALYST',
    xpRequired: 12000,
    color: '#e8a84a',      // bright amber
    description: 'Elite-level accuracy. Can train others.',
  },
  {
    id: 'director',
    name: 'INTELLIGENCE DIRECTOR',
    xpRequired: 20000,
    color: '#f0d060',      // pale gold/champagne — top tier
    description: 'Legendary. Top 1% of all agents globally.',
  },
]

export function getRank(xp: number): RankTier {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (xp >= rank.xpRequired) current = rank
    else break
  }
  return current
}

export function getNextRank(xp: number): RankTier | null {
  const current = getRank(xp)
  const idx = RANKS.findIndex((r) => r.id === current.id)
  return RANKS[idx + 1] ?? null
}

export function rankProgress(xp: number): {
  current: RankTier
  next: RankTier | null
  pct: number
  xpIntoRank: number
  xpForNext: number
} {
  const current = getRank(xp)
  const next = getNextRank(xp)
  if (!next) {
    return { current, next: null, pct: 100, xpIntoRank: xp - current.xpRequired, xpForNext: 0 }
  }
  const span = next.xpRequired - current.xpRequired
  const into = xp - current.xpRequired
  return {
    current,
    next,
    pct: Math.min(100, Math.round((into / span) * 100)),
    xpIntoRank: into,
    xpForNext: span,
  }
}
