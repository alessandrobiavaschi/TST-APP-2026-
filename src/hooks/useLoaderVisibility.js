import { useEffect, useRef, useState } from 'react'
import { remainingVisibleMs, resolveLoaderTiming } from '../utils/loaderTiming.js'

/**
 * Traduce lo stato "sto aspettando" (active) in visibilità del loader,
 * applicando la regola unica di loaderTiming.js.
 * - pending: true appena inizia l'attesa (serve a bloccare le interazioni).
 * - visible: true solo dopo showDelayMs; resta true almeno minVisibleMs.
 * - slow: true se l'attesa supera slowAfterMs.
 */
export function useLoaderVisibility(active, overrides) {
  const { showDelayMs, minVisibleMs, slowAfterMs } = resolveLoaderTiming(overrides)
  const [visible, setVisible] = useState(false)
  const [slow, setSlow] = useState(false)
  const shownAtRef = useRef(null)

  useEffect(() => {
    if (active) {
      const showTimer = window.setTimeout(() => {
        if (shownAtRef.current == null) shownAtRef.current = Date.now()
        setVisible(true)
      }, showDelayMs)
      const slowTimer = window.setTimeout(() => setSlow(true), slowAfterMs)
      return () => {
        window.clearTimeout(showTimer)
        window.clearTimeout(slowTimer)
      }
    }

    // Attesa conclusa: se il loader non è mai comparso non c'è nulla da nascondere.
    if (shownAtRef.current == null) return undefined
    const hideTimer = window.setTimeout(() => {
      shownAtRef.current = null
      setVisible(false)
      setSlow(false)
    }, remainingVisibleMs(shownAtRef.current, Date.now(), minVisibleMs))
    return () => window.clearTimeout(hideTimer)
  }, [active, showDelayMs, minVisibleMs, slowAfterMs])

  return {
    visible,
    slow: Boolean(active && slow),
    pending: Boolean(active || visible),
  }
}
