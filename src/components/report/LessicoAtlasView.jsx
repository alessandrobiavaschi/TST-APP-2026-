import React, { useState, useCallback, useRef, useEffect } from 'react'
import { GALAXY_THEORY_BY_DISPOSITION } from '../../config/galaxyTheoryContent.ts'

const GOLDEN_ANGLE = 2.399963229728653
const CAMERA_MIN_SCALE = 0.82
const CAMERA_MAX_SCALE = 4.8
const CAMERA_ZOOM_STEP = 1.25
const WHEEL_ZOOM_INTENSITY_PX = 0.0022
const WHEEL_ZOOM_INTENSITY_LINE = 0.072
const PINCH_DAMPING = 0.46

function seededRnd(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function clampCameraToViewport(camera, width = 0, height = 0) {
  const scale = clamp(camera.scale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
  if (!width || !height) return { x: camera.x || 0, y: camera.y || 0, scale }

  if (scale <= 1) {
    return {
      x: (width * (1 - scale)) / 2,
      y: (height * (1 - scale)) / 2,
      scale,
    }
  }

  return {
    x: clamp(camera.x || 0, width * (1 - scale), 0),
    y: clamp(camera.y || 0, height * (1 - scale), 0),
    scale,
  }
}

// ─── Family metadata ────────────────────────────────────────────────────────────
const FAMILY_META = {
  malinconica_nostalgica: {
    id: 'malinconica_nostalgica',
    label: 'Malinconia',
    colors: ['#818cf8', '#6366f1', '#7c3aed', '#a5b4fc', '#4338ca', '#c084fc'],
    baseColor: '#6366f1',
    nebula: 'rgba(67, 56, 202, 0.18)',
    anchor: { x: 17, y: 50 },
    maxRx: 24,
    maxRy: 30,
  },
  collerico_volitiva: {
    id: 'collerico_volitiva',
    label: 'Volitività',
    colors: ['#f87171', '#ef4444', '#dc2626', '#fb7185', '#be123c', '#c026d3'],
    baseColor: '#ef4444',
    nebula: 'rgba(153, 27, 27, 0.18)',
    anchor: { x: 83, y: 50 },
    maxRx: 23,
    maxRy: 30,
  },
  flemmatica: {
    id: 'flemmatica',
    label: 'Calma',
    colors: ['#4ade80', '#22c55e', '#16a34a', '#34d399', '#0d9488', '#2dd4bf'],
    baseColor: '#22c55e',
    nebula: 'rgba(22, 101, 52, 0.18)',
    anchor: { x: 50, y: 52 },
    maxRx: 21,
    maxRy: 22,
  },
  entusiasmo: {
    id: 'entusiasmo',
    label: 'Entusiasmo',
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#f97316', '#fb923c'],
    baseColor: '#f59e0b',
    nebula: 'rgba(146, 64, 14, 0.18)',
    anchor: { x: 50, y: 14 },
    maxRx: 28,
    maxRy: 18,
  },
  agnostica_anaffettiva: {
    id: 'agnostica_anaffettiva',
    label: 'Anaffettività',
    colors: ['#94a3b8', '#64748b', '#cbd5e1', '#9ca3af', '#475569', '#e2e8f0'],
    baseColor: '#94a3b8',
    nebula: 'rgba(71, 85, 105, 0.18)',
    anchor: { x: 50, y: 84 },
    maxRx: 28,
    maxRy: 17,
  },
}

const FAMILY_ORDER = [
  'malinconica_nostalgica',
  'collerico_volitiva',
  'flemmatica',
  'entusiasmo',
  'agnostica_anaffettiva',
]

// ─── Build word atlas (static, computed once) ────────────────────────────────
function buildAtlasWords() {
  const all = []
  let globalIdx = 0

  for (const familyId of FAMILY_ORDER) {
    const theory = GALAXY_THEORY_BY_DISPOSITION[familyId]
    const meta = FAMILY_META[familyId]
    if (!theory || !meta) continue

    const { anchor, maxRx, maxRy, colors } = meta

    const raw = []
    for (let ci = 0; ci < theory.currents.length; ci++) {
      const c = theory.currents[ci]
      for (const state of c.states) {
        raw.push({
          nome: state,
          ci,
          subcurrentId: c.rawKey,
          subcurrentTitle: c.title,
          subcurrentDescription: c.description,
          subcurrentInterval: c.interval,
        })
      }
    }

    const seen = new Set()
    const unique = raw.filter((w) => {
      const k = w.nome.toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })

    const n = unique.length
    const bigCount = Math.max(1, Math.round(n * 0.1))
    const medCount = Math.max(1, Math.round(n * 0.2))

    for (let i = 0; i < n; i++) {
      const w = unique[i]
      const tier = i < bigCount ? 'big' : i < bigCount + medCount ? 'medium' : 'small'

      const rnd = seededRnd(globalIdx)
      const rnd2 = seededRnd(globalIdx + 0.5)
      const fontSize =
        tier === 'big'
          ? 18 + Math.round(rnd * 6)
          : tier === 'medium'
            ? 12 + Math.round(rnd * 4)
            : 8 + Math.round(rnd * 3)

      const fontWeight = tier === 'big' ? 700 : tier === 'medium' ? 550 : 400
      const angle = i * GOLDEN_ANGLE + rnd2 * 0.15
      const radiusRatio = Math.sqrt(i / Math.max(1, n))
      const jitter = 0.75 + seededRnd(globalIdx + 0.7) * 0.5
      const rx = maxRx * radiusRatio * jitter
      const ry = maxRy * radiusRatio * jitter

      const x = anchor.x + rx * Math.cos(angle)
      const y = anchor.y + ry * Math.sin(angle)

      const colorIdx = (w.ci * 2 + i) % colors.length
      const color = colors[colorIdx]
      const opacity = tier === 'big' ? 0.92 : tier === 'medium' ? 0.78 : 0.55

      all.push({
        id: `${familyId}-${i}`,
        nome: w.nome,
        familyId,
        familyLabel: meta.label,
        familyColor: meta.baseColor,
        subcurrentId: w.subcurrentId,
        subcurrentTitle: w.subcurrentTitle,
        subcurrentDescription: w.subcurrentDescription,
        subcurrentInterval: w.subcurrentInterval,
        tier,
        fontSize,
        fontWeight,
        color,
        opacity,
        x: Math.max(1.5, Math.min(98.5, x)),
        y: Math.max(2, Math.min(97, y)),
      })
      globalIdx++
    }
  }

  for (const w of all) {
    w.nearbyWords = all
      .filter((v) => v.subcurrentId === w.subcurrentId && v.id !== w.id)
      .slice(0, 6)
      .map((v) => v.nome)
  }

  return all
}

const ATLAS_WORDS = buildAtlasWords()
const FAMILY_LIST = FAMILY_ORDER.map((id) => ({ id, ...FAMILY_META[id] }))
const CAMERA_RESET = { x: 0, y: 0, scale: 1 }

// ─── Dictionary panel ─────────────────────────────────────────────────────────
function DictionaryPanel({ word, onClose, onSelectWord, viewModel, placement }) {
  if (!word) return null
  const meta = FAMILY_META[word.familyId]

  const dynamicWordInfo = viewModel?.lessicoSituazionale?.find(
    (p) => p.parola.toLowerCase() === word.nome.toLowerCase()
  )

  return (
    <aside
      className={`lessico-dict${placement ? ` lessico-dict--inline lessico-dict--${placement.side}` : ''}`}
      style={placement?.style}
      aria-label="Dizionario emotivo"
    >
      <div className="lessico-dict__bezel" style={{ '--dict-color': word.familyColor }}>
        <header className="lessico-dict__head">
          <p className="lessico-dict__kicker">Dizionario emotivo</p>
          <button
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
            {word.subcurrentInterval && (
              <div>
                <dt>Intervallo musicale</dt>
                <dd>{word.subcurrentInterval}</dd>
              </div>
            )}
            <div>
              <dt>Fonte Lessico</dt>
              <dd style={{ color: dynamicWordInfo ? '#22c55e' : '#cbd5e1', fontWeight: 600 }}>
                {dynamicWordInfo ? 'Situazionale (dal test)' : 'Stabile (teoria)'}
              </dd>
            </div>
            {dynamicWordInfo?.fileKeys && dynamicWordInfo.fileKeys.length > 0 && (
              <div>
                <dt>Tracce collegate</dt>
                <dd style={{ color: '#60a5fa' }}>
                  {dynamicWordInfo.fileKeys.map((f) => `Traccia ${f.replace('File_', '')}`).join(', ')}
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
                    (v) => v.nome === nome && v.familyId === word.familyId,
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
        </div>
      </div>
    </aside>
  )
}

// ─── Family filter legend ─────────────────────────────────────────────────────
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

// ─── Mobile card ──────────────────────────────────────────────────────────────
function MobileAtlasCard({ fam, isExpanded, onToggle, onSelectWord, searchQuery }) {
  const meta = FAMILY_META[fam.id]
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
        <span className="lessico-mobile-card__dot" style={{ backgroundColor: meta.baseColor }} aria-hidden />
        <strong className="lessico-mobile-card__title">{meta.label}</strong>
        <span className="lessico-mobile-card__count">{words.length} parole</span>
        <span className="lessico-mobile-card__chevron" aria-hidden>{isExpanded ? '▲' : '▼'}</span>
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

// ─── Analisi Dashboard 2.0 ────────────────────────────────────────────────────
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

  return (
    <div className="lessico-dashboard">
      {/* 1. FIRMA PERSONALE */}
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
              <li>• Natura Prevalente: <strong>{firmaPersonale.componenti.dominante}</strong></li>
              {firmaPersonale.componenti.sottodisposizione && (
                <li>• Sotto-disposizione: <strong>{firmaPersonale.componenti.sottodisposizione}</strong></li>
              )}
              <li>• Top 3 Famiglie: <strong>{firmaPersonale.componenti.rankingFamiglie.slice(0, 3).join(' · ')}</strong></li>
            </ul>
          </div>
        )}
      </div>

      {/* 2. CAMPO DI FORZE LESSICALE */}
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">2. Campo di Forze</h3>
        {!datiDisponibili ? (
          <p className="lessico-dashboard__empty">Campo di forze non disponibile.</p>
        ) : (
          <div className="lessico-dashboard__forze">
            <div className="lessico-dashboard__vettore-risultante">
              <span className="text-xs uppercase tracking-wider opacity-60">Vettore risultante</span>
              <div className="flex space-x-3 font-mono text-sm mt-1">
                <span>X: <strong>{campoDiForze.risultante.x.toFixed(2)}</strong></span>
                <span>Y: <strong>{campoDiForze.risultante.y.toFixed(2)}</strong></span>
                <span>Z: <strong>{campoDiForze.risultante.z.toFixed(2)}</strong></span>
              </div>
              <p className="text-xs opacity-75 mt-1">
                Magnitudine: <strong>{campoDiForze.magnitudineRisultante.toFixed(2)}</strong>
              </p>
            </div>
            {campoDiForze.polaritaDominante && (
              <p className="text-xs mt-2">
                Polarità Dominante: <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">{campoDiForze.polaritaDominante}</span>
              </p>
            )}
            <details className="lessico-dashboard__details mt-2">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra vettori per famiglia
              </summary>
              <div className="space-y-1 mt-1 text-[11px] font-mono opacity-80 pl-2 border-l border-slate-700">
                {campoDiForze.perFamiglia.map((fam) => {
                  const m = FAMILY_META[fam.familyName]
                  return (
                    <div key={fam.familyKey} className="flex justify-between">
                      <span style={{ color: m?.baseColor }}>{fam.familyName}</span>
                      <span>[{fam.vettore.x.toFixed(2)}, {fam.vettore.y.toFixed(2)}, {fam.vettore.z.toFixed(2)}]</span>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* 3. COSTELLAZIONI SEMANTICHE */}
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">3. Costellazioni Semantiche</h3>
        {costellazioniSemantiche.length === 0 ? (
          <p className="lessico-dashboard__empty">Nessuna costellazione semantica attiva.</p>
        ) : (
          <div className="space-y-3">
            {costellazioniSemantiche.map((c) => {
              const activeCount = c.correntiUtenteCollegate.length
              return (
                <div key={c.conceptId} className="p-2 rounded bg-slate-950/40 border border-slate-800/60">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-blue-300">{c.label}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {activeCount} {activeCount === 1 ? 'connessione' : 'connessioni'}
                    </span>
                  </div>
                  {c.correntiUtenteCollegate.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {c.correntiUtenteCollegate.map((s) => (
                        <div key={s.rawKey} className="flex justify-between items-center text-[10px] opacity-80">
                          <span>{s.nome}</span>
                          <span className="font-mono text-blue-400">{s.percentuale}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-50 mt-1 italic">Nessuna corrente collegata attiva</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. LESSICO STABILE E SITUAZIONALE */}
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">4. Lessico Stabile e Situazionale</h3>
        <div className="space-y-3">
          {/* Situazionale */}
          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">Situazionale (dal test)</span>
            {!datiDisponibili || lessicoSituazionale.length === 0 ? (
              <p className="lessico-dashboard__empty">Nessuna parola emersa dal test.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {lessicoSituazionale.map((p) => {
                  const match = ATLAS_WORDS.find(
                    (w) => w.nome.toLowerCase() === p.parola.toLowerCase() && w.familyId === p.familyName
                  )
                  const fColor = FAMILY_META[p.familyName]?.baseColor || '#fff'
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

          {/* Stabile (Teoria) */}
          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">Stabile (teorico di riferimento)</span>
            <details className="lessico-dashboard__details">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra dizionario teorico
              </summary>
              <div className="space-y-2 mt-1.5">
                {FAMILY_ORDER.map((famName) => {
                  const stabile = lessicoStabile[famName]
                  const meta = FAMILY_META[famName]
                  const forms = stabile?.vocabolarioAggettivi || []
                  return (
                    <div key={famName} className="text-[11px]">
                      <strong style={{ color: meta?.baseColor }}>{famName}</strong>
                      <p className="opacity-80 mt-0.5 leading-relaxed">{forms.slice(0, 10).join(', ')}...</p>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* 5. CONTRASTI LESSICALI */}
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">5. Contrasti Lessicali</h3>
        {!datiDisponibili || contrastiLessicali.length === 0 ? (
          <p className="lessico-dashboard__empty">Contrasti lessicali non disponibili.</p>
        ) : (
          <div className="space-y-2">
            {contrastiLessicali.map((c, idx) => (
              <div key={idx} className={`p-2 rounded bg-slate-950/30 border ${c.isContrastante ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-800/40 opacity-80'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{c.coppia[0]} <span className="opacity-40">vs</span> {c.coppia[1]}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${c.isContrastante ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                    {c.isContrastante ? 'Attivo' : 'Silente'}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[0]}</span>
                    <span className="block italic opacity-95">{c.paroleA.slice(0, 3).join(', ') || 'Nessuna'}</span>
                    <span className="text-[9px] opacity-40 font-mono">fonte: {c.fonteParoleA}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[1]}</span>
                    <span className="block italic opacity-95">{c.paroleB.slice(0, 3).join(', ') || 'Nessuna'}</span>
                    <span className="text-[9px] opacity-40 font-mono">fonte: {c.fonteParoleB}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. GAP E COMPORTAMENTO GAP ONESTO */}
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function LessicoAtlasView({ paroleEmerse = [], isMobile = false, viewModel = null }) {
  const [selectedWord, setSelectedWord] = useState(null)
  const [hoveredWordId, setHoveredWordId] = useState(null)
  const [filterFamily, setFilterFamily] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [expandedMobileFamily, setExpandedMobileFamily] = useState(null)
  const [camera, setCamera] = useState(CAMERA_RESET)
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 })
  const [cameraAnimating, setCameraAnimating] = useState(false)
  const [showDashboard, setShowDashboard] = useState(true)

  const canvasRef = useRef(null)
  const layerRef = useRef(null)
  const cameraRef = useRef(CAMERA_RESET)
  const viewportSizeRef = useRef({ w: 0, h: 0 })
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const cameraAnimTimerRef = useRef(null)
  const cameraRafRef = useRef(0)
  const searchInputRef = useRef(null)

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const emergedSet = React.useMemo(() => {
    const s = new Set()
    for (const p of paroleEmerse || []) {
      const nome = typeof p === 'string' ? p : (p?.parola || p?.nome || '')
      if (nome) s.add(nome.toLowerCase())
    }
    return s
  }, [paroleEmerse])

  const getWordOpacity = useCallback(
    (word) => {
      const matchesSearch = !normalizedSearch || word.nome.toLowerCase().includes(normalizedSearch)
      const matchesFilter = !filterFamily || word.familyId === filterFamily
      if (!matchesSearch || !matchesFilter) return 0.05
      if (normalizedSearch && matchesSearch) return 1
      return word.opacity
    },
    [filterFamily, normalizedSearch],
  )

  const getAtlasPoint = useCallback(
    (point) => point,
    [],
  )

  const wordFontScale = 1 / Math.sqrt(camera.scale)

  // ── Camera helpers ─────────────────────────────────────────────────────────
  const applyCamera = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(cameraRef.current) : updater
    const { w, h } = viewportSizeRef.current
    const clamped = clampCameraToViewport(next, w, h)
    cameraRef.current = clamped

    if (cameraRafRef.current) return
    cameraRafRef.current = window.requestAnimationFrame(() => {
      cameraRafRef.current = 0
      setCamera(cameraRef.current)
    })
  }, [])

  const beginCameraAnimation = useCallback(() => {
    setCameraAnimating(true)
    if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
    cameraAnimTimerRef.current = setTimeout(() => setCameraAnimating(false), 600)
  }, [])

  const resetCamera = useCallback(() => {
    beginCameraAnimation()
    cameraRef.current = CAMERA_RESET
    setCamera(CAMERA_RESET)
  }, [beginCameraAnimation])

  const zoomAt = useCallback((scale, origin, w, h, prev = cameraRef.current) => {
    const clamped = clamp(scale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
    const worldX = (origin.x - prev.x) / Math.max(prev.scale, 0.001)
    const worldY = (origin.y - prev.y) / Math.max(prev.scale, 0.001)
    return clampCameraToViewport({
      x: origin.x - worldX * clamped,
      y: origin.y - worldY * clamped,
      scale: clamped,
    }, w, h)
  }, [])

  const zoomStep = useCallback((direction) => {
    const vp = layerRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    viewportSizeRef.current = { w: rect.width || 1, h: rect.height || 1 }
    const origin = { x: rect.width / 2, y: rect.height / 2 }
    const factor = direction > 0 ? CAMERA_ZOOM_STEP : 1 / CAMERA_ZOOM_STEP
    beginCameraAnimation()
    applyCamera((prev) => zoomAt(
      prev.scale * factor,
      origin,
      rect.width,
      rect.height,
    ))
  }, [applyCamera, beginCameraAnimation, zoomAt])

  // ── Wheel (trackpad pinch + scroll pan) ───────────────────────────────────
  const handleWheel = useCallback((event) => {
    event.preventDefault()
    const vp = layerRef.current
    if (!vp) return

    const rect = vp.getBoundingClientRect()
    viewportSizeRef.current = { w: rect.width || 1, h: rect.height || 1 }
    const origin = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const isPinch = event.ctrlKey || event.metaKey

    if (isPinch) {
      const intensity = event.deltaMode === 1 ? WHEEL_ZOOM_INTENSITY_LINE : WHEEL_ZOOM_INTENSITY_PX
      applyCamera((prev) =>
        zoomAt(prev.scale * Math.exp(-event.deltaY * intensity), origin, rect.width, rect.height),
      )
    } else {
      event.stopPropagation()
      applyCamera((prev) => ({
        x: prev.x - event.deltaX,
        y: prev.y - event.deltaY,
        scale: prev.scale,
      }))
    }
  }, [applyCamera, zoomAt])

  // Register wheel with passive:false so preventDefault works
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined
    layer.addEventListener('wheel', handleWheel, { passive: false })
    return () => layer.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || typeof ResizeObserver === 'undefined') return undefined

    const updateSize = () => {
      const rect = layer.getBoundingClientRect()
      const next = { w: rect.width || 1, h: rect.height || 1 }
      viewportSizeRef.current = next
      setViewportSize(next)
    }
    const observer = new ResizeObserver(updateSize)
    updateSize()
    observer.observe(layer)
    return () => observer.disconnect()
  }, [isMobile])

  // ── WebKit gesture (Safari two-finger pinch) ───────────────────────────────
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined

    const onGestureStart = (e) => {
      e.preventDefault()
      const vp = layer
      const rect = vp.getBoundingClientRect()
      const fallbackX = rect.left + rect.width / 2
      const fallbackY = rect.top + rect.height / 2
      const clientX = Number.isFinite(e.clientX) ? e.clientX : fallbackX
      const clientY = Number.isFinite(e.clientY) ? e.clientY : fallbackY
      viewportSizeRef.current = { w: rect.width || 1, h: rect.height || 1 }
      webkitGestureRef.current = {
        camera: cameraRef.current,
        origin: { x: clientX - rect.left, y: clientY - rect.top },
        size: { w: rect.width || 1, h: rect.height || 1 },
      }
    }
    const onGestureChange = (e) => {
      e.preventDefault()
      const gesture = webkitGestureRef.current
      if (!gesture) return
      const nextScale = gesture.camera.scale * Math.pow(Number(e.scale) || 1, PINCH_DAMPING)
      applyCamera(zoomAt(nextScale, gesture.origin, gesture.size.w, gesture.size.h))
    }
    const onGestureEnd = () => { webkitGestureRef.current = null }

    layer.addEventListener('gesturestart', onGestureStart, { passive: false })
    layer.addEventListener('gesturechange', onGestureChange, { passive: false })
    layer.addEventListener('gestureend', onGestureEnd)
    return () => {
      layer.removeEventListener('gesturestart', onGestureStart)
      layer.removeEventListener('gesturechange', onGestureChange)
      layer.removeEventListener('gestureend', onGestureEnd)
    }
  }, [applyCamera, zoomAt])

  // ── Pointer drag (mouse pan) ───────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    const target = e.target instanceof Element ? e.target : null
    const isControl = Boolean(target?.closest('.lessico-atlas__controls, .lessico-dict, .lessico-atlas__zoom-controls, .lessico-atlas__word'))

    pointersRef.current.set(e.pointerId, { pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY })

    if (!isControl) {
      if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
    }

    if (pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values())
      const [a, b] = pts
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const mx = (a.clientX + b.clientX) / 2
      const my = (a.clientY + b.clientY) / 2
      const vp = layerRef.current
      const rect = vp?.getBoundingClientRect() || { left: 0, top: 0 }
      viewportSizeRef.current = { w: rect.width || 1, h: rect.height || 1 }
      pinchRef.current = {
        camera: cameraRef.current,
        distance: dist,
        midpoint: { x: mx - rect.left, y: my - rect.top },
        size: { w: rect.width || 1, h: rect.height || 1 },
      }
      mouseDragRef.current = null
      return
    }

    mouseDragRef.current = isControl
      ? null
      : {
          camera: cameraRef.current,
          clientX: e.clientX,
          clientY: e.clientY,
        }
  }, [])

  const handlePointerMove = useCallback((e) => {
    const stored = pointersRef.current.get(e.pointerId)
    if (!stored) return
    pointersRef.current.set(e.pointerId, { ...stored, clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      e.preventDefault()
      const pts = Array.from(pointersRef.current.values())
      const [a, b] = pts
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const gesture = pinchRef.current
      const nextScale =
        gesture.camera.scale * Math.pow(dist / Math.max(1, gesture.distance), PINCH_DAMPING)
      applyCamera(zoomAt(nextScale, gesture.midpoint, gesture.size.w, gesture.size.h))
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

  }, [applyCamera, zoomAt])

  const endPointer = useCallback((e) => {
    pointersRef.current.delete(e.pointerId)
    pinchRef.current = null
    mouseDragRef.current = null
    if (e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        if (selectedWord) { setSelectedWord(null); return }
        if (showSearch) { setShowSearch(false); setSearchQuery(''); return }
        resetCamera()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); setShowSearch(true) }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomStep(1) }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomStep(-1) }
      if (e.key === '0') { e.preventDefault(); resetCamera() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedWord, showSearch, resetCamera, zoomStep])

  // ── Search focus ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus()
  }, [showSearch])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
    if (cameraRafRef.current) cancelAnimationFrame(cameraRafRef.current)
  }, [])

  const handleSearchToggle = useCallback(() => {
    setShowSearch((prev) => { if (prev) setSearchQuery(''); return !prev })
  }, [])

  return (
    <div className={`lessico-atlas${isMobile ? ' lessico-atlas--mobile' : ''}`}>

      {/* Controls bar — below the chrome header */}
      <div className="lessico-atlas__controls">
        <AtlasLegend filterFamily={filterFamily} onFilterChange={setFilterFamily} />

        {/* Zoom controls — same style as galassia-view__map-controls */}
        {!isMobile && (
          <div className="galassia-view__map-controls lessico-atlas__zoom-controls" role="toolbar" aria-label="Zoom e navigazione atlante">
            <button type="button" className="galassia-view__map-control" aria-label="Zoom avanti" onClick={(e) => { e.stopPropagation(); zoomStep(1) }}>+</button>
            <button type="button" className="galassia-view__map-control" aria-label="Zoom indietro" onClick={(e) => { e.stopPropagation(); zoomStep(-1) }}>−</button>
            <button type="button" className="galassia-view__map-control galassia-view__map-control--ghost" aria-label="Centra la vista" onClick={(e) => { e.stopPropagation(); resetCamera() }}>Centra</button>
          </div>
        )}

        {/* Search & Analisi Toggle */}
        <div className="lessico-atlas__search-wrap" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              aria-label={showDashboard ? 'Nascondi dashboard analisi' : 'Mostra dashboard analisi lessicale'}
              aria-pressed={showDashboard ? 'true' : 'false'}
            >
              {showDashboard ? 'Nascondi Analisi' : 'Analisi Lessicale'}
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
        /* ── Desktop: zoomable word cloud ───────────────────────────────── */
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
            style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}
          >
            {/* Nebula backgrounds */}
            {FAMILY_LIST.map((fam) => {
              const pos = getAtlasPoint(fam.anchor)
              return (
                <div
                  key={fam.id}
                  className={`lessico-atlas__nebula${filterFamily && filterFamily !== fam.id ? ' is-dimmed' : ''}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    '--nebula-color': fam.nebula,
                  }}
                  aria-hidden
                />
              )
            })}

            {/* Family zone labels */}
            {FAMILY_LIST.map((fam) => {
              const pos = getAtlasPoint(fam.anchor)
              return (
                <div
                  key={fam.id}
                  className={`lessico-atlas__zone-label${filterFamily && filterFamily !== fam.id ? ' is-dimmed' : ''}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, '--zone-color': fam.baseColor }}
                  aria-hidden
                >
                  {fam.label}
                </div>
              )
            })}

            {/* Words */}
            {ATLAS_WORDS.map((word) => {
              const opacity = getWordOpacity(word)
              const isSelected = selectedWord?.id === word.id
              const isHovered = hoveredWordId === word.id
              const isEmerged = emergedSet.has(word.nome.toLowerCase())
              const pos = getAtlasPoint(word)
              return (
                <button
                  key={word.id}
                  type="button"
                  className={`lessico-atlas__word${isSelected ? ' is-selected' : ''}${isEmerged ? ' is-emerged' : ''}${isHovered ? ' is-hovered' : ''}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    fontSize: isSelected
                      ? `${clamp(word.fontSize * 1.75, 28, 42) * wordFontScale}px`
                      : `${word.fontSize * wordFontScale}px`,
                    fontWeight: word.fontWeight,
                    '--word-color': word.color,
                    color: word.color,
                    opacity,
                    zIndex: isSelected ? 120 : isHovered ? 50 : word.tier === 'big' ? 20 : word.tier === 'medium' ? 15 : 10,
                  }}
                  onMouseEnter={() => setHoveredWordId(word.id)}
                  onMouseLeave={() => setHoveredWordId(null)}
                  onClick={() => setSelectedWord(word)}
                >
                  {word.nome}
                </button>
              )
            })}
          </div>

          {selectedWord && (
            <DictionaryPanel
              word={selectedWord}
              onClose={() => setSelectedWord(null)}
              onSelectWord={setSelectedWord}
              viewModel={viewModel}
              placement={{
                side: camera.x + (selectedWord.x / 100) * viewportSize.w * camera.scale > viewportSize.w * 0.62
                  ? 'left'
                  : 'right',
                style: {
                  '--dict-anchor-x': `calc(${selectedWord.x * camera.scale}% + ${camera.x}px)`,
                  '--dict-anchor-y': `calc(${selectedWord.y * camera.scale}% + ${camera.y}px)`,
                },
              }}
            />
          )}
        </div>
      ) : (
        /* ── Mobile: vertical card stack ────────────────────────────────── */
        <div className="lessico-atlas__mobile-stack">
          {viewModel && (
            <div
              className={`lessico-mobile-card${expandedMobileFamily === 'dashboard' ? ' is-expanded' : ''}`}
              style={{ '--card-color': '#3b82f6' }}
            >
              <button
                type="button"
                className="lessico-mobile-card__header"
                onClick={() => setExpandedMobileFamily((prev) => (prev === 'dashboard' ? null : 'dashboard'))}
                aria-expanded={expandedMobileFamily === 'dashboard'}
              >
                <span className="lessico-mobile-card__dot" style={{ backgroundColor: '#3b82f6' }} aria-hidden />
                <strong className="lessico-mobile-card__title">Analisi Lessicale 2.0</strong>
                <span className="lessico-mobile-card__count">
                  {viewModel.datiDisponibili ? 'Firma & Forze' : 'Vuoto'}
                </span>
                <span className="lessico-mobile-card__chevron" aria-hidden>{expandedMobileFamily === 'dashboard' ? '▲' : '▼'}</span>
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
              onToggle={() => setExpandedMobileFamily((prev) => (prev === fam.id ? null : fam.id))}
              onSelectWord={(w) => { setSelectedWord(w); setExpandedMobileFamily(null) }}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Dictionary panel */}
      {selectedWord && isMobile ? (
        <DictionaryPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onSelectWord={setSelectedWord}
          viewModel={viewModel}
        />
      ) : !selectedWord && !isMobile && showDashboard && viewModel ? (
        <aside className="lessico-dict" aria-label="Analisi lessicale">
          <div className="lessico-dict__bezel" style={{ '--dict-color': '#3b82f6', width: '340px' }}>
            <header className="lessico-dict__head" style={{ borderBottomColor: 'rgba(59, 130, 246, 0.2)' }}>
              <p className="lessico-dict__kicker" style={{ color: '#60a5fa' }}>Analisi Lessicale 2.0</p>
              <button
                type="button"
                className="lessico-dict__close"
                onClick={() => setShowDashboard(false)}
                aria-label="Nascondi analisi lessicale"
              >
                ✕
              </button>
            </header>
            <div className="lessico-dict__body" style={{ padding: '1rem', overflowY: 'auto' }}>
              <AnalisiDashboard
                viewModel={viewModel}
                onSelectWord={(w) => setSelectedWord(w)}
              />
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
