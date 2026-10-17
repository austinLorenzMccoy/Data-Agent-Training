'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Soft lockdown for timed assessments. Nothing here blocks a user from
// finishing — it records what happened so a score can be marked unverified.

export interface IntegrityReport {
  fullscreenSupported: boolean
  fullscreenExits: number
  tabSwitches: number
  awayMs: number
  pasteBlocked: number
  dropBlocked: number
  // Large text inserts that didn't come from a paste: autofill, extensions,
  // text expanders.
  injectedText: number
  verified: boolean
  reasons: string[]
}

const MAX_TAB_SWITCHES = 2
const MAX_AWAY_MS = 30_000
const MAX_FULLSCREEN_EXITS = 2
const MAX_BLOCKED_INSERTS = 3
const INJECTED_TEXT_CHARS = 25

type Counts = Omit<IntegrityReport, 'verified' | 'reasons' | 'fullscreenSupported'>

const EMPTY: Counts = {
  fullscreenExits: 0,
  tabSwitches: 0,
  awayMs: 0,
  pasteBlocked: 0,
  dropBlocked: 0,
  injectedText: 0,
}

function fullscreenSupported(): boolean {
  return typeof document !== 'undefined' && !!document.documentElement.requestFullscreen
}

export function enterFullscreen() {
  if (!fullscreenSupported() || document.fullscreenElement) return
  document.documentElement.requestFullscreen().catch(() => {})
}

export function exitFullscreen() {
  if (typeof document !== 'undefined' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
}

export function summarize(counts: Counts, fsSupported: boolean): IntegrityReport {
  const reasons: string[] = []
  if (counts.tabSwitches > MAX_TAB_SWITCHES) reasons.push(`Left the test ${counts.tabSwitches} times`)
  if (counts.awayMs > MAX_AWAY_MS) reasons.push(`${Math.round(counts.awayMs / 1000)}s spent outside the test`)
  if (fsSupported && counts.fullscreenExits > MAX_FULLSCREEN_EXITS)
    reasons.push(`Exited fullscreen ${counts.fullscreenExits} times`)
  const blocked = counts.pasteBlocked + counts.dropBlocked
  if (blocked > MAX_BLOCKED_INSERTS) reasons.push(`${blocked} paste/drop attempts`)
  if (counts.injectedText > 0) reasons.push(`${counts.injectedText} large text inserts not typed by hand`)
  return { ...counts, fullscreenSupported: fsSupported, verified: reasons.length === 0, reasons }
}

export function useIntegrityMonitor(active: boolean) {
  const counts = useRef<Counts>({ ...EMPTY })
  const awaySince = useRef<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastWarning, setLastWarning] = useState<string | null>(null)

  const reset = useCallback(() => {
    counts.current = { ...EMPTY }
    awaySince.current = null
    setLastWarning(null)
  }, [])

  useEffect(() => {
    if (!active) return

    const goneAway = () => {
      if (awaySince.current !== null) return
      awaySince.current = Date.now()
      counts.current.tabSwitches += 1
    }
    const cameBack = () => {
      if (awaySince.current === null) return
      counts.current.awayMs += Date.now() - awaySince.current
      awaySince.current = null
      setLastWarning(`You left the test window (${counts.current.tabSwitches}). This is logged.`)
    }
    const onVisibility = () => (document.hidden ? goneAway() : cameBack())
    // Clicking into an embedded map/snapshot iframe blurs the window too;
    // activeElement only settles on the iframe after the blur handler runs.
    const onBlur = () =>
      setTimeout(() => {
        if (document.activeElement?.tagName !== 'IFRAME') goneAway()
      }, 0)
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        counts.current.fullscreenExits += 1
        setLastWarning('You exited fullscreen. This is logged.')
      }
    }
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      counts.current.pasteBlocked += 1
      setLastWarning('Pasting is disabled during the test.')
    }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      counts.current.dropBlocked += 1
    }
    const onBeforeInput = (e: InputEvent) => {
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
        e.preventDefault()
        return
      }
      if (e.inputType === 'insertReplacementText' || (e.data && e.data.length >= INJECTED_TEXT_CHARS)) {
        counts.current.injectedText += 1
      }
    }
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', cameBack)
    document.addEventListener('fullscreenchange', onFullscreen)
    document.addEventListener('paste', onPaste, true)
    document.addEventListener('drop', onDrop, true)
    document.addEventListener('beforeinput', onBeforeInput, true)
    document.addEventListener('contextmenu', onContextMenu)
    return () => {
      cameBack()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', cameBack)
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.removeEventListener('paste', onPaste, true)
      document.removeEventListener('drop', onDrop, true)
      document.removeEventListener('beforeinput', onBeforeInput, true)
      document.removeEventListener('contextmenu', onContextMenu)
    }
  }, [active])

  // Tracked outside the active gate: fullscreen is requested from the start
  // click, before the monitor switches on.
  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    if (!lastWarning) return
    const t = setTimeout(() => setLastWarning(null), 4000)
    return () => clearTimeout(t)
  }, [lastWarning])

  const report = useCallback((): IntegrityReport => {
    const snapshot = { ...counts.current }
    if (awaySince.current !== null) snapshot.awayMs += Date.now() - awaySince.current
    return summarize(snapshot, fullscreenSupported())
  }, [])

  return {
    report,
    reset,
    isFullscreen,
    fullscreenSupported: fullscreenSupported(),
    lastWarning,
  }
}
