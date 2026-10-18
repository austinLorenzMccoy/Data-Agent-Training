import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { describe, it } from 'node:test'
import { verifyWebhookSignature } from './paystack'

process.env.PAYSTACK_SECRET_KEY = 'sk_test_unit'
const body = JSON.stringify({ event: 'charge.success', data: { customer: { customer_code: 'CUS_1' } } })
const sign = (b: string, key = 'sk_test_unit') => createHmac('sha512', key).update(b).digest('hex')

describe('verifyWebhookSignature', () => {
  it('accepts a body signed with the secret key', () => {
    assert.equal(verifyWebhookSignature(body, sign(body)), true)
  })
  it('rejects a missing signature', () => {
    assert.equal(verifyWebhookSignature(body, null), false)
  })
  it('rejects a signature from another key', () => {
    assert.equal(verifyWebhookSignature(body, sign(body, 'sk_test_other')), false)
  })
  it('rejects a tampered body', () => {
    assert.equal(verifyWebhookSignature(body.replace('CUS_1', 'CUS_2'), sign(body)), false)
  })
  it('rejects a malformed header without throwing', () => {
    assert.equal(verifyWebhookSignature(body, 'not-hex'), false)
  })
})
