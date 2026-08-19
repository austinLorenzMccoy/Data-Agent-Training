import type { AssignmentType } from './types'

export type GuidelinePackId = AssignmentType | 'proficiency'

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
  /** Render the illustrated source document instead of the digest chapters. */
  illustrated?: 'maps'
}

const MAPS: GuidelinePack = {
  id: 'epsilon',
  type: 'epsilon',
  eyebrow: 'Maps guideline',
  title: 'Maps Search Evaluation',
  source: 'TryRating Maps Search Evaluation Guidelines · March 2025 · 278 pages',
  why: 'Full TryRating Maps Search Evaluation guideline, with the original screenshots. Scroll the document — figures scale to the screen.',
  illustrated: 'maps',
  chapters: [],
}

const SEARCH_PQ: GuidelinePack = {
  id: 'zeta',
  type: 'zeta',
  eyebrow: 'Search quality guideline',
  title: 'Page Quality + Needs Met',
  source: 'General Guidelines (content reviewer) · Feb 2026 · 47 pages',
  why: 'This is the TELUS-style two-slider system. Expand a chapter below and study the scales, flags, and worked pairs in place.',
  chapters: [
    {
      id: 'split',
      title: 'Two independent sliders',
      rows: [
        { label: 'PQ', body: 'About the page. How well does this landing page achieve its purpose? Ignore the query when the PQ slider is shown.' },
        { label: 'NM', body: 'About this query. How well does this result satisfy the user\'s need? A High page can still Fail to Meet.' },
        { label: 'Rule', body: 'Never invent the missing slider. Some tasks ask PQ only, NM only, or both.', tone: 'warn' },
        { label: 'Grading', body: 'Exact match = 1.0. One step on the ordinal scale = 0.5. Two or more steps = 0.' },
      ],
    },
    {
      id: 'pq-tree',
      title: 'Page Quality decision tree',
      subtitle: 'Lowest is a gate, not a quality judgment',
      rows: [
        { label: '1', body: 'What is the true purpose of the page? Harmful or deceptive purpose → Lowest.' },
        { label: '2', body: 'Can the page harm people or society, or is it untrustworthy / spammy → Lowest.' },
        { label: '3', body: 'Otherwise rate how well the page achieves its purpose, using Main Content quality, reputation, and E-E-A-T. YMYL topics get a higher bar.' },
        { label: 'YMYL', body: 'Your Money or Your Life — health, finance, safety, civic info, major life decisions. Accuracy must match well-established expert consensus.' },
        { label: 'E-E-A-T', body: 'Experience, Expertise, Authoritativeness, Trust. Trust is the one that can sink an otherwise polished page.' },
      ],
    },
    {
      id: 'pq-scale',
      title: 'PQ scale (10 points)',
      rows: [
        { label: 'Lowest / Lowest+', body: 'Harm, deception, spam, or no real purpose. Gibberish, scams, malware, copied junk.' },
        { label: 'Low / Low+', body: 'A purpose exists, but Main Content is thin, unsatisfying, or poorly produced. Weak or negative reputation.' },
        { label: 'Medium / Medium+', body: 'Adequately achieves its purpose. Average effort and originality. Fine for everyday non-YMYL topics.' },
        { label: 'High / High+', body: 'Satisfying Main Content, clear effort/skill, positive reputation, solid E-E-A-T for the topic.' },
        { label: 'Highest', body: 'Very high quality Main Content, very positive reputation, very high E-E-A-T. Official or definitive sources often live here.' },
        { label: 'N/A', body: 'Use only when the task offers it (typically Did Not Load). Do not assign PQ if there is no slider.' },
      ],
    },
    {
      id: 'nm-scale',
      title: 'Needs Met scale (5 points)',
      rows: [
        { label: 'Fully Meets', body: 'The target page of a clear website or visit-in-person intent, or a complete exact answer. Many queries cannot have a FullyM result.' },
        { label: 'Highly Meets', body: 'Very helpful and on-intent. Official or comprehensive. Not appropriate if the page is untrustworthy or outdated.' },
        { label: 'Moderately Meets', body: 'Helpful but incomplete, slightly off-aspect, or requires real extra work.' },
        { label: 'Slightly Meets', body: 'Related but a stretch — too broad, too narrow, or only tangentially useful.' },
        { label: 'Fails to Meet', body: 'Wrong topic, wrong entity, useless, or harmful. Useless is useless even if PQ is High.', tone: 'bad' },
      ],
    },
    {
      id: 'flags',
      title: 'Porn · Foreign Language · Did Not Load',
      subtitle: 'Flags are about the result, not the query',
      rows: [
        { label: 'Porn', body: 'Flag every porn page, even if the query is not porn-seeking. Clear non-porn intent + porn MC → FailsM. Possible porn intent: grade the non-porn reading as dominant.' },
        { label: 'Foreign', body: 'Do not flag the task language, English, or a language a significant share of the locale reads. Flagged foreign pages are usually FailsM unless the query clearly wants that language (e.g. [baidu]).' },
        { label: 'Did Not Load', body: 'Blank page or a bare server error with no other content. Not for paywalls, malware interstitials, or expired listings. Flag + FailsM; PQ may be skipped.' },
      ],
    },
    {
      id: 'worked',
      title: 'Worked pairs',
      rows: [
        { label: 'YMYL junk', body: '[symptoms of dehydration] → unsourced “cure” page. PQ Lowest, NM FailsM. YMYL raises the bar; it does not change the flags.', tone: 'bad' },
        { label: 'Right site, wrong fact', body: '[how many octaves on a guitar] showing piano octaves. NM FailsM even if the landing page is High PQ.', tone: 'bad' },
        { label: 'Website intent', body: 'People may search for any site. The target homepage of a clear website query is FullyM even if PQ is low.', tone: 'good' },
      ],
    },
  ],
}

const LIGHTSPEED: GuidelinePack = {
  id: 'eta',
  type: 'eta',
  eyebrow: 'Search (simple) guideline',
  title: 'Search satisfaction (lite)',
  source: 'Project Lightspeed / Milky Way Search Quality Rating Guidelines',
  why: 'Same snapshot shell as Zeta, one four-point scale. Expand the principles, flags, and examiner traps below.',
  chapters: [
    {
      id: 'steps',
      title: 'Five-step grading process',
      rows: [
        { label: '1 Understand', body: 'Research the query. Never rely on personal familiarity. “Canada Goose” may be a coat, not a bird.' },
        { label: '2 Review', body: 'Identify result type (page, card, map, news, video, app) and whether that type is appropriate.' },
        { label: '3 Validate', body: 'Flag Wrong Language, Content Unavailable, or Inappropriate before you pick a grade.' },
        { label: '4 Rate', body: 'HS · S · SS · NS — meaning first, not keyword overlap.' },
        { label: '5 Recheck', body: 'Avoid the five common mistakes in the last chapter.' },
      ],
    },
    {
      id: 'scale',
      title: 'HS · S · SS · NS',
      rows: [
        { label: 'HS', body: 'Fully meets or exceeds the need with minimal effort. Official site, exact answer, or perfect match. 0 degrees of separation.' },
        { label: 'S', body: 'Clearly useful. May need one extra click or be slightly less direct than HS. ~1 degree.' },
        { label: 'SS', body: 'Partially helpful — related but incomplete, too broad/narrow, or real extra effort. ~2 degrees.' },
        { label: 'NS', body: 'Does not help. Wrong topic, wrong entity, outdated, or unusable. ~3+ degrees.', tone: 'bad' },
      ],
    },
    {
      id: 'principles',
      title: 'Four principles',
      rows: [
        { label: 'Degrees of separation', body: 'Beyoncé official site = HS (0). Lemonade on iTunes = S (1). Rolling Stone album review = SS (2). Reviewer’s Twitter = NS (3).' },
        { label: 'Meaning, not words', body: 'premierleague.com for “English premier league soccer” is HS despite missing query words. A same-words Wikipedia song page for “Gone Girl” is NS.' },
        { label: 'User effort', body: 'A knowledge card that answers “How old is Obama?” outranks a page the user must open and hunt through.' },
        { label: 'Source quality', body: 'Can raise or lower a grade, but never overrides intent. Satire is good for humor queries and bad for news queries.' },
      ],
    },
    {
      id: 'validate',
      title: 'Validation flags',
      rows: [
        { label: 'Wrong Language', body: 'Unlikely for the user. English is almost always acceptable. Country sites (amazon.co.jp for a Japan user) are acceptable.' },
        { label: 'Content Unavailable', body: '404, blank, login wall, stale context, security warning.' },
        { label: 'Inappropriate', body: 'Porn, hate, piracy, spam, shock/gore, clear misinformation — with medical/educational/journalistic exceptions.' },
      ],
    },
    {
      id: 'mistakes',
      title: 'Five mistakes that fail the quiz',
      rows: [
        { label: '1', body: 'Not researching the query. Never use Google/Bing rank position as the grade.' },
        { label: '2', body: 'Judging from the snippet or URL without opening the destination.' },
        { label: '3', body: 'Ignoring time and place — stale news or the wrong city.' },
        { label: '4', body: 'Ignoring conceptual distance — homepage vs the specific page, or one hop too far.' },
        { label: '5', body: 'Matching words instead of meaning; treating a mention as being about the topic.' },
      ],
    },
  ],
}

const FREYA: GuidelinePack = {
  id: 'theta',
  type: 'theta',
  eyebrow: 'Transcription guideline',
  title: 'Longform segmentation & transcription',
  source: 'Freya Certification Study Guide + Live Transcription EDC exam (22 Q, 90%)',
  why: 'Workflow first, then the exam traps. Expand a chapter and study the 7-step process, tags, and the 22 certification answers in place.',
  chapters: [
    {
      id: 'workflow',
      title: 'Seven-step workflow',
      subtitle: 'Memorise the order',
      rows: [
        { label: '1 Review', body: 'Listen through. Count speakers, note overlap, pauses, and background sound.' },
        { label: '2 Segment', body: 'Drag intervals on the waveform. All audible speech. Overlaps get separate, overlapping intervals.' },
        { label: '3 Gender', body: 'Male / Female / Unsure — same speaker keeps the same label for the whole clip.' },
        { label: '4 Transcribe', body: 'Verbatim. Do not fix grammar. Punctuate so it is readable.' },
        { label: '5 Tag', body: 'Highlight, then apply Unsure or Truncated. Never type brackets.' },
        { label: '6 Quality', body: 'Unclear Audio / Heavy Accent / Incorrect Language / Synthesized-or-Recorded. Multi-select.' },
        { label: '7 Review', body: 'Boundaries, speakers, transcript, tags, flags — then submit.' },
      ],
    },
    {
      id: 'segment',
      title: 'Segmentation rules',
      rows: [
        { label: '500 ms', body: 'Start and end must sit within 500 ms of actual speech.' },
        { label: 'Pause < 2 s', body: 'Stay in the same segment.', tone: 'good' },
        { label: 'Pause > 2 s', body: 'New segment.', tone: 'warn' },
        { label: 'Overlap', body: 'One interval per speaker. Timestamps may overlap. Interrupting “um”/“ah” splits the first speaker into two intervals.' },
        { label: 'Speaker IDs', body: 'First-appearance order. Never renumber. Do not invent a new turn just because you are unsure — pick the most likely existing speaker.' },
        { label: 'Laughter', body: 'Standalone laughter gets its own interval and the [laughter] tag — never type “haha”.' },
        { label: 'Silence', body: 'Delete a pre-annotated interval that is only silence or noise.' },
      ],
    },
    {
      id: 'tags',
      title: 'Unsure vs Truncated',
      rows: [
        { label: 'Unsure', body: 'Mumble, noise, filled pauses, stutters, fragments, foreign words, made-up words. Consecutive filled pauses share one tag. Whole foreign utterance → empty Unsure, leave blank.' },
        { label: 'Truncated', body: 'Only when the recording cuts the first or last word of the audio. Not for mid-clip half-words, stutters, or “they might have said more.”' },
        { label: 'Priority', body: 'If both could apply → Truncated only. Also tick Unclear Audio if noise is involved.', tone: 'warn' },
        { label: 'Half word', body: 'Speaker says half a word and does not correct it → type what you hear + Unsure. Not Truncated.' },
        { label: 'Example', body: 'Who won the [unsure: Wor] World Cup this year?' },
      ],
    },
    {
      id: 'quality',
      title: 'Audio quality + forbidden zones',
      rows: [
        { label: 'Heavy Accent', body: 'Only when the accent actually blocks confident transcription — not merely because an accent is present. Does not apply to babbling.' },
        { label: 'Incorrect Language', body: 'Entire utterance in another language. Empty Unsure, do not transcribe even if you understand it.' },
        { label: 'Synthesized', body: 'Voice assistants, filters, recorded playback. Still flag it when the speech is audible.' },
        { label: 'Forbidden zone', body: 'Context only. Speech entirely inside it → do nothing. Speech that crosses into the gradable zone → annotate the entire segment, including the forbidden-zone tail.' },
      ],
    },
    {
      id: 'exam',
      title: 'Certification exam answers',
      subtitle: '22 questions · 90% to pass · 2 attempts',
      rows: [
        { label: 'Q1', body: 'Half a word, not corrected → type the spoken part with [unsure].' },
        { label: 'Q2', body: 'Maximum timing deviation at start/end: 0.5 seconds.' },
        { label: 'Q3', body: 'Speaker ID follows first-appearance order. Each person has one ID for the whole file.' },
        { label: 'Q4', body: 'An interrupting “um”/“ah” splits the first speaker into two intervals. Yes.' },
        { label: 'Q5', body: 'Cannot apply Truncated and Unsure to the same words — Truncated only.' },
        { label: 'Q6', body: 'Laughter is tagged [laughter].' },
        { label: 'Q7', body: 'Non-speech / disfluency stays in the segment only if speech continues after it.' },
        { label: 'Q8', body: 'Two people talking at once → one speaker label per person.' },
        { label: 'Q9', body: 'Pre-annotated silence → delete the segment.' },
        { label: 'Q10', body: 'Truncated only at the start/end of the audio, and only if you cannot transcribe. Do not use it when the last word is understandable, or when the speaker finished a sentence.' },
        { label: 'Q11', body: 'Synthesized but audible still gets “request is synthesized or recorded speech.”' },
        { label: 'Q12', body: 'Truncated = audio starts with a cut word, or audio ends with a half word. Not mid-clip halves or stutters.' },
        { label: 'Q13', body: 'Longest pause allowed inside one segment: 2 seconds.' },
        { label: 'Q14', body: '“hmm right” → “Hmm, right.”' },
        { label: 'Q15', body: 'Labels used: [laughter], [truncated], [unsure]. Not [wrong language] or [noise].' },
        { label: 'Q16', body: 'Long foreign stretch → [unsure] and leave empty.' },
        { label: 'Q17', body: 'A run of filled pauses → one [unsure] covering all of them.' },
        { label: 'Q18', body: 'Segment begins/ends in a forbidden zone but is gradable → annotate the whole segment normally.' },
        { label: 'Q19', body: 'Grammar mistakes → type them as spoken.' },
        { label: 'Q20', body: '“Wor World Cup” → Who won the [unsure: Wor] World Cup this year?' },
        { label: 'Q21', body: 'Pre-transcript missing filled pauses or stutters → add them and tag [unsure].' },
        { label: 'Q22', body: 'Filled pauses are tagged [unsure].' },
      ],
    },
  ],
}

const PROFICIENCY: GuidelinePack = {
  id: 'proficiency',
  eyebrow: 'English exam guide',
  title: 'en-CA Language Proficiency',
  source: 'English Canada Language Proficiency Certification · 50-question compilation',
  why: 'This is the gate in front of Theta, not a rating track. Expand the patterns below. The live exam is timed and one-shot — the answer key is not on the exam page.',
  chapters: [
    {
      id: 'shape',
      title: 'What the exam actually tests',
      rows: [
        { label: 'Listening', body: 'Short spoken contexts. Answer the implied need, not a keyword from the clip. “Cover my 2 and 3 o’clock” → cover the afternoon meetings.' },
        { label: 'Vocabulary', body: 'Precise academic/professional English: irrefutable, lucid, perceptive, composed, biting, laden, polarized, mitigate, feasible, necessitate.' },
        { label: 'Inversion / grammar', body: 'Had he but listened… / Rarely have I seen… / Little did she know… / Were he more careful… / have been working for three years / accused of / objected to.' },
        { label: 'Pragmatics', body: '“You must come over for dinner sometime” is a polite non-plan. “Great, isn’t it?” can be dry sarcasm. “Over the moon” = extremely happy. Canadians ask for the washroom.' },
        { label: 'Inference', body: 'Main criticism, speaker concern, implied next step. Prefer the option that names the function of the utterance, not a restatement of a noun from the stem.' },
      ],
    },
    {
      id: 'patterns',
      title: 'High-yield patterns',
      subtitle: 'Representative — not the live exam',
      rows: [
        { label: 'Stem', body: 'Her argument was so ______ that it left no room for rebuttal. → irrefutable (not tenuous / fragile).', tone: 'good' },
        { label: 'Inversion', body: 'Rarely have I seen such an impressive performance. Subject-auxiliary inversion after negative adverbials.' },
        { label: 'Locale', body: 'Public toilets in a Canadian restaurant → washroom, not loo / lavatory / privy.' },
        { label: 'Pragmatic', body: '“You must come over sometime” has no fixed plan. Do not treat it as a confirmed invitation.' },
        { label: 'Listening', body: 'If the speaker says the campaign “got attention” but “didn’t move the needle” on sales, the evaluation is: failed its primary objective.', tone: 'warn' },
      ],
    },
  ],
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
}

export function guidelineFor(id: GuidelinePackId): GuidelinePack | undefined {
  return BY_ID[id]
}

export function specialisationGuidelinePacks(): GuidelinePack[] {
  return [MAPS, SEARCH_PQ, LIGHTSPEED, FREYA, PROFICIENCY]
}
