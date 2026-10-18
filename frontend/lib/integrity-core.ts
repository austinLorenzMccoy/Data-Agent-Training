// Pure integrity rules, shared by the test page and the server that stores
// the report. The server re-runs `summarize` on the raw counts rather than
// trusting the browser's own verdict.

export interface IntegrityReport {
  fullscreenSupported: boolean
  fullscreenExits: number
  tabSwitches: number
  awayMs: number
  pasteBlocked: number
  dropBlocked: number
  // Large text inserts that didn't come from a paste: autofill, extensions,
  // text expanders.
  injectedText: number
  verified: boolean
  reasons: string[]
}

const MAX_TAB_SWITCHES = 2
const MAX_AWAY_MS = 30_000
const MAX_FULLSCREEN_EXITS = 2
const MAX_BLOCKED_INSERTS = 3
export const INJECTED_TEXT_CHARS = 25

export type Counts = Omit<IntegrityReport, 'verified' | 'reasons' | 'fullscreenSupported'>

export const EMPTY: Counts = {
  fullscreenExits: 0,
  tabSwitches: 0,
  awayMs: 0,
  pasteBlocked: 0,
  dropBlocked: 0,
  injectedText: 0,
}

export function summarize(counts: Counts, fsSupported: boolean): IntegrityReport {
  const reasons: string[] = []
  if (counts.tabSwitches > MAX_TAB_SWITCHES) reasons.push(`Left the test ${counts.tabSwitches} times`)
  if (counts.awayMs > MAX_AWAY_MS) reasons.push(`${Math.round(counts.awayMs / 1000)}s spent outside the test`)
  if (fsSupported && counts.fullscreenExits > MAX_FULLSCREEN_EXITS)
    reasons.push(`Exited fullscreen ${counts.fullscreenExits} times`)
  const blocked = counts.pasteBlocked + counts.dropBlocked
  if (blocked > MAX_BLOCKED_INSERTS) reasons.push(`${blocked} paste/drop attempts`)
  if (counts.injectedText > 0) reasons.push(`${counts.injectedText} large text inserts not typed by hand`)
  return { ...counts, fullscreenSupported: fsSupported, verified: reasons.length === 0, reasons }
}

const COUNT_KEYS = Object.keys(EMPTY) as (keyof Counts)[]

/** Rebuild a report from untrusted input: counts are clamped, the verdict recomputed. */
export function normalizeReport(raw: unknown): IntegrityReport | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const counts = { ...EMPTY }
  for (const k of COUNT_KEYS) {
    const n = Number(r[k])
    counts[k] = Number.isFinite(n) ? Math.min(Math.max(0, Math.round(n)), 10_000_000) : 0
  }
  return summarize(counts, r.fullscreenSupported === true)
}
