import React from 'react'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { FASI_ELABORAZIONE } from './fasiElaborazione.js'
import '../../styles/test-finale.css'

// Un petalo per famiglia, con il colore convenzionale usato nel report.
const PETALI = ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio']
  .map((nome) => FAMILY_THEME[nome])
  .filter(Boolean)
  .map((theme) => ({ key: theme.key, color: theme.dot }))

function FioreFamiglie({ progress }) {
  const step = 100 / (PETALI.length + 1)
  return (
    <svg className="tst-attesa-fiore" viewBox="-60 -60 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="tst-attesa-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
          gradientTransform="scale(14)">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="tst-attesa-petali">
        {PETALI.map((petalo, i) => (
          <ellipse
            key={petalo.key}
            className={`tst-attesa-petalo${progress >= step * (i + 1) ? ' is-on' : ''}`}
            cx="0"
            cy="-25"
            rx="12"
            ry="23"
            fill={petalo.color}
            transform={`rotate(${i * (360 / PETALI.length)})`}
          />
        ))}
      </g>
      <circle className="tst-attesa-cuore" r="14" fill="url(#tst-attesa-core)" />
    </svg>
  )
}

/**
 * Schermata di attesa tra la consegna e il report.
 * `progress` (0–100) e `phaseIndex` arrivano dal timer di NewTestPage.
 */
export default function ResultAnalysisScreen({ progress, phaseIndex }) {
  const done = progress >= 100
  return (
    <section
      className={`tst-attesa${done ? ' is-done' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Elaborazione del profilo"
    >
      <div className="tst-attesa-inner">
        <FioreFamiglie progress={progress} />

        <h2 className="tst-attesa-title">Stiamo componendo il tuo profilo</h2>

        <ol className="tst-attesa-fasi">
          {FASI_ELABORAZIONE.map((fase, i) => {
            const stato = i < phaseIndex || done ? 'done' : i === phaseIndex ? 'active' : 'todo'
            return (
              <li key={fase} className={`tst-attesa-fase is-${stato}`}>
                <span className="tst-attesa-fase-mark" aria-hidden="true" />
                <span>{fase}</span>
                {stato === 'active' && <span className="sr-only"> (in corso)</span>}
                {stato === 'done' && <span className="sr-only"> (fatto)</span>}
              </li>
            )
          })}
        </ol>

        <div
          className="tst-attesa-progress"
          role="progressbar"
          aria-label="Avanzamento elaborazione"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <div className="tst-attesa-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>

        <p className="tst-attesa-note">I tuoi dati restano riservati.</p>
      </div>
    </section>
  )
}
