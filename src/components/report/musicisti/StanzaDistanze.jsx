import React from 'react'
import { DISTANZE } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'

/** Stanza 2: una scala da salire, dall'ottava in alto all'unisono in basso. */
export default function StanzaDistanze({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const gradini = [...DISTANZE].reverse()
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Le distanze</h1>
        <p>
          Due note che vibrano insieme: la più bassa resta ferma, l’altra sale. A ogni gradino il clima può cambiare,
          dal buio della seconda alla luce dell’ottava.
        </p>
      </header>
      <ol className="stanza-scala">
        {gradini.map((g) => {
          const fam = g.famiglia ? FAMIGLIE_MUSICA[g.famiglia] : null
          const tua = g.famiglia && g.famiglia === famigliaPrevalente
          return (
            <li
              key={g.file}
              className={`stanza-scala__gradino${tua ? ' is-tua' : ''}`}
              data-famiglia={fam?.colorKey}
            >
              <span className="stanza-scala__semitoni" aria-label={`${g.semitoni} semitoni`}>{g.semitoni}</span>
              <div className="stanza-scala__testo">
                <h2>{g.nome}</h2>
                {g.clima ? <p>{g.clima}</p> : null}
                {fam ? <p className="stanza-scala__natura">Vicina alla natura {g.natura} · {fam.nome}</p> : null}
              </div>
              <BottoneSuono file={g.file} etichetta="Ascolta" fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
