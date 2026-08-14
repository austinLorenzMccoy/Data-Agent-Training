// v4 assignment-domain types. Payloads live on Question.payload.

// ─── Epsilon — Map / POI evaluation ──────────────────────────────────────────

export const RELEVANCE_SCALE = [
  'Navigational',
  'Excellent',
  'Good',
  'Acceptable',
  'Bad',
] as const
export type RelevanceRating = (typeof RELEVANCE_SCALE)[number]

export const RELEVANCE_SUBREASONS = ['Dt.', 'User'] as const
export type RelevanceSubreason = (typeof RELEVANCE_SUBREASONS)[number]

export const NAME_ACCURACY_SCALE = [
  'Correct',
  'Partially Correct',
  'Incorrect',
  'n/a',
  "Can't Verify",
] as const
export type NameAccuracy = (typeof NAME_ACCURACY_SCALE)[number]

export const ADDRESS_ACCURACY_SCALE = [
  'Correct',
  'Incorrect',
  'n/a',
  "Can't Verify",
] as const
export type AddressAccuracy = (typeof ADDRESS_ACCURACY_SCALE)[number]

export const ADDRESS_ISSUES = [
  'Street Name',
  'Street Number',
  'Postal Code',
  'City',
  'State/Province',
  'Country-specific',
] as const
export type AddressIssue = (typeof ADDRESS_ISSUES)[number]

export const PIN_ACCURACY_SCALE = [
  'Perfect',
  'Approximate',
  'Next Door',
  'Wrong',
  "Can't Verify",
] as const
export type PinAccuracy = (typeof PIN_ACCURACY_SCALE)[number]

export interface EpsilonResultSpec {
  id: string
  name_shown: string
  address_shown: string
  pin_shown?: { lat: number; lng: number; label?: string }
  category?: string
  distance?: string
  correct_relevance: RelevanceRating
  correct_relevance_subreason: RelevanceSubreason | null
  correct_name_accuracy: NameAccuracy
  correct_address_accuracy: AddressAccuracy
  correct_address_issue?: AddressIssue | null
  correct_pin_accuracy: PinAccuracy
  correct_business_closed: boolean
}

export interface EpsilonPayload {
  query: string
  user_location: string
  has_navigational_result: boolean
  results: EpsilonResultSpec[]
}

export interface EpsilonResultAnswer {
  relevance: RelevanceRating | null
  relevance_subreason: RelevanceSubreason | null
  name_accuracy: NameAccuracy | null
  address_accuracy: AddressAccuracy | null
  address_issue: AddressIssue | null
  pin_accuracy: PinAccuracy | null
  business_closed: boolean
}

export interface EpsilonAnswer {
  has_navigational_result: boolean | null
  results: Record<string, EpsilonResultAnswer>
}

// ─── Zeta / Eta — Search quality ─────────────────────────────────────────────

export const PQ_SCALE = [
  'N/A',
  'Lowest',
  'Lowest+',
  'Low',
  'Low+',
  'Medium',
  'Medium+',
  'High',
  'High+',
  'Highest',
] as const
export type PqRating = (typeof PQ_SCALE)[number]

export const NM_SCALE = ['FailsM', 'SlightlyM', 'ModeratelyM', 'HighlyM', 'FullyM'] as const
export type NmRating = (typeof NM_SCALE)[number]

export const NM_LABELS: Record<NmRating, string> = {
  FullyM: 'Fully Meets',
  HighlyM: 'Highly Meets',
  ModeratelyM: 'Moderately Meets',
  SlightlyM: 'Slightly Meets',
  FailsM: 'Fails to Meet',
}

export const ETA_SCALE = ['NS', 'SS', 'S', 'HS'] as const
export type EtaRating = (typeof ETA_SCALE)[number]

export const ETA_LABELS: Record<EtaRating, string> = {
  NS: 'Not Satisfying',
  SS: 'Somewhat Satisfying',
  S: 'Satisfying',
  HS: 'Highly Satisfying',
}

export interface ZetaFullFlags {
  porn: boolean
  foreign_language: boolean
  did_not_load: boolean
}

export interface EtaLiteFlags {
  wrong_language: boolean
  content_unavailable: boolean
  inappropriate: boolean
}

export interface ZetaPayload {
  rubric: 'full' | 'lite'
  landing_page_snapshot_url?: string
  query: string
  user_intent?: string
  ask_pq?: boolean
  ask_nm?: boolean
  correct_pq?: PqRating
  correct_nm?: NmRating
  correct_satisfaction?: EtaRating
  degrees_of_separation?: number
  correct_flags: ZetaFullFlags | EtaLiteFlags
  ymyl_topic?: boolean
}

export interface ZetaAnswer {
  pq?: PqRating | null
  nm?: NmRating | null
  satisfaction?: EtaRating | null
  flags: ZetaFullFlags | EtaLiteFlags
}

// ─── Theta — Transcription ───────────────────────────────────────────────────

export const AUDIO_QUALITY_FLAGS = [
  'unclear_audio',
  'heavy_accent',
  'incorrect_language',
  'synthesized_or_recorded',
] as const
export type AudioQualityFlag = (typeof AUDIO_QUALITY_FLAGS)[number]

export const AUDIO_QUALITY_LABELS: Record<AudioQualityFlag, string> = {
  unclear_audio: 'Unclear Audio',
  heavy_accent: 'Heavy Accent',
  incorrect_language: 'Incorrect Language',
  synthesized_or_recorded: 'Synthesized or Recorded Speech',
}

export type SpeakerGender = 'Male' | 'Female' | 'Unsure'
export type ThetaTagType = 'unsure' | 'truncated'

export interface ThetaTag {
  type: ThetaTagType
  start_char: number
  end_char: number
}

export interface ThetaSegment {
  speaker: number
  gender: SpeakerGender
  start_ms: number
  end_ms: number
  transcript: string
  tags: ThetaTag[]
}

export interface ThetaWeights {
  segmentation: number
  speaker: number
  transcription: number
  tags: number
}

export interface ThetaPayload {
  duration_seconds: number
  audio_asset_url: string
  reference_segments: ThetaSegment[]
  reference_audio_quality_flags: AudioQualityFlag[]
  weights?: ThetaWeights
}

export interface ThetaAnswer {
  segments: ThetaSegment[]
  audio_quality_flags: AudioQualityFlag[]
}

export const DEFAULT_THETA_WEIGHTS: ThetaWeights = {
  segmentation: 0.3,
  speaker: 0.2,
  transcription: 0.35,
  tags: 0.15,
}

// ─── Score explain ───────────────────────────────────────────────────────────

export interface FieldDiff {
  field: string
  agent: string
  correct: string
  credit: number
}

export interface ScoreBreakdown {
  ratio: number
  diffs: FieldDiff[]
  notes?: string[]
}
