import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyResume, parseResume, resumeTips, rolePreset, splitBullets } from './resume'

test('parseResume rejects junk and keeps valid fields', () => {
  assert.equal(parseResume(null), null)
  assert.equal(parseResume('not json'), null)
  assert.equal(parseResume('42'), null)
  const r = parseResume(JSON.stringify({ role: 'hacker', name: 'Ada', skills: ['SQL', 7, ''], experience: [null, { role: 'Tutor' }] }))
  assert.ok(r)
  assert.equal(r.role, 'generalist')
  assert.equal(r.name, 'Ada')
  assert.deepEqual(r.skills, ['SQL'])
  assert.deepEqual(r.experience, [{ role: 'Tutor', org: '', dates: '', bullets: '' }])
})

test('splitBullets strips markers and blank lines', () => {
  assert.deepEqual(splitBullets('- one\n\n• two\n  three  '), ['one', 'two', 'three'])
})

test('resumeTips flags placeholders and clears for a full resume', () => {
  const r = emptyResume('domain')
  r.experience[0].bullets = rolePreset('domain').bullets.join('\n')
  assert.ok(resumeTips(r).some((t) => t.includes('placeholder')))

  const done = emptyResume()
  Object.assign(done, {
    name: 'Ada',
    email: 'a@b.co',
    summary: 'x'.repeat(130),
    skills: ['a', 'b', 'c', 'd', 'e'],
    experience: [{ role: 'Tutor', org: 'X', dates: '', bullets: 'Taught 40 students\nWrote notes\nGraded essays' }],
    education: [{ degree: 'B.Sc.', school: 'U', dates: '', detail: '' }],
  })
  assert.deepEqual(resumeTips(done), [])
})
