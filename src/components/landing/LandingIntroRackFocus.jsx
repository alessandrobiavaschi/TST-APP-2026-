import React, { useEffect, useRef } from 'react'
import { markLandingIntroSeen } from './landingIntroStorage.js'

/**
 * INTRO "RACK FOCUS" DELLA LANDING
 * --------------------------------
 * Il font NON è definito qui: all'avvio l'intro copia lo stile calcolato del
 * titolo e del sottotitolo veri dell'Hero, così resta sempre identico a loro.
 *
 * Alla prima visita, "TST" e il sottotitolo si scambiano la messa a fuoco come
 * in un cambio di fuoco cinematografico (la parola sfocata si apre in un alone
 * viola). Alla fine entrambe vanno a fuoco e scivolano esattamente al posto del
 * titolo dell'Hero (FLIP: si misura il titolo vero e ci si sposta sopra), poi
 * l'overlay sparisce e resta il titolo normale.
 *
 * - Una sola volta per browser (localStorage `tst-landing-intro-seen`).
 *   Per rivederla: aggiungi `?intro=1` all'URL.
 * - Clic, tasto o rotella = salta.
 * - prefers-reduced-motion o pagina già scrollata = niente intro.
 */

const HALO_RGB = '167,139,250'

// Fuoco nel tempo: [ms, fuoco TST, fuoco sottotitolo]  (1 = nitido, 0 = sfocato)
const KEYS = [
  [0, 0, 0],
  [250, 0, 0],
  [1150, 1, 0.08],
  [1700, 1, 0.08],
  [2500, 0.12, 1],
  [3050, 0.12, 1],
  [3800, 1, 1],
  [4200, 1, 1],
]
const FOCUS_END = KEYS[KEYS.length - 1][0]
const EXIT_MS = 900

const smooth = (x) => x * x * (3 - 2 * x)
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function focusAt(t) {
  if (t <= KEYS[0][0]) return [KEYS[0][1], KEYS[0][2]]
  for (let i = 1; i < KEYS.length; i += 1) {
    const [t1, a1, b1] = KEYS[i]
    const [t0, a0, b0] = KEYS[i - 1]
    if (t <= t1) {
      const k = smooth((t - t0) / (t1 - t0))
      return [a0 + (a1 - a0) * k, b0 + (b1 - b0) * k]
    }
  }
  const last = KEYS[KEYS.length - 1]
  return [last[1], last[2]]
}

export default function LandingIntroRackFocus({ title, subtitle, targetTitleRef, targetSubRef, onDone }) {
  const rootRef = useRef(null)
  const aRef = useRef(null)
  const bRef = useRef(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const root = rootRef.current
    const A = aRef.current
    const B = bRef.current
    if (!root || !A || !B) return undefined

    markLandingIntroSeen()

    // copia il font del titolo/sottotitolo veri (così l'intro combacia sempre)
    const TYPE_PROPS = [
      'fontFamily', 'fontWeight', 'fontStyle', 'fontSize', 'letterSpacing', 'lineHeight',
      'textTransform', 'color', 'maxWidth', 'textAlign', 'fontVariationSettings', 'fontOpticalSizing',
    ]
    function copyType(el, src) {
      if (!src) return
      const cs = window.getComputedStyle(src)
      TYPE_PROPS.forEach((prop) => {
        if (cs[prop]) el.style[prop] = cs[prop]
      })
    }
    const titleEl = targetTitleRef?.current
    copyType(A, titleEl?.querySelector('span') || titleEl)
    copyType(B, targetSubRef?.current)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const cache = { A: {}, B: {} }
    function paint(el, f, key, extra = '') {
      const s = cache[key]
      const blur = Math.round((1 - f) * 14 * 2) / 2 // passi da 0.5px (meno repaint)
      const scale = 1 + (1 - f) * 0.045
      const bloom = 1 - f
      if (blur !== s.blur) {
        el.style.filter = blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none'
        s.blur = blur
      }
      el.style.opacity = (0.3 + f * 0.7).toFixed(3)
      el.style.transform = `${extra} scale(${scale.toFixed(4)})`
      const sh = Math.round((2 + f * 10) * 2) / 2
      if (sh !== s.sh) {
        el.style.textShadow = `0 0 ${sh.toFixed(1)}px rgba(${HALO_RGB},${(f * 0.35).toFixed(3)})`
        s.sh = sh
      }
      const bb = Math.round((4 + bloom * 30) * 2) / 2
      if (bb !== s.bb) {
        el.style.setProperty('--bb', `${bb.toFixed(1)}px`)
        s.bb = bb
      }
      el.style.setProperty('--bo', (bloom * 0.85).toFixed(3))
    }

    // Delta FLIP verso il titolo vero (misurato quando parte l'uscita)
    function flipTo(el, target) {
      if (!target) return null
      const from = el.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      if (!from.width || !to.width) return null
      return {
        dx: to.left + to.width / 2 - (from.left + from.width / 2),
        dy: to.top + to.height / 2 - (from.top + from.height / 2),
        s: to.width / from.width,
      }
    }

    let raf = 0
    let start = performance.now()
    let exitStart = 0
    let flipA = null
    let flipB = null
    let finished = false

    function finish() {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      document.body.style.overflow = prevOverflow
      onDoneRef.current?.()
    }

    function beginExit(now) {
      if (exitStart) return
      // azzera le trasformazioni per misurare la posizione "a riposo"
      A.style.transform = 'none'
      B.style.transform = 'none'
      flipA = flipTo(A, targetTitleRef?.current)
      flipB = flipTo(B, targetSubRef?.current)
      exitStart = now
    }

    function frame(now) {
      const t = now - start
      if (!exitStart) {
        const [fA, fB] = focusAt(t)
        paint(A, fA, 'A')
        paint(B, fB, 'B')
        if (t >= FOCUS_END) beginExit(now)
      }
      if (exitStart) {
        const k = Math.min(1, (now - exitStart) / EXIT_MS)
        const e = easeInOut(k)
        const move = (fl) =>
          fl ? `translate(${(fl.dx * e).toFixed(2)}px, ${(fl.dy * e).toFixed(2)}px) scale(${(1 + (fl.s - 1) * e).toFixed(4)})` : ''
        paint(A, 1, 'A', move(flipA))
        paint(B, 1, 'B', move(flipB))
        if (!flipA) A.style.opacity = String(1 - e)
        if (!flipB) B.style.opacity = String(1 - e)
        root.style.setProperty('--intro-bg', String(1 - e))
        if (k >= 1) {
          finish()
          return
        }
      }
      raf = requestAnimationFrame(frame)
    }

    function skip() {
      if (exitStart) return
      // salto: porta tutto a fuoco e passa subito all'uscita
      start = performance.now() - FOCUS_END
    }

    root.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })
    const onVis = () => {
      if (document.hidden) skip()
    }
    document.addEventListener('visibilitychange', onVis)

    // Aspetta i font del titolo così la misura FLIP è corretta, ma al massimo
    // 350 ms: `document.fonts.ready` aspetta TUTTI i font della pagina e con
    // rete lenta lasciava lo schermo nero per secondi prima che l'intro partisse.
    // Se il font arriva dopo, la misura FLIP avviene comunque a fine intro (~4 s).
    const titleFont = A.style.fontFamily ? `${A.style.fontWeight || 600} 100px ${A.style.fontFamily}` : null
    const fontPromise = titleFont && document.fonts?.load
      ? document.fonts.load(titleFont, title).catch(() => {})
      : (document.fonts?.ready ?? Promise.resolve())
    const ready = Promise.race([fontPromise, new Promise((r) => setTimeout(r, 350))])
    let cancelled = false
    ready.then(() => {
      if (cancelled) return
      start = performance.now()
      raf = requestAnimationFrame(frame)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      root.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      document.removeEventListener('visibilitychange', onVis)
      document.body.style.overflow = prevOverflow
    }
  }, [targetTitleRef, targetSubRef, title])

  return (
    <div ref={rootRef} className="tst-intro-rf" aria-hidden="true">
      <div className="tst-intro-rf-stage">
        <div ref={aRef} className="tst-intro-rf-word tst-hero-type-title" data-w={title}>
          {title}
        </div>
        <p ref={bRef} className="tst-intro-rf-word tst-intro-rf-sub tst-hero-type-sub" data-w={subtitle}>
          {subtitle}
        </p>
      </div>
      <div className="tst-intro-rf-vignette" />
      <span className="tst-intro-rf-skip">clicca per saltare</span>
    </div>
  )
}
