import type { RankTier } from './types'

export type { RankTier }

export const RANKS: RankTier[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    xpRequired: 0,
    color: '#6b6358',
    description: 'Just starting. Learning how to rate a response.',
  },
  {
    id: 'operative',
    name: 'Operative',
    xpRequired: 500,
    color: '#2c5282',
    description: 'Knows the rating scale. Ready to practice alone.',
  },
  {
    id: 'field-agent',
    name: 'Field Agent',
    xpRequired: 1500,
    color: '#276749',
    description: 'Comfortable comparing two responses.',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    xpRequired: 3500,
    color: '#6b3a62',
    description: 'Catches problems in transcripts.',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    xpRequired: 7000,
    color: '#b42318',
    description: 'High accuracy across every task type.',
  },
  {
    id: 'senior-analyst',
    name: 'Senior Analyst',
    xpRequired: 12000,
    color: '#9a3412',
    description: 'Consistently precise. Ready to coach others.',
  },
  {
    id: 'director',
    name: 'Director',
    xpRequired: 20000,
    color: '#3f1d12',
    description: 'Highest rank. Rarely reached.',
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
