import React, { useMemo } from 'react'
import { AFFINITA_PER_PASSO, NATURA_BY_ID } from '../../../config/tstSistema.js'
import { FAMIGLIE_MUSICA, NOMI_SUONI } from '../../../content/musicistiStanze.js'

/** Scelte di preferenza del test che danno un punto alla famiglia (dalla fonte unica del punteggio). */
function scelteNelTest(colorKey) {
  const righe = []
  Object.entries(AFFINITA_PER_PASSO).forEach(([passo, opzioni]) => {
    opzioni
      .filter((o) => NATURA_BY_ID[o.natura]?.colorKey === colorKey)
      .forEach((o) => righe.push({ passo: Number(passo), suono: o.suono }))
  })
  const base = righe.filter((r) => r.passo <= 4)
  const resto = righe.filter((r) => r.passo > 4)
  const unite = []
  if (base.length) {
    const nomi = [...new Set(base.map((r) => r.suono))]
    const passi = base.map((r) => r.passo)
    unite.push({
      chiave: 'base',
      suono: nomi.join(', '),
      passi: passi.length > 1 ? `passi ${Math.min(...passi)}–${Math.max(...passi)}` : `passo ${passi[0]}`,
    })
  }
  resto.forEach((r) => unite.push({ chiave: `${r.passo}-${r.suono}`, suono: r.suono, passi: `passo ${r.passo}` }))
  return unite
}

export default function StanzaFamiglia({ famigliaKey, onAscolta, fileInAscolto }) {
  const famiglia = FAMIGLIE_MUSICA[famigliaKey]
  const scelte = useMemo(() => scelteNelTest(famiglia?.colorKey), [famiglia])
  if (!famiglia) return null

  return (
    <article className="stanza-famiglia" data-famiglia={famiglia.colorKey}>
      <header className="stanza-famiglia__apertura">
        <h1 className="stanza-famiglia__titolo">
          La famiglia {famiglia.nome} <em>nella musica</em>
        </h1>
        <p className="stanza-famiglia__lead">{famiglia.apertura}</p>
      </header>

      <div className="stanza-famiglia__corpo">
        <div className="stanza-famiglia__testo">
          {famiglia.sezioni.map((sezione) => (
            <section key={sezione.titolo} className="stanza-famiglia__sezione">
              <h2>{sezione.titolo}</h2>
              <p>{sezione.testo}</p>
              {sezione.suoni.length ? (
                <div className="stanza-famiglia__suoni">
                  {sezione.suoni.map((file) => (
                    <button
                      key={file}
                      type="button"
                      className="stanza-suono"
                      aria-pressed={fileInAscolto === file}
                      onClick={() => onAscolta(file)}
                    >
                      <span aria-hidden="true">▶</span> {NOMI_SUONI[file]}
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {scelte.length ? (
          <aside className="stanza-famiglia__test" aria-label="Nel test">
            <h2>Nel test</h2>
            <p>Le scelte che danno un punto a questa famiglia.</p>
            <ul>
              {scelte.map((s) => (
                <li key={s.chiave}>
                  <span>{s.suono}</span>
                  <span className="stanza-famiglia__passo">{s.passi}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </article>
  )
}
