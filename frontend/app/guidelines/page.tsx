import { GuidelineTrackList } from '@/components/prep/guideline-track-list'
import { PageHero } from '@/components/page-hero'

export const metadata = {
  title: 'Guidelines — Datanerds Annotation',
  description:
    'Open a guideline to study DataAnnotation.tech, maps, search quality, transcription, or the English exam.',
}

export default function GuidelinesPage() {
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Full guidelines" title="Read the" accent="source.">
        Open a guideline to study it here. DataAnnotation.tech is its own pack — English stays
        the language exam. The document fills the page. Nothing downloads.
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <GuidelineTrackList />
      </div>
    </main>
  )
}
