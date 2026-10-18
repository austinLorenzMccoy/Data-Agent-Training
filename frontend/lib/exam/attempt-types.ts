// Shapes the test API returns. Shared by the routes and the test page.

import type { AssignmentType, OperationResult } from '@/lib/types'
import type { IntegrityReport } from '@/lib/integrity-core'
import type { PublicQuestion, ReviewItem } from './public'

export interface AttemptView {
  attemptId: string
  track: AssignmentType
  operationName: string
  questions: PublicQuestion[]
  answered: number[]
  startedAt: string
  expiresAt: string
  durationSec: number
  serverNow: string
}

export interface FinishView {
  result: OperationResult
  rankedUp: boolean
  items: ReviewItem[]
  integrity: IntegrityReport | null
}
