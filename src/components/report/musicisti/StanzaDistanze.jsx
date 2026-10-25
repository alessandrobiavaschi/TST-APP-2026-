import React from 'react'
import { DISTANZE, TAPPE_DISTANZE } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'
import Finestra, { Finestre } from './Finestra.jsx'

const PER_FILE = Object.fromEntries(DISTANZE.map((d) => [d.file, d]))

/** Stanza delle distanze: cinque tappe chiuse, ognuna con due o tre intervalli. */
export default function StanzaDistanze({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Le distanze</h1>
        <p>
          Due note che vibrano insieme: la più bassa resta ferma, l’altra sale. Il percorso va dal buio alla luce, in
          cinque tappe.
        </p>
      </header>

      <Finestre>
        {TAPPE_DISTANZE.map((tappa) => {
          const voci = tappa.file.map((f) => PER_FILE[f])
          const tua = voci.some((d) => d.famiglia && d.famiglia === famigliaPrevalente)
          return (
            <Finestra
              key={tappa.titolo}
              titolo={tappa.titolo}
              nota={voci.map((d) => d.nome).join(' · ')}
              gruppo="distanze"
              tua={tua}
              famiglia={tua ? FAMIGLIE_MUSICA[famigliaPrevalente]?.colorKey : undefined}
            >
              <div className="stanza-riquadri">
                {voci.map((d) => {
                  const fam = d.famiglia ? FAMIGLIE_MUSICA[d.famiglia] : null
                  return (
                    <section
                      key={d.file}
                      className={`stanza-riquadro${d.famiglia && d.famiglia === famigliaPrevalente ? ' is-tua' : ''}`}
                      data-famiglia={fam?.colorKey}
                    >
                      <h2>{d.nome}</h2>
                      <p className="stanza-riquadro__dato">{d.semitoni} semitoni</p>
                      {d.clima ? <p>{d.clima}</p> : null}
                      {fam ? <p className="stanza-riquadro__famiglia">Vicina alla natura {d.natura} · {fam.nome}</p> : null}
                      <BottoneSuono file={d.file} etichetta="Ascolta" fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
                    </section>
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
