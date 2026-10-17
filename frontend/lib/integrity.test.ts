import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { summarize } from './integrity'

const clean = {
  fullscreenExits: 0,
  tabSwitches: 0,
  awayMs: 0,
  pasteBlocked: 0,
  dropBlocked: 0,
  injectedText: 0,
}

describe('summarize', () => {
  it('verifies a clean attempt', () => {
    assert.equal(summarize(clean, true).verified, true)
  })

  it('tolerates a couple of brief tab switches', () => {
    assert.equal(summarize({ ...clean, tabSwitches: 2, awayMs: 8000 }, true).verified, true)
  })

  it('flags long time away even with one switch', () => {
    const r = summarize({ ...clean, tabSwitches: 1, awayMs: 45_000 }, true)
    assert.equal(r.verified, false)
    assert.match(r.reasons[0], /45s/)
  })

  it('ignores fullscreen exits where fullscreen is unsupported', () => {
    assert.equal(summarize({ ...clean, fullscreenExits: 5 }, false).verified, true)
    assert.equal(summarize({ ...clean, fullscreenExits: 5 }, true).verified, false)
  })

  it('flags any injected text', () => {
    assert.equal(summarize({ ...clean, injectedText: 1 }, true).verified, false)
  })
})
