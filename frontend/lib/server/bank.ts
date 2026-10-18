import 'server-only'
import type { AssignmentType, Question } from '@/lib/types'
import { getQuestionBank } from '@/lib/questions'
import { getEnabledTypes } from '@/lib/feature-flags'
import { shuffled } from '@/lib/exam/shuffle'

/** Below this many questions a type keeps its whole bank open to practice. */
export const EXAM_RESERVE_MIN_BANK = 12

function fnv1a(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// The bank is the built-in questions plus edits made in the content admin
// (`bank_questions`). A live DB row with a built-in id replaces it; a new
// id adds a question; 'retired' takes it out of new draws. Retired
// questions stay resolvable by id so attempts already in flight can still
// be scored. An edit to a live question applies to any grading after it
// lands, including attempts in progress.

export interface BankRow {
  id: string
  data: Question
  status: 'draft' | 'live' | 'retired'
}

export type BankLoader = () => Promise<BankRow[]>

const REFRESH_MS = 60_000
let loader: BankLoader | null = defaultLoader
let dbRows: BankRow[] = []
let loadedAt = 0
let cachedBank: Question[] | null = null
let cachedById: Map<string, Question> | null = null

async function defaultLoader(): Promise<BankRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  const { createAdminClient } = await import('@/lib/supabase/server')
  const { data, error } = await createAdminClient()
    .from('bank_questions' as never)
    .select('id, data, status')
    .in('status', ['live', 'retired'])
  if (error) throw new Error(`bank_questions: ${error.message}`)
  return (data as unknown as BankRow[]) ?? []
}

/** Swap the DB source (tests), or pass null to use only the built-in bank. */
export function setBankLoader(fn: BankLoader | null) {
  loader = fn
  loadedAt = 0
  dbRows = []
  cachedBank = null
  cachedById = null
}

/** Pull content-admin edits at most once a minute per server instance. */
export async function ensureBank(force = false): Promise<void> {
  if (!loader || (!force && Date.now() - loadedAt < REFRESH_MS)) return
  try {
    dbRows = await loader()
    loadedAt = Date.now()
    cachedBank = null
    cachedById = null
  } catch (err) {
    // Keep serving the last good bank rather than failing tests mid-flight.
    console.error('ensureBank:', (err as Error).message)
    loadedAt = Date.now()
  }
}

function builtIn(): Question[] {
  return getQuestionBank(getEnabledTypes())
}

function bank(): Question[] {
  if (cachedBank) return cachedBank
  const enabled = new Set<string>(getEnabledTypes())
  const byId = new Map(builtIn().map((q) => [q.id, q]))
  for (const row of dbRows) {
    if (row.status === 'retired') byId.delete(row.id)
    else if (row.status === 'live' && enabled.has(row.data.type)) byId.set(row.id, { ...row.data, id: row.id })
  }
  cachedBank = [...byId.values()]
  return cachedBank
}

export function questionById(id: string): Question | undefined {
  if (!cachedById) {
    cachedById = new Map(builtIn().map((q) => [q.id, q]))
    for (const row of dbRows) cachedById.set(row.id, { ...row.data, id: row.id })
  }
  return cachedById.get(id)
}

/** Every question, built-in and edited, with where it comes from. For the content admin. */
export function allQuestionsForAdmin(): { question: Question; source: 'built-in' | 'edited' | 'new'; status: 'live' | 'retired' }[] {
  const builtInIds = new Set(getQuestionBank(['epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa']).map((q) => q.id))
  const live = new Map(bank().map((q) => [q.id, q]))
  const out: { question: Question; source: 'built-in' | 'edited' | 'new'; status: 'live' | 'retired' }[] = []
  const seen = new Set<string>()
  for (const row of dbRows) {
    seen.add(row.id)
    out.push({ question: { ...row.data, id: row.id }, source: builtInIds.has(row.id) ? 'edited' : 'new', status: row.status === 'retired' ? 'retired' : 'live' })
  }
  for (const q of live.values()) if (!seen.has(q.id)) out.push({ question: q, source: 'built-in', status: 'live' })
  return out
}

export function questionsOfType(type: AssignmentType): Question[] {
  return bank().filter((q) => q.type === type)
}

/**
 * About a third of each type (by a stable hash of the id) is reserved for
 * timed tests and never served in practice, where answers are revealed.
 * Types with a small bank stay fully open until the bank grows.
 */
export function isExamOnly(q: Question): boolean {
  if (questionsOfType(q.type).length < EXAM_RESERVE_MIN_BANK) return false
  return fnv1a(q.id) % 3 === 0
}

export function practicePool(type: AssignmentType): Question[] {
  return questionsOfType(type).filter((q) => !isExamOnly(q))
}

export function drawPractice(type: AssignmentType, count: number): Question[] {
  return shuffled(practicePool(type)).slice(0, count)
}

/**
 * Draw a test. Exam-only questions are taken first so a candidate who has
 * worked through practice still meets unseen items, then the rest of the
 * type fills the packet. Final order is random.
 */
export function drawExam(type: AssignmentType, count: number): Question[] {
  const all = questionsOfType(type)
  const reserved = shuffled(all.filter(isExamOnly))
  const open = shuffled(all.filter((q) => !isExamOnly(q)))
  return shuffled([...reserved, ...open].slice(0, count))
}

export function typeCounts(): Partial<Record<AssignmentType, number>> {
  const out: Partial<Record<AssignmentType, number>> = {}
  for (const q of bank()) out[q.type] = (out[q.type] ?? 0) + 1
  return out
}
