import React, { useState } from 'react'
import { GRUPPI_TIMBRI, TIMBRI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA, NOMI_SUONI, ORDINE_FAMIGLIE } from '../../../content/musicistiStanze.js'

/** Stanza 3: atlante degli strumenti del test, filtrabile per famiglia. */
export default function StanzaTimbri({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const [filtro, setFiltro] = useState(famigliaPrevalente || null)
  const vicini = filtro ? new Set(TIMBRI_FAMIGLIA[filtro]?.file || []) : null

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>I timbri</h1>
        <p>Gli strumenti ascoltati nel test. Scegli una famiglia per vedere quelli a cui le fonti la avvicinano.</p>
      </header>

      <div className="stanza-filtri" role="group" aria-label="Famiglia">
        <button type="button" className="stanza-filtro" aria-pressed={!filtro} onClick={() => setFiltro(null)}>
          Tutti
        </button>
        {ORDINE_FAMIGLIE.map((k) => (
          <button
            key={k}
            type="button"
            className="stanza-filtro"
            data-famiglia={FAMIGLIE_MUSICA[k].colorKey}
            aria-pressed={filtro === k}
            onClick={() => setFiltro(k)}
          >
            {FAMIGLIE_MUSICA[k].nome}
          </button>
        ))}
      </div>
      {filtro ? <p className="stanza-generica__nota">{TIMBRI_FAMIGLIA[filtro]?.zona}</p> : null}

      {GRUPPI_TIMBRI.map((gruppo) => (
        <section key={gruppo.titolo} className="stanza-atlante">
          <h2>{gruppo.titolo}</h2>
          <div className="stanza-atlante__griglia">
            {gruppo.file.map((file) => {
              const acceso = !vicini || vicini.has(file)
              return (
                <button
                  key={file}
                  type="button"
                  className={`stanza-strumento${acceso ? '' : ' is-spento'}`}
                  data-famiglia={filtro && acceso ? FAMIGLIE_MUSICA[filtro].colorKey : undefined}
                  aria-pressed={fileInAscolto === file}
                  onClick={() => onAscolta(file)}
                >
                  <span aria-hidden="true">▶</span> {NOMI_SUONI[file]}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
