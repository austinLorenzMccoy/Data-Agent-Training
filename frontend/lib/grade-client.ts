import type { Question } from './types'

export interface GradePayload {
  prompt: string
  response: string
  justification: string
  rubric?: string
  decision: string
}

// Thrown (not swallowed into the heuristic fallback below) so callers can
// show the upgrade dialog instead of silently grading for free past the
// daily quota.
export class QuotaExceededError extends Error {
  constructor() {
    super('quota_exceeded')
  }
}

export async function gradeJustification(
  question: Question,
  justification: string,
  decision: string,
): Promise<{ score: 0 | 1 | 2; feedback: string }> {
  const response =
    question.type === 'beta'
      ? `RESPONSE A:\n${question.responseA}\n\nRESPONSE B:\n${question.responseB}`
      : question.responseA ?? ''

  let res: Response
  try {
    res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: question.prompt,
        response,
        justification,
        rubric: question.rubric,
        decision,
      } satisfies GradePayload),
    })
  } catch {
    return heuristicFallback(justification)
  }

  if (res.status === 402) throw new QuotaExceededError()
  if (!res.ok) return heuristicFallback(justification)

  const data = await res.json()
  return { score: data.score, feedback: data.feedback }
}

// Minimal client-side fallback for transient failures (Groq down, etc.) —
// not used for quota exhaustion, which throws instead.
function heuristicFallback(justification: string): { score: 0 | 1 | 2; feedback: string } {
  const words = justification.trim().split(/\s+/).filter(Boolean).length
  if (words < 6) return { score: 0, feedback: 'Too brief to evaluate.' }
  if (words >= 22) return { score: 2, feedback: 'Thorough justification logged.' }
  return { score: 1, feedback: 'Partial reasoning logged.' }
}
