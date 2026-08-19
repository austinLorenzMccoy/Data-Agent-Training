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
    label: 'Map results',
    focusType: 'epsilon',
    xpRequired: 3000,
    blurb: 'Rate each place for relevance, name, address, and pin.',
  },
  {
    id: 'search_quality_rater',
    label: 'Search quality',
    focusType: 'zeta',
    xpRequired: 5000,
    blurb: 'Rate the page quality and how well it answers the search.',
  },
  {
    id: 'search_quality_rater_lite',
    label: 'Search (simple)',
    focusType: 'eta',
    xpRequired: 2000,
    blurb: 'A simpler four-point scale for how satisfying a result is.',
  },
  {
    id: 'transcription_specialist',
    label: 'Transcription',
    focusType: 'theta',
    xpRequired: 4000,
    blurb: 'Cut speakers apart, type what they said, and tag anything unclear.',
  },
]

export function trackForType(type: AssignmentType): SpecialisationTrack | undefined {
  return TRACKS.find((t) => t.focusType === type)
}
