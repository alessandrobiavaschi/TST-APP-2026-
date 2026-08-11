import React from 'react'
import SezioneMusica from './SezioneMusica.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import { MUSICISTI_INTRO } from '../../content/musicaDisposizione.js'

export default function ForMusiciansView({
  profilo = {},
  accentColor = '#4ade80',
  approfondimento = { sezioniData: [], sezioniTest: null },
  filtroMusicale = {},
  onBack,
  backButtonRef,
}) {
  return (
    <div className="for-musicians-view" style={{ '--music-accent': accentColor }}>
      <header className="for-musicians-view__hero">
        <button
          ref={backButtonRef}
          type="button"
          className="nav-button secondary for-musicians-view__back"
          onClick={onBack}
        >
          Torna al report
        </button>
        <p className="for-musicians-view__eyebrow">TST - Lettura musicale</p>
        <h1>For Musicians</h1>
        <p>{MUSICISTI_INTRO}</p>
      </header>

      <section id="report-tst-approfondimento" className="for-musicians-view__section report-tst-section-anchor">
        <ApprofondimentoSezioni
          sezioniData={approfondimento?.sezioniData}
          sezioniTest={approfondimento?.sezioniTest}
          filtroMusicale={filtroMusicale}
          correnteColore={accentColor}
        />
      </section>

      <section className="for-musicians-view__section">
        <SezioneMusica
          profilo={profilo}
          accentColor={accentColor}
        />
      </section>
    </div>
  )
}
