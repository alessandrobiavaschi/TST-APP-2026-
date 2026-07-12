import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TEST_STORY_SLIDES } from './TestStorySlider.jsx'

const SLIDE_ACCENTS = [
  { color: 'rgba(56, 189, 248, 0.16)',  glow: 'rgba(56, 189, 248, 0.55)' },
  { color: 'rgba(139, 92, 246, 0.16)',  glow: 'rgba(139, 92, 246, 0.55)' },
  { color: 'rgba(20, 184, 166, 0.14)',  glow: 'rgba(20, 184, 166, 0.55)' },
  { color: 'rgba(99, 102, 241, 0.16)',  glow: 'rgba(99, 102, 241, 0.55)' },
  { color: 'rgba(251, 191, 36, 0.12)',  glow: 'rgba(251, 191, 36, 0.55)' },
  { color: 'rgba(168, 85, 247, 0.16)',  glow: 'rgba(168, 85, 247, 0.55)' },
]

const slideCount = TEST_STORY_SLIDES.length

export default function LandingNarrativeRail() {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef(null)
  const isScrollingRef = useRef(false)

  const goTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(slideCount - 1, idx))
    const track = trackRef.current
    if (!track) return
    const slideW = track.firstElementChild?.offsetWidth || track.clientWidth
    isScrollingRef.current = true
    track.scrollTo({ left: clamped * slideW, behavior: 'smooth' })
    setActiveIndex(clamped)
    setTimeout(() => { isScrollingRef.current = false }, 600)
  }, [])

  const syncFromScroll = useCallback(() => {
    if (isScrollingRef.current) return
    const track = trackRef.current
    if (!track) return
    const slideW = track.firstElementChild?.offsetWidth || track.clientWidth
    if (slideW <= 0) return
    const idx = Math.max(0, Math.min(slideCount - 1, Math.round(track.scrollLeft / slideW)))
    setActiveIndex((prev) => (prev === idx ? prev : idx))
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    track.addEventListener('scroll', syncFromScroll, { passive: true })
    window.addEventListener('resize', syncFromScroll)
    return () => {
      track.removeEventListener('scroll', syncFromScroll)
      window.removeEventListener('resize', syncFromScroll)
    }
  }, [syncFromScroll])

  return (
    <section className="lnr" aria-labelledby="lnr-heading">
      <div className="lnr-intro">
        <p className="lnr-eyebrow">Perché il test sonoro</p>
        <h2 id="lnr-heading" className="lnr-heading">
          Sei passaggi per capire cosa ascolti<br className="lnr-heading-br" /> e cosa rivela di te.
        </h2>
      </div>

      <div className="lnr-stage">
        <div
          className="lnr-track"
          ref={trackRef}
          role="region"
          aria-label="Slide informative sul test, scorrimento orizzontale"
        >
          {TEST_STORY_SLIDES.map((slide, i) => {
            const accent = SLIDE_ACCENTS[i]
            return (
              <article
                key={slide.id}
                className="lnr-slide"
                style={{ '--lnr-accent': accent.color, '--lnr-glow': accent.glow }}
                aria-hidden={i !== activeIndex}
              >
                <div className="lnr-slide-bg" aria-hidden="true" />
                <div className="lnr-slide-inner">
                  <p className="lnr-slide-eyebrow">{slide.kicker}</p>
                  <h3 className="lnr-slide-title">{slide.title}</h3>
                  <div className="lnr-slide-body">
                    {slide.body.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <span className="lnr-slide-ghost-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </article>
            )
          })}
        </div>

        <button
          type="button"
          className={`lnr-arrow lnr-arrow--prev${activeIndex === 0 ? ' lnr-arrow--hidden' : ''}`}
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Slide precedente"
          tabIndex={activeIndex === 0 ? -1 : 0}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M13 16L7 10L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          className={`lnr-arrow lnr-arrow--next${activeIndex === slideCount - 1 ? ' lnr-arrow--hidden' : ''}`}
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Slide successiva"
          tabIndex={activeIndex === slideCount - 1 ? -1 : 0}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="lnr-nav" role="tablist" aria-label="Naviga le slide">
        {TEST_STORY_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            className={`lnr-dot${i === activeIndex ? ' lnr-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1} di ${slideCount}`}
            aria-selected={i === activeIndex}
          />
        ))}
      </div>

      <p className="lnr-counter" aria-live="polite" aria-atomic="true">
        {activeIndex + 1} / {slideCount}
      </p>
    </section>
  )
}
