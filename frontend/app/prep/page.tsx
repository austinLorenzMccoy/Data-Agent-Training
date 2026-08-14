import { SiteNav } from '@/components/site-nav'
import { PrepHub } from '@/components/prep/prep-hub'

export const metadata = {
  title: 'Intelligence Briefing — Datanerds Annotation',
  description: 'Study the core rating framework plus map, search-quality, and transcription specialisation tracks.',
}

export default function PrepPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <PrepHub />
    </main>
  )
}
