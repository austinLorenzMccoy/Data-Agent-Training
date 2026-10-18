import type { AssignmentType } from '@/lib/types'
import type { AudioManifest, Lesson } from './types'
import { REVIEW_A_TRANSCRIPT } from './review-a-transcript'
import { TIMED_TEST_TUTORIAL } from './timed-test-tutorial'
import { RATE_AI_RESPONSES } from './rate-ai-responses'
import { PICK_THE_BEST_REPLY } from './pick-the-best-reply'
import manifest from './audio-manifest.json'

export const LESSONS: Lesson[] = [RATE_AI_RESPONSES, REVIEW_A_TRANSCRIPT, PICK_THE_BEST_REPLY, TIMED_TEST_TUTORIAL]

export const AUDIO = manifest as AudioManifest

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

/** The guideline video for a task type, if there is one. */
export function guideVideoForTrack(track: AssignmentType): Lesson | undefined {
  return LESSONS.find((l) => l.kind === 'guideline' && l.track === track)
}

/** Narration length in minutes, from the generated audio when present. */
export function lessonMinutes(lesson: Lesson): number {
  const audio = AUDIO[lesson.id]
  const seconds = lesson.chapters.reduce((s, c) => {
    const a = audio?.[c.id]
    if (a) return s + a.duration
    const words = c.scenes.reduce((w, sc) => w + sc.say.split(/\s+/).length, 0)
    return s + (words / 150) * 60
  }, 0)
  return Math.max(1, Math.round(seconds / 60))
}

export const LESSON_PROGRESS_KEY = 'dna.lessons.v1'

export type LessonProgress = Record<string, { chapters: string[] }>
