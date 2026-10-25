import React, { useState, useMemo, useRef } from 'react'
import { ASCOLTI_72_TEST } from '../../content/musicaPerMusicisti.js'

const SEZIONI_CONFIG = [
  { key: 'all', label: 'Tutti i 72 passi', count: 72 },
  { key: 'A_TIMBRO', label: 'Timbro', sub: '1–28', color: '#eab308', count: 28 },
  { key: 'B_INTERVALLI', label: 'Intervalli', sub: '29–41', color: '#60a5fa', count: 13 },
  { key: 'C_RITMO', label: 'Ritmo', sub: '42–51', color: '#f87171', count: 10 },
  { key: 'D_MELODIA', label: 'Melodia', sub: '52–58', color: '#4ade80', count: 7 },
  { key: 'E_ARMONIA', label: 'Accordi', sub: '59–72', color: '#c084fc', count: 14 },
]

function getAnswerForStep(rawRecord, stepNumber) {
  if (!rawRecord || typeof rawRecord !== 'object') return null
  const pad2 = String(stepNumber).padStart(2, '0')
  const num = String(stepNumber)

  const candidates = [
    `File_${pad2}`,
    `File_${num}`,
    `file_${pad2}`,
    `file_${num}`,
    `Passo_${pad2}`,
    `Passo_${num}`,
  ]

  for (const k of candidates) {
    const val = rawRecord[k]
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim()
    }
  }

  if (rawRecord.answers && typeof rawRecord.answers === 'object') {
    for (const k of candidates) {
      const val = rawRecord.answers[k]
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim()
      }
    }
  }

  return null
}

export default function SuoniDelTuoTest({
  rawRecord = {},
  accentColor = '#4ade80',
}) {
  const [selectedSezione, setSelectedSezione] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyAnswered, setOnlyAnswered] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState({})
  const stepRefs = useRef({})

  // Calcola statistiche risposte
  const stats = useMemo(() => {
    let answeredCount = 0
    ASCOLTI_72_TEST.forEach((item) => {
      if (getAnswerForStep(rawRecord, item.passo)) {
        answeredCount++
      }
    })
    return {
      answered: answeredCount,
      total: 72,
      pct: Math.round((answeredCount / 72) * 100),
    }
  }, [rawRecord])

  // Filtra la lista dei 72 ascolti
  const filteredAscolti = useMemo(() => {
    return ASCOLTI_72_TEST.filter((ascolto) => {
      if (selectedSezione !== 'all' && ascolto.sezione !== selectedSezione) {
        return false
      }
      const userResponse = getAnswerForStep(rawRecord, ascolto.passo)
      if (onlyAnswered && !userResponse) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = ascolto.titoloTecnico.toLowerCase().includes(q)
        const matchExpl = ascolto.spiegazione.toLowerCase().includes(q)
        const matchResp = userResponse ? userResponse.toLowerCase().includes(q) : false
        const matchPasso = String(ascolto.passo) === q.replace(/^p(asso)?\s*/i, '')
        if (!matchTitle && !matchExpl && !matchResp && !matchPasso) {
          return false
        }
      }
      return true
    })
  }, [selectedSezione, searchQuery, onlyAnswered, rawRecord])

  const toggleStep = (passo) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [passo]: !prev[passo],
    }))
  }

  const expandAll = () => {
    const next = {}
    filteredAscolti.forEach((a) => {
      next[a.passo] = true
    })
    setExpandedSteps(next)
  }

  const collapseAll = () => {
    setExpandedSteps({})
  }

  return (
    <section id="fm-passi" className="fm-section fm-test-sounds" aria-labelledby="fm-test-sounds-title">
      <div className="fm-test-sounds__head">
        <h2 id="fm-test-sounds-title">I 72 ascolti del test</h2>
        <p className="fm-section-lead">
          La rassegna di tutti i 72 stimoli sonori del test con la struttura formale, il principio armonico e la risposta che hai indicato.
        </p>
      </div>

      {/* KPI & Status Bar compatta */}
      <div className="fm-sounds-kpi-bar">
        <div className="fm-sounds-kpi-bar__stat">
          <span className="fm-sounds-kpi-bar__num">72</span>
          <span className="fm-sounds-kpi-bar__label">Stimoli sonori totali</span>
        </div>
        <div className="fm-sounds-kpi-bar__stat">
          <span className="fm-sounds-kpi-bar__num" style={{ color: accentColor }}>
            {stats.answered} <span className="fm-sounds-kpi-bar__sub">/ 72</span>
          </span>
          <span className="fm-sounds-kpi-bar__label">Risposte nel record ({stats.pct}%)</span>
        </div>
        <div className="fm-sounds-kpi-bar__progress-track" aria-hidden="true">
          <div
            className="fm-sounds-kpi-bar__progress-fill"
            style={{ width: `${stats.pct}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Toolbar: Filtri per Sezione, Ricerca, Toggle Risposte */}
      <div className="fm-test-sounds__toolbar">
        <div className="fm-test-sounds__filters" role="tablist" aria-label="Filtra per area musicale">
          {SEZIONI_CONFIG.map((filtro) => {
            const isSelected = selectedSezione === filtro.key
            return (
              <button
                key={filtro.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`fm-test-sounds__tab-btn${isSelected ? ' is-active' : ''}`}
                style={isSelected ? { borderColor: filtro.color || accentColor, color: '#f8fafc' } : {}}
                onClick={() => setSelectedSezione(filtro.key)}
              >
                <span className="fm-test-sounds__tab-label">{filtro.label}</span>
                {filtro.sub && <span className="fm-test-sounds__tab-sub">{filtro.sub}</span>}
              </button>
            )
          })}
        </div>

        <div className="fm-test-sounds__controls-row">
          <div className="fm-test-sounds__search">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per strumento, accordo, risposta o n° passo…"
              className="fm-test-sounds__input"
              aria-label="Cerca nei 72 suoni del test"
            />
          </div>

          <div className="fm-test-sounds__actions">
            <label className="fm-test-sounds__toggle-checkbox">
              <input
                type="checkbox"
                checked={onlyAnswered}
                onChange={(e) => setOnlyAnswered(e.target.checked)}
              />
              <span>Solo con risposta</span>
            </label>

            <div className="fm-test-sounds__bulk-expand">
              <button type="button" className="fm-bulk-btn" onClick={expandAll}>
                Espandi note
              </button>
              <button type="button" className="fm-bulk-btn" onClick={collapseAll}>
                Comprimi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Box a scorrimento dei 72 passi ── */}
      <div className="fm-test-sounds__scroll-container">
        <div className="fm-sounds-list" role="list">
          {filteredAscolti.map((ascolto) => {
            const userResponse = getAnswerForStep(rawRecord, ascolto.passo)
            const hasResponse = Boolean(userResponse)
            const isExpanded = Boolean(expandedSteps[ascolto.passo])

            let secBadgeColor = '#94a3b8'
            if (ascolto.sezione === 'A_TIMBRO') secBadgeColor = '#eab308'
            if (ascolto.sezione === 'B_INTERVALLI') secBadgeColor = '#60a5fa'
            if (ascolto.sezione === 'C_RITMO') secBadgeColor = '#f87171'
            if (ascolto.sezione === 'D_MELODIA') secBadgeColor = '#4ade80'
            if (ascolto.sezione === 'E_ARMONIA') secBadgeColor = '#c084fc'

            return (
              <div
                key={ascolto.passo}
                ref={(el) => { stepRefs.current[ascolto.passo] = el }}
                className={`fm-sound-row${isExpanded ? ' is-expanded' : ''}`}
                role="listitem"
              >
                <div
                  className="fm-sound-row__main"
                  onClick={() => toggleStep(ascolto.passo)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleStep(ascolto.passo)
                    }
                  }}
                >
                  {/* Passo & Tag Sezione */}
                  <div className="fm-sound-row__meta">
                    <span
                      className="fm-sound-row__step"
                      style={{ color: secBadgeColor, borderColor: `${secBadgeColor}40` }}
                    >
                      P.{String(ascolto.passo).padStart(2, '0')}
                    </span>
                    <span className="fm-sound-row__section-tag">
                      {ascolto.sezioneNome}
                    </span>
                  </div>

                  {/* Nome compositivo formale */}
                  <div className="fm-sound-row__title-wrap">
                    <h3 className="fm-sound-row__title">{ascolto.titoloTecnico}</h3>
                  </div>

                  {/* Risposta dell'utente */}
                  <div className="fm-sound-row__response">
                    {hasResponse ? (
                      <span className="fm-resp-pill is-filled" style={{ borderColor: `${accentColor}55` }}>
                        <span className="fm-resp-pill__label">La tua scelta:</span>
                        <strong className="fm-resp-pill__value" style={{ color: accentColor }}>
                          «{userResponse}»
                        </strong>
                      </span>
                    ) : (
                      <span className="fm-resp-pill is-empty">
                        <span className="fm-resp-pill__label">Risposta:</span>
                        <span className="fm-resp-pill__empty-text">Non indicata</span>
                      </span>
                    )}
                  </div>

                  {/* Azione toggle nota */}
                  <div className="fm-sound-row__action">
                    <span className="fm-sound-row__toggle-text" aria-hidden="true">
                      {isExpanded ? 'Chiudi' : 'Dettagli'}
                    </span>
                  </div>
                </div>

                {/* Sottopannello con la spiegazione tecnica ed armonica */}
                {isExpanded && (
                  <div className="fm-sound-row__details">
                    <div className="fm-sound-row__details-content">
                      <p className="fm-sound-row__explanation-text">
                        <strong className="fm-sound-row__details-lead">Principio sonoro:</strong>{' '}
                        {ascolto.spiegazione}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {filteredAscolti.length === 0 && (
        <div className="fm-test-sounds__empty">
          <p>Nessun ascolto trovato con i criteri di ricerca correnti.</p>
          <button
            type="button"
            className="fm-bulk-btn"
            onClick={() => {
              setSelectedSezione('all')
              setSearchQuery('')
              setOnlyAnswered(false)
            }}
          >
            Reimposta tutti i filtri
          </button>
        </div>
      )}
    </section>
  )
}
