import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookOpen, Play } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SkillTile } from '@/components/graphics/skill-art'
import { SKILL_ACCENT, SkillScene } from '@/components/graphics/skill-scene'
import { guideVideoForTrack, lessonMinutes } from '@/lib/lessons'
import { specialisationGuidelinePacks } from '@/lib/guidelines'
import { LEGACY_TABS, STUDY_TOPICS } from '@/lib/study-topics'

export const metadata = {
  title: 'Study — Datanerds Annotation',
  description: 'One written guideline and one short video per task, then practice.',
}

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ tab?: string; track?: string }> }) {
  const { tab, track } = await searchParams
  const legacy = LEGACY_TABS[(tab ?? track ?? '').toLowerCase()]
  if (legacy) redirect(`/prep/${legacy}`)

  const packs = specialisationGuidelinePacks()

  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Study" title="Watch, read," accent="then practice.">
        Each task has one written guideline and, where there is one, a short video. Start with the video, keep the
        guideline open while you practice.
      </PageHero>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <ul className="grid gap-5 md:grid-cols-2">
          {STUDY_TOPICS.map((t) => {
            const video = guideVideoForTrack(t.track)
            return (
              <li key={t.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <SkillTile type={t.track} className="w-full rounded-none px-10 py-6">
                  <SkillScene type={t.track} className="w-full max-w-sm text-[11px]" />
                </SkillTile>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: SKILL_ACCENT[t.track] }}>
                    {t.covers}
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-medium">
                    {t.title} <em className="italic">{t.accent}</em>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {video && (
                      <Link
                        href={`/learn/${video.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1714] px-4 py-2 text-sm font-medium text-[#f6f0e4] hover:bg-[#1a1714]/90"
                      >
                        <Play className="size-3.5 text-[#e0b84f]" /> Watch · {lessonMinutes(video)} min
                      </Link>
                    )}
                    <Link
                      href={`/prep/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary/50"
                    >
                      <BookOpen className="size-3.5" /> Read the guideline
                    </Link>
                    <Link href="/training" className="inline-flex items-center gap-1 px-2 py-2 text-sm text-primary hover:underline">
                      Practice <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <section id="guidelines-brief" className="mt-12 rounded-2xl border border-border bg-surface-raised p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Full source documents</p>
              <h2 className="mt-1 font-heading text-2xl font-medium">The original guideline documents</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                For the long, detailed versions. Figures scale to your screen. Nothing downloads.
              </p>
            </div>
            <Link href="/guidelines" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
              All documents <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {packs.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/guidelines/${p.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:border-primary/50"
                >
                  {p.title}
                  <ArrowRight className="size-3.5 shrink-0 text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
