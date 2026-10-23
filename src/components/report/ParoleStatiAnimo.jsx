import React, { useEffect, useMemo, useState } from 'react'
import { PAROLE_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import ParoleNatura from './ParoleNatura.jsx'
import { FAMIGLIE_TST } from '../../content/paroleTst.js'
import { NATURE } from '../../config/tstSistema.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import './ParoleStatiAnimo.css'

/**
 * Stanza 05 — Parole.
 * Tutti i testi visibili vengono da «Parole per TST» (content/paroleTst.js):
 * famiglia → natura → parole chiave, aggettivi/sostantivi/sintesi in chip, parole collegate alle altre famiglie.
 * La famiglia e la natura prevalenti della persona sono segnalate graficamente.
 */

const COLORE_PER_CHIAVE = Object.fromEntries(Object.values(FAMILY_THEME).map((t) => [t.key, t.dot]))

/** Il report passa la famiglia come etichetta colore ('Rosso') e la natura come nome maiuscolo ('VOLITIVA'). */
function rawKeyNaturaPrevalente(naturaPrevalente) {
  const nome = String(naturaPrevalente || '').trim().toUpperCase()
  if (!nome) return ''
  return NATURE.find((n) => n.nome.toUpperCase() === nome)?.campoDb || ''
}

function naturaIniziale(fam, rawKey) {
  return fam?.nature.find((n) => n.rawKey === rawKey)?.rawKey || fam?.nature[0]?.rawKey || ''
}

export default function ParoleStatiAnimo({ famiglia = '', naturaPrevalente = '', step = '5' }) {
  const colorKeyPrevalente = String(famiglia || '').trim().toLowerCase()
  const rawKeyPrevalente = rawKeyNaturaPrevalente(naturaPrevalente)

  const famiglie = useMemo(() => {
    const prima = FAMIGLIE_TST.filter((f) => f.colorKey === colorKeyPrevalente)
    return [...prima, ...FAMIGLIE_TST.filter((f) => f.colorKey !== colorKeyPrevalente)]
  }, [colorKeyPrevalente])

  const [famigliaId, setFamigliaId] = useState(famiglie[0]?.id || '')
  const [naturaKey, setNaturaKey] = useState(() => naturaIniziale(famiglie[0], rawKeyPrevalente))

  useEffect(() => {
    if (colorKeyPrevalente) {
      const prima = FAMIGLIE_TST.find((f) => f.colorKey === colorKeyPrevalente)
      if (prima) {
        setFamigliaId(prima.id)
        setNaturaKey(naturaIniziale(prima, rawKeyPrevalente))
      }
    }
  }, [colorKeyPrevalente, rawKeyPrevalente])

  const famigliaAttiva = famiglie.find((f) => f.id === famigliaId) || famiglie[0]
  const naturaAttiva =
    famigliaAttiva?.nature.find((n) => n.rawKey === naturaKey) || famigliaAttiva?.nature[0]

  const scegliFamiglia = (fam) => {
    setFamigliaId(fam.id)
    setNaturaKey(naturaIniziale(fam, rawKeyPrevalente))
  }

  if (!famigliaAttiva) return null

  return (
    <section aria-labelledby="parole-tst-title" className="parole-tst">
      <ReportPassageHeader
        step={step}
        title={PAROLE_UI.title}
        titleVisuallyHidden
        titleId="parole-tst-title"
      />

      <div role="tablist" aria-label="Famiglie" className="parole-tst__famiglie">
        {famiglie.map((fam) => {
          const attiva = fam.id === famigliaAttiva.id
          const prevalente = fam.colorKey === colorKeyPrevalente
          return (
            <button
              key={fam.id}
              type="button"
              role="tab"
              aria-selected={attiva}
              className="parole-tst__famiglia"
              style={{ '--famiglia-colore': COLORE_PER_CHIAVE[fam.colorKey] }}
              onClick={() => scegliFamiglia(fam)}
            >
              <span
                aria-hidden="true"
                className={`parole-tst__pallino${prevalente ? ' parole-tst__pallino--prevalente' : ''}`}
              />
              {fam.nome}
              {prevalente ? <span className="sr-only"> (famiglia prevalente)</span> : null}
            </button>
          )
        })}
      </div>

      <div className="parole-tst__nature" role="tablist" aria-label="Nature">
        {famigliaAttiva.nature.map((n) => {
          const attiva = n.rawKey === naturaAttiva.rawKey
          const prevalente = n.rawKey === rawKeyPrevalente
          return (
            <button
              key={n.rawKey}
              type="button"
              role="tab"
              aria-selected={attiva}
              className="parole-tst__natura"
              style={{ '--famiglia-colore': COLORE_PER_CHIAVE[famigliaAttiva.colorKey] }}
              onClick={() => setNaturaKey(n.rawKey)}
            >
              <span className="parole-tst__natura-nome">
                {prevalente ? (
                  <span aria-hidden="true" className="parole-tst__pallino parole-tst__pallino--prevalente" />
                ) : null}
                {n.nome}
                {prevalente ? <span className="sr-only"> (natura prevalente)</span> : null}
              </span>
              {n.sottotitoloFonte ? (
                <span className="parole-tst__natura-sotto">{n.sottotitoloFonte}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      <ParoleNatura
        key={naturaAttiva.rawKey}
        natura={naturaAttiva}
        coloreFamiglia={COLORE_PER_CHIAVE[famigliaAttiva.colorKey]}
        colorePerChiave={COLORE_PER_CHIAVE}
      />
    </section>
  )
}
