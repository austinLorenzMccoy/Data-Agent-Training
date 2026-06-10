import type { Question } from './types'

export interface GradePayload {
  prompt: string
  response: string
  justification: string
  rubric?: string
  decision: string
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

  try {
    const res = await fetch('/api/grade', {
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
    if (!res.ok) throw new Error('grade request failed')
    const data = await res.json()
    return { score: data.score, feedback: data.feedback }
  } catch {
    // Minimal client-side fallback
    const words = justification.trim().split(/\s+/).filter(Boolean).length
    if (words < 6) return { score: 0, feedback: 'Too brief to evaluate.' }
    if (words >= 22) return { score: 2, feedback: 'Thorough justification logged.' }
    return { score: 1, feedback: 'Partial reasoning logged.' }
  }
}
