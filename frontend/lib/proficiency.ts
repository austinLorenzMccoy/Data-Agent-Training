import type { IntegrityReport } from './integrity-core'

export interface ProficiencyChoice {
  id: string
  text: string
}

export interface ProficiencyQuestion {
  id: string
  kind: 'mcq' | 'listening'
  prompt: string
  audioUrl?: string
  choices: ProficiencyChoice[]
  correctId: string
}

/** A question as the browser sees it — the answer key stays on the server. */
export type PublicProficiencyQuestion = Omit<ProficiencyQuestion, 'correctId'>

export interface ProficiencyExamMeta {
  id: string
  label: string
  passScore: number
  timeLimitSec: number
}

export interface ProficiencyExam extends ProficiencyExamMeta {
  questions: ProficiencyQuestion[]
}

export interface PublicProficiencyExam extends ProficiencyExamMeta {
  questions: PublicProficiencyQuestion[]
}

export const PROFICIENCY_COOKIE_PREFIX = 'dna_proficiency_'
export const PROFICIENCY_STORAGE_KEY = 'dna.proficiency.v1'

export const EXAM_META: Record<string, ProficiencyExamMeta> = {
  'en-CA': {
    id: 'en-CA',
    label: 'English (Canada) Language Proficiency',
    passScore: 80,
    timeLimitSec: 50 * 60,
  },
}

export interface ProficiencyRecord {
  examId: string
  score: number
  passed: boolean
  completedAt: number
  integrity?: IntegrityReport
}

// The server's proficiency_results row is the record the test gate reads.
// This local copy only saves a round trip when drawing locked badges.
function readStore(): Record<string, ProficiencyRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROFICIENCY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ProficiencyRecord>) : {}
  } catch {
    return {}
  }
}

export function getProficiencyRecord(examId: string): ProficiencyRecord | null {
  return readStore()[examId] ?? null
}

export function hasPassedProficiency(examId: string): boolean {
  if (typeof document !== 'undefined') {
    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${PROFICIENCY_COOKIE_PREFIX}${examId}=`))
    if (cookie?.split('=')[1] === 'passed') return true
  }
  return getProficiencyRecord(examId)?.passed === true
}

export function saveProficiencyResult(record: ProficiencyRecord): void {
  if (typeof window === 'undefined') return
  const store = readStore()
  store[record.examId] = record
  localStorage.setItem(PROFICIENCY_STORAGE_KEY, JSON.stringify(store))
  const value = record.passed ? 'passed' : 'failed'
  document.cookie = `${PROFICIENCY_COOKIE_PREFIX}${record.examId}=${value}; path=/; max-age=31536000; samesite=lax`
}
