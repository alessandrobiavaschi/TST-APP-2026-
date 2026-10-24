import React, { useEffect, useRef, useState } from 'react'
import { FAMIGLIE_MUSICA, ORDINE_FAMIGLIE } from '../../../content/musicistiStanze.js'
import PiantaStanze from './PiantaStanze.jsx'
import StanzaFamiglia from './StanzaFamiglia.jsx'
import LettoreSuoni from './LettoreSuoni.jsx'
import './stanzeMusicisti.css'

/**
 * Report per musicisti a stanze: una stanza alla volta, a schermo intero,
 * dentro una cornice fissa (ritorno, pianta, precedente/successiva) e un lettore comune.
 */
export default function StanzeMusicisti({ famigliaPrevalente, accentColor, onClose, backButtonRef }) {
  const [vista, setVista] = useState({ stanza: null, famiglia: null })
  const [fileInAscolto, setFileInAscolto] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    rootRef.current?.closest('.report-tst-musicians-layer')?.scrollTo?.({ top: 0 })
  }, [vista])

  const apri = (stanza, famiglia) => {
    setFileInAscolto(null)
    setVista({ stanza, famiglia })
  }
  const tornaPianta = () => apri(null, null)

  const indice = ORDINE_FAMIGLIE.indexOf(vista.famiglia)
  const precedente = indice > 0 ? ORDINE_FAMIGLIE[indice - 1] : null
  const successiva = indice >= 0 && indice < ORDINE_FAMIGLIE.length - 1 ? ORDINE_FAMIGLIE[indice + 1] : null
  const coloreFamiglia = vista.famiglia ? `var(--tst-family-${FAMIGLIE_MUSICA[vista.famiglia]?.colorKey})` : accentColor

  return (
    <div ref={rootRef} className="stanze-musicisti" style={{ '--stanza-accento': coloreFamiglia }}>
      <nav className="stanze-cornice" aria-label="Navigazione delle stanze">
        <div className="stanze-cornice__sinistra">
          {onClose ? (
            <button ref={backButtonRef} type="button" className="stanze-cornice__btn" onClick={onClose}>
              ← Report
            </button>
          ) : null}
          {vista.stanza ? (
            <button type="button" className="stanze-cornice__btn" onClick={tornaPianta}>
              Pianta delle stanze
            </button>
          ) : null}
        </div>
        {vista.stanza ? (
          <div className="stanze-cornice__destra">
            <button
              type="button"
              className="stanze-cornice__btn"
              disabled={!precedente}
              onClick={() => apri(vista.stanza, precedente)}
              aria-label={precedente ? `Famiglia ${FAMIGLIE_MUSICA[precedente].nome}` : 'Nessuna famiglia precedente'}
            >
              ←
            </button>
            <button
              type="button"
              className="stanze-cornice__btn"
              disabled={!successiva}
              onClick={() => apri(vista.stanza, successiva)}
              aria-label={successiva ? `Famiglia ${FAMIGLIE_MUSICA[successiva].nome}` : 'Nessuna famiglia successiva'}
            >
              →
            </button>
          </div>
        ) : null}
      </nav>

      <div className="stanze-musicisti__contenuto">
        {vista.stanza === 'famiglia' ? (
          <StanzaFamiglia famigliaKey={vista.famiglia} onAscolta={setFileInAscolto} fileInAscolto={fileInAscolto} />
        ) : (
          <PiantaStanze famigliaPrevalente={famigliaPrevalente} onApri={apri} />
        )}
      </div>

      <LettoreSuoni file={fileInAscolto} onClose={() => setFileInAscolto(null)} />
    </div>
  )
}
