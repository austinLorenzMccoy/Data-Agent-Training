import { GuidelineTrackList } from '@/components/prep/guideline-track-list'

export const metadata = {
  title: 'Guidelines — Datanerds Annotation',
  description:
    'Open a guideline to study DataAnnotation.tech, maps, search quality, transcription, or the English exam.',
}

export default function GuidelinesPage() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Full guidelines
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Guidelines</h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Open a guideline to study it here. DataAnnotation.tech is its own pack — English stays
            the language exam. The document fills the page. Nothing downloads.
          </p>
        </div>
        <GuidelineTrackList />
      </div>
    </main>
  )
}
