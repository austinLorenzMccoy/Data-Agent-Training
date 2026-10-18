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

let cachedBank: Question[] | null = null
let cachedById: Map<string, Question> | null = null

function bank(): Question[] {
  if (!cachedBank) cachedBank = getQuestionBank(getEnabledTypes())
  return cachedBank
}

export function questionById(id: string): Question | undefined {
  if (!cachedById) cachedById = new Map(bank().map((q) => [q.id, q]))
  return cachedById.get(id)
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
