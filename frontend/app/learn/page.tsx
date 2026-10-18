import Link from 'next/link'
import { Play } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SkillScene } from '@/components/graphics/skill-scene'
import { LESSONS, lessonMinutes } from '@/lib/lessons'
import { ALL_ASSIGNMENT_TYPES, TYPE_NAMES } from '@/lib/scoring'

export const metadata = {
  title: 'Lessons — Datanerds Annotation',
  description: 'Short narrated lessons for each task type, with a quick check after every chapter.',
}

export default function LearnPage() {
  const withLesson = new Set(LESSONS.map((l) => l.track))
  const upcoming = ALL_ASSIGNMENT_TYPES.filter((t) => !withLesson.has(t))
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Lessons" title="Watch it once," accent="then practice.">
        Short narrated lessons with a quick check after every chapter. Captions on, speed up to 1.5×.
      </PageHero>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ul className="grid gap-5 md:grid-cols-2">
          {LESSONS.map((l) => (
            <li key={l.id}>
              <Link href={`/learn/${l.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50">
                <SkillTile type={l.track} className="relative w-full rounded-none px-10 py-6">
                  <SkillScene type={l.track} className="w-full max-w-sm text-[11px]" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-[#1a1714]/85 text-[#e0b84f] shadow-xl transition-transform group-hover:scale-110">
                      <Play className="ml-1 size-7" />
                    </span>
                  </span>
                </SkillTile>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: SKILL_ACCENT[l.track] }}>
                    {l.chapters.length} chapters · {lessonMinutes(l)} min
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-medium">{l.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{l.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {upcoming.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coming next</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {upcoming.map((t) => (
                <li key={t} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                  {TYPE_NAMES[t]}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
