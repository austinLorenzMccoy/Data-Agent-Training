import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tone = 'red' | 'mustard' | 'sage' | 'blue' | 'clay'

// Gradients stay inside the copy-desk palette: markup red, highlighter, sage, ink blue, clay.
const TONES: Record<Tone, { bg: string; fg: string; tag: string; button: string }> = {
  red: {
    bg: 'linear-gradient(155deg, #d4543f 0%, #b42318 55%, #8a1810 100%)',
    fg: '#faf7f1',
    tag: 'bg-black/20 text-[#faf7f1]',
    button: 'bg-[#faf7f1] text-[#8a1810]',
  },
  mustard: {
    bg: 'linear-gradient(155deg, #f0cd6c 0%, #dcab36 55%, #b8891a 100%)',
    fg: '#1a1714',
    tag: 'bg-black/10 text-[#1a1714]',
    button: 'bg-[#1a1714] text-[#f0cd6c]',
  },
  sage: {
    bg: 'linear-gradient(155deg, #b5d3a6 0%, #86b38a 55%, #4f8a63 100%)',
    fg: '#1a1714',
    tag: 'bg-black/10 text-[#1a1714]',
    button: 'bg-[#1a1714] text-[#b5d3a6]',
  },
  blue: {
    bg: 'linear-gradient(155deg, #7d9fd0 0%, #45699f 55%, #2c5282 100%)',
    fg: '#faf7f1',
    tag: 'bg-white/20 text-[#faf7f1]',
    button: 'bg-[#faf7f1] text-[#2c5282]',
  },
  clay: {
    bg: 'linear-gradient(155deg, #f2a98c 0%, #e07b5c 55%, #bf5536 100%)',
    fg: '#1a1714',
    tag: 'bg-black/10 text-[#1a1714]',
    button: 'bg-[#1a1714] text-[#f2a98c]',
  },
}

export const SKILL_TONE: Record<AssignmentType, Tone> = {
  alpha: 'mustard',
  beta: 'sage',
  gamma: 'clay',
  delta: 'blue',
  epsilon: 'sage',
  zeta: 'red',
  eta: 'mustard',
  theta: 'clay',
  iota: 'blue',
  kappa: 'red',
}

const ART: Record<AssignmentType, React.ReactNode> = {
  // Rate a response: concentric rings and a 1–5 scale
  alpha: (
    <>
      <circle cx="60" cy="44" r="30" />
      <circle cx="60" cy="44" r="19" />
      <circle cx="60" cy="44" r="6" fill="currentColor" />
      <path d="M60 6v12M60 70v12M22 44h12M86 44h12" />
    </>
  ),
  // Compare two: twin panes with an exchange arrow
  beta: (
    <>
      <rect x="14" y="16" width="38" height="52" rx="5" />
      <rect x="68" y="16" width="38" height="52" rx="5" />
      <path d="M22 30h22M22 40h16M76 30h22M76 40h18" />
      <path d="M48 80h24M66 75l6 5-6 5M54 75l-6 5 6 5" />
    </>
  ),
  // Transcript review: stacked speech bubbles
  gamma: (
    <>
      <path d="M14 18h56a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H32l-10 9v-9h-8a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z" />
      <path d="M106 42H58a6 6 0 0 0-6 6v16a6 6 0 0 0 6 6h34l10 9v-9h4a6 6 0 0 0 6-6V48a6 6 0 0 0-6-6z" />
      <path d="M22 30h40M22 38h26M62 54h34M62 62h22" />
    </>
  ),
  // Best reply: ranked list with a tick on the winner
  delta: (
    <>
      <rect x="18" y="12" width="84" height="18" rx="9" />
      <rect x="18" y="36" width="84" height="18" rx="9" />
      <rect x="18" y="60" width="84" height="18" rx="9" />
      <path d="M26 21l4 4 8-8" strokeWidth="2.4" />
      <path d="M46 21h44M30 45h50M30 69h38" />
    </>
  ),
  // Maps: contour lines with a pin
  epsilon: (
    <>
      <path d="M8 70c18-10 30 6 52-4s30-22 52-14" />
      <path d="M8 56c20-8 34 4 50-6s34-18 54-10" />
      <path d="M8 84c22-8 36 2 56-4s30-10 48-6" />
      <path d="M60 46c-10-12-16-20-16-28a16 16 0 0 1 32 0c0 8-6 16-16 28z" fill="none" />
      <circle cx="60" cy="18" r="5" />
    </>
  ),
  // Search quality: lens over graded result bars
  zeta: (
    <>
      <rect x="14" y="14" width="56" height="10" rx="5" />
      <rect x="14" y="32" width="44" height="10" rx="5" />
      <rect x="14" y="50" width="30" height="10" rx="5" />
      <circle cx="82" cy="52" r="18" />
      <path d="M95 65l14 14" strokeWidth="3" />
    </>
  ),
  // Simple search: lens with a ripple
  eta: (
    <>
      <circle cx="52" cy="42" r="24" />
      <path d="M69 59l22 22" strokeWidth="3" />
      <path d="M38 42c4-6 8-6 12 0s8 6 12 0" />
      <path d="M96 20c8 6 8 18 0 24M104 14c12 10 12 28 0 38" />
    </>
  ),
  // Transcription: stacked waveforms
  theta: (
    <>
      <path d="M8 26c10-12 18-12 28 0s18 12 28 0 18-12 28 0 18 12 20 6" />
      <path d="M8 46c10-12 18-12 28 0s18 12 28 0 18-12 28 0 18 12 20 6" />
      <path d="M8 66c10-12 18-12 28 0s18 12 28 0 18-12 28 0 18 12 20 6" />
    </>
  ),
  // AI media: two overlapping frames with a landscape
  iota: (
    <>
      <rect x="10" y="22" width="60" height="46" rx="5" />
      <rect x="50" y="12" width="60" height="46" rx="5" />
      <path d="M56 50l14-16 12 12 8-8 14 12" />
      <circle cx="92" cy="26" r="5" />
    </>
  ),
  // Rubric judgment: criteria boxes feeding one verdict
  kappa: (
    <>
      <rect x="14" y="10" width="38" height="24" rx="5" />
      <rect x="68" y="10" width="38" height="24" rx="5" />
      <rect x="40" y="58" width="40" height="24" rx="5" />
      <path d="M33 34v12h54V34M60 46v12" />
    </>
  ),
}

export function SkillArt({ type, className }: { type: AssignmentType; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {ART[type]}
    </svg>
  )
}

export function SkillArtCard({
  type,
  tag,
  name,
  blurb,
  href,
  className,
}: {
  type: AssignmentType
  tag: string
  name: string
  blurb: string
  href?: string
  className?: string
}) {
  const tone = TONES[SKILL_TONE[type]]
  const body = (
    <div
      className={cn(
        'group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-2xl p-5 shadow-[0_10px_30px_-12px_rgba(26,23,20,0.35)] transition-transform duration-300',
        href && 'hover:-translate-y-1',
        className,
      )}
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span className={cn('self-start rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', tone.tag)}>
        {tag}
      </span>
      <SkillArt type={type} className="mx-auto my-4 h-28 w-auto opacity-85 transition-transform duration-500 group-hover:scale-105" />
      <div className="mt-auto">
        <h3 className="font-heading text-[1.7rem] font-medium italic leading-tight">{name}</h3>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="line-clamp-3 text-[11px] font-medium uppercase leading-relaxed tracking-[0.12em] opacity-85">
            {blurb}
          </p>
          {href && (
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', tone.button)}>
              <ArrowRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return href ? (
    <Link href={href} className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {body}
    </Link>
  ) : (
    body
  )
}

// Small gradient tile with the line art, for denser lists.
export function SkillTile({ type, className }: { type: AssignmentType; className?: string }) {
  const tone = TONES[SKILL_TONE[type]]
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl', className)}
      style={{ background: tone.bg, color: tone.fg }}
    >
      <SkillArt type={type} className="h-[62%] w-auto opacity-90" />
    </div>
  )
}
