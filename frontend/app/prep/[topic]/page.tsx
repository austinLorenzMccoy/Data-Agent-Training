import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { Button } from '@/components/ui/button'
import { CoreFrameworkSection, ResponseSelectionSection, SpecialisationSection, TranscriptSection } from '@/components/prep/study-sections'
import { guideVideoForTrack, lessonMinutes } from '@/lib/lessons'
import { STUDY_TOPICS, studyTopic, type StudyTopicId } from '@/lib/study-topics'

const SECTIONS: Record<StudyTopicId, () => React.ReactNode> = {
  rating: () => <CoreFrameworkSection />,
  transcripts: () => <TranscriptSection />,
  replies: () => <ResponseSelectionSection />,
  'extra-tracks': () => <SpecialisationSection highlight="" />,
}

export function generateStaticParams() {
  return STUDY_TOPICS.map((t) => ({ topic: t.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const t = studyTopic((await params).topic)
  return { title: t ? `${t.title} ${t.accent.replace(/\.$/, '')} — Study — Datanerds Annotation` : 'Study' }
}

export default async function StudyTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const topic = studyTopic((await params).topic)
  if (!topic) notFound()
  const video = guideVideoForTrack(topic.track)
  const i = STUDY_TOPICS.indexOf(topic)
  const prev = STUDY_TOPICS[i - 1]
  const next = STUDY_TOPICS[i + 1]

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow={`Guideline · ${topic.covers}`} title={topic.title} accent={topic.accent}>
        {topic.blurb}
      </PageHero>
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Link href="/prep" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> All topics
        </Link>

        {video && (
          <Link href={`/learn/${video.id}`} className="group ink-band flex items-center gap-4 rounded-xl p-4 text-ink-foreground">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink-accent text-ink transition-transform group-hover:scale-105">
              <Play className="ml-0.5 size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-accent">
                Video guide · {lessonMinutes(video)} min
              </span>
              <span className="block font-heading text-lg">Watch this guideline explained, then read the details below</span>
            </span>
            <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        )}

        {SECTIONS[topic.id]()}

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Ready to practice?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Untimed practice first. Sit a timed test when you feel ready.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href="/training">
                Start practice <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/operation">Timed test</Link>
            </Button>
          </div>
        </div>

        <nav aria-label="Other topics" className="flex justify-between gap-4 pt-2 text-sm">
          {prev ? (
            <Link href={`/prep/${prev.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              <ArrowLeft className="size-3.5" /> {prev.title} {prev.accent}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/prep/${next.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              {next.title} {next.accent} <ArrowRight className="size-3.5" />
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}
