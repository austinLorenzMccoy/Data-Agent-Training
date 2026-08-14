export interface ProficiencyChoice {
  id: string
  text: string
}

export interface ProficiencyQuestion {
  id: string
  kind: 'mcq' | 'listening'
  prompt: string
  audioUrl?: string
  choices: ProficiencyChoice[]
  correctId: string
}

export interface ProficiencyExam {
  id: string
  label: string
  passScore: number
  timeLimitSec: number
  questions: ProficiencyQuestion[]
}

export const PROFICIENCY_COOKIE_PREFIX = 'dna_proficiency_'
export const PROFICIENCY_STORAGE_KEY = 'dna.proficiency.v1'

export const EN_CA_EXAM: ProficiencyExam = {
  id: 'en-CA',
  label: 'English (Canada) Language Proficiency',
  passScore: 80,
  timeLimitSec: 15 * 60,
  questions: [
    {
      id: 'en_01',
      kind: 'mcq',
      prompt: 'Choose the word that best completes the sentence: "The analyst was asked to _____ the conflicting reports before filing."',
      choices: [
        { id: 'a', text: 'reconcile' },
        { id: 'b', text: 'recline' },
        { id: 'c', text: 'recount' },
        { id: 'd', text: 'relinquish' },
      ],
      correctId: 'a',
    },
    {
      id: 'en_02',
      kind: 'mcq',
      prompt: 'Which sentence is grammatically correct?',
      choices: [
        { id: 'a', text: 'Neither of the agents were ready.' },
        { id: 'b', text: 'Neither of the agents was ready.' },
        { id: 'c', text: 'Neither of the agent was ready.' },
        { id: 'd', text: 'Neither of the agents be ready.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_03',
      kind: 'mcq',
      prompt: 'In context, "the brief is thin" most nearly means:',
      choices: [
        { id: 'a', text: 'The document is physically narrow.' },
        { id: 'b', text: 'The file lacks sufficient evidence or detail.' },
        { id: 'c', text: 'The meeting will be short.' },
        { id: 'd', text: 'The agent is inexperienced.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_04',
      kind: 'mcq',
      prompt: 'Select the sentence that uses the comma correctly.',
      choices: [
        { id: 'a', text: 'After the debrief we, submitted the report.' },
        { id: 'b', text: 'After the debrief, we submitted the report.' },
        { id: 'c', text: 'After, the debrief we submitted the report.' },
        { id: 'd', text: 'After the debrief we submitted, the report.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_05',
      kind: 'mcq',
      prompt: 'A colleague writes: "Can you have a look when you get a minute?" The most professional reply is:',
      choices: [
        { id: 'a', text: 'No.' },
        { id: 'b', text: 'I can review it this afternoon and send notes by 16:00.' },
        { id: 'c', text: 'Why would I?' },
        { id: 'd', text: 'k' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_06',
      kind: 'mcq',
      prompt: 'Choose the word closest in meaning to "mitigate".',
      choices: [
        { id: 'a', text: 'worsen' },
        { id: 'b', text: 'ignore' },
        { id: 'c', text: 'lessen' },
        { id: 'd', text: 'announce' },
      ],
      correctId: 'c',
    },
    {
      id: 'en_07',
      kind: 'mcq',
      prompt: 'Which sentence is in the active voice?',
      choices: [
        { id: 'a', text: 'The transcript was flagged by the agent.' },
        { id: 'b', text: 'The agent flagged the transcript.' },
        { id: 'c', text: 'The transcript has been flagged.' },
        { id: 'd', text: 'Flagging of the transcript occurred.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_08',
      kind: 'listening',
      prompt:
        'Listen to the clip. What does the speaker want the listener to do first?',
      audioUrl: '/audio/proficiency-01.wav',
      choices: [
        { id: 'a', text: 'Rewrite the entire report from scratch.' },
        { id: 'b', text: 'Confirm the timestamps, then send a corrected draft.' },
        { id: 'c', text: 'Call the client immediately.' },
        { id: 'd', text: 'Delete the audio file.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_09',
      kind: 'mcq',
      prompt: '"I could care less" versus "I couldn\'t care less" — which is the standard meaning of complete indifference?',
      choices: [
        { id: 'a', text: 'I could care less' },
        { id: 'b', text: "I couldn't care less" },
        { id: 'c', text: 'Both mean the same and are equally standard' },
        { id: 'd', text: 'Neither is used in Canadian English' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_10',
      kind: 'mcq',
      prompt: 'Pick the correctly spelled Canadian English word.',
      choices: [
        { id: 'a', text: 'color' },
        { id: 'b', text: 'colour' },
        { id: 'c', text: 'collor' },
        { id: 'd', text: 'colur' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_11',
      kind: 'listening',
      prompt: 'Listen to the clip. What is the speaker\'s attitude toward the first draft?',
      audioUrl: '/audio/proficiency-02.wav',
      choices: [
        { id: 'a', text: 'It is ready to publish with no changes.' },
        { id: 'b', text: 'It is promising but still needs a factual pass.' },
        { id: 'c', text: 'It should be discarded.' },
        { id: 'd', text: 'They did not hear the draft.' },
      ],
      correctId: 'b',
    },
    {
      id: 'en_12',
      kind: 'mcq',
      prompt: 'In a transcript, a speaker says "we\'re gonna park that." In workplace English this most nearly means:',
      choices: [
        { id: 'a', text: 'Move a vehicle.' },
        { id: 'b', text: 'Postpone the topic and return to it later.' },
        { id: 'c', text: 'Cancel the project permanently.' },
        { id: 'd', text: 'Archive a file to disk.' },
      ],
      correctId: 'b',
    },
  ],
}

export const PROFICIENCY_EXAMS: Record<string, ProficiencyExam> = {
  'en-CA': EN_CA_EXAM,
}

export function getExam(id: string): ProficiencyExam | undefined {
  return PROFICIENCY_EXAMS[id]
}

export interface ProficiencyRecord {
  examId: string
  score: number
  passed: boolean
  completedAt: number
}

function readStore(): Record<string, ProficiencyRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROFICIENCY_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ProficiencyRecord>) : {}
  } catch {
    return {}
  }
}

export function getProficiencyRecord(examId: string): ProficiencyRecord | null {
  return readStore()[examId] ?? null
}

export function hasPassedProficiency(examId: string): boolean {
  if (typeof document !== 'undefined') {
    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${PROFICIENCY_COOKIE_PREFIX}${examId}=`))
    if (cookie?.split('=')[1] === 'passed') return true
  }
  return getProficiencyRecord(examId)?.passed === true
}

export function saveProficiencyResult(record: ProficiencyRecord): void {
  if (typeof window === 'undefined') return
  const store = readStore()
  store[record.examId] = record
  localStorage.setItem(PROFICIENCY_STORAGE_KEY, JSON.stringify(store))
  const value = record.passed ? 'passed' : 'failed'
  document.cookie = `${PROFICIENCY_COOKIE_PREFIX}${record.examId}=${value}; path=/; max-age=31536000; samesite=lax`
}

export function scoreExam(exam: ProficiencyExam, answers: Record<string, string>): { score: number; passed: boolean } {
  const total = exam.questions.length
  const hits = exam.questions.filter((q) => answers[q.id] === q.correctId).length
  const score = total === 0 ? 0 : Math.round((hits / total) * 100)
  return { score, passed: score >= exam.passScore }
}
