import React from 'react'
import SezioneMusica from './SezioneMusica.jsx'
import { MUSICISTI_INTRO } from '../../content/musicaDisposizione.js'

export default function ForMusiciansView({
  profilo = {},
  accentColor = '#4ade80',
}) {
  return (
    <div className="for-musicians-view" style={{ '--music-accent': accentColor }}>
      <header className="for-musicians-view__hero">
        <p className="for-musicians-view__eyebrow">TST - Lettura musicale</p>
        <h1>For Musicians</h1>
        <p>{MUSICISTI_INTRO}</p>
      </header>

      <SezioneMusica
        profilo={profilo}
        accentColor={accentColor}
      />
    </div>
  )
}
