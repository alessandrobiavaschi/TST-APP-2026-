import React, { useRef, useState } from 'react'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { FAMIGLIE_TST } from '../../content/paroleTst.js'
import SchedaParola from './parole/SchedaParola.jsx'
import { nomeNatura } from './parole/definizioneParola.js'
import './ParoleStatiAnimo.css'

// «Nero / Negativo» nel documento è una coppia: la mostro come due parole, come negli aggettivi.
const paroleChiave = (natura) => [...new Set((natura.paroleChiave || [])
  .flatMap((k) => (typeof k === 'string' ? k : k.parola).split('/').map((p) => p.trim()))
  .filter(Boolean))]
const tutteLeParole = (natura) => [...new Set([...(natura.aggettivi || []), ...(natura.sostantivi || [])])]

function Natura({ natura, aperte, onApri, onChiudi }) {
  const [tutte, setTutte] = useState(false)
  const ref = useRef(null)
  const chiave = paroleChiave(natura)
  const elenco = tutte ? tutteLeParole(natura) : chiave.length ? chiave : tutteLeParole(natura).slice(0, 8)
  const totale = tutteLeParole(natura).length
  const aperteQui = aperte.filter((p) => elenco.includes(p))

  return (
    <section ref={ref} className="parole-natura">
      <h4 className="parole-natura__nome">{nomeNatura(natura)}</h4>
      <ul className="parole-natura__parole">
        {elenco.map((parola) => (
          <li key={parola}>
            <button
              type="button"
              className="parole-parola"
              aria-expanded={aperte.includes(parola)}
              onClick={() => (aperte.includes(parola) ? onChiudi(parola) : onApri(parola))}
            >
              {parola}
            </button>
          </li>
        ))}
      </ul>
      {aperteQui.length ? (
        <div className="parole-natura__schede">
          {aperteQui.map((p) => <SchedaParola key={p} parola={p} onChiudi={() => onChiudi(p)} />)}
        </div>
      ) : null}
      {totale > elenco.length || tutte ? (
        <button type="button" className="parole-natura__altre" onClick={() => {
          // Richiudendo una lista lunga, riporto la vista all'inizio della natura.
          if (tutte) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          setTutte(!tutte)
        }}>
          {tutte ? 'Mostra solo le parole chiave' : `Mostra tutte le parole (${totale})`}
        </button>
      ) : null}
    </section>
  )
}

/**
 * Parole: le parole delle famiglie, dal lessico «Parole per TST».
 * Si parte dalle parole chiave; si possono aprire tutte le parole e aprire più
 * parole insieme, ognuna con famiglia, natura e link alla definizione.
 */
export default function ParoleStatiAnimo({ famiglia = '', step = '5' }) {
  const norm = String(famiglia || '').toLowerCase().trim()
  const tua = FAMIGLIE_TST.find((f) => f.colorKey === norm || f.nome.toLowerCase() === norm)
  const [colore, setColore] = useState(tua?.colorKey || FAMIGLIE_TST[0].colorKey)
  const [aperte, setAperte] = useState([])
  const attiva = FAMIGLIE_TST.find((f) => f.colorKey === colore) || FAMIGLIE_TST[0]

  const apri = (p) => setAperte((v) => (v.includes(p) ? v : [...v, p]))
  const chiudi = (p) => setAperte((v) => v.filter((x) => x !== p))

  return (
    <section aria-labelledby="parole-tst-title" className="parole-tst">
      <ReportPassageHeader step={step} title="Parole" titleVisuallyHidden titleId="parole-tst-title" />
      <div className="parole-famiglie" role="tablist" aria-label="Famiglie">
        {FAMIGLIE_TST.map((f) => (
          <button
            key={f.colorKey}
            type="button"
            role="tab"
            aria-selected={f.colorKey === attiva.colorKey}
            className="parole-famiglie__tab"
            data-famiglia={f.colorKey}
            onClick={() => { setColore(f.colorKey); setAperte([]) }}
          >
            {f.nome}
            {f === tua ? <span className="parole-famiglie__tua">la tua famiglia</span> : null}
          </button>
        ))}
      </div>
      <div className="parole-pannello" role="tabpanel" data-famiglia={attiva.colorKey}>
        <p className="parole-pannello__guida">Tocca una parola per vedere a quale natura appartiene e aprirne la definizione.</p>
        {attiva.nature.map((n) => (
          <Natura key={n.rawKey} natura={n} aperte={aperte} onApri={apri} onChiudi={chiudi} />
        ))}
      </div>
    </section>
  )
}
