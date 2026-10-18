import type { Question } from '@/lib/types'
import { FLAG_REASONS } from '@/lib/types'
import { ALL_ASSIGNMENT_TYPES } from '@/lib/scoring'
import { isEpsilonPayload, isThetaPayload, isZetaPayload } from '@/lib/domain-scoring'
import { toPublicQuestion } from './sanitize'
import { scoreAnswer } from './score'

// Checks a question written in the content admin before it can go live.
// Returns every problem found, in plain words, so an editor can fix them in one pass.

const RATINGS = ['CLEAR', 'AMBIGUOUS', 'COMPROMISED']

function isNonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

export function validateQuestion(raw: unknown): { ok: true; question: Question } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, errors: ['The question must be a JSON object.'] }
  const q = raw as Partial<Question> & Record<string, unknown>

  if (!isNonEmpty(q.id) || !/^[a-z0-9_]{3,60}$/.test(q.id)) errors.push('id: 3–60 lowercase letters, digits or _.')
  if (!q.type || !(ALL_ASSIGNMENT_TYPES as string[]).includes(q.type)) errors.push(`type: one of ${ALL_ASSIGNMENT_TYPES.join(', ')}.`)
  if (!['easy', 'medium', 'hard'].includes(String(q.difficulty))) errors.push('difficulty: easy, medium or hard.')
  if (!isNonEmpty(q.operationContext)) errors.push('operationContext: the one-line task description shown above the question.')
  if (typeof q.prompt !== 'string') errors.push('prompt: a string (may be empty for search-quality questions).')
  if (!isNonEmpty(q.explanation)) errors.push('explanation: say why the answer is right. Learners see it after answering.')
  if (typeof q.xpValue !== 'number' || q.xpValue < 10 || q.xpValue > 200) errors.push('xpValue: a number from 10 to 200.')
  if (!Array.isArray(q.tags)) errors.push('tags: an array (can be empty).')
  if (typeof q.category !== 'string') errors.push('category: a string.')

  switch (q.type) {
    case 'alpha':
      if (!isNonEmpty(q.responseA)) errors.push('responseA: the AI response being rated.')
      if (!RATINGS.includes(String(q.correctAnswer))) errors.push(`correctAnswer: one of ${RATINGS.join(', ')}.`)
      break
    case 'beta':
    case 'iota':
      if (!isNonEmpty(q.responseA) || !isNonEmpty(q.responseB)) errors.push('responseA and responseB: both options.')
      if (q.correctAnswer !== 'A' && q.correctAnswer !== 'B') errors.push('correctAnswer: "A" or "B".')
      break
    case 'delta':
    case 'kappa': {
      const n = Array.isArray(q.responses) ? q.responses.length : 0
      if (n < 2 || !q.responses!.every(isNonEmpty)) errors.push('responses: at least two non-empty options.')
      if (!Number.isInteger(q.correctAnswer) || (q.correctAnswer as number) < 0 || (q.correctAnswer as number) >= n)
        errors.push('correctAnswer: the 0-based index of the right option.')
      break
    }
    case 'gamma': {
      if (!isNonEmpty(q.transcript)) errors.push('transcript: the conversation to review.')
      const ca = q.correctAnswer as { decision?: string; flags?: unknown } | undefined
      if (!ca || (ca.decision !== 'CLEAR' && ca.decision !== 'FLAGGED')) errors.push('correctAnswer.decision: CLEAR or FLAGGED.')
      else if (!Array.isArray(ca.flags) || !ca.flags.every((f) => (FLAG_REASONS as readonly string[]).includes(String(f))))
        errors.push(`correctAnswer.flags: any of ${FLAG_REASONS.join('; ')}.`)
      else if (ca.decision === 'FLAGGED' && ca.flags.length === 0) errors.push('correctAnswer.flags: a FLAGGED transcript needs at least one reason.')
      break
    }
    case 'epsilon':
      if (!isEpsilonPayload(q.payload)) errors.push('payload: a map-evaluation payload with query and results.')
      break
    case 'zeta':
    case 'eta':
      if (!isZetaPayload(q.payload)) errors.push('payload: a search-quality payload with query and rubric.')
      break
    case 'theta':
      if (!isThetaPayload(q.payload)) errors.push('payload: a transcription payload with reference_segments.')
      break
  }

  if (errors.length) return { ok: false, errors }
  const question = q as Question
  // Must survive what the app will do with it.
  try {
    toPublicQuestion(question)
    if (question.payload === undefined && scoreAnswer(question, question.correctAnswer).ratio < 1) {
      errors.push('correctAnswer does not score as correct. Check its shape for this type.')
    }
  } catch (err) {
    errors.push(`Could not be rendered or scored: ${(err as Error).message}`)
  }
  return errors.length ? { ok: false, errors } : { ok: true, question }
}

export const TEMPLATES: Record<string, Partial<Question>> = {
  alpha: { type: 'alpha', difficulty: 'medium', category: 'helpfulness', operationContext: '', prompt: '', responseA: '', correctAnswer: 'CLEAR', explanation: '', xpValue: 50, tags: [] },
  beta: { type: 'beta', difficulty: 'medium', category: 'comparative', operationContext: '', prompt: '', responseA: '', responseB: '', correctAnswer: 'A', ratingA: 'CLEAR', ratingB: 'AMBIGUOUS', explanation: '', xpValue: 50, tags: [] },
  gamma: { type: 'gamma', difficulty: 'medium', category: 'transcript', operationContext: '', prompt: '', transcript: '', correctAnswer: { decision: 'CLEAR', flags: [] }, explanation: '', xpValue: 50, tags: [] },
  delta: { type: 'delta', difficulty: 'medium', category: 'selection', operationContext: '', prompt: '', transcript: '', responses: ['', '', '', ''], correctAnswer: 0, explanation: '', xpValue: 50, tags: [] },
  kappa: { type: 'kappa', difficulty: 'medium', category: 'rubric_quality', operationContext: '', prompt: '', responses: ['', '', '', ''], correctAnswer: 0, explanation: '', xpValue: 50, tags: [] },
  iota: { type: 'iota', difficulty: 'medium', category: 'visual_quality', operationContext: '', prompt: '', responseA: '', responseB: '', correctAnswer: 'A', explanation: '', xpValue: 60, tags: [] },
}
