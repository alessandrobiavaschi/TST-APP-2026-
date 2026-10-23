import React from 'react'
import SezioneMusica from './SezioneMusica.jsx'
import IlTuoSuonoFamiglia from './IlTuoSuonoFamiglia.jsx'
import DistanzeInterattive from './DistanzeInterattive.jsx'
import SuoniDelTuoTest from './SuoniDelTuoTest.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import AscoltiEArtisti from './AscoltiEArtisti.jsx'
import { MUSICISTI_INTRO, MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import '../../styles/sezione-musica.css'

export default function ForMusiciansView({
  profilo = {},
  approfondimento = {},
  filtroMusicale = {},
  accentColor = '#4ade80',
  colorTotals = {},
  rawRecord = {},
  onClose,
  backButtonRef,
}) {
  const scheda = MUSICISTI_SCHEDE[profilo?.famiglia || '']
  const introMusicale = scheda?.introMusicale || MUSICISTI_INTRO

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
        <p className="for-musicians-view__eyebrow">TST — Lettura musicale</p>
        <h1>For Musicians</h1>
        <p className="for-musicians-view__subtitle">Per musicisti &amp; amanti della Musica</p>
        <p className="for-musicians-view__intro">{introMusicale}</p>
      </header>

      {/* 1. Il tuo suono per famiglia (Timbri, Ritmo e BPM, Armonie e Modi, Il musicista che sei) */}
      <IlTuoSuonoFamiglia
        profilo={profilo}
        accentColor={accentColor}
      />

      {/* 2. Il suo modo di incontrare la Musica e la pratica */}
      <SezioneMusica
        profilo={profilo}
        accentColor={accentColor}
      />

      {/* 3. Le 13 distanze musicali interattive (Unisono -> Ottava con synth Web Audio) */}
      <DistanzeInterattive
        profilo={profilo}
        accentColor={accentColor}
        colorTotals={colorTotals}
      />

      {/* 4. I suoni del tuo test (i 72 passi tecnici con le risposte dell'utente) */}
      <SuoniDelTuoTest
        rawRecord={rawRecord}
        accentColor={accentColor}
      />

      {/* 5. Aree sonore del test */}
      <div className="for-musicians-view__sound-areas">
        <h2 className="for-musicians-view__sound-title">Aree sonore del test</h2>
        <ApprofondimentoSezioni
          sezioniData={approfondimento?.sezioniData}
          sezioniTest={approfondimento?.sezioniTest}
          filtroMusicale={filtroMusicale}
          correnteColore={accentColor}
        />
      </div>

      {/* 6. Ascolti e artisti: le 5 coppie del libro con l'analisi di Franco Mussida */}
      <AscoltiEArtisti accentColor={accentColor} />

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
