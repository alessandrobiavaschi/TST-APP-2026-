import React, { useEffect, useRef, useState } from 'react'
import { FAMIGLIE_MUSICA, ORDINE_FAMIGLIE, STANZE } from '../../../content/musicistiStanze.js'
import PiantaStanze from './PiantaStanze.jsx'
import StanzaFamiglia from './StanzaFamiglia.jsx'
import StanzaDistanze from './StanzaDistanze.jsx'
import StanzaTimbri from './StanzaTimbri.jsx'
import StanzaTempo from './StanzaTempo.jsx'
import StanzaMelodia from './StanzaMelodia.jsx'
import StanzaAscolto from './StanzaAscolto.jsx'
import StanzaGlossario from './StanzaGlossario.jsx'
import LettoreSuoni from './LettoreSuoni.jsx'
import './stanzeMusicisti.css'

const COMPONENTI = {
  distanze: StanzaDistanze,
  timbri: StanzaTimbri,
  tempo: StanzaTempo,
  melodia: StanzaMelodia,
  ascolto: StanzaAscolto,
  glossario: StanzaGlossario,
}

/**
 * Report per musicisti a stanze: una stanza alla volta, a schermo intero,
 * dentro una cornice fissa (ritorno, pianta, stanza precedente/successiva) e un lettore comune.
 */
export default function StanzeMusicisti({ famigliaPrevalente, accentColor, onClose, backButtonRef }) {
  const [stanza, setStanza] = useState(null)
  const [famiglia, setFamiglia] = useState(famigliaPrevalente || ORDINE_FAMIGLIE[0])
  const [fileInAscolto, setFileInAscolto] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    rootRef.current?.closest('.report-tst-musicians-layer')?.scrollTo?.({ top: 0 })
  }, [stanza, famiglia])

  const apri = (id) => {
    setFileInAscolto(null)
    setStanza(id)
  }

  const indice = STANZE.findIndex((s) => s.id === stanza)
  const precedente = indice > 0 ? STANZE[indice - 1] : null
  const successiva = indice >= 0 && indice < STANZE.length - 1 ? STANZE[indice + 1] : null
  const colore = stanza === 'famiglia' ? `var(--tst-family-${FAMIGLIE_MUSICA[famiglia]?.colorKey})` : accentColor
  const Stanza = COMPONENTI[stanza]
  const props = { famigliaPrevalente, fileInAscolto, onAscolta: setFileInAscolto, onApri: apri }

  return (
    <div ref={rootRef} className="stanze-musicisti" style={{ '--stanza-accento': colore }}>
      <nav className="stanze-cornice" aria-label="Navigazione delle stanze">
        <div className="stanze-cornice__sinistra">
          {onClose ? (
            <button ref={backButtonRef} type="button" className="stanze-cornice__btn" onClick={onClose}>
              ← Report
            </button>
          ) : null}
          {stanza ? (
            <button type="button" className="stanze-cornice__btn" onClick={() => apri(null)}>
              Pianta delle stanze
            </button>
          ) : null}
        </div>
        {stanza ? (
          <div className="stanze-cornice__destra">
            <button
              type="button"
              className="stanze-cornice__btn"
              disabled={!precedente}
              onClick={() => apri(precedente.id)}
              aria-label={precedente ? `Stanza precedente: ${precedente.titolo}` : 'Nessuna stanza precedente'}
            >
              ←
            </button>
            <button
              type="button"
              className="stanze-cornice__btn"
              disabled={!successiva}
              onClick={() => apri(successiva.id)}
              aria-label={successiva ? `Stanza successiva: ${successiva.titolo}` : 'Nessuna stanza successiva'}
            >
              →
            </button>
          </div>
        ) : null}
      </nav>

      <div className="stanze-musicisti__contenuto">
        {stanza === 'famiglia' ? (
          <>
            <div className="stanza-filtri stanza-filtri--famiglie" role="group" aria-label="Famiglia">
              {ORDINE_FAMIGLIE.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="stanza-filtro"
                  data-famiglia={FAMIGLIE_MUSICA[k].colorKey}
                  aria-pressed={famiglia === k}
                  onClick={() => { setFileInAscolto(null); setFamiglia(k) }}
                >
                  {FAMIGLIE_MUSICA[k].nome}
                </button>
              ))}
            </div>
            <StanzaFamiglia famigliaKey={famiglia} onAscolta={setFileInAscolto} fileInAscolto={fileInAscolto} />
          </>
        ) : Stanza ? (
          <Stanza {...props} />
        ) : (
          <PiantaStanze famigliaPrevalente={famigliaPrevalente} onApri={apri} />
        )}
      </div>

      <LettoreSuoni file={fileInAscolto} onClose={() => setFileInAscolto(null)} />
    </div>
  )
}
