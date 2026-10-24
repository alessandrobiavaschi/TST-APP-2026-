import React, { useRef, useState } from 'react'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { FAMIGLIA_BY_COLOR } from '../../config/tstSistema.js'
import './ParoleStatiAnimo.css'

const MACRO_EMOZIONI = [
  {
    id: 'giallo',
    nome: 'Entusiasmo & Festa',
    motto: 'L’energia viva che accende il movimento e contagia chi ti circonda.',
    parole: ['Spontaneo', 'Esuberante', 'Radioso', 'Esplosivo', 'Ardente', 'Curioso', 'Vitale', 'Coinvolgente'],
  },
  {
    id: 'rosso',
    nome: 'Grinta & Azione',
    motto: 'La determinazione che affronta le sfide senza indietreggiare.',
    parole: ['Determinato', 'Impavido', 'Incisivo', 'Diretto', 'Focoso', 'Solido', 'Tenace', 'Intrepido'],
  },
  {
    id: 'blu',
    nome: 'Introspezione & Poesia',
    motto: 'La ricerca del senso profondo, la bellezza dolce-amara e l’ascolto intimo.',
    parole: ['Profondo', 'Nostalgico', 'Sensibile', 'Raccolto', 'Lirico', 'Empatico', 'Delicato', 'Sincero'],
  },
  {
    id: 'verde',
    nome: 'Calma & Zen',
    motto: 'Il respiro largo, l’armonia silenziosa e la pace che accoglie.',
    parole: ['Sereno', 'Pacifico', 'Paziente', 'Equilibrato', 'Mite', 'Rilassato', 'Rassicurante', 'Gentile'],
  },
  {
    id: 'grigio',
    nome: 'Lucidità & Focus',
    motto: 'Lo sguardo dall’alto, la mente chiara e il piacere dell’analisi.',
    parole: ['Lucido', 'Analitico', 'Curioso', 'Distaccato', 'Essenziale', 'Metodico', 'Discreto', 'Osservatore'],
  },
].map((m) => ({ ...m, famiglia: FAMIGLIA_BY_COLOR[m.id]?.nome || m.id }))

export default function ParoleStatiAnimo({ famiglia = '', step = '5' }) {
  const normFamiglia = String(famiglia || '').toLowerCase().trim()
  const isUtente = (m) => m.id === normFamiglia || m.famiglia.toLowerCase() === normFamiglia
  const defaultId = MACRO_EMOZIONI.find(isUtente)?.id || 'giallo'

  const [selectedId, setSelectedId] = useState(defaultId)
  const tabRefs = useRef([])
  const attiva = MACRO_EMOZIONI.find((m) => m.id === selectedId) || MACRO_EMOZIONI[0]

  const onKeyDown = (event, index) => {
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    let next = delta ? (index + delta + MACRO_EMOZIONI.length) % MACRO_EMOZIONI.length : null
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = MACRO_EMOZIONI.length - 1
    if (next === null) return
    event.preventDefault()
    setSelectedId(MACRO_EMOZIONI[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section aria-labelledby="parole-tst-title" className="parole-tst">
      <ReportPassageHeader step={step} title="Parole" titleVisuallyHidden titleId="parole-tst-title" />

      <div className="parole-lex" style={{ '--lex-colore': `var(--tst-family-${attiva.id})` }}>
        <div className="parole-lex__index" role="tablist" aria-orientation="vertical" aria-label="Famiglie emotive">
          {MACRO_EMOZIONI.map((m, index) => {
            const isSelected = m.id === attiva.id
            return (
              <button
                key={m.id}
                ref={(el) => { tabRefs.current[index] = el }}
                id={`parole-tab-${m.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls="parole-lex-panel"
                tabIndex={isSelected ? 0 : -1}
                className={`parole-lex__tab${isSelected ? ' is-selected' : ''}`}
                style={{ '--tab-colore': `var(--tst-family-${m.id})` }}
                onClick={() => setSelectedId(m.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <span className="parole-lex__tab-name">{m.famiglia}</span>
                {isUtente(m) ? <span className="parole-lex__tab-note">la tua famiglia</span> : null}
              </button>
            )
          })}
        </div>

        <div
          id="parole-lex-panel"
          className="parole-lex__panel"
          role="tabpanel"
          aria-labelledby={`parole-tab-${attiva.id}`}
          key={attiva.id}
        >
          <h3 className="parole-lex__title">{attiva.nome}</h3>
          <p className="parole-lex__motto">{attiva.motto}</p>
          <ol className="parole-lex__words">
            {attiva.parole.map((parola) => (
              <li key={parola} className="parole-lex__word">{parola}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
