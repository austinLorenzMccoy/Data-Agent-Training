import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MechanicChip, SkillScene } from './skill-scene'

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

export type SkillCardShape = 'stack' | 'wide' | 'tall'

/** Landing-page layout per skill, so the grid reads as a mix of shapes, not a row of clones. */
export const SKILL_SHAPE: Partial<Record<AssignmentType, SkillCardShape>> = {
  alpha: 'wide',
  delta: 'wide',
  epsilon: 'tall',
  theta: 'wide',
  kappa: 'wide',
}

export const SHAPE_SPAN: Record<SkillCardShape, string> = {
  stack: '',
  wide: 'lg:col-span-2',
  tall: 'lg:row-span-2',
}

export function SkillArtCard({
  type,
  tag,
  name,
  blurb,
  href,
  shape = 'stack',
  className,
}: {
  type: AssignmentType
  tag: string
  name: string
  blurb: string
  href?: string
  shape?: SkillCardShape
  className?: string
}) {
  const tone = TONES[SKILL_TONE[type]]
  const darkText = tone.fg === '#1a1714'
  const body = (
    <div
      className={cn(
        'group relative flex h-full overflow-hidden rounded-2xl p-5 shadow-[0_10px_30px_-12px_rgba(26,23,20,0.35)] transition-transform duration-300',
        shape === 'wide' ? 'flex-col gap-5 sm:flex-row sm:items-center' : 'flex-col',
        href && 'hover:-translate-y-1',
        className,
      )}
      style={{ background: tone.bg, color: tone.fg }}
    >
      <SkillArt
        type={type}
        className="pointer-events-none absolute -right-6 -top-6 h-36 w-auto opacity-[0.07] transition-transform duration-700 group-hover:rotate-6"
      />
      <div className={cn('relative flex flex-col', shape === 'wide' && 'sm:w-[42%] sm:shrink-0')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', tone.tag)}>{tag}</span>
          <MechanicChip type={type} tone={darkText ? 'light' : 'dark'} />
        </div>
        <h3 className={cn('mt-4 font-heading font-medium italic leading-tight', shape === 'stack' ? 'text-[1.6rem]' : 'text-[1.9rem]')}>
          {name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed opacity-85">{blurb}</p>
        {href && (
          <span className={cn('mt-4 inline-flex size-9 items-center justify-center rounded-full', tone.button)}>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
      <SkillScene
        type={type}
        className={cn(
          'relative transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]',
          shape === 'wide' ? 'flex-1 text-[13px]' : shape === 'tall' ? 'mt-6 flex-1 text-[13px]' : 'mt-5 text-[12px]',
        )}
        aspect={shape === 'tall' ? '3/5' : undefined}
      />
    </div>
  )

  return href ? (
    <Link href={href} className={cn('block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', SHAPE_SPAN[shape])}>
      {body}
    </Link>
  ) : (
    <div className={SHAPE_SPAN[shape]}>{body}</div>
  )
}

// Small gradient tile with the line art, for denser lists.
export function SkillTile({ type, className, children }: { type: AssignmentType; className?: string; children?: React.ReactNode }) {
  const tone = TONES[SKILL_TONE[type]]
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl', className)}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {children ?? <SkillArt type={type} className="h-[62%] w-auto opacity-90" />}
    </div>
  )
}
