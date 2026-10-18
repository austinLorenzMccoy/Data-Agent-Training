import 'server-only'
import { randomBytes } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/server'
import type { AttemptRow, AttemptStore, GradeLogEntry, OperationInsert, OperationRow } from './attempts'

// The generated Supabase types collapse to `never` on most tables (see
// lib/entitlements.ts), so rows are cast at this boundary.
type Admin = ReturnType<typeof createAdminClient>

function fail(where: string, error: { message: string } | null): never {
  throw new Error(`${where}: ${error?.message ?? 'no data'}`)
}

// Crockford base32 without I, L, O, U — easy to read aloud or retype.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function certificateCode(): string {
  const bytes = randomBytes(10)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % 32]
  return `${out.slice(0, 5)}-${out.slice(5)}`
}

export function supabaseAttemptStore(admin: Admin = createAdminClient()): AttemptStore {
  const attempts = () => admin.from('operation_attempts' as never)

  return {
    async activeAttempt(agentId) {
      const { data, error } = await attempts().select('*').eq('agent_id', agentId).eq('status', 'active').maybeSingle()
      if (error) fail('activeAttempt', error)
      return (data as unknown as AttemptRow) ?? null
    },

    async getAttempt(id) {
      const { data, error } = await attempts().select('*').eq('id', id).maybeSingle()
      if (error) fail('getAttempt', error)
      return (data as unknown as AttemptRow) ?? null
    },

    async countAttempts(agentId, { since, track, orgExamId }) {
      let q = attempts().select('id', { count: 'exact', head: true }).eq('agent_id', agentId)
      if (since) q = q.gte('started_at', since)
      if (track) q = q.eq('track', track)
      if (orgExamId) q = q.eq('org_exam_id', orgExamId)
      const { count, error } = await q
      if (error) fail('countAttempts', error)
      return count ?? 0
    },

    async createAttempt(row) {
      const { data, error } = await attempts().insert(row as never).select('*').single()
      if (error || !data) fail('createAttempt', error)
      return data as unknown as AttemptRow
    },

    async recordAnswer(attemptId, agentId, index, answer) {
      const { data, error } = await admin.rpc('record_attempt_answer' as never, {
        p_attempt_id: attemptId,
        p_agent_id: agentId,
        p_index: index,
        p_answer: answer,
      } as never)
      if (error) fail('recordAnswer', error)
      return data === true
    },

    async claimFinish(attemptId, agentId) {
      const { data, error } = await attempts()
        .update({ status: 'finished', finished_at: new Date().toISOString() } as never)
        .eq('id', attemptId)
        .eq('agent_id', agentId)
        .eq('status', 'active')
        .select('*')
      if (error) fail('claimFinish', error)
      const rows = data as unknown as AttemptRow[] | null
      return rows && rows.length === 1 ? rows[0] : null
    },

    async insertOperation(op: OperationInsert) {
      const { data, error } = await admin.from('operations').insert(op as never).select('*').single()
      if (error || !data) fail('insertOperation', error)
      return data as unknown as OperationRow
    },

    async linkOperation(attemptId, operationId) {
      const { error } = await attempts().update({ operation_id: operationId } as never).eq('id', attemptId)
      if (error) fail('linkOperation', error)
    },

    async getOperation(id) {
      const { data, error } = await admin.from('operations').select('*').eq('id', id).maybeSingle()
      if (error) fail('getOperation', error)
      return (data as unknown as OperationRow) ?? null
    },

    async logGrade(entry: GradeLogEntry) {
      const { error } = await admin.from('grading_log' as never).insert(entry as never)
      // A missing log row must not lose the candidate's answer.
      if (error) console.error('logGrade:', error.message)
    },

    async issueCertificate(cert) {
      const { data: agent } = await admin.from('agents').select('alias').eq('id', cert.agent_id).single()
      const display_name = (agent as unknown as { alias: string } | null)?.alias ?? 'Unnamed'
      for (let i = 0; i < 3; i++) {
        const code = certificateCode()
        const { error } = await admin.from('certificates' as never).insert({ ...cert, code, display_name } as never)
        if (!error) return { code }
        if (!error.message.includes('duplicate')) fail('issueCertificate', error)
      }
      throw new Error('issueCertificate: could not find a free code')
    },

    async hasPassedProficiency(agentId, examId) {
      const { data, error } = await admin
        .from('proficiency_results' as never)
        .select('passed')
        .eq('agent_id', agentId)
        .eq('exam_id', examId)
        .maybeSingle()
      if (error) fail('hasPassedProficiency', error)
      return (data as unknown as { passed: boolean } | null)?.passed === true
    },
  }
}
