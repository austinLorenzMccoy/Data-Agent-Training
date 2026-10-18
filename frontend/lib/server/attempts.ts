import 'server-only'
import type { AssignmentType, OperationResult, Question } from '@/lib/types'
import { TYPE_NAMES, buildResult, hasJustification } from '@/lib/scoring'
import { getEnabledTypes, getProficiencyGatedTypes, REQUIRED_PROFICIENCY_EXAM } from '@/lib/feature-flags'
import { toPublicQuestion } from '@/lib/exam/sanitize'
import { applyPermutation, canonicalSelection, randomPermutation } from '@/lib/exam/shuffle'
import { tallyAttempt, type StoredAnswer } from '@/lib/exam/score'
import type { Permutation, ReviewItem } from '@/lib/exam/public'
import type { AttemptView, FinishView } from '@/lib/exam/attempt-types'
import { normalizeReport, type IntegrityReport } from '@/lib/integrity-core'
import { drawExam, questionById } from './bank'
import { clampJustification, gradeJustification as defaultGrader, type GradeInput, type GradeOutput } from './grader'

export const MAX_TRACK_QUESTIONS = 12
export const MINUTES_PER_QUESTION = 2.5
export const MIN_TEST_MINUTES = 10
/** Network slack after the deadline for an answer already in flight. */
export const ANSWER_GRACE_SEC = 20
export const MAX_SELECTION_BYTES = 64 * 1024

export interface AttemptQuestionRef {
  id: string
  perm: Permutation
}

export interface AttemptRow {
  id: string
  agent_id: string
  track: AssignmentType
  operation_name: string
  questions: AttemptQuestionRef[]
  answers: Record<string, StoredAnswer>
  status: 'active' | 'finished'
  started_at: string
  expires_at: string
  finished_at: string | null
  operation_id: string | null
  org_exam_id: string | null
}

export interface OperationInsert {
  agent_id: string
  attempt_id: string
  operation_name: string
  iq_score: number
  xp_earned: number
  questions_total: number
  questions_correct: number
  time_taken_seconds: number
  passed: boolean
  category_scores: Record<string, number>
  answers: unknown[]
  integrity: IntegrityReport | null
}

export interface OperationRow extends OperationInsert {
  id: string
  rank_before: number | null
  rank_after: number | null
  created_at: string
}

export interface GradeLogEntry {
  agent_id: string
  attempt_id: string | null
  question_id: string
  question_index: number | null
  justification: string
  score: number
  feedback: string
  mode: string
  model: string | null
  flagged_injection: boolean
}

/** Persistence used by the attempt service; Supabase in production, in-memory in tests. */
export interface AttemptStore {
  activeAttempt(agentId: string): Promise<AttemptRow | null>
  getAttempt(id: string): Promise<AttemptRow | null>
  countAttempts(agentId: string, opts: { since?: string; track?: AssignmentType; orgExamId?: string }): Promise<number>
  createAttempt(row: Omit<AttemptRow, 'id' | 'answers' | 'status' | 'finished_at' | 'operation_id'>): Promise<AttemptRow>
  recordAnswer(attemptId: string, agentId: string, index: number, answer: StoredAnswer): Promise<boolean>
  /** Mark finished if still active. Returns the row only to the caller that flipped it. */
  claimFinish(attemptId: string, agentId: string): Promise<AttemptRow | null>
  insertOperation(op: OperationInsert): Promise<OperationRow>
  linkOperation(attemptId: string, operationId: string): Promise<void>
  getOperation(id: string): Promise<OperationRow | null>
  logGrade(entry: GradeLogEntry): Promise<void>
  hasPassedProficiency(agentId: string, examId: string): Promise<boolean>
}

export type QuotaCheck = () => Promise<{ allowed: true } | { allowed: false; reason: string; limit?: number; plan?: string }>

export class AttemptError extends Error {
  constructor(
    public code:
      | 'unknown_track'
      | 'proficiency_required'
      | 'quota_exceeded'
      | 'attempt_limit'
      | 'busy'
      | 'not_found'
      | 'expired'
      | 'already_answered'
      | 'bad_request'
      | 'empty_bank',
    public status: number,
    public detail: Record<string, unknown> = {},
  ) {
    super(code)
  }
}

export type { AttemptView, FinishView }

function minutesFor(count: number): number {
  return Math.max(MIN_TEST_MINUTES, Math.round(count * MINUTES_PER_QUESTION))
}

function loadQuestions(refs: AttemptQuestionRef[]): Question[] {
  return refs.map((r) => {
    const q = questionById(r.id)
    if (!q) throw new AttemptError('not_found', 404, { questionId: r.id })
    return q
  })
}

function view(row: AttemptRow, now: Date): AttemptView {
  const questions = loadQuestions(row.questions)
  return {
    attemptId: row.id,
    track: row.track,
    operationName: row.operation_name,
    questions: questions.map((q, i) => toPublicQuestion(q, row.questions[i].perm)),
    answered: Object.keys(row.answers ?? {}).map(Number).sort((a, b) => a - b),
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    durationSec: Math.round((Date.parse(row.expires_at) - Date.parse(row.started_at)) / 1000),
    serverNow: now.toISOString(),
  }
}

function isExpired(row: AttemptRow, now: Date, graceSec = 0): boolean {
  return now.getTime() > Date.parse(row.expires_at) + graceSec * 1000
}

function monthStartIso(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

export function maxAttemptsPerTrack(): number | null {
  const n = Number(process.env.EXAM_MAX_ATTEMPTS_PER_TRACK)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null
}

export interface StartOptions {
  store: AttemptStore
  agentId: string
  track: string
  checkQuota: QuotaCheck
  now?: Date
  draw?: (type: AssignmentType, count: number) => Question[]
  rng?: () => number
}

/**
 * Start a timed test, or resume the one already running. Only one attempt
 * can be active per agent (enforced by a partial unique index), so a second
 * tab gets the same questions and deadline instead of a fresh draw.
 */
export async function startAttempt({ store, agentId, track, checkQuota, now = new Date(), draw = drawExam, rng }: StartOptions): Promise<AttemptView> {
  const enabled = getEnabledTypes()
  if (!(enabled as string[]).includes(track)) throw new AttemptError('unknown_track', 400)
  const type = track as AssignmentType

  const active = await store.activeAttempt(agentId)
  if (active) {
    if (!isExpired(active, now)) {
      if (active.track !== type) {
        throw new AttemptError('busy', 409, { track: active.track, expiresAt: active.expires_at })
      }
      return view(active, now)
    }
    // A test left to run out is scored with what was answered.
    await finishAttempt({ store, agentId, attemptId: active.id, integrity: null, now })
  }

  if (REQUIRED_PROFICIENCY_EXAM && getProficiencyGatedTypes().includes(type)) {
    if (!(await store.hasPassedProficiency(agentId, REQUIRED_PROFICIENCY_EXAM))) {
      throw new AttemptError('proficiency_required', 403, { examId: REQUIRED_PROFICIENCY_EXAM })
    }
  }

  const maxPerTrack = maxAttemptsPerTrack()
  if (maxPerTrack !== null && (await store.countAttempts(agentId, { track: type })) >= maxPerTrack) {
    throw new AttemptError('attempt_limit', 403, { limit: maxPerTrack })
  }

  const quota = await checkQuota()
  if (!quota.allowed) throw new AttemptError('quota_exceeded', 402, quota)

  const questions = draw(type, MAX_TRACK_QUESTIONS)
  if (questions.length === 0) throw new AttemptError('empty_bank', 404)

  const startedAt = now
  const expiresAt = new Date(startedAt.getTime() + minutesFor(questions.length) * 60_000)
  const row = await store.createAttempt({
    agent_id: agentId,
    track: type,
    operation_name: TYPE_NAMES[type],
    questions: questions.map((q) => ({ id: q.id, perm: randomPermutation(q, rng) })),
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    org_exam_id: null,
  })
  return view(row, now)
}

export interface AnswerOptions {
  store: AttemptStore
  agentId: string
  attemptId: string
  index: number
  selection: unknown
  justification?: string
  now?: Date
  grade?: (input: GradeInput) => Promise<GradeOutput>
}

/**
 * Record one answer. The selection is mapped back to the original option
 * order before it is stored; correctness is not returned, so a candidate
 * learns nothing until the test is over.
 */
export async function answerAttempt({ store, agentId, attemptId, index, selection, justification, now = new Date(), grade = defaultGrader }: AnswerOptions): Promise<{ answered: number }> {
  if (!Number.isInteger(index) || index < 0) throw new AttemptError('bad_request', 400)
  if (JSON.stringify(selection ?? null).length > MAX_SELECTION_BYTES) throw new AttemptError('bad_request', 413)

  const row = await store.getAttempt(attemptId)
  if (!row || row.agent_id !== agentId) throw new AttemptError('not_found', 404)
  if (row.status !== 'active' || isExpired(row, now, ANSWER_GRACE_SEC)) throw new AttemptError('expired', 409)
  if (index >= row.questions.length) throw new AttemptError('bad_request', 400)
  if (row.answers?.[String(index)]) throw new AttemptError('already_answered', 409)

  const ref = row.questions[index]
  const q = questionById(ref.id)
  if (!q) throw new AttemptError('not_found', 404)

  const stored: StoredAnswer = {
    questionId: q.id,
    selection: canonicalSelection(q, ref.perm, selection),
    answeredAt: now.getTime(),
  }

  const text = typeof justification === 'string' ? clampJustification(justification).trim() : ''
  if (hasJustification(q.type) && text) {
    const shown = applyPermutation(q, ref.perm)
    const decision = typeof selection === 'string' ? selection : JSON.stringify(selection)
    const graded = await grade({ question: shown, justification: text, decision })
    stored.justification = text
    stored.justificationScore = graded.score
    stored.justificationFeedback = graded.feedback
    await store.logGrade({
      agent_id: agentId,
      attempt_id: attemptId,
      question_id: q.id,
      question_index: index,
      justification: text,
      score: graded.score,
      feedback: graded.feedback,
      mode: graded.mode,
      model: graded.model,
      flagged_injection: graded.flaggedInjection,
    })
  }

  const ok = await store.recordAnswer(attemptId, agentId, index, stored)
  if (!ok) {
    const fresh = await store.getAttempt(attemptId)
    if (fresh?.answers?.[String(index)]) throw new AttemptError('already_answered', 409)
    throw new AttemptError('expired', 409)
  }
  const fresh = await store.getAttempt(attemptId)
  return { answered: Object.keys(fresh?.answers ?? {}).length }
}

export interface FinishOptions {
  store: AttemptStore
  agentId: string
  attemptId: string
  integrity: unknown
  now?: Date
}

function reviewItems(questions: Question[], answers: ReturnType<typeof tallyAttempt>['answers']): ReviewItem[] {
  return answers.map((a, i) => ({
    questionId: a.questionId,
    type: a.type,
    title: questions[i].operationContext,
    explanation: questions[i].explanation,
    correct: a.correct,
    pointsEarned: a.pointsEarned,
    pointsPossible: a.pointsPossible,
  }))
}

function resultFromOperation(op: OperationRow, row: AttemptRow): OperationResult {
  return {
    id: op.id,
    operationName: op.operation_name,
    iqScore: op.iq_score,
    passed: op.passed,
    xpEarned: op.xp_earned,
    bestStreak: 0,
    completedAt: Date.parse(op.created_at),
    rankAtCompletion: String(op.rank_after ?? ''),
    categoryScores: op.category_scores as OperationResult['categoryScores'],
    totalAssignments: row.questions.length,
  }
}

/**
 * Score the attempt from what the server stored and write the `operations`
 * row. Idempotent: a repeat call (double click, retry) returns the result
 * already written instead of scoring twice.
 */
export async function finishAttempt({ store, agentId, attemptId, integrity, now = new Date() }: FinishOptions): Promise<FinishView> {
  const existing = await store.getAttempt(attemptId)
  if (!existing || existing.agent_id !== agentId) throw new AttemptError('not_found', 404)

  const claimed = existing.status === 'active' ? await store.claimFinish(attemptId, agentId) : null
  const row = claimed ?? (await store.getAttempt(attemptId))!
  const questions = loadQuestions(row.questions)
  const { answers, bestStreak } = tallyAttempt(questions, row.answers ?? {})

  if (!claimed) {
    // Someone else finished it; wait briefly for their operation row.
    let opId = row.operation_id
    for (let i = 0; !opId && i < 10; i++) {
      await new Promise((r) => setTimeout(r, 200))
      opId = (await store.getAttempt(attemptId))?.operation_id ?? null
    }
    const op = opId ? await store.getOperation(opId) : null
    if (!op) throw new AttemptError('busy', 409)
    return {
      result: { ...resultFromOperation(op, row), bestStreak },
      rankedUp: (op.rank_after ?? 0) > (op.rank_before ?? 0),
      items: reviewItems(questions, answers),
      integrity: op.integrity,
    }
  }

  const result = buildResult(attemptId, row.operation_name, answers, bestStreak, '')
  const end = Math.min(now.getTime(), Date.parse(row.expires_at))
  const report = normalizeReport(integrity)
  const op = await store.insertOperation({
    agent_id: agentId,
    attempt_id: attemptId,
    operation_name: row.operation_name,
    iq_score: Math.round(result.iqScore),
    xp_earned: result.xpEarned,
    questions_total: answers.length,
    questions_correct: answers.filter((a) => a.correct).length,
    time_taken_seconds: Math.max(0, Math.round((end - Date.parse(row.started_at)) / 1000)),
    passed: result.passed,
    category_scores: result.categoryScores,
    answers,
    integrity: report,
  })
  await store.linkOperation(attemptId, op.id)
  const fresh = (await store.getOperation(op.id)) ?? op

  return {
    result: { ...result, id: op.id, rankAtCompletion: String(fresh.rank_after ?? '') },
    rankedUp: (fresh.rank_after ?? 0) > (fresh.rank_before ?? 0),
    items: reviewItems(questions, answers),
    integrity: report,
  }
}

export function monthStart(now = new Date()): string {
  return monthStartIso(now)
}
