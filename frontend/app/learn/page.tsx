import Link from 'next/link'
import { Play } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SkillScene } from '@/components/graphics/skill-scene'
import { LESSONS, lessonMinutes } from '@/lib/lessons'
import type { Lesson } from '@/lib/lessons/types'

export const metadata = {
  title: 'Videos — Datanerds Annotation',
  description: 'Short narrated video guides to the guidelines, and tutorials on using the site.',
}

function VideoCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={`/learn/${lesson.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50">
      <SkillTile type={lesson.track} className="relative w-full rounded-none px-10 py-6">
        <SkillScene type={lesson.track} className="w-full max-w-sm text-[11px]" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#1a1714]/85 text-[#e0b84f] shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7" />
          </span>
        </span>
      </SkillTile>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: SKILL_ACCENT[lesson.track] }}>
          {lesson.chapters.length} chapters · {lessonMinutes(lesson)} min
        </p>
        <h3 className="mt-1 font-heading text-2xl font-medium">{lesson.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{lesson.summary}</p>
      </div>
    </Link>
  )
}

export default function VideosPage() {
  const guides = LESSONS.filter((l) => l.kind === 'guideline')
  const tutorials = LESSONS.filter((l) => l.kind === 'tutorial')
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Videos" title="Watch the guide," accent="then practice.">
        Narrated video guides to the guidelines, and short tutorials on using the site. Captions on, speed up to 1.5×, a
        quick check after every chapter.
      </PageHero>
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="font-heading text-3xl font-medium">
            Guideline <em className="italic text-primary">videos</em>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Each one walks through a written guideline. Read the guideline alongside it.</p>
          <ul className="mt-5 grid gap-5 md:grid-cols-2">
            {guides.map((l) => (
              <li key={l.id}>
                <VideoCard lesson={l} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tutorials-heading">
          <h2 id="tutorials-heading" className="font-heading text-3xl font-medium">
            <em className="italic text-primary">Tutorials</em>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">How to use the site: tests, scoring and results.</p>
          <ul className="mt-5 grid gap-5 md:grid-cols-2">
            {tutorials.map((l) => (
              <li key={l.id}>
                <VideoCard lesson={l} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
