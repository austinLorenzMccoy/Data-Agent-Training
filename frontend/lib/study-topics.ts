import type { AssignmentType } from './types'

// The written guidelines on the Study page. Each topic is one page at
// /prep/<id>, with its video (if any) at the top, so every rule lives in
// exactly one place.

export type StudyTopicId = 'rating' | 'transcripts' | 'replies' | 'extra-tracks'

export interface StudyTopic {
  id: StudyTopicId
  /** Task type used for the card art and to find the topic's video. */
  track: AssignmentType
  title: string
  accent: string
  blurb: string
  covers: string
}

export const STUDY_TOPICS: StudyTopic[] = [
  {
    id: 'rating',
    track: 'alpha',
    title: 'Rate AI',
    accent: 'responses.',
    blurb: 'Good, Okay or Bad, comparing two responses, and writing a reason that scores.',
    covers: 'Rate a response · Compare two · Compare AI media',
  },
  {
    id: 'transcripts',
    track: 'gamma',
    title: 'Review a',
    accent: 'transcript.',
    blurb: 'Pass a text conversation, or flag every reason it cannot be used.',
    covers: 'Review a transcript',
  },
  {
    id: 'replies',
    track: 'delta',
    title: 'Pick the best',
    accent: 'reply.',
    blurb: 'Choose the reply the other person would really send, and spot the traps.',
    covers: 'Pick the best reply',
  },
  {
    id: 'extra-tracks',
    track: 'epsilon',
    title: 'Maps, search',
    accent: 'and audio.',
    blurb: 'How the map, search-quality and transcription tasks are scored, with links to their full guidelines.',
    covers: 'Maps · Search quality · Search (simple) · Transcription',
  },
]

export function studyTopic(id: string): StudyTopic | undefined {
  return STUDY_TOPICS.find((t) => t.id === id)
}

/** Old Study links used ?tab=…; map them to the new pages. */
export const LEGACY_TABS: Record<string, StudyTopicId> = {
  core: 'rating',
  transcript: 'transcripts',
  response: 'replies',
  special: 'extra-tracks',
}
