import { Suspense } from 'react'
import { PrepHub } from '@/components/prep/prep-hub'

export const metadata = {
  title: 'Study — Datanerds Annotation',
  description: 'Learn the rating rules, then practice maps, search quality, and transcription.',
}

export default function PrepPage() {
  return (
    <main className="relative min-h-screen">
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">
            Loading study guide…
          </div>
        }
      >
        <PrepHub />
      </Suspense>
    </main>
  )
}
