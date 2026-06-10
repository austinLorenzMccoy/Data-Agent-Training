import { SiteNav } from '@/components/site-nav'
import { TrainingHub } from '@/components/training/training-hub'

export const metadata = {
  title: 'Field Training — Datanerds Annotation',
  description: 'Sharpen your annotation instincts in low-stakes practice drills.',
}

export default function TrainingPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <TrainingHub />
    </main>
  )
}
