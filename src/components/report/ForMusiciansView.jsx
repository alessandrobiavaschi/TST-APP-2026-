import React, { useState, useEffect, useRef, useCallback } from 'react'
import MusiciansCompassNav from './MusiciansCompassNav.jsx'
import FamigliaMusicale from './musicisti/FamigliaMusicale.jsx'
import DatiPerNerd from './musicisti/DatiPerNerd.jsx'
import SchedaMusicista from './musicisti/SchedaMusicista.jsx'
import AscoltiEArtisti from './AscoltiEArtisti.jsx'
import { MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import { MUSICIAN_ROOMS, MUSICIAN_INDEX_UI } from '../../config/musiciansConfig.js'
import '../../styles/sezione-musica.css'

// La vista vive dentro un layer fixed che scorre da sé: scroll e scrollspy passano da lì.
const findScroller = (node) => node?.closest?.('.report-tst-musicians-layer') || null

/**
 * Lettura per musicisti: la famiglia nella Musica (con le altre famiglie da
 * leggere), la scheda del musicista, gli ascolti consigliati, i dati per nerd.
 */
export default function ForMusiciansView({
  profilo = {},
  approfondimento = {},
  filtroMusicale = {},
  accentColor = '#4ade80',
  rawRecord = {},
  onClose,
  backButtonRef,
}) {
  const [activeRoom, setActiveRoom] = useState(MUSICIAN_ROOMS[0].id)
  const famigliaUtente = profilo?.famiglia || ''
  const [famigliaAttiva, setFamigliaAttiva] = useState(MUSICISTI_SCHEDE[famigliaUtente] ? famigliaUtente : 'Rosso')
  const viewContainerRef = useRef(null)

  const nomeFamiglia =
    MUSICISTI_SCHEDE[famigliaUtente]?.label ||
    (profilo?.famigliaNome && !['Verde', 'Rosso', 'Blu', 'Giallo', 'Grigio'].includes(profilo.famigliaNome) ? profilo.famigliaNome : null) ||
    'Flemmatica'

  useEffect(() => {
    const scroller = findScroller(viewContainerRef.current)
    const target = scroller || window
    const handleScroll = () => {
      const originTop = scroller ? scroller.getBoundingClientRect().top : 0
      let current = MUSICIAN_ROOMS[0].id
      MUSICIAN_ROOMS.forEach((room) => {
        const el = document.getElementById(room.id)
        if (el && el.getBoundingClientRect().top - originTop <= 180) current = room.id
      })
      setActiveRoom(current)
    }
    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSelectRoom = useCallback((roomId) => {
    setActiveRoom(roomId)
    document.getElementById(roomId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div ref={viewContainerRef} className="for-musicians-view" style={{ '--music-accent': accentColor }}>
      <MusiciansCompassNav
        rooms={MUSICIAN_ROOMS}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onClose={onClose}
        backButtonRef={backButtonRef}
        accentColor={accentColor}
      />

      <div className="for-musicians-view__content">
        <header className="for-musicians-view__hero">
          <h1 className="for-musicians-view__hero-title">La tua impronta emotiva nella Musica</h1>
          <p className="for-musicians-view__hero-lead">
            Come la tua disposizione temperamentale guida l'espressione, l'ascolto, l'improvvisazione e la pratica musicale:
            una traduzione diretta tra psicologia del suono e fare musica.
          </p>
          {famigliaUtente ? (
            <div className="for-musicians-view__user-badge">
              <span className="for-musicians-view__user-badge-label">Profilo emerso dal test:</span>
              <span className="for-musicians-view__user-badge-tag">
                <span className="for-musicians-view__user-badge-dot" style={{ backgroundColor: accentColor }} aria-hidden="true" />
                Famiglia {nomeFamiglia}
                {profilo?.naturaNome ? ` · Natura ${profilo.naturaNome}` : ''}
              </span>
            </div>
          ) : null}
        </header>

        <FamigliaMusicale famigliaUtente={famigliaUtente} attiva={famigliaAttiva} onChange={setFamigliaAttiva} />
        <SchedaMusicista famigliaUtente={famigliaUtente} famigliaAttiva={famigliaAttiva} />
        <AscoltiEArtisti accentColor={accentColor} />
        <DatiPerNerd
          approfondimento={approfondimento}
          filtroMusicale={filtroMusicale}
          rawRecord={rawRecord}
          accentColor={accentColor}
        />

        {onClose && (
          <div className="for-musicians-view__footer-nav">
            <button
              type="button"
              className="for-musicians-view__back-btn for-musicians-view__back-btn--bottom"
              onClick={onClose}
            >
              {MUSICIAN_INDEX_UI.backToReport}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
