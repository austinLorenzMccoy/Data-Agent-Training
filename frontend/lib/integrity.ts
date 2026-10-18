'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { EMPTY, INJECTED_TEXT_CHARS, summarize, type Counts, type IntegrityReport } from './integrity-core'

// Soft lockdown for timed assessments. Nothing here blocks a user from
// finishing — it records what happened so a score can be marked unverified.

export { summarize, type IntegrityReport }

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
