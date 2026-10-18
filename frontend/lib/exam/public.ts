// What the browser is allowed to see. The full `Question` (with its answer
// key, explanation and rubric payload) never leaves the server; pages render
// a `PublicQuestion` and get grading back as `Feedback`.

import type { AssignmentType, Difficulty, Question } from '@/lib/types'
import type {
  EpsilonPayload,
  EpsilonResultSpec,
  FieldDiff,
  ThetaPayload,
  ZetaPayload,
} from '@/lib/domain-types'

export type PublicEpsilonResult = Pick<
  EpsilonResultSpec,
  'id' | 'name_shown' | 'address_shown' | 'pin_shown' | 'category' | 'distance'
>

export type PublicEpsilonPayload = Omit<EpsilonPayload, 'results' | 'has_navigational_result'> & {
  results: PublicEpsilonResult[]
}

export type PublicZetaPayload = Pick<
  ZetaPayload,
  'rubric' | 'landing_page_snapshot_url' | 'query' | 'user_intent' | 'ymyl_topic'
> & { ask_pq: boolean; ask_nm: boolean }

export type PublicThetaPayload = Pick<ThetaPayload, 'duration_seconds' | 'audio_asset_url'>

export type PublicPayload = PublicEpsilonPayload | PublicZetaPayload | PublicThetaPayload

export interface PublicQuestion {
  id: string
  type: AssignmentType
  difficulty: Difficulty
  operationContext: string
  prompt: string
  responseA?: string
  responseB?: string
  responses?: string[]
  transcript?: string
  xpValue: number
  audioAssetUrl?: string
  payload?: PublicPayload
}

/** Grading returned to the learner after a practice answer, or in a test review. */
export interface Feedback {
  correct: boolean
  ratio: number
  explanation: string
  diffs: FieldDiff[]
  notes?: string[]
  justificationScore?: 0 | 1 | 2
  justificationFeedback?: string
}

/** One question in a finished test's review. */
export interface ReviewItem {
  questionId: string
  type: AssignmentType
  title: string
  explanation: string
  correct: boolean
  pointsEarned: number
  pointsPossible: number
}

/** Shown option index → original option index, per question in a test. */
export type Permutation = number[]

export const GOLD_FIELDS = [
  'correctAnswer',
  'explanation',
  'ratingA',
  'ratingB',
  'rubric',
  'category',
  'tags',
] as const satisfies readonly (keyof Question)[]
