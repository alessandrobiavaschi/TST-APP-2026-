import React from 'react'
import SezioneMusica from './SezioneMusica.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import { MUSICISTI_INTRO } from '../../content/musicaDisposizione.js'

export default function ForMusiciansView({
  profilo = {},
  approfondimento = {},
  filtroMusicale = {},
  accentColor = '#4ade80',
  onClose,
  backButtonRef,
}) {
  return (
    <div className="for-musicians-view" style={{ '--music-accent': accentColor }}>
      <header className="for-musicians-view__hero">
        <div className="for-musicians-view__top-nav">
          {onClose ? (
            <button
              ref={backButtonRef}
              type="button"
              className="for-musicians-view__back-btn"
              onClick={onClose}
              aria-label="Torna al report principale"
            >
              ← Torna al report principale
            </button>
          ) : null}
        </div>
        <p className="for-musicians-view__eyebrow">TST — Lettura musicale e Aree sonore</p>
        <h1>For Musicians</h1>
        <p>{MUSICISTI_INTRO}</p>
      </header>

      <SezioneMusica
        profilo={profilo}
        accentColor={accentColor}
      />

      <div className="for-musicians-view__sound-areas">
        <h2 className="for-musicians-view__sound-title">Aree sonore del test</h2>
        <ApprofondimentoSezioni
          sezioniData={approfondimento?.sezioniData}
          sezioniTest={approfondimento?.sezioniTest}
          filtroMusicale={filtroMusicale}
          correnteColore={accentColor}
        />
      </div>

      {onClose ? (
        <div className="for-musicians-view__footer-nav">
          <button
            type="button"
            className="for-musicians-view__back-btn for-musicians-view__back-btn--bottom"
            onClick={onClose}
          >
            ← Torna al report principale
          </button>
        </div>
      ) : null}
    </div>
  )
}
