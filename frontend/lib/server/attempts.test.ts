import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import type { Question } from '@/lib/types'
import { ANSWER_GRACE_SEC, AttemptError, answerAttempt, finishAttempt, startAttempt } from './attempts'
import { memoryAttemptStore } from './memory-store'
import { drawExam, drawPractice, isExamOnly, practicePool, questionById, questionsOfType } from './bank'
import { applyPermutation } from '@/lib/exam/shuffle'
import type { GradeInput, GradeOutput } from './grader'

const AGENT = 'agent-1'
const allow = async () => ({ allowed: true as const })
const fullMarks = async (_: GradeInput): Promise<GradeOutput> => ({
  score: 2,
  feedback: 'ok',
  mode: 'ai',
  model: 'test-model',
  flaggedInjection: false,
})

let clock = new Date('2026-10-18T10:00:00Z')
const now = () => clock
let mem = memoryAttemptStore({ now })

beforeEach(() => {
  clock = new Date('2026-10-18T10:00:00Z')
  mem = memoryAttemptStore({ now })
})

async function rejectsWith(p: Promise<unknown>, code: string) {
  await assert.rejects(p, (err: unknown) => err instanceof AttemptError && err.code === code)
}

/** The shown index / label of the correct option, given the attempt's permutation. */
function correctShownSelection(q: Question, perm: number[]): unknown {
  if (q.type === 'delta' || q.type === 'kappa') {
    const shown = applyPermutation(q, perm)
    return shown.responses!.indexOf(q.responses![q.correctAnswer as number])
  }
  if ((q.type === 'beta' || q.type === 'iota') && perm[0] === 1) return q.correctAnswer === 'A' ? 'B' : 'A'
  return q.correctAnswer
}

describe('startAttempt', () => {
  it('returns questions without answers and a server deadline', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'delta', checkQuota: allow, now: clock })
    assert.ok(view.questions.length > 0)
    for (const q of view.questions) assert.equal((q as unknown as Record<string, unknown>).correctAnswer, undefined)
    assert.ok(Date.parse(view.expiresAt) > Date.parse(view.startedAt))
    assert.equal(view.serverNow, clock.toISOString())
  })

  it('resumes the running attempt instead of drawing again', async () => {
    const a = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    const b = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    assert.equal(a.attemptId, b.attemptId)
    assert.deepEqual(
      a.questions.map((q) => q.id),
      b.questions.map((q) => q.id),
    )
  })

  it('refuses a second track while one is running', async () => {
    await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    await rejectsWith(startAttempt({ store: mem.store, agentId: AGENT, track: 'alpha', checkQuota: allow, now: clock }), 'busy')
  })

  it('scores an expired attempt before starting a new one', async () => {
    const a = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    clock = new Date(Date.parse(a.expiresAt) + 60_000)
    const b = await startAttempt({ store: mem.store, agentId: AGENT, track: 'alpha', checkQuota: allow, now: clock })
    assert.notEqual(a.attemptId, b.attemptId)
    assert.equal(mem.attempts.get(a.attemptId)!.status, 'finished')
    assert.equal(mem.operations.size, 1)
  })

  it('respects the quota check', async () => {
    const deny = async () => ({ allowed: false as const, reason: 'quota_exceeded', limit: 2, plan: 'free' })
    await rejectsWith(startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: deny, now: clock }), 'quota_exceeded')
    assert.equal(mem.attempts.size, 0)
  })

  it('caps attempts per track when EXAM_MAX_ATTEMPTS_PER_TRACK is set', async () => {
    process.env.EXAM_MAX_ATTEMPTS_PER_TRACK = '1'
    try {
      const a = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
      await finishAttempt({ store: mem.store, agentId: AGENT, attemptId: a.attemptId, integrity: null, now: clock })
      await rejectsWith(startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock }), 'attempt_limit')
    } finally {
      delete process.env.EXAM_MAX_ATTEMPTS_PER_TRACK
    }
  })

  it('rejects unknown tracks', async () => {
    await rejectsWith(startAttempt({ store: mem.store, agentId: AGENT, track: 'omega', checkQuota: allow, now: clock }), 'unknown_track')
  })
})

describe('answerAttempt / finishAttempt', () => {
  async function perfectRun(track: string) {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track, checkQuota: allow, now: clock })
    const row = mem.attempts.get(view.attemptId)!
    for (let i = 0; i < row.questions.length; i++) {
      const q = questionById(row.questions[i].id)!
      await answerAttempt({
        store: mem.store,
        agentId: AGENT,
        attemptId: view.attemptId,
        index: i,
        selection: correctShownSelection(q, row.questions[i].perm),
        justification: 'Because the response invents a citation, which is a factual accuracy failure.',
        now: clock,
        grade: fullMarks,
      })
    }
    return finishAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, integrity: null, now: clock })
  }

  for (const track of ['alpha', 'beta', 'gamma', 'delta', 'kappa', 'iota']) {
    it(`scores a perfect ${track} run at 100% through shuffled options`, async () => {
      const out = await perfectRun(track)
      assert.equal(out.result.iqScore, 100)
      assert.equal(out.result.passed, true)
      assert.ok(out.items.every((i) => i.correct))
    })
  }

  it('issues a certificate for a pass and none for a fail', async () => {
    const pass = await perfectRun('gamma')
    assert.ok(pass.certificateCode)
    assert.equal(mem.certificates.get(pass.certificateCode!)?.score, 100)
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'delta', checkQuota: allow, now: clock })
    const fail = await finishAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, integrity: null, now: clock })
    assert.equal(fail.certificateCode, undefined)
    assert.equal(mem.certificates.size, 1)
  })

  it('logs each graded reason with its model', async () => {
    await perfectRun('alpha')
    assert.ok(mem.grades.length > 0)
    assert.ok(mem.grades.every((g) => g.model === 'test-model' && g.attempt_id))
  })

  it('refuses a second answer to the same question', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    const args = { store: mem.store, agentId: AGENT, attemptId: view.attemptId, index: 0, selection: { decision: 'CLEAR', flags: [] }, now: clock }
    await answerAttempt(args)
    await rejectsWith(answerAttempt(args), 'already_answered')
  })

  it('refuses answers after the deadline plus grace', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    clock = new Date(Date.parse(view.expiresAt) + (ANSWER_GRACE_SEC + 1) * 1000)
    await rejectsWith(
      answerAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, index: 0, selection: null, now: clock }),
      'expired',
    )
  })

  it('accepts an answer inside the grace window', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    clock = new Date(Date.parse(view.expiresAt) + 5_000)
    const out = await answerAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, index: 0, selection: null, now: clock })
    assert.equal(out.answered, 1)
  })

  it('hides attempts from other agents', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    await rejectsWith(
      answerAttempt({ store: mem.store, agentId: 'intruder', attemptId: view.attemptId, index: 0, selection: null, now: clock }),
      'not_found',
    )
    await rejectsWith(finishAttempt({ store: mem.store, agentId: 'intruder', attemptId: view.attemptId, integrity: null }), 'not_found')
  })

  it('is idempotent: finishing twice writes one result', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    const a = await finishAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, integrity: null, now: clock })
    const b = await finishAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, integrity: null, now: clock })
    assert.equal(mem.operations.size, 1)
    assert.equal(a.result.id, b.result.id)
    assert.equal(a.result.iqScore, 0)
  })

  it('recomputes the integrity verdict instead of trusting the browser', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    const out = await finishAttempt({
      store: mem.store,
      agentId: AGENT,
      attemptId: view.attemptId,
      integrity: { tabSwitches: 9, verified: true, reasons: [] },
      now: clock,
    })
    assert.equal(out.integrity?.verified, false)
  })

  it('caps time taken at the deadline', async () => {
    const view = await startAttempt({ store: mem.store, agentId: AGENT, track: 'gamma', checkQuota: allow, now: clock })
    clock = new Date(Date.parse(view.expiresAt) + 3_600_000)
    await finishAttempt({ store: mem.store, agentId: AGENT, attemptId: view.attemptId, integrity: null, now: clock })
    const op = [...mem.operations.values()][0]
    assert.equal(op.time_taken_seconds, view.durationSec)
  })
})

describe('question bank pools', () => {
  it('never serves exam-only questions in practice', () => {
    for (const t of ['alpha', 'gamma', 'delta', 'kappa'] as const) {
      assert.ok(practicePool(t).every((q) => !isExamOnly(q)))
      for (let i = 0; i < 10; i++) assert.ok(drawPractice(t, 8).every((q) => !isExamOnly(q)))
    }
  })

  it('reserves some questions for tests once a type has 12 or more', () => {
    const gamma = questionsOfType('gamma')
    assert.ok(gamma.length >= 12)
    assert.ok(gamma.some(isExamOnly))
  })

  it('puts every reserved question into a test draw', () => {
    const reserved = questionsOfType('gamma').filter(isExamOnly)
    const drawn = new Set(drawExam('gamma', 12).map((q) => q.id))
    assert.ok(reserved.slice(0, 12).every((q) => drawn.has(q.id)))
  })
})

describe('certificate codes', () => {
  it('normalizes typed codes', async () => {
    const { normalizeCode } = await import('./certificates')
    assert.equal(normalizeCode(' 7kq2m x9d4r '), '7KQ2M-X9D4R')
    assert.equal(normalizeCode('7KQ2M-X9D4R'), '7KQ2M-X9D4R')
  })
})
