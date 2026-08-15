import { GuidelinesSection } from '@/components/prep/guidelines-section'

export const metadata = {
  title: 'Guidelines — Datanerds Annotation',
  description: 'Study the map, search-quality, transcription, and language-gate guidelines in place.',
}

export default function GuidelinesPage() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Source dossiers · study in place
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Guidelines</h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Maps, Page Quality, search satisfaction, transcription, and the en-CA language gate.
            Open a dossier, then a chapter.
          </p>
        </div>
        <GuidelinesSection />
      </div>
    </main>
  )
}
