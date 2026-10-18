import { checkAndConsumeQuota } from '@/lib/entitlements'
import { hasJustification } from '@/lib/scoring'
import { buildFeedback } from '@/lib/exam/score'
import type { Feedback } from '@/lib/exam/public'
import { isExamOnly, questionById } from '@/lib/server/bank'
import { clampJustification, gradeJustification, heuristicGrade } from '@/lib/server/grader'
import { supabaseAttemptStore } from '@/lib/server/attempt-store'
import { currentUser, readJson } from '@/lib/server/http'
import { ipKey, rateLimit, tooMany } from '@/lib/server/rate-limit'

export const maxDuration = 30

// Grades one practice answer and explains it. Signed-in learners get an AI
// grade of their written reason (counted against the daily practice quota);
// anonymous learners get the word-based heuristic.
export async function POST(req: Request) {
  const user = await currentUser()
  const limited = await rateLimit('practiceCheck', user?.id ?? ipKey(req))
  if (!limited.ok) return tooMany(limited.retryAfter)

  const body = await readJson(req)
  if (!body || typeof body.questionId !== 'string') {
    return Response.json({ error: 'bad_request' }, { status: 400 })
  }
  const q = questionById(body.questionId)
  if (!q || isExamOnly(q)) return Response.json({ error: 'not_found' }, { status: 404 })

  const feedback: Feedback & { quotaExceeded?: boolean } = buildFeedback(q, body.selection)
  const text = typeof body.justification === 'string' ? clampJustification(body.justification).trim() : ''

  if (hasJustification(q.type) && text) {
    if (!user) {
      const h = heuristicGrade(text)
      feedback.justificationScore = h.score
      feedback.justificationFeedback = h.feedback
    } else {
      const gradeLimit = await rateLimit('grade', user.id)
      const quota = gradeLimit.ok ? await checkAndConsumeQuota(user.id, 'practice') : { allowed: false as const }
      if (!quota.allowed) {
        feedback.quotaExceeded = true
      } else {
        const decision = typeof body.selection === 'string' ? body.selection : JSON.stringify(body.selection)
        const graded = await gradeJustification({ question: q, justification: text, decision })
        feedback.justificationScore = graded.score
        feedback.justificationFeedback = graded.feedback
        await supabaseAttemptStore().logGrade({
          agent_id: user.id,
          attempt_id: null,
          question_id: q.id,
          question_index: null,
          justification: text,
          score: graded.score,
          feedback: graded.feedback,
          mode: graded.mode,
          model: graded.model,
          flagged_injection: graded.flaggedInjection,
        })
      }
    }
  }

  return Response.json(feedback)
}
