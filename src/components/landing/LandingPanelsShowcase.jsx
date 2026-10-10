import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LandingReadingRail from './LandingReadingRail.jsx'
import LandingSparkleEmitter from './LandingSparkleEmitter.jsx'
import { parseParagraphTokens } from './landingKeywords.js'

export default function LandingPanelsShowcase({ panels, onActivePanelChange }) {
  const [activePanelIndex, setActivePanelIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = avanti, -1 = indietro
  const [transitionKey, setTransitionKey] = useState(0)
  const [revealedChars, setRevealedChars] = useState(0)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [focusedParagraphIndex, setFocusedParagraphIndex] = useState(0)
  const [isSectionInView, setIsSectionInView] = useState(false)

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const isProgrammaticScrollRef = useRef(false)
  const animTimerRef = useRef(null)

  const activePanel = panels[activePanelIndex] || panels[0]

  // Pre-calcola i token e le lunghezze di ciascun paragrafo del pannello attivo
  const parsedParagraphs = useMemo(() => {
    return activePanel.paragraphs.map((text) => ({
      rawText: text,
      tokens: parseParagraphTokens(text, activePanel.num),
      length: text.length,
    }))
  }, [activePanel])

  // Calcola offset cumulativi per ciascun paragrafo
  const paragraphOffsets = useMemo(() => {
    const offsets = []
    let current = 0
    parsedParagraphs.forEach((p) => {
      offsets.push({
        start: current,
        end: current + p.length,
        length: p.length,
      })
      current += p.length
    })
    return offsets
  }, [parsedParagraphs])

  const totalChars = useMemo(() => {
    return parsedParagraphs.reduce((acc, p) => acc + p.length, 0)
  }, [parsedParagraphs])

  // Gestione Effetto Scrittura (Typewriter Effect)
  useEffect(() => {
    if (!isSectionInView) return undefined

    // Controllo per utenti che preferiscono ridotto movimento
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setRevealedChars(totalChars)
      setIsTypingComplete(true)
      return undefined
    }

    setRevealedChars(0)
    setIsTypingComplete(false)

    let current = 0
    // Cadenza di scrittura elegante: ~12ms a carattere, a blocchetti di 1-2 char per fluidità a 60fps
    const intervalMs = 16
    const step = 2

    const timer = setInterval(() => {
      current += step
      if (current >= totalChars) {
        setRevealedChars(totalChars)
        setIsTypingComplete(true)
        clearInterval(timer)
      } else {
        setRevealedChars(current)
      }
    }, intervalMs)

    animTimerRef.current = timer

    return () => clearInterval(timer)
  }, [activePanelIndex, isSectionInView, totalChars, transitionKey])

  // Calcola il paragrafo attualmente in digitazione o lettura
  useEffect(() => {
    if (!isTypingComplete && totalChars > 0) {
      const idx = paragraphOffsets.findIndex(
        (off) => revealedChars >= off.start && revealedChars <= off.end
      )
      if (idx !== -1) {
        setFocusedParagraphIndex(idx)
      }
    }
  }, [revealedChars, isTypingComplete, paragraphOffsets, totalChars])

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

      // Se la digitazione è completa, aggiorna il paragrafo a fuoco in base allo scroll locale
      if (isTypingComplete) {
        const localProg = (progress * (panels.length - 1)) % 1
        const pIdx = Math.min(
          activePanel.paragraphs.length - 1,
          Math.max(0, Math.floor(localProg * activePanel.paragraphs.length))
        )
        setFocusedParagraphIndex(pIdx)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activePanelIndex, panels.length, isTypingComplete, activePanel.paragraphs.length])

  // Navigazione a click sui numeri/punti laterali
  const goToPanel = useCallback(
    (nextIdx) => {
      if (nextIdx === activePanelIndex) return
      const dir = nextIdx > activePanelIndex ? 1 : -1
      setDirection(dir)
      setActivePanelIndex(nextIdx)
      setTransitionKey((k) => k + 1)

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

  // Salta immediatamente alla fine della digitazione al click sul testo
  const handleFastForwardTyping = useCallback(() => {
    if (!isTypingComplete) {
      if (animTimerRef.current) clearInterval(animTimerRef.current)
      setRevealedChars(totalChars)
      setIsTypingComplete(true)
    }
  }, [isTypingComplete, totalChars])

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

  // Calcolo progresso lettura (0 a 1)
  const readingProgress = useMemo(() => {
    if (totalChars === 0) return 0
    return Math.min(1, revealedChars / totalChars)
  }, [revealedChars, totalChars])

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

          {/* Area testuale con transizione Fade & Slide e Typewriter */}
          <div
            key={`content-${activePanel.num}-${transitionKey}`}
            className={`tst-nebula-text-card ${
              direction > 0 ? 'is-entering-forward' : 'is-entering-backward'
            }`}
            onClick={handleFastForwardTyping}
            role="region"
            aria-live="polite"
            title={!isTypingComplete ? 'Fai clic per visualizzare tutto il testo' : undefined}
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
                const offset = paragraphOffsets[pIdx]
                const isStarted = revealedChars > offset.start
                const isFull = revealedChars >= offset.end
                const isCurrentlyTyping = isStarted && !isFull
                const isFocused = pIdx === focusedParagraphIndex

                if (!isStarted && !isTypingComplete) {
                  return (
                    <p
                      key={`p-${pIdx}`}
                      className="tst-nebula-card-paragraph is-pending"
                      aria-hidden="true"
                    >
                      &nbsp;
                    </p>
                  )
                }

                // Caratteri visibili all'interno di questo specifico paragrafo
                let charsToRevealInP = Math.max(0, revealedChars - offset.start)
                let cursorRendered = false

                return (
                  <p
                    key={`p-${pIdx}`}
                    className={`tst-nebula-card-paragraph ${
                      isFocused ? 'is-focused' : 'is-dimmed'
                    } ${isCurrentlyTyping ? 'is-typing' : ''}`}
                    onMouseEnter={() => setFocusedParagraphIndex(pIdx)}
                  >
                    {paragraph.tokens.map((token, tIdx) => {
                      if (charsToRevealInP <= 0 && !isFull) {
                        return null
                      }

                      let tokenTextToRender = token.text
                      let showCursorHere = false

                      if (!isFull) {
                        if (charsToRevealInP >= token.text.length) {
                          charsToRevealInP -= token.text.length
                        } else {
                          tokenTextToRender = token.text.slice(0, charsToRevealInP)
                          charsToRevealInP = 0
                          if (!cursorRendered && !isTypingComplete) {
                            showCursorHere = true
                            cursorRendered = true
                          }
                        }
                      }

                      if (token.isKeyword) {
                        return (
                          <React.Fragment key={`tok-${tIdx}`}>
                            <span
                              className="tst-keyword"
                              data-keyword={token.keywordKey}
                              onMouseEnter={(e) => handleKeywordEnter(e, token.text)}
                              onMouseLeave={handleKeywordLeave}
                            >
                              {tokenTextToRender}
                            </span>
                            {showCursorHere && (
                              <span
                                className="tst-typewriter-cursor"
                                aria-hidden="true"
                                style={{ background: activePanel.color }}
                              />
                            )}
                          </React.Fragment>
                        )
                      }

                      return (
                        <React.Fragment key={`tok-${tIdx}`}>
                          <span>{tokenTextToRender}</span>
                          {showCursorHere && (
                            <span
                              className="tst-typewriter-cursor"
                              aria-hidden="true"
                              style={{ background: activePanel.color }}
                            />
                          )}
                        </React.Fragment>
                      )
                    })}

                    {/* Cursore alla fine del paragrafo se esattamente al termine */}
                    {isCurrentlyTyping && !cursorRendered && !isTypingComplete && (
                      <span
                        className="tst-typewriter-cursor"
                        aria-hidden="true"
                        style={{ background: activePanel.color }}
                      />
                    )}
                  </p>
                )
              })}
            </div>

            {activePanel.footnote && (
              <p className="tst-nebula-card-footnote">{activePanel.footnote}</p>
            )}

            {!isTypingComplete && (
              <div className="tst-typewriter-hint" aria-hidden="true">
                <span className="tst-typewriter-hint-dot" /> Clicca per mostrare tutto
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
