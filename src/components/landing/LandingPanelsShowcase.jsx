import React, { useCallback, useEffect, useRef, useState } from 'react'

// Pannelli della landing: un pannello per schermata, il testo compare tutto insieme
// con una semplice dissolvenza. Niente sfocature, sottolineature o indicatori numerici:
// la priorità è la leggibilità.
export default function LandingPanelsShowcase({ panels, onActivePanelChange }) {
  const [activePanelIndex, setActivePanelIndex] = useState(0)
  const [transitionKey, setTransitionKey] = useState(0)
  const [isSectionInView, setIsSectionInView] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(false)

  const containerRef = useRef(null)
  const isProgrammaticScrollRef = useRef(false)

  const activePanel = panels[activePanelIndex] || panels[0]

  // Notifica il genitore del pannello attivo per coordinare video o altro
  useEffect(() => {
    if (onActivePanelChange) {
      onActivePanelChange(activePanelIndex, activePanel)
    }
  }, [activePanelIndex, activePanel, onActivePanelChange])

  // Il testo compare quando la sezione entra nello schermo
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

  // Lo scorrimento verticale decide quale pannello è attivo
  useEffect(() => {
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      // I punti compaiono solo quando i pannelli occupano lo schermo
      const mid = window.innerHeight / 2
      const navShouldShow = rect.top <= mid && rect.bottom >= mid
      setIsNavVisible((prev) => (prev === navShouldShow ? prev : navShouldShow))

      const totalScrollable = (panels.length - 1) * window.innerHeight
      if (totalScrollable <= 0) return

      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable))
      const targetIndex = Math.min(
        panels.length - 1,
        Math.max(0, Math.round(progress * (panels.length - 1)))
      )

      if (targetIndex !== activePanelIndex) {
        setActivePanelIndex(targetIndex)
        setTransitionKey((k) => k + 1)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activePanelIndex, panels.length])

  // Clic sui punti laterali: porta al pannello scelto
  const goToPanel = useCallback(
    (nextIdx) => {
      if (nextIdx === activePanelIndex) return
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

  const revealClass = isSectionInView ? 'tst-panel-text-in' : 'tst-panel-text-wait'

  return (
    <div
      ref={containerRef}
      className="tst-nebula-panels-runway"
      style={{ height: `${panels.length * 100}vh` }}
    >
      {/* Navigazione laterale: solo punti, il nome del passaggio compare al passaggio del mouse */}
      <nav
        className={`tst-nebula-panel-nav${isNavVisible ? ' is-visible' : ''}`}
        aria-hidden={!isNavVisible}
        inert={!isNavVisible}
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
              aria-label={`Passaggio ${Number(panel.num)}: ${panel.title || 'Introduzione'}`}
              className={`tst-nebula-nav-item ${isActive ? 'is-active' : ''}`}
              style={{ '--nav-color': panel.color }}
              onClick={() => goToPanel(idx)}
            >
              <span className="tst-nebula-nav-dot" />
              {panel.title && (
                <span className="tst-nebula-nav-tooltip" aria-hidden="true">
                  {panel.title}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Stage sticky a tutto schermo */}
      <div className="tst-nebula-sticky-stage" style={{ '--panel-accent': activePanel.color }}>
        {/* Numero grande del pannello, fermo */}
        <div className="tst-nebula-giant-number" aria-hidden="true">
          {activePanel.num}
        </div>

        <div className="tst-nebula-stage-layout">
          {/* Area testuale: entra tutta insieme con una dissolvenza */}
          <div
            key={`content-${activePanel.num}-${transitionKey}`}
            className="tst-nebula-text-card"
            role="region"
            aria-live="polite"
          >
            {activePanel.eyebrow && (
              <span
                className={`tst-nebula-eyebrow tst-nebula-card-eyebrow ${revealClass}`}
                style={{ color: activePanel.color }}
              >
                {activePanel.eyebrow}
              </span>
            )}

            {activePanel.title && (
              <h3 className={`tst-nebula-card-title ${revealClass}`}>{activePanel.title}</h3>
            )}

            <div className={`tst-nebula-paragraphs-stack ${revealClass}`}>
              {activePanel.paragraphs.map((text, pIdx) => (
                <p key={`p-${pIdx}`} className="tst-nebula-card-paragraph">
                  {text}
                </p>
              ))}
            </div>

            {activePanel.footnote && (
              <p className={`tst-nebula-card-footnote ${revealClass}`}>{activePanel.footnote}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
