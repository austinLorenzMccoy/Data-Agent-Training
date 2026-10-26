// Resume builder for AI-training and annotation roles. Platforms that hire
// raters and trainers screen resumes for three things: proof you can judge
// and write carefully, the subjects or languages you know well, and that you
// work independently to a guideline. The role presets below steer the
// summary, skills and bullets toward those.

export interface ResumeExperience {
  role: string
  org: string
  dates: string
  bullets: string
}

export interface ResumeEducation {
  degree: string
  school: string
  dates: string
  detail: string
}

export interface ResumeCertification {
  name: string
  issuer: string
  date: string
  url: string
}

export interface ResumeLanguage {
  language: string
  level: string
}

export interface Resume {
  role: RoleId
  name: string
  headline: string
  email: string
  phone: string
  location: string
  links: string
  summary: string
  skills: string[]
  experience: ResumeExperience[]
  education: ResumeEducation[]
  certifications: ResumeCertification[]
  languages: ResumeLanguage[]
}

export type RoleId = 'generalist' | 'coding' | 'domain' | 'language' | 'audio' | 'search'

export interface RolePreset {
  id: RoleId
  label: string
  headline: string
  summary: string
  skills: string[]
  bullets: string[]
}

export const ROLES: RolePreset[] = [
  {
    id: 'generalist',
    label: 'AI trainer / response rater',
    headline: 'AI Trainer · Response Evaluation & Writing',
    summary:
      'Detail-focused writer and evaluator who rates AI responses for accuracy, helpfulness and safety against written guidelines. I check every claim against primary sources, write clear justifications a reviewer can verify, and keep quality steady across long, self-directed task queues.',
    skills: [
      'Response rating (RLHF)',
      'Side-by-side comparison',
      'Fact-checking & research',
      'Written justifications',
      'Prompt writing',
      'Rubric writing',
      'Guideline adherence',
      'Grammar & style editing',
    ],
    bullets: [
      'Rated and ranked AI responses on accuracy, instruction-following and tone, writing a 2–5 sentence justification for each verdict',
      'Fact-checked claims against primary sources, catching errors in dates, figures and quotes',
      'Wrote original prompts and grading rubrics that exposed model weaknesses',
      'Kept a quality score above target while working independently to a 40-page guideline',
    ],
  },
  {
    id: 'coding',
    label: 'Coding AI trainer',
    headline: 'Software Engineer · Code Evaluation for AI Training',
    summary:
      'Developer who evaluates and corrects AI-written code. I run what the model writes, find the bugs and edge cases it misses, and explain the fix in plain language so the reasoning can be reviewed and reused.',
    skills: [
      'Python',
      'JavaScript / TypeScript',
      'SQL',
      'Code review',
      'Debugging & testing',
      'Algorithm analysis',
      'Code-response rating',
      'Technical writing',
    ],
    bullets: [
      'Reviewed AI-generated code for correctness, efficiency and style, running each solution against edge-case tests',
      'Wrote corrected reference solutions with step-by-step explanations',
      'Authored coding prompts graded by rubric to measure model reasoning',
      'Built and shipped [project] used by [number] people (link on GitHub)',
    ],
  },
  {
    id: 'domain',
    label: 'Subject expert (STEM, law, health, finance)',
    headline: '[Field] Specialist · Expert AI Evaluation',
    summary:
      '[Degree] in [field] who applies subject expertise to evaluating and improving AI answers. I write graduate-level questions with verified answers, spot subtle reasoning errors, and explain corrections with sources.',
    skills: [
      'Subject-matter expertise',
      'Expert question writing',
      'Step-by-step solution review',
      'Citation & source checking',
      'Rubric writing',
      'Error analysis',
      'Technical writing',
      'LaTeX',
    ],
    bullets: [
      'Wrote difficult [field] questions with worked, verified solutions that current models fail',
      'Reviewed model reasoning step by step and flagged the first incorrect step with an explanation',
      'Checked model citations against the original papers, statutes or guidelines',
      'Taught or tutored [subject] to [audience], explaining hard ideas in plain language',
    ],
  },
  {
    id: 'language',
    label: 'Language specialist / translator',
    headline: '[Language] Language Specialist · Translation & Localization QA',
    summary:
      'Native [language] speaker with professional English who evaluates AI output for fluency, cultural fit and meaning. I translate and localize prompts, rate translations for accuracy, and write natural, idiomatic reference answers.',
    skills: [
      'Native-level [language]',
      'Translation & localization',
      'Fluency & grammar rating',
      'Cultural adaptation',
      'Prompt writing in [language]',
      'Proofreading',
      'Transcription',
      'Style-guide adherence',
    ],
    bullets: [
      'Rated AI responses in [language] for fluency, grammar and cultural appropriateness',
      'Translated and localized prompts and reference answers, keeping meaning and register',
      'Flagged literal or unnatural phrasing and rewrote it idiomatically',
      'Proofread [type of documents] for [client or employer]',
    ],
  },
  {
    id: 'audio',
    label: 'Transcription / audio annotator',
    headline: 'Transcriptionist · Audio & Speech Data Annotation',
    summary:
      'Accurate transcriptionist who follows strict verbatim and clean-verbatim style guides. I label speakers, timestamps, noise and non-speech events consistently, and keep error rates low on difficult accents and poor-quality audio.',
    skills: [
      'Verbatim & clean-verbatim transcription',
      'Speaker diarization',
      'Timestamping',
      'Audio event tagging',
      'Accent comprehension',
      'Style-guide adherence',
      'Typing 70+ WPM',
      'Proofreading',
    ],
    bullets: [
      'Transcribed [hours] of audio to style guide, keeping accuracy above [percent]',
      'Segmented speakers and tagged noise, overlap and unclear speech consistently',
      'Reviewed other annotators’ transcripts and corrected errors against the guideline',
      'Handled hard audio: strong accents, crosstalk and background noise',
    ],
  },
  {
    id: 'search',
    label: 'Search / ads quality rater',
    headline: 'Search Quality Rater · Relevance & Intent Evaluation',
    summary:
      'Internet-savvy evaluator who rates search results, ads and maps listings for relevance to the user’s intent. I research unfamiliar queries quickly, apply detailed rating guidelines consistently, and know my local market well.',
    skills: [
      'Search relevance rating',
      'User-intent analysis',
      'Page quality (E-E-A-T)',
      'Maps & local search',
      'Web research',
      'Guideline adherence',
      'Local market knowledge',
      'Consistency under time limits',
    ],
    bullets: [
      'Rated search results and ads for relevance to user intent using a 160-page guideline',
      'Researched unfamiliar queries to judge result quality and page trustworthiness',
      'Checked map listings for accuracy of names, addresses and opening hours',
      'Met weekly quality and time targets while working remotely and independently',
    ],
  },
]

export function rolePreset(id: RoleId): RolePreset {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}

export const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic']

export function emptyResume(role: RoleId = 'generalist'): Resume {
  const preset = rolePreset(role)
  return {
    role,
    name: '',
    headline: preset.headline,
    email: '',
    phone: '',
    location: '',
    links: '',
    summary: '',
    skills: [],
    experience: [{ role: '', org: '', dates: '', bullets: '' }],
    education: [{ degree: '', school: '', dates: '', detail: '' }],
    certifications: [],
    languages: [{ language: 'English', level: 'Fluent' }],
  }
}

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : '')

function list<T>(v: unknown, map: (o: Record<string, unknown>) => T, max = 20): T[] {
  return Array.isArray(v)
    ? v.filter((o) => o && typeof o === 'object').slice(0, max).map((o) => map(o as Record<string, unknown>))
    : []
}

// Reads a saved draft back from storage, dropping anything malformed.
export function parseResume(raw: string | null): Resume | null {
  if (!raw) return null
  let o: Record<string, unknown>
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    o = parsed
  } catch {
    return null
  }
  const role = ROLES.some((r) => r.id === o.role) ? (o.role as RoleId) : 'generalist'
  return {
    role,
    name: str(o.name, 120),
    headline: str(o.headline, 200),
    email: str(o.email, 200),
    phone: str(o.phone, 60),
    location: str(o.location, 120),
    links: str(o.links, 400),
    summary: str(o.summary, 1500),
    skills: Array.isArray(o.skills) ? o.skills.map((s) => str(s, 80)).filter(Boolean).slice(0, 40) : [],
    experience: list(o.experience, (e) => ({ role: str(e.role, 120), org: str(e.org, 120), dates: str(e.dates, 60), bullets: str(e.bullets) })),
    education: list(o.education, (e) => ({ degree: str(e.degree, 160), school: str(e.school, 160), dates: str(e.dates, 60), detail: str(e.detail, 400) })),
    certifications: list(o.certifications, (c) => ({ name: str(c.name, 160), issuer: str(c.issuer, 120), date: str(c.date, 60), url: str(c.url, 300) })),
    languages: list(o.languages, (l) => ({ language: str(l.language, 60), level: str(l.level, 40) })),
  }
}

// Bullets are typed one per line; leading dashes or dots are optional.
export function splitBullets(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*·]\s*/, '').trim())
    .filter(Boolean)
}

// Gentle checks shown beside the preview. Each one is a reason a screener
// would pass over the resume.
export function resumeTips(r: Resume): string[] {
  const tips: string[] = []
  if (!r.name.trim() || !r.email.trim()) tips.push('Add your name and email so a recruiter can reach you.')
  if (r.summary.trim().length < 120) tips.push('Write a 2–3 sentence summary naming the work you want and what you check carefully.')
  if (r.skills.length < 5) tips.push('List at least 5 skills. Screeners search for terms like “fact-checking”, “RLHF” and your languages.')
  const bullets = r.experience.flatMap((e) => splitBullets(e.bullets))
  if (bullets.length < 3) tips.push('Add at least 3 experience bullets. Teaching, tutoring, editing and research all count.')
  if (bullets.some((b) => /\[[^\]]+\]/.test(b)) || /\[[^\]]+\]/.test(r.summary + r.headline))
    tips.push('Replace every [bracketed] placeholder with your own detail.')
  if (bullets.length > 0 && !bullets.some((b) => /\d/.test(b)))
    tips.push('Put a number in at least one bullet: hours, tasks, accuracy, students, pages.')
  if (!r.education.some((e) => e.degree.trim())) tips.push('Add your highest degree. Many expert projects filter on it.')
  return tips
}
