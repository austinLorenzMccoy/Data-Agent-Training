import 'server-only'
import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import { buildResult } from '@/lib/scoring'
import { tallyAttempt, type StoredAnswer } from '@/lib/exam/score'
import { questionById } from './bank'
import type { AttemptRow, OperationRow } from './attempts'
import { supabaseAttemptStore } from './attempt-store'
import { isPlatformAdmin, roleIn } from './orgs'
import { enqueue, resultPayload } from './webhooks'

type Admin = ReturnType<typeof createAdminClient>

export interface GradeLogRow {
  id: string
  agent_id: string | null
  attempt_id: string | null
  question_id: string
  question_index: number | null
  justification: string
  score: 0 | 1 | 2
  feedback: string | null
  mode: string
  model: string | null
  flagged_injection: boolean
  override_score: 0 | 1 | 2 | null
  override_note: string | null
  override_at: string | null
  created_at: string
}

/** Re-score an attempt with one justification grade changed. Pure; used by the override and its tests. */
export function rescoreAttempt(row: Pick<AttemptRow, 'questions' | 'answers' | 'operation_name'>, index: number, newScore: 0 | 1 | 2) {
  const answers: Record<string, StoredAnswer> = structuredClone(row.answers ?? {})
  const target = answers[String(index)]
  if (!target) throw new Error('No answer at that index')
  answers[String(index)] = { ...target, justificationScore: newScore }
  const questions = row.questions.map((r) => {
    const q = questionById(r.id)
    if (!q) throw new Error(`Unknown question ${r.id}`)
    return q
  })
  const { answers: scored, bestStreak } = tallyAttempt(questions, answers)
  const result = buildResult('rescore', row.operation_name, scored, bestStreak, '')
  return { answers, scored, result }
}

/** Who may review a grade: platform admins, or any member of the organisation whose exam it came from. */
export async function canReview(user: User, log: Pick<GradeLogRow, 'attempt_id'>, admin: Admin = createAdminClient()): Promise<boolean> {
  if (isPlatformAdmin(user)) return true
  if (!log.attempt_id) return false
  const { data } = await admin
    .from('operation_attempts' as never)
    .select('org_exams(org_id)')
    .eq('id', log.attempt_id)
    .maybeSingle()
  const orgId = (data as unknown as { org_exams: { org_id: string } | null } | null)?.org_exams?.org_id
  return !!orgId && !!(await roleIn(orgId, user.id, admin))
}

/**
 * Apply a reviewer's grade. Updates the log, the stored answer, the result
 * row, the candidate's XP, the certificate, and tells the organisation.
 */
export async function overrideGrade(user: User, logId: string, score: 0 | 1 | 2, note: string, admin: Admin = createAdminClient()) {
  const { data } = await admin.from('grading_log' as never).select('*').eq('id', logId).maybeSingle()
  const log = data as unknown as GradeLogRow | null
  if (!log) throw new Error('Grade not found')
  if (!(await canReview(user, log, admin))) throw new Error('Not allowed')

  await admin
    .from('grading_log' as never)
    .update({ override_score: score, override_by: user.id, override_note: note.slice(0, 500), override_at: new Date().toISOString() } as never)
    .eq('id', logId)

  if (!log.attempt_id || log.question_index === null) return { rescored: false }

  const { data: attemptData } = await admin.from('operation_attempts' as never).select('*').eq('id', log.attempt_id).single()
  const attempt = attemptData as unknown as AttemptRow
  if (attempt.status !== 'finished' || !attempt.operation_id) return { rescored: false }

  const { answers, scored, result } = rescoreAttempt(attempt, log.question_index, score)
  const { data: opData } = await admin.from('operations').select('*').eq('id', attempt.operation_id).single()
  const before = opData as unknown as OperationRow

  await admin.from('operation_attempts' as never).update({ answers } as never).eq('id', attempt.id)
  await admin
    .from('operations')
    .update({
      iq_score: Math.round(result.iqScore),
      passed: result.passed,
      xp_earned: result.xpEarned,
      questions_correct: scored.filter((a) => a.correct).length,
      category_scores: result.categoryScores,
      answers: scored,
    } as never)
    .eq('id', before.id)

  const delta = result.xpEarned - before.xp_earned
  if (delta !== 0) {
    await admin.rpc('adjust_agent_xp' as never, { p_agent_id: attempt.agent_id, p_delta: delta } as never)
  }

  // Certificates follow the new pass/fail.
  const { data: certData } = await admin
    .from('certificates' as never)
    .select('code, revoked_at')
    .eq('operation_id', before.id)
    .maybeSingle()
  const cert = certData as unknown as { code: string; revoked_at: string | null } | null
  if (result.passed && !cert) {
    await supabaseAttemptStore(admin).issueCertificate({
      agent_id: attempt.agent_id,
      operation_id: before.id,
      track: attempt.track,
      operation_name: attempt.operation_name,
      score: Math.round(result.iqScore),
      integrity_verified: (before.integrity as { verified?: boolean } | null)?.verified !== false,
      org_exam_id: attempt.org_exam_id,
    })
  } else if (cert) {
    await admin
      .from('certificates' as never)
      .update(
        (result.passed
          ? { score: Math.round(result.iqScore), revoked_at: null, revoked_reason: null }
          : { revoked_at: new Date().toISOString(), revoked_reason: 'Rescored below the pass mark after review' }) as never,
      )
      .eq('code', cert.code)
  }

  if (attempt.org_exam_id) {
    const { data: examData } = await admin
      .from('org_exams' as never)
      .select('id, org_id, title, track')
      .eq('id', attempt.org_exam_id)
      .single()
    const exam = examData as unknown as { id: string; org_id: string; title: string; track: string }
    const { data: candData } = await admin
      .from('org_exam_candidates' as never)
      .select('name, email')
      .eq('org_exam_id', exam.id)
      .eq('agent_id', attempt.agent_id)
      .maybeSingle()
    const cand = candData as unknown as { name: string | null; email: string | null } | null
    const integrity = before.integrity as { verified?: boolean; reasons?: string[] } | null
    await enqueue(
      exam.org_id,
      resultPayload('exam.rescored', {
        attemptId: attempt.id,
        operationId: before.id,
        orgExam: { id: exam.id, title: exam.title, track: exam.track },
        candidate: { id: attempt.agent_id, name: cand?.name ?? null, email: cand?.email ?? null },
        score: Math.round(result.iqScore),
        passed: result.passed,
        questionsTotal: scored.length,
        questionsCorrect: scored.filter((a) => a.correct).length,
        timeTakenSeconds: before.time_taken_seconds,
        integrity: integrity ? { verified: integrity.verified !== false, reasons: integrity.reasons ?? [] } : null,
        completedAt: before.created_at,
      }),
      attempt.id,
      admin,
    )
  }

  return { rescored: true, score: Math.round(result.iqScore), passed: result.passed }
}
