import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { backoffMinutes, isAllowedWebhookUrl, signPayload, verifySignature } from './webhooks'
import { rescoreAttempt } from './review'
import { answerAttempt, finishAttempt, startAttempt, AttemptError, type OrgExamConfig } from './attempts'
import { memoryAttemptStore } from './memory-store'
import { questionsOfType } from './bank'
import { hashApiKey, isPlatformAdmin, newApiKey } from './orgs'

describe('webhook signatures', () => {
  const secret = 'whsec_test'
  const body = JSON.stringify({ event: 'exam.completed', data: { score: 80 } })

  it('verifies its own signature', () => {
    assert.equal(verifySignature(secret, body, signPayload(secret, body)), true)
  })
  it('rejects a changed body or wrong secret', () => {
    const sig = signPayload(secret, body)
    assert.equal(verifySignature(secret, body.replace('80', '100'), sig), false)
    assert.equal(verifySignature('whsec_other', body, sig), false)
  })
  it('rejects stale timestamps (replay)', () => {
    const old = Math.floor(Date.now() / 1000) - 3600
    assert.equal(verifySignature(secret, body, signPayload(secret, body, old)), false)
  })
  it('backs off quadratically, capped at 6 hours', () => {
    assert.deepEqual([1, 2, 3, 50].map(backoffMinutes), [1, 4, 9, 360])
  })
  it('only allows public https targets', () => {
    assert.equal(isAllowedWebhookUrl('https://hooks.example.com/x'), true)
    for (const bad of ['http://example.com', 'https://localhost/x', 'https://127.0.0.1/x', 'https://10.0.0.5/', 'https://192.168.1.1/', 'https://172.16.0.1/', 'https://[::1]/', 'notaurl']) {
      assert.equal(isAllowedWebhookUrl(bad), false, bad)
    }
  })
})

describe('API keys and admins', () => {
  it('stores only a hash and a short prefix', () => {
    const { key, prefix, hash } = newApiKey()
    assert.ok(key.startsWith('dn_live_'))
    assert.ok(key.startsWith(prefix))
    assert.equal(hash, hashApiKey(key))
    assert.ok(!hash.includes(key))
  })
  it('reads platform admins from ADMIN_EMAILS', () => {
    process.env.ADMIN_EMAILS = 'Boss@Example.com, other@example.com'
    assert.equal(isPlatformAdmin({ email: 'boss@example.com' }), true)
    assert.equal(isPlatformAdmin({ email: 'nobody@example.com' }), false)
    delete process.env.ADMIN_EMAILS
  })
})

describe('rescoreAttempt', () => {
  it('raises the score when a reviewer upgrades a reason', () => {
    const qs = questionsOfType('alpha').slice(0, 2)
    const row = {
      operation_name: 'Rate a response',
      questions: qs.map((q) => ({ id: q.id, perm: [] })),
      answers: Object.fromEntries(
        qs.map((q, i) => [String(i), { questionId: q.id, selection: q.correctAnswer, justificationScore: 0 as const, answeredAt: 0 }]),
      ),
    }
    const before = rescoreAttempt(row, 0, 0).result.iqScore
    const after = rescoreAttempt(row, 0, 2).result.iqScore
    assert.ok(after > before)
    assert.equal(rescoreAttempt(row, 0, 2).answers['0'].justificationScore, 2)
    assert.equal(row.answers['0'].justificationScore, 0, 'input is not mutated')
  })
})

describe('organisation exams', () => {
  const clock = new Date('2026-10-18T10:00:00Z')
  const exam: OrgExamConfig = {
    id: 'exam-1',
    title: 'Screening',
    track: 'gamma',
    questionCount: 5,
    minutes: 15,
    maxAttempts: 1,
    opensAt: null,
    closesAt: null,
    archived: false,
  }
  const neverQuota = async () => {
    throw new Error('org exams must not touch the learner quota')
  }

  it('uses the exam length, timer and name, and skips the quota', async () => {
    const mem = memoryAttemptStore({ now: () => clock })
    const view = await startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock })
    assert.equal(view.questions.length, 5)
    assert.equal(view.durationSec, 15 * 60)
    assert.equal(view.operationName, 'Screening')
    assert.equal(mem.attempts.get(view.attemptId)!.org_exam_id, 'exam-1')
  })

  it('allows only max_attempts per candidate', async () => {
    const mem = memoryAttemptStore({ now: () => clock })
    const v = await startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock })
    await finishAttempt({ store: mem.store, agentId: 'a', attemptId: v.attemptId, integrity: null, now: clock })
    await assert.rejects(
      startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock }),
      (e: unknown) => e instanceof AttemptError && e.code === 'attempt_limit',
    )
  })

  it('refuses closed and archived exams', async () => {
    const mem = memoryAttemptStore({ now: () => clock })
    for (const cfg of [{ ...exam, archived: true }, { ...exam, closesAt: '2026-10-01T00:00:00Z' }]) {
      await assert.rejects(
        startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: cfg, checkQuota: neverQuota, now: clock }),
        (e: unknown) => e instanceof AttemptError && e.code === 'exam_closed',
      )
    }
  })

  it('hides the review from candidates unless the exam allows it, and fires the finish hook', async () => {
    const mem = memoryAttemptStore({ now: () => clock })
    const v = await startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock })
    await answerAttempt({ store: mem.store, agentId: 'a', attemptId: v.attemptId, index: 0, selection: null, now: clock })
    const out = await finishAttempt({ store: mem.store, agentId: 'a', attemptId: v.attemptId, integrity: null, now: clock })
    assert.deepEqual(out.items, [])
    assert.equal(mem.finished.length, 1)
    assert.equal(mem.finished[0].orgExamId, 'exam-1')

    const mem2 = memoryAttemptStore({ now: () => clock })
    mem2.setReviewVisible('exam-1', true)
    const v2 = await startAttempt({ store: mem2.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock })
    const out2 = await finishAttempt({ store: mem2.store, agentId: 'a', attemptId: v2.attemptId, integrity: null, now: clock })
    assert.equal(out2.items.length, 5)
  })

  it('does not resume a learner attempt as an org exam', async () => {
    const mem = memoryAttemptStore({ now: () => clock })
    await startAttempt({ store: mem.store, agentId: 'a', track: 'gamma', checkQuota: async () => ({ allowed: true }), now: clock })
    await assert.rejects(
      startAttempt({ store: mem.store, agentId: 'a', track: '', orgExam: exam, checkQuota: neverQuota, now: clock }),
      (e: unknown) => e instanceof AttemptError && e.code === 'busy',
    )
  })
})
