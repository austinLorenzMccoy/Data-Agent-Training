import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getQuestionBank } from '@/lib/questions'
import { ALL_ASSIGNMENT_TYPES } from '@/lib/scoring'
import { validateQuestion } from './validate'

describe('validateQuestion', () => {
  it('accepts every built-in question', () => {
    for (const q of getQuestionBank(ALL_ASSIGNMENT_TYPES)) {
      const r = validateQuestion(structuredClone(q))
      assert.equal(r.ok, true, `${q.id}: ${r.ok ? '' : r.errors.join(' | ')}`)
    }
  })

  it('reports every problem at once', () => {
    const r = validateQuestion({ id: 'Bad Id', type: 'delta', responses: ['only one'], correctAnswer: 3 })
    assert.equal(r.ok, false)
    if (!r.ok) {
      assert.ok(r.errors.some((e) => e.startsWith('id')))
      assert.ok(r.errors.some((e) => e.startsWith('responses')))
      assert.ok(r.errors.some((e) => e.startsWith('explanation')))
    }
  })

  it('rejects a flagged transcript with no reasons', () => {
    const base = structuredClone(getQuestionBank().find((q) => q.type === 'gamma')!)
    const r = validateQuestion({ ...base, correctAnswer: { decision: 'FLAGGED', flags: [] } })
    assert.equal(r.ok, false)
  })
})
