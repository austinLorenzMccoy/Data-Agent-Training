import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatUsd, newPeriodEnd } from './manual-payments'

const now = new Date('2026-10-18T12:00:00Z')
const day = 86_400_000

describe('newPeriodEnd', () => {
  it('gives 30 days from now to a new subscriber', () => {
    assert.equal(newPeriodEnd(now, null, 2).getTime(), now.getTime() + 30 * day)
  })
  it('adds 30 days to time left on the same plan', () => {
    const end = new Date(now.getTime() + 10 * day).toISOString()
    assert.equal(newPeriodEnd(now, { planId: 2, periodEnd: end }, 2).getTime(), now.getTime() + 40 * day)
  })
  it('starts fresh when switching plans or after expiry', () => {
    const end = new Date(now.getTime() + 10 * day).toISOString()
    assert.equal(newPeriodEnd(now, { planId: 2, periodEnd: end }, 3).getTime(), now.getTime() + 30 * day)
    const past = new Date(now.getTime() - day).toISOString()
    assert.equal(newPeriodEnd(now, { planId: 2, periodEnd: past }, 2).getTime(), now.getTime() + 30 * day)
  })
})

describe('formatUsd', () => {
  it('drops cents on whole dollars', () => {
    assert.equal(formatUsd(500), '$5')
    assert.equal(formatUsd(1250), '$12.50')
  })
})
