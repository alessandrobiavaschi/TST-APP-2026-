import React from 'react'
import { FASCE_TEMPO, GROOVE, RITMI } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'
import Finestra, { Finestre } from './Finestra.jsx'

const MIN = 50
const MAX = 170
const pos = (bpm) => `${((bpm - MIN) / (MAX - MIN)) * 100}%`
const TACCHE = [50, 70, 90, 110, 130, 150, 170]

/** Stanza del tempo: fasce di bpm, groove e ritmi del test, in tre finestre chiuse. */
export default function StanzaTempo({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Il tempo e il ritmo</h1>
        <p>Ogni famiglia tende ad accordarsi con una zona di velocità. Le fasce possono sovrapporsi.</p>
      </header>

      <Finestre>
        <Finestra titolo="Le fasce di velocità" nota="Da 50 a 170 bpm" gruppo="tempo">
          <div className="stanza-righello" role="img" aria-label="Fasce di bpm per famiglia, da 50 a 170">
            {FASCE_TEMPO.map((f) => {
              const fam = FAMIGLIE_MUSICA[f.famiglia]
              return (
                <div key={f.famiglia} className="stanza-righello__riga">
                  <span className={`stanza-righello__nome${f.famiglia === famigliaPrevalente ? ' is-tua' : ''}`}>{fam.nome}</span>
                  <div className="stanza-righello__binario">
                    <span
                      className="stanza-righello__fascia"
                      data-famiglia={fam.colorKey}
                      style={{ left: pos(f.da), width: `calc(${pos(f.a)} - ${pos(f.da)})` }}
                      title={f.nota}
                    />
                  </div>
                </div>
              )
            })}
            <div className="stanza-righello__riga">
              <span className="stanza-righello__nome" />
              <div className="stanza-righello__tacche">
                {TACCHE.map((t) => (
                  <span key={t} style={{ left: pos(t) }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <ul className="stanza-generica__elenco">
            {FASCE_TEMPO.map((f) => (
              <li key={f.famiglia}><b>{FAMIGLIE_MUSICA[f.famiglia].nome}</b>: {f.nota}.</li>
            ))}
          </ul>
        </Finestra>

        <Finestra titolo="I groove del test" nota={`${GROOVE.length} ascolti`} gruppo="tempo">
          <div className="stanza-famiglia__suoni">
            {GROOVE.map((g) => (
              <BottoneSuono key={g.file} file={g.file} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
            ))}
          </div>
        </Finestra>
        <Finestra titolo="I ritmi del test" nota={`${RITMI.length} ascolti`} gruppo="tempo">
          <div className="stanza-famiglia__suoni">
            {RITMI.map((file) => (
              <BottoneSuono key={file} file={file} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
            ))}
          </div>
        </Finestra>
      </Finestre>
    </div>
  )
}
