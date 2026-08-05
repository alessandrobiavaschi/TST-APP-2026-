/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { db } from '../firebaseConfig.js'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { testSchema } from '../dbSchema.js'
import {
  TEST_RESULTS_COLLECTION,
  TEST_RESULT_USER_ID_FIELD,
  AREE_COLLECTION,
} from '../firestorePaths.js'
import { saveTestResultForUser } from '../firestore/testResults.js'
import {
  computeColorTotals,
  normalizeLevels,
  formatDateShort,
  downloadCsvSingleRecord,
} from '../utils/reportRecordUtils.js'
import { parseMatriceCsv } from '../utils/matriceCsv.js'
import { MALINCONICA_NOSTALGICA_LABEL, formatSubcategoryLabel } from '../utils/reportTaxonomy.js'

export function computeAgeFromBirthDate(dateValue) {
  if (!dateValue) return null
  let date
  if (dateValue.toDate) {
    date = dateValue.toDate()
  } else {
    const parsed = new Date(dateValue)
    if (Number.isNaN(parsed.getTime())) return null
    date = parsed
  }
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const m = now.getMonth() - date.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
    age -= 1
  }
  return age
}

export { computeColorTotals, normalizeLevels, formatDateShort, downloadCsvSingleRecord }

function downloadCsvFromRecords(records, filename = 'tst_matrice_archivio.csv') {
  if (!records.length) return
  const headerKeys = Object.keys(testSchema)
  const header = ['id', 'areaId', ...headerKeys]

  const escapeValue = (value) => {
    if (value == null) return ''
    if (value.toDate) {
      return value.toDate().toISOString()
    }
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const idFromRaw = (raw) => [raw?.Nome, raw?.Cognome].filter((v) => v != null && String(v).trim()).join(' ').trim() || ''
  const rows = records.map((r) =>
    [escapeValue(idFromRaw(r.raw)), escapeValue(r.raw.areaId || ''), ...headerKeys.map((key) => escapeValue(r.raw[key]))].join(','),
  )

  const csvContent = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function buildResultRecord(docId, data) {
  const age = computeAgeFromBirthDate(data.Data_Nascita)
  const { blu, rosso, verde, giallo, grigio } = computeColorTotals(data)
  return {
    id: docId,
    raw: data,
    age,
    totals: { blu, rosso, verde, giallo, grigio },
  }
}

/* Ordine: Blu, Rosso, Giallo, Verde, Grigio – etichette = le 5 famiglie emotive. */
const RADAR_FAMIGLIE = [
  { subject: 'Malinconica', key: 'blu', color: '#3b82f6' },
  { subject: 'Marziale', key: 'rosso', color: '#ef4444' },
  { subject: 'Entusiasta', key: 'giallo', color: '#eab308' },
  { subject: 'Flemmatica', key: 'verde', color: '#22c55e' },
  { subject: 'Razionale', key: 'grigio', color: '#6b7280' },
]

/** Etichette colonne matrice risultati: le 5 macro-aree cromatiche del punteggio. */
const MATRICE_HEADERS = [
  { key: 'blu', label: 'Malinconica' },
  { key: 'rosso', label: 'Marziale' },
  { key: 'verde', label: 'Flemmatica' },
  { key: 'giallo', label: 'Entusiasta' },
  { key: 'grigio', label: 'Razionale' },
]

const SOTTOCORRENTE_KEYS_BY_FAMILY = {
  blu: ['BLU_1_Depressiva', 'BLU_2_Lunare', 'BLU_3_Nostalgia', 'BLU_4_Solare'],
  rosso: ['ROSSO_1_Assertivita', 'ROSSO_2_Dubbio_Collera'],
  verde: ['VERDE_1_Calma'],
  giallo: ['GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale'],
  grigio: ['GRIGIO_1_Distaccato_Nichilista', 'GRIGIO_2_Intellettuale_Saggio'],
}

const SOTTOCORRENTE_LABEL_BY_KEY = {
  BLU_1_Depressiva: 'Depressiva',
  BLU_2_Lunare: 'Lunare',
  BLU_3_Nostalgia: MALINCONICA_NOSTALGICA_LABEL,
  BLU_4_Solare: 'Solare',
  ROSSO_1_Assertivita: 'Assertività',
  ROSSO_2_Dubbio_Collera: 'Dubbio / Collera',
  VERDE_1_Calma: 'Calma',
  GIALLO_1_Gioia_Entusiasmo: 'Gioia / Entusiasmo',
  GIALLO_2_Volitivo_Passionale: 'Volitivo / Passionale',
  GRIGIO_1_Distaccato_Nichilista: 'Distaccato / Nichilista',
  GRIGIO_2_Intellettuale_Saggio: 'Intellettuale / Saggio',
}

const DISPOSIZIONE_TO_FAMILY_KEY = {
  malinconia: 'blu',
  'volitivita': 'rosso',
  'volitività': 'rosso',
  calma: 'verde',
  entusiasmo: 'giallo',
  'anaffettivita': 'grigio',
  'anaffettività': 'grigio',
}

function normalizeSottocorrenteLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function getResolvedSottodisposizione(raw = {}) {
  const disposizioneKey = normalizeSottocorrenteLabel(raw.Disposizione_Prevalente)
  const familyKey = DISPOSIZIONE_TO_FAMILY_KEY[disposizioneKey]
  const candidateKeys = SOTTOCORRENTE_KEYS_BY_FAMILY[familyKey] || []
  if (candidateKeys.length === 0) return formatSubcategoryLabel(raw.Sottodisposizione_Prevalente)

  const savedNormalized = normalizeSottocorrenteLabel(raw.Sottodisposizione_Prevalente)
  const savedKeyInFamily = candidateKeys.find((key) => {
    const label = SOTTOCORRENTE_LABEL_BY_KEY[key] || key
    const aliases = [key, label, ...(key === 'BLU_3_Nostalgia' ? ['Nostalgia', 'Nostalgica'] : [])]
    return aliases.some((alias) => normalizeSottocorrenteLabel(alias) === savedNormalized)
  })
  if (savedKeyInFamily) {
    return formatSubcategoryLabel(SOTTOCORRENTE_LABEL_BY_KEY[savedKeyInFamily] || savedKeyInFamily)
  }

  let bestKey = ''
  let bestValue = -Infinity
  candidateKeys.forEach((key) => {
    const value = Number(raw[key]) || 0
    if (value > bestValue) {
      bestValue = value
      bestKey = key
    }
  })
  if (!bestKey || bestValue <= 0) return ''
  return formatSubcategoryLabel(SOTTOCORRENTE_LABEL_BY_KEY[bestKey] || bestKey)
}

function IconEdit({ title, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`results-table-icon-btn results-table-icon-btn--edit ${className}`.trim()}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  )
}

function IconDelete({ title, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`results-table-icon-btn results-table-icon-btn--delete ${className}`.trim()}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  )
}

const DISPOSIZIONI_SIGNIFICATO = {
  Malinconica: 'Famiglia introspettiva, orientata alla riflessione, alla memoria e al passato.',
  Marziale: 'Famiglia orientata all’azione, alla prova e all’assertività nel presente.',
  Entusiasta: 'Famiglia legata al movimento, alla curiosità e a ciò che è nuovo.',
  Flemmatica: 'Famiglia legata alla calma, al riposo, alla protezione e agli spazi di silenzio.',
  Razionale: 'Famiglia analitica, che tende a osservare e misurare prima di sentire.',
}

const FAMILY_DISPLAY_BY_STORED_DISPOSITION = {
  malinconia: 'Malinconica',
  volitivita: 'Marziale',
  calma: 'Flemmatica',
  entusiasmo: 'Entusiasta',
  anaffettivita: 'Razionale',
}

function displayFamilyFromStoredDisposition(value) {
  const key = normalizeSottocorrenteLabel(value)
  return FAMILY_DISPLAY_BY_STORED_DISPOSITION[key] || String(value || '').trim()
}

const NORMALIZZAZIONE_SPIEGAZIONE =
  'I livelli 1–7 sono ottenuti normalizzando i valori grezzi: la famiglia con punteggio massimo prende 7, le altre in proporzione (valore ÷ massimo × 7), con minimo 1.'

function getDispColor(val) {
  if (!val) return '#94a3b8'
  const v = val.toLowerCase()
  if (v.includes('malinconia')) return '#3b82f6'
  if (v.includes('malinconic')) return '#3b82f6'
  if (v.includes('volitiv') || v.includes('marzial')) return '#ef4444'
  if (v.includes('calma') || v.includes('flemmatic')) return '#22c55e'
  if (v.includes('entusiasm')) return '#eab308'
  if (v.includes('anaffettiv') || v.includes('razional')) return '#6b7280'
  return '#94a3b8'
}

function DisposizioneBadge({ value }) {
  if (!value) return <span className="results-cell-empty">—</span>
  const color = getDispColor(value)
  return (
    <span className="disp-badge" style={{ '--badge-color': color }}>
      <span className="disp-badge-dot" aria-hidden="true" />
      {displayFamilyFromStoredDisposition(value)}
    </span>
  )
}

function StatoBadge({ bozza }) {
  return bozza ? (
    <span className="stato-badge stato-badge--bozza">Bozza</span>
  ) : (
    <span className="stato-badge stato-badge--consegnato">Consegnato</span>
  )
}

function PortatoBadge({ value }) {
  if (!value || value === '—') return <span className="results-cell-empty">—</span>
  const key = value.toLowerCase()
  return <span className={`portato-badge portato-badge--${key}`}>{value}</span>
}

function IconFolderAll() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h3.17a2 2 0 0 1 1.42.59L10.83 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  )
}

function IconFolderArea() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
    </svg>
  )
}

function IconTrashCan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

/** Portato esperienziale prevalente dal record (PE_Simpatia, PE_Antipatia, PE_Indifferenza). */
export function getPortatoDominant(raw) {
  if (!raw) return null
  const simpatia = Number(raw.PE_Simpatia) || 0
  const antipatia = Number(raw.PE_Antipatia) || 0
  const indifferenza = Number(raw.PE_Indifferenza) || 0
  const max = Math.max(simpatia, antipatia, indifferenza)
  if (max <= 0) return null
  if (simpatia === max) return 'simpatia'
  if (antipatia === max) return 'antipatia'
  return 'indifferenza'
}

export { default as FioreMood } from '../components/report/FioreMood.jsx'

/**
 * Ruota in stile Plutchik: 5 petali, lunghezza ∝ livello 1–7.
 * Ogni petalo è un settore circolare dal centro; niente poligono chiuso.
 */
function PlutchikWheel({ levels, size = 240, gradientIdPrefix, onPetalHover, onPetalClick }) {
  const cx = size / 2
  const cy = size / 2
  const maxRadius = Math.min(cx, cy) * 0.85
  const numPetals = RADAR_FAMIGLIE.length
  const angleStep = 360 / numPetals
  const halfAngle = angleStep / 2
  const toRad = (deg) => (deg * Math.PI) / 180

  const petals = RADAR_FAMIGLIE.map((f, i) => {
    const value = Math.max(1, Math.min(7, levels[f.key] ?? 1))
    const radius = (value / 7) * maxRadius
    const color = f.color
    const angleCenter = -90 + i * angleStep
    const angleStart = angleCenter - halfAngle
    const angleEnd = angleCenter + halfAngle
    const x1 = cx + radius * Math.cos(toRad(angleStart))
    const y1 = cy - radius * Math.sin(toRad(angleStart))
    const x2 = cx + radius * Math.cos(toRad(angleEnd))
    const y2 = cy - radius * Math.sin(toRad(angleEnd))
    const largeArc = angleStep > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { path, color, radius, value, subject: f.subject, index: i }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="plutchik-wheel-svg"
      aria-label="Ruota delle disposizioni: Malinconia, Volitività, Entusiasmo, Calma, Anaffettività"
    >
      <defs>
        {petals.map((p, i) => {
          const id = `${gradientIdPrefix}-petal-${i}`
          const angleCenter = -90 + i * angleStep
          const x2 = cx + maxRadius * Math.cos(toRad(angleCenter))
          const y2 = cy - maxRadius * Math.sin(toRad(angleCenter))
          return (
            <linearGradient
              key={id}
              id={id}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={p.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={p.color} stopOpacity={0.95} />
            </linearGradient>
          )
        })}
      </defs>
      {petals.map((p, i) => (
        <g key={i}>
          <path
            d={p.path}
            fill={`url(#${gradientIdPrefix}-petal-${i})`}
            stroke={p.color}
            strokeWidth={1.2}
            strokeOpacity={0.9}
            className="plutchik-petal"
            onMouseEnter={() => onPetalHover && onPetalHover(i)}
            onMouseLeave={() => onPetalHover && onPetalHover(null)}
            onClick={() => onPetalClick && onPetalClick(i)}
            style={{ cursor: 'pointer' }}
            aria-label={`${p.subject}: ${p.value}/7`}
          />
        </g>
      ))}
      {/* Cerchio centrale */}
      <circle cx={cx} cy={cy} r={maxRadius * 0.06} fill="#1e293b" opacity={0.6} aria-hidden />
      {/* Griglia di riferimento: anelli 1–7, ben visibili */}
      {[1, 2, 3, 4, 5, 6, 7].map((n) => {
        const r = (n / 7) * maxRadius
        return (
          <circle
            key={n}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#475569"
            strokeWidth={1}
            strokeDasharray="3 4"
            opacity={0.7}
            className="plutchik-grid-ring"
            aria-hidden
          />
        )
      })}
      {/* Numeri della scala 1–7 accanto agli anelli (a destra del grafico) */}
      {[1, 2, 3, 4, 5, 6, 7].map((n) => {
        const r = (n / 7) * maxRadius
        const x = cx + r + 6
        return (
          <text
            key={`num-${n}`}
            x={x}
            y={cy}
            textAnchor="start"
            dominantBaseline="middle"
            fill="#475569"
            fontSize={11}
            fontWeight={600}
            className="plutchik-scale-number"
            aria-hidden
          >
            {n}
          </text>
        )
      })}
    </svg>
  )
}

/**
 * Etichette per la ruota Plutchik: accanto a ogni spigolo (estremità dell’asse), sul raggio.
 */
function PlutchikLabels({ levels, size = 240 }) {
  const cx = size / 2
  const cy = size / 2
  const maxRadius = Math.min(cx, cy) * 0.85

  // Offset manuali per centrare visivamente le 5 disposizioni intorno al radar,
  // seguendo la reference che hai disegnato (coordinate relative al centro).
  // Offsets scelti per ricalcare la posizione delle scritte rosse
  // che hai disegnato sul radar (coordinate dal centro del grafico).
  const labelOffsets = {
    // Malinconia: centrata in basso, sotto il radar
    blu: { dx: 0, dy: maxRadius * 0.95 },
    // Volitività: a destra, a metà tra centro e base
    rosso: { dx: maxRadius * 1.05, dy: maxRadius * 0.25 },
    // Entusiasmo: in alto a destra
    giallo: { dx: maxRadius * 0.9, dy: -maxRadius * 0.9 },
    // Calma: in alto al centro
    verde: { dx: 0, dy: -maxRadius * 1.1 },
    // Anaffettività: a sinistra, circa a metà altezza
    grigio: { dx: -maxRadius * 1.1, dy: 0 },
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="plutchik-labels-svg"
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      {RADAR_FAMIGLIE.map((f) => {
        const value = Math.max(1, Math.min(7, levels[f.key] ?? 1))
        const { dx, dy } = labelOffsets[f.key] || { dx: 0, dy: 0 }
        const x = cx + dx
        const y = cy + dy
        return (
          <text
            key={f.key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize={12}
            fontWeight={600}
            className="plutchik-label-text"
          >
            {f.subject} {value}/7
          </text>
        )
      })}
    </svg>
  )
}

function RadarShapeGradient({ points, fillColors, gradientIdPrefix, onVertexHover }) {
  if (!points || points.length < 3) return null
  const cx = points[0].cx
  const cy = points[0].cy
  const n = points.length

  return (
    <g>
      <defs>
        {points.map((point, i) => {
          const raw = point.value
          const val = Array.isArray(raw) ? raw[raw.length - 1] : raw
          const norm = Math.min(7, Math.max(0, Number(val) || 0)) / 7
          const opacityEnd = 0.15 + 0.55 * norm
          const opacityStart = 0.08
          const color = fillColors[i] || '#94a3b8'
          const id = `${gradientIdPrefix}-${i}`
          return (
            <linearGradient key={id} id={id} x1={cx} y1={cy} x2={point.x} y2={point.y} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={color} stopOpacity={opacityStart} />
              <stop offset="100%" stopColor={color} stopOpacity={opacityEnd} />
            </linearGradient>
          )
        })}
      </defs>
      {points.map((_, i) => {
        const next = (i + 1) % n
        const path = `M ${cx} ${cy} L ${points[i].x} ${points[i].y} L ${points[next].x} ${points[next].y} Z`
        return <path key={i} d={path} fill={`url(#${gradientIdPrefix}-${i})`} stroke="none" />
      })}
      <path
        d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'}
        fill="none"
        stroke="#64748b"
        strokeWidth={1.2}
        strokeOpacity={0.8}
      />
      {onVertexHover &&
        points.map((p, i) => (
          <circle
            key={`hit-${i}`}
            cx={p.x}
            cy={p.y}
            r={16}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onVertexHover(i)}
            onMouseLeave={() => onVertexHover(null)}
            aria-label={`Dettaglio ${RADAR_FAMIGLIE[i]?.subject}`}
          />
        ))}
    </g>
  )
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function flashSpiegazione(level, isMin, isMax) {
  if (isMax) return 'È la famiglia con risonanza più alta nel tuo profilo.'
  if (isMin) return 'È la famiglia con risonanza più bassa nel tuo profilo.'
  if (level >= 6) return 'Risonanza molto alta in quest’area.'
  if (level >= 4) return 'Risonanza media.'
  if (level >= 2) return 'Risonanza moderata.'
  return 'Risonanza bassa.'
}

export function FioreVisivo({ levels, totals, chartHeight = 280, dispositionAccentColor, showLegend = true }) {
  const gradientIdPrefix = useId().replace(/:/g, '')
  const [hoveredVertex, setHoveredVertex] = useState(null)
  const [selectedVertex, setSelectedVertex] = useState(null)
  const levelValues = RADAR_FAMIGLIE.map((f) => levels[f.key] ?? 1)
  const minLevel = Math.min(...levelValues)
  const maxLevel = Math.max(...levelValues)
  const wheelSize = Math.min(360, chartHeight - 24)

  const wrapperStyle = dispositionAccentColor ? { background: '#fff', position: 'relative' } : undefined

  const hoveredFamiglia = hoveredVertex != null ? RADAR_FAMIGLIE[hoveredVertex] : null

  const activeVertex = selectedVertex != null ? selectedVertex : null
  const activeFamiglia = activeVertex != null ? RADAR_FAMIGLIE[activeVertex] : null
  const activeLevel = activeFamiglia ? (levels[activeFamiglia.key] ?? 1) : 0
  const activeRaw = totals && activeFamiglia ? (totals[activeFamiglia.key] ?? 0) : null
  const isMin = activeFamiglia && activeLevel === minLevel
  const isMax = activeFamiglia && activeLevel === maxLevel

  return (
    <div className="fiore-wrapper radar-cinque-wrapper plutchik-wrapper" style={wrapperStyle}>
      {dispositionAccentColor && (
        <>
          <div
            className="fiore-gradient-side fiore-gradient-left fiore-gradient-water"
            style={{
              background: `linear-gradient(to right, ${hexToRgba(dispositionAccentColor, 0.22)}, ${hexToRgba(dispositionAccentColor, 0.08)} 50%, transparent)`,
            }}
            aria-hidden
          />
          <div
            className="fiore-gradient-side fiore-gradient-right fiore-gradient-water"
            style={{
              background: `linear-gradient(to left, ${hexToRgba(dispositionAccentColor, 0.22)}, ${hexToRgba(dispositionAccentColor, 0.08)} 50%, transparent)`,
            }}
            aria-hidden
          />
        </>
      )}
      <div className="fiore-chart-and-legend fiore-content-above">
        <div className="fiore-chart">
          <div className="radar-chart-with-scale plutchik-chart-with-scale">
            <div className="radar-scale-external" aria-hidden="true">
              {[7, 6, 5, 4, 3, 2, 1].map((n) => (
                <span key={n} className="radar-scale-tick" data-level={String(n)}>
                  {n}
                </span>
              ))}
            </div>
            <div className="plutchik-wheel-container" style={{ height: chartHeight }}>
              <PlutchikWheel
                levels={levels}
                size={wheelSize}
                gradientIdPrefix={gradientIdPrefix}
                onPetalHover={setHoveredVertex}
                onPetalClick={setSelectedVertex}
              />
            </div>
          </div>
        </div>
      </div>

      {hoveredVertex != null && hoveredFamiglia && (
        <div className="radar-vertex-hint" role="status">
          <span className="radar-vertex-hint-label">Tap per approfondire</span>
        </div>
      )}

      {activeVertex != null && activeFamiglia && (
        <div
          className="radar-vertex-tooltip"
          role="tooltip"
          onMouseEnter={() => setSelectedVertex(activeVertex)}
          onMouseLeave={() => setSelectedVertex(null)}
        >
          <div className="radar-tooltip-disposizione" style={{ color: activeFamiglia.color }}>
            {activeFamiglia.subject}
          </div>
          <p className="radar-tooltip-significato">{DISPOSIZIONI_SIGNIFICATO[activeFamiglia.subject]}</p>
          <div className="radar-tooltip-color-swatch" style={{ background: activeFamiglia.color }} />
          <div className="radar-tooltip-numbers">
            {activeRaw != null && (
              <span className="radar-tooltip-grezzo">
                Valore grezzo: <strong>{activeRaw}</strong>
              </span>
            )}
            <span className="radar-tooltip-livello">
              Livello: <strong>{activeLevel}/7</strong>
            </span>
          </div>
          <p className="radar-tooltip-flash">{flashSpiegazione(activeLevel, isMin, isMax)}</p>
          <p className="radar-tooltip-normalizzazione">{NORMALIZZAZIONE_SPIEGAZIONE}</p>
        </div>
      )}

      {showLegend && (
        <div className="fiore-legend-and-hint">
          <div className="fiore-legend-colors" aria-hidden="true">
            {RADAR_FAMIGLIE.map((f) => (
              <div key={f.key} className="fiore-legend-color-item">
                <span className="fiore-legend-color-swatch" style={{ background: f.color }} />
                <span className="fiore-legend-color-label">{f.subject}</span>
              </div>
            ))}
          </div>
          <p className="fiore-legend-hint">Ogni petalo rappresenta una famiglia; la lunghezza indica il livello 1–7 (più è lungo, più la risonanza in quell&apos;area).</p>
        </div>
      )}
    </div>
  )
}

function ResultsPage() {
  const location = useLocation()
  const { user: currentUser, authReady } = useAuth()
  const guestRecord = location.state && location.state.mode === 'guest' ? location.state.record : null
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [nameFilter, setNameFilter] = useState('')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')
  const [dispFilter, setDispFilter] = useState('')
  const [sottodispFilter, setSottodispFilter] = useState('')
  const [portatoEspFilter, setPortatoEspFilter] = useState('')
  const [aree, setAree] = useState([])
  const [selectedAreaId, setSelectedAreaId] = useState(null)
  const [showTrash, setShowTrash] = useState(false)
  const [editingAreaId, setEditingAreaId] = useState(null)
  const [editingAreaName, setEditingAreaName] = useState('')
  const [draggedAreaIndex, setDraggedAreaIndex] = useState(null)
  const [assigningAreaId, setAssigningAreaId] = useState(null)
  const [draggedRecordId, setDraggedRecordId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const navigate = useNavigate()
  const filtersRef = useRef(null)
  const importFileInputRef = useRef(null)

  const [showImportModal, setShowImportModal] = useState(false)
  const [isImportDragActive, setIsImportDragActive] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importSuccess, setImportSuccess] = useState(null)

  const handleImportCsvFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean)
    if (!files.length) return
    if (!db || !currentUser) {
      setImportError('Database o utente non disponibili.')
      return
    }
    setImporting(true)
    setImportError(null)
    setImportSuccess(null)
    try {
      const importedRecords = []

      for (const file of files) {
        const fileName = file.name || 'file selezionato'
        const isCsv = fileName.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
        if (!isCsv) {
          throw new Error(`"${fileName}" non è un CSV.`)
        }

        const text = await file.text()
        const { payloads } = parseMatriceCsv(text)

        for (const payload of payloads) {
          const payloadWithArea = {
            ...payload,
            areaId: payload.areaId || selectedAreaId || null,
          }
          const ref = await saveTestResultForUser({
            db,
            user: currentUser,
            payload: payloadWithArea,
            overrideTimestamp: false,
          })
          importedRecords.push(
            buildResultRecord(ref.id, {
              ...payloadWithArea,
              [TEST_RESULT_USER_ID_FIELD]: currentUser.uid,
            }),
          )
        }
      }

      setRecords((prev) => [...importedRecords, ...prev])
      const count = importedRecords.length
      setImportSuccess(count === 1 ? '1 risultato importato dal CSV.' : `${count} risultati importati dal CSV.`)
      setTimeout(() => {
        setShowImportModal(false)
        setImportSuccess(null)
      }, 1400)
    } catch (err) {
      console.error(err)
      setImportError(err.message || "Errore durante l'importazione del CSV.")
    } finally {
      setImporting(false)
      setIsImportDragActive(false)
      if (importFileInputRef.current) {
        importFileInputRef.current.value = ''
      }
    }
  }

  const handleImportFileChange = (e) => {
    handleImportCsvFiles(e.target.files)
  }

  const closeImportModal = () => {
    if (importing) return
    setShowImportModal(false)
    setImportError(null)
    setImportSuccess(null)
    setIsImportDragActive(false)
    if (importFileInputRef.current) {
      importFileInputRef.current.value = ''
    }
  }

  const openReport = (record) => {
    if (!record) return
    try {
      window.sessionStorage.setItem('tst_last_report_record', JSON.stringify(record))
    } catch (error) {
      console.warn('Impossibile salvare il fallback report in sessionStorage:', error)
    }
    navigate('/risultati/report', { state: { record } })
  }

  useEffect(() => {
    if (guestRecord) return
    if (!authReady || !currentUser) {
      setLoading(false)
      return
    }
    if (!db) {
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)
    const fetchData = async () => {
      try {
        let q = query(
          collection(db, TEST_RESULTS_COLLECTION),
          where(TEST_RESULT_USER_ID_FIELD, '==', currentUser.uid),
          orderBy('Data_Ora_Fine_Test', 'desc'),
        )
        let snapshot
        try {
          snapshot = await getDocs(q)
        } catch (err) {
          // In molti casi Firestore richiede un indice composto per where+orderBy.
          // Se manca, facciamo un fallback ad una query senza orderBy così i risultati compaiono comunque.
          if (err?.code === 'failed-precondition') {
            console.warn(
              'Query Firestore senza indice composto, eseguo fallback senza orderBy. Crea un indice su userId + Data_Ora_Fine_Test per riattivare l\'ordinamento.',
              err,
            )
            q = query(
              collection(db, TEST_RESULTS_COLLECTION),
              where(TEST_RESULT_USER_ID_FIELD, '==', currentUser.uid),
            )
            snapshot = await getDocs(q)
          } else {
            throw err
          }
        }
        const docs = snapshot.docs.map((doc) => buildResultRecord(doc.id, doc.data()))
        setRecords(docs)
      } catch (err) {
        console.error('Errore durante il caricamento dei risultati:', err)
        setLoadError(
          err?.message ||
            'Impossibile caricare i risultati dal database. Controlla la connessione o la configurazione di Firestore.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guestRecord, authReady, currentUser])

  useEffect(() => {
    if (!authReady || !currentUser || !db) return
    const fetchAree = async () => {
      try {
        const q = query(
          collection(db, AREE_COLLECTION),
          where('operatoreUid', '==', currentUser.uid),
          orderBy('order', 'asc'),
        )
        const snapshot = await getDocs(q).catch((err) => {
          if (err?.code === 'failed-precondition') {
            return getDocs(
              query(collection(db, AREE_COLLECTION), where('operatoreUid', '==', currentUser.uid)),
            )
          }
          throw err
        })
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data(), order: d.data().order ?? 999 }))
        list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        setAree(list)
      } catch (err) {
        console.warn('Caricamento aree fallito:', err)
      }
    }
    fetchAree()
  }, [authReady, currentUser])

  const filteredRecords = useMemo(() => {
    if (guestRecord) return []
    return records.filter((r) => {
      const inTrash = !!r.raw.In_Cestino

      if (showTrash) {
        if (!inTrash) return false
      } else if (inTrash) {
        return false
      }

      if (selectedAreaId !== null && (r.raw.areaId || null) !== selectedAreaId) return false
      if (
        nameFilter &&
        !`${r.raw.Nome || ''} ${r.raw.Cognome || ''}`
          .toLowerCase()
          .includes(nameFilter.toLowerCase())
      ) {
        return false
      }
      if (ageMin && (r.age == null || r.age < Number(ageMin))) return false
      if (ageMax && (r.age == null || r.age > Number(ageMax))) return false
      const raw = r.raw
      const disp = (raw.Disposizione_Prevalente || '').trim().toLowerCase()
      const sottodisp = getResolvedSottodisposizione(raw).toLowerCase()
      const portatoEsp = (raw.Portato_Esperienziale_Prevalente || '').trim().toLowerCase()
      if (dispFilter && disp !== dispFilter.trim().toLowerCase()) return false
      if (sottodispFilter && sottodisp !== sottodispFilter.trim().toLowerCase()) return false
      if (portatoEspFilter && portatoEsp !== portatoEspFilter.trim().toLowerCase()) return false
      return true
    })
  }, [records, nameFilter, ageMin, ageMax, dispFilter, sottodispFilter, portatoEspFilter, selectedAreaId, showTrash, guestRecord])

  const filterOptions = useMemo(() => {
    const normalizeValue = (value) => String(value || '').trim()
    const scopedRecords = records.filter((r) => {
      const inTrash = !!r.raw.In_Cestino
      if (showTrash) return inTrash
      if (inTrash) return false
      if (selectedAreaId !== null && (r.raw.areaId || null) !== selectedAreaId) return false
      return true
    })
    const uniqueSorted = (extractor) =>
      Array.from(new Set(scopedRecords.map((r) => normalizeValue(extractor(r.raw))).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'it', { sensitivity: 'base' }),
      )
    return {
      disposizioni: uniqueSorted((raw) => raw.Disposizione_Prevalente),
      sottodisposizioni: uniqueSorted((raw) => getResolvedSottodisposizione(raw)),
      portati: uniqueSorted((raw) => raw.Portato_Esperienziale_Prevalente),
    }
  }, [records, selectedAreaId, showTrash])

  const selectedAreaName = selectedAreaId === null ? null : (aree.find((a) => a.id === selectedAreaId)?.name ?? 'Area')

  const handleAddArea = async () => {
    if (!db || !currentUser) return
    const name = `Nuova area ${aree.length + 1}`
    const order = aree.length
    try {
      const ref = await addDoc(collection(db, AREE_COLLECTION), {
        operatoreUid: currentUser.uid,
        name,
        order,
      })
      setAree((prev) => [...prev, { id: ref.id, name, order }].sort((a, b) => a.order - b.order))
      setSelectedAreaId(ref.id)
      setEditingAreaId(ref.id)
      setEditingAreaName(name)
    } catch (err) {
      console.error('Errore creazione area:', err)
    }
  }

  const handleRenameArea = (areaId, newName) => {
    if (!db || !newName.trim()) return
    const trimmed = newName.trim()
    updateDoc(doc(db, AREE_COLLECTION, areaId), { name: trimmed })
      .then(() => {
        setAree((prev) => prev.map((a) => (a.id === areaId ? { ...a, name: trimmed } : a)))
        setEditingAreaId(null)
        setEditingAreaName('')
      })
      .catch((err) => console.error('Errore rinomina area:', err))
  }

  const handleDeleteArea = async (areaId) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, AREE_COLLECTION, areaId))
      const batch = writeBatch(db)
      records.filter((r) => r.raw.areaId === areaId).forEach((r) => {
        batch.update(doc(db, TEST_RESULTS_COLLECTION, r.id), { areaId: null })
      })
      await batch.commit()
      setAree((prev) => prev.filter((a) => a.id !== areaId))
      setRecords((prev) => prev.map((r) => (r.raw.areaId === areaId ? { ...r, raw: { ...r.raw, areaId: null } } : r)))
      if (selectedAreaId === areaId) setSelectedAreaId(null)
    } catch (err) {
      console.error('Errore eliminazione area:', err)
    }
  }

  const handleReorderAree = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= aree.length) return
    const reordered = [...aree]
    const [removed] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, removed)
    const updates = reordered.map((a, i) => ({ ...a, order: i }))
    setAree(updates)
    const batch = writeBatch(db)
    updates.forEach((a) => {
      batch.update(doc(db, AREE_COLLECTION, a.id), { order: a.order })
    })
    batch.commit().catch((err) => console.error('Errore riordino aree:', err))
  }

  const handleAssignTestToArea = async (recordId, areaId, extraPatch = null) => {
    if (!db) return
    setAssigningAreaId(recordId)
    try {
      const patch = { areaId: areaId || null, ...(extraPatch || {}) }
      await updateDoc(doc(db, TEST_RESULTS_COLLECTION, recordId), patch)
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, raw: { ...r.raw, ...patch } } : r)),
      )
    } catch (err) {
      console.error('Errore assegnazione area:', err)
    } finally {
      setAssigningAreaId(null)
    }
  }

  const RECORD_DRAG_MIME = 'application/x-tst-record-id'

  const onRecordDragStart = (e, recordId) => {
    setDraggedRecordId(recordId)
    try {
      e.dataTransfer.setData(RECORD_DRAG_MIME, recordId)
      e.dataTransfer.setData('text/plain', recordId)
    } catch {
      // some browsers disallow setData during certain phases; ignore
    }
    e.dataTransfer.effectAllowed = 'move'
  }

  const onRecordDragEnd = () => {
    setDraggedRecordId(null)
    setDropTargetId(null)
  }

  const readRecordIdFromDrop = (e) => {
    const fromCustom = (() => {
      try {
        return e.dataTransfer.getData(RECORD_DRAG_MIME)
      } catch {
        return ''
      }
    })()
    if (fromCustom) return fromCustom
    return draggedRecordId || ''
  }

  const onArchiveDropTargetDragEnter = (targetId) => {
    if (draggedRecordId) setDropTargetId(targetId)
  }
  const onArchiveDropTargetDragLeave = (targetId) => {
    setDropTargetId((prev) => (prev === targetId ? null : prev))
  }

  const dropTestOnArea = async (areaId) => {
    const recordId = draggedRecordId
    if (!recordId) return
    const current = records.find((r) => r.id === recordId)
    const wasInTrash = !!current?.raw?.In_Cestino
    await handleAssignTestToArea(recordId, areaId, wasInTrash ? { In_Cestino: false } : null)
  }

  const dropTestOnTrash = async () => {
    const recordId = draggedRecordId
    if (!recordId || !db) return
    try {
      await updateDoc(doc(db, TEST_RESULTS_COLLECTION, recordId), { In_Cestino: true })
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, raw: { ...r.raw, In_Cestino: true } } : r)),
      )
    } catch (err) {
      console.error('Errore spostamento nel cestino:', err)
    }
  }

  const handleMoveToTrash = async (recordId, e) => {
    e.stopPropagation()
    if (!db) return
    try {
      await updateDoc(doc(db, TEST_RESULTS_COLLECTION, recordId), { In_Cestino: true })
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, raw: { ...r.raw, In_Cestino: true } } : r)),
      )
    } catch (err) {
      console.error('Errore spostamento nel cestino:', err)
    }
  }

  const handleRestoreFromTrash = async (recordId, e) => {
    e.stopPropagation()
    if (!db) return
    try {
      await updateDoc(doc(db, TEST_RESULTS_COLLECTION, recordId), { In_Cestino: false })
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, raw: { ...r.raw, In_Cestino: false } } : r)),
      )
    } catch (err) {
      console.error('Errore ripristino dal cestino:', err)
    }
  }

  const handleDeleteRecord = async (recordId, e) => {
    e.stopPropagation()
    if (!db || !window.confirm('Eliminare definitivamente questo risultato test? L\'operazione non si può annullare.')) return
    try {
      await deleteDoc(doc(db, TEST_RESULTS_COLLECTION, recordId))
      setRecords((prev) => prev.filter((r) => r.id !== recordId))
    } catch (err) {
      console.error('Errore eliminazione risultato:', err)
    }
  }

  if (guestRecord) {
    const fakeWrapper = {
      id: 'guest',
      raw: guestRecord,
      age: computeAgeFromBirthDate(guestRecord.Data_Nascita),
      totals: computeColorTotals(guestRecord),
    }
    return <Navigate to="/risultati/report" state={{ record: fakeWrapper }} replace />
  }

  if (!authReady) {
    return (
      <div className="page">
        <section className="page-card">
          <p>Verifica sessione in corso…</p>
        </section>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="page">
        <header className="page-header">
          <div className="info-hero-card section-hero-card section-hero-card--newtest">
            <h1 className="section-hero-title">Risultati dei test TST</h1>
          </div>
        </header>
        <section className="page-card">
          <p className="results-login-required">
            Accedi con il tuo account operatore per vedere e gestire i risultati salvati nella tua area.
          </p>
          <button
            type="button"
            className="nav-button primary"
            onClick={() => navigate('/home', { state: { openLogin: true } })}
          >
            Vai alla Home per accedere
          </button>
        </section>
      </div>
    )
  }

  const onAreaDragStart = (e, index) => {
    setDraggedAreaIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
  const onAreaDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const onAreaDrop = (e, toIndex) => {
    e.preventDefault()
    if (draggedAreaIndex == null) return
    if (draggedAreaIndex !== toIndex) handleReorderAree(draggedAreaIndex, toIndex)
    setDraggedAreaIndex(null)
  }
  const onAreaDragEnd = () => setDraggedAreaIndex(null)

  const downloadFilename = showTrash
    ? 'tst_matrice_cestino.csv'
    : selectedAreaId
      ? `tst_matrice_${(selectedAreaName || 'area').replace(/\s+/g, '_')}.csv`
      : 'tst_matrice_archivio_totale.csv'

  return (
    <div className="page page-results-with-archives">
      <header className="page-header">
        <div className="info-hero-card section-hero-card section-hero-card--newtest">
          <h1 className="section-hero-title">Risultati dei test TST</h1>
          <p className="section-hero-subtitle">
            {showTrash
              ? 'Cestino: risultati eliminati che puoi ripristinare o rimuovere definitivamente.'
              : 'Archivio e aree: organizza i protocolli.'}
          </p>
        </div>
      </header>

      <div className={`results-archives-layout ${draggedRecordId ? 'results-archives-layout--dragging-record' : ''}`}>
        <aside className="results-archives-sidebar">
          <nav className="archives-nav" aria-label="Archivio e aree">
            <button
              type="button"
              className={`archives-nav-item ${selectedAreaId === null && !showTrash ? 'archives-nav-item--active' : ''} ${dropTargetId === '__archive__' ? 'archives-nav-item--drop-target' : ''}`}
              onClick={() => {
                setSelectedAreaId(null)
                setShowTrash(false)
              }}
              onDragOver={(e) => {
                if (draggedRecordId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
              }}
              onDragEnter={() => onArchiveDropTargetDragEnter('__archive__')}
              onDragLeave={() => onArchiveDropTargetDragLeave('__archive__')}
              onDrop={(e) => {
                const rid = readRecordIdFromDrop(e)
                if (!rid) return
                e.preventDefault()
                setDropTargetId(null)
                dropTestOnArea(null)
              }}
            >
              <span className="archives-nav-icon"><IconFolderAll /></span>
              <span>Archivio totale</span>
              <span className="archives-nav-count">
                {records.filter((r) => !r.raw.In_Cestino).length}
              </span>
            </button>
            {aree.map((area, index) => (
              <div
                key={area.id}
                className={`archives-nav-item archives-nav-item--area ${selectedAreaId === area.id ? 'archives-nav-item--active' : ''} ${draggedAreaIndex === index ? 'archives-nav-item--dragging' : ''} ${dropTargetId === area.id ? 'archives-nav-item--drop-target' : ''}`}
                draggable
                onDragStart={(e) => onAreaDragStart(e, index)}
                onDragOver={(e) => {
                  if (draggedRecordId) {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    return
                  }
                  onAreaDragOver(e)
                }}
                onDragEnter={() => onArchiveDropTargetDragEnter(area.id)}
                onDragLeave={() => onArchiveDropTargetDragLeave(area.id)}
                onDrop={(e) => {
                  const rid = readRecordIdFromDrop(e)
                  if (rid) {
                    e.preventDefault()
                    setDropTargetId(null)
                    dropTestOnArea(area.id)
                    return
                  }
                  onAreaDrop(e, index)
                }}
                onDragEnd={onAreaDragEnd}
              >
                <span className="archives-nav-drag-handle" title="Trascina per riordinare" aria-hidden>⋮⋮</span>
                {editingAreaId === area.id ? (
                  <input
                    type="text"
                    className="archives-nav-rename-input"
                    value={editingAreaName}
                    onChange={(e) => setEditingAreaName(e.target.value)}
                    onBlur={() => {
                      if (editingAreaName.trim()) handleRenameArea(area.id, editingAreaName)
                      setEditingAreaId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingAreaName.trim()) handleRenameArea(area.id, editingAreaName)
                        setEditingAreaId(null)
                      }
                      if (e.key === 'Escape') {
                        setEditingAreaName(area.name)
                        setEditingAreaId(null)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    aria-label="Rinomina area"
                  />
                ) : (
                  <button
                    type="button"
                    className="archives-nav-item-button"
                    onClick={() => setSelectedAreaId(area.id)}
                    onDoubleClick={() => {
                      setEditingAreaId(area.id)
                      setEditingAreaName(area.name)
                    }}
                    title="Clicca per selezionare, doppio clic per rinominare"
                  >
                    <span className="archives-nav-icon"><IconFolderArea /></span>
                    <span className="archives-nav-label">{area.name}</span>
                    <span className="archives-nav-count">
                      {records.filter((r) => (r.raw.areaId || null) === area.id && !r.raw.In_Cestino).length}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="archives-nav-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id) }}
                  title="Elimina area"
                  aria-label="Elimina area"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="archives-nav-add" onClick={handleAddArea}>
              <span aria-hidden>+</span> Nuova area
            </button>
            <button
              type="button"
              className={`archives-nav-item archives-nav-item--trash ${showTrash ? 'archives-nav-item--active' : ''} ${dropTargetId === '__trash__' ? 'archives-nav-item--drop-target' : ''}`}
              onClick={() => {
                setSelectedAreaId(null)
                setShowTrash(true)
              }}
              onDragOver={(e) => {
                if (draggedRecordId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
              }}
              onDragEnter={() => onArchiveDropTargetDragEnter('__trash__')}
              onDragLeave={() => onArchiveDropTargetDragLeave('__trash__')}
              onDrop={(e) => {
                const rid = readRecordIdFromDrop(e)
                if (!rid) return
                e.preventDefault()
                setDropTargetId(null)
                dropTestOnTrash()
              }}
            >
              <span className="archives-nav-icon"><IconTrashCan /></span>
              <span>Cestino</span>
              <span className="archives-nav-count">
                {records.filter((r) => r.raw.In_Cestino).length}
              </span>
            </button>
          </nav>
        </aside>

        <section className="page-card results-main-card">
          <div className="results-filters" ref={filtersRef}>
            <div className="results-filters-grid">
              <div className="filter-field">
                <label>Nome / Cognome</label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Cerca per nome o cognome"
                />
              </div>
              <div className="filter-field filter-age">
                <label>Età</label>
                <div className="filter-age-range">
                  <input
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    placeholder="Min"
                    min="0"
                  />
                  <span>–</span>
                  <input
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
              <div className="filter-field">
                <label>Famiglia prevalente</label>
                <select
                  value={dispFilter}
                  onChange={(e) => setDispFilter(e.target.value)}
                >
                  <option value="">Tutte</option>
                  {filterOptions.disposizioni.map((option) => (
                    <option key={option} value={option}>
                      {displayFamilyFromStoredDisposition(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label>Sfumatura prevalente</label>
                <select
                  value={sottodispFilter}
                  onChange={(e) => setSottodispFilter(e.target.value)}
                >
                  <option value="">Tutte</option>
                  {filterOptions.sottodisposizioni.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label>Portato esperienziale prevalente</label>
                <select
                  value={portatoEspFilter}
                  onChange={(e) => setPortatoEspFilter(e.target.value)}
                >
                  <option value="">Tutti</option>
                  {filterOptions.portati.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="results-filters-actions">
              <p className="results-filters-hint" aria-live="polite">
                Suggerimento: trascina una riga sulle voci a sinistra (archivio, aree, cestino) per spostarla.
              </p>
              <button
                type="button"
                className="nav-button secondary"
                onClick={() => downloadCsvFromRecords(filteredRecords, downloadFilename)}
                disabled={!filteredRecords.length}
                title={selectedAreaId ? `Scarica matrice per area "${selectedAreaName}"` : 'Scarica matrice archivio totale'}
              >
                {selectedAreaId ? `Scarica matrice (${selectedAreaName})` : 'Scarica matrice (archivio totale)'}
              </button>
              <button
                type="button"
                className="nav-button primary"
                onClick={() => setShowImportModal(true)}
              >
                Importa
              </button>
            </div>
          </div>

          {showImportModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Importa Risultati</h2>
                <div
                  className={`results-import-dropzone ${isImportDragActive ? 'results-import-dropzone--active' : ''}`}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsImportDragActive(true)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = 'copy'
                    setIsImportDragActive(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (e.currentTarget.contains(e.relatedTarget)) return
                    setIsImportDragActive(false)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsImportDragActive(false)
                    handleImportCsvFiles(e.dataTransfer.files)
                  }}
                >
                  <p className="results-import-dropzone-title">
                    Trascina qui il CSV
                  </p>
                  <p className="results-import-dropzone-copy">
                    Oppure seleziona il file matrice esportato da TST.
                  </p>
                  <input
                    ref={importFileInputRef}
                    className="results-import-file-input"
                    type="file"
                    accept=".csv,text/csv"
                    multiple
                    onChange={handleImportFileChange}
                    disabled={importing}
                  />
                  <button
                    type="button"
                    className="nav-button primary"
                    onClick={() => importFileInputRef.current?.click()}
                    disabled={importing}
                  >
                    {importing ? 'Importazione...' : 'Cerca file'}
                  </button>
                </div>

                {importError && <p className="auth-error" style={{ marginTop: '1rem' }}>{importError}</p>}
                {importSuccess && <p style={{ marginTop: '1rem', color: 'var(--primary-dark)', fontWeight: 'bold' }}>{importSuccess}</p>}

                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                  <button type="button" className="nav-button secondary" onClick={closeImportModal} disabled={importing}>
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="results-table-wrapper">
            {loading ? (
              <p>Caricamento risultati…</p>
            ) : loadError ? (
              <p className="results-error">{loadError}</p>
            ) : !filteredRecords.length ? (
              <p className="results-empty-message">
                {showTrash
                  ? 'Nessun risultato nel cestino.'
                  : 'È ancora tutto vuoto qui. Usa questo spazio come archivio.'}
              </p>
            ) : (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Età</th>
                    <th>Strumento</th>
                    <th>Data</th>
                    <th>Stato</th>
                    <th>Famiglia prevalente</th>
                    <th>Sfumatura prevalente</th>
                    <th>Portato esp. prevalente</th>
                    <th>Archivio</th>
                    {MATRICE_HEADERS.map((h) => (
                      <th key={h.key}>{h.label}</th>
                    ))}
                    <th>Portato esp.</th>
                    <th>Report</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredRecords.map((r) => {
                    const portato = getPortatoDominant(r.raw)
                    const portatoLabel = portato === 'simpatia' ? 'Simpatia' : portato === 'antipatia' ? 'Antipatia' : portato === 'indifferenza' ? 'Indifferenza' : '—'
                    const inTrash = !!r.raw.In_Cestino
                    const sottodisposizione = getResolvedSottodisposizione(r.raw)
                    return (
                      <tr
                        key={r.id}
                        onClick={() => openReport(r)}
                        draggable
                        onDragStart={(e) => onRecordDragStart(e, r.id)}
                        onDragEnd={onRecordDragEnd}
                        className={draggedRecordId === r.id ? 'results-row--dragging' : ''}
                        title="Trascina su archivio, area o cestino per spostare"
                      >
                        <td className="results-table-cell--name"><span className="results-row-drag-handle" aria-hidden>⋮⋮</span><strong>{r.raw.Nome} {r.raw.Cognome}</strong></td>
                        <td>{r.age != null ? r.age : '—'}</td>
                        <td>{r.raw.Strumento_Suonato || '—'}</td>
                        <td>{formatDateShort(r.raw.Data_Ora_Fine_Test)}</td>
                        <td><StatoBadge bozza={r.raw.Bozza_Test} /></td>
                        <td><DisposizioneBadge value={r.raw.Disposizione_Prevalente} /></td>
                        <td>{sottodisposizione || <span className="results-cell-empty">—</span>}</td>
                        <td><PortatoBadge value={r.raw.Portato_Esperienziale_Prevalente} /></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="results-area-select"
                            value={r.raw.areaId || ''}
                            onChange={(e) => handleAssignTestToArea(r.id, e.target.value || null)}
                            disabled={assigningAreaId === r.id}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Assegna a archivio"
                          >
                            <option value="">Nessuna</option>
                            {aree.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                        {MATRICE_HEADERS.map((h) => (
                          <td key={h.key}>{r.totals[h.key]}</td>
                        ))}
                        <td><PortatoBadge value={portatoLabel} /></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="report-open-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReport(r)
                            }}
                          >
                            Apri report
                          </button>
                        </td>
                        <td className="results-table-actions" onClick={(e) => e.stopPropagation()}>
                          <IconEdit
                            title="Modifica"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReport(r)
                            }}
                          />
                          {inTrash && (
                            <button
                              type="button"
                              className="results-table-icon-btn results-table-icon-btn--edit"
                              onClick={(e) => handleRestoreFromTrash(r.id, e)}
                              title="Ripristina dal cestino"
                              aria-label="Ripristina dal cestino"
                            >
                              ↩
                            </button>
                          )}
                          <IconDelete
                            title={inTrash ? 'Elimina definitivamente' : 'Sposta nel cestino'}
                            onClick={(e) =>
                              inTrash ? handleDeleteRecord(r.id, e) : handleMoveToTrash(r.id, e)
                            }
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ResultsPage
