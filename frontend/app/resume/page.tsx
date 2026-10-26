import { PageHero } from '@/components/page-hero'
import { ResumeBuilder } from '@/components/resume/resume-builder'

export const metadata = {
  title: 'Resume builder — Datanerds Annotation',
  description: 'Build a one-page resume for AI trainer, rater, transcription and annotation jobs, then save it as a PDF.',
}

export default function ResumePage() {
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Resume builder" title="A resume screeners" accent="shortlist." className="print:hidden">
        Pick the role you are applying for and fill in your details. Suggested skills and bullets are written for AI
        training, rating and annotation work. Your draft stays in this browser.
      </PageHero>
      <ResumeBuilder />
    </main>
  )
}
