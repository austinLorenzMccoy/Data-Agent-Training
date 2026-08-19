import type { Answer, AssignmentType, OperationResult, Question } from './types'

export const LAST_TEST_KEY = 'dna.lastTest.v1'

export interface LastTestItem {
  questionId: string
  type: AssignmentType
  title: string
  explanation: string
  correct: boolean
  pointsEarned: number
  pointsPossible: number
}

export interface LastTest {
  result: OperationResult
  rankedUp: boolean
  items: LastTestItem[]
}

export function saveLastTest(data: LastTest) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(LAST_TEST_KEY, JSON.stringify(data))
}

export function loadLastTest(): LastTest | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(LAST_TEST_KEY)
    return raw ? (JSON.parse(raw) as LastTest) : null
  } catch {
    return null
  }
}

export function buildLastTest(
  result: OperationResult,
  rankedUp: boolean,
  questions: Question[],
  answers: Answer[],
): LastTest {
  const byId = new Map(questions.map((q) => [q.id, q]))
  return {
    result,
    rankedUp,
    items: answers.map((a) => {
      const q = byId.get(a.questionId)
      return {
        questionId: a.questionId,
        type: a.type,
        title: q?.operationContext ?? a.questionId,
        explanation: q?.explanation ?? '',
        correct: a.correct,
        pointsEarned: a.pointsEarned,
        pointsPossible: a.pointsPossible,
      }
    }),
  }
}
