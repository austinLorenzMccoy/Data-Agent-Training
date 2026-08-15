import { notFound } from 'next/navigation'
import { GuidelineDocument } from '@/components/prep/guideline-document'
import { guidelineFor, specialisationGuidelinePacks, type GuidelinePackId } from '@/lib/guidelines'

type Params = { id: string }

export function generateStaticParams() {
  return specialisationGuidelinePacks().map((pack) => ({ id: pack.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const pack = guidelineFor(id as GuidelinePackId)
  return {
    title: pack ? `${pack.title} — Guidelines` : 'Guidelines',
  }
}

export default async function GuidelineTrackPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const pack = guidelineFor(id as GuidelinePackId)
  if (!pack) notFound()
  return (
    <main className="relative min-h-screen">
      <GuidelineDocument pack={pack} />
    </main>
  )
}
