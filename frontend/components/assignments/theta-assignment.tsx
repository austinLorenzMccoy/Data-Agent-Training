'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Question } from '@/lib/types'
import type {
  AudioQualityFlag,
  SpeakerGender,
  ThetaAnswer,
  ThetaPayload,
  ThetaSegment,
  ThetaTag,
  ThetaTagType,
} from '@/lib/domain-types'
import { AUDIO_QUALITY_FLAGS, AUDIO_QUALITY_LABELS } from '@/lib/domain-types'
import { AssignmentCard } from './assignment-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SubmittedAnswer } from './types'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'

const PAUSE_HINT_MS = 2000

function newSegment(speaker: number, gender: SpeakerGender, start = 0, end = 1500): ThetaSegment {
  return { speaker, gender, start_ms: start, end_ms: end, transcript: '', tags: [] }
}

export function ThetaAssignment({
  question,
  onSubmit,
  flashState,
  disabled,
}: {
  question: Question
  onSubmit: (answer: SubmittedAnswer) => void
  flashState?: 'correct' | 'wrong' | 'partial' | null
  disabled?: boolean
}) {
  const payload = question.payload as ThetaPayload
  const audioUrl = question.audioAssetUrl || payload.audio_asset_url
  const waveRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<{ destroy: () => void; playPause: () => void } | null>(null)

  const [speakers, setSpeakers] = useState<Array<{ id: number; gender: SpeakerGender }>>([
    { id: 1, gender: 'Unsure' },
  ])
  const [segments, setSegments] = useState<ThetaSegment[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [flags, setFlags] = useState<AudioQualityFlag[]>([])
  const [tagWarning, setTagWarning] = useState<string | null>(null)
  const [pauseHint, setPauseHint] = useState<string | null>(null)
  const [waveReady, setWaveReady] = useState(false)
  const [waveError, setWaveError] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const selected = segments[selectedIdx]

  useEffect(() => {
    let cancelled = false
    async function mount() {
      if (!waveRef.current || !audioUrl) return
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default
        const Regions = (await import('wavesurfer.js/plugins/regions')).default
        if (cancelled || !waveRef.current) return
        const regions = Regions.create()
        const ws = WaveSurfer.create({
          container: waveRef.current,
          url: audioUrl,
          height: 96,
          waveColor: '#8a7d69',
          progressColor: '#c8973a',
          cursorColor: '#f0e9db',
          normalize: true,
          plugins: [regions],
        })
        wsRef.current = ws
        regions.enableDragSelection({ color: 'rgba(200, 151, 58, 0.28)' })
        regions.on('region-created', (region: { start: number; end: number; remove: () => void }) => {
          const startMs = Math.round(region.start * 1000)
          const endMs = Math.round(region.end * 1000)
          setSegments((prev) => {
            const last = [...prev].sort((a, b) => a.end_ms - b.end_ms).at(-1)
            if (last && startMs - last.end_ms < PAUSE_HINT_MS && startMs >= last.end_ms) {
              setPauseHint('Pause under 2s — the guideline keeps this in the same segment unless you override.')
            } else {
              setPauseHint(null)
            }
            const speaker = speakers[0]?.id ?? 1
            const gender = speakers.find((s) => s.id === speaker)?.gender ?? 'Unsure'
            const next = [...prev, newSegment(speaker, gender, startMs, endMs)]
            setSelectedIdx(next.length - 1)
            return next
          })
          region.remove()
        })
        ws.on('ready', () => {
          if (!cancelled) setWaveReady(true)
        })
        ws.on('error', () => {
          if (!cancelled) setWaveError('Waveform failed to load. Use the manual segment controls.')
        })
      } catch {
        if (!cancelled) setWaveError('Waveform unavailable. Use the manual segment controls.')
      }
    }
    void mount()
    return () => {
      cancelled = true
      wsRef.current?.destroy()
      wsRef.current = null
    }
    // speakers captured via state updater
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl])

  function addSpeaker() {
    setSpeakers((prev) => [...prev, { id: prev.length + 1, gender: 'Unsure' }])
  }

  function setSpeakerGender(id: number, gender: SpeakerGender) {
    setSpeakers((prev) => prev.map((s) => (s.id === id ? { ...s, gender } : s)))
    setSegments((prev) => prev.map((seg) => (seg.speaker === id ? { ...seg, gender } : seg)))
  }

  function patchSeg(idx: number, partial: Partial<ThetaSegment>) {
    setSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, ...partial } : s)))
  }

  function addManualSegment() {
    const last = segments.at(-1)
    const start = last ? last.end_ms + 2100 : 0
    const speaker = speakers[0]?.id ?? 1
    const gender = speakers.find((s) => s.id === speaker)?.gender ?? 'Unsure'
    setSegments((prev) => [...prev, newSegment(speaker, gender, start, start + 1500)])
    setSelectedIdx(segments.length)
  }

  function onTranscriptChange(raw: string) {
    if (!selected) return
    if (/[[\]]/.test(raw)) {
      setTagWarning('Do not type [ or ]. Highlight a span and apply Unsure or Truncated.')
    }
    const cleaned = raw.replace(/[[\]]/g, '')
    patchSeg(selectedIdx, { transcript: cleaned, tags: selected.tags.filter((t) => t.end_char <= cleaned.length) })
  }

  function applyTag(type: ThetaTagType) {
    const el = textRef.current
    if (!el || !selected) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (end <= start) {
      setTagWarning('Highlight the word or span first, then apply a tag.')
      return
    }
    const overlapTruncated = selected.tags.some(
      (t) => t.type === 'truncated' && t.start_char < end && t.end_char > start,
    )
    if (type === 'unsure' && overlapTruncated) {
      setTagWarning('Truncated always wins over Unsure on the same span. Unsure was not applied.')
      return
    }
    const nextTags: ThetaTag[] = [
      ...selected.tags.filter((t) => !(t.start_char === start && t.end_char === end && t.type === type)),
      { type, start_char: start, end_char: end },
    ]
    setTagWarning(null)
    patchSeg(selectedIdx, { tags: nextTags })
  }

  function toggleFlag(f: AudioQualityFlag) {
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  const canSubmit = useMemo(() => {
    if (disabled) return false
    if (segments.length === 0) return false
    return segments.every((s) => s.end_ms > s.start_ms && s.transcript.trim().length > 0)
  }, [disabled, segments])

  function handleSubmit() {
    const selection: ThetaAnswer = { segments, audio_quality_flags: flags }
    onSubmit({ selection })
  }

  return (
    <AssignmentCard question={question} flashState={flashState}>
      <p className="mb-2 text-[11px] font-medium text-muted-foreground">
        Drag on the waveform to cut segments. You can rewind inside this clip.
      </p>
      <div className="mb-3 rounded-md border border-border bg-background/60 p-2">
        <div ref={waveRef} className="min-h-24" />
        <div className="mt-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !waveReady}
            onClick={() => wsRef.current?.playPause()}
          >
            Play / Pause
          </Button>
          <audio src={audioUrl} controls className="h-8 flex-1" />
        </div>
        {waveError && <p className="mt-2 font-mono text-[11px] text-xp">{waveError}</p>}
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-md border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Speaker turns
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={addSpeaker}
              className="text-primary hover:text-primary/80"
              aria-label="Add speaker turn"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            {speakers.map((s) => (
              <div key={s.id} className="rounded border border-border p-2">
                <p className="font-mono text-xs font-bold">Speaker {s.id}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(['Male', 'Female', 'Unsure'] as SpeakerGender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSpeakerGender(s.id, g)}
                      className={cn(
                        'rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase',
                        s.gender === g
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border text-muted-foreground',
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Segments
            </p>
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={addManualSegment}>
              Add segment
            </Button>
          </div>
          {segments.length === 0 && (
            <p className="mb-3 font-mono text-[11px] text-muted-foreground">
              Drag on the waveform or add a segment to begin.
            </p>
          )}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {segments.map((s, i) => (
              <button
                key={`${s.start_ms}-${i}`}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={cn(
                  'rounded-md border px-2 py-1 font-mono text-[11px]',
                  i === selectedIdx
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground',
                )}
              >
                S{s.speaker} {s.start_ms}–{s.end_ms}ms
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-md border border-border p-3">
              <div className="mb-2 flex flex-wrap items-end gap-3">
                <label className="font-mono text-[10px] uppercase text-muted-foreground">
                  Start ms
                  <input
                    type="number"
                    disabled={disabled}
                    value={selected.start_ms}
                    onChange={(e) => patchSeg(selectedIdx, { start_ms: Number(e.target.value) })}
                    className="mt-1 block w-24 rounded border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <label className="font-mono text-[10px] uppercase text-muted-foreground">
                  End ms
                  <input
                    type="number"
                    disabled={disabled}
                    value={selected.end_ms}
                    onChange={(e) => patchSeg(selectedIdx, { end_ms: Number(e.target.value) })}
                    className="mt-1 block w-24 rounded border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <label className="font-mono text-[10px] uppercase text-muted-foreground">
                  Speaker
                  <select
                    disabled={disabled}
                    value={selected.speaker}
                    onChange={(e) => {
                      const id = Number(e.target.value)
                      const gender = speakers.find((s) => s.id === id)?.gender ?? selected.gender
                      patchSeg(selectedIdx, { speaker: id, gender })
                    }}
                    className="mt-1 block rounded border border-border bg-background px-2 py-1 text-sm"
                  >
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSegments((prev) => prev.filter((_, i) => i !== selectedIdx))
                    setSelectedIdx(0)
                  }}
                  className="ml-auto text-danger"
                  aria-label="Remove segment"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Verbatim transcript
              </label>
              <textarea
                ref={textRef}
                disabled={disabled}
                value={selected.transcript}
                onChange={(e) => onTranscriptChange(e.target.value)}
                rows={3}
                placeholder="Type what you hear. Do not type brackets."
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => applyTag('unsure')}>
                  Tag [unsure]
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => applyTag('truncated')}>
                  Tag [truncated]
                </Button>
              </div>
              {selected.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selected.tags.map((t, i) => (
                    <span
                      key={`${t.type}-${t.start_char}-${i}`}
                      className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase"
                    >
                      {t.type} · {selected.transcript.slice(t.start_char, t.end_char) || `${t.start_char}-${t.end_char}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(tagWarning || pauseHint) && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-xp/40 bg-xp/5 px-3 py-2 text-xs text-xp">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <p>{tagWarning || pauseHint}</p>
        </div>
      )}

      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Audio quality flags
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {AUDIO_QUALITY_FLAGS.map((f) => {
          const on = flags.includes(f)
          return (
            <button
              key={f}
              type="button"
              disabled={disabled}
              onClick={() => toggleFlag(f)}
              className={cn(
                'rounded-md border px-3 py-2 text-left font-mono text-xs uppercase tracking-wider',
                on ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground',
              )}
            >
              {AUDIO_QUALITY_LABELS[f]}
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Submit
      </Button>
    </AssignmentCard>
  )
}
