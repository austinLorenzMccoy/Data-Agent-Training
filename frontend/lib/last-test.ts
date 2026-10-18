import type { AssignmentType, OperationResult } from './types'
import type { IntegrityReport } from './integrity-core'

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
  integrity?: IntegrityReport
  certificateCode?: string
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
