'use client'

import { specialisationGuidelinePacks } from '@/lib/guidelines'
import { GuidelineDossier } from '@/components/prep/guideline-dossier'

export function GuidelinesSection({ highlight = '' }: { highlight?: string }) {
  const packs = specialisationGuidelinePacks()
  const focused = packs.some((p) => p.id === highlight) ? highlight : 'epsilon'

  return (
    <div id="guidelines-brief" className="scroll-mt-24 space-y-3">
      <div className="agency-card agency-card-accent p-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Specialisation guidelines
        </p>
        <h2 className="font-sans text-xl font-semibold tracking-tight">Study the source here</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          One dossier per track. Click a title to open its chapters. Nothing downloads.
        </p>
      </div>
      {packs.map((pack) => (
        <GuidelineDossier key={pack.id} pack={pack} defaultOpen={pack.id === focused} />
      ))}
    </div>
  )
}
