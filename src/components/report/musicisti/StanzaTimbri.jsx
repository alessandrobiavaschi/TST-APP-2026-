import React, { useState } from 'react'
import { GRUPPI_TIMBRI, TIMBRI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA, NOMI_SUONI, ORDINE_FAMIGLIE } from '../../../content/musicistiStanze.js'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'

/** Stanza dei timbri: un gruppo di strumenti alla volta, con la famiglia scelta evidenziata. */
export default function StanzaTimbri({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const [gruppo, setGruppo] = useState(GRUPPI_TIMBRI[0].titolo)
  const [famiglia, setFamiglia] = useState(famigliaPrevalente || 'Verde')
  const vicini = new Set(TIMBRI_FAMIGLIA[famiglia]?.file || [])
  const attuale = GRUPPI_TIMBRI.find((g) => g.titolo === gruppo)

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

      <SchedeScorrevoli
        etichetta="Gruppo di strumenti"
        schede={GRUPPI_TIMBRI.map((g) => ({ id: g.titolo, titolo: g.titolo }))}
        attiva={gruppo}
        onCambia={setGruppo}
      />
      <div className="stanza-atlante__griglia" role="tabpanel">
        {attuale.file.map((file) => {
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
    </div>
  )
}
