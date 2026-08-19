import { TrainingHub } from '@/components/training/training-hub'

export const metadata = {
  title: 'Practice — Datanerds Annotation',
  description: 'Practice rating AI responses, maps, search results, and transcripts. No timer.',
}

export default function TrainingPage() {
  return (
    <main className="relative min-h-screen">
      <TrainingHub />
    </main>
  )
}
