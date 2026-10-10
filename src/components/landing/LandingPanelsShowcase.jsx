import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LandingReadingRail from './LandingReadingRail.jsx'
import LandingSparkleEmitter from './LandingSparkleEmitter.jsx'
import { parseParagraphTokens } from './landingKeywords.js'

export default function LandingPanelsShowcase({ panels, onActivePanelChange }) {
  const [activePanelIndex, setActivePanelIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = avanti, -1 = indietro
  const [transitionKey, setTransitionKey] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [focusedParagraphIndex, setFocusedParagraphIndex] = useState(0)
  const [isSectionInView, setIsSectionInView] = useState(false)

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const isProgrammaticScrollRef = useRef(false)

  const activePanel = panels[activePanelIndex] || panels[0]

  // Pre-calcola i token e le lunghezze di ciascun paragrafo del pannello attivo
  const parsedParagraphs = useMemo(() => {
    return activePanel.paragraphs.map((text) => ({
      rawText: text,
      tokens: parseParagraphTokens(text, activePanel.num),
    }))
  }, [activePanel])

  // Notifica il genitore del pannello attivo per coordinare video o altro
  useEffect(() => {
    if (onActivePanelChange) {
      onActivePanelChange(activePanelIndex, activePanel)
    }
  }, [activePanelIndex, activePanel, onActivePanelChange])

  // IntersectionObserver per verificare quando la sezione entra nel viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sincronizzazione con lo Scroll Verticale (Scroll-driven progression)
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const totalScrollable = (panels.length - 1) * window.innerHeight

      if (totalScrollable <= 0) return

      // Calcola avanzamento nello stage
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable))
      const targetIndex = Math.min(
        panels.length - 1,
        Math.max(0, Math.round(progress * (panels.length - 1)))
      )

      if (targetIndex !== activePanelIndex) {
        setDirection(targetIndex >= activePanelIndex ? 1 : -1)
        setActivePanelIndex(targetIndex)
        setTransitionKey((k) => k + 1)
      }

      // Paragrafo a fuoco in base allo scroll locale
      const localProg = (progress * (panels.length - 1)) % 1
      const pIdx = Math.min(
        activePanel.paragraphs.length - 1,
        Math.max(0, Math.floor(localProg * activePanel.paragraphs.length))
      )
      setFocusedParagraphIndex(pIdx)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activePanelIndex, panels.length, activePanel.paragraphs.length])

  // Navigazione a click sui numeri/punti laterali
  const goToPanel = useCallback(
    (nextIdx) => {
      if (nextIdx === activePanelIndex) return
      const dir = nextIdx > activePanelIndex ? 1 : -1
      setDirection(dir)
      setActivePanelIndex(nextIdx)
      setTransitionKey((k) => k + 1)
      setFocusedParagraphIndex(0)

      const container = containerRef.current
      if (container && typeof window !== 'undefined') {
        const containerTop = window.scrollY + container.getBoundingClientRect().top
        const targetScroll = containerTop + nextIdx * window.innerHeight

        isProgrammaticScrollRef.current = true
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })

        setTimeout(() => {
          isProgrammaticScrollRef.current = false
        }, 850)
      }
    },
    [activePanelIndex]
  )

  // Gestione Hover sulle Parole Chiave
  const handleKeywordEnter = useCallback((e, keywordText) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredPoint({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      keyword: keywordText,
      active: true,
    })
    // Incrementa luminescenza di fondo attorno alla parola
    document.body.classList.add('tst-keyword-active')
  }, [])

  const handleKeywordLeave = useCallback(() => {
    setHoveredPoint((prev) => (prev ? { ...prev, active: false } : null))
    document.body.classList.remove('tst-keyword-active')
  }, [])

  // Progresso lettura (0 a 1): segue il paragrafo a fuoco
  const paragraphCount = activePanel.paragraphs.length
  const revealClass = isSectionInView ? 'tst-nebula-reveal' : 'tst-nebula-reveal-wait'
  const readingProgress = paragraphCount > 0 ? (focusedParagraphIndex + 1) / paragraphCount : 0

  return (
    <div
      ref={containerRef}
      className="tst-nebula-panels-runway"
      style={{ height: `${panels.length * 100}vh` }}
    >
      {/* Micro-interazione particelle stellari sulle keyword hoverate */}
      <LandingSparkleEmitter targetPoint={hoveredPoint} accentColor={activePanel.color} />

      {/* Navigazione Laterale Numerata con Punti (01 - 07) */}
      <nav
        className="tst-nebula-panel-nav"
        role="tablist"
        aria-label="Passaggi esplorativi del Test TST"
      >
        {panels.map((panel, idx) => {
          const isActive = activePanelIndex === idx
          return (
            <button
              key={panel.num}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Passaggio ${panel.num}: ${panel.title || 'Introduzione'}`}
              className={`tst-nebula-nav-item ${isActive ? 'is-active' : ''}`}
              style={{ '--nav-color': panel.color }}
              onClick={() => goToPanel(idx)}
            >
              <span className="tst-nebula-nav-num">{panel.num}</span>
              <span className="tst-nebula-nav-dot" />
              {panel.title && (
                <span className="tst-nebula-nav-tooltip" aria-hidden="true">
                  <strong>{panel.num}</strong> {panel.title}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Stage sticky a tutto schermo */}
      <div
        ref={stageRef}
        className="tst-nebula-sticky-stage"
        style={{ '--panel-accent': activePanel.color }}
      >
        {/* Numero monumentale sagomato con transizione fluida */}
        <div
          key={`num-${activePanel.num}-${transitionKey}`}
          className="tst-nebula-giant-number"
          aria-hidden="true"
        >
          {activePanel.num}
        </div>

        {/* Contenuto principale del pannello attivo */}
        <div className="tst-nebula-stage-layout">
          {/* Binario di progressione lettura sul margine sinistro del testo */}
          <LandingReadingRail
            progress={readingProgress}
            paragraphCount={activePanel.paragraphs.length}
            activeParagraphIndex={focusedParagraphIndex}
            accentColor={activePanel.color}
          />

          {/* Area testuale: il testo entra tutto insieme (dissolvenza + leggera salita) */}
          <div
            key={`content-${activePanel.num}-${transitionKey}`}
            className={`tst-nebula-text-card ${
              direction > 0 ? 'is-entering-forward' : 'is-entering-backward'
            }`}
            role="region"
            aria-live="polite"
          >
            {activePanel.eyebrow && (
              <span
                className="tst-nebula-eyebrow tst-nebula-card-eyebrow"
                style={{ color: activePanel.color }}
              >
                {activePanel.eyebrow}
              </span>
            )}

            {activePanel.title && (
              <h3 className="tst-nebula-card-title">{activePanel.title}</h3>
            )}

            <div className="tst-nebula-paragraphs-stack">
              {parsedParagraphs.map((paragraph, pIdx) => {
                const isFocused = pIdx === focusedParagraphIndex
                return (
                  <p
                    key={`p-${pIdx}`}
                    className={`tst-nebula-card-paragraph ${revealClass} ${
                      isFocused ? 'is-focused' : 'is-dimmed'
                    }`}
                    style={{ '--reveal-index': pIdx + 1 }}
                    onMouseEnter={() => setFocusedParagraphIndex(pIdx)}
                  >
                    {paragraph.tokens.map((token, tIdx) =>
                      token.isKeyword ? (
                        <span
                          key={`tok-${tIdx}`}
                          className="tst-keyword"
                          data-keyword={token.keywordKey}
                          onMouseEnter={(e) => handleKeywordEnter(e, token.text)}
                          onMouseLeave={handleKeywordLeave}
                        >
                          {token.text}
                        </span>
                      ) : (
                        <span key={`tok-${tIdx}`}>{token.text}</span>
                      )
                    )}
                  </p>
                )
              })}
            </div>

            {activePanel.footnote && (
              <p className={`tst-nebula-card-footnote ${revealClass}`} style={{ '--reveal-index': paragraphCount + 1 }}>{activePanel.footnote}</p>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
