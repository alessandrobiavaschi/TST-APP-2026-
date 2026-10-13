import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TUTORIAL_LISTENING_LEAD, TUTORIAL_LISTENING_SLIDES } from '../tutorialListeningSlides.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function TutorialPage() {
  useDocumentTitle('Tutorial')
  const navigate = useNavigate()
  const location = useLocation()
  const [slideIndex, setSlideIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [touchEndX, setTouchEndX] = useState(null)
  const activeSlide = TUTORIAL_LISTENING_SLIDES[slideIndex]

  const canGoBack = useMemo(() => Boolean(location.state?.fromPath), [location.state])

  const prevSlide = () => {
    setSlideIndex((prev) => (prev === 0 ? TUTORIAL_LISTENING_SLIDES.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setSlideIndex((prev) => (prev === TUTORIAL_LISTENING_SLIDES.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (event) => {
    setTouchEndX(null)
    setTouchStartX(event.targetTouches[0].clientX)
  }

  const handleTouchMove = (event) => {
    setTouchEndX(event.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const distance = touchStartX - touchEndX
    if (distance > 45) nextSlide()
    if (distance < -45) prevSlide()
  }

  const goBack = () => {
    if (canGoBack) {
      navigate(location.state.fromPath)
      return
    }
    navigate('/nuovo-test')
  }

  return (
    <div className="page tutorial-page">
      <section className="page-card tutorial-page-card">
        <p className="tutorial-page-kicker">Tutorial</p>
        <h1 className="tutorial-page-title">Guida al Test</h1>
        <p className="tutorial-page-subtitle">{TUTORIAL_LISTENING_LEAD}</p>
        <p className="tutorial-page-subtitle">Scorri le slide o usa le frecce per leggere tutti i passaggi.</p>

        <div
          className="tutorial-page-slider"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button type="button" className="tutorial-page-nav" onClick={prevSlide} aria-label="Slide precedente">
            <span className="tutorial-page-nav-icon" aria-hidden="true">
              ‹
            </span>
          </button>
          <article className="tutorial-page-slide">
            <span className="tutorial-page-step">{slideIndex + 1}</span>
            <h2>{activeSlide.title}</h2>
            <p>{activeSlide.text}</p>
          </article>
          <button type="button" className="tutorial-page-nav" onClick={nextSlide} aria-label="Slide successiva">
            <span className="tutorial-page-nav-icon" aria-hidden="true">
              ›
            </span>
          </button>
        </div>

        <div className="tutorial-page-dots">
          {TUTORIAL_LISTENING_SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`tutorial-page-dot ${slideIndex === index ? 'is-active' : ''}`}
              aria-label={`Vai alla slide ${index + 1}`}
              onClick={() => setSlideIndex(index)}
            />
          ))}
        </div>

        <div className="tutorial-page-actions">
          <button type="button" className="btn btn-secondary" onClick={goBack}>
            Torna indietro
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/nuovo-test')}>
            Vai al test
          </button>
        </div>
      </section>
    </div>
  )
}

export default TutorialPage
