import { submitOperation } from './db'
import type { OperationSession, ScoreResult } from '../types'

export async function saveOperation(
  agentId: string,
  session: OperationSession,
  scoreResult: ScoreResult
): Promise<{
  success: boolean
  rankUp: boolean
  newRankId: number | null
  newBadgeIds: string[]
  error: string | null
}> {
  const timeTaken = session.endTime
    ? Math.round((session.endTime - session.startTime) / 1000)
    : null

  const { operation, error } = await submitOperation(
    agentId,
    session.operationName,
    scoreResult,
    Object.values(session.answers),
    timeTaken
  )

  if (error || !operation) {
    return { success: false, rankUp: false, newRankId: null, newBadgeIds: [], error }
  }

  const rankUp = !!(
    operation.rank_after &&
    operation.rank_before &&
    operation.rank_after > operation.rank_before
  )

  return {
    success:     true,
    rankUp,
    newRankId:   operation.rank_after,
    newBadgeIds: [],
    error:       null,
  }
}
