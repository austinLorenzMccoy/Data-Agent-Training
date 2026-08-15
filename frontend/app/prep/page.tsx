import { Suspense } from 'react'
import { PrepHub } from '@/components/prep/prep-hub'

export const metadata = {
  title: 'Intelligence Briefing — Datanerds Annotation',
  description: 'Study the core rating framework plus map, search-quality, and transcription specialisation tracks.',
}

export default function PrepPage() {
  return (
    <main className="relative min-h-screen">
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Loading briefing…
          </div>
        }
      >
        <PrepHub />
      </Suspense>
    </main>
  )
}
