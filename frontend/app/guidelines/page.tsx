import { GuidelineTrackList } from '@/components/prep/guideline-track-list'

export const metadata = {
  title: 'Guidelines — Datanerds Annotation',
  description: 'Open a specialisation track to study its source guideline in place.',
}

export default function GuidelinesPage() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Source guidelines · study in place
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Guidelines</h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Click a track to open its source guideline. The document fills the page. Nothing
            downloads.
          </p>
        </div>
        <GuidelineTrackList />
      </div>
    </main>
  )
}
