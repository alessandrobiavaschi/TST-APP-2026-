import React, { useMemo } from 'react'
import { SEZIONI, getPasso, getRegolePerPasso } from '../../../config/tstSistema.js'
import { percorsoRisposte } from '../../../utils/percorsoRisposte.js'
import { FAMIGLIE_MUSICA, NOMI_SUONI, ORDINE_FAMIGLIE } from '../../../content/musicistiStanze.js'

const COLORE_A_KEY = Object.fromEntries(ORDINE_FAMIGLIE.map((k) => [FAMIGLIE_MUSICA[k].colorKey, k]))

/** Testo della risposta come l'ha vista chi ha fatto il test (le affinità sono salvate come «opzioneN»). */
function etichettaRisposta(numero, risposta) {
  const regola = getRegolePerPasso(numero).find((r) => r.risposta === risposta)
  return regola?.suono || risposta
}

/**
 * Stanza delle scelte: i 72 passi divisi nelle 5 sezioni del test. Ogni sezione è
 * un riquadro chiuso con le famiglie raggiunte; l'elenco dei passi si apre su richiesta.
 */
export default function StanzaScelte({ rawRecord = {}, onAscolta, fileInAscolto }) {
  const percorso = useMemo(() => percorsoRisposte(rawRecord), [rawRecord])

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Le tue scelte nel test</h1>
        <p>Le cinque sezioni del test. Apri una sezione per rivedere i suoni e le risposte, uno per uno.</p>
      </header>
      <div className="stanza-riquadri">
        {SEZIONI.map((sez) => {
          const passi = percorso.slice(sez.da - 1, sez.a)
          const conteggi = {}
          passi.forEach((p) => { if (p?.famiglia) conteggi[p.famiglia] = (conteggi[p.famiglia] || 0) + 1 })
          const totale = Object.values(conteggi).reduce((a, b) => a + b, 0)
          return (
            <details key={sez.id} name="scelte" className="stanza-riquadro stanza-sezione">
              <summary>
                <span className="stanza-sezione__nome">{sez.nome}</span>
                <span className="stanza-riquadro__dato">{sez.a - sez.da + 1} ascolti</span>
                {totale ? (
                  <span className="stanza-sezione__barra" aria-hidden="true">
                    {ORDINE_FAMIGLIE.map((k) => {
                      const ck = FAMIGLIE_MUSICA[k].colorKey
                      return conteggi[ck] ? (
                        <span key={k} data-famiglia={ck} style={{ flexGrow: conteggi[ck] }} />
                      ) : null
                    })}
                  </span>
                ) : null}
              </summary>
              <ol className="stanza-passi">
                {Array.from({ length: sez.a - sez.da + 1 }, (_, i) => sez.da + i).map((n) => {
                  const p = percorso[n - 1]
                  const file = getPasso(n)?.audio || n
                  const risposta = String(rawRecord?.[`File_${String(n).padStart(2, '0')}`] || '').trim()
                  const fam = p?.famiglia ? FAMIGLIE_MUSICA[COLORE_A_KEY[p.famiglia]] : null
                  return (
                    <li key={n} data-famiglia={fam?.colorKey}>
                      <button
                        type="button"
                        className="stanza-passi__ascolta"
                        aria-pressed={fileInAscolto === file}
                        onClick={() => onAscolta(file)}
                        aria-label={`Ascolta ${NOMI_SUONI[file]}`}
                      >
                        ▶
                      </button>
                      <span className="stanza-passi__suono">{NOMI_SUONI[file]}</span>
                      <span className="stanza-passi__risposta">
                        {risposta ? etichettaRisposta(n, risposta) : '—'}
                        {fam ? <em> · {fam.nome}</em> : null}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </details>
          )
        })}
      </div>
    </div>
  )
}
