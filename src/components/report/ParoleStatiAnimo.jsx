import React, { useState } from 'react'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import './ParoleStatiAnimo.css'

const MACRO_EMOZIONI = [
  {
    id: 'giallo',
    famiglia: 'Entusiasta',
    nome: 'Entusiasmo & Festa',
    colore: '#eab308',
    icona: '⚡️',
    motto: 'L’energia viva che accende il movimento e contagia chi ti circonda.',
    parole: ['Spontaneo', 'Esuberante', 'Radioso', 'Esplosivo', 'Ardente', 'Curioso', 'Vitale', 'Coinvolgente'],
  },
  {
    id: 'rosso',
    famiglia: 'Marziale',
    nome: 'Grinta & Azione',
    colore: '#dc2626',
    icona: '🔥',
    motto: 'La determinazione che affronta le sfide senza indietreggiare.',
    parole: ['Determinato', 'Impavido', 'Incisivo', 'Diretto', 'Focoso', 'Solido', 'Tenace', 'Intrepido'],
  },
  {
    id: 'blu',
    famiglia: 'Malinconica',
    nome: 'Introspezione & Poesia',
    colore: '#2563eb',
    icona: '🌊',
    motto: 'La ricerca del senso profondo, la bellezza dolce-amara e l’ascolto intimo.',
    parole: ['Profondo', 'Nostalgico', 'Sensibile', 'Raccolto', 'Lirico', 'Empatico', 'Delicato', 'Sincero'],
  },
  {
    id: 'verde',
    famiglia: 'Flemmatica',
    nome: 'Calma & Zen',
    colore: '#16a34a',
    icona: '🍃',
    motto: 'Il respiro largo, l’armonia silenziosa e la pace che accoglie.',
    parole: ['Sereno', 'Pacifico', 'Paziente', 'Equilibrato', 'Mite', 'Rilassato', 'Rassicurante', 'Gentile'],
  },
  {
    id: 'grigio',
    famiglia: 'Razionale',
    nome: 'Lucidità & Focus',
    colore: '#64748b',
    icona: '🧭',
    motto: 'Lo sguardo dall’alto, la mente chiara e il piacere dell’analisi.',
    parole: ['Lucido', 'Analitico', 'Curioso', 'Distaccato', 'Essenziale', 'Metodico', 'Discreto', 'Osservatore'],
  },
]

export default function ParoleStatiAnimo({ famiglia = '', step = '5' }) {
  const normFamiglia = String(famiglia || '').toLowerCase().trim()

  const defaultId = MACRO_EMOZIONI.find(
    (m) => m.id === normFamiglia || m.famiglia.toLowerCase() === normFamiglia
  )?.id || 'giallo'

  const [selectedId, setSelectedId] = useState(defaultId)
  const attiva = MACRO_EMOZIONI.find((m) => m.id === selectedId) || MACRO_EMOZIONI[0]

  return (
    <section aria-labelledby="parole-tst-title" className="parole-tst">
      <ReportPassageHeader
        step={step}
        title="Parole"
        titleVisuallyHidden
        titleId="parole-tst-title"
      />

      <div className="parole-fun">
        {/* Selettore rapido 5 Macro-Emozioni */}
        <div className="parole-fun__tabs" role="tablist" aria-label="Macro-emozioni">
          {MACRO_EMOZIONI.map((m) => {
            const isSelected = m.id === attiva.id
            const isUserMood = m.id === normFamiglia || m.famiglia.toLowerCase() === normFamiglia

            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`parole-fun__tab ${isSelected ? 'is-selected' : ''}`}
                style={{ '--mood-colore': m.colore }}
                onClick={() => setSelectedId(m.id)}
              >
                <span className="parole-fun__tab-icon" aria-hidden="true">{m.icona}</span>
                <span className="parole-fun__tab-name">{m.famiglia}</span>
                {isUserMood && <span className="parole-fun__mood-badge">Il tuo mood</span>}
              </button>
            )
          })}
        </div>

        {/* Card attiva essenziale */}
        <div
          className="parole-fun__card"
          style={{ '--card-colore': attiva.colore }}
        >
          <header className="parole-fun__card-head">
            <div className="parole-fun__title-row">
              <span className="parole-fun__card-icon" aria-hidden="true">{attiva.icona}</span>
              <h3 className="parole-fun__card-title">{attiva.nome}</h3>
            </div>
            <p className="parole-fun__card-motto">«{attiva.motto}»</p>
          </header>

          <div className="parole-fun__words">
            {attiva.parole.map((parola) => (
              <span key={parola} className="parole-fun__word-pill">
                {parola}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
