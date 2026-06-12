import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TEST_STORY_SLIDES } from './TestStorySlider.jsx'

export default function LandingNarrativeRail() {
  const viewportRef = useRef(null)
  const slideCount = TEST_STORY_SLIDES.length
  const [activeIndex, setActiveIndex] = useState(0)

  const syncFromScroll = useCallback(() => {
    const root = viewportRef.current
    if (!root) return
    const track = root.querySelector('.landing-apple-narrative-track')
    const slide = track?.firstElementChild
    if (!slide || !track) return
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0
    const step = slide.offsetWidth + gap
    if (step <= 0) return
    const idx = Math.max(0, Math.min(slideCount - 1, Math.round(root.scrollLeft / step)))
    setActiveIndex((prev) => (prev === idx ? prev : idx))
  }, [slideCount])

  useEffect(() => {
    const root = viewportRef.current
    if (!root) return undefined
    syncFromScroll()
    root.addEventListener('scroll', syncFromScroll, { passive: true })
    window.addEventListener('resize', syncFromScroll)
    return () => {
      root.removeEventListener('scroll', syncFromScroll)
      window.removeEventListener('resize', syncFromScroll)
    }
  }, [syncFromScroll])

  const progressPct = slideCount > 0 ? ((activeIndex + 1) / slideCount) * 100 : 0

  return (
    <div className="landing-apple-narrative-rail" aria-labelledby="landing-narrative-rail-heading">
      <div className="landing-apple-section-head landing-apple-narrative-rail-intro">
        <p className="landing-apple-section-kicker">Perché il test sonoro</p>
        <h2 id="landing-narrative-rail-heading">
          Sei passaggi per capire cosa ascolti e cosa rivela di te.
        </h2>
      </div>
      <div className="landing-apple-narrative-rail-head">
        <p className="landing-apple-narrative-rail-hint" aria-hidden="true">
          Scorri in orizzontale
        </p>
      </div>
      <div
        className="landing-apple-narrative-rail-viewport"
        ref={viewportRef}
        role="region"
        aria-label="Schede informative sul test, scorrimento orizzontale"
      >
        <div className="landing-apple-narrative-track" role="list">
          {TEST_STORY_SLIDES.map((slide, index) => (
            <article key={slide.id} className="landing-apple-narrative-card" role="listitem">
              <div className="landing-apple-narrative-card-top">
                <span className="landing-apple-narrative-card-num" aria-hidden="true">
                  {index + 1}
                </span>
                <header className="landing-apple-narrative-card-head">
                  <p className="landing-apple-narrative-card-kicker">{slide.kicker}</p>
                  <h3 className="landing-apple-narrative-card-title">{slide.title}</h3>
                </header>
              </div>
              <div className="landing-apple-narrative-card-body">
                {slide.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="landing-apple-narrative-progress-wrap" aria-hidden="true">
        <div className="landing-apple-narrative-progress">
          <div
            className="landing-apple-narrative-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
