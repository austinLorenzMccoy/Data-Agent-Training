import type { AttemptRow, AttemptStore, CertificateInsert, GradeLogEntry, OperationRow } from './attempts'

// In-memory AttemptStore for tests. Mirrors the SQL guarantees the service
// relies on: one active attempt per agent, answers written once, deadline
// plus grace enforced on write, and finish claimed by a single caller.

export function memoryAttemptStore(opts: { now?: () => Date; graceSec?: number } = {}) {
  const now = opts.now ?? (() => new Date())
  const graceSec = opts.graceSec ?? 20
  const attempts = new Map<string, AttemptRow>()
  const operations = new Map<string, OperationRow>()
  const grades: GradeLogEntry[] = []
  const proficiency = new Set<string>()
  const certificates = new Map<string, CertificateInsert>()
  const reviewVisibility = new Map<string, boolean>()
  const finished: { attemptId: string; operationId: string; orgExamId: string | null }[] = []
  let seq = 0

  const store: AttemptStore = {
    async activeAttempt(agentId) {
      return [...attempts.values()].find((a) => a.agent_id === agentId && a.status === 'active') ?? null
    },
    async getAttempt(id) {
      const a = attempts.get(id)
      return a ? structuredClone(a) : null
    },
    async countAttempts(agentId, { since, track, orgExamId }) {
      return [...attempts.values()].filter(
        (a) =>
          a.agent_id === agentId &&
          (!since || a.started_at >= since) &&
          (!track || a.track === track) &&
          (!orgExamId || a.org_exam_id === orgExamId),
      ).length
    },
    async createAttempt(row) {
      if ([...attempts.values()].some((a) => a.agent_id === row.agent_id && a.status === 'active')) {
        throw new Error('duplicate key value violates unique constraint "idx_attempts_one_active"')
      }
      const id = `att_${++seq}`
      const full: AttemptRow = { ...row, id, answers: {}, status: 'active', finished_at: null, operation_id: null }
      attempts.set(id, full)
      return structuredClone(full)
    },
    async recordAnswer(attemptId, agentId, index, answer) {
      const a = attempts.get(attemptId)
      if (!a || a.agent_id !== agentId || a.status !== 'active') return false
      if (now().getTime() > Date.parse(a.expires_at) + graceSec * 1000) return false
      if (index < 0 || index >= a.questions.length || a.answers[String(index)]) return false
      a.answers[String(index)] = structuredClone(answer)
      return true
    },
    async claimFinish(attemptId, agentId) {
      const a = attempts.get(attemptId)
      if (!a || a.agent_id !== agentId || a.status !== 'active') return null
      a.status = 'finished'
      a.finished_at = now().toISOString()
      return structuredClone(a)
    },
    async insertOperation(op) {
      const id = `op_${++seq}`
      const row: OperationRow = { ...op, id, rank_before: 1, rank_after: 1, created_at: now().toISOString() }
      operations.set(id, row)
      return structuredClone(row)
    },
    async linkOperation(attemptId, operationId) {
      const a = attempts.get(attemptId)
      if (a) a.operation_id = operationId
    },
    async getOperation(id) {
      const o = operations.get(id)
      return o ? structuredClone(o) : null
    },
    async logGrade(entry) {
      grades.push(entry)
    },
    async issueCertificate(cert) {
      const code = `CERT${++seq}`
      certificates.set(code, cert)
      return { code }
    },
    async reviewVisible(orgExamId) {
      return reviewVisibility.get(orgExamId) ?? false
    },
    async onFinished(row, op) {
      finished.push({ attemptId: row.id, operationId: op.id, orgExamId: row.org_exam_id })
    },
    async hasPassedProficiency(agentId, examId) {
      return proficiency.has(`${agentId}:${examId}`)
    },
  }

  return {
    store,
    attempts,
    operations,
    grades,
    certificates,
    finished,
    setReviewVisible: (orgExamId: string, visible: boolean) => reviewVisibility.set(orgExamId, visible),
    passProficiency: (agentId: string, examId: string) => proficiency.add(`${agentId}:${examId}`),
  }
}
