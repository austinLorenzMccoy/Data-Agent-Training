import type { Question } from '@/lib/types'
import type { EpsilonPayload, ThetaPayload, ZetaPayload } from '@/lib/domain-types'
import { isEpsilonPayload, isThetaPayload, isZetaPayload } from '@/lib/domain-scoring'
import type { Permutation, PublicPayload, PublicQuestion } from './public'
import { applyPermutation } from './shuffle'

function publicPayload(payload: Question['payload']): PublicPayload | undefined {
  if (!payload) return undefined
  if (isEpsilonPayload(payload)) {
    const p = payload as EpsilonPayload
    return {
      query: p.query,
      user_location: p.user_location,
      user_location_pin: p.user_location_pin,
      search_radius_m: p.search_radius_m,
      results: p.results.map((r) => ({
        id: r.id,
        name_shown: r.name_shown,
        address_shown: r.address_shown,
        pin_shown: r.pin_shown,
        category: r.category,
        distance: r.distance,
      })),
    }
  }
  if (isZetaPayload(payload)) {
    const p = payload as ZetaPayload
    return {
      rubric: p.rubric,
      landing_page_snapshot_url: p.landing_page_snapshot_url,
      query: p.query,
      user_intent: p.user_intent,
      ymyl_topic: p.ymyl_topic,
      ask_pq: p.ask_pq ?? !!p.correct_pq,
      ask_nm: p.ask_nm ?? !!p.correct_nm,
    }
  }
  if (isThetaPayload(payload)) {
    const p = payload as ThetaPayload
    return { duration_seconds: p.duration_seconds, audio_asset_url: p.audio_asset_url }
  }
  return undefined
}

/**
 * Copy only the fields a renderer needs. Built field by field (not by
 * deleting gold keys) so a field added to `Question` later stays private
 * until someone deliberately exposes it here.
 */
export function toPublicQuestion(q: Question, perm?: Permutation): PublicQuestion {
  const shown = perm ? applyPermutation(q, perm) : q
  const out: PublicQuestion = {
    id: q.id,
    type: q.type,
    difficulty: q.difficulty,
    operationContext: q.operationContext,
    prompt: q.prompt,
    xpValue: q.xpValue,
  }
  if (shown.responseA !== undefined) out.responseA = shown.responseA
  if (shown.responseB !== undefined) out.responseB = shown.responseB
  if (shown.responses !== undefined) out.responses = [...shown.responses]
  if (q.transcript !== undefined) out.transcript = q.transcript
  if (q.audioAssetUrl !== undefined) out.audioAssetUrl = q.audioAssetUrl
  const payload = publicPayload(q.payload)
  if (payload) out.payload = payload
  return out
}
