import { TrainingHub } from '@/components/training/training-hub'

export const metadata = {
  title: 'Field Training — Datanerds Annotation',
  description: 'Practice Alpha–Delta plus map evaluation, search quality, and transcription drills. No timer.',
}

export default function TrainingPage() {
  return (
    <main className="relative min-h-screen">
      <TrainingHub />
    </main>
  )
}
