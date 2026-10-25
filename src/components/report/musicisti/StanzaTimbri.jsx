import React, { useState } from 'react'
import { GRUPPI_TIMBRI, TIMBRI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA, NOMI_SUONI, ORDINE_FAMIGLIE } from '../../../content/musicistiStanze.js'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'
import Finestra, { Finestre } from './Finestra.jsx'

/** Stanza dei timbri: tre gruppi di strumenti chiusi, con la famiglia scelta evidenziata. */
export default function StanzaTimbri({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const [famiglia, setFamiglia] = useState(famigliaPrevalente || 'Verde')
  const vicini = new Set(TIMBRI_FAMIGLIA[famiglia]?.file || [])

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>I timbri</h1>
        <p>Gli strumenti ascoltati nel test. Scegli una famiglia: si illuminano quelli a cui tende ad avvicinarsi.</p>
      </header>

      <SchedeScorrevoli
        etichetta="Famiglia"
        schede={ORDINE_FAMIGLIE.map((k) => ({ id: k, titolo: FAMIGLIE_MUSICA[k].nome, colorKey: FAMIGLIE_MUSICA[k].colorKey }))}
        attiva={famiglia}
        onCambia={setFamiglia}
      />
      <p className="stanza-generica__nota">{TIMBRI_FAMIGLIA[famiglia]?.zona}</p>

      <Finestre>
        {GRUPPI_TIMBRI.map((g) => {
          const accesi = g.file.filter((f) => vicini.has(f)).length
          return (
            <Finestra
              key={g.titolo}
              titolo={g.titolo}
              nota={accesi ? `${accesi} vicini alla famiglia ${FAMIGLIE_MUSICA[famiglia].nome}` : `${g.file.length} strumenti`}
              gruppo="timbri"
            >
              <div className="stanza-atlante__griglia">
                {g.file.map((file) => {
                  const acceso = vicini.has(file)
                  return (
                    <button
                      key={file}
                      type="button"
                      className={`stanza-strumento${acceso ? '' : ' is-spento'}`}
                      data-famiglia={acceso ? FAMIGLIE_MUSICA[famiglia].colorKey : undefined}
                      aria-pressed={fileInAscolto === file}
                      onClick={() => onAscolta(file)}
                    >
                      <span aria-hidden="true">▶</span> {NOMI_SUONI[file]}
                    </button>
                  )
                })}
              </div>
            </Finestra>
          )
        })}
      </Finestre>
    </div>
  )
}
