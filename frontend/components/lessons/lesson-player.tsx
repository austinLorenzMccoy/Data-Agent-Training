'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { Captions, Check, Lock, Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Constellation } from '@/components/graphics/constellation'
import { AUDIO, LESSON_PROGRESS_KEY, type LessonProgress } from '@/lib/lessons'
import type { Chapter, Lesson } from '@/lib/lessons/types'
import { cn } from '@/lib/utils'
import { LessonStage } from './lesson-stage'

const SPEEDS = [1, 1.25, 1.5]

function readProgress(): string {
  try {
    return localStorage.getItem(LESSON_PROGRESS_KEY) ?? '{}'
  } catch {
    return '{}'
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener('dna-lessons', cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener('dna-lessons', cb)
  }
}

function saveChapter(lessonId: string, chapterId: string) {
  try {
    const all = JSON.parse(readProgress()) as LessonProgress
    const done = new Set(all[lessonId]?.chapters ?? [])
    done.add(chapterId)
    all[lessonId] = { chapters: [...done] }
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(all))
    window.dispatchEvent(new Event('dna-lessons'))
  } catch {
    // progress just won't persist
  }
}

/** Scene start times: from the narration manifest, or estimated at 150 words a minute. */
function timeline(lessonId: string, chapter: Chapter) {
  const audio = AUDIO[lessonId]?.[chapter.id]
  if (audio) return { src: audio.src, duration: audio.duration, cues: audio.cues }
  let t = 0
  const cues = chapter.scenes.map((s) => {
    const start = t
    t += (s.say.split(/\s+/).length / 150) * 60 + 0.6
    return { scene: s.id, start }
  })
  return { src: null, duration: t, cues }
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const raw = useSyncExternalStore(subscribe, readProgress, () => '{}')
  const completed = useMemo(() => {
    try {
      return new Set((JSON.parse(raw) as LessonProgress)[lesson.id]?.chapters ?? [])
    } catch {
      return new Set<string>()
    }
  }, [raw, lesson.id])

  const firstOpen = lesson.chapters.findIndex((c) => !completed.has(c.id))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'ready' | 'playing' | 'paused' | 'check' | 'done'>('ready')
  const [time, setTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [captions, setCaptions] = useState(true)
  const [picked, setPicked] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const clock = useRef<{ startedAt: number; base: number } | null>(null)

  const chapter = lesson.chapters[index]
  const tl = useMemo(() => timeline(lesson.id, chapter), [lesson.id, chapter])
  // The element narrating this chapter: its video if it has one, else its audio.
  const el = (): HTMLMediaElement | null => (chapter.videoUrl ? videoRef.current : tl.src ? audioRef.current : null)
  const sceneIndex = Math.max(0, tl.cues.findLastIndex((c) => c.start <= time + 0.05))
  const scene = chapter.scenes[sceneIndex]
  const playing = phase === 'playing'

  // Drive `time` from the media element, or from a wall clock when there is no audio.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const media = chapter.videoUrl ? videoRef.current : tl.src ? audioRef.current : null
    const tick = () => {
      if (media) setTime(media.currentTime)
      else if (clock.current) {
        const t = clock.current.base + ((performance.now() - clock.current.startedAt) / 1000) * speed
        setTime(Math.min(t, tl.duration))
        if (t >= tl.duration) {
          setPhase('check')
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, tl.duration, tl.src, chapter.videoUrl])

  const setRate = (r: number) => {
    setSpeed(r)
    const m = el()
    if (m) m.playbackRate = r
  }

  const play = () => {
    const m = el()
    if (m) {
      m.playbackRate = speed
      void m.play().catch(() => setPhase('paused'))
    } else {
      clock.current = { startedAt: performance.now(), base: time >= tl.duration ? 0 : time }
    }
    setPhase('playing')
  }

  const pause = () => {
    el()?.pause()
    clock.current = null
    setPhase('paused')
  }

  const seek = (t: number) => {
    const clamped = Math.max(0, Math.min(t, tl.duration - 0.1))
    const m = el()
    if (m) m.currentTime = clamped
    if (clock.current) clock.current = { startedAt: performance.now(), base: clamped }
    setTime(clamped)
  }

  const goTo = (i: number) => {
    el()?.pause()
    clock.current = null
    setIndex(i)
    setTime(0)
    setPicked(null)
    setPhase('ready')
  }

  const answer = (i: number) => {
    setPicked(i)
    if (i === chapter.check.answer) saveChapter(lesson.id, chapter.id)
  }

  const next = () => {
    if (index + 1 >= lesson.chapters.length) {
      setPhase('done')
      return
    }
    // The click on "Next chapter" is the gesture browsers need for sound, so
    // the next chapter starts at once: the audio element autoplays its new src.
    goTo(index + 1)
    if (!lesson.chapters[index + 1].videoUrl && !AUDIO[lesson.id]?.[lesson.chapters[index + 1].id]) {
      clock.current = { startedAt: performance.now(), base: 0 }
    }
    setPhase('playing')
  }

  // Keyboard: space/k play-pause, arrows skip 5 s.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select, button')) return
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        if (phase === 'playing') pause()
        else if (phase === 'paused' || phase === 'ready') play()
      } else if (e.key === 'ArrowRight') seek(time + 5)
      else if (e.key === 'ArrowLeft') seek(time - 5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const unlocked = (i: number) => i === 0 || completed.has(lesson.chapters[i - 1].id) || completed.has(lesson.chapters[i].id)
  const correct = picked === chapter.check.answer

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div>
        <div
          className="ink-band relative aspect-video w-full overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(26,23,20,0.8)]"
          style={{ containerType: 'inline-size' }}
        >
          <div aria-hidden className="ink-grid absolute inset-0" />
          <Constellation density={0.00006} />

          {chapter.videoUrl ? (
            <video
              ref={videoRef}
              src={chapter.videoUrl}
              autoPlay={phase === 'playing'}
              className="absolute inset-0 h-full w-full object-cover"
              onEnded={() => setPhase('check')}
              playsInline
            />
          ) : (
            <AnimatePresence mode="wait">
              <LessonStage key={`${chapter.id}-${scene.id}`} sceneKey={`${chapter.id}-${scene.id}`} visual={scene.visual} />
            </AnimatePresence>
          )}

          {tl.src && !chapter.videoUrl && (
            <audio
              ref={audioRef}
              src={tl.src}
              preload="auto"
              autoPlay={phase === 'playing'}
              onPlay={(e) => (e.currentTarget.playbackRate = speed)}
              onEnded={() => setPhase('check')}
            />
          )}

          {captions && phase !== 'check' && phase !== 'done' && (
            <p
              aria-live="polite"
              className="absolute inset-x-[6%] bottom-[5%] rounded-lg bg-black/70 px-[2cqw] py-[1cqw] text-center leading-snug text-white"
              style={{ fontSize: 'max(12px, 1.9cqw)' }}
            >
              {scene.say}
            </p>
          )}

          {phase === 'ready' && (
            <button
              type="button"
              onClick={play}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1714]/85 text-ink-foreground backdrop-blur-sm"
              aria-label={`Play chapter ${index + 1}: ${chapter.title}`}
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-ink-accent text-ink shadow-xl sm:size-20">
                <Play className="ml-1 size-8" />
              </span>
              <span className="font-heading text-lg sm:text-2xl">
                Chapter {index + 1} · {chapter.title}
              </span>
            </button>
          )}

          <AnimatePresence>
            {phase === 'check' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-y-auto bg-[#1a1714] p-4 sm:p-8"
                role="dialog"
                aria-label="Check your understanding"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-accent">Quick check</p>
                <p className="mt-2 font-heading text-lg text-ink-foreground sm:text-2xl">{chapter.check.question}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup">
                  {chapter.check.options.map((opt, i) => {
                    const state = picked === null ? null : i === chapter.check.answer ? 'right' : picked === i ? 'wrong' : null
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={picked === i}
                        disabled={correct}
                        onClick={() => answer(i)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                          state === 'right' && picked === chapter.check.answer
                            ? 'border-success bg-success/20 text-ink-foreground'
                            : state === 'wrong'
                              ? 'border-danger bg-danger/20 text-ink-foreground'
                              : 'border-white/20 text-ink-foreground hover:border-ink-accent',
                        )}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {picked !== null && (
                  <div className="mt-4 text-sm" aria-live="polite">
                    <p className={correct ? 'text-[#7cc39a]' : 'text-[#f09a8f]'}>
                      {correct ? 'Right. ' : 'Not quite. '}
                      <span className="text-ink-muted">{correct ? chapter.check.why : 'Try again, or rewatch the chapter.'}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {correct ? (
                        <Button onClick={next} className="rounded-full bg-ink-accent text-ink hover:bg-ink-accent/90">
                          {index + 1 < lesson.chapters.length ? 'Next chapter' : 'Finish lesson'}
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => goTo(index)} className="rounded-full border-white/30 bg-transparent text-ink-foreground">
                          <RotateCcw className="size-4" /> Rewatch
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1714] p-6 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-success text-white">
                  <Check className="size-7" />
                </span>
                <p className="font-heading text-2xl text-ink-foreground sm:text-3xl">
                  Lesson <em className="italic text-ink-accent">complete.</em>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild className="rounded-full bg-ink-accent text-ink hover:bg-ink-accent/90">
                    <Link href="/training">Start practice</Link>
                  </Button>
                  <Button variant="outline" onClick={() => goTo(0)} className="rounded-full border-white/30 bg-transparent text-ink-foreground">
                    Watch again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full"
            onClick={playing ? pause : play}
            disabled={phase === 'check' || phase === 'done'}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <div
            className="relative h-2 flex-1 cursor-pointer rounded-full bg-muted"
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(tl.duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${fmt(time)} of ${fmt(tl.duration)}`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              seek(((e.clientX - r.left) / r.width) * tl.duration)
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${(time / tl.duration) * 100}%` }} />
            {tl.cues.slice(1).map((c) => (
              <span key={c.scene} className="absolute inset-y-0 w-0.5 bg-background" style={{ left: `${(c.start / tl.duration) * 100}%` }} />
            ))}
          </div>
          <span className="w-20 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {fmt(time)} / {fmt(tl.duration)}
          </span>
          <button
            type="button"
            onClick={() => setRate(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
            className="rounded-md border border-border px-2 py-1 font-mono text-xs"
            aria-label={`Playback speed ${speed}x`}
          >
            {speed}×
          </button>
          <button
            type="button"
            onClick={() => setCaptions(!captions)}
            aria-pressed={captions}
            aria-label="Captions"
            className={cn('rounded-md border px-2 py-1', captions ? 'border-primary text-primary' : 'border-border text-muted-foreground')}
          >
            <Captions className="size-4" />
          </button>
        </div>
      </div>

      {/* Chapters */}
      <nav aria-label="Chapters" className="rounded-2xl border border-border bg-surface-raised p-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Chapters · {completed.size}/{lesson.chapters.length}
        </p>
        <ol className="space-y-1">
          {lesson.chapters.map((c, i) => {
            const open = unlocked(i)
            const done = completed.has(c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => goTo(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    i === index ? 'bg-primary/10 text-foreground' : 'hover:bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      done ? 'bg-success text-white' : i === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : open ? i + 1 : <Lock className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{fmt(timeline(lesson.id, c).duration)}</span>
                </button>
              </li>
            )
          })}
        </ol>
        {firstOpen === -1 && <p className="px-2 pt-3 text-xs text-success">All chapters complete.</p>}
      </nav>
    </div>
  )
}
