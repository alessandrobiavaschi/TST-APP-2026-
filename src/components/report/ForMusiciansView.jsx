import React, { useState, useEffect, useRef } from 'react'
import MusiciansCompassNav from './MusiciansCompassNav.jsx'
import PersonalSonicProfile from './PersonalSonicProfile.jsx'
import DistanzeInterattive from './DistanzeInterattive.jsx'
import SuoniDelTuoTest from './SuoniDelTuoTest.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import { MUSICISTI_INTRO, MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import '../../styles/sezione-musica.css'

export default function ForMusiciansView({
  profilo = {},
  approfondimento = {},
  filtroMusicale = {},
  accentColor = '#4ade80',
  colorTotals = {},
  correntiByPeso = [],
  correnti = {},
  rawRecord = {},
  onClose,
  backButtonRef,
}) {
  const [activeRoom, setActiveRoom] = useState('fm-impronta')
  const viewContainerRef = useRef(null)

  const scheda = MUSICISTI_SCHEDE[profilo?.famiglia || '']
  const introMusicale = scheda?.introMusicale || MUSICISTI_INTRO

  // ScrollSpy per aggiornare la barra di navigazione durante lo scroll sui 4 blocchi
  useEffect(() => {
    const sectionIds = [
      'fm-impronta',
      'fm-aree',
      'fm-distanze',
      'fm-passi',
    ]
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el) {
          const top = el.offsetTop
          if (scrollPos >= top) {
            setActiveRoom(sectionIds[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSelectRoom = (roomId) => {
    setActiveRoom(roomId)
    const el = document.getElementById(roomId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      ref={viewContainerRef}
      className="for-musicians-view"
      style={{ '--music-accent': accentColor }}
    >
      {/* Navigazione Sticky tra le sezioni musicali */}
      <MusiciansCompassNav
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onClose={onClose}
        backButtonRef={backButtonRef}
        accentColor={accentColor}
      />

      <div className="for-musicians-view__content">
        {/* 1. Impronta sonora */}
        <PersonalSonicProfile
          profilo={profilo}
          colorTotals={colorTotals}
          correntiByPeso={correntiByPeso}
          correnti={correnti}
          accentColor={accentColor}
          introMusicale={introMusicale}
        />

        {/* 2. Le 5 Aree musicali del test */}
        <section id="fm-aree" className="fm-section fm-sound-areas" aria-labelledby="fm-sound-areas-title">
          <div className="fm-sound-areas__head">
            <h2 id="fm-sound-areas-title">Aree musicali e percentuali</h2>
            <p className="fm-section-lead">
              Come le tue risposte si sono distribuite lungo i cinque parametri dell'esperienza sonora:
              Timbro, Intervalli, Ritmo, Melodia e Accordi.
            </p>
          </div>
          <ApprofondimentoSezioni
            sezioniData={approfondimento?.sezioniData}
            sezioniTest={approfondimento?.sezioniTest}
            filtroMusicale={filtroMusicale}
            correnteColore={accentColor}
            plainLanguage={false}
          />
        </section>

        {/* 3. I 13 Intervalli sonori */}
        <DistanzeInterattive
          profilo={profilo}
          accentColor={accentColor}
          colorTotals={colorTotals}
        />

        {/* 4. I 72 Ascolti del test */}
        <SuoniDelTuoTest
          rawRecord={rawRecord}
          accentColor={accentColor}
        />

        {/* Navigazione di chiusura in fondo alla pagina */}
        {onClose && (
          <div className="for-musicians-view__footer-nav">
            <button
              type="button"
              className="for-musicians-view__back-btn for-musicians-view__back-btn--bottom"
              onClick={onClose}
            >
              ← Torna al report principale
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
