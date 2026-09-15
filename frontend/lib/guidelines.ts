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

const HEDGEHOG: GuidelinePack = {
  id: 'iota',
  type: 'iota',
  eyebrow: 'Handshake guideline',
  title: 'AI media comparison',
  source: 'Handshake · Project Hedgehog / H2H Evals onboarding + worked answer key',
  why: 'Two AI-generated images, videos, or live speech-to-speech turns, judged on one named axis at a time. The full rubric plus the graded reasoning behind real Hedgehog answer-key picks.',
  chapters: [
    {
      id: 'axes',
      title: 'The six axes',
      subtitle: 'Every comparison is scored on exactly one of these — never all at once',
      intro:
        'A response can win the axis being asked about and still lose overall. Grade only the labeled dimension; do not let a prettier clip bleed into an Instruction Following or Identity call.',
      rows: [
        {
          label: 'Identity',
          body: 'Does the generated face/subject match the reference on the features that make someone recognizable — face shape, brows, eye color, hairline — not just "similar person, similar smile."',
        },
        {
          label: 'Instr. following',
          body: 'Check the prompt beat by beat against what is on screen. A single missed or misassigned beat (the wrong person raises a hand) decides the axis even if the rest matches.',
        },
        {
          label: 'Artifacts',
          body: 'Waxy specular highlights that match no real light source, fused fingers, identity drift mid-clip, garbled rendered text. The single most common grading error is missing an artifact in an otherwise polished, well-lit image — polish hides defects, it does not excuse them.',
        },
        {
          label: 'Motion/temporal',
          body: 'A fixed-period judder (frame-to-frame change alternating high/low even when nothing moves) is instability, not motion energy. A smooth, cut-free take beats a sharper but stuttering one — even if the smooth take is a liability on a different axis like "handheld and shaky."',
        },
        {
          label: 'Audio quality/sync',
          body: 'Bitrate and dynamic range gaps are usually audible even before you check the numbers. A room going to total digital silence mid-scene is a flag, not automatically a pass — check whether it lines up with a scripted beat or just reads as a dropout.',
        },
        {
          label: 'Naturalness',
          body: 'Persona fit and conversational presence are constituents of naturalness, not decoration on top of it. But naturalness only becomes the tiebreaker once both responses clear a utility floor — a pleasant-sounding response that fails to actually help loses regardless of delivery.',
        },
      ],
    },
    {
      id: 'overall',
      title: 'Overall preference is not an average',
      rows: [
        {
          label: 'Rule',
          body: 'Overall Preference is its own judgment call, not a mechanical roll-up of the per-axis scores. A video can score well on every individual dimension and still feel off overall — trust that instinct rather than re-deriving it from the sub-scores.',
          tone: 'warn',
        },
        {
          label: 'Volunteer misses',
          body: 'A justification that names your own pick\'s weaknesses alongside the winning reasons reads as calibrated. One that only lists the losing response\'s flaws reads as cheerleading — graders discount it.',
        },
      ],
    },
    {
      id: 'complex-task',
      title: 'Complex task calls (entity tags, flags, rework)',
      subtitle: 'A second family of Hedgehog work: judging annotation decisions rather than comparing two clips',
      rows: [
        {
          label: 'Entity tags',
          body: 'Keep discrete, identifiable objects with clear boundaries (a person, an umbrella). Drop weather/scene/lighting descriptors (rain, street, city) and anything not identifiable as a specific instance (defocused lights, reflections).',
        },
        {
          label: 'Flag vs. skip',
          body: 'Flag when the footage itself is unusable for the annotation that matters (too dark, too blurred to identify the target). Skip is for when the footage is fine but the task itself is unclear. Do not flag just because part of the clip is imperfect if the action in question is still readable.',
        },
        {
          label: 'Unsupported claims',
          body: 'A grounded caption may state only what is directly visible. "Holds an umbrella" is safe — holding is a visible physical state. "Waits for a cable car" is not — waiting is a claim about purpose, and a vehicle that is not in frame cannot be referenced.',
        },
        {
          label: 'Dot placement',
          body: 'One dot per distinct defect at its exact location, never one per letter or per instance of a repeated issue. A missing object that occupies no pixels (a croissant the prompt asked for but that was never rendered) gets the prompt text highlighted instead — a dot needs a defect to sit on.',
        },
      ],
    },
  ],
}

const VOYAGER: GuidelinePack = {
  id: 'kappa',
  type: 'kappa',
  eyebrow: 'Handshake guideline',
  title: 'Rubric & annotation judgment',
  source: 'Handshake · Project Voyager onboarding Q&A + Project Hedgehog complex task assessment',
  why: 'Writing a gradeable rubric criterion, spotting a badly scoped prompt, and making the right annotation call — four options each time, with the reasoning behind the correct pick and why the distractors fail.',
  chapters: [
    {
      id: 'rubric-rules',
      title: 'Writing a rubric criterion',
      intro: 'A criterion earns its place only if a grader can pass or fail it without rewatching the clip.',
      rows: [
        {
          label: 'Atomic',
          body: 'One verifiable fact per line. "Touches the oven door and then the counter" is two facts joined by "and" — split it. Anything joined with "and" gets split into separate criteria.',
        },
        {
          label: 'Self-contained',
          body: 'Statements of fact, not instructions ("identifies every object") and not subjective judgments ("handles it carefully"). A grader should not need outside context to evaluate it.',
        },
        {
          label: 'Bounded',
          body: 'The prompt must resolve to a closed set (which wearable items, which ingredients) — not an open scope like "what does she do with her hands," which gives no two graders the same answer.',
        },
        {
          label: 'Negatives matter',
          body: 'Positive criteria alone let a model pad its answer with plausible-sounding extras and still score full marks. Add a named negative for every plausible distractor that appears in the clip but is not part of the answer — a generic catch-all is weaker than naming the specific distractor.',
        },
      ],
    },
    {
      id: 'prompt-quality',
      title: 'Spotting a bad prompt',
      rows: [
        {
          label: '"From X to Y" ban',
          body: 'A window defined by a start event and an end event ("starting when... ending when," "after... but before," "between... and...") is banned even when it avoids those exact words. Anchor to one ongoing, named state instead ("while the barista is making the drink").',
        },
        {
          label: 'Double-barrelled',
          body: 'A prompt asking for an observable action plus a causal "why" fuses two different judgments into one line — the "why" requires subjective analysis that resists a clean rubric. Split them.',
        },
        {
          label: 'Mute test',
          body: 'The answer must be impossible to reach with the video muted, and both modalities must contribute real evidence. A modality that only marks an edge ("after the song ends...") or only tells you where to look does not count as genuine multimodal evidence.',
        },
        {
          label: 'Hard anchor, lazy payoff',
          body: 'A prompt can be genuinely hard to find in a long video and still be a bad prompt if, once found, the answer takes no real understanding — reading a color off one paused frame, for example. The anchor being hard to locate is not the same as the question being hard.',
        },
      ],
    },
    {
      id: 'annotation-calls',
      title: 'Annotation review calls',
      rows: [
        {
          label: 'Camera movement',
          body: 'Describe what the frame and background do, not where the subject went. Runners crossing the frame while the road, buildings, and sign posts hold position is a static shot, not a pan — a pan requires the background to sweep past a roughly stationary subject.',
        },
        {
          label: 'Reference photo drop',
          body: 'A tempting same-session tell (an identical object in the identical spot) does not by itself justify dropping a reference — check whether the surrounding evidence (lighting, framing, time of day) independently rules out or confirms the same shoot.',
        },
        {
          label: 'Visible text',
          body: 'Transcribe what is actually printed, including a genuine misspelling or an unconventional-but-real spelling choice — never silently correct it. Dropping visible text because it looks like an error is the most common quality miss on this task.',
        },
      ],
    },
  ],
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
  iota: HEDGEHOG,
  kappa: VOYAGER,
  proficiency: PROFICIENCY,
  dataannotation: DATAANNOTATION,
}

export function guidelineFor(id: GuidelinePackId): GuidelinePack | undefined {
  return BY_ID[id]
}

export function specialisationGuidelinePacks(): GuidelinePack[] {
  return [DATAANNOTATION, MAPS, SEARCH_PQ, LIGHTSPEED, FREYA, HEDGEHOG, VOYAGER, PROFICIENCY]
}

export function guidelineHrefForType(type: AssignmentType): string {
  const pack = guidelineFor(type)
  return pack ? `/guidelines/${pack.id}` : '/prep'
}
