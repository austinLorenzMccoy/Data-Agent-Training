import type { AssignmentType } from './types'

export type GuidelinePackId = AssignmentType | 'proficiency' | 'dataannotation'

export interface StudyRow {
  label?: string
  body: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
}

export interface StudyChapter {
  id: string
  title: string
  subtitle?: string
  intro?: string
  rows: StudyRow[]
}

export interface GuidelinePack {
  id: GuidelinePackId
  type?: AssignmentType
  eyebrow: string
  title: string
  source: string
  why: string
  chapters: StudyChapter[]
  /** Full source document renderer. */
  illustrated?: 'maps' | 'pq' | 'lightspeed' | 'freya' | 'proficiency' | 'dataannotation'
}

const MAPS: GuidelinePack = {
  id: 'epsilon',
  type: 'epsilon',
  eyebrow: 'Maps guideline',
  title: 'Maps Search Evaluation',
  source: 'DataAnnotation.tech · Maps Search Evaluation Guidelines · March 2025 · 278 pages',
  why: 'Full Maps Search Evaluation guideline used on DataAnnotation.tech, with the original screenshots. Scroll the document — figures scale to the screen.',
  illustrated: 'maps',
  chapters: [],
}

const SEARCH_PQ: GuidelinePack = {
  id: 'zeta',
  type: 'zeta',
  eyebrow: 'Search quality guideline',
  title: 'Page Quality + Needs Met',
  source: 'General Guidelines (content reviewer) · Feb 2026 · 47 pages',
  why: 'Full General Guidelines (content reviewer, Feb 2026) — Page Quality, Needs Met, flags, and the worked examples from the source PDF, with figures.',
  illustrated: 'pq',
  chapters: [],
}

const LIGHTSPEED: GuidelinePack = {
  id: 'eta',
  type: 'eta',
  eyebrow: 'Search (simple) guideline',
  title: 'Search satisfaction (lite)',
  source: 'Project Lightspeed / Milky Way Search Quality Rating Guidelines',
  why: 'Full Lightspeed orientation document — 5-step process, HS/S/SS/NS, OPR, special cases, and the common exam mistakes.',
  illustrated: 'lightspeed',
  chapters: [],
}

const FREYA: GuidelinePack = {
  id: 'theta',
  type: 'theta',
  eyebrow: 'Transcription guideline',
  title: 'Longform segmentation & transcription',
  source: 'Freya Certification Study Guide + Live Transcription EDC exam (22 Q, 90%)',
  why: 'Full Freya study guide: 7-step workflow, tags, forbidden zones, knowledge checks, and the 22 live-exam answers.',
  illustrated: 'freya',
  chapters: [],
}

const PROFICIENCY: GuidelinePack = {
  id: 'proficiency',
  eyebrow: 'English exam guide',
  title: 'en-CA Language Proficiency',
  source: 'English Canada Language Proficiency Certification · 50-question compilation',
  why: 'Full 50-question compilation with audio context and answers. The live exam is timed and one-shot — the answer key is not on the exam page.',
  illustrated: 'proficiency',
  chapters: [],
}

const DATAANNOTATION: GuidelinePack = {
  id: 'dataannotation',
  eyebrow: 'DataAnnotation.tech',
  title: 'Evaluating AI responses',
  source: 'DataAnnotation.tech · Starter assessment + Evaluating Responses from AI Assistants v19',
  why: 'Good / Okay / Bad, which response is better, and the worked Tasks 1–7. Maps for this vendor is a separate illustrated document.',
  illustrated: 'dataannotation',
  chapters: [],
}

const BY_ID: Record<GuidelinePackId, GuidelinePack | undefined> = {
  alpha: undefined,
  beta: undefined,
  gamma: undefined,
  delta: undefined,
  epsilon: MAPS,
  zeta: SEARCH_PQ,
  eta: LIGHTSPEED,
  theta: FREYA,
  proficiency: PROFICIENCY,
  dataannotation: DATAANNOTATION,
}

export function guidelineFor(id: GuidelinePackId): GuidelinePack | undefined {
  return BY_ID[id]
}

export function specialisationGuidelinePacks(): GuidelinePack[] {
  return [DATAANNOTATION, MAPS, SEARCH_PQ, LIGHTSPEED, FREYA, PROFICIENCY]
}

export function guidelineHrefForType(type: AssignmentType): string {
  const pack = guidelineFor(type)
  return pack ? `/guidelines/${pack.id}` : '/prep'
}
