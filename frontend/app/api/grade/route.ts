import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const schema = z.object({
  score: z.number().int().min(0).max(2),
  feedback: z.string().max(280),
})

// Local heuristic fallback when no AI gateway/key is configured.
function heuristicGrade(justification: string): { score: 0 | 1 | 2; feedback: string } {
  const text = (justification || '').trim()
  const words = text.split(/\s+/).filter(Boolean)
  const lower = text.toLowerCase()
  const reasoningCues = [
    'because',
    'since',
    'therefore',
    'however',
    'whereas',
    'although',
    'implies',
    'suggests',
    'indicates',
    'evidence',
    'context',
    'tone',
    'accuracy',
    'safety',
    'hallucinat',
    'refus',
    'ambig',
  ]
  const cueHits = reasoningCues.filter((c) => lower.includes(c)).length
  if (words.length < 6) {
    return {
      score: 0,
      feedback: 'Too brief. Cite specific evidence from the response to support your call.',
    }
  }
  if (words.length >= 6 && (cueHits >= 2 || words.length >= 22)) {
    return {
      score: 2,
      feedback: 'Clear reasoning tied to specific signals in the response. Field-grade work.',
    }
  }
  return {
    score: 1,
    feedback: 'On the right track, but tie your reasoning to concrete evidence in the text.',
  }
}

export async function POST(req: Request) {
  const { prompt, response, justification, rubric, decision } = await req.json()

  const hasKey =
    !!process.env.AI_GATEWAY_API_KEY ||
    !!process.env.OPENAI_API_KEY ||
    !!process.env.GROQ_API_KEY

  if (!hasKey || !justification || justification.trim().length === 0) {
    const result = heuristicGrade(justification ?? '')
    return Response.json({ ...result, mode: 'heuristic' })
  }

  try {
    const { object } = await generateObject({
      model: 'groq/llama-3.3-70b-versatile',
      schema,
      system:
        'You are a senior data annotation reviewer at a covert intelligence agency. ' +
        'Grade the agent\'s justification for their classification of an AI response. ' +
        'Score 0 (no real reasoning / off-base), 1 (partial reasoning, lacks specifics), ' +
        'or 2 (clear reasoning grounded in concrete evidence from the response). ' +
        'Keep feedback under 2 sentences, direct, and in an agency tone.',
      prompt:
        `CLASSIFICATION DECISION: ${decision}\n\n` +
        `PROMPT GIVEN TO AI:\n${prompt}\n\n` +
        `AI RESPONSE:\n${response}\n\n` +
        (rubric ? `RUBRIC:\n${rubric}\n\n` : '') +
        `AGENT JUSTIFICATION:\n${justification}`,
    })
    return Response.json({ ...object, mode: 'ai' })
  } catch (err) {
    console.log('[v0] grade route AI error, falling back:', (err as Error).message)
    const result = heuristicGrade(justification ?? '')
    return Response.json({ ...result, mode: 'heuristic-fallback' })
  }
}
