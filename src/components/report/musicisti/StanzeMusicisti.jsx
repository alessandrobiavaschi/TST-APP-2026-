import React, { useEffect, useRef, useState } from 'react'
import { AREE, FAMIGLIE_MUSICA, ORDINE_FAMIGLIE, STANZE } from '../../../content/musicistiStanze.js'
import PiantaStanze from './PiantaStanze.jsx'
import StanzaFamiglia from './StanzaFamiglia.jsx'
import StanzaScelte from './StanzaScelte.jsx'
import StanzaDistanze from './StanzaDistanze.jsx'
import StanzaTimbri from './StanzaTimbri.jsx'
import StanzaTempo from './StanzaTempo.jsx'
import StanzaMelodia from './StanzaMelodia.jsx'
import StanzaAscolto from './StanzaAscolto.jsx'
import StanzaGlossario from './StanzaGlossario.jsx'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'
import LettoreSuoni from './LettoreSuoni.jsx'
import './stanzeMusicisti.css'

const COMPONENTI = {
  scelte: StanzaScelte,
  distanze: StanzaDistanze,
  timbri: StanzaTimbri,
  tempo: StanzaTempo,
  melodia: StanzaMelodia,
  ascolto: StanzaAscolto,
  glossario: StanzaGlossario,
}
const STANZA_BY_ID = Object.fromEntries(STANZE.map((s) => [s.id, s]))
const areaDiStanza = (id) => AREE.find((a) => a.stanze.includes(id))

/**
 * For Musicians & Music Lovers: si apre sulla lettura della famiglia prevalente.
 * L'indice (quattro aree, ognuna con poche stanze) resta a un tocco dalla cornice fissa.
 * Senza famiglia prevalente si parte dall'indice. Lettore comune a tutte le stanze.
 */
export default function StanzeMusicisti({ famigliaPrevalente, accentColor, rawRecord, onClose, backButtonRef }) {
  const [vista, setVista] = useState(() =>
    famigliaPrevalente ? { area: areaDiStanza('famiglia')?.id || null, stanza: 'famiglia' } : { area: null, stanza: null },
  )
  const [famiglia, setFamiglia] = useState(famigliaPrevalente || ORDINE_FAMIGLIE[0])
  const [fileInAscolto, setFileInAscolto] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    rootRef.current?.closest('.report-tst-musicians-layer')?.scrollTo?.({ top: 0 })
  }, [vista, famiglia])

  const vai = (area, stanza = null) => {
    setFileInAscolto(null)
    setVista({ area, stanza })
  }
  const apriStanza = (id) => vai(areaDiStanza(id)?.id || null, id)

  const area = AREE.find((a) => a.id === vista.area) || null
  const Stanza = COMPONENTI[vista.stanza]
  const colore = vista.stanza === 'famiglia' ? `var(--tst-family-${FAMIGLIE_MUSICA[famiglia]?.colorKey})` : accentColor
  const props = { famigliaPrevalente, rawRecord, fileInAscolto, onAscolta: setFileInAscolto, onApri: apriStanza }

  return (
    <div ref={rootRef} className="stanze-musicisti" style={{ '--stanza-accento': colore }}>
      <nav className="stanze-cornice" aria-label="Navigazione">
        <div className="stanze-cornice__sinistra">
          {onClose ? (
            <button ref={backButtonRef} type="button" className="stanze-cornice__btn" onClick={onClose}>
              ← Report
            </button>
          ) : null}
          {vista.area ? (
            <button type="button" className="stanze-cornice__btn" onClick={() => vai(null)}>Indice</button>
          ) : null}
        </div>
        {vista.stanza && area && area.stanze.length > 1 ? (
          <div className="stanze-cornice__destra" role="group" aria-label={`Stanze di ${area.titolo}`}>
            {area.stanze.map((id) => (
              <button
                key={id}
                type="button"
                className="stanze-cornice__btn"
                aria-current={vista.stanza === id ? 'page' : undefined}
                onClick={() => vai(area.id, id)}
              >
                {STANZA_BY_ID[id].titolo}
              </button>
            ))}
          </div>
        ) : null}
      </nav>

      <div className="stanze-musicisti__contenuto">
        {vista.stanza === 'famiglia' ? (
          <>
            <div className="stanza-filtri--famiglie">
              <SchedeScorrevoli
                etichetta="Famiglia"
                schede={ORDINE_FAMIGLIE.map((k) => ({ id: k, titolo: FAMIGLIE_MUSICA[k].nome, colorKey: FAMIGLIE_MUSICA[k].colorKey }))}
                attiva={famiglia}
                onCambia={(k) => { setFileInAscolto(null); setFamiglia(k) }}
              />
            </div>
            <StanzaFamiglia famigliaKey={famiglia} onAscolta={setFileInAscolto} fileInAscolto={fileInAscolto} />
          </>
        ) : Stanza ? (
          <Stanza {...props} />
        ) : (
          <PiantaStanze
            area={area}
            famigliaPrevalente={famigliaPrevalente}
            onApriArea={(id) => {
              const a = AREE.find((x) => x.id === id)
              if (a.stanze.length === 1) vai(a.id, a.stanze[0])
              else vai(a.id)
            }}
            onApriStanza={apriStanza}
          />
        )}
      </div>

      <LettoreSuoni file={fileInAscolto} onClose={() => setFileInAscolto(null)} />
    </div>
  )
}
