import React, { useId, useRef, useState } from 'react'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { FAMIGLIA_BY_COLOR, nomeNatura } from '../../config/tstSistema.js'
import { getFamigliaByColorKey } from '../../content/paroleTst.js'
import './ParoleStatiAnimo.css'

// Solo il nome della famiglia: titoli e motti inventati («Calma & Zen»…) sono stati tolti
// perché non hanno riscontro in docs/fonti-scientifiche.
const FAMIGLIE = ['giallo', 'rosso', 'blu', 'verde', 'grigio'].map((id) => ({
  id,
  famiglia: FAMIGLIA_BY_COLOR[id]?.nome || id,
}))

/** Per ogni natura: prima le parole chiave del documento di Franco, poi gli altri aggettivi. */
function lessicoDellaFamiglia(colorKey) {
  return (getFamigliaByColorKey(colorKey)?.nature || []).map((natura) => {
    // «Nero / Negativo» nel documento è una coppia: la mostro come due parole, come negli aggettivi.
    const chiave = (natura.paroleChiave || []).flatMap((p) => p.parola.split('/').map((x) => x.trim()))
    const tutte = [...new Set([...chiave, ...natura.aggettivi])]
    return { rawKey: natura.rawKey, nome: nomeNatura(natura.rawKey), chiave, tutte }
  })
}

function LessicoNature({ colorKey }) {
  const [aperto, setAperto] = useState(false)
  const listId = useId()
  const listRef = useRef(null)
  const nature = lessicoDellaFamiglia(colorKey)
  const totale = nature.reduce((n, natura) => n + natura.tutte.length, 0)
  const nascoste = nature.some((natura) => natura.tutte.length > natura.chiave.length)

  return (
    <>
      <div id={listId} ref={listRef} className="parole-lex__nature">
        {nature.map((natura) => {
          const parole = aperto || !natura.chiave.length ? natura.tutte : natura.chiave
          return (
            <div key={natura.rawKey} className="parole-lex__natura">
              <p className="parole-lex__natura-nome">
                {natura.nome}
                <span className="parole-lex__natura-conta">{natura.tutte.length}</span>
              </p>
              <ul className="parole-lex__words">
                {parole.map((parola) => (
                  <li key={parola} className="parole-lex__word">{parola}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
      {nascoste ? (
        <button
          type="button"
          className="parole-lex__toggle"
          aria-expanded={aperto}
          aria-controls={listId}
          onClick={() => {
            // Richiudendo una lista lunga, riporto la vista all'inizio del lessico.
            if (aperto) listRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            setAperto(!aperto)
          }}
        >
          {aperto ? 'Mostra solo le parole chiave' : `Mostra tutte le ${totale} parole`}
        </button>
      ) : null}
    </>
  )
}

export default function ParoleStatiAnimo({ famiglia = '', step = '5' }) {
  const normFamiglia = String(famiglia || '').toLowerCase().trim()
  const isUtente = (m) => m.id === normFamiglia || m.famiglia.toLowerCase() === normFamiglia
  const defaultId = FAMIGLIE.find(isUtente)?.id || 'giallo'

  const [selectedId, setSelectedId] = useState(defaultId)
  const tabRefs = useRef([])
  const attiva = FAMIGLIE.find((m) => m.id === selectedId) || FAMIGLIE[0]

  const onKeyDown = (event, index) => {
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    let next = delta ? (index + delta + FAMIGLIE.length) % FAMIGLIE.length : null
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = FAMIGLIE.length - 1
    if (next === null) return
    event.preventDefault()
    setSelectedId(FAMIGLIE[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section aria-labelledby="parole-tst-title" className="parole-tst">
      <ReportPassageHeader step={step} title="Parole" titleVisuallyHidden titleId="parole-tst-title" />

      <div className="parole-lex" style={{ '--lex-colore': `var(--tst-family-${attiva.id})` }}>
        <div className="parole-lex__index" role="tablist" aria-orientation="vertical" aria-label="Famiglie emotive">
          {FAMIGLIE.map((m, index) => {
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
          <h3 className="parole-lex__title">{attiva.famiglia}</h3>
          <LessicoNature colorKey={attiva.id} />
        </div>
      </div>
    </section>
  )
}
