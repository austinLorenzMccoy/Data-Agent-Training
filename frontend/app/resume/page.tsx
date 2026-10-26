import { PageHero } from '@/components/page-hero'
import { PremiumGate } from '@/components/premium/premium-gate'
import { ResumeBuilder } from '@/components/resume/resume-builder'
import { currentUser } from '@/lib/server/http'
import { hasPremium } from '@/lib/server/premium'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Resume builder — Premium — Datanerds Annotation',
  description: 'Build a one-page resume for AI trainer, rater, transcription and annotation jobs, then save it as a PDF.',
}

export default async function ResumePage() {
  const user = await currentUser()
  const premium = user ? await hasPremium(user.id) : false

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Resume builder" title="A resume screeners" accent="shortlist." className="print:hidden">
        Pick the role you are applying for and fill in your details. Suggested skills and bullets are written for AI
        training, rating and annotation work. Your draft stays in this browser.
      </PageHero>
      {premium ? (
        <ResumeBuilder />
      ) : (
        <div className="mx-auto max-w-4xl px-4 py-12">
          <PremiumGate signedIn={!!user} next="/resume" unlocks="the resume builder" />
        </div>
      )}
    </main>
  )
}
