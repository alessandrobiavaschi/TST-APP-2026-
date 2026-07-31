import React, { useMemo, useState } from 'react'
import { getRelationalCorpusForDominant, DOMINANT_TO_RELATIONS_KEY } from '../../content/relationalDeductions.js'
import { RELATION_ACCENTS } from '../../content/relational/shared.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { MAPPA_UI } from './reportUiCopy.js'

const TARGET_CODES = {
  fl: 'FLM',
  ma: 'MAL',
  as: 'ASS',
  en: 'ENT',
  an: 'ANA',
}

const DOMINANT_CODES = {
  flemmatico: 'FLM',
  malinconico: 'MAL',
  assertivo: 'ASS',
  entusiasta: 'ENT',
  anaffettivo: 'ANA',
}

const TAB_ORDER = ['dinamica', 'frizioni', 'risorse']

function RelationalDeductionsSection({ correnteDominante, famiglia }) {
  const corpus = useMemo(
    () => getRelationalCorpusForDominant(correnteDominante, famiglia),
    [correnteDominante, famiglia],
  )
  const relations = corpus.available ? corpus.relations : []
  const [activeRelation, setActiveRelation] = useState(relations[0]?.key || null)
  const [activeTab, setActiveTab] = useState('dinamica')

  const dominantKey = useMemo(() => {
    return DOMINANT_TO_RELATIONS_KEY[String(correnteDominante || '').trim()] || DOMINANT_TO_RELATIONS_KEY[String(famiglia || '').trim()] || 'flemmatico'
  }, [correnteDominante, famiglia])
  const dominantColor = RELATION_ACCENTS[dominantKey] || '#0F6E56'

  if (!corpus.available) {
    return (
      <section
        className="emotional-integrations__relations emotional-integrations__relations--pending"
        aria-labelledby="emotional-relations-title"
      >
        <div className="emotional-integrations__section-head">
          <p className="emotional-integrations__eyebrow">{MAPPA_UI.relationsEyebrow}</p>
          <h3 id="emotional-relations-title" className="emotional-integrations__title">
            {MAPPA_UI.relationsTitle}
          </h3>
          <p className="emotional-integrations__copy emotional-integrations__pending">
            {corpus.pendingMessage}
          </p>
        </div>
      </section>
    )
  }

  const relation =
    relations.find((item) => item.key === activeRelation) || relations[0]
  const tabData = relation?.tabs?.[activeTab]
  const detailOpen = Boolean(activeRelation)

  const handleCardClick = (key) => {
    if (key === activeRelation) return
    setActiveRelation(key)
    setActiveTab('dinamica')
  }

  return (
    <section className="emotional-integrations__relations" aria-labelledby="emotional-relations-title">
      <div className="emotional-integrations__section-head">
        <p className="emotional-integrations__eyebrow">{MAPPA_UI.relationsEyebrow}</p>
        <h3 id="emotional-relations-title" className="emotional-integrations__title">
          {corpus.pageTitle}
        </h3>
        <p className="emotional-integrations__copy">{corpus.pageSubtitle}</p>
        {corpus.sourceNote ? (
          <p className="emotional-integrations__source-note">{corpus.sourceNote}</p>
        ) : null}
      </div>

      <div className="emotional-integrations__relations-grid">
        <div className="emotional-integrations__relations-sidebar">
          <div className="emotional-integrations__relation-list" role="list">
            {relations.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`emotional-integrations__relation-card${item.key === activeRelation ? ' emotional-integrations__relation-card--active' : ''}`}
                onClick={() => handleCardClick(item.key)}
                aria-expanded={item.key === activeRelation}
                style={{ '--relation-accent': item.accent }}
              >
                <div className="emotional-integrations__bond-wrapper">
                  <svg width="34" height="20" viewBox="0 0 34 20" fill="none" className="emotional-integrations__bond-icon" aria-hidden="true">
                    <circle cx="8" cy="10" r="5" fill={dominantColor} />
                    <circle cx="8" cy="10" r="1.8" fill="#111729" />
                    <line x1="13" y1="10" x2="21" y2="10" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" strokeDasharray="2 1.5" />
                    <circle cx="26" cy="10" r="5" fill={item.accent} />
                    <circle cx="26" cy="10" r="1.8" fill="#111729" />
                  </svg>
                </div>
                <span className="emotional-integrations__relation-info">
                  <strong>{item.name}</strong>
                </span>
                <span className="emotional-integrations__relation-code">{`INT-${item.key.toUpperCase()}`}</span>
              </button>
            ))}
          </div>

          <div className="emotional-integrations__map-card">
            <div className="emotional-integrations__map-header">
              <span className="emotional-integrations__map-tag">// GRAFO DELLE INTERAZIONI</span>
              <h4 className="emotional-integrations__map-title">Mappa dei Vettori Relazionali</h4>
            </div>
            <div className="emotional-integrations__map-svg-wrap">
              <svg viewBox="0 0 240 220" className="emotional-integrations__map-svg" aria-hidden="true">
                {/* Orbital reference rings */}
                <circle cx="120" cy="110" r="75" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <circle cx="120" cy="110" r="45" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Connection lines */}
                {relations.map((item, idx) => {
                  const targetCoordinates = [
                    { x: 120, y: 35 },
                    { x: 195, y: 110 },
                    { x: 120, y: 185 },
                    { x: 45, y: 110 },
                  ]
                  const coords = targetCoordinates[idx] || { x: 120, y: 110 }
                  const isActive = item.key === activeRelation
                  return (
                    <line
                      key={`line-${item.key}`}
                      x1="120"
                      y1="110"
                      x2={coords.x}
                      y2={coords.y}
                      stroke={isActive ? item.accent : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth={isActive ? 2.5 : 1}
                      strokeDasharray={isActive ? "none" : "3 3"}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  )
                })}

                {/* Satellite Nodes */}
                {relations.map((item, idx) => {
                  const targetCoordinates = [
                    { x: 120, y: 35 },
                    { x: 195, y: 110 },
                    { x: 120, y: 185 },
                    { x: 45, y: 110 },
                  ]
                  const coords = targetCoordinates[idx] || { x: 120, y: 110 }
                  const isActive = item.key === activeRelation
                  const code = TARGET_CODES[item.key] || item.key.toUpperCase()
                  return (
                    <g
                      key={`node-${item.key}`}
                      className="emotional-integrations__map-node"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCardClick(item.key)}
                    >
                      {isActive && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="16"
                          fill={item.accent}
                          opacity="0.18"
                          style={{ transition: 'all 0.3s ease' }}
                        />
                      )}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="11"
                        fill={isActive ? item.accent : "#0f172a"}
                        stroke={item.accent}
                        strokeWidth={isActive ? 2 : 1.2}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      <text
                        x={coords.x}
                        y={coords.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)"}
                        fontSize="8"
                        fontFamily="var(--font-body)"
                        fontWeight="bold"
                      >
                        {code}
                      </text>
                    </g>
                  )
                })}

                {/* Center Dominant Node */}
                <circle cx="120" cy="110" r="18" fill="#0f172a" stroke={dominantColor} strokeWidth="2.5" />
                <circle cx="120" cy="110" r="14" fill={dominantColor} opacity="0.15" />
                <text
                  x="120"
                  y="110"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="var(--font-body)"
                  fontWeight="bold"
                >
                  {DOMINANT_CODES[dominantKey] || 'TST'}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {detailOpen && relation ? (
          <article
            className="emotional-integrations__relation-detail"
            style={{ '--relation-accent': relation.accent }}
          >
            <header className="emotional-integrations__detail-header">
              <div className="emotional-integrations__bond-wrapper emotional-integrations__bond-wrapper--large">
                <svg width="46" height="24" viewBox="0 0 46 24" fill="none" className="emotional-integrations__bond-icon emotional-integrations__bond-icon--large" aria-hidden="true">
                  <circle cx="10" cy="12" r="7" fill={dominantColor} />
                  <circle cx="10" cy="12" r="2.2" fill="#0f172a" />
                  <line x1="17" y1="12" x2="29" y2="12" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx="36" cy="12" r="7" fill={relation.accent} />
                  <circle cx="36" cy="12" r="2.2" fill="#0f172a" />
                </svg>
              </div>
              <div className="emotional-integrations__detail-title">
                <h4>{relation.name}</h4>
                <p>{relation.sub}</p>
              </div>
            </header>

            <div
              className="emotional-integrations__tabs"
              role="tablist"
              aria-label={`Lettura ${relation.name}`}
            >
              {TAB_ORDER.map((key, idx) => {
                const tab = relation.tabs[key]
                if (!tab) return null
                return (
                  <button
                    type="button"
                    key={key}
                    className={`emotional-integrations__tab${activeTab === key ? ' emotional-integrations__tab--active' : ''}`}
                    role="tab"
                    aria-selected={activeTab === key}
                    onClick={() => setActiveTab(key)}
                  >
                    <span className="emotional-integrations__tab-num">{`0${idx + 1}`}</span>
                    <span className="emotional-integrations__tab-text">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="emotional-integrations__pane" role="tabpanel">
              {tabData?.title ? (
                <div className="emotional-integrations__pane-title-group">
                  <span className="emotional-integrations__pane-tag">MATRICE DI INTERAZIONE</span>
                  <h5 className="emotional-integrations__pane-title">{tabData.title}</h5>
                </div>
              ) : null}
              {(tabData?.body || []).map((paragraph, index) => (
                <p key={index} className="emotional-integrations__pane-paragraph">{paragraph}</p>
              ))}
              {tabData?.tip ? (
                <aside className="emotional-integrations__tip">
                  <div className="emotional-integrations__tip-header">
                    <span className="emotional-integrations__tip-prefix">//</span>
                    <p className="emotional-integrations__tip-label">{corpus.tipLabel}</p>
                  </div>
                  <p className="emotional-integrations__tip-body">{tabData.tip}</p>
                </aside>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  )
}

export default function EmotionalIntegrations({
  profilo = {},
  stepPrefix = '1',
  step,
}) {
  const accentColor = profilo?.colore || '#4ade80'

  return (
    <section
      id="report-tst-mappa"
      className="emotional-integrations report-tst-section-anchor"
      aria-labelledby="emotional-integrations-title"
    >
      <ReportPassageHeader
        step={step || `${stepPrefix}.4`}
        eyebrow="Relazioni tra famiglie"
        title={MAPPA_UI.title}
        titleVisuallyHidden
        accentColor={accentColor}
        titleId="emotional-integrations-title"
      />

      <div className="emotional-integrations__advanced">
        <div className="emotional-integrations__advanced-body">
          <RelationalDeductionsSection
            key={`${profilo?.correnteDominante || ''}-${profilo?.famiglia || ''}`}
            correnteDominante={profilo?.correnteDominante}
            famiglia={profilo?.famiglia}
          />
        </div>
      </div>
    </section>
  )
}
