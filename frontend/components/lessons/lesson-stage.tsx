'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ChatLine, Visual } from '@/lib/lessons/types'
import { cn } from '@/lib/utils'

// The animated "video" frame. Each scene is a visual that builds itself in
// while its narration plays. Sized in container units so it scales with the
// 16:9 stage.

function Marked({ line, accent }: { line: ChatLine; accent: string }) {
  if (!line.mark || !line.text.includes(line.mark)) return <>{line.text}</>
  const [before, after] = [line.text.slice(0, line.text.indexOf(line.mark)), line.text.slice(line.text.indexOf(line.mark) + line.mark.length)]
  return (
    <>
      {before}
      <motion.span
        initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
        animate={{ backgroundColor: `${accent}40` }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="rounded px-[0.15em]"
        style={{ textDecoration: `underline wavy ${accent}`, textUnderlineOffset: '0.2em' }}
      >
        {line.mark}
      </motion.span>
      {after}
    </>
  )
}

function Stamp({ flag, label, delay }: { flag: boolean; label: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -6 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 16 }}
      className={cn(
        'inline-block rounded-[0.3em] border-[0.15em] px-[0.6em] py-[0.15em] font-mono font-bold uppercase tracking-[0.12em]',
        flag ? 'border-[#b42318] text-[#b42318]' : 'border-[#276749] text-[#276749]',
      )}
    >
      {flag ? '⚑ ' : '✓ '}
      {label}
    </motion.span>
  )
}

export function LessonStage({ visual, sceneKey }: { visual: Visual; sceneKey: string }) {
  const reduced = useReducedMotion()
  const enter = reduced ? { initial: false as const } : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

  return (
    <motion.div key={sceneKey} {...enter} transition={{ duration: 0.45 }} className="absolute inset-0 flex items-center justify-center p-[5cqw]">
      {visual.kind === 'title' && (
        <div className="w-full">
          <p className="font-semibold uppercase tracking-[0.25em] text-ink-accent" style={{ fontSize: '1.6cqw' }}>
            {visual.eyebrow}
          </p>
          <h2 className="mt-[1.5cqw] font-heading font-medium leading-[1.05] text-ink-foreground" style={{ fontSize: '7cqw' }}>
            {visual.title} {visual.accent && <em className="italic text-ink-accent">{visual.accent}</em>}
          </h2>
        </div>
      )}

      {visual.kind === 'rule' && (
        <div className="flex w-full items-center gap-[4cqw]">
          <motion.span
            initial={reduced ? false : { scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="flex aspect-square w-[16cqw] shrink-0 items-center justify-center rounded-[2cqw] bg-ink-accent font-heading text-ink"
            style={{ fontSize: '7cqw' }}
          >
            {visual.icon}
          </motion.span>
          <div>
            <h2 className="font-heading text-ink-foreground" style={{ fontSize: '5cqw' }}>
              {visual.title}
            </h2>
            <p className="mt-[1cqw] leading-snug text-ink-muted" style={{ fontSize: '2.4cqw' }}>
              {visual.body}
            </p>
          </div>
        </div>
      )}

      {visual.kind === 'list' && (
        <div className="w-full">
          <h2 className="font-heading text-ink-foreground" style={{ fontSize: '4cqw' }}>
            {visual.title}
          </h2>
          <ol className={cn('mt-[2cqw] grid gap-[1cqw]', visual.items.length > 5 && 'grid-cols-2')}>
            {visual.items.map((item, i) => (
              <motion.li
                key={item}
                initial={reduced ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.35 }}
                className="flex items-center gap-[1.4cqw] rounded-[1cqw] bg-white/[0.06] px-[1.6cqw] py-[0.9cqw] text-ink-foreground"
                style={{ fontSize: '2.2cqw' }}
              >
                {visual.numbered && (
                  <span className="flex aspect-square w-[3cqw] shrink-0 items-center justify-center rounded-full bg-ink-accent font-mono font-bold text-ink" style={{ fontSize: '1.5cqw' }}>
                    {i + 1}
                  </span>
                )}
                {item}
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {visual.kind === 'chat' && (
        <div className="w-full max-w-[70cqw]">
          <div className="space-y-[1.4cqw] rounded-[2cqw] bg-[#fffdf8] p-[2.6cqw] text-[#1a1714]" style={{ fontSize: '2.4cqw' }}>
            {visual.lines.map((line, i) => (
              <motion.div
                key={i}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.5 }}
                className={cn('flex', i % 2 === 1 && 'justify-end')}
              >
                <span className={cn('max-w-[85%] rounded-[1.4cqw] px-[1.6cqw] py-[0.7cqw]', i % 2 === 1 ? 'bg-[#1a1714] text-[#f6f0e4]' : 'bg-[#f3eee4]')}>
                  <span className="mr-[0.6cqw] font-semibold opacity-60">{line.who}</span>
                  <Marked line={line} accent="#e0b84f" />
                </span>
              </motion.div>
            ))}
          </div>
          {visual.verdict && (
            <div className="mt-[2cqw] text-right" style={{ fontSize: '2.2cqw' }}>
              <Stamp flag={visual.verdict.flag} label={visual.verdict.label} delay={0.4 + visual.lines.length * 0.5 + 0.8} />
            </div>
          )}
        </div>
      )}

      {visual.kind === 'compare' && (
        <div className="grid w-full grid-cols-2 gap-[3cqw]">
          {[visual.left, visual.right].map((side, i) => (
            <motion.div
              key={i}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.6 }}
              className="flex flex-col gap-[2cqw] rounded-[2cqw] bg-[#fffdf8] p-[2.6cqw] text-[#1a1714]"
            >
              <p className="font-heading leading-snug" style={{ fontSize: '2.8cqw' }}>
                “{side.text}”
              </p>
              <div style={{ fontSize: '1.8cqw' }}>
                <Stamp flag={side.flag} label={side.label} delay={1 + i * 0.6} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
