import React, { useMemo, useRef, useState } from 'react'
import {
  computeScoreDeltaForAnswer,
  getQuestionGroupForFile,
  getLogicTypeForFile,
} from '../../testLogic.js'
import { useAuth } from '../../AuthContext.jsx'

const SECTION_DEFS = [
  { key: 'A_TIMBRO', label: 'Timbro', from: 1, to: 28 },
  { key: 'B_INTERVALLI', label: 'Intervalli', from: 29, to: 41 },
  { key: 'C_RITMO', label: 'Ritmo', from: 42, to: 51 },
  { key: 'D_MELODIA', label: 'Melodia', from: 52, to: 58 },
  { key: 'E_ARMONIA', label: 'Armonia', from: 59, to: 72 },
]

const CORRENTE_ROWS = [
  { key: 'BLU_1_Depressiva', label: 'BLU_1 - Depressiva' },
  { key: 'BLU_2_Lunare', label: 'BLU_2 - Lunare' },
  { key: 'BLU_3_Nostalgia', label: 'BLU_3 - Nostalgia' },
  { key: 'BLU_4_Solare', label: 'BLU_4 - Solare' },
  { key: 'ROSSO_1_Assertivita', label: 'ROSSO_1 - Assertività' },
  { key: 'ROSSO_2_Dubbio_Collera', label: 'ROSSO_2 - Dubbio/Collera' },
  { key: 'VERDE_1_Calma', label: 'VERDE_1 - Calma' },
  { key: 'GIALLO_1_Gioia_Entusiasmo', label: 'GIALLO_1 - Gioia/Entusiasmo' },
  { key: 'GIALLO_2_Volitivo_Passionale', label: 'GIALLO_2 - Volitivo/Passionale' },
  { key: 'GRIGIO_1_Distaccato_Nichilista', label: 'GRIGIO_1 - Distaccato/Nichilista' },
  { key: 'GRIGIO_2_Intellettuale_Saggio', label: 'GRIGIO_2 - Intellettuale/Saggio' },
]

const PORTATO_ROWS = [
  { key: 'PE_Simpatia', label: 'Simpatia' },
  { key: 'PE_Antipatia', label: 'Antipatia' },
  { key: 'PE_Indifferenza', label: 'Indifferenza' },
]

const DISPOSIZIONI_ROWS = [
  { key: 'blu', label: 'Malinconia' },
  { key: 'rosso', label: 'Volitività' },
  { key: 'verde', label: 'Calma' },
  { key: 'giallo', label: 'Entusiasmo' },
  { key: 'grigio', label: 'Anaffettività' },
]

const SECTION_COLORS = {
  Timbro: { border: '#60a5fa', bg: '#eff6ff' },
  Intervalli: { border: '#a78bfa', bg: '#f5f3ff' },
  Ritmo: { border: '#f87171', bg: '#fef2f2' },
  Melodia: { border: '#4ade80', bg: '#f0fdf4' },
  Armonia: { border: '#facc15', bg: '#fefce8' },
}

const TABLES_GROUPS = [
  { key: 'risposte', label: 'Tabelle risposte per sezione', color: '#0ea5e9', bg: '#f0f9ff' },
  { key: 'risultati', label: 'Tabelle risultati per sezione', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'rapporti', label: 'Tabelle rapporti e confronto backend', color: '#f59e0b', bg: '#fffbeb' },
]

const ADVANCED_OPERATOR_KEY_STORAGE = 'tst_operator_advanced_data_unlocked'
const OPERATOR_ADVANCED_KEY = String(import.meta.env.VITE_OPERATOR_ADVANCED_REPORT_KEY || '').trim()

function emptyColorTotals() {
  return { blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }
}

function emptyCorrentiTotals() {
  return CORRENTE_ROWS.reduce((acc, item) => {
    acc[item.key] = 0
    return acc
  }, {})
}

function emptyPortatoTotals() {
  return PORTATO_ROWS.reduce((acc, item) => {
    acc[item.key] = 0
    return acc
  }, {})
}

function getSectionForFile(fileNumber) {
  for (const section of SECTION_DEFS) {
    if (fileNumber >= section.from && fileNumber <= section.to) return section
  }
  return null
}

function correnteToColorKey(correnteKey) {
  if (!correnteKey) return null
  if (correnteKey.startsWith('BLU_')) return 'blu'
  if (correnteKey.startsWith('ROSSO_')) return 'rosso'
  if (correnteKey.startsWith('VERDE_')) return 'verde'
  if (correnteKey.startsWith('GIALLO_')) return 'giallo'
  if (correnteKey.startsWith('GRIGIO_')) return 'grigio'
  return null
}

function normalizeLevels(totals) {
  const values = Object.values(totals)
  const max = Math.max(...values, 0)
  const result = {}
  Object.entries(totals).forEach(([key, value]) => {
    if (max <= 0 || value <= 0) {
      result[key] = 1
      return
    }
    const scaled = Math.round((value / max) * 7)
    result[key] = Math.min(7, Math.max(1, scaled))
  })
  return result
}

function formatLogic(logicType) {
  if (logicType === 'DIZIONARIO_1') return 'Dizionario 1'
  if (logicType === 'DIZIONARIO_2') return 'Dizionario 2'
  if (logicType === 'AFFINITA_BASE') return 'Affinità base'
  if (logicType === 'AFFINITA_ECCEZIONE') return 'Affinità eccezione'
  if (logicType === 'AFFINITA_STANDARD') return 'Affinità standard'
  return '—'
}

function formatAffinitaAnswer(rawAnswer) {
  if (!rawAnswer) return '—'
  if (rawAnswer === 'nessuna') return 'Nessuna delle 4'
  if (rawAnswer.startsWith('opzione')) {
    const number = rawAnswer.replace('opzione', '')
    return `Suono ${number}`
  }
  return rawAnswer
}

function sumSections(sectionTotalsByKey, keys) {
  const out = emptyColorTotals()
  keys.forEach((sectionKey) => {
    const values = sectionTotalsByKey[sectionKey]
    if (!values) return
    out.blu += values.blu
    out.rosso += values.rosso
    out.verde += values.verde
    out.giallo += values.giallo
    out.grigio += values.grigio
  })
  return out
}

function buildTablesData(rawRecord = {}) {
  const sections = SECTION_DEFS.reduce((acc, section) => {
    acc[section.key] = {
      ...section,
      responses: [],
      correntiTotals: emptyCorrentiTotals(),
      portatoTotals: emptyPortatoTotals(),
      disposizioniTotals: emptyColorTotals(),
    }
    return acc
  }, {})

  for (let fileNumber = 1; fileNumber <= 72; fileNumber += 1) {
    const section = getSectionForFile(fileNumber)
    if (!section) continue

    const fileKey = `File_${String(fileNumber).padStart(2, '0')}`
    const rawAnswer = rawRecord[fileKey]
    const logicType = getLogicTypeForFile(fileNumber)
    const group = getQuestionGroupForFile(fileNumber)
    const isAffinita = String(logicType || '').startsWith('AFFINITA')
    const isConfirmation = group === 'C_BIS'

    const params = {
      fileNumber,
      isConfirmation,
    }
    if (isAffinita) {
      params.affinitaOptionId = rawAnswer
    } else {
      params.answerLabel = rawAnswer
    }

    const delta = rawAnswer ? computeScoreDeltaForAnswer(params) : {}
    const deltaCorrenti = []
    const deltaPortato = []

    Object.entries(delta).forEach(([key, value]) => {
      if (CORRENTE_ROWS.some((entry) => entry.key === key)) {
        sections[section.key].correntiTotals[key] += value
        const colorKey = correnteToColorKey(key)
        if (colorKey) sections[section.key].disposizioniTotals[colorKey] += value
        deltaCorrenti.push(`${key}: ${value > 0 ? '+' : ''}${value}`)
      } else if (PORTATO_ROWS.some((entry) => entry.key === key)) {
        sections[section.key].portatoTotals[key] += value
        deltaPortato.push(`${key}: ${value > 0 ? '+' : ''}${value}`)
      }
    })

    sections[section.key].responses.push({
      fileNumber,
      fileKey,
      group,
      logicType: formatLogic(logicType),
      answer: isAffinita ? formatAffinitaAnswer(rawAnswer) : rawAnswer || '—',
      deltaCorrenti: deltaCorrenti.length ? deltaCorrenti.join(' | ') : '—',
      deltaPortato: deltaPortato.length ? deltaPortato.join(' | ') : '—',
    })
  }

  const sectionDisposizioniTotals = SECTION_DEFS.reduce((acc, section) => {
    acc[section.key] = sections[section.key].disposizioniTotals
    return acc
  }, {})

  const rapporti = {
    natura: sumSections(sectionDisposizioniTotals, ['A_TIMBRO', 'B_INTERVALLI', 'E_ARMONIA']),
    se: sumSections(sectionDisposizioniTotals, ['B_INTERVALLI', 'D_MELODIA']),
    altro: sumSections(sectionDisposizioniTotals, ['A_TIMBRO', 'D_MELODIA']),
    agire: sumSections(sectionDisposizioniTotals, ['C_RITMO', 'D_MELODIA']),
  }

  const replayTotals = {
    correnti: emptyCorrentiTotals(),
    portato: emptyPortatoTotals(),
  }

  SECTION_DEFS.forEach((section) => {
    CORRENTE_ROWS.forEach((entry) => {
      replayTotals.correnti[entry.key] += sections[section.key].correntiTotals[entry.key]
    })
    PORTATO_ROWS.forEach((entry) => {
      replayTotals.portato[entry.key] += sections[section.key].portatoTotals[entry.key]
    })
  })

  const savedTotals = {
    correnti: CORRENTE_ROWS.reduce((acc, entry) => {
      acc[entry.key] = Number(rawRecord[entry.key]) || 0
      return acc
    }, {}),
    portato: PORTATO_ROWS.reduce((acc, entry) => {
      acc[entry.key] = Number(rawRecord[entry.key]) || 0
      return acc
    }, {}),
  }

  return {
    sections,
    rapporti,
    rapportiLevels: {
      natura: normalizeLevels(rapporti.natura),
      se: normalizeLevels(rapporti.se),
      altro: normalizeLevels(rapporti.altro),
      agire: normalizeLevels(rapporti.agire),
    },
    replayTotals,
    savedTotals,
  }
}

function DiffCell({ saved, replayed }) {
  const diff = saved - replayed
  const className = diff === 0 ? 'is-zero' : diff > 0 ? 'is-positive' : 'is-negative'
  return <span className={`report-data-diff ${className}`}>{diff > 0 ? `+${diff}` : diff}</span>
}

export default function ReportDataTablesSection({ rawRecord }) {
  const currentUser = useAuth()
  const rootRef = useRef(null)
  const data = useMemo(() => buildTablesData(rawRecord || {}), [rawRecord])
  const [operatorKey, setOperatorKey] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [allOpen, setAllOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return window.sessionStorage.getItem(ADVANCED_OPERATOR_KEY_STORAGE) === '1'
    } catch {
      return false
    }
  })
  const isKeyConfigured = OPERATOR_ADVANCED_KEY.length > 0
  const hasAdvancedAccess = Boolean(currentUser) && isUnlocked

  const lockAdvancedData = () => {
    setIsUnlocked(false)
    setOperatorKey('')
    setUnlockError('')
    try {
      window.sessionStorage.removeItem(ADVANCED_OPERATOR_KEY_STORAGE)
    } catch {
      // ignore
    }
  }

  const handleUnlock = (event) => {
    event.preventDefault()
    setUnlockError('')
    if (!currentUser) {
      setUnlockError('Per visualizzare i dati avanzati devi accedere come operatore.')
      return
    }
    if (!isKeyConfigured) {
      setUnlockError('Chiave operatore non configurata. Imposta VITE_OPERATOR_ADVANCED_REPORT_KEY nel file .env.')
      return
    }
    if (operatorKey.trim() !== OPERATOR_ADVANCED_KEY) {
      setUnlockError('Chiave non valida.')
      return
    }
    setIsUnlocked(true)
    setOperatorKey('')
    try {
      window.sessionStorage.setItem(ADVANCED_OPERATOR_KEY_STORAGE, '1')
    } catch {
      // ignore
    }
  }

  const syncOpenState = () => {
    const details = rootRef.current?.querySelectorAll('details')
    if (!details || details.length === 0) return
    const isEveryOpen = Array.from(details).every((node) => node.open)
    setAllOpen(isEveryOpen)
  }

  const handleToggleAll = () => {
    const details = rootRef.current?.querySelectorAll('details')
    if (!details || details.length === 0) return
    const nextOpenState = !allOpen
    details.forEach((node) => {
      node.open = nextOpenState
    })
    setAllOpen(nextOpenState)
  }

  const handleToggleSection = () => {
    setIsExpanded((prev) => {
      const next = !prev
      if (!next) setAllOpen(false)
      return next
    })
  }

  return (
    <section
      ref={rootRef}
      onToggleCapture={syncOpenState}
      id="report-dati"
      className="report-section report-data-tables report-xp-section"
      aria-labelledby="report-data-tables-heading"
    >
      <header className="report-data-header">
        <div className="report-data-heading-row">
          <h2 id="report-data-tables-heading" className="report-section-title">
            dati avanzati per operatori
          </h2>
          <button
            type="button"
            className="report-data-toggle-main"
            aria-expanded={isExpanded}
            onClick={handleToggleSection}
          >
            {isExpanded ? 'Chiudi' : 'Apri'}
          </button>
          {isExpanded && hasAdvancedAccess ? (
            <button type="button" className="report-data-toggle-all" onClick={lockAdvancedData}>
              Blocca dati avanzati
            </button>
          ) : null}
          {isExpanded && hasAdvancedAccess ? (
            <button type="button" className="report-data-toggle-all" onClick={handleToggleAll}>
              {allOpen ? 'Chiudi tutto' : 'Apri tutto'}
            </button>
          ) : null}
        </div>
      </header>

      {isExpanded ? (
        !hasAdvancedAccess ? (
          <div className="report-data-lock-card">
            <p className="report-data-lock-title">Accesso riservato agli operatori autorizzati</p>
            <p className="report-data-lock-text">
              Inserisci la chiave proprietaria per visualizzare i dati avanzati del report.
            </p>
            {!currentUser ? (
              <p className="report-data-lock-warning">
                Non risulti autenticato: effettua il login operatore prima di inserire la chiave.
              </p>
            ) : null}
            <form className="report-data-lock-form" onSubmit={handleUnlock}>
              <input
                type="password"
                className="report-data-lock-input"
                placeholder="Chiave operatore"
                value={operatorKey}
                onChange={(event) => {
                  setOperatorKey(event.target.value)
                  if (unlockError) setUnlockError('')
                }}
                autoComplete="off"
              />
              <button type="submit" className="report-data-lock-button">
                Sblocca
              </button>
            </form>
            {unlockError ? <p className="report-data-lock-error">{unlockError}</p> : null}
          </div>
        ) : (
        <div className="report-data-accordion">
        <details
          className="report-data-details"
          style={{ '--report-group-accent': TABLES_GROUPS[0].color, '--report-group-bg': TABLES_GROUPS[0].bg }}
        >
          <summary>{TABLES_GROUPS[0].label}</summary>
          <div className="report-data-details-body">
            {SECTION_DEFS.map((section) => {
              const sectionData = data.sections[section.key]
              const palette = SECTION_COLORS[sectionData.label] || { border: '#cbd5e1', bg: '#f8fafc' }
              return (
                <details
                  key={section.key}
                  className="report-data-card report-data-card--collapsible"
                  style={{ '--report-card-accent': palette.border, '--report-card-bg': palette.bg }}
                >
                  <summary className="report-data-subtitle">{sectionData.label}</summary>
                  <div className="report-data-table-wrap">
                    <table className="report-data-table">
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Gruppo</th>
                          <th>Logica</th>
                          <th>Risposta</th>
                          <th>Delta correnti</th>
                          <th>Delta portato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionData.responses.map((row) => (
                          <tr key={row.fileKey}>
                            <td>{row.fileKey}</td>
                            <td>{row.group}</td>
                            <td>{row.logicType}</td>
                            <td>{row.answer}</td>
                            <td>{row.deltaCorrenti}</td>
                            <td>{row.deltaPortato}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )
            })}
          </div>
        </details>

        <details
          className="report-data-details"
          style={{ '--report-group-accent': TABLES_GROUPS[1].color, '--report-group-bg': TABLES_GROUPS[1].bg }}
        >
          <summary>{TABLES_GROUPS[1].label}</summary>
          <div className="report-data-details-body">
            {SECTION_DEFS.map((section) => {
              const sectionData = data.sections[section.key]
              const palette = SECTION_COLORS[sectionData.label] || { border: '#cbd5e1', bg: '#f8fafc' }
              return (
                <details
                  key={section.key}
                  className="report-data-card report-data-card--collapsible"
                  style={{ '--report-card-accent': palette.border, '--report-card-bg': palette.bg }}
                >
                  <summary className="report-data-subtitle">{sectionData.label}</summary>

                  <div className="report-data-grid">
                    <div className="report-data-table-wrap">
                      <table className="report-data-table report-data-table--compact">
                        <thead>
                          <tr>
                            <th>Disposizione</th>
                            <th>Totale</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DISPOSIZIONI_ROWS.map((entry) => (
                            <tr key={entry.key}>
                              <td>{entry.label}</td>
                              <td>{sectionData.disposizioniTotals[entry.key]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="report-data-table-wrap">
                      <table className="report-data-table report-data-table--compact">
                        <thead>
                          <tr>
                            <th>Portato esperienziale</th>
                            <th>Totale</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PORTATO_ROWS.map((entry) => (
                            <tr key={entry.key}>
                              <td>{entry.label}</td>
                              <td>{sectionData.portatoTotals[entry.key]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="report-data-table-wrap">
                    <table className="report-data-table report-data-table--compact">
                      <thead>
                        <tr>
                          <th>Corrente emotiva</th>
                          <th>Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CORRENTE_ROWS.map((entry) => (
                          <tr key={entry.key}>
                            <td>{entry.label}</td>
                            <td>{sectionData.correntiTotals[entry.key]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )
            })}
          </div>
        </details>

        <details
          className="report-data-details"
          style={{ '--report-group-accent': TABLES_GROUPS[2].color, '--report-group-bg': TABLES_GROUPS[2].bg }}
        >
          <summary>{TABLES_GROUPS[2].label}</summary>
          <div className="report-data-details-body">
            <article className="report-data-card">
              <h3 className="report-data-subtitle">Rapporti (natura, te stesso, altro, agire)</h3>
              <div className="report-data-table-wrap">
                <table className="report-data-table">
                  <thead>
                    <tr>
                      <th>Rapporto</th>
                      {DISPOSIZIONI_ROWS.map((entry) => (
                        <th key={entry.key}>{entry.label}</th>
                      ))}
                      <th>Livelli 1-7</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'natura', label: 'Natura' },
                      { key: 'se', label: 'Te stesso' },
                      { key: 'altro', label: 'Altro' },
                      { key: 'agire', label: 'Agire' },
                    ].map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        {DISPOSIZIONI_ROWS.map((entry) => (
                          <td key={entry.key}>{data.rapporti[row.key][entry.key]}</td>
                        ))}
                        <td>
                          {DISPOSIZIONI_ROWS.map((entry) => `${entry.label}: ${data.rapportiLevels[row.key][entry.key]}`).join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="report-data-card">
              <h3 className="report-data-subtitle">Confronto valori salvati vs ricostruiti</h3>
              <div className="report-data-grid">
                <div className="report-data-table-wrap">
                  <table className="report-data-table report-data-table--compact">
                    <thead>
                      <tr>
                        <th>Corrente</th>
                        <th>Salvato</th>
                        <th>Ricostruito</th>
                        <th>Differenza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CORRENTE_ROWS.map((entry) => (
                        <tr key={entry.key}>
                          <td>{entry.label}</td>
                          <td>{data.savedTotals.correnti[entry.key]}</td>
                          <td>{data.replayTotals.correnti[entry.key]}</td>
                          <td>
                            <DiffCell
                              saved={data.savedTotals.correnti[entry.key]}
                              replayed={data.replayTotals.correnti[entry.key]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="report-data-table-wrap">
                  <table className="report-data-table report-data-table--compact">
                    <thead>
                      <tr>
                        <th>Portato</th>
                        <th>Salvato</th>
                        <th>Ricostruito</th>
                        <th>Differenza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PORTATO_ROWS.map((entry) => (
                        <tr key={entry.key}>
                          <td>{entry.label}</td>
                          <td>{data.savedTotals.portato[entry.key]}</td>
                          <td>{data.replayTotals.portato[entry.key]}</td>
                          <td>
                            <DiffCell
                              saved={data.savedTotals.portato[entry.key]}
                              replayed={data.replayTotals.portato[entry.key]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          </div>
        </details>
        </div>
        )
      ) : null}

      {isExpanded ? (
        <p className="report-data-note">
          Nota: la sezione mostra in forma tabellare i passaggi di risposta e le aggregazioni calcolate sulle 72 risposte.
        </p>
      ) : null}
    </section>
  )
}
