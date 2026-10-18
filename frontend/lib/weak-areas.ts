import type { AssignmentType, OperationResult } from './types'
import { TYPE_NAMES } from './scoring'

// Suggests what to practise next from the learner's own record: recent
// timed-test scores per task type, and practice accuracy where there are no
// tests yet. Runs on the device from local history, so it works signed out.

export const PRACTICE_STATS_KEY = 'dna.practiceStats.v1'

export interface PracticeStat {
  answered: number
  /** Sum of 0–1 credit over answered questions. */
  credit: number
}

export type PracticeStats = Partial<Record<AssignmentType, PracticeStat>>

export interface WeakArea {
  type: AssignmentType
  /** 0–100 */
  score: number
  basis: 'tests' | 'practice'
  samples: number
}

const NAME_TO_TYPE = new Map(Object.entries(TYPE_NAMES).map(([type, name]) => [name, type as AssignmentType]))

/** Tests are single-track; older history rows only carry the track's display name. */
export function trackOf(result: OperationResult): AssignmentType | undefined {
  return result.track ?? NAME_TO_TYPE.get(result.operationName)
}

const RECENT_TESTS = 3
const MIN_PRACTICE = 4
/** Types at or above this are not suggested. */
export const STRONG_ENOUGH = 85

export function weakAreas(
  history: OperationResult[],
  practice: PracticeStats,
  enabled: AssignmentType[],
  limit = 2,
): WeakArea[] {
  const out: WeakArea[] = []
  for (const type of enabled) {
    const tests = history
      .filter((r) => trackOf(r) === type)
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, RECENT_TESTS)
    if (tests.length > 0) {
      const score = Math.round(tests.reduce((s, r) => s + r.iqScore, 0) / tests.length)
      out.push({ type, score, basis: 'tests', samples: tests.length })
      continue
    }
    const p = practice[type]
    if (p && p.answered >= MIN_PRACTICE) {
      out.push({ type, score: Math.round((p.credit / p.answered) * 100), basis: 'practice', samples: p.answered })
    }
  }
  return out
    .filter((w) => w.score < STRONG_ENOUGH)
    .sort((a, b) => a.score - b.score || b.samples - a.samples)
    .slice(0, limit)
}

export function loadPracticeStats(): PracticeStats {
  try {
    const raw = localStorage.getItem(PRACTICE_STATS_KEY)
    return raw ? (JSON.parse(raw) as PracticeStats) : {}
  } catch {
    return {}
  }
}

export function recordPractice(type: AssignmentType, ratio: number): void {
  try {
    const stats = loadPracticeStats()
    const s = stats[type] ?? { answered: 0, credit: 0 }
    stats[type] = { answered: s.answered + 1, credit: s.credit + Math.max(0, Math.min(1, ratio)) }
    localStorage.setItem(PRACTICE_STATS_KEY, JSON.stringify(stats))
  } catch {
    // storage blocked: suggestions just won't include practice
  }
}
