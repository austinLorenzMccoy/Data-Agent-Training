import type { AssignmentType } from './types'

export interface SpecialisationTrack {
  id: string
  label: string
  focusType: AssignmentType
  xpRequired: number
  blurb: string
}

export const TRACKS: SpecialisationTrack[] = [
  {
    id: 'map_evaluator',
    label: 'Map Evaluation Specialist',
    focusType: 'epsilon',
    xpRequired: 3000,
    blurb: 'Local search / POI relevance, name, address, and pin accuracy.',
  },
  {
    id: 'search_quality_rater',
    label: 'Search Quality Rater',
    focusType: 'zeta',
    xpRequired: 5000,
    blurb: 'Page Quality and Needs Met ratings on the full TELUS-style scale.',
  },
  {
    id: 'search_quality_rater_lite',
    label: 'Search Quality Associate',
    focusType: 'eta',
    xpRequired: 2000,
    blurb: 'Simplified four-point search satisfaction — the on-ramp to Zeta.',
  },
  {
    id: 'transcription_specialist',
    label: 'Transcription Specialist',
    focusType: 'theta',
    xpRequired: 4000,
    blurb: 'Speaker segmentation, verbatim transcription, and span tagging.',
  },
]

export function trackForType(type: AssignmentType): SpecialisationTrack | undefined {
  return TRACKS.find((t) => t.focusType === type)
}
