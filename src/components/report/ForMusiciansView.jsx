import React, { useState, useEffect, useRef } from 'react'
import MusiciansCompassNav from './MusiciansCompassNav.jsx'
import PersonalSonicProfile from './PersonalSonicProfile.jsx'
import DistanzeInterattive from './DistanzeInterattive.jsx'
import SuoniDelTuoTest from './SuoniDelTuoTest.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import MussidaBookAtlas from './MussidaBookAtlas.jsx'
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

  // ScrollSpy per aggiornare la bussola sticky durante lo scroll
  useEffect(() => {
    const sectionIds = ['fm-impronta', 'fm-distanze', 'fm-passi', 'fm-atlante']
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
      {/* 🧭 Bussola Sticky di Navigazione */}
      <MusiciansCompassNav
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onClose={onClose}
        backButtonRef={backButtonRef}
        accentColor={accentColor}
      />

      <div className="for-musicians-view__content">
        {/* ── STANZA 1: LA TUA IMPRONTA SONORA (Snapshot quantitativo + 4 Pilastri) ── */}
        <PersonalSonicProfile
          profilo={profilo}
          colorTotals={colorTotals}
          correntiByPeso={correntiByPeso}
          correnti={correnti}
          accentColor={accentColor}
          introMusicale={introMusicale}
        />

        {/* ── STANZA 2: IL CODICE DELLE 13 DISTANZE MUSICALI (Synth interattivo) ── */}
        <DistanzeInterattive
          profilo={profilo}
          accentColor={accentColor}
          colorTotals={colorTotals}
        />

        {/* ── STANZA 3: LA MACCHINA DEL TEST (72 ascolti decodificati + Aree sonore) ── */}
        <div id="fm-passi-wrapper">
          <SuoniDelTuoTest
            rawRecord={rawRecord}
            accentColor={accentColor}
          />

          <div className="for-musicians-view__sound-areas">
            <h3 className="for-musicians-view__sound-title">Aree sonore e percentuali del test</h3>
            <ApprofondimentoSezioni
              sezioniData={approfondimento?.sezioniData}
              sezioniTest={approfondimento?.sezioniTest}
              filtroMusicale={filtroMusicale}
              correnteColore={accentColor}
            />
          </div>
        </div>

        {/* ── STANZA 4: L'ATLANTE DEL PIANETA DELLA MUSICA (Ascolti polari + Enciclopedia) ── */}
        <MussidaBookAtlas
          accentColor={accentColor}
          userDominantFamily={profilo?.famiglia || 'Blu'}
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
