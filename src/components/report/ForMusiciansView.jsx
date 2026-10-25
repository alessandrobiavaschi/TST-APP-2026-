import React, { useState, useEffect, useRef } from 'react'
import MusiciansCompassNav from './MusiciansCompassNav.jsx'
import { MUSICIAN_ROOMS } from '../../config/musiciansConfig.js'
import PersonalSonicProfile from './PersonalSonicProfile.jsx'
import DistanzeInterattive from './DistanzeInterattive.jsx'
import SuoniDelTuoTest from './SuoniDelTuoTest.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import BraniConfronto from './BraniConfronto.jsx'
import GuidaFamiglieSuono from './GuidaFamiglieSuono.jsx'
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

  // ScrollSpy per aggiornare la bussola sticky durante lo scroll sui 6 blocchi
  useEffect(() => {
    const sectionIds = [
      'fm-impronta',
      'fm-aree',
      'fm-distanze',
      'fm-passi',
      'fm-confronti',
      'fm-famiglie',
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
      {/* 🧭 Bussola Sticky di Navigazione (6 stanze) */}
      <MusiciansCompassNav
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        onClose={onClose}
        backButtonRef={backButtonRef}
        accentColor={accentColor}
      />

      <div className="for-musicians-view__content">
        {/* 🧭 Hub iniziale di orientamento con 6 tessere direzionali */}
        <section className="fm-hub-directions" aria-label="Indice sezioni musicali">
          <p className="fm-hub-kicker">Lettura musicale analitica</p>
          <h1 className="fm-hub-title">Mappa dei 6 ambiti sonori</h1>
          <p className="fm-hub-lead">
            Un percorso completo per musicisti e appassionati: dalla tua risonanza iniziale all'analisi tecnica dei parametri acustici.
          </p>

          <div className="fm-hub-grid" role="list">
            {MUSICIAN_ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                className="fm-hub-card"
                onClick={() => handleSelectRoom(r.id)}
              >
                <div className="fm-hub-card__top">
                  <span className="fm-hub-card__icon" aria-hidden="true">{r.icon}</span>
                  <span className="fm-hub-card__num">{r.label.split('.')[0]}</span>
                </div>
                <strong className="fm-hub-card__label">{r.shortLabel}</strong>
                <span className="fm-hub-card__cta">Vai alla sezione →</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── SEZIONE 1: LA TUA IMPRONTA SONORA ── */}
        <PersonalSonicProfile
          profilo={profilo}
          colorTotals={colorTotals}
          correntiByPeso={correntiByPeso}
          correnti={correnti}
          accentColor={accentColor}
          introMusicale={introMusicale}
        />

        {/* ── SEZIONE 2: LE 5 AREE MUSICALI DEL TEST ── */}
        <section id="fm-aree" className="fm-section fm-sound-areas" aria-labelledby="fm-sound-areas-title">
          <div className="fm-sound-areas__head">
            <p className="fm-kicker">Sezione 2 · Le 5 Aree musicali del test</p>
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

        {/* ── SEZIONE 3: I 13 INTERVALLI SONORI ── */}
        <DistanzeInterattive
          profilo={profilo}
          accentColor={accentColor}
          colorTotals={colorTotals}
        />

        {/* ── SEZIONE 4: I 72 ASCOLTI DEL TEST ── */}
        <SuoniDelTuoTest
          rawRecord={rawRecord}
          accentColor={accentColor}
        />

        {/* ── SEZIONE 5: BRANI A CONFRONTO ── */}
        <BraniConfronto
          accentColor={accentColor}
        />

        {/* ── SEZIONE 6: GUIDA ALLE FAMIGLIE MUSICALI ── */}
        <GuidaFamiglieSuono
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
