import type { AgentProfile } from './types'
import { RANKS } from './ranks'

export interface BadgeDef {
  id: string
  name: string
  description: string
  color: string
  // returns true if the agent has earned this badge
  earned: (agent: AgentProfile) => boolean
  requirement: string
}

// Rank badges (7) + achievement badges (9) = 16 for a 4x4 wall
export const RANK_BADGES: BadgeDef[] = RANKS.map((r) => ({
  id: `rank-${r.id}`,
  name: r.name,
  description: r.description,
  color: r.color,
  requirement: `Reach ${r.xpRequired.toLocaleString()} XP`,
  earned: (a) => a.xp >= r.xpRequired,
}))

export const ACHIEVEMENT_BADGES: BadgeDef[] = [
  {
    id: 'first-op',
    name: 'FIRST BLOOD',
    description: 'Finished your first timed test.',
    color: '#7c6fff',
    requirement: 'Complete 1 operation',
    earned: (a) => a.history.length >= 1,
  },
  {
    id: 'clearance',
    name: 'CLEARED',
    description: 'Passed a timed test with a score of 70% or higher.',
    color: '#00e5a0',
    requirement: 'Pass a timed test',
    earned: (a) => a.history.some((h) => h.passed),
  },
  {
    id: 'perfect',
    name: 'FLAWLESS',
    description: 'Scored 100% on a timed test.',
    color: '#ffd24a',
    requirement: 'Score 100% on a timed test',
    earned: (a) => a.history.some((h) => h.iqScore === 100),
  },
  {
    id: 'streak-5',
    name: 'ON FIRE',
    description: 'Reached a 5-answer streak.',
    color: '#f5a623',
    requirement: 'Hit a 5 streak',
    earned: (a) => a.bestStreak >= 5,
  },
  {
    id: 'streak-10',
    name: 'INFERNO',
    description: 'Reached a 10-answer streak.',
    color: '#ff5c5c',
    requirement: 'Hit a 10 streak',
    earned: (a) => a.bestStreak >= 10,
  },
  {
    id: 'veteran',
    name: 'VETERAN',
    description: 'Finished 5 timed tests.',
    color: '#5b9bff',
    requirement: 'Finish 5 timed tests',
    earned: (a) => a.history.length >= 5,
  },
  {
    id: 'trained',
    name: 'FIELD READY',
    description: 'Finished all four core practice modules.',
    color: '#00e5a0',
    requirement: 'Finish all practice modules',
    earned: (a) => a.completedTraining.length >= 4,
  },
  {
    id: 'centurion',
    name: 'CENTURION',
    description: 'Completed 100 total assignments.',
    color: '#a78bfa',
    requirement: 'Complete 100 assignments',
    earned: (a) => a.totalAssignments >= 100,
  },
  {
    id: 'consistent',
    name: 'RELIABLE',
    description: 'Kept a 90%+ average score over 3 or more timed tests.',
    color: '#ffd24a',
    requirement: 'Average 90%+ over 3 tests',
    earned: (a) => {
      if (a.history.length < 3) return false
      const avg =
        a.history.reduce((s, h) => s + h.iqScore, 0) / a.history.length
      return avg >= 90
    },
  },
]

export const ALL_BADGES: BadgeDef[] = [...RANK_BADGES, ...ACHIEVEMENT_BADGES]
