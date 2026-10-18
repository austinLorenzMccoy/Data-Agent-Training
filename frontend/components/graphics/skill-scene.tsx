import type { CSSProperties } from 'react'
import type { AssignmentType } from '@/lib/types'
import { cn } from '@/lib/utils'

// A miniature of the actual task for each skill — rating pills, an A/B
// split, a flagged transcript, a map with pins — so cards read as different
// jobs at a glance. Everything is sized in em: set the font size on the
// container (text-[9px] for a thumbnail, text-[12px] for a hero card).

export const SKILL_ACCENT: Record<AssignmentType, string> = {
  alpha: '#b8891a',
  beta: '#3f7a58',
  gamma: '#bf5536',
  delta: '#2c5282',
  epsilon: '#3f7a58',
  zeta: '#b42318',
  eta: '#b8891a',
  theta: '#bf5536',
  iota: '#2c5282',
  kappa: '#b42318',
}

/** What the learner actually does, in a few words. */
export const SKILL_MECHANIC: Record<AssignmentType, { verb: string; detail: string }> = {
  alpha: { verb: 'Rate', detail: '3-point scale + a reason' },
  beta: { verb: 'Compare', detail: 'A vs B + a reason' },
  gamma: { verb: 'Screen', detail: 'Pass, or flag 8 faults' },
  delta: { verb: 'Choose', detail: '1 of 4 replies' },
  epsilon: { verb: 'Map', detail: '4 fields per place' },
  zeta: { verb: 'Grade', detail: 'Page quality + needs met' },
  eta: { verb: 'Score', detail: '4-point satisfaction' },
  theta: { verb: 'Transcribe', detail: 'Segments, speakers, tags' },
  iota: { verb: 'Judge', detail: 'One axis at a time' },
  kappa: { verb: 'Audit', detail: 'Rubrics, tags, reviews' },
}

const ink = '#1a1714'
const muted = '#d9d0bf'

function Bar({ w, className, style }: { w: string; className?: string; style?: CSSProperties }) {
  return <span className={cn('block h-[0.45em] rounded-full', className)} style={{ width: w, background: muted, ...style }} />
}

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[var(--scene-aspect,16/10)] w-full overflow-hidden rounded-[0.9em] bg-[#fffdf8] text-[#1a1714] shadow-[0_0.6em_1.6em_-0.8em_rgba(26,23,20,0.45)] ring-1 ring-black/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

function Alpha({ a }: { a: string }) {
  return (
    <Frame>
      <div className="flex gap-[0.6em] p-[0.9em]">
        <span className="flex size-[1.8em] shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: ink, fontSize: '0.8em' }}>
          AI
        </span>
        <div className="flex-1 space-y-[0.45em] rounded-[0.6em] rounded-tl-none bg-[#f3eee4] p-[0.7em]">
          <Bar w="92%" />
          <Bar w="78%" />
          <Bar w="55%" />
        </div>
      </div>
      <div className="absolute inset-x-[0.9em] bottom-[0.9em] grid grid-cols-3 gap-[0.4em] text-center font-semibold" style={{ fontSize: '0.85em' }}>
        <span className="rounded-full py-[0.35em] text-white" style={{ background: '#3f7a58' }}>
          Good
        </span>
        <span className="rounded-full border py-[0.35em]" style={{ borderColor: muted }}>
          Okay
        </span>
        <span className="rounded-full border py-[0.35em]" style={{ borderColor: muted }}>
          Bad
        </span>
      </div>
      <span className="absolute right-[0.9em] top-[0.9em] size-[0.6em] rounded-full" style={{ background: a }} />
    </Frame>
  )
}

function Beta({ a }: { a: string }) {
  return (
    <Frame>
      <div className="grid h-full grid-cols-2 gap-[0.7em] p-[0.9em]">
        {(['A', 'B'] as const).map((l) => (
          <div
            key={l}
            className="relative space-y-[0.4em] rounded-[0.6em] border p-[0.6em]"
            style={l === 'B' ? { borderColor: a, boxShadow: `0 0 0 0.15em ${a}33` } : { borderColor: muted }}
          >
            <span className="font-heading font-semibold" style={{ fontSize: '1.1em' }}>
              {l}
            </span>
            <Bar w="90%" />
            <Bar w="70%" />
            <Bar w={l === 'A' ? '40%' : '82%'} />
            {l === 'B' && (
              <span className="absolute -right-[0.5em] -top-[0.5em] flex size-[1.5em] items-center justify-center rounded-full text-white" style={{ background: a, fontSize: '0.9em' }}>
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
      <span className="absolute left-1/2 top-1/2 flex size-[1.9em] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a1714] font-heading italic text-[#f6f0e4]" style={{ fontSize: '0.85em' }}>
        vs
      </span>
    </Frame>
  )
}

function Gamma({ a }: { a: string }) {
  const rows: { side: 'l' | 'r'; text: React.ReactNode }[] = [
    { side: 'l', text: 'are you free tomorrow?' },
    { side: 'r', text: 'yes after work' },
    { side: 'r', text: 'where should we meet' },
    {
      side: 'l',
      text: (
        <>
          see you <span style={{ textDecoration: `underline wavy ${a}`, textUnderlineOffset: '0.2em' }}>tomorow</span> then
        </>
      ),
    },
  ]
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center gap-[0.45em] p-[0.9em] pb-[2.2em]" style={{ fontSize: '0.92em' }}>
        {rows.map((r, i) => (
          <div key={i} className={cn('flex', r.side === 'r' && 'justify-end')}>
            <span className={cn('rounded-[0.7em] px-[0.6em] py-[0.25em]', r.side === 'l' ? 'bg-[#f3eee4]' : 'bg-[#1a1714] text-[#f6f0e4]')}>
              {r.text}
            </span>
          </div>
        ))}
      </div>
      <span
        className="absolute bottom-[0.8em] right-[0.8em] flex items-center gap-[0.3em] rounded-full px-[0.6em] py-[0.25em] font-semibold text-white"
        style={{ background: a, fontSize: '0.8em' }}
      >
        ⚑ Spelling
      </span>
    </Frame>
  )
}

function Delta({ a }: { a: string }) {
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center p-[0.8em]" style={{ fontSize: '0.88em' }}>
        <span className="self-start rounded-[0.7em] rounded-bl-none bg-[#f3eee4] px-[0.6em] py-[0.25em]">Should I wait at the entrance?</span>
        <div className="mt-[0.6em] space-y-[0.4em]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-[0.5em] rounded-[0.5em] border px-[0.5em] py-[0.22em]"
              style={i === 1 ? { borderColor: a, background: `${a}14` } : { borderColor: muted }}
            >
              <span
                className="size-[0.8em] shrink-0 rounded-full border-2"
                style={i === 1 ? { borderColor: a, background: a } : { borderColor: muted }}
              />
              <Bar w={['60%', '85%', '45%', '70%'][i]} style={i === 1 ? { background: `${a}66` } : undefined} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Epsilon({ a }: { a: string }) {
  const pins = [
    { x: '62%', y: '30%', n: 1 },
    { x: '28%', y: '58%', n: 2 },
    { x: '76%', y: '68%', n: 3 },
  ]
  return (
    <Frame className="bg-[#efe9dc]">
      <div className="absolute inset-0" aria-hidden>
        <span className="absolute left-0 right-0 top-[40%] h-[0.5em] bg-white/90" />
        <span className="absolute bottom-0 top-0 left-[45%] w-[0.5em] bg-white/90" />
        <span className="absolute left-[-10%] top-[75%] h-[0.35em] w-[130%] origin-left -rotate-12 bg-white/80" />
        <span className="absolute right-[6%] top-[8%] h-[24%] w-[22%] rounded-[0.4em] bg-[#cfe0c4]" />
        <span className="absolute left-[6%] top-[10%] h-[18%] w-[28%] rounded-[0.4em] bg-[#c9dbe8]" />
      </div>
      <span className="absolute left-[45%] top-[40%] -translate-x-1/3 -translate-y-1/3">
        <span className="absolute -inset-[1.2em] rounded-full" style={{ background: '#2c528222' }} />
        <span className="relative block size-[0.9em] rounded-full border-2 border-white" style={{ background: '#2c5282' }} />
      </span>
      {pins.map((p) => (
        <span
          key={p.n}
          className="absolute flex size-[1.5em] -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-none font-bold text-white shadow"
          style={{ left: p.x, top: p.y, background: p.n === 1 ? a : '#b42318', fontSize: '0.8em', transform: 'translate(-50%,-100%) rotate(-45deg)' }}
        >
          <span style={{ transform: 'rotate(45deg)' }}>{p.n}</span>
        </span>
      ))}
      <span className="absolute bottom-[0.7em] left-[0.7em] rounded-full bg-white px-[0.6em] py-[0.2em] font-semibold shadow" style={{ fontSize: '0.78em' }}>
        Relevance · <span style={{ color: a }}>Excellent</span>
      </span>
    </Frame>
  )
}

function Zeta({ a }: { a: string }) {
  return (
    <Frame>
      <div className="p-[0.8em]" style={{ fontSize: '0.88em' }}>
        <div className="flex items-center gap-[0.4em] rounded-full border px-[0.6em] py-[0.2em]" style={{ borderColor: muted }}>
          <span aria-hidden>⌕</span>
          <span className="truncate">symptoms of dehydration</span>
        </div>
        <div className="mt-[0.55em] space-y-[0.3em]">
          <Bar w="35%" style={{ background: '#3f7a5888' }} />
          <Bar w="75%" style={{ background: '#2c5282aa', height: '0.55em' }} />
          <Bar w="90%" />
          <Bar w="60%" />
        </div>
      </div>
      <div className="absolute inset-x-[0.8em] bottom-[0.8em]">
        <div className="flex justify-between text-[#6f6558]" style={{ fontSize: '0.7em' }}>
          <span>Lowest</span>
          <span className="font-semibold" style={{ color: a }}>
            PQ · High
          </span>
          <span>Highest</span>
        </div>
        <div className="relative mt-[0.3em] h-[0.4em] rounded-full" style={{ background: `linear-gradient(90deg, #b42318, #b8891a, #3f7a58)` }}>
          <span className="absolute top-1/2 size-[1.1em] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: '74%', background: ink }} />
        </div>
      </div>
    </Frame>
  )
}

function Eta({ a }: { a: string }) {
  const levels = ['NS', 'SS', 'S', 'HS']
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center p-[0.9em]">
        <span className="self-start rounded-full bg-[#f3eee4] px-[0.6em] py-[0.2em]" style={{ fontSize: '0.85em' }}>
          ⌕ wide fit hiking boots
        </span>
        <div className="mt-[0.9em] flex items-end gap-[0.4em]">
          {levels.map((l, i) => (
            <div key={l} className="flex flex-1 flex-col items-center justify-end gap-[0.25em]">
              <span
                className="block w-full rounded-t-[0.3em]"
                style={{ height: `${(i + 1) * 0.9}em`, background: i <= 2 ? a : muted, opacity: i <= 2 ? 0.45 + i * 0.25 : 1 }}
              />
              <span className="font-mono font-semibold" style={{ fontSize: '0.72em', color: i === 2 ? a : '#6f6558' }}>
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>
      <span className="absolute right-[0.9em] top-[0.9em] font-heading italic" style={{ color: a }}>
        Satisfying
      </span>
    </Frame>
  )
}

function Theta({ a }: { a: string }) {
  const heights = [30, 55, 80, 45, 70, 95, 60, 35, 75, 50, 25, 10, 8, 10, 40, 65, 90, 55, 70, 45, 85, 60, 30]
  return (
    <Frame>
      <div className="absolute inset-x-[0.9em] top-[0.8em] flex gap-[0.4em]" style={{ fontSize: '0.72em' }}>
        <span className="rounded px-[0.4em] font-semibold text-white" style={{ background: a, flex: '0 0 44%' }}>
          S1 · Female
        </span>
        <span className="ml-auto rounded px-[0.4em] font-semibold text-white" style={{ background: '#2c5282', flex: '0 0 40%' }}>
          S2 · Male
        </span>
      </div>
      <div className="absolute inset-x-[0.9em] top-[2.2em] flex h-[3.2em] items-center gap-[0.15em]">
        {heights.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-full"
            style={{ height: `${h}%`, background: i < 11 ? a : i < 14 ? muted : '#2c5282', opacity: i < 14 && i >= 11 ? 1 : 0.8 }}
          />
        ))}
      </div>
      <div className="absolute inset-x-[0.9em] bottom-[0.8em] rounded-[0.5em] bg-[#f3eee4] px-[0.6em] py-[0.3em]" style={{ fontSize: '0.85em' }}>
        So <span className="rounded px-[0.15em]" style={{ background: `${a}33` }}>er</span> how can I explain this
        <span className="ml-[0.1em] inline-block h-[1em] w-[0.12em] translate-y-[0.15em] animate-pulse bg-[#1a1714]" />
      </div>
    </Frame>
  )
}

function Iota({ a }: { a: string }) {
  return (
    <Frame>
      <span className="absolute left-1/2 top-[0.7em] -translate-x-1/2 rounded-full bg-[#1a1714] px-[0.7em] py-[0.15em] text-[#f6f0e4]" style={{ fontSize: '0.75em' }}>
        Axis · identity
      </span>
      <div className="grid h-full grid-cols-2 gap-[0.6em] px-[0.9em] pb-[0.9em] pt-[2.2em]">
        {(['A', 'B'] as const).map((l) => (
          <div
            key={l}
            className="relative overflow-hidden rounded-[0.5em]"
            style={{ background: l === 'A' ? '#c9dbe8' : '#e8dcc9', boxShadow: l === 'A' ? `0 0 0 0.18em ${a}` : undefined }}
          >
            <span className="absolute right-[18%] top-[16%] size-[1em] rounded-full" style={{ background: '#f0cd6c' }} />
            <span className="absolute bottom-0 left-[-10%] h-[55%] w-[70%] rotate-45 rounded-[0.3em]" style={{ background: l === 'A' ? '#3f7a58' : '#8a7d68', transformOrigin: 'bottom left' }} />
            <span className="absolute bottom-0 right-[-15%] h-[45%] w-[60%] -rotate-45 rounded-[0.3em]" style={{ background: l === 'A' ? '#4f8a63' : '#a39580', transformOrigin: 'bottom right' }} />
            <span className="absolute left-[0.4em] top-[0.3em] font-heading font-semibold" style={{ color: ink }}>
              {l}
            </span>
            {l === 'A' && (
              <span className="absolute bottom-[0.3em] right-[0.3em] flex size-[1.3em] items-center justify-center rounded-full text-white" style={{ background: a, fontSize: '0.85em' }}>
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Kappa({ a }: { a: string }) {
  const rows = [
    { ok: true, w: '70%' },
    { ok: false, w: '85%' },
    { ok: true, w: '60%' },
    { ok: false, w: '50%' },
  ]
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center gap-[0.6em] p-[0.9em]">
        <div className="flex items-center justify-between" style={{ fontSize: '0.8em' }}>
          <span className="font-semibold uppercase tracking-[0.12em]">Rubric</span>
          <span className="rounded-full px-[0.5em] font-mono font-bold text-white" style={{ background: a }}>
            2 / 4
          </span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-[0.5em]">
            <span
              className="flex size-[1.15em] shrink-0 items-center justify-center rounded-[0.25em] font-bold text-white"
              style={{ background: r.ok ? '#3f7a58' : '#b42318', fontSize: '0.8em' }}
            >
              {r.ok ? '✓' : '✕'}
            </span>
            <Bar w={r.w} style={r.ok ? undefined : { background: '#b4231833' }} />
          </div>
        ))}
      </div>
    </Frame>
  )
}

const SCENES: Record<AssignmentType, (p: { a: string }) => React.ReactElement> = {
  alpha: Alpha,
  beta: Beta,
  gamma: Gamma,
  delta: Delta,
  epsilon: Epsilon,
  zeta: Zeta,
  eta: Eta,
  theta: Theta,
  iota: Iota,
  kappa: Kappa,
}

export function SkillScene({ type, className, aspect }: { type: AssignmentType; className?: string; aspect?: string }) {
  const Scene = SCENES[type]
  return (
    <div aria-hidden className={cn('select-none', className)} style={aspect ? ({ '--scene-aspect': aspect } as CSSProperties) : undefined}>
      <Scene a={SKILL_ACCENT[type]} />
    </div>
  )
}

export function MechanicChip({ type, className, tone = 'light' }: { type: AssignmentType; className?: string; tone?: 'light' | 'dark' }) {
  const m = SKILL_MECHANIC[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
        tone === 'light' ? 'bg-black/10' : 'bg-white/15',
        className,
      )}
    >
      <span className="font-semibold uppercase tracking-[0.12em]">{m.verb}</span>
      <span className="opacity-70">·</span>
      {m.detail}
    </span>
  )
}
