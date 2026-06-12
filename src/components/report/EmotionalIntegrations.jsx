import React, { useEffect, useMemo, useState } from 'react'
import { getRelationalCorpusForDominant } from '../../content/relationalDeductions.js'
import { FAMILY_NAME_BY_KEY, FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { getSolarPlanetScore } from '../../utils/solarPlanetScores.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { MAPPA_UI, REPORT_CRITERION } from './reportUiCopy.js'
import PlainLanguageBox from './PlainLanguageBox.jsx'

const PLANETS = [
  {
    id: 'flemma',
    label: 'Flemma',
    familyKey: 'verde',
    familyName: 'Verde',
    galassiaFamily: 'verde',
  },
  {
    id: 'volitivita',
    label: 'Volitività',
    familyKey: 'rosso',
    familyName: 'Rosso',
    galassiaFamily: 'rosso',
  },
  {
    id: 'entusiasmo',
    label: 'Entusiasmo',
    familyKey: 'giallo',
    familyName: 'Giallo',
    galassiaFamily: 'giallo',
  },
  {
    id: 'anaffettivita',
    label: 'Anaffettività',
    familyKey: 'grigio',
    familyName: 'Grigio',
    galassiaFamily: 'grigio',
  },
  {
    id: 'malinconia-lunare',
    label: 'Malinc. lunare',
    familyKey: 'blu',
    familyName: 'Blu',
    galassiaFamily: 'blu',
    bluVariant: 'lunare',
  },
  {
    id: 'malinconia-solare',
    label: 'Malinc. solare',
    familyKey: 'blu',
    familyName: 'Blu',
    galassiaFamily: 'blu',
    bluVariant: 'solare',
  },
]

const TAB_ORDER = ['dinamica', 'frizioni', 'risorse']

function planetColors(familyName, variant) {
  const theme = FAMILY_THEME[familyName] || FAMILY_THEME.Verde
  const stroke = theme.dot
  const outer = theme.gradient.to
  const inner = theme.gradient.from
  if (variant === 'solare') {
    return { outer: '#78350f', inner: '#fcd34d', stroke: '#f59e0b', text: '#fffbeb' }
  }
  return { outer, inner, stroke, text: '#f8fafc' }
}

function splitLabel(label) {
  const words = String(label || '').split(' ')
  if (words.length <= 1) return [label]
  return [words[0], words.slice(1).join(' ')]
}

function resolveDefaultPlanetId(dominantFamilyKey) {
  const key = String(dominantFamilyKey || '').toLowerCase()
  const familyName = FAMILY_NAME_BY_KEY[key]
  if (familyName === 'Blu') return 'malinconia-lunare'
  const direct = PLANETS.find((p) => p.familyKey === key && !p.bluVariant)
  return direct?.id || PLANETS[0].id
}

function buildPlanetState({ correnti, rawRecord, activePlanetId }) {
  const scoreInput = { correnti, rawRecord }
  return PLANETS.map((planet) => ({
    ...planet,
    color: planetColors(planet.familyName, planet.bluVariant),
    score: getSolarPlanetScore(planet.id, scoreInput),
    descrizione:
      correnti.find((c) => c.familyKey === planet.familyKey)?.descrizioneBreve || '',
    isActive: planet.id === activePlanetId,
  }))
}

function SolarEmotionSystem({
  correnti,
  rawRecord,
  dominantFamilyKey,
  onOpenGalassia,
}) {
  const defaultActive = useMemo(
    () => resolveDefaultPlanetId(dominantFamilyKey),
    [dominantFamilyKey],
  )
  const [activePlanetId, setActivePlanetId] = useState(defaultActive)

  useEffect(() => {
    setActivePlanetId(defaultActive)
  }, [defaultActive])

  const planets = useMemo(
    () => buildPlanetState({ correnti, rawRecord, activePlanetId }),
    [correnti, rawRecord, activePlanetId],
  )
  const activePlanet = planets.find((p) => p.id === activePlanetId) || planets[0]
  const cx = 300
  const cy = 300
  const orbitR = 198
  const angles = [-90, -30, 30, 90, 150, 210]

  return (
    <section className="emotional-integrations__solar" aria-labelledby="emotional-solar-title">
      <div className="emotional-integrations__section-head">
        <p className="emotional-integrations__eyebrow">{MAPPA_UI.solarEyebrow}</p>
        <h3 id="emotional-solar-title" className="emotional-integrations__title">
          {MAPPA_UI.solarTitle}
        </h3>
        <p className="emotional-integrations__copy">{MAPPA_UI.solarCopy}</p>
      </div>

      <div className="emotional-integrations__solar-grid">
        <svg
          className="emotional-integrations__solar-svg"
          viewBox="0 0 600 600"
          role="img"
          aria-label="Sistema di sei pianeti emotivi con la disposizione selezionata"
        >
          <circle className="emotional-integrations__orbit" cx={cx} cy={cy} r={orbitR} />
          <circle className="emotional-integrations__sun-glow" cx={cx} cy={cy} r="54" />
          <circle className="emotional-integrations__sun-mid" cx={cx} cy={cy} r="34" />
          <circle className="emotional-integrations__sun" cx={cx} cy={cy} r="18" />

          {planets.map((planet, i) => {
            const angle = (angles[i] * Math.PI) / 180
            const x = cx + orbitR * Math.cos(angle)
            const y = cy + orbitR * Math.sin(angle)
            const [line1, line2] = splitLabel(planet.label)
            const scoreRadius = 14 + Math.min(18, Math.max(2, planet.score / 3))
            const selectPlanet = () => setActivePlanetId(planet.id)

            return (
              <g
                key={planet.id}
                role="button"
                tabIndex={0}
                aria-label={`Seleziona ${planet.label}, ${REPORT_CRITERION.attivazioneShort} ${Math.round(planet.score)} per cento`}
                aria-pressed={planet.isActive}
                onClick={selectPlanet}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    selectPlanet()
                  }
                }}
              >
                <circle
                  className="emotional-integrations__planet-hit"
                  cx={x}
                  cy={y}
                  r="38"
                  fill="transparent"
                  stroke="transparent"
                />
                <g
                  className={`emotional-integrations__planet${planet.isActive ? ' emotional-integrations__planet--active' : ''}`}
                  aria-hidden="true"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="30"
                    fill={planet.color.inner}
                    stroke={planet.color.stroke}
                    strokeWidth="1.3"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={scoreRadius}
                    fill={planet.color.outer}
                    opacity="0.7"
                  />
                  <text
                    className="emotional-integrations__planet-label"
                    x={x}
                    y={line2 ? y - 3 : y + 4}
                    fill={planet.color.text}
                  >
                    {line1}
                  </text>
                  {line2 ? (
                    <text
                      className="emotional-integrations__planet-label"
                      x={x}
                      y={y + 9}
                      fill={planet.color.text}
                    >
                      {line2}
                    </text>
                  ) : null}
                </g>
              </g>
            )
          })}
        </svg>

        <aside className="emotional-integrations__solar-card">
          <p className="emotional-integrations__metric-label">Pianeta attivo</p>
          <h4>{activePlanet.label}</h4>
          <p>
            {REPORT_CRITERION.attivazione}: <strong>{Math.round(activePlanet.score)}%</strong>
          </p>
          {activePlanet.descrizione ? (
            <p className="emotional-integrations__copy">{activePlanet.descrizione}</p>
          ) : null}
          <p className="emotional-integrations__source-note">
            Metafora visiva da sistema_pianeti.html; i pesi provengono dai punteggi di questo test.
          </p>
          {onOpenGalassia ? (
            <button
              type="button"
              className="nav-button secondary emotional-integrations__galassia-link"
              onClick={onOpenGalassia}
            >
              Apri in Galassia
            </button>
          ) : null}
          <div className="emotional-integrations__mini-list" aria-label="Altri pianeti">
            {planets
              .filter((p) => p.id !== activePlanet.id)
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className="emotional-integrations__mini-planet"
                  onClick={() => setActivePlanetId(p.id)}
                  style={{ '--planet-color': p.color.stroke }}
                >
                  <span aria-hidden="true" />
                  {p.label}
                  <small title={REPORT_CRITERION.attivazione}>{Math.round(p.score)}%</small>
                </button>
              ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

function RelationalDeductionsSection({ correnteDominante, famiglia }) {
  const corpus = useMemo(
    () => getRelationalCorpusForDominant(correnteDominante, famiglia),
    [correnteDominante, famiglia],
  )
  const relations = corpus.available ? corpus.relations : []
  const [activeRelation, setActiveRelation] = useState(relations[0]?.key || null)
  const [activeTab, setActiveTab] = useState('dinamica')

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
    if (key === activeRelation) {
      setActiveRelation(null)
      return
    }
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
              <span className="emotional-integrations__relation-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <strong>{item.name}</strong>
                <small>{item.sub}</small>
              </span>
            </button>
          ))}
        </div>

        {detailOpen && relation ? (
          <article
            className="emotional-integrations__relation-detail"
            style={{ '--relation-accent': relation.accent }}
          >
            <header>
              <span
                className="emotional-integrations__relation-icon emotional-integrations__relation-icon--large"
                aria-hidden="true"
              >
                {relation.icon}
              </span>
              <div>
                <h4>{relation.name}</h4>
                <p>{relation.sub}</p>
              </div>
            </header>

            <div
              className="emotional-integrations__tabs"
              role="tablist"
              aria-label={`Lettura ${relation.name}`}
            >
              {TAB_ORDER.map((key) => {
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
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="emotional-integrations__pane" role="tabpanel">
              {tabData?.title ? (
                <h5 className="emotional-integrations__pane-title">{tabData.title}</h5>
              ) : null}
              {(tabData?.body || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {tabData?.tip ? (
                <aside className="emotional-integrations__tip">
                  <p className="emotional-integrations__tip-label">{corpus.tipLabel}</p>
                  <p>{tabData.tip}</p>
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
  correnti = [],
  rawRecord = {},
  profilo = {},
  onOpenGalassia,
}) {
  const accentColor = profilo?.colore || '#4ade80'

  return (
    <section
      id="report-tst-mappa"
      className="emotional-integrations report-tst-section-anchor"
      aria-labelledby="emotional-integrations-title"
    >
      <ReportPassageHeader
        step="3"
        eyebrow={MAPPA_UI.eyebrow}
        title={MAPPA_UI.title}
        lead={MAPPA_UI.simpleLead}
        accentColor={accentColor}
        titleId="emotional-integrations-title"
      />
      <div className="emotional-integrations__intro">
        <PlainLanguageBox
          title={MAPPA_UI.summaryBoxTitle}
          accentColor={accentColor}
          className="emotional-integrations__summary-box"
        >
          {MAPPA_UI.summaryZero}
        </PlainLanguageBox>
        {MAPPA_UI.methodPoints?.length > 0 ? (
          <ul className="emotional-integrations__summary-points">
            {MAPPA_UI.methodPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
        {onOpenGalassia ? (
          <button
            type="button"
            className="nav-button secondary emotional-integrations__galassia-link emotional-integrations__galassia-link--intro"
            onClick={onOpenGalassia}
          >
            Apri in Galassia
          </button>
        ) : null}
      </div>

      <details className="emotional-integrations__advanced">
        <summary className="emotional-integrations__advanced-toggle">
          {MAPPA_UI.advancedToggle}
        </summary>
        <div className="emotional-integrations__advanced-body">
          <SolarEmotionSystem
            correnti={correnti}
            rawRecord={rawRecord}
            dominantFamilyKey={String(profilo?.famiglia || '').toLowerCase()}
            onOpenGalassia={onOpenGalassia}
          />
          <RelationalDeductionsSection
            key={`${profilo?.correnteDominante || ''}-${profilo?.famiglia || ''}`}
            correnteDominante={profilo?.correnteDominante}
            famiglia={profilo?.famiglia}
          />
        </div>
      </details>
    </section>
  )
}
