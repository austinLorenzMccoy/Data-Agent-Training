import type {
  AddressAccuracy,
  AudioQualityFlag,
  EpsilonAnswer,
  EpsilonPayload,
  EpsilonResultAnswer,
  EtaLiteFlags,
  EtaRating,
  FieldDiff,
  NameAccuracy,
  NmRating,
  PinAccuracy,
  PqRating,
  RelevanceRating,
  ScoreBreakdown,
  ThetaAnswer,
  ThetaPayload,
  ThetaSegment,
  ThetaTag,
  ZetaAnswer,
  ZetaFullFlags,
  ZetaPayload,
} from './domain-types'
import {
  DEFAULT_THETA_WEIGHTS,
  ETA_SCALE,
  NM_SCALE,
  PQ_SCALE,
} from './domain-types'
import type { Question } from './types'

function emptyBreakdown(ratio = 0): ScoreBreakdown {
  return { ratio, diffs: [] }
}

function credit(eq: boolean): number {
  return eq ? 1 : 0
}

function asStr(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return String(v)
}

// ─── Epsilon ─────────────────────────────────────────────────────────────────

function emptyResultAnswer(): EpsilonResultAnswer {
  return {
    relevance: null,
    relevance_subreason: null,
    name_accuracy: null,
    address_accuracy: null,
    address_issue: null,
    pin_accuracy: null,
    business_closed: false,
  }
}

export function scoreEpsilon(payload: EpsilonPayload, answer: EpsilonAnswer | null | undefined): ScoreBreakdown {
  if (!answer) return emptyBreakdown(0)
  const diffs: FieldDiff[] = []

  const navCredit = credit(answer.has_navigational_result === payload.has_navigational_result)
  diffs.push({
    field: 'Navigational result',
    agent: asStr(answer.has_navigational_result),
    correct: asStr(payload.has_navigational_result),
    credit: navCredit,
  })

  const fieldCredits: number[] = []

  for (const result of payload.results) {
    const sel = answer.results?.[result.id] ?? emptyResultAnswer()
    const prefix = `Result ${result.id.toUpperCase()}`

    const fields: Array<{
      label: string
      agent: unknown
      correct: unknown
    }> = [
      { label: `${prefix} · Relevance`, agent: sel.relevance, correct: result.correct_relevance },
      { label: `${prefix} · Name`, agent: sel.name_accuracy, correct: result.correct_name_accuracy },
      { label: `${prefix} · Address`, agent: sel.address_accuracy, correct: result.correct_address_accuracy },
      { label: `${prefix} · Pin`, agent: sel.pin_accuracy, correct: result.correct_pin_accuracy },
    ]

    for (const f of fields) {
      const c = credit(f.agent === f.correct)
      fieldCredits.push(c)
      diffs.push({ field: f.label, agent: asStr(f.agent), correct: asStr(f.correct), credit: c })
    }

    // Graded and shown, but not part of the /4 formula.
    const closedCredit = credit(sel.business_closed === result.correct_business_closed)
    diffs.push({
      field: `${prefix} · Business closed`,
      agent: asStr(sel.business_closed),
      correct: asStr(result.correct_business_closed),
      credit: closedCredit,
    })
  }

  const resultScore =
    fieldCredits.length === 0 ? 0 : fieldCredits.reduce((s, n) => s + n, 0) / fieldCredits.length
  // Nav is query-level and must not be ignored, but the PRD formula is the /4 field mean.
  const ratio = fieldCredits.length === 0 ? navCredit : (navCredit + resultScore * 4) / 5

  return { ratio, diffs }
}

// ─── Zeta / Eta ordinal ──────────────────────────────────────────────────────

export function ordinalScore(scale: readonly string[], agent: string | null | undefined, correct: string): number {
  if (!agent) return 0
  if (agent === correct) return 1
  const a = scale.indexOf(agent)
  const c = scale.indexOf(correct)
  if (a < 0 || c < 0) return 0
  return Math.abs(a - c) === 1 ? 0.5 : 0
}

function flagScore(
  agent: Record<string, boolean> | object | undefined,
  correct: Record<string, boolean> | object,
): { ratio: number; diffs: FieldDiff[] } {
  const correctRec = correct as Record<string, boolean>
  const agentRec = (agent ?? {}) as Record<string, boolean>
  const keys = Object.keys(correctRec)
  const diffs: FieldDiff[] = []
  let hits = 0
  for (const key of keys) {
    const a = !!agentRec[key]
    const c = !!correctRec[key]
    const cr = credit(a === c)
    hits += cr
    diffs.push({
      field: `Flag · ${key.replace(/_/g, ' ')}`,
      agent: asStr(a),
      correct: asStr(c),
      credit: cr,
    })
  }
  return { ratio: keys.length === 0 ? 1 : hits / keys.length, diffs }
}

export function scoreZeta(payload: ZetaPayload, answer: ZetaAnswer | null | undefined): ScoreBreakdown {
  if (!answer) return emptyBreakdown(0)
  const diffs: FieldDiff[] = []
  const parts: number[] = []

  if (payload.rubric === 'lite') {
    const correct = payload.correct_satisfaction ?? 'NS'
    const s = ordinalScore(ETA_SCALE, answer.satisfaction ?? null, correct)
    parts.push(s)
    diffs.push({
      field: 'Satisfaction',
      agent: asStr(answer.satisfaction),
      correct,
      credit: s,
    })
    const flags = flagScore(answer.flags as EtaLiteFlags, payload.correct_flags as EtaLiteFlags)
    parts.push(flags.ratio)
    diffs.push(...flags.diffs)
    const notes: string[] = []
    if (typeof payload.degrees_of_separation === 'number') {
      notes.push(
        `Degrees of separation heuristic: ${payload.degrees_of_separation}. Each relationship-hop from the query concept to the result typically drops the rating one level.`,
      )
    }
    const ratio = parts.reduce((a, b) => a + b, 0) / parts.length
    return { ratio, diffs, notes }
  }

  if (payload.ask_pq && payload.correct_pq) {
    const s = ordinalScore(PQ_SCALE, answer.pq ?? null, payload.correct_pq)
    parts.push(s)
    diffs.push({ field: 'Page Quality', agent: asStr(answer.pq), correct: payload.correct_pq, credit: s })
  }
  if (payload.ask_nm && payload.correct_nm) {
    const s = ordinalScore(NM_SCALE, answer.nm ?? null, payload.correct_nm)
    parts.push(s)
    diffs.push({ field: 'Needs Met', agent: asStr(answer.nm), correct: payload.correct_nm, credit: s })
  }
  const flags = flagScore(answer.flags as ZetaFullFlags, payload.correct_flags as ZetaFullFlags)
  parts.push(flags.ratio)
  diffs.push(...flags.diffs)

  const ratio = parts.length === 0 ? 0 : parts.reduce((a, b) => a + b, 0) / parts.length
  return { ratio, diffs }
}

// ─── Theta ───────────────────────────────────────────────────────────────────

const BOUNDARY_TOLERANCE_MS = 500

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function intervalIoU(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
  expandB = 0,
): number {
  const bS = bStart - expandB
  const bE = bEnd + expandB
  const inter = Math.max(0, Math.min(aEnd, bE) - Math.max(aStart, bS))
  const union = Math.max(aEnd, bEnd) - Math.min(aStart, bStart)
  if (union <= 0) return 0
  return inter / union
}

function matchSegments(agent: ThetaSegment[], reference: ThetaSegment[]): Array<{ a: ThetaSegment; r: ThetaSegment; iou: number } | null> {
  const used = new Set<number>()
  return agent.map((a) => {
    let best = -1
    let bestIou = 0
    reference.forEach((r, i) => {
      if (used.has(i)) return
      const iou = intervalIoU(a.start_ms, a.end_ms, r.start_ms, r.end_ms, BOUNDARY_TOLERANCE_MS)
      if (iou > bestIou) {
        bestIou = iou
        best = i
      }
    })
    if (best < 0) return null
    used.add(best)
    return { a, r: reference[best], iou: bestIou }
  })
}

export function levenshtein(a: string, b: string): number {
  const s = a.toLowerCase()
  const t = b.toLowerCase()
  const m = s.length
  const n = t.length
  if (m === 0) return n
  if (n === 0) return m
  const prev = new Array<number>(n + 1)
  const curr = new Array<number>(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j]
  }
  return prev[n]
}

function normalizeTranscript(text: string): string {
  return text
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function tagF1(agent: ThetaTag[], reference: ThetaTag[]): number {
  if (reference.length === 0 && agent.length === 0) return 1
  if (reference.length === 0) return agent.length === 0 ? 1 : 0
  if (agent.length === 0) return 0

  const used = new Set<number>()
  let tp = 0
  for (const a of agent) {
    let best = -1
    let bestOverlap = 0
    reference.forEach((r, i) => {
      if (used.has(i) || r.type !== a.type) return
      const inter = Math.max(0, Math.min(a.end_char, r.end_char) - Math.max(a.start_char, r.start_char))
      const span = Math.max(a.end_char - a.start_char, r.end_char - r.start_char, 1)
      const overlap = inter / span
      if (overlap > bestOverlap) {
        bestOverlap = overlap
        best = i
      }
    })
    if (best >= 0 && bestOverlap >= 0.5) {
      used.add(best)
      tp += 1
    }
  }
  const precision = tp / agent.length
  const recall = tp / reference.length
  if (precision + recall === 0) return 0
  return (2 * precision * recall) / (precision + recall)
}

function flagsJaccard(agent: AudioQualityFlag[], reference: AudioQualityFlag[]): number {
  const a = new Set(agent)
  const r = new Set(reference)
  if (a.size === 0 && r.size === 0) return 1
  let inter = 0
  for (const x of a) if (r.has(x)) inter += 1
  const union = new Set([...a, ...r]).size
  return union === 0 ? 1 : inter / union
}

export function scoreTheta(payload: ThetaPayload, answer: ThetaAnswer | null | undefined): ScoreBreakdown {
  if (!answer) return emptyBreakdown(0)
  const weights = payload.weights ?? DEFAULT_THETA_WEIGHTS
  const refs = payload.reference_segments
  const segs = answer.segments ?? []
  const matches = matchSegments(segs, refs)

  const ious = matches.map((m) => m?.iou ?? 0)
  const recallPenalty = refs.length === 0 ? 1 : Math.min(1, segs.length / refs.length)
  const extraPenalty = refs.length === 0 ? 1 : Math.min(1, refs.length / Math.max(segs.length, 1))
  const segmentation = ious.length === 0 ? 0 : (ious.reduce((s, n) => s + n, 0) / Math.max(refs.length, segs.length, 1)) * recallPenalty * extraPenalty

  const speakerHits = matches.filter((m) => m && m.a.speaker === m.r.speaker && m.a.gender === m.r.gender).length
  const speaker = refs.length === 0 ? 1 : speakerHits / refs.length

  const agentText = normalizeTranscript(segs.map((s) => s.transcript).join(' '))
  const refText = normalizeTranscript(refs.map((s) => s.transcript).join(' '))
  const dist = levenshtein(agentText, refText)
  const transcription = 1 - dist / Math.max(agentText.length, refText.length, 1)

  const agentTags = segs.flatMap((s) => s.tags ?? [])
  const refTags = refs.flatMap((s) => s.tags ?? [])
  const tags = tagF1(agentTags, refTags)

  const flagRatio = flagsJaccard(answer.audio_quality_flags ?? [], payload.reference_audio_quality_flags)

  const wSum = weights.segmentation + weights.speaker + weights.transcription + weights.tags
  const ratio = clamp(
    (weights.segmentation * segmentation +
      weights.speaker * speaker +
      weights.transcription * transcription +
      weights.tags * tags) /
      (wSum || 1),
    0,
    1,
  )

  const diffs: FieldDiff[] = [
    { field: 'Segmentation (IoU)', agent: segmentation.toFixed(2), correct: '1.00', credit: segmentation },
    { field: 'Speaker / gender', agent: `${speakerHits}/${refs.length}`, correct: `${refs.length}/${refs.length}`, credit: speaker },
    { field: 'Transcription', agent: transcription.toFixed(2), correct: '1.00', credit: transcription },
    { field: 'Tags F1', agent: tags.toFixed(2), correct: '1.00', credit: tags },
    { field: 'Audio quality flags', agent: (answer.audio_quality_flags ?? []).join(', ') || 'none', correct: payload.reference_audio_quality_flags.join(', ') || 'none', credit: flagRatio },
  ]

  return { ratio, diffs }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export function isEpsilonPayload(p: unknown): p is EpsilonPayload {
  return !!p && typeof p === 'object' && 'results' in p && 'has_navigational_result' in p
}

export function isZetaPayload(p: unknown): p is ZetaPayload {
  return !!p && typeof p === 'object' && 'rubric' in p
}

export function isThetaPayload(p: unknown): p is ThetaPayload {
  return !!p && typeof p === 'object' && 'reference_segments' in p
}

export function scoreDomainQuestion(question: Question, selection: unknown): ScoreBreakdown {
  if (question.type === 'epsilon' && isEpsilonPayload(question.payload)) {
    return scoreEpsilon(question.payload, selection as EpsilonAnswer)
  }
  if ((question.type === 'zeta' || question.type === 'eta') && isZetaPayload(question.payload)) {
    return scoreZeta(question.payload, selection as ZetaAnswer)
  }
  if (question.type === 'theta' && isThetaPayload(question.payload)) {
    return scoreTheta(question.payload, selection as ThetaAnswer)
  }
  return emptyBreakdown(0)
}

export type {
  PqRating,
  NmRating,
  EtaRating,
  RelevanceRating,
  NameAccuracy,
  AddressAccuracy,
  PinAccuracy,
}
