import React, { useState } from 'react'
import { getFamigliaById } from '../../content/paroleTst.js'

/**
 * Contenuto di una natura nella stanza «Parole»: parole chiave con nota,
 * aggettivi/sostantivi/parole di sintesi (in formato chip) e parole collegate
 * alle altre famiglie (in chip cromatiche secondo la famiglia collegata).
 * Etichette e testi: solo dal PDF «Parole per TST».
 */

/** Le associazioni puntano a una famiglia per id; «malinconicaIntrospettiva» (Natura Solare) resta nella Malinconica. */
function colorKeyAssociazione(chiave) {
  const id = chiave === 'malinconicaIntrospettiva' ? 'malinconica' : chiave
  return getFamigliaById(id)?.colorKey || ''
}

function ElencoChips({ parole, colorVar = '--famiglia-colore' }) {
  if (!parole || parole.length === 0) return null
  return (
    <ul className="parole-tst__chips" style={{ '--chip-colore': `var(${colorVar})` }}>
      {parole.map((parola) => (
        <li key={parola} className="parole-tst__chip">
          {parola}
        </li>
      ))}
    </ul>
  )
}

export default function ParoleNatura({ natura, coloreFamiglia, colorePerChiave }) {
  const haPolo = Boolean(natura.poloPositivo)
  const [polo, setPolo] = useState('negativo')
  const [forma, setForma] = useState('aggettivi')
  const fonte = haPolo && polo === 'positivo' ? natura.poloPositivo : natura
  const paroleChiave = fonte.paroleChiave || []

  const elenco =
    (forma === 'aggettivi'
      ? fonte.aggettivi
      : forma === 'sostantivi'
        ? fonte.sostantivi
        : fonte.sostantiviSintesi) || []

  const associazioni = (natura.associazioniFonte || []).filter(
    (a) => (natura.associazioni?.[a.chiave] || []).length > 0,
  )

  const opzioniForma = [
    ['aggettivi', `Aggettivi (${fonte.aggettivi?.length || 0})`],
    ['sostantivi', `Sostantivi (${fonte.sostantivi?.length || 0})`],
  ]
  if (fonte.sostantiviSintesi?.length > 0) {
    opzioniForma.push(['sintesi', `Parole di sintesi (${fonte.sostantiviSintesi.length})`])
  }

  return (
    <div className="parole-tst__natura-corpo" style={{ '--famiglia-colore': coloreFamiglia }}>
      {haPolo ? (
        <div className="parole-tst__interruttore" role="group" aria-label="Polo">
          {[
            ['negativo', 'Verso il Negativo'],
            ['positivo', 'Verso il Positivo'],
          ].map(([id, etichetta]) => (
            <button key={id} type="button" aria-pressed={polo === id} onClick={() => setPolo(id)}>
              {etichetta}
            </button>
          ))}
        </div>
      ) : null}

      {paroleChiave.length > 0 ? (
        <div className="parole-tst__blocco">
          <h3 className="parole-tst__titoletto">Parole chiave</h3>
          <ul className="parole-tst__chiave">
            {paroleChiave.map((p) => (
              <li key={p.parola}>
                <span className="parole-tst__chiave-parola">{p.parola}</span>
                {p.nota ? <span className="parole-tst__chiave-nota">{p.nota}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="parole-tst__blocco">
        <div className="parole-tst__interruttore" role="group" aria-label="Forma delle parole">
          {opzioniForma.map(([id, etichetta]) => (
            <button key={id} type="button" aria-pressed={forma === id} onClick={() => setForma(id)}>
              {etichetta}
            </button>
          ))}
        </div>
        <ElencoChips parole={elenco} />
      </div>

      {associazioni.length > 0 ? (
        <div className="parole-tst__blocco">
          <h3 className="parole-tst__titoletto">Parole collegate alle altre famiglie</h3>
          <div className="parole-tst__associazioni">
            {associazioni.map((a) => (
              <div
                key={a.chiave}
                className="parole-tst__associazione"
                style={{ '--associazione-colore': colorePerChiave[colorKeyAssociazione(a.chiave)] }}
              >
                <p className="parole-tst__associazione-titolo">
                  <span aria-hidden="true" className="parole-tst__pallino parole-tst__pallino--associazione" />
                  {a.titolo}
                </p>
                {a.nota ? <p className="parole-tst__associazione-nota">({a.nota})</p> : null}
                <ElencoChips
                  parole={natura.associazioni[a.chiave]}
                  colorVar="--associazione-colore"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
