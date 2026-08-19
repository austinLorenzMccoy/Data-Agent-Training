import { EN_CA_QUESTIONS } from './proficiency-en-ca'

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

export interface ProficiencyExam {
  id: string
  label: string
  passScore: number
  timeLimitSec: number
  questions: ProficiencyQuestion[]
}

export const PROFICIENCY_COOKIE_PREFIX = 'dna_proficiency_'
export const PROFICIENCY_STORAGE_KEY = 'dna.proficiency.v1'

export const EN_CA_EXAM: ProficiencyExam = {
  id: 'en-CA',
  label: 'English (Canada) Language Proficiency',
  passScore: 80,
  timeLimitSec: 50 * 60,
  questions: EN_CA_QUESTIONS,
}

export const PROFICIENCY_EXAMS: Record<string, ProficiencyExam> = {
  'en-CA': EN_CA_EXAM,
}

export function getExam(id: string): ProficiencyExam | undefined {
  return PROFICIENCY_EXAMS[id]
}

export interface ProficiencyRecord {
  examId: string
  score: number
  passed: boolean
  completedAt: number
}

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

export function scoreExam(exam: ProficiencyExam, answers: Record<string, string>): { score: number; passed: boolean } {
  const total = exam.questions.length
  const hits = exam.questions.filter((q) => answers[q.id] === q.correctId).length
  const score = total === 0 ? 0 : Math.round((hits / total) * 100)
  return { score, passed: score >= exam.passScore }
}
