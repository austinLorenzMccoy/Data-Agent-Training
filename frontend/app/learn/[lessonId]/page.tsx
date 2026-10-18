import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonPlayer } from '@/components/lessons/lesson-player'
import { LESSONS, lessonById, lessonMinutes } from '@/lib/lessons'
import { TYPE_NAMES } from '@/lib/scoring'

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = lessonById((await params).lessonId)
  return { title: lesson ? `${lesson.title} lesson — Datanerds Annotation` : 'Lesson not found' }
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = lessonById((await params).lessonId)
  if (!lesson) notFound()
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/learn" className="text-sm text-primary hover:underline">
          ← All lessons
        </Link>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {TYPE_NAMES[lesson.track]} · {lesson.chapters.length} chapters · {lessonMinutes(lesson)} min
        </p>
        <h1 className="mt-1 font-heading text-4xl font-medium">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.summary}</p>
        <div className="mt-8">
          <LessonPlayer lesson={lesson} />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Keyboard: space to play or pause, ← and → to skip 5 seconds.{' '}
          <a href={`/learn/${lesson.id}/script`} className="underline">
            Full script
          </a>
        </p>
      </div>
    </main>
  )
}
