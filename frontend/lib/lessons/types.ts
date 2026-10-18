import type { AssignmentType } from '@/lib/types'

// A video guide plays like a video: each chapter is narrated scene by scene over
// an animated stage, then pauses on a check question. A chapter can instead
// carry a recorded or AI-generated `videoUrl`; the player shows that and
// keeps the same chapters, captions and checks.

export interface ChatLine {
  who: string
  text: string
  /** Substring to mark as the problem. */
  mark?: string
}

export type Visual =
  | { kind: 'title'; eyebrow: string; title: string; accent?: string }
  | { kind: 'rule'; icon: string; title: string; body: string }
  | { kind: 'list'; title: string; items: string[]; numbered?: boolean }
  | { kind: 'chat'; lines: ChatLine[]; verdict?: { flag: boolean; label: string } }
  | {
      kind: 'compare'
      left: { text: string; flag: boolean; label: string }
      right: { text: string; flag: boolean; label: string }
    }

export interface Scene {
  id: string
  /** Narration, also shown as the caption. */
  say: string
  visual: Visual
}

export interface Check {
  question: string
  options: string[]
  answer: number
  why: string
}

export interface Chapter {
  id: string
  title: string
  scenes: Scene[]
  check: Check
  /** Optional recorded or AI-generated video that replaces the animated stage. */
  videoUrl?: string
}

export interface Lesson {
  id: string
  /** Guideline videos explain a guideline; tutorials show how to use the site. */
  kind: 'guideline' | 'tutorial'
  /** Task type the video is about, for its card art. */
  track: AssignmentType
  title: string
  summary: string
  /** The written guide this video goes with. */
  guide?: { href: string; label: string }
  /** Where the "done" screen sends the viewer. */
  next: { href: string; label: string }
  chapters: Chapter[]
}

/** Narration timing produced by scripts/build-lesson-audio.ts. */
export interface ChapterAudio {
  src: string
  duration: number
  cues: { scene: string; start: number }[]
}

export type AudioManifest = Record<string, Record<string, ChapterAudio>>
