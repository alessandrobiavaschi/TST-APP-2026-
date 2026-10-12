import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FAMIGLIE, PORTATI, SEZIONI } from '../../config/tstSistema.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { passiLeggibili, percorsoRisposte } from '../../utils/percorsoRisposte.js'
import './PercorsoRisposte.css'

/**
 * PercorsoRisposte — le 72 risposte in ordine di ascolto.
 * Il tratto prende il colore del portato, la banda sotto quello della famiglia.
 * Antipatia usa un neutro freddo (docs/REGOLE_DESIGN_REPORT.md).
 */

const STEPS = 72
const PORTATO_COLOR = { simpatia: '#f2b48a', antipatia: '#8fa3bf', indifferenza: '#5b6270' }
const FAMILY_COLOR = Object.fromEntries(Object.values(FAMILY_THEME).map((t) => [t.key, t.dot]))
const EMPTY = 'rgba(255, 255, 255, 0.12)'
const SECONDS_PER_STEP = 0.35

const hill = (t) => 0.5 + Math.sin(t * Math.PI * 2.2) * 0.22 + Math.sin(t * Math.PI * 7.3) * 0.08

function draw(ctx, w, h, percorso, active, font) {
  const top = 26
  const band = 6
  const base = h - band - 4
  const sw = w / STEPS
  const y = (x) => top + (1 - hill(x / w)) * (base - top - 12)
  ctx.clearRect(0, 0, w, h)

  SEZIONI.forEach((s, i) => {
    const x = (s.da - 1) * sw
    if (i > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
      ctx.fillRect(Math.round(x), 0, 1, base)
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = `11px ${font}`
    ctx.fillText(s.nome, x + 6, 14)
  })

  percorso.forEach((p, i) => {
    const a = i * sw
    const b = a + sw
    const color = p ? PORTATO_COLOR[p.portato] : EMPTY
    ctx.beginPath()
    ctx.moveTo(a, base)
    for (let x = a; x < b; x += 2) ctx.lineTo(x, y(x))
    ctx.lineTo(b, y(b))
    ctx.lineTo(b, base)
    ctx.closePath()
    ctx.globalAlpha = i === active ? 0.4 : 0.18
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.beginPath()
    ctx.moveTo(a, y(a))
    for (let x = a; x < b; x += 2) ctx.lineTo(x, y(x))
    ctx.lineTo(b, y(b))
    ctx.strokeStyle = color
    ctx.lineWidth = i === active ? 4 : 2.5
    ctx.stroke()

    ctx.fillStyle = p ? FAMILY_COLOR[p.famiglia] || EMPTY : EMPTY
    ctx.fillRect(a, h - band, Math.max(1, sw - 1), band)
  })

  if (active != null) {
    const cx = (active + 0.5) * sw
    ctx.beginPath()
    ctx.arc(cx, y(cx), 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
}

export default function PercorsoRisposte({ record }) {
  const percorso = useMemo(() => percorsoRisposte(record || {}), [record])
  const leggibili = passiLeggibili(percorso)
  const reduce = useReducedMotion()
  const canvasRef = useRef(null)
  const [hover, setHover] = useState(null)
  const [walker, setWalker] = useState(0)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (reduce || hover != null) return undefined
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now) => {
      acc += (now - last) / 1000
      last = now
      if (acc >= SECONDS_PER_STEP) {
        acc = 0
        setWalker((s) => (s + 1) % STEPS)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, hover])

  const active = hover ?? (reduce ? null : walker)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size.w || !size.h) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx, size.w, size.h, percorso, active, getComputedStyle(canvas).fontFamily || 'sans-serif')
  }, [size, percorso, active])

  if (leggibili === 0) return null

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (!r.width) return
    setHover(Math.min(STEPS - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * STEPS))))
  }
  const shown = active ?? null
  const passo = shown != null ? percorso[shown] : null
  const conteggio = PORTATI.map((p) => ({ ...p, n: percorso.filter((x) => x?.portato === p.id).length }))

  return (
    <figure className="percorso-risposte sintesi-correnti__visual-panel">
      <figcaption className="percorso-risposte__caption">
        Le tue 72 risposte nell&apos;ordine di ascolto. Il colore del tratto indica il portato, la banda sotto la famiglia.
        Passa il cursore su un tratto per leggere il passo.
      </figcaption>
      <canvas
        ref={canvasRef}
        className="percorso-risposte__canvas"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden="true"
      />
      <p className="percorso-risposte__readout">
        {shown == null
          ? `${leggibili} passi su ${STEPS} con una risposta leggibile.`
          : passo
            ? `Passo ${passo.numero} di ${STEPS} · ${passo.sezione} · famiglia ${passo.nomeFamiglia} · ${passo.nomePortato}`
            : `Passo ${shown + 1} di ${STEPS} · nessuna risposta leggibile`}
      </p>
      <div className="percorso-risposte__legend">
        <ul aria-label="Portato">
          {conteggio.map((p) => (
            <li key={p.id}>
              <i style={{ background: PORTATO_COLOR[p.id] }} aria-hidden="true" />
              {p.nome} <span className="percorso-risposte__count">{p.n}</span>
            </li>
          ))}
        </ul>
        <ul aria-label="Famiglia">
          {FAMIGLIE.map((f) => (
            <li key={f.colorKey}>
              <i className="percorso-risposte__band" style={{ background: FAMILY_COLOR[f.colorKey] }} aria-hidden="true" />
              {f.nome}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
