import { SiteNav } from '@/components/site-nav'
import { PrepHub } from '@/components/prep/prep-hub'

export const metadata = {
  title: 'Intelligence Briefing — Datanerds Annotation',
  description: 'Study the evaluation framework before field training. Master transcript clearance, response rating, and selection.',
}

export default function PrepPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <PrepHub />
    </main>
  )
}
