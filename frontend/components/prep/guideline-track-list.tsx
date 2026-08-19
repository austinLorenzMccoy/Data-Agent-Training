'use client'

import Link from 'next/link'
import { ArrowRight, AudioLines, BookOpen, MapPin, Search } from 'lucide-react'
import { specialisationGuidelinePacks, type GuidelinePack } from '@/lib/guidelines'

const ICONS: Record<string, typeof MapPin> = {
  epsilon: MapPin,
  zeta: Search,
  eta: Search,
  theta: AudioLines,
  proficiency: BookOpen,
}

export function GuidelineTrackList() {
  const packs = specialisationGuidelinePacks()
  return (
    <div id="guidelines-brief" className="scroll-mt-24 space-y-3">
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-2 text-[12px] font-medium text-primary">
          Extra-track guidelines
        </p>
        <h2 className="font-sans text-xl font-semibold tracking-tight">Pick a guideline</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Each one opens as a full-page document. Figures scale to the screen. Nothing downloads.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((pack) => (
          <TrackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  )
}

function TrackCard({ pack }: { pack: GuidelinePack }) {
  const Icon = ICONS[pack.id] ?? BookOpen
  return (
    <Link
      href={`/guidelines/${pack.id}`}
      className="group agency-card flex flex-col p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="mt-4 text-[12px] font-medium text-primary">
        {pack.eyebrow}
      </p>
      <h3 className="mt-1 font-sans text-lg font-semibold leading-tight">{pack.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{pack.source}</p>
    </Link>
  )
}
