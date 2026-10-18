import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getQuestionBank } from '@/lib/questions'
import { ALL_ASSIGNMENT_TYPES, XP } from '@/lib/scoring'
import type { Question } from '@/lib/types'
import { toPublicQuestion } from './sanitize'
import { applyPermutation, canonicalSelection, randomPermutation } from './shuffle'
import { scoreAnswer, tallyAttempt } from './score'
import { GOLD_FIELDS } from './public'

const bank = getQuestionBank(ALL_ASSIGNMENT_TYPES)
const byType = (t: Question['type']) => bank.filter((q) => q.type === t)

// Keys anywhere in the output that carry the answer key. (Top-level `rubric`
// is checked via GOLD_FIELDS; zeta's `payload.rubric` is only the UI mode.)
const SECRET_KEYS = /"(correct_[a-z_]*|reference_[a-z_]*|correctAnswer|explanation|ratingA|ratingB|has_navigational_result|weights|degrees_of_separation)"/

describe('toPublicQuestion', () => {
  it('drops every gold field from every question in the bank', () => {
    for (const q of bank) {
      const pub = toPublicQuestion(q, randomPermutation(q)) as unknown as Record<string, unknown>
      for (const f of GOLD_FIELDS) assert.equal(pub[f], undefined, `${q.id} leaks ${f}`)
      const json = JSON.stringify(pub)
      assert.doesNotMatch(json, SECRET_KEYS, `${q.id} leaks a payload answer`)
      if (q.explanation.length > 40) {
        assert.ok(!json.includes(q.explanation), `${q.id} leaks its explanation text`)
      }
    }
  })

  it('keeps what the renderers need', () => {
    for (const q of bank) {
      const pub = toPublicQuestion(q)
      assert.equal(pub.id, q.id)
      assert.equal(pub.prompt, q.prompt)
      if (q.responses) assert.equal(pub.responses?.length, q.responses.length)
      if (q.payload) assert.ok(pub.payload, `${q.id} lost its payload`)
    }
  })
})

describe('option shuffle', () => {
  it('maps the shown correct option back to the gold answer (delta, kappa)', () => {
    for (const q of [...byType('delta'), ...byType('kappa')]) {
      for (let trial = 0; trial < 5; trial++) {
        const perm = randomPermutation(q)
        const shown = applyPermutation(q, perm)
        const shownIndex = shown.responses!.indexOf(q.responses![q.correctAnswer as number])
        assert.equal(canonicalSelection(q, perm, shownIndex), q.correctAnswer, q.id)
        assert.equal(scoreAnswer(q, canonicalSelection(q, perm, shownIndex)).correct, true)
      }
    }
  })

  it('swaps A/B consistently (beta, iota)', () => {
    for (const q of [...byType('beta'), ...byType('iota')]) {
      const swapped = [1, 0]
      const shown = applyPermutation(q, swapped)
      assert.equal(shown.responseA, q.responseB)
      const shownPick = q.correctAnswer === 'A' ? 'B' : 'A'
      assert.equal(canonicalSelection(q, swapped, shownPick), q.correctAnswer, q.id)
    }
  })

  it('leaves out-of-range picks alone so they score zero', () => {
    const q = byType('delta')[0]
    const perm = randomPermutation(q)
    assert.equal(canonicalSelection(q, perm, 99), 99)
    assert.equal(scoreAnswer(q, 99).ratio, 0)
  })
})

describe('scoreAnswer', () => {
  const alpha = byType('alpha')[0]

  it('lets a correct pick with a full-marks reason reach 100%', () => {
    const s = scoreAnswer(alpha, alpha.correctAnswer, 2)
    assert.equal(s.pointsEarned, s.pointsPossible)
  })

  it('gives no reason points to a wrong pick', () => {
    const wrong = alpha.correctAnswer === 'CLEAR' ? 'COMPROMISED' : 'CLEAR'
    assert.equal(scoreAnswer(alpha, wrong, 2).pointsEarned, 0)
  })

  it('gives partial reason points for a partial reason', () => {
    const s = scoreAnswer(alpha, alpha.correctAnswer, 1)
    assert.equal(s.pointsEarned, alpha.xpValue + XP.JUSTIFICATION_PARTIAL)
  })

  it('scores malformed selections as zero instead of throwing', () => {
    for (const t of ALL_ASSIGNMENT_TYPES) {
      for (const q of byType(t).slice(0, 2)) {
        for (const junk of [null, 'x', 42, { results: 'nope' }, [1, 2], { segments: 7 }]) {
          assert.doesNotThrow(() => scoreAnswer(q, junk))
        }
      }
    }
  })
})

describe('tallyAttempt', () => {
  it('passes a perfect alpha test (regression: reasons were never counted)', () => {
    const qs = byType('alpha').slice(0, 5)
    const stored = Object.fromEntries(
      qs.map((q, i) => [String(i), { questionId: q.id, selection: q.correctAnswer, justificationScore: 2 as const, answeredAt: 0 }]),
    )
    const { answers } = tallyAttempt(qs, stored)
    const earned = answers.reduce((s, a) => s + a.pointsEarned, 0)
    const possible = answers.reduce((s, a) => s + a.pointsPossible, 0)
    assert.equal(earned, possible)
  })

  it('scores unanswered questions as zero against their full maximum', () => {
    const qs = byType('gamma').slice(0, 4)
    const stored = { '0': { questionId: qs[0].id, selection: qs[0].correctAnswer, answeredAt: 0 } }
    const { answers } = tallyAttempt(qs, stored)
    assert.equal(answers.length, 4)
    assert.equal(answers.filter((a) => a.correct).length, 1)
    assert.ok(answers.slice(1).every((a) => a.pointsEarned === 0 && a.pointsPossible > 0))
  })

  it('tracks the best streak', () => {
    const qs = byType('gamma').slice(0, 5)
    const stored = Object.fromEntries(
      qs.map((q, i) => [String(i), { questionId: q.id, selection: i === 2 ? null : q.correctAnswer, answeredAt: 0 }]),
    )
    assert.equal(tallyAttempt(qs, stored).bestStreak, 2)
  })
})
