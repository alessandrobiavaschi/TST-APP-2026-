import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { GALAXY_THEORY_BY_DISPOSITION } from '../../config/galaxyTheoryContent.ts'

// ─── Virtual World Dimensions ────────────────────────────────────────────────
const WORLD_WIDTH = 3400
const WORLD_HEIGHT = 2400

const CAMERA_MIN_SCALE = 0.22
const CAMERA_MAX_SCALE = 2.8
const CAMERA_ZOOM_STEP = 1.25
const WHEEL_ZOOM_INTENSITY = 0.002
const PINCH_DAMPING = 0.55

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// ─── Family Metadata & Constellation Anchor Positions (Rosa dei Venti) ───────
const FAMILY_CONFIG = {
  entusiasmo: {
    id: 'entusiasmo',
    label: 'Entusiasta',
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#f97316', '#fb923c'],
    baseColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.24)',
    x: 1700,
    y: 480,
    radius: 390,
    subSpread: 210,
    compass: 'Nord · Fuoco / Luce',
  },
  flemmatica: {
    id: 'flemmatica',
    label: 'Flemmatica',
    colors: ['#4ade80', '#22c55e', '#16a34a', '#34d399', '#0d9488', '#2dd4bf'],
    baseColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.22)',
    x: 1700,
    y: 1250,
    radius: 380,
    subSpread: 0,
    compass: 'Centro · Acqua / Calma',
  },
  agnostica_anaffettiva: {
    id: 'agnostica_anaffettiva',
    label: 'Razionale',
    colors: ['#94a3b8', '#64748b', '#cbd5e1', '#9ca3af', '#475569', '#e2e8f0'],
    baseColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.22)',
    x: 1700,
    y: 2020,
    radius: 340,
    subSpread: 180,
    compass: 'Sud · Terra / Distacco',
  },
  malinconica_nostalgica: {
    id: 'malinconica_nostalgica',
    label: 'Malinconica',
    colors: ['#818cf8', '#6366f1', '#7c3aed', '#a5b4fc', '#4338ca', '#c084fc'],
    baseColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.24)',
    x: 740,
    y: 1250,
    radius: 620,
    subSpread: 320,
    compass: 'Ovest · Aria / Memoria',
  },
  collerico_volitiva: {
    id: 'collerico_volitiva',
    label: 'Marziale',
    colors: ['#f87171', '#ef4444', '#dc2626', '#fb7185', '#be123c', '#c026d3'],
    baseColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.24)',
    x: 2660,
    y: 1250,
    radius: 510,
    subSpread: 260,
    compass: 'Est · Fuoco / Decisione',
  },
}

const FAMILY_ORDER = [
  'malinconica_nostalgica',
  'collerico_volitiva',
  'flemmatica',
  'entusiasmo',
  'agnostica_anaffettiva',
]

const FAMILY_META = FAMILY_CONFIG

const VIEW_MODEL_FAMILIES = [
  { familyKey: 'blu', familyName: 'Blu', familyId: 'malinconica_nostalgica' },
  { familyKey: 'rosso', familyName: 'Rosso', familyId: 'collerico_volitiva' },
  { familyKey: 'verde', familyName: 'Verde', familyId: 'flemmatica' },
  { familyKey: 'giallo', familyName: 'Giallo', familyId: 'entusiasmo' },
  { familyKey: 'grigio', familyName: 'Grigio', familyId: 'agnostica_anaffettiva' },
]

const ATLAS_FAMILY_ID_BY_KEY = Object.fromEntries(
  VIEW_MODEL_FAMILIES.map(({ familyKey, familyId }) => [familyKey, familyId]),
)

const FAMILY_LIST = FAMILY_ORDER.map((id) => ({ id, ...FAMILY_CONFIG[id] }))

// ─── Build Constellation Network (Computed once with 0 overlaps) ─────────────
function buildConstellationData() {
  const words = []
  const hubs = []
  const edges = []
  const spheres = []

  for (const famId of FAMILY_ORDER) {
    const theory = GALAXY_THEORY_BY_DISPOSITION[famId]
    const cfg = FAMILY_CONFIG[famId]
    if (!theory || !cfg) continue

    spheres.push({
      id: famId,
      name: cfg.label,
      compass: cfg.compass,
      x: cfg.x,
      y: cfg.y,
      radius: cfg.radius,
      color: cfg.baseColor,
      glowColor: cfg.glowColor,
    })

    const currents = theory.currents
    const numCurrents = currents.length

    currents.forEach((c, ci) => {
      let hubX = cfg.x
      let hubY = cfg.y

      if (numCurrents > 1) {
        const hubAngle = (ci / numCurrents) * Math.PI * 2 - Math.PI / 2
        hubX = cfg.x + Math.cos(hubAngle) * cfg.subSpread
        hubY = cfg.y + Math.sin(hubAngle) * cfg.subSpread

        edges.push({
          id: `edge-core-${c.rawKey}`,
          familyId: famId,
          subcurrentId: c.rawKey,
          x1: cfg.x,
          y1: cfg.y,
          x2: hubX,
          y2: hubY,
          type: 'core-hub',
          color: cfg.baseColor,
        })
      }

      hubs.push({
        id: c.rawKey,
        familyId: famId,
        title: c.title,
        interval: c.interval,
        x: hubX,
        y: hubY,
        color: cfg.baseColor,
      })

      const states = c.states
      const numStates = states.length

      states.forEach((state, si) => {
        const phi = 2.3999632
        const maxR = numCurrents === 1 ? cfg.radius * 0.76 : cfg.subSpread * 0.74
        const r = 44 + Math.sqrt((si + 1) / (numStates + 1)) * maxR
        const angle = si * phi + (numCurrents > 1 ? (ci * Math.PI) / 2 : 0)

        const wx = hubX + Math.cos(angle) * r
        const wy = hubY + Math.sin(angle) * (r * 0.88)

        const fontSize = si < 2 ? 18 : si < 7 ? 15 : 13
        const estWidth = state.length * fontSize * 0.64 + 28
        const estHeight = fontSize * 1.4 + 14

        const wordId = `${famId}-${c.rawKey}-${si}`
        words.push({
          id: wordId,
          nome: state,
          familyId: famId,
          familyLabel: cfg.label,
          familyColor: cfg.baseColor,
          subcurrentId: c.rawKey,
          subcurrentTitle: c.title,
          subcurrentDescription: c.description,
          subcurrentInterval: c.interval,
          hubId: c.rawKey,
          hubX,
          hubY,
          x: wx,
          y: wy,
          width: estWidth,
          height: estHeight,
          fontSize,
          fontWeight: si < 2 ? 700 : si < 7 ? 600 : 500,
          color: cfg.colors[si % cfg.colors.length],
        })

        edges.push({
          id: `edge-word-${wordId}`,
          familyId: famId,
          subcurrentId: c.rawKey,
          wordId,
          x1: hubX,
          y1: hubY,
          x2: wx,
          y2: wy,
          type: 'hub-word',
          color: cfg.baseColor,
        })
      })
    })
  }

  // Strict collision relaxation pass in pixel space: guarantees 0 overlaps
  const iterations = 320
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false
    for (let i = 0; i < words.length; i++) {
      const a = words[i]
      for (let j = i + 1; j < words.length; j++) {
        const b = words[j]

        const minDx = (a.width + b.width) / 2 + 10
        const minDy = (a.height + b.height) / 2 + 8
        const dx = b.x - a.x
        const dy = b.y - a.y

        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        if (absDx < minDx && absDy < minDy) {
          const overlapX = minDx - absDx
          const overlapY = minDy - absDy

          let pushX = 0
          let pushY = 0
          if (overlapX / minDx < overlapY / minDy) {
            const dir = dx >= 0 ? 1 : -1
            pushX = dir * overlapX * 0.52
          } else {
            const dir = dy >= 0 ? 1 : -1
            pushY = dir * overlapY * 0.52
          }

          a.x -= pushX
          a.y -= pushY
          b.x += pushX
          b.y += pushY
          moved = true
        }
      }
    }
    if (!moved) break
  }

  // Synchronize edge endpoints to relaxed word positions
  const wordPosMap = new Map(words.map((w) => [w.id, w]))
  for (const edge of edges) {
    if (edge.wordId) {
      const target = wordPosMap.get(edge.wordId)
      if (target) {
        edge.x2 = target.x
        edge.y2 = target.y
      }
    }
  }

  // Populate nearby words for dictionary panel
  for (const w of words) {
    w.nearbyWords = words
      .filter((v) => v.subcurrentId === w.subcurrentId && v.id !== w.id)
      .slice(0, 6)
      .map((v) => v.nome)
  }

  return {
    spheres,
    hubs,
    edges,
    words,
  }
}

const CONSTELLATION_DATA = buildConstellationData()
const ATLAS_WORDS = CONSTELLATION_DATA.words

// ─── Dictionary Panel ────────────────────────────────────────────────────────
function DictionaryPanel({ word, onClose, onSelectWord, viewModel }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [word?.id])

  if (!word) return null
  const meta = FAMILY_CONFIG[word.familyId]

  const dynamicWordInfo = viewModel?.lessicoSituazionale?.find(
    (p) =>
      p.parola.toLowerCase() === word.nome.toLowerCase() &&
      ATLAS_FAMILY_ID_BY_KEY[p.familyKey] === word.familyId &&
      p.correnteKey === word.subcurrentId,
  )

  const hasApprofondimento = Boolean(word.subcurrentInterval || dynamicWordInfo)

  return (
    <aside
      id="lessico-dictionary-popover"
      className="lessico-dict"
      aria-label="Dizionario emotivo"
    >
      <div className="lessico-dict__bezel" style={{ '--dict-color': word.familyColor }}>
        <header className="lessico-dict__head">
          <p className="lessico-dict__kicker">Dizionario emotivo</p>
          <button
            ref={closeButtonRef}
            type="button"
            className="lessico-dict__close"
            onClick={onClose}
            aria-label="Chiudi dizionario"
          >
            ✕
          </button>
        </header>
        <div className="lessico-dict__body">
          <h2 className="lessico-dict__word" style={{ color: word.color }}>
            {word.nome}
          </h2>
          <dl className="lessico-dict__meta">
            <div>
              <dt>Famiglia</dt>
              <dd>
                <span
                  className="lessico-dict__dot"
                  style={{ backgroundColor: meta?.baseColor }}
                  aria-hidden
                />
                {word.familyLabel}
              </dd>
            </div>
            <div>
              <dt>Sottocorrente</dt>
              <dd>{word.subcurrentTitle}</dd>
            </div>
            <div>
              <dt>Fonte Lessico</dt>
              <dd style={{ color: dynamicWordInfo ? '#22c55e' : '#cbd5e1', fontWeight: 600 }}>
                {dynamicWordInfo ? 'Situazionale (dal test)' : 'Stabile (teoria)'}
              </dd>
            </div>
          </dl>
          {word.subcurrentDescription && (
            <div className="lessico-dict__def">
              <h3>Descrizione</h3>
              <p>{word.subcurrentDescription}</p>
            </div>
          )}
          {word.nearbyWords.length > 0 && (
            <div className="lessico-dict__nearby">
              <h3>Parole vicine</h3>
              <div className="lessico-dict__nearby-list">
                {word.nearbyWords.map((nome) => {
                  const w = ATLAS_WORDS.find(
                    (v) =>
                      v.nome === nome &&
                      v.familyId === word.familyId &&
                      v.subcurrentId === word.subcurrentId,
                  )
                  return (
                    <button
                      key={nome}
                      type="button"
                      className="lessico-dict__nearby-word"
                      style={{ '--nearby-color': w?.color || meta?.baseColor }}
                      onClick={() => w && onSelectWord(w)}
                    >
                      {nome}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {hasApprofondimento && (
            <details className="lessico-dashboard__details lessico-dict__approfondisci">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Approfondisci
              </summary>
              <dl className="lessico-dict__meta mt-2">
                {word.subcurrentInterval && (
                  <div>
                    <dt>Intervallo musicale</dt>
                    <dd>{word.subcurrentInterval}</dd>
                  </div>
                )}
                {dynamicWordInfo?.fileKeys && dynamicWordInfo.fileKeys.length > 0 && (
                  <div>
                    <dt>Tracce collegate</dt>
                    <dd style={{ color: '#60a5fa' }}>
                      {dynamicWordInfo.fileKeys
                        .map((f) => `Traccia ${f.replace('File_', '')}`)
                        .join(', ')}
                    </dd>
                  </div>
                )}
                {dynamicWordInfo && (
                  <>
                    <div>
                      <dt>Corrente TST</dt>
                      <dd style={{ fontSize: '0.85rem' }}>{dynamicWordInfo.correnteKey}</dd>
                    </div>
                    <div>
                      <dt>Famiglia Key</dt>
                      <dd>{dynamicWordInfo.familyKey}</dd>
                    </div>
                  </>
                )}
              </dl>
            </details>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Family Filter Legend ───────────────────────────────────────────────────
function AtlasLegend({ filterFamily, onFilterChange }) {
  return (
    <nav className="lessico-legend" aria-label="Filtra per famiglia emotiva">
      <button
        type="button"
        className={`lessico-legend__item${!filterFamily ? ' is-active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        Tutte
      </button>
      {FAMILY_LIST.map((fam) => (
        <button
          key={fam.id}
          type="button"
          className={`lessico-legend__item${filterFamily === fam.id ? ' is-active' : ''}`}
          style={{ '--legend-color': fam.baseColor }}
          onClick={() => onFilterChange(filterFamily === fam.id ? null : fam.id)}
        >
          <span
            className="lessico-legend__dot"
            style={{ backgroundColor: fam.baseColor }}
            aria-hidden
          />
          {fam.label}
        </button>
      ))}
    </nav>
  )
}

// ─── Mobile Accordion Card ──────────────────────────────────────────────────
function MobileAtlasCard({ fam, isExpanded, onToggle, onSelectWord, searchQuery }) {
  const meta = FAMILY_CONFIG[fam.id]
  const words = ATLAS_WORDS.filter((w) => w.familyId === fam.id)
  const norm = searchQuery.trim().toLowerCase()

  const subcurrents = []
  const seenSub = new Set()
  for (const w of words) {
    if (!seenSub.has(w.subcurrentId)) {
      seenSub.add(w.subcurrentId)
      subcurrents.push({
        id: w.subcurrentId,
        title: w.subcurrentTitle,
        words: words.filter((v) => v.subcurrentId === w.subcurrentId),
      })
    }
  }

  return (
    <div
      className={`lessico-mobile-card${isExpanded ? ' is-expanded' : ''}`}
      style={{ '--card-color': meta.baseColor }}
    >
      <button
        type="button"
        className="lessico-mobile-card__header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span
          className="lessico-mobile-card__dot"
          style={{ backgroundColor: meta.baseColor }}
          aria-hidden
        />
        <strong className="lessico-mobile-card__title">{meta.label}</strong>
        <span className="lessico-mobile-card__count">{words.length} parole</span>
        <span className="lessico-mobile-card__chevron" aria-hidden>
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>
      {isExpanded && (
        <div className="lessico-mobile-card__body">
          {subcurrents.map((sub) => {
            const visible = sub.words.filter(
              (w) => !norm || w.nome.toLowerCase().includes(norm),
            )
            if (visible.length === 0) return null
            return (
              <div key={sub.id} className="lessico-mobile-sub">
                <h4 className="lessico-mobile-sub__title" style={{ color: meta.baseColor }}>
                  {sub.title}
                </h4>
                <div className="lessico-mobile-sub__words">
                  {visible.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className="lessico-mobile-word"
                      style={{ '--word-color': w.color, fontSize: w.fontSize }}
                      onClick={() => onSelectWord(w)}
                    >
                      {w.nome}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Analisi Dashboard ───────────────────────────────────────────────────────
function AnalisiDashboard({ viewModel, onSelectWord }) {
  if (!viewModel) return null

  const {
    datiDisponibili,
    lessicoStabile = {},
    lessicoSituazionale = [],
    campoDiForze = {},
    contrastiLessicali = [],
    firmaPersonale = {},
    costellazioniSemantiche = [],
    _gap = [],
  } = viewModel
  const costellazioniAttive = costellazioniSemantiche.filter(
    (costellazione) => costellazione.correntiUtenteCollegate?.length > 0,
  )

  return (
    <div className="lessico-dashboard">
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">1. Firma Personale</h3>
        {!datiDisponibili ? (
          <p className="lessico-dashboard__empty">Firma non disponibile (test non completato).</p>
        ) : (
          <div className="lessico-dashboard__firma">
            <div className="lessico-dashboard__code-wrap">
              <code className="lessico-dashboard__code">{firmaPersonale.codice}</code>
            </div>
            <ul className="lessico-dashboard__list text-xs opacity-90 mt-2 space-y-1">
              <li>
                • Natura Prevalente: <strong>{firmaPersonale.componenti.dominante}</strong>
              </li>
              {firmaPersonale.componenti.sottodisposizione && (
                <li>
                  • Sotto-disposizione: <strong>{firmaPersonale.componenti.sottodisposizione}</strong>
                </li>
              )}
              <li>
                • Top 3 Famiglie:{' '}
                <strong>{firmaPersonale.componenti.rankingFamiglie.slice(0, 3).join(' · ')}</strong>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">2. Campo di Forze</h3>
        {!datiDisponibili ? (
          <p className="lessico-dashboard__empty">Campo di forze non disponibile.</p>
        ) : (
          <div className="lessico-dashboard__forze">
            <div className="lessico-dashboard__vettore-risultante">
              <span className="text-xs uppercase tracking-wider opacity-60">Vettore risultante</span>
              <div className="flex space-x-3 font-mono text-sm mt-1">
                <span>
                  X: <strong>{campoDiForze.risultante.x.toFixed(2)}</strong>
                </span>
                <span>
                  Y: <strong>{campoDiForze.risultante.y.toFixed(2)}</strong>
                </span>
                <span>
                  Z: <strong>{campoDiForze.risultante.z.toFixed(2)}</strong>
                </span>
              </div>
              <p className="text-xs opacity-75 mt-1">
                Magnitudine: <strong>{campoDiForze.magnitudineRisultante.toFixed(2)}</strong>
              </p>
            </div>
            {campoDiForze.polaritaDominante && (
              <p className="text-xs mt-2">
                Polarità Dominante:{' '}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  {campoDiForze.polaritaDominante}
                </span>
              </p>
            )}
            <details className="lessico-dashboard__details mt-2">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra vettori per famiglia
              </summary>
              <div className="space-y-1 mt-1 text-[11px] font-mono opacity-80 pl-2 border-l border-slate-700">
                {campoDiForze.perFamiglia.map((fam) => {
                  const m = FAMILY_CONFIG[ATLAS_FAMILY_ID_BY_KEY[fam.familyKey]]
                  return (
                    <div key={fam.familyKey} className="flex justify-between">
                      <span style={{ color: m?.baseColor }}>{fam.familyName}</span>
                      <span>
                        [{fam.vettore.x.toFixed(2)}, {fam.vettore.y.toFixed(2)},{' '}
                        {fam.vettore.z.toFixed(2)}]
                      </span>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">3. Costellazioni Semantiche</h3>
        {costellazioniAttive.length === 0 ? (
          <p className="lessico-dashboard__empty">Nessuna costellazione semantica attiva.</p>
        ) : (
          <div className="space-y-3">
            {costellazioniAttive.map((c) => {
              const activeCount = c.correntiUtenteCollegate.length
              return (
                <div
                  key={c.conceptId}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800/60"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-blue-300">{c.label}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {activeCount} {activeCount === 1 ? 'connessione' : 'connessioni'}
                    </span>
                  </div>
                  {c.correntiUtenteCollegate.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {c.correntiUtenteCollegate.map((s) => (
                        <div
                          key={s.rawKey}
                          className="flex justify-between items-center text-[10px] opacity-80"
                        >
                          <span>{s.nome}</span>
                          <span className="font-mono text-blue-400">{s.percentuale}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-50 mt-1 italic">
                      Nessuna corrente collegata attiva
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">4. Lessico Stabile e Situazionale</h3>
        <div className="space-y-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">
              Situazionale (dal test)
            </span>
            {!datiDisponibili || lessicoSituazionale.length === 0 ? (
              <p className="lessico-dashboard__empty">Nessuna parola emersa dal test.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {lessicoSituazionale.map((p) => {
                  const familyId = ATLAS_FAMILY_ID_BY_KEY[p.familyKey]
                  const match = ATLAS_WORDS.find(
                    (w) =>
                      w.nome.toLowerCase() === p.parola.toLowerCase() &&
                      w.familyId === familyId &&
                      w.subcurrentId === p.correnteKey,
                  )
                  const fColor = FAMILY_CONFIG[familyId]?.baseColor || '#fff'
                  return (
                    <button
                      key={`${p.parola}-${p.correnteKey}`}
                      type="button"
                      className="lessico-dashboard__pill lessico-dashboard__pill--situational"
                      style={{
                        borderColor: `${fColor}33`,
                        '--hover-border': fColor,
                      }}
                      onClick={() => match && onSelectWord(match)}
                      title={`Parola: ${p.parola}. Clicca per selezionare. (${p.count} risposte, file: ${p.fileKeys.join(', ')})`}
                    >
                      <span>{p.parola}</span>
                      <small className="ml-1 opacity-60 font-mono text-[9px]">{p.count}</small>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">
              Stabile (teorico di riferimento)
            </span>
            <details className="lessico-dashboard__details">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra dizionario teorico
              </summary>
              <div className="space-y-2 mt-1.5">
                {VIEW_MODEL_FAMILIES.map(({ familyId, familyName }) => {
                  const stabile = lessicoStabile[familyName]
                  const meta = FAMILY_CONFIG[familyId]
                  const forms = stabile?.vocabolarioAggettivi || []
                  return (
                    <div key={familyId} className="text-[11px]">
                      <strong style={{ color: meta?.baseColor }}>{familyName}</strong>
                      <p className="opacity-80 mt-0.5 leading-relaxed">
                        {forms.slice(0, 10).join(', ')}...
                      </p>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">5. Contrasti Lessicali</h3>
        {!datiDisponibili || contrastiLessicali.length === 0 ? (
          <p className="lessico-dashboard__empty">Contrasti lessicali non disponibili.</p>
        ) : (
          <div className="space-y-2">
            {contrastiLessicali.map((c, idx) => (
              <div
                key={idx}
                className={`p-2 rounded bg-slate-950/30 border ${
                  c.isContrastante
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-slate-800/40 opacity-80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">
                    {c.coppia[0]} <span className="opacity-40">vs</span> {c.coppia[1]}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      c.isContrastante
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {c.isContrastante ? 'Attivo' : 'Silente'}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[0]}</span>
                    <span className="block italic opacity-95">
                      {c.paroleA.slice(0, 3).join(', ') || 'Nessuna'}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono">
                      fonte: {c.fonteParoleA}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[1]}</span>
                    <span className="block italic opacity-95">
                      {c.paroleB.slice(0, 3).join(', ') || 'Nessuna'}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono">
                      fonte: {c.fonteParoleB}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {_gap && _gap.length > 0 && (
        <div className="lessico-dashboard__section lessico-dashboard__section--gap">
          <h3 className="lessico-dashboard__title opacity-50">Limiti dei dati & Gap</h3>
          <ul className="space-y-1 pl-3 list-disc text-[10px] opacity-60 leading-normal">
            {_gap.map((g, idx) => (
              <li key={idx}>{g}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Component: LessicoAtlasView ────────────────────────────────────────
export default function LessicoAtlasView({
  paroleEmerse = [],
  isMobile = false,
  viewModel = null,
}) {
  const [selectedWord, setSelectedWord] = useState(null)
  const [hoveredWordId, setHoveredWordId] = useState(null)
  const [filterFamily, setFilterFamily] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [expandedMobileFamily, setExpandedMobileFamily] = useState(null)
  const [cameraAnimating, setCameraAnimating] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const canvasRef = useRef(null)
  const layerRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0, scale: 0.5 })
  const initialCameraRef = useRef({ x: 0, y: 0, scale: 0.5 })
  const viewportSizeRef = useRef({ w: 0, h: 0, left: 0, top: 0 })
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const cameraAnimTimerRef = useRef(null)
  const searchInputRef = useRef(null)

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const emergedWords = useMemo(() => {
    const precise = new Set()
    const fallback = new Set()
    for (const p of paroleEmerse || []) {
      const nome = typeof p === 'string' ? p : p?.parola || p?.nome || ''
      if (!nome) continue
      const normalizedName = nome.toLowerCase()
      const familyId = typeof p === 'string' ? '' : ATLAS_FAMILY_ID_BY_KEY[p?.familyKey]
      const correnteKey = typeof p === 'string' ? '' : p?.correnteKey
      if (familyId && correnteKey) {
        precise.add(`${familyId}|${correnteKey}|${normalizedName}`)
      } else {
        fallback.add(normalizedName)
      }
    }
    return { precise, fallback }
  }, [paroleEmerse])

  // 120 FPS Single DOM update: applies GPU hardware transform to the entire world canvas
  const applyCameraToDOM = useCallback((camera) => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`
    }
  }, [])

  const applyCamera = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(cameraRef.current) : updater
      const clampedScale = clamp(next.scale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
      const clamped = {
        x: next.x,
        y: next.y,
        scale: clampedScale,
      }
      cameraRef.current = clamped
      applyCameraToDOM(clamped)
    },
    [applyCameraToDOM],
  )

  const beginCameraAnimation = useCallback(() => {
    setCameraAnimating(true)
    if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
    cameraAnimTimerRef.current = setTimeout(() => setCameraAnimating(false), 500)
  }, [])

  const zoomAt = useCallback(
    (targetScale, origin) => {
      const current = cameraRef.current
      const clampedScale = clamp(targetScale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
      const ratio = clampedScale / current.scale
      return {
        x: origin.x - (origin.x - current.x) * ratio,
        y: origin.y - (origin.y - current.y) * ratio,
        scale: clampedScale,
      }
    },
    [],
  )

  const resetCamera = useCallback(() => {
    beginCameraAnimation()
    applyCamera(initialCameraRef.current)
  }, [applyCamera, beginCameraAnimation])

  const zoomStep = useCallback(
    (direction) => {
      const vp = layerRef.current
      if (!vp) return
      const rect = vp.getBoundingClientRect()
      const origin = { x: rect.width / 2, y: rect.height / 2 }
      const factor = direction > 0 ? CAMERA_ZOOM_STEP : 1 / CAMERA_ZOOM_STEP
      beginCameraAnimation()
      applyCamera((prev) => zoomAt(prev.scale * factor, origin))
    },
    [applyCamera, beginCameraAnimation, zoomAt],
  )

  // Smoothly glide camera to frame a specific family sphere
  const focusFamily = useCallback(
    (familyId) => {
      const vp = layerRef.current
      if (!vp) return
      const rect = vp.getBoundingClientRect()
      const fam = FAMILY_CONFIG[familyId]
      if (!fam) {
        resetCamera()
        return
      }

      const padding = 1.35
      const targetScale = clamp(
        Math.min(rect.width / (fam.radius * 2 * padding), rect.height / (fam.radius * 2 * padding)),
        0.5,
        1.6,
      )

      const targetX = rect.width / 2 - fam.x * targetScale
      const targetY = rect.height / 2 - fam.y * targetScale

      beginCameraAnimation()
      applyCamera({
        x: targetX,
        y: targetY,
        scale: targetScale,
      })
    },
    [applyCamera, beginCameraAnimation, resetCamera],
  )

  const handleFilterChange = useCallback(
    (famId) => {
      setFilterFamily(famId)
      if (famId) {
        focusFamily(famId)
      } else {
        resetCamera()
      }
    },
    [focusFamily, resetCamera],
  )

  // Initial viewport fit
  useLayoutEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const updateFit = () => {
      const rect = layer.getBoundingClientRect()
      viewportSizeRef.current = {
        w: rect.width || 1,
        h: rect.height || 1,
        left: rect.left,
        top: rect.top,
      }

      if (rect.width > 0 && rect.height > 0) {
        const fitScale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT) * 0.94
        const initX = (rect.width - WORLD_WIDTH * fitScale) / 2
        const initY = (rect.height - WORLD_HEIGHT * fitScale) / 2
        const initial = { x: initX, y: initY, scale: fitScale }
        initialCameraRef.current = initial
        cameraRef.current = initial
        applyCameraToDOM(initial)
      }
    }

    updateFit()
    const observer = new ResizeObserver(updateFit)
    observer.observe(layer)
    return () => observer.disconnect()
  }, [applyCameraToDOM, isMobile])

  // Wheel zoom and pan
  const handleWheel = useCallback(
    (event) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.lessico-dict')) return

      event.preventDefault()
      const vp = layerRef.current
      if (!vp) return

      const { left, top } = viewportSizeRef.current
      const origin = { x: event.clientX - left, y: event.clientY - top }
      const isPinch = event.ctrlKey || event.metaKey

      if (isPinch) {
        const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY)
        applyCamera((prev) => zoomAt(prev.scale * factor, origin))
      } else {
        event.stopPropagation()
        applyCamera((prev) => ({
          x: prev.x - event.deltaX,
          y: prev.y - event.deltaY,
          scale: prev.scale,
        }))
      }
    },
    [applyCamera, zoomAt],
  )

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined
    layer.addEventListener('wheel', handleWheel, { passive: false })
    return () => layer.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // WebKit Safari Gesture
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined

    const onGestureStart = (e) => {
      e.preventDefault()
      const rect = layer.getBoundingClientRect()
      webkitGestureRef.current = {
        camera: cameraRef.current,
        origin: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      }
    }
    const onGestureChange = (e) => {
      e.preventDefault()
      const gesture = webkitGestureRef.current
      if (!gesture) return
      const nextScale = gesture.camera.scale * Math.pow(Number(e.scale) || 1, PINCH_DAMPING)
      applyCamera(zoomAt(nextScale, gesture.origin))
    }
    const onGestureEnd = () => {
      webkitGestureRef.current = null
    }

    layer.addEventListener('gesturestart', onGestureStart, { passive: false })
    layer.addEventListener('gesturechange', onGestureChange, { passive: false })
    layer.addEventListener('gestureend', onGestureEnd)
    return () => {
      layer.removeEventListener('gesturestart', onGestureStart)
      layer.removeEventListener('gesturechange', onGestureChange)
      layer.removeEventListener('gestureend', onGestureEnd)
    }
  }, [applyCamera, zoomAt])

  // Mouse / Pointer drag pan
  const handlePointerDown = useCallback((e) => {
    const target = e.target instanceof Element ? e.target : null
    if (target?.closest('.lessico-dict, .lessico-atlas__controls')) return

    pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values())
      const [a, b] = pts
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const mx = (a.clientX + b.clientX) / 2
      const my = (a.clientY + b.clientY) / 2
      const vp = layerRef.current
      const rect = vp?.getBoundingClientRect() || { left: 0, top: 0 }
      pinchRef.current = {
        camera: cameraRef.current,
        distance: dist,
        midpoint: { x: mx - rect.left, y: my - rect.top },
      }
      mouseDragRef.current = null
      return
    }

    const isInteractive = Boolean(target?.closest('.lessico-atlas__word, .lessico-atlas__family-badge'))
    if (!isInteractive) {
      mouseDragRef.current = {
        camera: cameraRef.current,
        clientX: e.clientX,
        clientY: e.clientY,
      }
      if (e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    }
  }, [])

  const handlePointerMove = useCallback(
    (e) => {
      if (!pointersRef.current.has(e.pointerId)) return
      pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

      if (pointersRef.current.size >= 2 && pinchRef.current) {
        e.preventDefault()
        const pts = Array.from(pointersRef.current.values())
        const [a, b] = pts
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
        const gesture = pinchRef.current
        const nextScale =
          gesture.camera.scale * Math.pow(dist / Math.max(1, gesture.distance), PINCH_DAMPING)
        applyCamera(zoomAt(nextScale, gesture.midpoint))
        return
      }

      if (pointersRef.current.size === 1 && mouseDragRef.current) {
        e.preventDefault()
        const drag = mouseDragRef.current
        applyCamera({
          x: drag.camera.x + e.clientX - drag.clientX,
          y: drag.camera.y + e.clientY - drag.clientY,
          scale: drag.camera.scale,
        })
      }
    },
    [applyCamera, zoomAt],
  )

  const endPointer = useCallback((e) => {
    pointersRef.current.delete(e.pointerId)
    pinchRef.current = null
    mouseDragRef.current = null
    if (e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const closeDictionary = useCallback(() => {
    setSelectedWord(null)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        if (selectedWord) {
          closeDictionary()
          return
        }
        if (showSearch) {
          setShowSearch(false)
          setSearchQuery('')
          return
        }
        resetCamera()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomStep(1)
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomStep(-1)
      }
      if (e.key === '0') {
        e.preventDefault()
        resetCamera()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedWord, showSearch, resetCamera, zoomStep, closeDictionary])

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus()
  }, [showSearch])

  useEffect(() => () => {
    if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
  }, [])

  const handleSearchToggle = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery('')
      return !prev
    })
  }, [])

  return (
    <div className={`lessico-atlas${isMobile ? ' lessico-atlas--mobile' : ''}`}>
      {/* ── Top Bar Controls ─────────────────────────────────────────────── */}
      <div className="lessico-atlas__controls">
        <AtlasLegend filterFamily={filterFamily} onFilterChange={handleFilterChange} />

        {!isMobile && (
          <div
            className="galassia-view__map-controls lessico-atlas__zoom-controls"
            role="toolbar"
            aria-label="Zoom e navigazione atlante"
          >
            <button
              type="button"
              className="galassia-view__map-control"
              aria-label="Zoom avanti"
              onClick={(e) => {
                e.stopPropagation()
                zoomStep(1)
              }}
            >
              +
            </button>
            <button
              type="button"
              className="galassia-view__map-control"
              aria-label="Zoom indietro"
              onClick={(e) => {
                e.stopPropagation()
                zoomStep(-1)
              }}
            >
              −
            </button>
            <button
              type="button"
              className="galassia-view__map-control galassia-view__map-control--ghost"
              aria-label="Centra la vista"
              onClick={(e) => {
                e.stopPropagation()
                resetCamera()
              }}
            >
              Centra
            </button>
          </div>
        )}

        {/* Search & Dashboard toggle */}
        <div
          className="lessico-atlas__search-wrap"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {viewModel && !isMobile && (
            <button
              type="button"
              className="lessico-atlas__search-btn"
              style={{
                width: 'auto',
                padding: '0 12px',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                height: '32px',
                backgroundColor: showDashboard ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderColor: showDashboard ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                color: showDashboard ? '#60a5fa' : '#cbd5e1',
                borderWidth: '1px',
              }}
              onClick={() => setShowDashboard((prev) => !prev)}
              aria-label={showDashboard ? 'Nascondi analisi avanzata' : 'Mostra analisi avanzata'}
              aria-pressed={showDashboard ? 'true' : 'false'}
            >
              {showDashboard ? 'Nascondi analisi avanzata' : 'Analisi avanzata'}
            </button>
          )}
          {showSearch && (
            <input
              ref={searchInputRef}
              type="search"
              className="lessico-atlas__search-input"
              placeholder="Cerca una parola…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cerca nel lessico emotivo"
            />
          )}
          <button
            type="button"
            className={`lessico-atlas__search-btn${showSearch ? ' is-active' : ''}`}
            onClick={handleSearchToggle}
            aria-label={showSearch ? 'Chiudi ricerca' : 'Cerca una parola'}
          >
            {showSearch ? '✕' : '⌕'}
          </button>
        </div>
      </div>

      {!isMobile ? (
        /* ── Desktop: 120 FPS GPU Accelerated Constellation Network ──────── */
        <div
          ref={layerRef}
          className="lessico-atlas__layer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onLostPointerCapture={endPointer}
          aria-label="Galassia degli stati d'animo"
        >
          <div
            ref={canvasRef}
            className={`lessico-atlas__canvas${cameraAnimating ? ' lessico-atlas__canvas--animating' : ''}`}
          >
            {/* 1. Constellation Network SVG Lines Layer */}
            <svg
              className="lessico-atlas__network-svg"
              width={WORLD_WIDTH}
              height={WORLD_HEIGHT}
              viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
            >
              <defs>
                {FAMILY_LIST.map((fam) => (
                  <radialGradient
                    key={`grad-${fam.id}`}
                    id={`grad-${fam.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor={fam.baseColor} stopOpacity="0.32" />
                    <stop offset="60%" stopColor={fam.baseColor} stopOpacity="0.08" />
                    <stop offset="100%" stopColor={fam.baseColor} stopOpacity="0" />
                  </radialGradient>
                ))}
              </defs>

              {CONSTELLATION_DATA.edges.map((edge) => {
                const isFamilyFiltered = filterFamily && filterFamily !== edge.familyId
                const isHovered = hoveredWordId && edge.wordId === hoveredWordId
                const isSelected = selectedWord && edge.wordId === selectedWord.id
                const strokeColor = edge.color || '#6366f1'

                return (
                  <line
                    key={edge.id}
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    className={`lessico-atlas__edge lessico-atlas__edge--${edge.type}${
                      isHovered || isSelected ? ' is-highlighted' : ''
                    }${isFamilyFiltered ? ' is-dimmed' : ''}`}
                    stroke={strokeColor}
                    strokeWidth={isHovered || isSelected ? 2.6 : edge.type === 'core-hub' ? 1.6 : 1.1}
                    opacity={isHovered || isSelected ? 0.95 : edge.type === 'core-hub' ? 0.35 : 0.22}
                  />
                )
              })}
            </svg>

            {/* 2. 5 Planetary Celestial Spheres */}
            {CONSTELLATION_DATA.spheres.map((sphere) => {
              const isDimmed = filterFamily && filterFamily !== sphere.id
              const diam = sphere.radius * 2

              return (
                <div
                  key={sphere.id}
                  className={`lessico-atlas__sphere${isDimmed ? ' is-dimmed' : ''}`}
                  style={{
                    left: `${sphere.x}px`,
                    top: `${sphere.y}px`,
                    width: `${diam}px`,
                    height: `${diam}px`,
                    '--sphere-color': sphere.color,
                  }}
                  aria-hidden
                >
                  <div className="lessico-atlas__sphere-ring" />
                  <div className="lessico-atlas__sphere-glow" />
                </div>
              )
            })}

            {/* 3. Family Title Badges */}
            {CONSTELLATION_DATA.spheres.map((sphere) => {
              const isDimmed = filterFamily && filterFamily !== sphere.id
              const count = ATLAS_WORDS.filter((w) => w.familyId === sphere.id).length

              return (
                <button
                  key={`badge-${sphere.id}`}
                  type="button"
                  className={`lessico-atlas__family-badge${isDimmed ? ' is-dimmed' : ''}`}
                  style={{
                    left: `${sphere.x}px`,
                    top: `${sphere.y - sphere.radius - 20}px`,
                    '--badge-color': sphere.color,
                  }}
                  onClick={() => handleFilterChange(sphere.id)}
                  title={`Esplora la costellazione ${sphere.name}`}
                >
                  <span
                    className="lessico-atlas__family-badge-dot"
                    style={{ backgroundColor: sphere.color }}
                  />
                  <span>{sphere.name}</span>
                  <span className="lessico-atlas__family-badge-count">{count} parole</span>
                </button>
              )
            })}

            {/* 4. Subcurrent Constellation Hubs */}
            {CONSTELLATION_DATA.hubs.map((hub) => {
              const isDimmed = filterFamily && filterFamily !== hub.familyId

              return (
                <div
                  key={hub.id}
                  className={`lessico-atlas__hub${isDimmed ? ' is-dimmed' : ''}`}
                  style={{
                    left: `${hub.x}px`,
                    top: `${hub.y}px`,
                    '--hub-color': hub.color,
                  }}
                  aria-hidden
                >
                  <div className="lessico-atlas__hub-dot" />
                  <div className="lessico-atlas__hub-label">{hub.title}</div>
                </div>
              )
            })}

            {/* 5. Constellation Word Nodes */}
            {CONSTELLATION_DATA.words.map((word) => {
              const isSelected = selectedWord?.id === word.id
              const isHovered = hoveredWordId === word.id
              const isFamilyFiltered = filterFamily && filterFamily !== word.familyId
              const matchesSearch =
                !normalizedSearch || word.nome.toLowerCase().includes(normalizedSearch)
              const isSearchFiltered = normalizedSearch && !matchesSearch
              const isDimmed = isFamilyFiltered || isSearchFiltered

              const normalizedName = word.nome.toLowerCase()
              const isEmerged =
                emergedWords.precise.has(`${word.familyId}|${word.subcurrentId}|${normalizedName}`) ||
                emergedWords.fallback.has(normalizedName)

              return (
                <button
                  key={word.id}
                  type="button"
                  className={`lessico-atlas__word${isSelected ? ' is-selected' : ''}${
                    isEmerged ? ' is-emerged' : ''
                  }${isHovered ? ' is-hovered' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                  style={{
                    left: `${word.x}px`,
                    top: `${word.y}px`,
                    fontSize: `${word.fontSize}px`,
                    fontWeight: word.fontWeight,
                    '--word-color': word.color,
                  }}
                  onMouseEnter={() => setHoveredWordId(word.id)}
                  onMouseLeave={() => setHoveredWordId(null)}
                  onClick={() => setSelectedWord(word)}
                  aria-expanded={isSelected || undefined}
                  aria-controls={isSelected ? 'lessico-dictionary-popover' : undefined}
                  tabIndex={isDimmed ? -1 : 0}
                >
                  <span
                    className="lessico-atlas__word-dot"
                    style={{ backgroundColor: word.color }}
                  />
                  <span>{word.nome}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Mobile: Vertical Card Stack ────────────────────────────────── */
        <div className="lessico-atlas__mobile-stack">
          {viewModel && (
            <div
              className={`lessico-mobile-card${expandedMobileFamily === 'dashboard' ? ' is-expanded' : ''}`}
              style={{ '--card-color': '#3b82f6' }}
            >
              <button
                type="button"
                className="lessico-mobile-card__header"
                onClick={() =>
                  setExpandedMobileFamily((prev) => (prev === 'dashboard' ? null : 'dashboard'))
                }
                aria-expanded={expandedMobileFamily === 'dashboard'}
              >
                <span
                  className="lessico-mobile-card__dot"
                  style={{ backgroundColor: '#3b82f6' }}
                  aria-hidden
                />
                <strong className="lessico-mobile-card__title">Analisi avanzata</strong>
                <span className="lessico-mobile-card__count">
                  {viewModel.datiDisponibili ? 'Firma & Forze' : 'Vuoto'}
                </span>
                <span className="lessico-mobile-card__chevron" aria-hidden>
                  {expandedMobileFamily === 'dashboard' ? '▲' : '▼'}
                </span>
              </button>
              {expandedMobileFamily === 'dashboard' && (
                <div className="lessico-mobile-card__body" style={{ padding: '1rem' }}>
                  <AnalisiDashboard
                    viewModel={viewModel}
                    onSelectWord={(w) => {
                      setSelectedWord(w)
                      setExpandedMobileFamily(null)
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {FAMILY_LIST.map((fam) => (
            <MobileAtlasCard
              key={fam.id}
              fam={fam}
              isExpanded={expandedMobileFamily === fam.id}
              onToggle={() =>
                setExpandedMobileFamily((prev) => (prev === fam.id ? null : fam.id))
              }
              onSelectWord={(w) => {
                setSelectedWord(w)
                setExpandedMobileFamily(null)
              }}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* ── Dictionary Panel or Advanced Dashboard ───────────────────────── */}
      {selectedWord ? (
        <DictionaryPanel
          word={selectedWord}
          onClose={closeDictionary}
          onSelectWord={setSelectedWord}
          viewModel={viewModel}
        />
      ) : !isMobile && showDashboard && viewModel ? (
        <aside className="lessico-dict" aria-label="Analisi lessicale avanzata">
          <div className="lessico-dict__bezel" style={{ '--dict-color': '#3b82f6' }}>
            <header
              className="lessico-dict__head"
              style={{ borderBottomColor: 'rgba(59, 130, 246, 0.2)' }}
            >
              <p className="lessico-dict__kicker" style={{ color: '#60a5fa' }}>
                Analisi avanzata
              </p>
              <button
                type="button"
                className="lessico-dict__close"
                onClick={() => setShowDashboard(false)}
                aria-label="Nascondi analisi avanzata"
              >
                ✕
              </button>
            </header>
            <div className="lessico-dict__body" style={{ padding: '1rem', overflowY: 'auto' }}>
              <AnalisiDashboard viewModel={viewModel} onSelectWord={(w) => setSelectedWord(w)} />
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
