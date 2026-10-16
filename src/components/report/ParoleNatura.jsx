import React, { useState } from 'react'
import { getFamigliaById } from '../../content/paroleTst.js'

/**
 * Contenuto di una natura nella stanza «Parole»: parole chiave con nota,
 * aggettivi/sostantivi e parole collegate alle altre famiglie.
 * Etichette e testi: solo dal PDF «Parole per TST».
 */

/** Le associazioni puntano a una famiglia per id; «malinconicaIntrospettiva» (Natura Solare) resta nella Malinconica. */
function colorKeyAssociazione(chiave) {
  const id = chiave === 'malinconicaIntrospettiva' ? 'malinconica' : chiave
  return getFamigliaById(id)?.colorKey || ''
}

function Elenco({ parole }) {
  return <p className="parole-tst__elenco">{parole.join(' · ')}</p>
}

export default function ParoleNatura({ natura, coloreFamiglia, colorePerChiave }) {
  const haPolo = Boolean(natura.poloPositivo)
  const [polo, setPolo] = useState('negativo')
  const [forma, setForma] = useState('aggettivi')
  const fonte = haPolo && polo === 'positivo' ? natura.poloPositivo : natura
  const paroleChiave = fonte.paroleChiave || []
  const elenco = (forma === 'aggettivi' ? fonte.aggettivi : fonte.sostantivi) || []
  const associazioni = (natura.associazioniFonte || []).filter(
    (a) => (natura.associazioni?.[a.chiave] || []).length > 0,
  )

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
          {[
            ['aggettivi', 'Aggettivi'],
            ['sostantivi', 'Sostantivi'],
          ].map(([id, etichetta]) => (
            <button key={id} type="button" aria-pressed={forma === id} onClick={() => setForma(id)}>
              {etichetta}
            </button>
          ))}
        </div>
        <Elenco parole={elenco} />
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
                <Elenco parole={natura.associazioni[a.chiave]} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
