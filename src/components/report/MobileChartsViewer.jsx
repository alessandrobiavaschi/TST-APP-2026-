import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/mobile-charts-viewer.css'

/**
 * VISORE GRAFICI A TUTTO SCHERMO (mobile)
 * ---------------------------------------
 * Mostra una serie di grafici uno alla volta: si scorre col dito a destra e a
 * sinistra (scroll-snap nativo), oppure con le frecce, i pallini o la tastiera.
 * Non calcola nulla: riceve i grafici già pronti come `slides`
 * ({ id, title, caption, content }) e li impagina.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MobileChartsViewer({ open, onClose, title, slides = [], footer = null, accentColor }) {
  const dialogRef = useRef(null)
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const count = slides.length

  const goTo = useCallback((next) => {
    const track = trackRef.current
    if (!track) return
    const target = Math.max(0, Math.min(count - 1, next))
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' })
  }, [count])

  // Blocca lo scroll della pagina, gestisce Esc/frecce/Tab e ripristina il focus.
  useEffect(() => {
    if (!open) return undefined
    const previouslyFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setIndex(0)
    const raf = window.requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 })
      dialogRef.current?.querySelector('.mcv__close')?.focus({ preventScroll: true })
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      const track = trackRef.current
      const current = track ? Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) : 0
      if (event.key === 'ArrowRight') goTo(current + 1)
      if (event.key === 'ArrowLeft') goTo(current - 1)
      if (event.key !== 'Tab') return
      const nodes = [...(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])]
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      window.cancelAnimationFrame(raf)
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, onClose, goTo])

  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track) return
    const next = Math.round(track.scrollLeft / Math.max(1, track.clientWidth))
    if (next !== index) setIndex(next)
  }

  if (!open || typeof document === 'undefined' || count === 0) return null

  return createPortal(
    <div
      ref={dialogRef}
      className="report-tst mcv"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcv-title"
      style={accentColor ? { '--mcv-accent': accentColor } : undefined}
    >
      <header className="mcv__head">
        <div className="mcv__head-text">
          <h2 id="mcv-title" className="mcv__title">{title}</h2>
          <p className="mcv__counter" aria-live="polite">
            {slides[index]?.title} · {index + 1} di {count}
          </p>
        </div>
        <button type="button" className="mcv__close" onClick={onClose} aria-label="Chiudi i grafici">
          ×
        </button>
      </header>

      <div ref={trackRef} className="mcv__track" onScroll={onTrackScroll}>
        {slides.map((slide, i) => (
          <section
            key={slide.id}
            className="mcv__slide"
            aria-roledescription="grafico"
            aria-label={`${slide.title}, ${i + 1} di ${count}`}
            aria-hidden={i !== index}
            inert={i !== index ? true : undefined}
          >
            <h3 className="mcv__slide-title">{slide.title}</h3>
            {slide.caption ? <p className="mcv__slide-caption">{slide.caption}</p> : null}
            <div className="mcv__slide-chart">{slide.content}</div>
          </section>
        ))}
      </div>

      {footer ? <div className="mcv__footer">{footer}</div> : null}

      <nav className="mcv__nav" aria-label="Scegli il grafico">
        <button
          type="button"
          className="mcv__arrow"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Grafico precedente"
        >
          ‹
        </button>
        <div className="mcv__dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`mcv__dot${i === index ? ' mcv__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Vai a: ${slide.title}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="mcv__arrow"
          onClick={() => goTo(index + 1)}
          disabled={index === count - 1}
          aria-label="Grafico successivo"
        >
          ›
        </button>
      </nav>
    </div>,
    // sul body (sopra tutto); la classe report-tst dà i token del report
    document.body,
  )
}
