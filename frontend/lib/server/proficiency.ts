import 'server-only'
import { EN_CA_QUESTIONS } from '@/lib/proficiency-en-ca'
import { EXAM_META, type ProficiencyExam, type PublicProficiencyExam } from '@/lib/proficiency'

const EXAMS: Record<string, ProficiencyExam> = {
  'en-CA': { ...EXAM_META['en-CA'], questions: EN_CA_QUESTIONS },
}

export function getExam(id: string): ProficiencyExam | undefined {
  return EXAMS[id]
}

export function publicExam(exam: ProficiencyExam): PublicProficiencyExam {
  return {
    id: exam.id,
    label: exam.label,
    passScore: exam.passScore,
    timeLimitSec: exam.timeLimitSec,
    questions: exam.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      prompt: q.prompt,
      audioUrl: q.audioUrl,
      choices: q.choices,
    })),
  }
}

export function scoreExam(exam: ProficiencyExam, answers: Record<string, unknown>): { score: number; passed: boolean } {
  const total = exam.questions.length
  const hits = exam.questions.filter((q) => answers[q.id] === q.correctId).length
  const score = total === 0 ? 0 : Math.round((hits / total) * 100)
  return { score, passed: score >= exam.passScore }
}
