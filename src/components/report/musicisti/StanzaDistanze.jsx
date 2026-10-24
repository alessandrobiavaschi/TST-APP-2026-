import React, { useState } from 'react'
import { DISTANZE, TAPPE_DISTANZE } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'

const PER_FILE = Object.fromEntries(DISTANZE.map((d) => [d.file, d]))

/** Stanza delle distanze: cinque tappe, una alla volta, ognuna con due o tre intervalli. */
export default function StanzaDistanze({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const [tappa, setTappa] = useState(TAPPE_DISTANZE[0].titolo)
  const attuale = TAPPE_DISTANZE.find((t) => t.titolo === tappa)

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Le distanze</h1>
        <p>
          Due note che vibrano insieme: la più bassa resta ferma, l’altra sale. Il percorso va dal buio alla luce, in
          cinque tappe.
        </p>
      </header>

      <SchedeScorrevoli
        etichetta="Tappe"
        schede={TAPPE_DISTANZE.map((t) => ({ id: t.titolo, titolo: t.titolo }))}
        attiva={tappa}
        onCambia={setTappa}
      />

      <div className="stanza-riquadri" role="tabpanel">
        {attuale.file.map((file) => {
          const d = PER_FILE[file]
          const fam = d.famiglia ? FAMIGLIE_MUSICA[d.famiglia] : null
          return (
            <section
              key={file}
              className={`stanza-riquadro${d.famiglia && d.famiglia === famigliaPrevalente ? ' is-tua' : ''}`}
              data-famiglia={fam?.colorKey}
            >
              <h2>{d.nome}</h2>
              <p className="stanza-riquadro__dato">{d.semitoni} semitoni</p>
              {d.clima ? <p>{d.clima}</p> : null}
              {fam ? <p className="stanza-riquadro__famiglia">Vicina alla natura {d.natura} · {fam.nome}</p> : null}
              <BottoneSuono file={file} etichetta="Ascolta" fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
