import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { OperationResult } from './types'
import { weakAreas } from './weak-areas'

function result(operationName: string, iqScore: number, completedAt: number): OperationResult {
  return {
    id: String(completedAt),
    operationName,
    iqScore,
    passed: iqScore >= 70,
    xpEarned: 0,
    bestStreak: 0,
    completedAt,
    rankAtCompletion: '',
    categoryScores: {} as OperationResult['categoryScores'],
    totalAssignments: 10,
  }
}

describe('weakAreas', () => {
  it('ranks the lowest recent test scores first and skips strong types', () => {
    const history = [
      result('Rate a response', 40, 1),
      result('Rate a response', 60, 2),
      result('Review a transcript', 90, 3),
      result('Pick the best reply', 70, 4),
    ]
    const out = weakAreas(history, {}, ['alpha', 'gamma', 'delta'])
    assert.deepEqual(
      out.map((w) => w.type),
      ['alpha', 'delta'],
    )
    assert.equal(out[0].score, 50)
  })

  it('uses only the three most recent tests', () => {
    const history = [10, 100, 100, 100].map((s, i) => result('Rate a response', s, i))
    assert.deepEqual(weakAreas(history, {}, ['alpha']), [])
  })

  it('falls back to practice accuracy when there are no tests', () => {
    const out = weakAreas([], { beta: { answered: 8, credit: 4 }, gamma: { answered: 2, credit: 0 } }, ['beta', 'gamma'])
    assert.deepEqual(out, [{ type: 'beta', score: 50, basis: 'practice', samples: 8 }])
  })
})
