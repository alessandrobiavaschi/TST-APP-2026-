import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
// AnimatePresence + motion usati per zoom costellazione e pannello CRT
import { EXAMPLE_CORRENT_DATA } from '../../utils/galassiaData.js'
import { resolveGalassiaPanelContent, getGalaxyTheoryForRawKey } from '../../utils/galassiaPanelContent.js'
import { GALASSIA_CRT } from '../../content/reportRestitution.js'
import {
  getDialogoKeywords,
  getFamigliaDot,
  getFamigliaLabel,
} from '../../content/dialogoCorrenti.js'
import { FAMIGLIE_LESSICO } from '../../content/statiAnimoLessico.js'
import { getRelationalCorpusForDominant } from '../../content/relational/index.js'
import reportContent from '../../content_report.json'
import {
  GALASSIA_UI,
  GALASSIA_MAP_MODES,
  GALASSIA_PORTATO_UI,
  GALASSIA_READING_STEPS,
  GALASSIA_READING_STEPS_BY_MODE,
  GALASSIA_RAPPORTI_UI,
} from './reportUiCopy.js'
import GalassiaTutorialOverlay from './GalassiaTutorialOverlay.jsx'
import LessicoAtlasView from './LessicoAtlasView.jsx'
import {
  markGalassiaOpeningGuideSeen,
  shouldShowGalassiaTutorial,
} from './galassiaTutorialStorage.js'
import '../../styles/galassia-view.css'

// `motion` è usato solo come componente JSX (motion.div/button/section): questo
// setup ESLint non lo rileva come uso, idioma del repo per evitare no-unused-vars.
void motion

/**
 * <GalassiaView correntData={...} />
 *
 * Mappa interattiva delle 5 correnti emotive, in stile "Rosa dei Venti" TST.
 * Sostituisce concettualmente il vecchio Galaxy3DExplorer. Componente
 * completamente self-contained: riceve `correntData` (vedi galassiaData.js).
 *
 * - Sfondo galattico a strati (nebulosa CSS + campo stellare).
 * - Click su un pianeta -> zoom in avanti e apertura della sua costellazione.
 * - Click su una sotto-corrente -> il pannello mostra solo quella sfumatura.
 * - Mobile: pianeti in griglia 2x3, pannello in basso, interazione a tap.
 */

const SPACE_BG = '#020817'
const CAMERA_RESET = { x: 0, y: 0, scale: 1 }
const CAMERA_MIN_SCALE = 0.78
const CAMERA_MAX_SCALE = 3.2
const CAMERA_ZOOM_STEP = 1.14
const CAMERA_ANIM_MS = 880
const GALASSIA_STABLE_TRANSITION = { duration: 0.2, ease: 'easeOut' }
const GALASSIA_STABLE_ENTER_TRANSITION = { duration: 0.24, ease: 'easeOut' }

/** Elementi mappa che devono ricevere click/tap senza pointer capture sul layer. */
const INTERACTIVE_MAP_SELECTOR =
  'button, .galassia-view__constellation-wrap, .galassia-view__map-controls, .galassia-view__back-chip'

/** Posizioni "Rosa dei Venti" (percentuali del contenitore) per id corrente. */
const WIND_ANCHORS = {
  malinconica_nostalgica: { x: 27, y: 55 },
  collerico_volitiva: { x: 73, y: 55 },
  flemmatica: { x: 50, y: 51 },
  entusiasmo: { x: 50, y: 25 },
  agnostica_anaffettiva: { x: 50, y: 79 },
}

const PAROLE_CLUSTER_ANCHORS = {
  malinconica_nostalgica: { x: 27, y: 55 },
  collerico_volitiva: { x: 73, y: 55 },
  flemmatica: { x: 50, y: 51 },
  entusiasmo: { x: 50, y: 25 },
  agnostica_anaffettiva: { x: 50, y: 79 },
}

function subOrbitOffset(index, total, radiusPct) {
  if (total <= 1) return { dx: 0, dy: 0 }
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return { dx: Math.cos(angle) * radiusPct, dy: Math.sin(angle) * radiusPct * 0.6 }
}

/** Margini % della mappa: riservano spazio a titolo, etichette sotto i cerchi e pannello CRT. */
const MAP_SAFE_DESKTOP = { top: 10, bottom: 13, left: 10, right: 10 }
const MAP_SAFE_MOBILE = { top: 12, bottom: 18, left: 12, right: 12 }
const MAP_LABEL_PAD_PX = 104
const CONSTELLATION_CORE_DIAM = 96
const CONSTELLATION_NODE_GAP = 30
const CONSTELLATION_LABEL_CLEAR = 58
/** Distanza tra il bordo della sfera satellite e il bordo dell'etichetta (px). */
const CONSTELLATION_LABEL_GAP = 12
/** Min center-to-center horizontal gap between two satellites (px). */
const CONSTELLATION_MIN_X_GAP = 20
/** n=2: orbit radius must be at least nodeSize + this for readable horizontal spread. */
const CONSTELLATION_PAIR_ORBIT_MIN_EXTRA = 80
const CONSTELLATION_MAP_EDGE_PAD = 16
/** Bias upward so orbit + labels sit in the visual center of the map viewport. */
const MAP_ZOOM_FOCUS_Y = 46

/** Nel focus di una famiglia il prefisso «Natura —» è ridondante: resta solo il nome della natura. */
function subDisplayName(nome) {
  return typeof nome === 'string' ? nome.replace(/^Natura\s*[—–-]\s*/, '') : nome
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function clampMapPosition(pos, bounds = MAP_SAFE_DESKTOP) {
  return {
    x: clamp(pos.x, bounds.left, 100 - bounds.right),
    y: clamp(pos.y, bounds.top, 100 - bounds.bottom),
  }
}

function clampCamera(camera, width, height) {
  const scale = clamp(camera.scale || 1, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
  const safeW = width || 960
  const safeH = height || 640
  const baseSlackX = Math.max(700, safeW * 0.8)
  const baseSlackY = Math.max(500, safeH * 0.8)
  const limitX = Math.max(baseSlackX, safeW * Math.abs(scale - 1) * 0.75 + baseSlackX)
  const limitY = Math.max(baseSlackY, safeH * Math.abs(scale - 1) * 0.75 + baseSlackY)

  return {
    x: clamp(camera.x || 0, -limitX, limitX),
    y: clamp(camera.y || 0, -limitY, limitY),
    scale,
  }
}

function getLayerPoint(point, element) {
  const rect = element.getBoundingClientRect()
  return {
    x: point.clientX - rect.left - rect.width / 2,
    y: point.clientY - rect.top - rect.height / 2,
  }
}

function getDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

function getMidpoint(a, b) {
  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2,
  }
}

function zoomCameraAt(camera, targetScale, origin, width, height) {
  const nextScale = clamp(targetScale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
  const currentScale = camera.scale || 1
  const ratio = nextScale / currentScale

  return clampCamera(
    {
      x: origin.x - (origin.x - camera.x) * ratio,
      y: origin.y - (origin.y - camera.y) * ratio,
      scale: nextScale,
    },
    width,
    height,
  )
}

const DEFAULT_ANCHORS = [
  { x: 50, y: 50 },
  { x: 79, y: 52 },
  { x: 21, y: 52 },
  { x: 50, y: 19 },
  { x: 50, y: 80 },
]

const MOBILE_GRID = [
  { x: 30, y: 16 },
  { x: 70, y: 16 },
  { x: 30, y: 40 },
  { x: 70, y: 40 },
  { x: 30, y: 64 },
  { x: 70, y: 64 },
]

const FOCUS_CENTER_DESKTOP = { x: 50, y: 50 }
const FOCUS_CENTER_MOBILE = { x: 50, y: 30 }
/** Centro costellazione: centro area mappa (il CRT è già escluso da inset CSS). */
const FOCUS_CENTER_ZOOM_MOBILE = { x: 50, y: 44 }
const GUIDE_STAR_SPIRAL = [
  { angle: -0.75, distance: 1 },
  { angle: 0.62, distance: 0.88 },
  { angle: 2.18, distance: 1.08 },
  { angle: -2.36, distance: 0.96 },
]

/** Vertical ellipse compression; n≤2 uses horizontal spread (yFlatten = 1). */
function constellationYFlatten(count) {
  if (count <= 2) return 1
  if (count === 3) return 0.88
  return 0.82
}

/** Angoli orbita: n=2 orizzontale; n≥3 anello uniforme con offset (evita x=0 condiviso). */
function constellationAngle(count, index) {
  if (count <= 1) return -Math.PI / 2
  if (count === 2) {
    return index === 0 ? Math.PI : 0
  }
  const start = -Math.PI / 2 + Math.PI / count
  return start + (index * (Math.PI * 2)) / count
}

function constellationOffset(angle, radius, yFlatten) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * yFlatten,
  }
}

/** n=2: strict left/right pair; never share x within CONSTELLATION_MIN_X_GAP. */
function resolveConstellationPosition(count, index, orbit, yFlatten) {
  if (count === 2) {
    const xSign = index === 0 ? -1 : 1
    return { x: xSign * orbit, y: 0 }
  }
  const angle = constellationAngle(count, index)
  return constellationOffset(angle, orbit, yFlatten)
}

function minPairOrbitRadius(nodeDiameter) {
  const peerFloor = minOrbitRadius(2, nodeDiameter)
  const spreadFloor = nodeDiameter + CONSTELLATION_PAIR_ORBIT_MIN_EXTRA
  const xGapFloor = (nodeDiameter + CONSTELLATION_MIN_X_GAP) / 2
  return Math.ceil(Math.max(peerFloor, spreadFloor, xGapFloor))
}

/** Chord length between adjacent satellites at radius 1 on the flattened ellipse. */
function peerSpacingFactor(count, index, yFlatten) {
  if (count <= 1) return 1
  const a1 = constellationAngle(count, index)
  const a2 = constellationAngle(count, (index + 1) % count)
  const dx = Math.cos(a1) - Math.cos(a2)
  const dy = yFlatten * (Math.sin(a1) - Math.sin(a2))
  return Math.hypot(dx, dy)
}

/** Raggio minimo: nodi non si sovrappongono al core né tra loro. */
function minOrbitRadius(count, nodeDiameter, coreDiameter = CONSTELLATION_CORE_DIAM) {
  if (count < 1) return 0
  const nodeR = nodeDiameter / 2
  const coreR = coreDiameter / 2
  const orbitForCore = coreR + nodeR + CONSTELLATION_NODE_GAP
  if (count === 1) {
    return Math.ceil(orbitForCore + CONSTELLATION_LABEL_CLEAR * 0.3)
  }
  const minCenterDistance = nodeDiameter + CONSTELLATION_NODE_GAP
  const yFlatten = constellationYFlatten(count)
  let orbitForPeers = orbitForCore
  for (let i = 0; i < count; i += 1) {
    const factor = peerSpacingFactor(count, i, yFlatten)
    if (factor > 0.01) {
      orbitForPeers = Math.max(orbitForPeers, minCenterDistance / factor)
    }
  }
  const multiBonus = 12 + count * 6
  return Math.ceil(orbitForPeers + multiBonus)
}

function maxViewportOrbit(
  mapW,
  mapH,
  focusCenter,
  nodeDiameter,
  yFlatten = 0.82,
  { n = 3, compactLabels = false } = {},
) {
  if (mapW < 1 || mapH < 1) return Infinity
  const labelPad = compactLabels ? 40 : MAP_LABEL_PAD_PX
  const labelClear = compactLabels ? 22 : CONSTELLATION_LABEL_CLEAR
  const coreR = CONSTELLATION_CORE_DIAM / 2
  const nodeR = nodeDiameter / 2 + labelClear
  const focusYpx = (focusCenter.y / 100) * mapH
  const focusXpx = (focusCenter.x / 100) * mapW
  const edgePad = CONSTELLATION_MAP_EDGE_PAD
  const vertRoom = Math.min(
    focusYpx - labelPad * 0.25,
    mapH - focusYpx - labelPad,
  )
  const horizRoom = Math.min(
    focusXpx - edgePad,
    mapW - focusXpx - edgePad,
  )
  const yf = Math.max(yFlatten, 0.5)

  if (n === 2 && yFlatten >= 0.95) {
    const halfOrbitCap = horizRoom - coreR - nodeR
    const vertCap = (vertRoom - nodeR) / yf
    const cap = Math.min(halfOrbitCap, vertCap)
    if (cap > 0) return cap
    const fallbackHalf = mapW * 0.5 - coreR - nodeR - edgePad
    return Math.max(0, fallbackHalf)
  }

  const vertCap = (vertRoom - nodeR) / yf
  const horizCap = horizRoom - nodeR
  const cap = Math.max(0, Math.min(vertCap, horizCap))
  if (cap > 0) return cap
  const fallback = Math.min(
    mapW * 0.5 - coreR - nodeR - edgePad,
    (mapH - labelPad * 2) * 0.5 - coreR - nodeR,
  )
  return Math.max(0, fallback)
}

/** Fit orbit to viewport: shrink node sizes before dropping below peer-spacing floor. */
function fitConstellationOrbit({
  n,
  sizes,
  orbitHint,
  mapW,
  mapH,
  focusCenter,
  isMobile,
}) {
  const yFlatten = constellationYFlatten(n)
  const compactLabels = isMobile
  const minNodeSize = isMobile ? 34 : 46
  const labelClear = compactLabels ? 22 : CONSTELLATION_LABEL_CLEAR
  let fittedSizes = sizes.map((size) => Math.round(Math.max(minNodeSize, size)))
  let maxNode = Math.max(...fittedSizes, minNodeSize)

  const orbitFloorFor = (nodeSize) =>
    n === 2 ? minPairOrbitRadius(nodeSize) : minOrbitRadius(n, nodeSize)

  const maxFitFor = (nodeSize) =>
    maxViewportOrbit(mapW, mapH, focusCenter, nodeSize + labelClear, yFlatten, {
      n,
      compactLabels,
    })

  let orbitFloor = orbitFloorFor(maxNode)
  let maxFit = maxFitFor(maxNode)

  while (orbitFloor > maxFit && maxNode > minNodeSize) {
    fittedSizes = fittedSizes.map((size) => Math.round(Math.max(minNodeSize, size * 0.88)))
    maxNode = Math.max(...fittedSizes, minNodeSize)
    orbitFloor = orbitFloorFor(maxNode)
    maxFit = maxFitFor(maxNode)
  }

  let orbitForCount = Math.max(orbitHint, orbitFloor)
  if (maxFit > 0) {
    orbitForCount = Math.min(orbitForCount, maxFit)
  }

  if (n === 2) {
    const minHalfSep = Math.ceil((maxNode + CONSTELLATION_MIN_X_GAP) / 2)
    const idealOrbit = Math.max(minPairOrbitRadius(maxNode), maxNode + CONSTELLATION_PAIR_ORBIT_MIN_EXTRA)
    if (maxFit <= 0 || idealOrbit <= maxFit) {
      orbitForCount = Math.max(orbitForCount, idealOrbit)
      if (maxFit > 0) {
        orbitForCount = Math.min(orbitForCount, maxFit)
      }
    }
    orbitForCount = Math.max(orbitForCount, minHalfSep)
    if (maxFit > 0) {
      orbitForCount = Math.min(orbitForCount, maxFit)
    }
  } else {
    orbitForCount = Math.max(orbitFloor, orbitForCount)
  }

  return {
    sizes: fittedSizes,
    orbitForCount: Math.round(orbitForCount),
    maxNode,
    yFlatten,
  }
}

function computeGalassiaZoomLayout({
  mapW,
  mapH,
  viewportBase,
  isMobile,
  isZoomed,
  subCount = 1,
}) {
  const mapBase = mapW > 0 && mapH > 0 ? Math.min(mapW, mapH) : 0
  const base = mapBase || viewportBase
  const safeBounds = isMobile ? MAP_SAFE_MOBILE : MAP_SAFE_DESKTOP

  if (!isZoomed) {
    return {
      base,
      focusCenter: isMobile ? FOCUS_CENTER_MOBILE : FOCUS_CENTER_DESKTOP,
      selectedScale: 1,
      orbitRadius: 84,
      constellationPadding: 120,
      planetSizeFactor: isMobile ? 0.19 : 0.2,
      planetSizeK: isMobile ? 0.14 : 0.16,
      safeBounds,
    }
  }

  const n = Math.max(1, subCount)
  const yFlatten = constellationYFlatten(n)
  const estNode = isMobile ? 68 : 80
  const orbitFloor = minOrbitRadius(n, estNode)
  let orbitRadius = Math.round(
    Math.max(
      orbitFloor,
      Math.min(isMobile ? 142 : 178, base * (isMobile ? 0.26 : 0.3)),
    ),
  )
  const orbitWant = Math.max(orbitRadius, Math.round(orbitFloor + n * 18))
  const constellationPadding = Math.round(Math.max(80, base * 0.16))
  const selectedScale = Math.min(isMobile ? 1.2 : 1.34, 1.04 + base / 820)

  const focusCenter = {
    x: 50,
    y: isMobile ? FOCUS_CENTER_ZOOM_MOBILE.y : MAP_ZOOM_FOCUS_Y,
  }

  if (mapH > 0 && mapW > 0) {
    const maxOrbit = maxViewportOrbit(
      mapW,
      mapH,
      focusCenter,
      estNode + (isMobile ? 22 : CONSTELLATION_LABEL_CLEAR),
      yFlatten,
      { n, compactLabels: isMobile },
    )
    if (maxOrbit > 0) {
      orbitRadius = Math.round(Math.max(orbitFloor, Math.min(orbitWant, maxOrbit)))
    } else {
      orbitRadius = orbitFloor
    }
  } else {
    orbitRadius = orbitWant
  }

  return {
    base,
    focusCenter,
    selectedScale,
    orbitRadius,
    constellationPadding,
    planetSizeFactor: isMobile ? 0.1 : 0.115,
    planetSizeK: isMobile ? 0.075 : 0.085,
    safeBounds,
  }
}

const GALASSIA_AXIS = [
  { className: 'galassia-view__axis-label--north', title: 'Nord', text: 'Entusiasta' },
  { className: 'galassia-view__axis-label--west', title: 'Ovest', text: 'Malinconica' },
  { className: 'galassia-view__axis-label--east', title: 'Est', text: 'Marziale' },
  { className: 'galassia-view__axis-label--center', title: 'Centro', text: 'Flemmatica' },
  { className: 'galassia-view__axis-label--south', title: 'Sud', text: 'Razionale' },
]

const FAMILY_KEY_BY_DISPOSITION = {
  malinconica_nostalgica: 'blu',
  collerico_volitiva: 'rosso',
  flemmatica: 'verde',
  entusiasmo: 'giallo',
  agnostica_anaffettiva: 'grigio',
}

const CORRENTE_NAME_BY_FAMILY = {
  blu: 'Malinconica',
  rosso: 'Marziale',
  verde: 'Flemmatica',
  giallo: 'Entusiasta',
  grigio: 'Razionale',
}

const RELATION_TONE_COPY = {
  calma: {
    label: 'stabilizza',
    text: 'porta contenimento, pazienza e continuità.',
  },
  spinta: {
    label: 'direziona',
    text: 'porta decisione, azione e orientamento pratico.',
  },
  profondita: {
    label: 'approfondisce',
    text: 'porta sensibilità, memoria e risonanza interiore.',
  },
  energia: {
    label: 'accende',
    text: 'porta movimento, creatività e slancio.',
  },
  distanza: {
    label: 'distanzia',
    text: 'porta osservazione, separazione e controllo razionale.',
  },
  misto: {
    label: 'modula',
    text: 'aggiunge una sfumatura specifica alla disposizione prevalente.',
  },
}

const RAPPORTI_ANCHORS = {
  natura: { x: 50, y: 24 },
  se: { x: 24, y: 52 },
  altro: { x: 76, y: 52 },
  agire: { x: 50, y: 78 },
}

/** Parola d'asse del triangolo Portato, mostrata sotto il nome del pianeta (solo se aggiunge qualcosa). */
function portatoAxisWord(nome) {
  const word = {
    Simpatia: GALASSIA_PORTATO_UI.axisAttrazione,
    Antipatia: GALASSIA_PORTATO_UI.axisRifiuto,
    Indifferenza: GALASSIA_PORTATO_UI.axisDistacco,
  }[nome]
  return word && word !== nome ? word.toLowerCase() : ''
}

const PORTATO_ANCHORS = {
  Simpatia: { x: 28, y: 36 },
  Antipatia: { x: 72, y: 36 },
  Indifferenza: { x: 50, y: 68 },
}

const PORTATO_COLORS = {
  Simpatia: '#4ade80',
  Antipatia: '#64748b',
  Indifferenza: '#94a3b8',
}

const PORTATO_CARD_BY_KEY = Object.fromEntries(
  GALASSIA_PORTATO_UI.cards.map((card) => [card.id, card]),
)

const CORRENTE_COLOR_BY_NAME = {
  Malinconica: '#60a5fa',
  Marziale: '#f87171',
  Flemmatica: '#4ade80',
  Entusiasta: '#fde047',
  Razionale: '#94a3b8',
  Malinconia: '#60a5fa',
  Volitività: '#f87171',
  Calma: '#4ade80',
  Entusiasmo: '#fde047',
  Anaffettività: '#94a3b8',
}

const FAMILY_NAME_BY_KEY = {
  blu: 'Blu',
  rosso: 'Rosso',
  verde: 'Verde',
  giallo: 'Giallo',
  grigio: 'Grigio',
}

const DISPOSITION_ID_BY_FAMILY_KEY = {
  blu: 'malinconica_nostalgica',
  rosso: 'collerico_volitiva',
  verde: 'flemmatica',
  giallo: 'entusiasmo',
  grigio: 'agnostica_anaffettiva',
}

const FAMILY_KEY_BY_COLOR = {
  '#3b82f6': 'blu',
  '#60a5fa': 'blu',
  '#ef4444': 'rosso',
  '#f87171': 'rosso',
  '#22c55e': 'verde',
  '#4ade80': 'verde',
  '#eab308': 'giallo',
  '#fde047': 'giallo',
  '#6b7280': 'grigio',
  '#9ca3af': 'grigio',
}

const FAMILY_KEY_ALIASES = {
  blu: 'blu',
  malinconia: 'blu',
  lunare: 'blu',
  malinconica: 'blu',
  nostalgia: 'blu',
  nostalgica: 'blu',
  rosso: 'rosso',
  volitivita: 'rosso',
  volitiva: 'rosso',
  marziale: 'rosso',
  collerica: 'rosso',
  verde: 'verde',
  calma: 'verde',
  flemmatica: 'verde',
  giallo: 'giallo',
  entusiasmo: 'giallo',
  solare: 'giallo',
  gioiososanguinico: 'giallo',
  gioioso: 'giallo',
  sanguinico: 'giallo',
  grigio: 'grigio',
  anaffettivita: 'grigio',
  anaffettiva: 'grigio',
  agnostica: 'grigio',
  razionale: 'grigio',
  intellettualerazionale: 'grigio',
}

const LESSICO_RELATIONS_BY_FAMILY = {
  blu: {
    pairs: [
      { familyKey: 'verde', label: 'profondità + calma' },
      { familyKey: 'giallo', label: 'memoria + apertura' },
    ],
    contrasts: [
      { familyKey: 'rosso', label: 'riflessione / azione' },
      { familyKey: 'grigio', label: 'risonanza / distacco' },
    ],
  },
  rosso: {
    pairs: [
      { familyKey: 'giallo', label: 'azione + slancio' },
      { familyKey: 'grigio', label: 'decisione + lucidità' },
    ],
    contrasts: [
      { familyKey: 'verde', label: 'spinta / pausa' },
      { familyKey: 'blu', label: 'fare / rimandare dentro' },
    ],
  },
  verde: {
    pairs: [
      { familyKey: 'blu', label: 'calma + ascolto' },
      { familyKey: 'grigio', label: 'pausa + osservazione' },
    ],
    contrasts: [
      { familyKey: 'rosso', label: 'riposo / attivazione' },
      { familyKey: 'giallo', label: 'lentezza / movimento' },
    ],
  },
  giallo: {
    pairs: [
      { familyKey: 'rosso', label: 'slancio + direzione' },
      { familyKey: 'blu', label: 'apertura + memoria' },
    ],
    contrasts: [
      { familyKey: 'grigio', label: 'calore / raffreddamento' },
      { familyKey: 'verde', label: 'moto / quiete' },
    ],
  },
  grigio: {
    pairs: [
      { familyKey: 'rosso', label: 'lucidità + scelta' },
      { familyKey: 'verde', label: 'distanza + regolazione' },
    ],
    contrasts: [
      { familyKey: 'giallo', label: 'distacco / entusiasmo' },
      { familyKey: 'blu', label: 'calcolo / risonanza' },
    ],
  },
}

function mapModeSupportsZoom(mode) {
  return mode === 'disposizioni' || mode === 'rapporti'
}

function rapportoLivello(peso) {
  return Math.max(0, Math.min(7, Math.round(Number(peso) || 0)))
}

function formatNodeWeight(mode, node) {
  if (mode === 'rapporti') {
    const level = rapportoLivello(node?.peso)
    const family = node?.raw?.correntePrincipale?.nome || ''
    const levelLabel = `${level}/7`
    const familyLevel = family ? `${family} ${levelLabel}` : levelLabel
    return {
      short: familyLevel,
      display: familyLevel,
      sizeRatio: level / 7,
      headBadge: levelLabel,
      isRapportiLevel: true,
    }
  }
  if (mode === 'parole') {
    const activationPct = pesoToPct(node?.raw?.activationPct ?? node?.peso)
    const totalWords = Number(node?.raw?.totalWords) || 0
    const emergedCount = Number(node?.raw?.emerseCount) || 0
    const wordLabel =
      totalWords === 1 ? '1 parola' : `${totalWords} parole`
    const lexiconLabel =
      totalWords === 1 ? '1 parola nel lessico' : `${totalWords} parole nel lessico`
    return {
      short: totalWords ? `${wordLabel} lessico` : `${activationPct}% presenza`,
      display: totalWords ? lexiconLabel : `${activationPct}% presenza`,
      sizeRatio: Math.max(0.18, activationPct / 100),
      headBadge: emergedCount > 0 ? `${emergedCount} emerse dal test` : wordLabel,
      isRapportiLevel: false,
    }
  }
  const pct = pesoToPct(node?.peso)
  return {
    short: `${pct}%`,
    display: `${pct}%`,
    sizeRatio: pct / 100,
    headBadge: `${pct}%`,
    isRapportiLevel: false,
  }
}

function normalizeLessicoKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function familyKeyFromLabel(value) {
  const normalized = normalizeLessicoKey(value)
  if (!normalized) return ''
  const parts = normalized.split(' ').filter(Boolean)
  for (const part of parts) {
    if (FAMILY_KEY_ALIASES[part]) return FAMILY_KEY_ALIASES[part]
  }
  return FAMILY_KEY_ALIASES[normalized] || ''
}

function familyKeyFromWordEntry(entry) {
  if (!entry) return ''
  if (entry.familyKey && FAMILY_NAME_BY_KEY[entry.familyKey]) return entry.familyKey
  const fromFamilyName = familyKeyFromLabel(entry.familyName)
  if (fromFamilyName) return fromFamilyName
  const fromCorrente = familyKeyFromLabel(entry.corrente)
  if (fromCorrente) return fromCorrente
  const fromColor = FAMILY_KEY_BY_COLOR[String(entry.colore || '').trim().toLowerCase()]
  return fromColor || ''
}

function getFamilyNameForKey(familyKey) {
  return FAMILY_NAME_BY_KEY[familyKey] || ''
}

function getLessicoDetailForFamily(famiglieLessico = {}, familyKey = '') {
  const familyName = getFamilyNameForKey(familyKey)
  if (!familyName) return null
  return famiglieLessico?.[familyName] || FAMIGLIE_LESSICO[familyName] || null
}

function getLessicoCorrenteForFamily(lessicoCorrenti = [], familyKey = '') {
  return (Array.isArray(lessicoCorrenti) ? lessicoCorrenti : []).find((item) => {
    if (!item) return false
    return (
      item.familyKey === familyKey ||
      familyKeyFromLabel(item.familyName) === familyKey ||
      familyKeyFromLabel(item.label) === familyKey ||
      familyKeyFromLabel(item.nome) === familyKey
    )
  }) || null
}

function buildWordEntries(labels = [], emergedSet = new Set(), source = 'dizionario') {
  const byKey = new Map()
  for (const label of labels) {
    const nome = String(label || '').trim()
    if (!nome) continue
    const key = normalizeLessicoKey(nome)
    if (!key || byKey.has(key)) continue
    byKey.set(key, {
      id: `${source}-${key}`,
      nome,
      source,
      isEmerged: emergedSet.has(key),
    })
  }
  return [...byKey.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

function buildLessicoRelations(familyKey = '') {
  const config = LESSICO_RELATIONS_BY_FAMILY[familyKey] || { pairs: [], contrasts: [] }
  const toRelation = (item, kind) => ({
    ...item,
    kind,
    nome: getFamigliaLabel(item.familyKey) || CORRENTE_NAME_BY_FAMILY[item.familyKey] || item.familyKey,
    colore: getFamigliaDot(item.familyKey) || '#94a3b8',
  })
  return [
    ...config.pairs.map((item) => toRelation(item, 'pair')),
    ...config.contrasts.map((item) => toRelation(item, 'contrast')),
  ]
}

function buildLessicoSubcurrents({
  corrente,
  detail,
  emergedItems,
  emergedSet,
}) {
  const dataSubs = Array.isArray(corrente?.sottoCorrenti) ? corrente.sottoCorrenti : []
  const detailSubs = Array.isArray(detail?.sottoCorrenti) ? detail.sottoCorrenti : []
  const sourceSubs = detailSubs.length ? detailSubs : dataSubs

  return sourceSubs.map((sub, index) => {
    const rawKey = sub.id || sub.rawKey || dataSubs[index]?.id || ''
    const dataSub = dataSubs.find((candidate) => candidate.id === rawKey) || dataSubs[index] || null
    const theory = rawKey ? getGalaxyTheoryForRawKey(rawKey) : null
    const states = Array.isArray(sub.stati)
      ? sub.stati
      : Array.isArray(dataSub?.statiDanimo)
        ? dataSub.statiDanimo
        : []
    const statesSet = new Set(states.map(normalizeLessicoKey))
    const emergedForSub = emergedItems.filter((item) => {
      const wordKey = normalizeLessicoKey(item?.parola)
      return item?.correnteKey === rawKey || statesSet.has(wordKey)
    })
    const words = buildWordEntries(
      [
        ...emergedForSub.map((item) => item.parola),
        ...states,
      ],
      emergedSet,
      rawKey || `sottodisposizione-${index}`,
    )
    const pct = pesoToPct(dataSub?.peso)

    return {
      id: rawKey || `lessico-sub-${index}`,
      rawKey,
      nome: sub.titolo || dataSub?.nome || theory?.title || rawKeyToReadable(rawKey),
      colore: dataSub?.colore || corrente?.colore || '#94a3b8',
      peso: Math.max(18, pct),
      activationPct: pct,
      descrizione: sub.descrizione || dataSub?.descrizione || theory?.description || '',
      intervallo: sub.intervallo || theory?.interval || '',
      coloreTST: theory?.color || sub.colore || '',
      wordCount: words.length,
      emergedCount: words.filter((word) => word.isEmerged).length,
      words,
      statiDanimo: words.map((word) => word.nome),
    }
  })
}

function rawKeyToReadable(rawKey) {
  return String(rawKey || '')
    .split('_')
    .slice(2)
    .join(' ')
    .replaceAll('_', ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildLessicoGalaxyNodes({
  data,
  paroleEmerse,
  lessicoCorrenti,
  famiglieLessico,
}) {
  return (Array.isArray(data) ? data : []).map((corrente, index) => {
    const familyKey =
      familyKeyForCorrente(corrente) ||
      familyKeyFromLabel(corrente?.nome) ||
      Object.keys(DISPOSITION_ID_BY_FAMILY_KEY)[index] ||
      ''
    const familyName = getFamilyNameForKey(familyKey)
    const detail = getLessicoDetailForFamily(famiglieLessico, familyKey)
    const lessicoCorrente = getLessicoCorrenteForFamily(lessicoCorrenti, familyKey)
    const emergedItems = (Array.isArray(paroleEmerse) ? paroleEmerse : []).filter(
      (item) => familyKeyFromWordEntry(item) === familyKey,
    )
    const emergedSet = new Set(emergedItems.map((item) => normalizeLessicoKey(item?.parola)))
    const subcurrents = buildLessicoSubcurrents({
      corrente,
      detail,
      emergedItems,
      emergedSet,
    })
    const familyWordLabels = [
      ...emergedItems.map((item) => item.parola),
      ...(Array.isArray(lessicoCorrente?.lessico) ? lessicoCorrente.lessico : []),
      ...(Array.isArray(detail?.vocabolarioForme) ? detail.vocabolarioForme : []),
      ...subcurrents.flatMap((sub) => sub.words.map((word) => word.nome)),
    ]
    const words = buildWordEntries(familyWordLabels, emergedSet, familyKey || corrente.id || 'famiglia')
    const dispositionId = DISPOSITION_ID_BY_FAMILY_KEY[familyKey] || corrente.id
    const relations = buildLessicoRelations(familyKey)

    return {
      id: `parole-${dispositionId}`,
      nome: getFamigliaLabel(familyKey) || CORRENTE_NAME_BY_FAMILY[familyKey] || corrente.nome,
      colore: corrente.colore || getFamigliaDot(familyKey) || '#94a3b8',
      peso: pesoToPct(corrente.peso),
      anchor: WIND_ANCHORS[dispositionId] || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length],
      mode: 'parole',
      raw: {
        sourceId: corrente.id,
        familyKey,
        familyName,
        dispositionName: corrente.nome,
        activationPct: pesoToPct(corrente.peso),
        totalWords: words.length,
        emerseCount: emergedItems.length,
        subCount: subcurrents.length,
        nominalCount: Array.isArray(detail?.vocabolarioForme) ? detail.vocabolarioForme.length : 0,
        relationMethod: 'vicinanza e opposizione',
        lettura: detail?.lettura || corrente.descrizione || '',
        relations,
      },
      parole: emergedItems,
      words,
      sottoCorrenti: subcurrents,
    }
  })
}

function buildModeIdlePanel(mode, { dominant, portato, deepReading } = {}) {
  const modeMeta = GALASSIA_MAP_MODES.find((item) => item.id === mode)
  const base = {
    kind: 'idle',
    id: `idle-${mode}`,
    nome: modeMeta?.hint || GALASSIA_UI.chromeTitle,
    hint: GALASSIA_UI.modeIdle[mode] || GALASSIA_CRT.idleTapHint,
    tapHint:
      mode === 'rapporti'
        ? GALASSIA_RAPPORTI_UI.tapHint
        : mode === 'portato'
          ? GALASSIA_PORTATO_UI.tapHint
          : mode === 'parole'
            ? GALASSIA_UI.mapHintByMode.parole
            : GALASSIA_UI.clickPlanetHint,
    dominantChip:
      dominant && (mode === 'disposizioni' || mode === 'parole')
        ? {
            id: dominant.id,
            nome: dominant.nome,
            pct: pesoToPct(dominant.peso),
            colore: dominant.colore,
          }
        : null,
    deepReading: mode === 'disposizioni' && Array.isArray(deepReading) ? deepReading : null,
  }
  if (mode === 'rapporti') {
    return {
      ...base,
      intro: GALASSIA_RAPPORTI_UI.idleHintLead,
    }
  }
  if (mode === 'parole') {
    return {
      ...base,
      idleKicker: 'Lessico emotivo',
      dominantChipLabel: 'Famiglia più presente',
      intro:
        'Questa vista spiega per cosa stanno le parole: non aggiunge un punteggio, ma ordina parole emerse dal test e dizionario TST per famiglia emotiva.',
      introPoints: [
        {
          id: 'settori',
          label: 'Pianeta',
          areas: 'Famiglia emotiva',
          meaning: 'Il cerchio rappresenta una famiglia, come Entusiasta o Flemmatica.',
        },
        {
          id: 'conteggio',
          label: 'Numero',
          areas: 'Parole nel lessico',
          meaning: 'Il conteggio indica quante parole TST sono collegate a quella famiglia.',
        },
        {
          id: 'emerse',
          label: 'Emerse',
          areas: 'Risposte del test',
          meaning: 'Nel pannello trovi quali parole sono state scelte e quali sono di riferimento.',
        },
      ],
    }
  }
  if (mode === 'portato' && portato?.hasData) {
    const prevalenteDim = (portato.dimensioni || []).find((dim) => dim.key === portato.prevalente)
    return {
      ...base,
      idleKicker: 'Come hai vissuto il test',
      dominantChipLabel: GALASSIA_PORTATO_UI.prevalenteLabel,
      intro: GALASSIA_PORTATO_UI.intro,
      introPoints: GALASSIA_PORTATO_UI.cards,
      scaleNote: GALASSIA_PORTATO_UI.scaleNote,
      dimensioni: portato.dimensioni,
      prevalenteLabel: portato.prevalenteLabel || portato.prevalente,
      descrizione: portato.descrizione,
      vitalita: portato.vitalita,
      dominantChip: prevalenteDim
        ? {
            id: `portato-${String(prevalenteDim.key || '').toLowerCase()}`,
            nome: prevalenteDim.label || prevalenteDim.key,
            pct: prevalenteDim.percentuale ?? 0,
            colore: PORTATO_COLORS[prevalenteDim.key] || '#94a3b8',
          }
        : null,
    }
  }
  return base
}

function buildModePanelContent(mode, node, activeSub = null) {
  if (!node) return buildModeIdlePanel(mode)
  const raw = node.raw || {}

  if (mode === 'rapporti') {
    if (activeSub) {
      const livello = rapportoLivello(activeSub.livello ?? activeSub.peso)
      return {
        kind: 'rapporto-radar',
        id: activeSub.id,
        nome: activeSub.nome,
        livello,
        headBadge: `${livello}/7`,
        colore: activeSub.colore,
        definizione:
          activeSub.descrizione ||
          `Livello ${livello}/7 per la famiglia ${activeSub.nome} in «${raw.nome}».`,
        cosaIndica: `Confronto interno al radar di «${raw.nome}» (scala 1–7).`,
      }
    }
    const livello = rapportoLivello(node.peso)
    return {
      kind: 'rapporto',
      id: node.id,
      nome: raw.nome,
      livello,
      headBadge: `${livello}/7`,
      colore: node.colore,
      definizione: raw.definizione,
      cosaIndica: raw.cosaIndica,
      composizione: raw.composizione,
      correntePrincipale: raw.correntePrincipale,
      datiRadar: raw.datiRadar,
    }
  }

  if (mode === 'portato') {
    const card = PORTATO_CARD_BY_KEY[raw.key]
    return {
      kind: 'portato',
      id: node.id,
      nome: raw.label || node.nome,
      pct: raw.percentuale ?? pesoToPct(node.peso),
      colore: node.colore,
      definizione: raw.definizioneBreve || '',
      descrizioneCompleta: raw.descrizioneCompleta || '',
      cosaIndica: raw.cosaIndica || card?.meaning || '',
      cardAreas: card?.areas || '',
      cardMetaphor: card?.metaphor || '',
      valore: raw.valore,
      isPrevalente: Boolean(raw.isPrevalente),
    }
  }

  if (mode === 'parole') {
    if (activeSub) {
      const words = Array.isArray(activeSub.words)
        ? activeSub.words
        : buildWordEntries(activeSub.statiDanimo || [])
      const emergedWords = words.filter((word) => word.isEmerged)
      return {
        kind: 'lessico-sottocorrente',
        id: activeSub.id,
        nome: activeSub.nome,
        parentNome: node.nome,
        headBadge: activeSub.wordCount === 1 ? '1 parola' : `${activeSub.wordCount || words.length} parole`,
        pct: activeSub.activationPct ?? pesoToPct(activeSub.peso),
        colore: activeSub.colore,
        definizione:
          activeSub.descrizione ||
          `Sottodisposizione lessicale della famiglia ${node.nome}.`,
        intervallo: activeSub.intervallo,
        coloreTST: activeSub.coloreTST,
        words,
        emergedWords,
      }
    }
    const words = Array.isArray(node.words) ? node.words : []
    const emergedWords = words.filter((word) => word.isEmerged)
    const relations = Array.isArray(raw.relations) ? raw.relations : []
    return {
      kind: 'parole-famiglia',
      id: node.id,
      nome: node.nome,
      headBadge: formatNodeWeight(mode, node).headBadge,
      pct: raw.activationPct ?? pesoToPct(node.peso),
      colore: node.colore,
      definizione:
        raw.lettura ||
        `${raw.totalWords || words.length} parole di riferimento nella famiglia ${node.nome}.`,
      words,
      emergedWords,
      relations,
      sottoCorrenti: Array.isArray(node.sottoCorrenti) ? node.sottoCorrenti : [],
      stats: [
        { label: 'Lessico', value: raw.totalWords || words.length },
        { label: 'Emerse', value: raw.emerseCount || 0 },
        { label: 'Sfumature', value: raw.subCount || 0 },
      ],
      statiDanimo: words.slice(0, 12).map((word) => word.nome),
    }
  }

  return null
}

function buildMapNodes({ mode, data, rapporti, portato, paroleEmerse, lessicoCorrenti, famiglieLessico }) {
  if (mode === 'rapporti') {
    return (Array.isArray(rapporti) ? rapporti : []).map((rapporto) => {
      const radar = Array.isArray(rapporto.datiRadar) ? rapporto.datiRadar : []
      const maxVal = Math.max(...radar.map((item) => Number(item.valore) || 0), 0)
      return {
        id: `rapporto-${rapporto.id}`,
        nome: rapporto.nome,
        colore: rapporto.correntePrincipale?.colore || '#94a3b8',
        peso: maxVal,
        anchor: RAPPORTI_ANCHORS[rapporto.id] || { x: 50, y: 50 },
        mode: 'rapporti',
        raw: rapporto,
        sottoCorrenti: radar.map((item) => {
          const livello = rapportoLivello(item.valore)
          return {
            id: `radar-${rapporto.id}-${item.corrente}`,
            nome: item.corrente,
            colore: CORRENTE_COLOR_BY_NAME[item.corrente] || '#94a3b8',
            livello,
            peso: livello,
            descrizione: `Livello ${livello}/7`,
          }
        }),
      }
    })
  }

  if (mode === 'portato') {
    const prevalente = portato?.prevalente || ''
    const portatoContent = reportContent?.portato_esperienziale || {}
    return (Array.isArray(portato?.dimensioni) ? portato.dimensioni : []).map((dim) => {
      const card = PORTATO_CARD_BY_KEY[dim.key]
      return {
        id: `portato-${String(dim.key || '').toLowerCase()}`,
        nome: dim.label || dim.key,
        colore: PORTATO_COLORS[dim.key] || '#94a3b8',
        peso: dim.percentuale ?? 0,
        anchor: PORTATO_ANCHORS[dim.key] || { x: 50, y: 50 },
        mode: 'portato',
        raw: {
          ...dim,
          isPrevalente: dim.key === prevalente,
          cosaIndica: portatoContent[dim.key]?.cosa_indica || card?.meaning || '',
          descrizioneCompleta: portatoContent[dim.key]?.descrizione_breve || '',
        },
        sottoCorrenti: [],
      }
    })
  }

  if (mode === 'parole') {
    return buildLessicoGalaxyNodes({
      data,
      paroleEmerse,
      lessicoCorrenti,
      famiglieLessico,
    })
  }

  return (Array.isArray(data) ? data : []).map((corrente, index) => ({
    id: corrente.id,
    nome: corrente.nome,
    colore: corrente.colore,
    peso: corrente.peso,
    anchor: WIND_ANCHORS[corrente.id] || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length],
    mode: 'disposizioni',
    raw: corrente,
    sottoCorrenti: Array.isArray(corrente.sottoCorrenti) ? corrente.sottoCorrenti : [],
  }))
}

function familyKeyForCorrente(corrente) {
  return corrente?.familyKey || FAMILY_KEY_BY_DISPOSITION[corrente?.id] || ''
}

function intensityLabel(pct) {
  const value = Number(pct) || 0
  if (value >= 70) return 'molto alta'
  if (value >= 45) return 'alta'
  if (value >= 25) return 'media'
  if (value >= 10) return 'bassa'
  return 'marginale'
}

function roleLabel(rank) {
  if (rank === 1) return 'corrente prevalente'
  if (rank === 2) return 'seconda corrente'
  if (rank === 3) return 'terza corrente'
  return `${rank}a corrente`
}

function getRapportiForFamily(rapporti = [], familyKey = '') {
  const correnteName = CORRENTE_NAME_BY_FAMILY[familyKey]
  if (!correnteName) return []
  return rapporti
    .map((rapporto) => {
      const match = rapporto?.datiRadar?.find((d) => d.corrente === correnteName)
      return {
        id: rapporto.id,
        nome: rapporto.nome,
        valore: Number(match?.valore) || 0,
      }
    })
    .filter((item) => item.valore > 0)
}

// Tono della relazione deciso dalla famiglia partner (le parole vengono dal PDF
// e non servono più a dedurlo).
const RELATION_TONE_BY_PARTNER = {
  verde: 'calma',
  rosso: 'spinta',
  blu: 'profondita',
  giallo: 'energia',
  grigio: 'distanza',
}

function relationToneForPartner(partnerFamilyKey = '') {
  return RELATION_TONE_BY_PARTNER[partnerFamilyKey] || 'misto'
}

function buildDispositionRelations(rankedData = [], limit = 4) {
  const dominant = rankedData[0]
  if (!dominant) return []
  const dominantFamilyKey = familyKeyForCorrente(dominant)
  return rankedData
    .slice(1)
    .filter((partner) => pesoToPct(partner.peso) > 0)
    .slice(0, limit)
    .map((partner) => {
      const partnerFamilyKey = familyKeyForCorrente(partner)
      const keywords = getDialogoKeywords(dominantFamilyKey, partnerFamilyKey)
      const reciprocalKeywords = getDialogoKeywords(partnerFamilyKey, dominantFamilyKey)
      const tone = relationToneForPartner(partnerFamilyKey)
      return {
        id: `${dominant.id}-${partner.id}`,
        baseId: dominant.id,
        partnerId: partner.id,
        baseNome: getFamigliaLabel(dominantFamilyKey) || dominant.nome,
        partnerNome: getFamigliaLabel(partnerFamilyKey) || partner.nome,
        basePct: pesoToPct(dominant.peso),
        partnerPct: pesoToPct(partner.peso),
        colore: partner.colore || getFamigliaDot(partnerFamilyKey),
        baseColore: dominant.colore || getFamigliaDot(dominantFamilyKey),
        keywords,
        reciprocalKeywords,
        tone,
        toneCopy: RELATION_TONE_COPY[tone] || RELATION_TONE_COPY.misto,
      }
    })
}

function getParoleForFamily(paroleEmerse = [], familyKey = '') {
  return paroleEmerse
    .filter((item) => familyKeyFromWordEntry(item) === familyKey)
    .slice(0, 8)
}

function buildProfileInfo({ corrente, rankedData, paroleEmerse, rapporti }) {
  if (!corrente) return null
  const familyKey = familyKeyForCorrente(corrente)
  const rank = rankedData.findIndex((item) => item.id === corrente.id) + 1
  const pct = pesoToPct(corrente.peso)
  const activePartners = rankedData
    .filter((item) => item.id !== corrente.id && pesoToPct(item.peso) >= 5)
    .slice(0, 4)
    .map((partner) => {
      const partnerFamilyKey = familyKeyForCorrente(partner)
      return {
        id: partner.id,
        nome: getFamigliaLabel(partnerFamilyKey) || partner.nome,
        pct: pesoToPct(partner.peso),
        colore: partner.colore || getFamigliaDot(partnerFamilyKey),
        keywords: getDialogoKeywords(familyKey, partnerFamilyKey).slice(0, 4),
        reciprocalKeywords: getDialogoKeywords(partnerFamilyKey, familyKey).slice(0, 4),
        tone: relationToneForPartner(partnerFamilyKey),
      }
    })

  const subs = (Array.isArray(corrente.sottoCorrenti) ? corrente.sottoCorrenti : [])
    .map((sub) => ({
      ...sub,
      pct: pesoToPct(sub.peso),
    }))
    .sort((a, b) => b.pct - a.pct)

  const emerged = getParoleForFamily(paroleEmerse, familyKey)
  const associatedStates = subs
    .flatMap((sub) => (Array.isArray(sub.statiDanimo) ? sub.statiDanimo.map((label) => ({ label, subPct: sub.pct })) : []))
    .filter((item) => item.label)
  const dominantStates = [
    ...emerged.map((item) => item.parola),
    ...associatedStates
      .filter((item) => item.subPct >= 25)
      .map((item) => item.label),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 8)
  const quieterStates = associatedStates
    .filter((item) => item.subPct < 25)
    .map((item) => item.label)
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .slice(0, 6)

  return {
    familyKey,
    rank,
    pct,
    ruolo: roleLabel(rank || rankedData.length),
    intensita: intensityLabel(pct),
    subs,
    activePartners,
    dominantStates,
    quieterStates,
    rapporti: getRapportiForFamily(rapporti, familyKey),
  }
}

// Solo parole presenti nel PDF «Parole per TST» per la famiglia indicata.
const REPRESENTATIVE_WORDS = {
  'parole-entusiasmo': ['Gioioso', 'Curioso', 'Dinamico'],
  'parole-malinconica_nostalgica': ['Riflessivo', 'Nostalgico', 'Pensieroso'],
  'parole-collerico_volitiva': ['Volitivo', 'Assertivo', 'Risoluto'],
  'parole-flemmatica': ['Calmo', 'Contemplativo', 'Pacato'],
  'parole-agnostica_anaffettiva': ['Distaccato', 'Lucido', 'Indifferente'],
}

function ParoleWordCloud({
  nodes,
  selectedFamilyId,
  selectedSubId,
  onSelectFamily,
  onSelectSub,
}) {
  const isAnyFamilySelected = selectedFamilyId !== null

  // Utility to find word metadata (to highlight emerged words)
  const getWordObject = (familyNode, name) => {
    const found = (familyNode.words || []).find(
      (w) => w.nome.toLowerCase() === name.toLowerCase(),
    )
    return found || { id: `rep-${name}`, nome: name, isEmerged: false }
  }

  return (
    <div className="galassia-parole-cloud" aria-label="Galassia lessicale">
      {/* ── STATE 1: COMPLETE MAP (No family selected) ───────────────── */}
      {!isAnyFamilySelected &&
        (Array.isArray(nodes) ? nodes : []).map((familyNode) => {
          const srcId = familyNode.raw?.sourceId || ''
          const anchor = PAROLE_CLUSTER_ANCHORS[srcId] || familyNode.anchor || { x: 50, y: 50 }
          const color = familyNode.colore || '#94a3b8'
          const repWordNames = REPRESENTATIVE_WORDS[familyNode.id] || []

          const offsets = [
            { dx: -4.8, dy: 6.0 },
            { dx: 0, dy: 8.3 },
            { dx: 4.8, dy: 6.0 },
          ]

          return (
            <React.Fragment key={familyNode.id}>
              {/* Background Nebula */}
              <div
                aria-hidden="true"
                className="galassia-parole-nebula"
                style={{
                  left: `${anchor.x}%`,
                  top: `${anchor.y}%`,
                  width: '24%',
                  height: '25.8%',
                  background: `radial-gradient(ellipse at center, ${color}22 0%, ${color}0b 50%, transparent 74%)`,
                  opacity: 0.6,
                }}
              />

              {/* Family Node Bubble */}
              <button
                type="button"
                className="galassia-parole-family"
                style={{
                  left: `${anchor.x}%`,
                  top: `${anchor.y}%`,
                  '--cloud-color': color,
                  opacity: 0.92,
                  pointerEvents: 'auto',
                }}
                onClick={() => onSelectFamily(familyNode.id)}
                aria-label={`Disposizione ${familyNode.nome}`}
              >
                <span className="galassia-parole-family-dot" style={{ background: color }} aria-hidden />
                <span>{familyNode.nome}</span>
              </button>

              {/* Representative words */}
              {repWordNames.map((wordName, idx) => {
                const word = getWordObject(familyNode, wordName)
                const offset = offsets[idx % offsets.length]
                const x = anchor.x + offset.dx
                const y = anchor.y + offset.dy * 0.6

                return (
                  <button
                    key={word.id}
                    type="button"
                    className={`galassia-parole-word${word.isEmerged ? ' is-emerged' : ''}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      '--cloud-color': color,
                      '--word-font-size': '12.4px',
                      opacity: word.isEmerged ? 0.92 : 0.68,
                      pointerEvents: 'auto',
                    }}
                    onClick={() => onSelectFamily(familyNode.id)}
                    aria-label={word.nome}
                    title={word.nome}
                  >
                    {word.nome}
                  </button>
                )
              })}
            </React.Fragment>
          )
        })}

      {/* ── STATE 2 & 3: FAMILY FOCUS / SUBDISPOSITION FOCUS ─────────── */}
      {isAnyFamilySelected &&
        (Array.isArray(nodes) ? nodes : []).map((familyNode) => {
          const isSelected = selectedFamilyId === familyNode.id
          if (!isSelected) return null // Hide all other families completely

          const srcId = familyNode.raw?.sourceId || ''
          const anchor = PAROLE_CLUSTER_ANCHORS[srcId] || familyNode.anchor || { x: 50, y: 50 }
          const color = familyNode.colore || '#94a3b8'
          const subs = Array.isArray(familyNode.sottoCorrenti) ? familyNode.sottoCorrenti : []

          return (
            <React.Fragment key={familyNode.id}>
              {/* Background Nebula (Enhanced for focused family) */}
              <div
                aria-hidden="true"
                className="galassia-parole-nebula is-active"
                style={{
                  left: `${anchor.x}%`,
                  top: `${anchor.y}%`,
                  width: '54%',
                  height: '58%',
                  background: `radial-gradient(ellipse at center, ${color}36 0%, ${color}14 46%, transparent 74%)`,
                  opacity: 1,
                }}
              />

              {/* Family Node Bubble */}
              <button
                type="button"
                className="galassia-parole-family is-active"
                style={{
                  left: `${anchor.x}%`,
                  top: `${anchor.y}%`,
                  '--cloud-color': color,
                  opacity: selectedSubId ? 0.35 : 1, // Dimmed if a subdisposition is clicked
                  pointerEvents: 'auto',
                }}
                onClick={() => onSelectFamily(familyNode.id)} // Toggles/deselects family
                aria-pressed={true}
                aria-label={`Disposizione ${familyNode.nome}`}
              >
                <span className="galassia-parole-family-dot" style={{ background: color }} aria-hidden />
                <span>{familyNode.nome}</span>
              </button>

              {/* Subdispositions and their words */}
              {subs.map((sub, si) => {
                const subAngle = (si / subs.length) * Math.PI * 2 - Math.PI / 2
                const cx = anchor.x + Math.cos(subAngle) * 8.5
                const cy = anchor.y + Math.sin(subAngle) * 8.5 * 0.6
                const subColor = sub.colore || color

                const isSubActive = selectedSubId === sub.id
                const isAnySubActive = selectedSubId !== null

                // In State 3, hide other subdispositions completely
                if (isAnySubActive && !isSubActive) return null

                // State 2: Focus Family (Subdispositions & 3 orbit words visible)
                if (!isAnySubActive) {
                  const subWords = sub.words || []
                  const emergedSubWords = subWords.filter((w) => w.isEmerged)
                  const referenceSubWords = subWords.filter((w) => !w.isEmerged)
                  const displayWords = [...emergedSubWords, ...referenceSubWords].slice(0, 3)

                  return (
                    <React.Fragment key={sub.id}>
                      {/* Subdisposition button (Dashed pill) */}
                      <button
                        type="button"
                        className="galassia-parole-sub"
                        style={{
                          left: `${cx}%`,
                          top: `${cy}%`,
                          '--cloud-color': subColor,
                          pointerEvents: 'auto',
                        }}
                        onClick={() => onSelectSub(familyNode.id, sub.id)}
                        aria-pressed={false}
                        aria-label={`Sottodisposizione ${sub.nome}`}
                      >
                        {sub.nome}
                      </button>

                      {/* Halo of 3 orbiting words */}
                      {displayWords.map((word, wordIndex) => {
                        const wordAngles =
                          displayWords.length === 1
                            ? [subAngle]
                            : displayWords.length === 2
                              ? [subAngle - 0.2, subAngle + 0.2]
                              : [subAngle - 0.28, subAngle, subAngle + 0.28]
                        const wordAngle = wordAngles[wordIndex % wordAngles.length]
                        const rx = 8.5 + 3.0
                        const wx = anchor.x + Math.cos(wordAngle) * rx
                        const wy = anchor.y + Math.sin(wordAngle) * rx * 0.6

                        return (
                          <button
                            key={word.id}
                            type="button"
                            className={`galassia-parole-word${word.isEmerged ? ' is-emerged' : ''}`}
                            style={{
                              left: `${wx}%`,
                              top: `${wy}%`,
                              '--cloud-color': subColor,
                              '--word-font-size': '12.4px',
                              opacity: word.isEmerged ? 0.94 : 0.72,
                              pointerEvents: 'auto',
                            }}
                            onClick={() => onSelectSub(familyNode.id, sub.id)}
                            aria-label={word.nome}
                            title={word.nome}
                          >
                            {word.nome}
                          </button>
                        )
                      })}
                    </React.Fragment>
                  )
                }

                // State 3: Focus Subdisposition (Selected subdisposition + all its words in double orbit rings)
                if (isSubActive) {
                  const subWords = sub.words || []
                  const emergedSubWords = subWords.filter((w) => w.isEmerged)
                  const referenceSubWords = subWords.filter((w) => !w.isEmerged)
                  const displayWords = [...emergedSubWords, ...referenceSubWords].slice(0, 15)

                  return (
                    <React.Fragment key={sub.id}>
                      {/* Concentric Guide Rings */}
                      <div
                        className="galassia-parole-orbit-ring"
                        style={{
                          left: `${cx}%`,
                          top: `${cy}%`,
                          width: '18%',
                          height: `${18 * 0.6}%`,
                          color: subColor,
                          opacity: 0.16,
                        }}
                      />
                      <div
                        className="galassia-parole-orbit-ring"
                        style={{
                          left: `${cx}%`,
                          top: `${cy}%`,
                          width: '32%',
                          height: `${32 * 0.6}%`,
                          color: subColor,
                          opacity: 0.1,
                        }}
                      />

                      {/* Active Subdisposition button (solid active style) */}
                      <button
                        type="button"
                        className="galassia-parole-sub is-active"
                        style={{
                          left: `${cx}%`,
                          top: `${cy}%`,
                          '--cloud-color': subColor,
                          pointerEvents: 'auto',
                          zIndex: 22,
                        }}
                        onClick={() => onSelectSub(familyNode.id, sub.id)}
                        aria-pressed={true}
                        aria-label={`Sottodisposizione ${sub.nome}`}
                      >
                        {sub.nome}
                      </button>

                      {/* Double Concentric Orbit Words */}
                      {displayWords.map((word, wi) => {
                        let rx, ry, angle
                        if (wi < 5) {
                          // Ring 1 (Inner 5 words)
                          rx = 4.2
                          ry = 3.2
                          angle = (wi / 5) * Math.PI * 2 - Math.PI / 2
                        } else {
                          // Ring 2 (Outer 10 words)
                          rx = 8.5
                          ry = 6.5
                          angle = ((wi - 5) / 10) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10
                        }
                        const wx = cx + Math.cos(angle) * rx
                        const wy = cy + Math.sin(angle) * ry * 0.6

                        return (
                          <button
                            key={word.id}
                            type="button"
                            className={`galassia-parole-word${word.isEmerged ? ' is-emerged' : ''}`}
                            style={{
                              left: `${wx}%`,
                              top: `${wy}%`,
                              '--cloud-color': subColor,
                              '--word-font-size': word.isEmerged ? '14px' : '13px',
                              opacity: word.isEmerged ? 1 : 0.78,
                              pointerEvents: 'auto',
                              zIndex: 20,
                            }}
                            aria-label={word.nome}
                            title={word.nome}
                          >
                            {word.nome}
                          </button>
                        )
                      })}
                    </React.Fragment>
                  )
                }

                return null
              })}
            </React.Fragment>
          )
        })}
    </div>
  )
}

function GalassiaOperatorGuide({ mapMode = 'disposizioni', onDismiss }) {
  const modeMeta = GALASSIA_MAP_MODES.find((item) => item.id === mapMode)
  const steps = GALASSIA_READING_STEPS_BY_MODE[mapMode] || GALASSIA_READING_STEPS

  return (
    <aside
      className="galassia-view__insight-deck galassia-view__insight-deck--guide-only"
      aria-label={GALASSIA_UI.guidePanelTitle}
    >
      <section className="galassia-view__guide-panel galassia-view__guide-panel--solo">
        <div className="galassia-view__guide-copy">
          <p>{modeMeta?.hint || 'Galassia'}</p>
          <h2>{GALASSIA_UI.guidePanelTitle}</h2>
        </div>
        <ol className="galassia-view__guide-steps">
          {steps.map((step) => (
            <li key={step.id}>
              <span aria-hidden="true">{step.label}</span>
              <b>{step.title}</b>
              <em>{step.text}</em>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="galassia-view__guide-dismiss"
          onClick={(event) => {
            event.stopPropagation()
            onDismiss?.()
          }}
        >
          {GALASSIA_UI.guidePanelDismiss}
        </button>
      </section>
    </aside>
  )
}

function GalassiaMapHint({ mode, dominant, onSelectDominant }) {
  const kicker = GALASSIA_UI.idleHintKicker[mode] || GALASSIA_UI.chromeTitle
  let lead = GALASSIA_UI.mapHintByMode[mode] || GALASSIA_CRT.idleTapHint

  if (mode === 'disposizioni' && dominant) {
    lead = `Prevalente: ${dominant.nome} (${pesoToPct(dominant.peso)}%). ${GALASSIA_UI.clickPlanetHintShort}`
  }

  return (
    <div className="galassia-view__map-hint" role="status" aria-live="polite">
      <p className="galassia-view__map-hint-kicker">{kicker}</p>
      <p className="galassia-view__map-hint-lead">{lead}</p>
      {mode === 'disposizioni' && dominant ? (
        <button
          type="button"
          className="galassia-view__map-hint-cta"
          onClick={() => onSelectDominant?.(dominant.id)}
        >
          Vai a {dominant.nome}
        </button>
      ) : null}
    </div>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return reduced
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const media = window.matchMedia('(max-width: 768px)')
    const sync = () => setMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return mobile
}

function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const update = () => {
      const next = {
        w: Math.round(el.clientWidth || 0),
        h: Math.round(el.clientHeight || 0),
      }
      setSize((prev) => (prev.w === next.w && prev.h === next.h ? prev : next))
    }
    update()
    let observer
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update)
      observer.observe(el)
    } else {
      window.addEventListener('resize', update)
    }
    return () => {
      if (observer) observer.disconnect()
      else window.removeEventListener('resize', update)
    }
  }, [ref])
  return size
}

function pesoToPct(peso) {
  const p = Number(peso) || 0
  if (p > 0 && p < 1) return Math.round(p * 100)
  return Math.round(Math.min(100, p))
}

function shortText(text, max = 210) {
  const value = String(text || '').trim()
  if (value.length <= max) return value
  const slice = value.slice(0, max)
  const cut = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf(';'), slice.lastIndexOf(','))
  return `${slice.slice(0, cut > 80 ? cut : max).trim()}...`
}

function MiniBar({ value = 0, color = '#94a3b8' }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <span className="galassia-view__mini-bar" aria-hidden="true">
      <span style={{ width: `${pct}%`, backgroundColor: color }} />
    </span>
  )
}

function PortatoTriadSpectrum({ dimensioni = [], compact = false, showLegend = true }) {
  const dims = (Array.isArray(dimensioni) ? dimensioni : []).filter(
    (dim) => Number(dim.percentuale) > 0 || Number(dim.valore) > 0,
  )
  if (!dims.length) return null

  return (
    <div
      className={`galassia-view__portato-triad${compact ? ' galassia-view__portato-triad--compact' : ''}`}
      role="img"
      aria-label={GALASSIA_PORTATO_UI.triadAria}
    >
      <div className="galassia-view__portato-triad-bar">
        {dims.map((dim) => (
          <span
            key={dim.key}
            className="galassia-view__portato-triad-segment"
            style={{
              flexGrow: Math.max(1, Number(dim.percentuale) || 0),
              backgroundColor: PORTATO_COLORS[dim.key] || '#94a3b8',
            }}
            title={`${dim.label || dim.key}: ${dim.percentuale ?? 0}%`}
          />
        ))}
      </div>
      {showLegend ? (
        <ul className="galassia-view__portato-triad-legend">
          {dims.map((dim) => (
            <li key={dim.key}>
              <span
                className="galassia-view__portato-triad-swatch"
                style={{ backgroundColor: PORTATO_COLORS[dim.key] || '#94a3b8' }}
                aria-hidden
              />
              <strong>{dim.label || dim.key}</strong>
              <em>{dim.percentuale ?? 0}%</em>
            </li>
          ))}
        </ul>
      ) : null}
      {!compact ? (
        <div className="galassia-view__portato-triad-axis" aria-hidden="true">
          <span>{GALASSIA_PORTATO_UI.axisAttrazione}</span>
          <span>{GALASSIA_PORTATO_UI.axisRifiuto}</span>
          <span>{GALASSIA_PORTATO_UI.axisDistacco}</span>
        </div>
      ) : null}
    </div>
  )
}

function GalassiaCrtPanel({
  panel,
  selected,
  activeSubId,
  profileInfo,
  onBackToParent,
  onSelectSub,
  onSelectDominant,
}) {
  if (!panel) return null

  const isSub = panel.kind === 'sottocorrente'
  const isIdle = panel.kind === 'idle'
  const isPreview = !selected && panel.kind === 'corrente'
  const isCostellazione = selected && panel.kind === 'corrente' && !isPreview
  const isCompact = isIdle || isPreview
  const meaning = shortText(panel.definizione || panel.cosaIndica || '', isSub ? 150 : 120)
  const parole = Array.isArray(panel.statiDanimo) ? panel.statiDanimo : []
  const paroleLimit = isSub ? 5 : 4
  const lessicoWords = Array.isArray(panel.words) ? panel.words : []
  const lessicoWordsLimit = 150
  const emergedLessicoWords = Array.isArray(panel.emergedWords) ? panel.emergedWords : []
  const referenceLessicoWords = lessicoWords.filter((word) => !word.isEmerged)
  const showSubnav = isCostellazione && !activeSubId
  const showProfileReading = isCostellazione && profileInfo && !isSub

  return (
    <aside
      className={`galassia-view__crt${isCompact ? ' galassia-view__crt--compact' : ''}`}
      aria-label={GALASSIA_UI.monitorAria}
    >
      <div className="galassia-view__crt-bezel" style={{ '--panel-color': panel.colore || '#4ade80' }}>
        <div className="galassia-view__crt-head">
          <p className="galassia-view__crt-kicker">
            {isIdle
              ? panel.idleKicker || GALASSIA_CRT.kickerIdle
              : isCostellazione
                ? GALASSIA_CRT.kickerCostellazione
                : isPreview
                  ? GALASSIA_CRT.kickerPreview
                  : GALASSIA_CRT.kickerViewing}
          </p>
          {(panel.headBadge || panel.pct != null) && (
            <span className="galassia-view__crt-head-pct">
              {panel.headBadge || `${panel.pct}%`}
            </span>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={panel.id || panel.kind}
            className={`galassia-view__crt-screen${isCompact ? ' galassia-view__crt-screen--compact' : ''}`}
            role="region"
            aria-live="polite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {isIdle ? (
              <>
                {panel.dominantChip ? (
                  <button
                    type="button"
                    className="galassia-view__dominant-chip"
                    style={{ '--chip-color': panel.dominantChip.colore }}
                    onClick={() => onSelectDominant?.(panel.dominantChip.id)}
                  >
                    <span className="galassia-view__dominant-chip-dot" aria-hidden />
                    <span className="galassia-view__dominant-chip-copy">
                      <span className="galassia-view__dominant-chip-label">
                        {panel.dominantChipLabel || GALASSIA_UI.idleDominantLabel}
                      </span>
                      <strong>{panel.dominantChip.nome}</strong>
                    </span>
                    <span className="galassia-view__dominant-chip-pct">{panel.dominantChip.pct}%</span>
                  </button>
                ) : (
                  <h2 className="galassia-view__crt-title">
                    <span className="galassia-view__crt-title-dot" aria-hidden />
                    <span>{panel.nome}</span>
                  </h2>
                )}
                {Array.isArray(panel.dimensioni) && panel.dimensioni.length > 0 ? (
                  <PortatoTriadSpectrum dimensioni={panel.dimensioni} compact />
                ) : null}
                {panel.hint && !panel.intro && (
                  <p className="galassia-view__crt-mode-desc">{panel.hint}</p>
                )}
                {panel.intro && (
                  <p className="galassia-view__crt-intro">{panel.intro}</p>
                )}
                {panel.descrizione ? (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--portato">
                    {shortText(panel.descrizione, 320)}
                  </p>
                ) : null}
                {panel.vitalita ? (
                  <p className="galassia-view__crt-meta galassia-view__crt-meta--vitalita">
                    <span className="galassia-view__crt-preview-label">
                      {GALASSIA_PORTATO_UI.vitalitaLabel}:
                    </span>{' '}
                    {panel.vitalita}
                  </p>
                ) : null}
                {Array.isArray(panel.introPoints) && panel.introPoints.length > 0 ? (
                  <ul className="galassia-view__rapporti-orientation galassia-view__rapporti-orientation--portato">
                    {panel.introPoints.map((card) => (
                      <li key={card.id}>
                        <strong>{card.label}</strong>
                        <span>
                          {[card.areas, card.metaphor].filter(Boolean).join(' · ')}
                        </span>
                        <em>{card.meaning}</em>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {panel.scaleNote && (
                  <p className="galassia-view__crt-scale-note">{panel.scaleNote}</p>
                )}
                {Array.isArray(panel.deepReading) && panel.deepReading.length > 0 ? (
                  <div className="galassia-view__crt-deep-reading">
                    <p className="galassia-view__crt-deep-kicker">Lettura del profilo</p>
                    {panel.deepReading.map((line) => (
                      <p key={line} className="galassia-view__crt-deep-line">{line}</p>
                    ))}
                  </div>
                ) : null}
                {panel.tapHint && (
                  <p className="galassia-view__crt-hint galassia-view__crt-hint--compact">{panel.tapHint}</p>
                )}
              </>
            ) : isPreview ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                {panel.famiglia && (
                  <p className="galassia-view__crt-meta">
                    {`${GALASSIA_CRT.famigliaLabel}: ${panel.famiglia}`}
                  </p>
                )}
                {panel.previewLead && (
                  <p className="galassia-view__crt-preview-lead">{panel.previewLead}</p>
                )}
                {panel.cosaIndica && (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--preview">
                    <span className="galassia-view__crt-preview-label">
                      {GALASSIA_CRT.cosaIndicaLabel}:
                    </span>{' '}
                    {panel.cosaIndica}
                  </p>
                )}
                {Array.isArray(panel.previewTraits) && panel.previewTraits.length > 0 && (
                  <p className="galassia-view__crt-meta galassia-view__crt-meta--traits">
                    {panel.previewTraits.join(' · ')}
                  </p>
                )}
                <p className="galassia-view__crt-hint galassia-view__crt-hint--compact">
                  {GALASSIA_CRT.previewHint}
                </p>
              </>
            ) : panel.kind === 'rapporto' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                {panel.composizione && panel.id !== 'agire' && (
                  <p className="galassia-view__crt-meta">{panel.composizione}</p>
                )}
                {panel.definizione && (
                  <p className="galassia-view__crt-indica">{panel.definizione}</p>
                )}
                {panel.cosaIndica && (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--preview">
                    <span className="galassia-view__crt-preview-label">
                      {GALASSIA_CRT.cosaIndicaLabel}:
                    </span>{' '}
                    {panel.cosaIndica}
                  </p>
                )}
                {panel.correntePrincipale?.nome && (
                  <p className="galassia-view__crt-meta">
                    {GALASSIA_RAPPORTI_UI.dominantLabel}: {panel.correntePrincipale.nome}
                    {panel.livello != null ? ` · ${panel.livello}/7` : ''}
                  </p>
                )}
                <p className="galassia-view__crt-hint galassia-view__crt-hint--compact">
                  {GALASSIA_RAPPORTI_UI.constellationHint}
                </p>
              </>
            ) : panel.kind === 'rapporto-radar' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                <p className="galassia-view__crt-meta">
                  Livello nel radar · {panel.livello != null ? `${panel.livello}/7` : panel.headBadge || '—'}
                </p>
                {panel.definizione && (
                  <p className="galassia-view__crt-indica">{panel.definizione}</p>
                )}
              </>
            ) : panel.kind === 'portato' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                {panel.isPrevalente ? (
                  <p className="galassia-view__crt-meta">{GALASSIA_PORTATO_UI.prevalenteLabel}</p>
                ) : null}
                <p className="galassia-view__crt-meta">
                  Quota {panel.pct}% · Punteggio {panel.valore ?? '—'}
                </p>
                <MiniBar value={panel.pct} color={panel.colore} />
                {panel.cardAreas ? (
                  <p className="galassia-view__crt-meta galassia-view__crt-meta--traits">
                    {panel.cardAreas}
                    {panel.cardMetaphor ? ` · ${panel.cardMetaphor}` : ''}
                  </p>
                ) : null}
                {panel.definizione ? (
                  <p className="galassia-view__crt-indica">{panel.definizione}</p>
                ) : null}
                {panel.cosaIndica ? (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--preview">
                    <span className="galassia-view__crt-preview-label">
                      {GALASSIA_PORTATO_UI.cosaIndicaLabel}:
                    </span>{' '}
                    {panel.cosaIndica}
                  </p>
                ) : null}
                {panel.isPrevalente && panel.descrizioneCompleta ? (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--portato">
                    {shortText(panel.descrizioneCompleta, 360)}
                  </p>
                ) : null}
              </>
            ) : panel.kind === 'parole-famiglia' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                {panel.definizione && (
                  <p className="galassia-view__crt-indica">
                    {shortText(panel.definizione, 220)}
                  </p>
                )}
                {Array.isArray(panel.stats) && panel.stats.length > 0 ? (
                  <dl className="galassia-view__lexicon-stats" aria-label="Dati del lessico">
                    {panel.stats.map((stat) => (
                      <div key={stat.label}>
                        <dt>{stat.label}</dt>
                        <dd>{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {emergedLessicoWords.length > 0 ? (
                  <section className="galassia-view__lexicon-block">
                    <h3>Parole emerse dal test</h3>
                    <div className="galassia-view__lexicon-cloud">
                      {emergedLessicoWords.slice(0, lessicoWordsLimit).map((word) => (
                        <span
                          key={word.id}
                          className="galassia-view__lexicon-chip galassia-view__lexicon-chip--emerged"
                        >
                          {word.nome}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : (
                  <p className="galassia-view__lexicon-note">
                    Nessuna parola di questa famiglia è stata scelta direttamente nelle risposte.
                  </p>
                )}
                {Array.isArray(panel.sottoCorrenti) && panel.sottoCorrenti.length > 0 ? (
                  <section className="galassia-view__lexicon-block galassia-view__lexicon-block--subs">
                    <h3>Sfumature interne</h3>
                    <div className="galassia-view__lexicon-subgrid">
                      {panel.sottoCorrenti.slice(0, 6).map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className="galassia-view__lexicon-subcard"
                          style={{ '--sub-color': sub.colore || panel.colore }}
                          onClick={() => onSelectSub?.(sub.id)}
                        >
                          <span>
                            <strong>{subDisplayName(sub.nome)}</strong>
                            <em>{sub.wordCount || sub.words?.length || 0} parole</em>
                          </span>
                          {sub.descrizione ? <small>{shortText(sub.descrizione, 80)}</small> : null}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}
                {referenceLessicoWords.length > 0 ? (
                  <section className="galassia-view__lexicon-block">
                    <h3>Lessico di riferimento</h3>
                    <div className="galassia-view__lexicon-cloud">
                      {referenceLessicoWords.slice(0, lessicoWordsLimit).map((word) => (
                        <span
                          key={word.id}
                          className="galassia-view__lexicon-chip"
                        >
                          {word.nome}
                        </span>
                      ))}
                    </div>
                    {referenceLessicoWords.length > lessicoWordsLimit ? (
                      <p className="galassia-view__lexicon-note">
                        +{referenceLessicoWords.length - lessicoWordsLimit} parole nel dizionario completo.
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </>
            ) : panel.kind === 'lessico-sottocorrente' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                <p className="galassia-view__crt-meta">
                  {[panel.parentNome, panel.coloreTST].filter(Boolean).join(' · ')}
                </p>
                {panel.definizione && (
                  <p className="galassia-view__crt-indica">
                    {shortText(panel.definizione, 320)}
                  </p>
                )}
                {emergedLessicoWords.length > 0 ? (
                  <section className="galassia-view__lexicon-block">
                    <h3>Parole emerse dal test</h3>
                    <div className="galassia-view__lexicon-cloud">
                      {emergedLessicoWords.slice(0, lessicoWordsLimit).map((word) => (
                        <span
                          key={word.id}
                          className="galassia-view__lexicon-chip galassia-view__lexicon-chip--emerged"
                        >
                          {word.nome}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}
                {referenceLessicoWords.length > 0 ? (
                  <section className="galassia-view__lexicon-block">
                    <h3>Lessico della sottodisposizione</h3>
                    <div className="galassia-view__lexicon-cloud">
                      {referenceLessicoWords.slice(0, lessicoWordsLimit).map((word) => (
                        <span
                          key={word.id}
                          className="galassia-view__lexicon-chip"
                        >
                          {word.nome}
                        </span>
                      ))}
                    </div>
                    {referenceLessicoWords.length > lessicoWordsLimit ? (
                      <p className="galassia-view__lexicon-note">
                        +{referenceLessicoWords.length - lessicoWordsLimit} parole nel dizionario completo.
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </>
            ) : panel.kind === 'parola' ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>
                {panel.definizione && (
                  <p className="galassia-view__crt-indica">{panel.definizione}</p>
                )}
              </>
            ) : showProfileReading ? (
              <>
                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>

                <div className="galassia-view__profile-metrics">
                  <div>
                    <strong>{profileInfo.pct}%</strong>
                    <span>Peso</span>
                  </div>
                  <div>
                    <strong>{profileInfo.rank}</strong>
                    <span>{profileInfo.ruolo}</span>
                  </div>
                  <div>
                    <strong>{profileInfo.intensita}</strong>
                    <span>Intensità</span>
                  </div>
                </div>

                {profileInfo.subs.length > 0 && (
                  <section className="galassia-view__profile-block">
                    <h3>Sottocorrenti</h3>
                    <ul className="galassia-view__profile-sublist">
                      {profileInfo.subs.slice(0, 4).map((sub) => (
                        <li key={sub.id}>
                          <span>
                            <b>{subDisplayName(sub.nome)}</b>
                            <em>{sub.pct}%</em>
                          </span>
                          <MiniBar value={sub.pct} color={sub.colore || panel.colore} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(profileInfo.dominantStates.length > 0 || profileInfo.quieterStates.length > 0) && (
                  <section className="galassia-view__profile-block galassia-view__profile-block--states">
                    <h3>Stati d&apos;animo</h3>
                    {profileInfo.dominantStates.length > 0 && (
                      <div className="galassia-view__state-row">
                        <span>Presenti</span>
                        <p>{profileInfo.dominantStates.join(' · ')}</p>
                      </div>
                    )}
                    {profileInfo.quieterStates.length > 0 && (
                      <div className="galassia-view__state-row">
                        <span>Meno presenti</span>
                        <p>{profileInfo.quieterStates.join(' · ')}</p>
                      </div>
                    )}
                  </section>
                )}
              </>
            ) : (
              <>
                {isSub && selected && (
                  <button
                    type="button"
                    className="galassia-view__crt-breadcrumb"
                    onClick={onBackToParent}
                  >
                    {GALASSIA_UI.backToParent(selected.nome)}
                  </button>
                )}

                <h2 className="galassia-view__crt-title">
                  <span
                    className="galassia-view__crt-title-dot"
                    style={{ backgroundColor: panel.colore, color: panel.colore }}
                    aria-hidden
                  />
                  <span>{panel.nome}</span>
                </h2>

                {panel.hierarchy && (
                  <p className="galassia-view__crt-meta">{panel.hierarchy}</p>
                )}

                {!isSub && (panel.famiglia || panel.polarita) && (
                  <p className="galassia-view__crt-meta">
                    {[
                      panel.famiglia ? `${GALASSIA_CRT.famigliaLabel}: ${panel.famiglia}` : '',
                      panel.polarita ? `${GALASSIA_CRT.polaritaLabel}: ${panel.polarita}` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                {meaning && (
                  <div className="galassia-view__simple-block">
                    <strong>{isSub ? GALASSIA_CRT.significatoLabel : GALASSIA_CRT.sintesiLabel}</strong>
                    <p>{meaning}</p>
                  </div>
                )}

                {!isSub && panel.cosaIndica && panel.cosaIndica !== meaning && (
                  <div className="galassia-view__simple-block">
                    <strong>{GALASSIA_CRT.cosaIndicaLabel}</strong>
                    <p>{shortText(panel.cosaIndica, 140)}</p>
                  </div>
                )}

                {showSubnav && selected && !isSub && panel.sottoCount > 0 && (
                  <p className="galassia-view__crt-indica galassia-view__crt-indica--compact">
                    {GALASSIA_CRT.costellazioneHint(panel.sottoCount)}
                  </p>
                )}

                {showSubnav && Array.isArray(panel.subsOverview) && panel.subsOverview.length > 0 && (
                  <nav className="galassia-view__subnav" aria-label={GALASSIA_CRT.costellazioneSectionTitle}>
                    <p>{GALASSIA_CRT.costellazioneSectionTitle}</p>
                    <div>
                      {panel.subsOverview.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className={`galassia-view__subnav-card${sub.id === activeSubId ? ' galassia-view__subnav-card--active' : ''}`}
                          style={{ '--sub-color': sub.colore || panel.colore }}
                          onClick={() => onSelectSub?.(sub.id)}
                          aria-pressed={sub.id === activeSubId}
                        >
                          <span className="galassia-view__subnav-card-head">
                            <strong>{subDisplayName(sub.nome)}</strong>
                            <em>{sub.pct}%</em>
                          </span>
                          {sub.statiDanimo.length > 0 && (
                            <span className="galassia-view__subnav-card-words">
                              {sub.statiDanimo.slice(0, 4).join(' · ')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </nav>
                )}

                {parole.length > 0 && (
                  <>
                    <p className="galassia-view__crt-meta">{GALASSIA_CRT.paroleLabel}</p>
                    <div className="galassia-view__crt-tags">
                      {parole.slice(0, paroleLimit).map((stato) => (
                        <span key={stato} className="galassia-view__crt-tag">
                          {stato}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {isSub && !meaning && parole.length === 0 && !panel.hierarchy && (panel.pct === 0 || !panel.pct) && (
                  <p className="galassia-view__crt-absent">
                    Questa sfumatura non è emersa nel profilo di questo test.
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  )
}

function GalassiaMobileAlternativeView({
  mapMode,
  mapNodes,
}) {
  const [openNodeId, setOpenNodeId] = useState(null)
  const [openSubId, setOpenSubId] = useState(null)

  const toggleNode = (nodeId) => {
    setOpenNodeId((prev) => (prev === nodeId ? null : nodeId))
    setOpenSubId(null)
  }

  const toggleSub = (subId) => {
    setOpenSubId((prev) => (prev === subId ? null : subId))
  }

  const formatWeight = (node) => {
    if (mapMode === 'disposizioni') return `Presenza: ${Math.round(pesoToPct(node.peso))}%`
    if (mapMode === 'rapporti') return `Dominanza: ${node.peso}/7`
    if (mapMode === 'portato') return `Presenza: ${Math.round(node.peso)}%`
    if (mapMode === 'parole') return `${node.words?.length || 0} parole`
    return ''
  }

  return (
    <div className="galassia-mobile-alternative">
      <div className="galassia-mobile-intro">
        <p className="galassia-mobile-hint">
          {mapMode === 'disposizioni' && 'Mappa delle 5 disposizioni emotive. Tocca una card per vederne sfumature e relazioni.'}
          {mapMode === 'rapporti' && 'I quattro rapporti indicano la dominanza di ciascun temperamento nelle diverse lenti.'}
          {mapMode === 'portato' && 'Il portato esperienziale indica come hai orientato l\'ascolto nel test.'}
          {mapMode === 'parole' && 'Il lessico emotivo TST associato a ciascuna famiglia emotiva.'}
        </p>
      </div>

      <div className="galassia-mobile-list">
        {mapNodes.map((node) => {
          const isOpen = openNodeId === node.id
          const hasSottoCorrenti = Array.isArray(node.sottoCorrenti) && node.sottoCorrenti.length > 0
          const weightLabel = formatWeight(node)

          return (
            <div
              key={node.id}
              className={`galassia-mobile-node-card${isOpen ? ' is-open' : ''}`}
              style={{ '--node-border-color': node.colore }}
            >
              <button
                type="button"
                className="galassia-mobile-node-trigger"
                onClick={() => toggleNode(node.id)}
              >
                <div className="galassia-mobile-node-header-left">
                  <span className="galassia-mobile-node-dot" style={{ backgroundColor: node.colore }} />
                  <span className="galassia-mobile-node-name">{node.nome}</span>
                </div>
                <div className="galassia-mobile-node-header-right">
                  <span className="galassia-mobile-node-weight">{weightLabel}</span>
                  <span className="galassia-mobile-node-chevron">{isOpen ? '−' : '+'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="galassia-mobile-node-content">
                  {node.raw?.descrizioneCompleta && (
                    <p className="galassia-mobile-node-desc">{node.raw.descrizioneCompleta}</p>
                  )}
                  {node.raw?.cosaIndica && (
                    <div className="galassia-mobile-node-meaning-box">
                      <strong className="galassia-mobile-box-title">Nel modello TST:</strong>
                      <p className="galassia-mobile-box-text">{node.raw.cosaIndica}</p>
                    </div>
                  )}
                  {node.raw?.lettura && (
                    <p className="galassia-mobile-node-desc">{node.raw.lettura}</p>
                  )}

                  {hasSottoCorrenti && (
                    <div className="galassia-mobile-subcurrents-section">
                      <p className="galassia-mobile-section-heading">
                        {mapMode === 'rapporti' ? 'Famiglie componenti' : 'Sfumature interne'}
                      </p>
                      <div className="galassia-mobile-subcurrents-grid">
                        {node.sottoCorrenti.map((sub) => {
                          const isSubOpen = openSubId === sub.id
                          return (
                            <div
                              key={sub.id}
                              className={`galassia-mobile-sub-item${isSubOpen ? ' is-open' : ''}`}
                            >
                              <button
                                type="button"
                                className="galassia-mobile-sub-trigger"
                                onClick={() => toggleSub(sub.id)}
                              >
                                <span className="galassia-mobile-sub-name">{subDisplayName(sub.nome)}</span>
                                <span className="galassia-mobile-sub-val">
                                  {sub.livello ? `Livello ${sub.livello}/7` : sub.peso ? `${Math.round(pesoToPct(sub.peso))}%` : ''}
                                </span>
                              </button>
                              {isSubOpen && (
                                <div className="galassia-mobile-sub-details">
                                  {sub.statiDanimo && sub.statiDanimo.length > 0 && (
                                    <p className="galassia-mobile-sub-words">
                                      <strong>Stati d'animo:</strong> {sub.statiDanimo.join(', ')}
                                    </p>
                                  )}
                                  {sub.words && sub.words.length > 0 && (
                                    <p className="galassia-mobile-sub-words">
                                      <strong>Parole dizionario:</strong> {sub.words.map((w) => w.nome).join(', ')}
                                    </p>
                                  )}
                                  {sub.descrizione && (
                                    <p className="galassia-mobile-sub-desc">{sub.descrizione}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {mapMode === 'parole' && node.words && node.words.length > 0 && (
                    <div className="galassia-mobile-words-section">
                      <p className="galassia-mobile-section-heading">Termini associati</p>
                      <div className="galassia-mobile-words-cloud">
                        {node.words.map((word) => (
                          <span
                            key={word.id}
                            className={`galassia-mobile-word-chip${word.isEmerged ? ' is-emerged' : ''}`}
                            style={{ '--word-color': node.colore }}
                          >
                            {word.nome}
                            {word.isEmerged ? ' *' : ''}
                          </span>
                        ))}
                      </div>
                      <p className="galassia-mobile-words-note">* Parole emerse (scelte da te nel test)</p>
                    </div>
                  )}

                  {mapMode === 'disposizioni' && node.raw?.activePartners && (
                    <div className="galassia-mobile-relations-section">
                      <p className="galassia-mobile-section-heading">Relazioni con altre disposizioni</p>
                      <ul className="galassia-mobile-relations-list">
                        {node.raw.activePartners.map((partner) => (
                          <li key={partner.id} className="galassia-mobile-relation-row">
                            <span className="galassia-mobile-relation-partner" style={{ color: partner.colore || '#fff' }}>
                              {partner.nome}
                            </span>
                            <span className="galassia-mobile-relation-text">
                              {partner.type === 'dialogue' && 'entra in dialogo costruttivo'}
                              {partner.type === 'opposition' && 'si contrappone o compensa'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DEEP_READ_FAMILY_META = {
  blu: { shortName: 'Malinconica', relationalKey: 'malinconico', essence: 'memoria, profondita e ricerca di senso' },
  rosso: { shortName: 'Marziale', relationalKey: 'assertivo', essence: 'direzione, decisione e presenza nel fare' },
  verde: { shortName: 'Flemmatica', relationalKey: 'flemmatico', essence: 'calma, continuita e capacita di depositare' },
  giallo: { shortName: 'Entusiasta', relationalKey: 'entusiasta', essence: 'slancio, apertura e movimento creativo' },
  grigio: { shortName: 'Razionale', relationalKey: 'anaffettivo', essence: 'distanza osservativa, lucidita e separazione' },
}

const DEEP_READ_RELATION_KEYS = {
  malinconico: 'ma', flemmatico: 'fl', entusiasta: 'en', assertivo: 'as', anaffettivo: 'an',
}

function getDeepReadMeta(item) {
  return DEEP_READ_FAMILY_META[item?.familyKey] || {
    shortName: item?.nome || 'Corrente',
    relationalKey: '',
    essence: item?.descrizione || '',
  }
}

function getDeepReadRole(item, dominantPeso) {
  const peso = Number(item?.peso) || 0
  const ratio = dominantPeso > 0 ? peso / dominantPeso : 0
  if (ratio >= 0.72) return 'alleanza'
  if (ratio >= 0.42) return 'compensazione'
  if (ratio >= 0.18) return 'tensione leggera'
  return 'sullo sfondo'
}

function buildGalassiaDeepReading(rankedData) {
  if (!rankedData || rankedData.length === 0) return []
  const dominant = rankedData[0]
  const secondaries = rankedData.slice(1)
  const dominantMeta = getDeepReadMeta(dominant)
  const dominantPeso = Number(dominant?.peso) || 0

  const corpus = getRelationalCorpusForDominant(dominantMeta.shortName, dominant?.familyKey)
  const relations = corpus.available && Array.isArray(corpus.relations) ? corpus.relations : []

  const cards = secondaries.map((s) => {
    const meta = getDeepReadMeta(s)
    const targetKey = DEEP_READ_RELATION_KEYS[meta.relationalKey]
    const relation = relations.find((r) => r.key === targetKey) || null
    const keywords = String(relation?.sub || '').split('·').map((k) => k.trim()).filter(Boolean).slice(0, 5)
    const role = getDeepReadRole(s, dominantPeso)
    return { secondary: s, secondaryName: meta.shortName, role, keywords }
  })

  const [second, third] = cards
  const low = [...cards].reverse().find((c) => c.role === 'sullo sfondo')

  if (!second) {
    return [
      `Nel tuo caso la corrente ${dominantMeta.shortName} appare come il principale punto di organizzazione: il profilo tende a leggere le esperienze attraverso ${dominantMeta.essence}.`,
      'Le altre correnti restano meno definite: questo rende la lettura piu centrata, ma anche piu sensibile ai momenti in cui una parte secondaria prova a farsi spazio.',
    ]
  }

  const secondMeta = getDeepReadMeta(second.secondary)
  const lines = [
    `Nel tuo caso la corrente ${dominantMeta.shortName} non si presenta da sola: viene modificata soprattutto dalla parte ${second.secondaryName}. Questo significa che ${dominantMeta.essence} prende un colore piu vicino a ${secondMeta.essence}.`,
  ]

  if (second.keywords.length > 0) {
    lines.push(`La qualita emergente e fatta di ${second.keywords.join(', ')}: non come etichetta fissa, ma come modo interno di tenere insieme due spinte diverse.`)
  }

  if (third && getDeepReadRole(third.secondary, dominantPeso) !== 'sullo sfondo') {
    const thirdMeta = getDeepReadMeta(third.secondary)
    lines.push(`Anche la parte ${third.secondaryName} partecipa alla scena: non sposta il centro, ma aggiunge una seconda modulazione. Dove ${second.secondaryName} porta la modifica piu visibile, ${third.secondaryName} introduce ${thirdMeta.essence}.`)
  }

  if (low) {
    const lowKeywords = low.keywords.slice(0, 3)
    const suffix = lowKeywords.length > 0 ? `, come ${lowKeywords.join(', ')},` : ''
    lines.push(`La corrente ${low.secondaryName} sembra piu lontana dal centro. Questo puo indicare che le sue qualita${suffix} non sono il primo linguaggio del profilo: possono emergere in modo selettivo, oppure restare come area da integrare con delicatezza.`)
  }

  return lines
}

/**
 * CelestialPlanetSphere: Rappresentazione 3D volumetrica realistica dei corpi celesti delle Disposizioni
 * - Gradiente sferico volumetrico e riflesso speculare ad alto angolo
 * - Terminatore ombra giorno/notte curvo con luce radente
 * - Corona e scattering di Rayleigh atmosferico
 * - Anello di accrescimento 3D inclinato prospettico
 * - Fluttuazione organica a gravità zero (onde armoniche differenziate)
 */
function CelestialPlanetSphere({
  id,
  color,
  size,
  isHovered,
  isSelected,
  isDominant,
  floatIndex = 0,
}) {
  const baseSize = Math.max(34, size)
  const ringWidth = Math.round(baseSize * 2.25)
  const ringHeight = Math.round(baseSize * 0.74)
  const familyKey = FAMILY_KEY_BY_DISPOSITION[id] || (typeof id === 'string' ? id.toLowerCase() : 'blu')

  return (
    <div
      className={`celestial-sphere celestial-sphere--${familyKey} celestial-sphere--float-${floatIndex % 5}${isHovered ? ' is-hovered' : ''}${isSelected ? ' is-selected' : ''}${isDominant ? ' is-dominant' : ''}`}
      style={{
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        '--planet-color': color,
        '--planet-size': `${baseSize}px`,
      }}
      aria-hidden="true"
    >
      {/* Corona e alone gravitazionale atmosferico */}
      <div className="celestial-sphere__corona" />

      {/* Onde di compressione gravitazionale all'hover / selezione / dominante */}
      {(isSelected || isDominant || isHovered) && (
        <div className="celestial-sphere__pulse-wave" />
      )}

      {/* Anello di accrescimento 3D inclinato (polveri cosmiche) */}
      <div
        className="celestial-sphere__ring-system"
        style={{ width: `${ringWidth}px`, height: `${ringHeight}px` }}
      >
        <div className="celestial-sphere__ring-disc" />
      </div>

      {/* Globo volumetrico con maschera sferica */}
      <div className="celestial-sphere__globe">
        {/* Fasce atmosferiche / nubi procedurali in deriva orizzontale lenta */}
        <div className="celestial-sphere__surface" />

        {/* Terminatore d'ombra curvo 3D (emisfero oscuro) */}
        <div className="celestial-sphere__terminator" />

        {/* Riflesso speculare ad alto angolo (illuminazione solare) */}
        <div className="celestial-sphere__specular" />

        {/* Bordo atmosferico / Scattering di Fresnel limb */}
        <div className="celestial-sphere__limb" />
      </div>

      {/* Segnale di orientamento della Disposizione Prevalente */}
      {isDominant && (
        <div className="celestial-sphere__beacon" title="Disposizione Prevalente">
          <span className="celestial-sphere__beacon-core" />
          <span className="celestial-sphere__beacon-ring" />
        </div>
      )}
    </div>
  )
}

export default function GalassiaView({
  correntData,
  paroleEmerse = [],
  lessicoCorrenti = [],
  famiglieLessico = {},
  rapporti = [],
  portato = {},
  lessicoAnalitico = null,
}) {
  const data = useMemo(
    () => (Array.isArray(correntData) && correntData.length ? correntData : EXAMPLE_CORRENT_DATA),
    [correntData],
  )
  const rankedData = useMemo(
    () => [...data].sort((a, b) => pesoToPct(b.peso) - pesoToPct(a.peso)),
    [data],
  )

  const deepReading = useMemo(() => buildGalassiaDeepReading(rankedData), [rankedData])

  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const containerRef = useRef(null)
  const mapLayerRef = useRef(null)
  const mapViewportRef = useRef(null)
  const mapCanvasRef = useRef(null)
  const cameraRef = useRef(CAMERA_RESET)
  const pointersRef = useRef(new Map())
  const pinchGestureRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const { w, h } = useElementSize(containerRef)
  const { w: mapW, h: mapH } = useElementSize(mapViewportRef)

  const [mapMode, setMapMode] = useState('disposizioni')
  const [selectedId, setSelectedId] = useState(null)
  const [activeSubId, setActiveSubId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [hoveredSubId, setHoveredSubId] = useState(null)
  const [hoveredCore, setHoveredCore] = useState(false)
  const [camera, setCamera] = useState(CAMERA_RESET)
  const [cameraAnimating, setCameraAnimating] = useState(false)
  const [showGuideDeck, setShowGuideDeck] = useState(false)
  const [showTutorial, setShowTutorial] = useState(() => shouldShowGalassiaTutorial())
  const cameraAnimTimerRef = useRef(null)

  const dismissOpeningGuide = useCallback(() => {
    setShowGuideDeck(false)
  }, [])

  const closeGuidePermanently = useCallback(() => {
    setShowGuideDeck(false)
    markGalassiaOpeningGuideSeen()
  }, [])

  const mapNodes = useMemo(
    () => buildMapNodes({
      mode: mapMode,
      data,
      rapporti,
      portato,
      paroleEmerse,
      lessicoCorrenti,
      famiglieLessico,
    }),
    [mapMode, data, rapporti, portato, paroleEmerse, lessicoCorrenti, famiglieLessico],
  )

  const effectiveSelectedId = useMemo(() => {
    if (!selectedId) return null
    return mapNodes.some((node) => node.id === selectedId) ? selectedId : null
  }, [selectedId, mapNodes])

  const selectedNode = useMemo(
    () => mapNodes.find((node) => node.id === effectiveSelectedId) || null,
    [mapNodes, effectiveSelectedId],
  )

  const selected = useMemo(() => {
    if (mapMode === 'disposizioni') {
      return data.find((c) => c.id === effectiveSelectedId) || null
    }
    return selectedNode
  }, [mapMode, data, effectiveSelectedId, selectedNode])

  const isZoomedView = Boolean(
    effectiveSelectedId && selectedNode && mapModeSupportsZoom(mapMode),
  )
  const guideDeckOpen = showGuideDeck && !isZoomedView && !showTutorial

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false)
  }, [])

  useEffect(() => {
    if (!showGuideDeck || showTutorial) return undefined
    const timer = window.setTimeout(() => {
      dismissOpeningGuide()
    }, 12000)
    return () => window.clearTimeout(timer)
  }, [showGuideDeck, showTutorial, dismissOpeningGuide])

  const activeSub = useMemo(() => {
    if (!selectedNode) return null
    const subs = Array.isArray(selectedNode.sottoCorrenti) ? selectedNode.sottoCorrenti : []
    return subs.find((sub) => sub.id === activeSubId) || null
  }, [selectedNode, activeSubId])
  const selectedProfileInfo = useMemo(
    () =>
      mapMode === 'disposizioni' && selected
        ? buildProfileInfo({
            corrente: selected,
            rankedData,
            paroleEmerse,
            rapporti,
          })
        : null,
    [mapMode, selected, rankedData, paroleEmerse, rapporti],
  )
  const overviewRelations = useMemo(
    () => buildDispositionRelations(rankedData, 4),
    [rankedData],
  )

  const viewportBase = Math.max(1, Math.min(w || 0, h || 0))
  const zoomSubCount = useMemo(() => {
    if (!selectedNode) return 1
    return Math.max(1, selectedNode.sottoCorrenti?.length ?? 1)
  }, [selectedNode])
  const zoomLayout = useMemo(
    () =>
      computeGalassiaZoomLayout({
        mapW,
        mapH,
        viewportBase,
        isMobile,
        isZoomed: isZoomedView,
        subCount: zoomSubCount,
      }),
    [mapW, mapH, viewportBase, isMobile, isZoomedView, zoomSubCount],
  )
  const {
    base,
    focusCenter,
    selectedScale,
    orbitRadius,
    constellationPadding,
    planetSizeFactor,
    planetSizeK,
    safeBounds,
  } = zoomLayout

  const activePanelNode = useMemo(
    () => selectedNode || mapNodes.find((node) => node.id === effectiveSelectedId) || null,
    [selectedNode, mapNodes, effectiveSelectedId],
  )

  const panelContent = useMemo(() => {
    if (mapMode !== 'disposizioni') {
      if (!activePanelNode && hoveredId) {
        const hoveredNode = mapNodes.find((node) => node.id === hoveredId)
        if (hoveredNode) {
          return buildModePanelContent(mapMode, hoveredNode)
        }
      }
      if (activeSub && activePanelNode) {
        return buildModePanelContent(mapMode, activePanelNode, activeSub)
      }
      if (activePanelNode) {
        return buildModePanelContent(mapMode, activePanelNode)
      }
      return buildModeIdlePanel(mapMode, { dominant: rankedData[0], portato, deepReading })
    }

    return resolveGalassiaPanelContent({
      correntData: data,
      selected: selected && mapMode === 'disposizioni' ? selected : null,
      activeSub: mapMode === 'disposizioni' ? activeSub : null,
      hoveredPlanetId: selected ? null : hoveredId,
      hoveredSubId: selected ? hoveredSubId : null,
    })
  }, [
    mapMode,
    mapNodes,
    data,
    selected,
    activePanelNode,
    activeSub,
    hoveredId,
    hoveredSubId,
    rankedData,
    portato,
    deepReading,
  ])

  const isPanelIdle = panelContent?.kind === 'idle' && !isZoomedView

  const focusColor = useMemo(() => {
    if (hoveredSubId && selected) {
      const sub = selected.sottoCorrenti?.find((s) => s.id === hoveredSubId)
      if (sub?.colore) return sub.colore
    }
    if (hoveredId) {
      const c = data.find((item) => item.id === hoveredId)
      if (c?.colore) return c.colore
    }
    if (activeSub?.colore) return activeSub.colore
    if (selected?.colore) return selected.colore
    return panelContent?.colore || '#1e293b'
  }, [hoveredSubId, selected, hoveredId, activeSub, data, panelContent])

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(
    () => () => {
      if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
    },
    [],
  )

  const beginCameraAnimation = useCallback(() => {
    if (reducedMotion) return
    setCameraAnimating(true)
    if (cameraAnimTimerRef.current) clearTimeout(cameraAnimTimerRef.current)
    cameraAnimTimerRef.current = setTimeout(() => setCameraAnimating(false), CAMERA_ANIM_MS)
  }, [reducedMotion])

  const wheelSyncTimerRef = useRef(null)

  const updateCanvasTransform = useCallback((cam) => {
    if (mapCanvasRef.current) {
      mapCanvasRef.current.style.transform = `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.scale.toFixed(4)})`
    }
  }, [])

  const applyCamera = useCallback((nextCamera, immediateState = false) => {
    const next = typeof nextCamera === 'function' ? nextCamera(cameraRef.current) : nextCamera
    const clamped = clampCamera(next, mapW, mapH)
    cameraRef.current = clamped
    updateCanvasTransform(clamped)
    if (immediateState) {
      setCamera(clamped)
    }
  }, [mapW, mapH, updateCanvasTransform])

  const resetCamera = useCallback(() => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    cameraRef.current = CAMERA_RESET
    updateCanvasTransform(CAMERA_RESET)
    setCamera(CAMERA_RESET)
  }, [updateCanvasTransform])

  const focusCameraOnPercentage = useCallback((px, py, targetScale = 2.0) => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    if (mapW <= 0 || mapH <= 0) return

    const localX = (px / 100) * mapW - mapW / 2
    const localY = (py / 100) * mapH - mapH / 2

    const targetX = -localX * targetScale
    const targetY = -localY * targetScale

    beginCameraAnimation()
    const clamped = clampCamera({ x: targetX, y: targetY, scale: targetScale }, mapW, mapH)
    cameraRef.current = clamped
    setCamera(clamped)
  }, [mapW, mapH, beginCameraAnimation])

  const selectPlanet = (id) => {
    const node = mapNodes.find((item) => item.id === id)
    const shouldZoom = node && mapModeSupportsZoom(mapMode)
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    if (shouldZoom) {
      beginCameraAnimation()
      cameraRef.current = CAMERA_RESET
      setCamera(CAMERA_RESET)
    }
    setSelectedId(id)
    setActiveSubId(null)
    setHoveredId(null)
    setHoveredSubId(null)
    setHoveredCore(false)
    dismissOpeningGuide()
  }

  const selectFamily = useCallback((id) => {
    setSelectedId((prev) => {
      const nextId = prev === id ? null : id
      if (nextId) {
        const node = mapNodes.find((item) => item.id === nextId)
        const srcId = node?.raw?.sourceId || ''
        const anchor = PAROLE_CLUSTER_ANCHORS[srcId] || node?.anchor || { x: 50, y: 50 }
        focusCameraOnPercentage(anchor.x, anchor.y, 2.0)
      } else {
        resetCamera()
      }
      return nextId
    })
    setActiveSubId(null)
  }, [mapNodes, focusCameraOnPercentage, resetCamera])

  const selectFamilyAndSub = useCallback((familyId, subId) => {
    setSelectedId(familyId)
    setActiveSubId(subId)

    const node = mapNodes.find((item) => item.id === familyId)
    const srcId = node?.raw?.sourceId || ''
    const anchor = PAROLE_CLUSTER_ANCHORS[srcId] || node?.anchor || { x: 50, y: 50 }

    const subs = node?.sottoCorrenti || []
    const si = subs.findIndex((s) => s.id === subId)
    let cx = anchor.x
    let cy = anchor.y
    if (si !== -1) {
      const { dx: sox, dy: soy } = subOrbitOffset(si, subs.length, subs.length <= 1 ? 0 : 4.8)
      cx += sox
      cy += soy
    }

    focusCameraOnPercentage(cx, cy, 2.4)
  }, [mapNodes, focusCameraOnPercentage])

  const switchMapMode = useCallback(
    (nextMode) => {
      if (nextMode === mapMode) return
      pointersRef.current.clear()
      pinchGestureRef.current = null
      mouseDragRef.current = null
      webkitGestureRef.current = null
      cameraRef.current = CAMERA_RESET
      setCamera(CAMERA_RESET)
      setMapMode(nextMode)
      setSelectedId(null)
      setActiveSubId(null)
      setHoveredId(null)
      setHoveredSubId(null)
      setHoveredCore(false)
      dismissOpeningGuide()
    },
    [mapMode, dismissOpeningGuide],
  )

  const selectGuideStar = (parentId, subId) => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    beginCameraAnimation()
    cameraRef.current = CAMERA_RESET
    setCamera(CAMERA_RESET)
    setSelectedId(parentId)
    setActiveSubId(subId)
    setHoveredId(null)
    setHoveredSubId(null)
    setHoveredCore(false)
    dismissOpeningGuide()
  }

  const backToMap = useCallback(() => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    const needsCameraReset =
      isZoomedView || camera.scale !== 1 || camera.x !== 0 || camera.y !== 0

    if (needsCameraReset) {
      beginCameraAnimation()
      cameraRef.current = CAMERA_RESET
      setCamera(CAMERA_RESET)
    }
    const delay = needsCameraReset && !reducedMotion ? 340 : 0
    window.setTimeout(() => {
      setSelectedId(null)
      setActiveSubId(null)
      setHoveredId(null)
      setHoveredSubId(null)
      setHoveredCore(false)
    }, delay)
  }, [beginCameraAnimation, reducedMotion, isZoomedView, camera])

  const beginPinchGesture = () => {
    const layer = mapLayerRef.current
    const viewport = mapCanvasRef.current || layer
    const points = Array.from(pointersRef.current.values())
    if (!layer || !viewport || points.length < 2) {
      pinchGestureRef.current = null
      return
    }

    const [first, second] = points
    pinchGestureRef.current = {
      camera: cameraRef.current,
      distance: Math.max(1, getDistance(first, second)),
      midpoint: getLayerPoint(getMidpoint(first, second), viewport),
    }
  }

  const handleMapWheel = (event) => {
    const layer = mapLayerRef.current
    const viewport = mapCanvasRef.current || layer
    if (!layer) return

    event.preventDefault()
    const origin = getLayerPoint(event, viewport)
    const isPinchZoom = event.ctrlKey || event.metaKey

    if (isPinchZoom) {
      const intensity = event.deltaMode === 1 ? 0.18 : 0.0055
      const nextScale = cameraRef.current.scale * Math.exp(-event.deltaY * intensity)
      applyCamera((prev) => zoomCameraAt(prev, nextScale, origin, mapW, mapH))
      if (wheelSyncTimerRef.current) clearTimeout(wheelSyncTimerRef.current)
      wheelSyncTimerRef.current = setTimeout(() => {
        setCamera(cameraRef.current)
      }, 80)
      return
    }

    const panFactor = cameraRef.current.scale > 1 ? 1 : 0.82
    applyCamera((prev) => ({
      ...prev,
      x: prev.x - event.deltaX * panFactor,
      y: prev.y - event.deltaY * panFactor,
    }))
    if (wheelSyncTimerRef.current) clearTimeout(wheelSyncTimerRef.current)
    wheelSyncTimerRef.current = setTimeout(() => {
      setCamera(cameraRef.current)
    }, 80)
  }

  const handleMapPointerDown = (event) => {
    const target = event.target instanceof Element ? event.target : null
    const isInteractive = Boolean(target?.closest(INTERACTIVE_MAP_SELECTOR))

    // Se l'animazione di camera era attiva, cancellala immediatamente per evitare scatti o lag contro il trascinamento manuale
    if (cameraAnimTimerRef.current) {
      clearTimeout(cameraAnimTimerRef.current)
    }
    setCameraAnimating(false)

    // Capture solo per pan/zoom: su pianeti e costellazione il capture ruba il click al button.
    if (!isInteractive && event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    pointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      clientX: event.clientX,
      clientY: event.clientY,
    })

    if (!effectiveSelectedId && event.pointerType === 'mouse' && event.button === 0) {
      if (!isInteractive) {
        mouseDragRef.current = {
          x: event.clientX,
          y: event.clientY,
          camera: cameraRef.current,
        }
      }
    }

    if (pointersRef.current.size >= 2) {
      beginPinchGesture()
    }
  }

  const handleMapPointerMove = (event) => {
    const stored = pointersRef.current.get(event.pointerId)
    if (!stored) return

    pointersRef.current.set(event.pointerId, {
      ...stored,
      clientX: event.clientX,
      clientY: event.clientY,
    })

    if (pointersRef.current.size >= 2 && pinchGestureRef.current) {
      event.preventDefault()
      const layer = mapLayerRef.current
      const viewport = mapCanvasRef.current || layer
      const points = Array.from(pointersRef.current.values())
      if (!layer || !viewport || points.length < 2) return

      const [first, second] = points
      const gesture = pinchGestureRef.current
      const midpoint = getLayerPoint(getMidpoint(first, second), viewport)
      const distance = Math.max(1, getDistance(first, second))
      const nextScale = gesture.camera.scale * (distance / gesture.distance)
      const scaleRatio = clamp(nextScale, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE) / gesture.camera.scale

      applyCamera({
        x: midpoint.x - (gesture.midpoint.x - gesture.camera.x) * scaleRatio,
        y: midpoint.y - (gesture.midpoint.y - gesture.camera.y) * scaleRatio,
        scale: nextScale,
      })
      return
    }

    if (mouseDragRef.current && event.pointerType === 'mouse') {
      event.preventDefault()
      const drag = mouseDragRef.current
      applyCamera({
        ...drag.camera,
        x: drag.camera.x + event.clientX - drag.x,
        y: drag.camera.y + event.clientY - drag.y,
      })
    }
  }

  const endPointerGesture = (event) => {
    pointersRef.current.delete(event.pointerId)
    pinchGestureRef.current = null
    mouseDragRef.current = null

    if (event.currentTarget.releasePointerCapture && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (pointersRef.current.size >= 2) {
      beginPinchGesture()
    } else {
      setCamera(cameraRef.current)
    }
  }

  useEffect(() => {
    const layer = mapLayerRef.current
    if (!layer) return undefined

    const handleGestureStart = (event) => {
      event.preventDefault()
      const viewport = mapCanvasRef.current || layer
      const rect = viewport.getBoundingClientRect()
      const fallback = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      }
      webkitGestureRef.current = {
        camera: cameraRef.current,
        origin: getLayerPoint(
          {
            clientX: Number.isFinite(event.clientX) ? event.clientX : fallback.clientX,
            clientY: Number.isFinite(event.clientY) ? event.clientY : fallback.clientY,
          },
          viewport,
        ),
      }
    }

    const handleGestureChange = (event) => {
      event.preventDefault()
      const gesture = webkitGestureRef.current
      if (!gesture) return
      const nextScale = gesture.camera.scale * (Number(event.scale) || 1)
      const clamped = zoomCameraAt(gesture.camera, nextScale, gesture.origin, mapW, mapH)
      cameraRef.current = clamped
      updateCanvasTransform(clamped)
    }

    const handleGestureEnd = () => {
      webkitGestureRef.current = null
      setCamera(cameraRef.current)
    }

    layer.addEventListener('gesturestart', handleGestureStart, { passive: false })
    layer.addEventListener('gesturechange', handleGestureChange, { passive: false })
    layer.addEventListener('gestureend', handleGestureEnd)

    return () => {
      layer.removeEventListener('gesturestart', handleGestureStart)
      layer.removeEventListener('gesturechange', handleGestureChange)
      layer.removeEventListener('gestureend', handleGestureEnd)
    }
  }, [mapW, mapH, updateCanvasTransform])

  const zoomCameraByStep = (direction) => {
    const viewport = mapCanvasRef.current || mapLayerRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    const origin = { x: 0, y: 0 }
    const factor = direction > 0 ? CAMERA_ZOOM_STEP : 1 / CAMERA_ZOOM_STEP
    beginCameraAnimation()
    applyCamera(
      (prev) => zoomCameraAt(prev, prev.scale * factor, origin, rect.width, rect.height),
      true,
    )
  }

  const panCameraBy = useCallback((dx, dy) => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    beginCameraAnimation()
    applyCamera(
      (prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }),
      true,
    )
  }, [beginCameraAnimation, applyCamera])

  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current || document.querySelector('.galassia-view') || document.documentElement
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (event.key === 'Escape') {
        if (activeSubId) setActiveSubId(null)
        else if (effectiveSelectedId) backToMap()
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        panCameraBy(0, 160)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        panCameraBy(0, -160)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        panCameraBy(160, 0)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        panCameraBy(-160, 0)
        return
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        const clamped = zoomCameraAt(
          cameraRef.current,
          cameraRef.current.scale * CAMERA_ZOOM_STEP,
          { x: 0, y: 0 },
          mapW,
          mapH,
        )
        cameraRef.current = clamped
        setCamera(clamped)
        return
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        const clamped = zoomCameraAt(
          cameraRef.current,
          cameraRef.current.scale / CAMERA_ZOOM_STEP,
          { x: 0, y: 0 },
          mapW,
          mapH,
        )
        cameraRef.current = clamped
        setCamera(clamped)
        return
      }

      if (event.key === '0') {
        event.preventDefault()
        resetCamera()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [effectiveSelectedId, activeSubId, mapW, mapH, backToMap, panCameraBy, resetCamera])

  const planetLayout = useMemo(() => {
    return mapNodes.map((node, index) => {
      const isSelected = node.id === effectiveSelectedId
      let pos
      const scaleCap =
        mapH > 0 && mapH < 700 ? Math.min(selectedScale, 1.15) : selectedScale
      let scale = isZoomedView ? (isSelected ? scaleCap : 0.58) : effectiveSelectedId === node.id ? 1.08 : 1
      let opacity = isZoomedView ? (isSelected ? 1 : 0.16) : effectiveSelectedId && effectiveSelectedId !== node.id ? 0.72 : 1

      if (isZoomedView && isSelected) {
        pos = focusCenter
      } else if (isMobile && mapMode === 'disposizioni') {
        pos = MOBILE_GRID[index] || node.anchor || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length]
      } else {
        pos = node.anchor || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length]
      }
      pos = clampMapPosition(pos, safeBounds)

      const weight = formatNodeWeight(mapMode, node)
      const circle = Math.round(
        Math.max(
          20,
          Math.min(base * planetSizeFactor, 22 + weight.sizeRatio * base * planetSizeK),
        ),
      )
      return {
        id: node.id,
        node,
        pos,
        scale,
        opacity,
        circle,
        weight,
        isSelected,
      }
    })
  }, [
    mapNodes,
    effectiveSelectedId,
    isZoomedView,
    isMobile,
    mapMode,
    focusCenter,
    base,
    selectedScale,
    planetSizeFactor,
    planetSizeK,
    safeBounds,
    mapH,
  ])

  const layoutById = useMemo(
    () => Object.fromEntries(planetLayout.map((p) => [p.id, p])),
    [planetLayout],
  )

  const relationLines = useMemo(() => {
    if (mapMode === 'parole') {
      const baseNode =
        selectedNode ||
        [...mapNodes].sort((a, b) => pesoToPct(b.raw?.activationPct ?? b.peso) - pesoToPct(a.raw?.activationPct ?? a.peso))[0]
      const from = baseNode ? layoutById[baseNode.id]?.pos : null
      if (!baseNode || !from) return []
      return (Array.isArray(baseNode.raw?.relations) ? baseNode.raw.relations : [])
        .map((relation) => {
          const toNode = mapNodes.find((node) => node.raw?.familyKey === relation.familyKey)
          const to = toNode ? layoutById[toNode.id]?.pos : null
          if (!to || toNode.id === baseNode.id) return null
          return {
            id: `lessico-${baseNode.raw?.familyKey}-${relation.kind}-${relation.familyKey}`,
            from,
            to,
            colore: relation.colore,
            kind: relation.kind,
          }
        })
        .filter(Boolean)
    }

    if (mapMode !== 'disposizioni') return []

    if (selected && selectedProfileInfo && mapMode === 'disposizioni') {
      const from = layoutById[selected.id]?.pos || focusCenter
      return selectedProfileInfo.activePartners
        .map((partner) => {
          const to = layoutById[partner.id]?.pos
          if (!to) return null
          return {
            ...partner,
            from,
            to,
          }
        })
        .filter(Boolean)
    }

    return overviewRelations
      .map((relation) => {
        const from = layoutById[relation.baseId]?.pos
        const to = layoutById[relation.partnerId]?.pos
        if (!from || !to) return null
        return {
          ...relation,
          from,
          to,
        }
      })
      .filter(Boolean)
  }, [mapMode, selected, selectedNode, selectedProfileInfo, overviewRelations, layoutById, focusCenter, mapNodes])

  const guideStars = useMemo(() => {
    if (effectiveSelectedId || mapMode !== 'disposizioni') return []
    return data.flatMap((corrente, correnteIndex) => {
      const parentLayout = layoutById[corrente.id]
      const subsList = Array.isArray(corrente.sottoCorrenti) ? corrente.sottoCorrenti : []
      if (!parentLayout || subsList.length === 0) return []

      return subsList.map((sub, subIndex) => {
        const pct = pesoToPct(sub.peso)
        const spiral = GUIDE_STAR_SPIRAL[subIndex % GUIDE_STAR_SPIRAL.length]
        const lap = Math.floor(subIndex / GUIDE_STAR_SPIRAL.length)
        const angle =
          spiral.angle +
          correnteIndex * 0.42 +
          lap * 0.58
        const distance = (isMobile ? 8.5 : 11.5) * spiral.distance + lap * (isMobile ? 2.6 : 3.2)
        const pos = clampMapPosition(
          {
            x: parentLayout.pos.x + Math.cos(angle) * distance,
            y: parentLayout.pos.y + Math.sin(angle) * distance * 0.78,
          },
          safeBounds,
        )

        return {
          id: `${corrente.id}-${sub.id}`,
          parentId: corrente.id,
          parentName: corrente.nome,
          sub,
          pct,
          pos,
          size: Math.round(7 + Math.min(9, pct * 0.09)),
          delay: (correnteIndex * 0.04 + subIndex * 0.035) % 0.28,
        }
      })
    })
  }, [data, isMobile, layoutById, safeBounds, effectiveSelectedId, mapMode])

  const positionTransition = reducedMotion
    ? { duration: 0 }
    : GALASSIA_STABLE_TRANSITION

  const subs = useMemo(
    () => (Array.isArray(selectedNode?.sottoCorrenti) ? selectedNode.sottoCorrenti : []),
    [selectedNode],
  )
  const constellationLayout = useMemo(() => {
    const n = Math.max(1, subs.length)
    const nodeMax = Math.round(Math.max(56, Math.min(84, base * 0.13)))

    const sizes = subs.map((sub) => {
      const ratio =
        mapMode === 'rapporti'
          ? rapportoLivello(sub.livello ?? sub.peso) / 7
          : pesoToPct(sub.peso) / 100
      return Math.round(Math.max(50, Math.min(nodeMax, 48 + ratio * 100 * 0.36)))
    })

    const {
      sizes: fittedSizes,
      orbitForCount,
      maxNode,
      yFlatten,
    } = fitConstellationOrbit({
      n,
      sizes,
      orbitHint: orbitRadius,
      mapW,
      mapH,
      focusCenter,
      isMobile,
    })

    const nodes = subs.map((sub, index) => {
      const { x, y } = resolveConstellationPosition(n, index, orbitForCount, yFlatten)
      const weightLabel =
        mapMode === 'rapporti'
          ? `${rapportoLivello(sub.livello ?? sub.peso)}/7`
          : mapMode === 'parole'
            ? `${sub.wordCount || sub.words?.length || 0} parole`
            : `${pesoToPct(sub.peso)}%`
      const size = fittedSizes[index]
      const trait =
        mapMode === 'parole'
          ? (sub.coloreTST || '')
          : Array.isArray(sub.statiDanimo) && sub.statiDanimo[0]
            ? sub.statiDanimo[0]
            : ''
      return { sub, x, y, weightLabel, size, orbitForCount, trait }
    })

    const labelPad = (isMobile ? 28 : CONSTELLATION_LABEL_CLEAR) + 12
    const maxExtent = nodes.reduce(
      (acc, node) => {
        const half = node.size / 2 + labelPad
        return {
          x: Math.max(acc.x, Math.abs(node.x) + half),
          y: Math.max(acc.y, Math.abs(node.y) + half),
        }
      },
      { x: CONSTELLATION_CORE_DIAM / 2 + labelPad, y: CONSTELLATION_CORE_DIAM / 2 + labelPad },
    )
    const requiredSpan = Math.max(maxExtent.x, maxExtent.y) * 2
    const constellationSize = Math.max(
      requiredSpan,
      orbitForCount * 2 + constellationPadding,
      CONSTELLATION_CORE_DIAM + maxNode * 2 + labelPad,
    )

    return { nodes, constellationSize, orbitForCount, n }
  }, [subs, orbitRadius, base, mapW, mapH, focusCenter, constellationPadding, isMobile, mapMode])

  const constellationNodes = constellationLayout.nodes
  const constellationSize = constellationLayout.constellationSize

  const isEmptyState = useMemo(() => {
    return !correntData || correntData.length === 0 || correntData.every(d => Number(d.peso) === 0)
  }, [correntData])

  if (isEmptyState) {
    return (
      <div
        className="galassia-view"
        style={{
          backgroundColor: '#020817',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 500,
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.12)',
          padding: '40px',
          borderRadius: '16px',
          maxWidth: '480px'
        }}>
          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 600, marginBottom: '12px' }}>
            Galassia Lessicale non disponibile
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.8 }}>
            Non sono presenti dati di test validi per questo report. Completa il test d'ascolto per sbloccare la mappa delle costellazioni emotive e dei tuoi contrasti lessicali.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`galassia-view relative h-full w-full text-slate-100 select-none${isZoomedView ? ' galassia-view--zoomed' : ' galassia-view--overview'}${isPanelIdle ? ' galassia-view--idle' : ''}${guideDeckOpen ? ' galassia-view--guide-open' : ''}${effectiveSelectedId && !isZoomedView ? ' galassia-view--selected' : ''}${activeSubId ? ' galassia-view--reading-sub' : ''}${reducedMotion ? ' is-reduced-motion' : ''} galassia-view--mode-${mapMode}`}
      style={{ backgroundColor: SPACE_BG }}
      aria-label="Galassia degli affetti"
    >
      <div className="galassia-view__bg-backdrop" aria-hidden>
        <div className="galassia-view__bg-deep" />
        <div className="galassia-view__bg-nebula" />
        <div className="galassia-view__bg-stars" />
        {!reducedMotion && (
          <div className="galassia-view__bg-stars galassia-view__bg-stars--twinkle" />
        )}
        <div
          className="galassia-view__bg-focus"
          style={{
            background: `radial-gradient(55% 45% at ${effectiveSelectedId ? focusCenter.x : 50}% ${effectiveSelectedId ? focusCenter.y : 45}%, ${focusColor}33 0%, transparent 72%)`,
          }}
        />
      </div>
      <div className="galassia-view__bg-vignette" aria-hidden />

      {showTutorial ? (
        <GalassiaTutorialOverlay
          accentColor={rankedData[0]?.colore || '#4ade80'}
          onComplete={handleTutorialComplete}
        />
      ) : null}

      <div className="galassia-view__chrome">
        <header className="galassia-view__scene-head">
          {isZoomedView && selectedNode ? (
            <div className="galassia-view__scene-head-copy galassia-view__scene-head-copy--zoomed">
              <h1>{selectedNode.nome}</h1>
            </div>
          ) : (
            <div className="galassia-view__scene-head-copy">
              <h1>{GALASSIA_UI.chromeTitle}</h1>
            </div>
          )}
          <div className="galassia-view__head-actions">
            {!isZoomedView ? (
              <button
                type="button"
                className={`galassia-view__guide-toggle${showGuideDeck ? ' galassia-view__guide-toggle--active' : ''}`}
                aria-label={GALASSIA_UI.guideToggleAria}
                aria-expanded={showGuideDeck ? 'true' : 'false'}
                onClick={(event) => {
                  event.stopPropagation()
                  setShowGuideDeck((open) => !open)
                }}
              >
                {showGuideDeck ? GALASSIA_UI.guideToggleClose : GALASSIA_UI.guideToggleOpen}
              </button>
            ) : null}
          </div>
        </header>

        <nav
          className="galassia-view__mode-switch"
          role="tablist"
          aria-label={GALASSIA_UI.modeSwitchAria}
        >
          {GALASSIA_MAP_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              className="galassia-view__mode-tab"
              aria-selected={mapMode === mode.id ? 'true' : 'false'}
              data-active={mapMode === mode.id ? 'true' : 'false'}
              aria-label={mode.label}
              onClick={() => switchMapMode(mode.id)}
            >
              <span className="galassia-view__mode-tab-label galassia-view__mode-tab-label--full">
                {mode.label}
              </span>
              <span className="galassia-view__mode-tab-label galassia-view__mode-tab-label--short">
                {mode.shortLabel || mode.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Controlli mappa: zoom, centra / torna alla mappa, schermo intero. Pan con trascinamento o frecce. */}
      {!isMobile && mapMode !== 'parole' ? (
        <div
          className="galassia-view__map-controls galassia-view__map-controls--floating"
          role="toolbar"
          aria-label="Navigazione mappa: zoom e schermo intero"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="galassia-view__map-control"
            aria-label="Zoom indietro"
            title="Zoom indietro (−)"
            onClick={(event) => {
              event.stopPropagation()
              zoomCameraByStep(-1)
            }}
          >
            −
          </button>
          <button
            type="button"
            className="galassia-view__map-control"
            aria-label="Zoom avanti"
            title="Zoom avanti (+)"
            onClick={(event) => {
              event.stopPropagation()
              zoomCameraByStep(1)
            }}
          >
            +
          </button>
          <button
            type="button"
            className="galassia-view__map-control galassia-view__map-control--ghost"
            aria-label={isZoomedView ? GALASSIA_UI.backToMap : GALASSIA_UI.resetCamera}
            title="Reimposta visuale"
            onClick={(event) => {
              event.stopPropagation()
              if (isZoomedView || effectiveSelectedId) backToMap()
              else resetCamera()
            }}
          >
            {isZoomedView || effectiveSelectedId ? GALASSIA_UI.backToMap : GALASSIA_UI.resetCamera}
          </button>

          <button
            type="button"
            className={`galassia-view__map-control lessico-atlas__fullscreen-btn${isFullscreen ? ' is-active' : ''}`}
            aria-label={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
            title={isFullscreen ? 'Esci da schermo intero (Esc)' : 'Schermo intero immersivo'}
            onClick={(event) => {
              event.stopPropagation()
              toggleFullscreen()
            }}
          >
            {isFullscreen ? '✕' : '⛶'}
          </button>
        </div>
      ) : null}

      {guideDeckOpen ? (
        <GalassiaOperatorGuide mapMode={mapMode} onDismiss={closeGuidePermanently} />
      ) : null}

      {mapMode === 'parole' ? (
        <LessicoAtlasView
          paroleEmerse={paroleEmerse}
          isMobile={isMobile}
          viewModel={lessicoAnalitico}
        />
      ) : !isMobile ? (
        <div
          ref={mapLayerRef}
          className="galassia-view__map-layer relative z-10 h-full w-full"
          onWheel={handleMapWheel}
          onPointerDown={handleMapPointerDown}
          onPointerMove={handleMapPointerMove}
          onPointerUp={endPointerGesture}
          onPointerCancel={endPointerGesture}
          onLostPointerCapture={endPointerGesture}
          onClick={(event) => {
            if (!isZoomedView) return
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest(INTERACTIVE_MAP_SELECTOR)) {
              return
            }
            backToMap()
          }}
        >
          {isPanelIdle && !guideDeckOpen && !showTutorial && (
            <div className="galassia-view__idle-hint" aria-hidden="true">
              <span>Tocca un pianeta per leggere il profilo</span>
            </div>
          )}
          <div ref={mapViewportRef} className="galassia-view__map-viewport">
            <div
              ref={mapCanvasRef}
              className={`galassia-view__map-canvas${cameraAnimating ? ' galassia-view__map-canvas--animating' : ''}`}
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              }}
            >
          <div className="galassia-view__map-stage">
          {mapMode === 'disposizioni' ? (
            <div className="galassia-3d-celestial-web" aria-hidden="true">
              {/* Singolarità gravitazionale e pulsar centrale */}
              <div className="galassia-3d-core">
                <div className="galassia-3d-core__nebula" />
                <div className="galassia-3d-core__rings" />
                <div className="galassia-3d-core__singularity" />
                <div className="galassia-3d-core__lens-flare" />
              </div>

              {/* Piani orbitali ellittici 3D e coordinate energetiche */}
              <svg
                className="galassia-3d-web__svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="streamGradBlu" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="streamGradRosso" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="streamGradGiallo" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="streamGradGrigio" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
                  </linearGradient>
                  <radialGradient id="celestialCoreGlow" cx="50%" cy="51%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                    <stop offset="45%" stopColor="#818cf8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#020817" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Bagliore gravitazionale del nucleo */}
                <circle cx="50" cy="51" r="28" fill="url(#celestialCoreGlow)" />

                {/* Tracce orbitali concentriche in prospettiva 3D */}
                <ellipse cx="50" cy="51" rx="16" ry="11" className="galassia-3d-orbit galassia-3d-orbit--inner" />
                <ellipse cx="50" cy="51" rx="29" ry="20" className="galassia-3d-orbit galassia-3d-orbit--mid" />
                <ellipse cx="50" cy="51" rx="43" ry="30" className="galassia-3d-orbit galassia-3d-orbit--outer" />
                <ellipse cx="50" cy="51" rx="48" ry="34" className="galassia-3d-orbit galassia-3d-orbit--far" />

                {/* Linee di coordinate cardinali */}
                <line x1="12" y1="51" x2="88" y2="51" className="galassia-3d-axis-line galassia-3d-axis-line--horizontal" />
                <line x1="50" y1="14" x2="50" y2="86" className="galassia-3d-axis-line galassia-3d-axis-line--vertical" />

                {/* Flussi di fotoni luminosi verso la singolarità centrale */}
                <path className="galassia-3d-stream galassia-3d-stream--blu" d="M18 54 C31 46, 41 46, 50 51" />
                <path className="galassia-3d-stream galassia-3d-stream--rosso" d="M82 54 C69 46, 59 46, 50 51" />
                <path className="galassia-3d-stream galassia-3d-stream--giallo" d="M50 20 C56 32, 56 42, 50 51" />
                <path className="galassia-3d-stream galassia-3d-stream--grigio" d="M50 84 C44 72, 44 60, 50 51" />
                <path className="galassia-3d-stream galassia-3d-stream--verde" d="M38 51 C44 45, 56 45, 62 51 C56 57, 44 57, 38 51" />

                {/* Onde di impulso secondarie per profondità cinetica */}
                <path className="galassia-3d-stream-pulse galassia-3d-stream-pulse--blu" d="M18 54 C31 46, 41 46, 50 51" />
                <path className="galassia-3d-stream-pulse galassia-3d-stream-pulse--rosso" d="M82 54 C69 46, 59 46, 50 51" />
                <path className="galassia-3d-stream-pulse galassia-3d-stream-pulse--giallo" d="M50 20 C56 32, 56 42, 50 51" />
                <path className="galassia-3d-stream-pulse galassia-3d-stream-pulse--grigio" d="M50 84 C44 72, 44 60, 50 51" />
              </svg>
            </div>
          ) : null}
          {mapMode === 'portato' && portato?.hasData ? (
            <>
              <svg
                className="galassia-view__portato-triangle"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon
                  points={`${PORTATO_ANCHORS.Simpatia.x},${PORTATO_ANCHORS.Simpatia.y} ${PORTATO_ANCHORS.Antipatia.x},${PORTATO_ANCHORS.Antipatia.y} ${PORTATO_ANCHORS.Indifferenza.x},${PORTATO_ANCHORS.Indifferenza.y}`}
                />
              </svg>
            </>
          ) : null}
          {relationLines.length > 0 ? (
            <svg
              className="galassia-view__relation-lines"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {relationLines.map((line) => (
                <line
                  key={line.id}
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  data-kind={line.kind || 'dialogue'}
                  style={{ '--relation-color': line.colore }}
                />
              ))}
            </svg>
          ) : null}
          <div className="galassia-view__axis-labels" aria-hidden={mapMode !== 'disposizioni'}>
            {mapMode === 'disposizioni'
              ? GALASSIA_AXIS.map((item) => (
                  <span key={item.className} className={`galassia-view__axis-label ${item.className}`}>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                ))
              : null}
          </div>

          <AnimatePresence>
            {!effectiveSelectedId && mapMode === 'disposizioni' && guideStars.map((star) => (
              <motion.button
                key={star.id}
                type="button"
                className="galassia-view__guide-star"
                style={{
                  left: `${star.pos.x}%`,
                  top: `${star.pos.y}%`,
                  '--guide-star-color': star.sub.colore || '#f8fafc',
                  '--guide-star-size': `${star.size}px`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: star.delay, duration: 0.28 }}
                onClick={(event) => {
                  event.stopPropagation()
                  selectGuideStar(star.parentId, star.sub.id)
                }}
                onMouseEnter={() => setHoveredId(star.parentId)}
                onMouseLeave={() => setHoveredId((prev) => (prev === star.parentId ? null : prev))}
                onFocus={() => setHoveredId(star.parentId)}
                onBlur={() => setHoveredId((prev) => (prev === star.parentId ? null : prev))}
                aria-label={`Apri la costellazione ${star.parentName}, sottocorrente ${star.sub.nome}, ${star.pct}%`}
                title={`${star.sub.nome} · ${star.parentName} · ${star.pct}%`}
              >
                <span className="galassia-view__guide-star-core" aria-hidden="true" />
                <span className="galassia-view__guide-star-label">
                  {star.sub.nome}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isZoomedView && selectedNode && selectedNode.mode === mapMode && mapMode !== 'parole' && constellationNodes.length > 0 && (
              <motion.div
                key={`constellation-${mapMode}-${selectedNode.id}`}
                className="galassia-view__constellation"
                style={{
                  left: `calc(${focusCenter.x}% - ${constellationSize / 2}px)`,
                  top: `calc(${focusCenter.y}% - ${constellationSize / 2}px)`,
                  width: constellationSize,
                  height: constellationSize,
                  '--constellation-color': selectedNode.colore,
                }}
                initial={{ opacity: 0, scale: 0.28 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : GALASSIA_STABLE_ENTER_TRANSITION
                }
              >
                <svg
                  className="galassia-view__constellation-lines"
                  viewBox={`${-constellationSize / 2} ${-constellationSize / 2} ${constellationSize} ${constellationSize}`}
                  aria-hidden="true"
                >
                  {constellationNodes.map(({ sub, x, y }) => (
                    <line key={sub.id} x1="0" y1="0" x2={x} y2={y} />
                  ))}
                </svg>
                <button
                  type="button"
                  className={`galassia-view__constellation-core${hoveredCore ? ' galassia-view__constellation-core--show-label' : ''}`}
                  style={{ '--core-color': selectedNode.colore }}
                  onClick={(event) => {
                    event.stopPropagation()
                    setActiveSubId(null)
                  }}
                  onMouseEnter={() => {
                    setHoveredCore(true)
                    setHoveredSubId(null)
                  }}
                  onMouseLeave={() => setHoveredCore(false)}
                  onFocus={() => setHoveredCore(true)}
                  onBlur={() => setHoveredCore(false)}
                  aria-pressed={!activeSubId}
                  aria-label={`${selectedNode.nome}, ${formatNodeWeight(mapMode, selectedNode).display}`}
                >
                  <span className="galassia-view__constellation-core-node" aria-hidden="true" />
                  <span className="galassia-view__constellation-core-label">
                    <strong>{selectedNode.nome}</strong>
                    <small>{formatNodeWeight(mapMode, selectedNode).short}</small>
                  </span>
                </button>
                {constellationNodes.map(({ sub, x, y, weightLabel, size, trait }, index) => {
                  const isActive = sub.id === activeSubId
                  const isHovered = sub.id === hoveredSubId
                  const showLabel = !isMobile || isActive || isHovered
                  // Push the label radially outward along the same angle as the
                  // satellite itself (relative to the core at 0,0), so it always
                  // lands farther from the core than the node — never behind it,
                  // regardless of orbit radius, satellite count or viewport size.
                  const distFromCore = Math.hypot(x, y) || 1
                  const dirX = x / distFromCore
                  const dirY = y / distFromCore
                  // Label anchored by its inner edge just outside the sphere, so the
                  // box never covers its own node whatever the text width.
                  const side = dirX > 0.32 ? 'right' : dirX < -0.32 ? 'left' : dirY < 0 ? 'top' : 'bottom'
                  const labelPush = size / 2 + CONSTELLATION_LABEL_GAP
                  const labelDx = side === 'right' ? labelPush : side === 'left' ? -labelPush : 0
                  const labelDy = side === 'top' ? -labelPush : side === 'bottom' ? labelPush : 0
                  const labelAlign = side === 'right' ? 'left' : side === 'left' ? 'right' : 'center'
                  return (
                    <motion.div
                      key={sub.id}
                      className={`galassia-view__constellation-wrap${isActive ? ' galassia-view__constellation-wrap--active' : ''}${isHovered ? ' galassia-view__constellation-wrap--hovered' : ''}${showLabel ? ' galassia-view__constellation-wrap--show-label' : ''}`}
                      style={{
                        left: `calc(50% + ${x - size / 2}px)`,
                        top: `calc(50% + ${y - size / 2}px)`,
                        '--label-dx': `${labelDx}px`,
                        '--label-dy': `${labelDy}px`,
                        '--label-align': labelAlign,
                      }}
                      data-label-side={side}
                      initial={{ opacity: 0, scale: 0.2 }}
                      animate={{ opacity: 1, scale: isActive ? 1.06 : 1 }}
                      exit={{ opacity: 0, scale: 0.35 }}
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : {
                              delay: 0.12 + index * 0.06,
                              ...GALASSIA_STABLE_ENTER_TRANSITION,
                            }
                      }
                    >
                      <button
                        type="button"
                        className="galassia-view__constellation-hit"
                        style={{
                          '--node-color': sub.colore || selectedNode.colore,
                          '--node-size': `${size}px`,
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          setActiveSubId(sub.id)
                        }}
                        onMouseEnter={() => {
                          setHoveredSubId(sub.id)
                          setHoveredCore(false)
                        }}
                        onMouseLeave={() => setHoveredSubId((prev) => (prev === sub.id ? null : prev))}
                        onFocus={() => setHoveredSubId(sub.id)}
                        onBlur={() => setHoveredSubId((prev) => (prev === sub.id ? null : prev))}
                        aria-label={`${sub.nome}, ${weightLabel}`}
                        aria-pressed={isActive}
                      >
                        <span className="galassia-view__constellation-node" aria-hidden="true" />
                        {mapMode === 'parole' && isActive && Array.isArray(sub.words) && sub.words.length > 0 ? (
                          <span className="galassia-view__word-orbit" aria-hidden="true">
                            {sub.words.slice(0, 8).map((word, wordIndex) => {
                              const angle = -Math.PI / 2 + (wordIndex * Math.PI * 2) / Math.min(8, sub.words.length)
                              const radius = size / 2 + 44 + (wordIndex % 2) * 12
                              return (
                                <span
                                  key={word.id}
                                  className="galassia-view__word-star"
                                  style={{
                                    transform: `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                                  }}
                                >
                                  {word.nome}
                                </span>
                              )
                            })}
                          </span>
                        ) : null}
                        <span className="galassia-view__constellation-label" aria-hidden="true">
                          <strong>{subDisplayName(sub.nome)}</strong>
                          <small>{weightLabel}</small>
                          {trait ? (
                            <em className="galassia-view__constellation-trait">{trait}</em>
                          ) : null}
                        </span>
                      </button>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {mapMode === 'parole' ? (
            <ParoleWordCloud
              nodes={mapNodes}
              selectedFamilyId={effectiveSelectedId}
              selectedSubId={activeSubId}
              onSelectFamily={selectFamily}
              onSelectSub={selectFamilyAndSub}
              camera={camera}
              mapW={mapW}
              mapH={mapH}
            />
          ) : null}

          {mapMode !== 'parole' && planetLayout.map((layout, index) => {
            const c = layout.node
            if (!c) return null
            const isHovered = hoveredId === c.id
            const isDominant = mapMode === 'disposizioni' && rankedData[0]?.id === c.id
            return (
              <motion.div
                key={c.id}
                className={`galassia-view__planet-wrap absolute -translate-x-1/2 -translate-y-1/2${layout.isSelected ? ' galassia-view__planet-wrap--selected' : ''}${isZoomedView && !layout.isSelected ? ' galassia-view__planet-wrap--dimmed' : ''}${effectiveSelectedId === c.id && !isZoomedView ? ' galassia-view__planet-wrap--highlight' : ''}`}
                initial={false}
                animate={{ left: `${layout.pos.x}%`, top: `${layout.pos.y}%`, opacity: layout.opacity }}
                transition={positionTransition}
                style={{ zIndex: layout.isSelected ? 20 : 10 }}
              >
                <motion.button
                  type="button"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-[#020817] focus-visible:ring-2 focus-visible:ring-white"
                  animate={{
                    y: 0,
                    scale: layout.scale,
                  }}
                  transition={{
                    scale: positionTransition,
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    selectPlanet(c.id)
                  }}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId((prev) => (prev === c.id ? null : prev))}
                  onFocus={() => setHoveredId(c.id)}
                  onBlur={() => setHoveredId((prev) => (prev === c.id ? null : prev))}
                  aria-label={`${c.nome}, ${layout.weight.display}`}
                  aria-pressed={layout.isSelected}
                >
                  <CelestialPlanetSphere
                    id={c.id}
                    color={c.colore}
                    size={layout.circle}
                    isHovered={isHovered}
                    isSelected={layout.isSelected}
                    isDominant={isDominant}
                    floatIndex={index}
                  />
                </motion.button>

                <span
                  className="galassia-view__planet-label"
                  style={{ top: `calc(50% + ${Math.max(34, layout.circle) / 2 + 10}px)` }}
                  title={`${c.nome} · ${layout.weight.display}`}
                >
                  <strong>{c.nome}</strong>
                  <small>
                    {layout.weight.short}
                    {mapMode === 'portato' && portatoAxisWord(c.nome)
                      ? ` · ${portatoAxisWord(c.nome)}`
                      : null}
                  </small>
                </span>
              </motion.div>
            )
          })}
          </div>
          </div>
          </div>
        </div>
      ) : (
        <GalassiaMobileAlternativeView
          mapMode={mapMode}
          mapNodes={mapNodes}
        />
      )}

      {mapMode !== 'parole' && isPanelIdle && !guideDeckOpen && isMobile ? (
        <GalassiaMapHint
          mode={mapMode}
          dominant={mapMode === 'disposizioni' ? rankedData[0] : null}
          onSelectDominant={selectPlanet}
        />
      ) : null}

      {mapMode !== 'parole' && (!isPanelIdle || !isMobile) && !guideDeckOpen && !showTutorial ? (
        <GalassiaCrtPanel
          panel={panelContent}
          selected={mapMode === 'disposizioni' ? selected : selectedNode}
          activeSubId={activeSubId}
          profileInfo={selectedProfileInfo}
          onBackToParent={() => setActiveSubId(null)}
          onSelectSub={setActiveSubId}
          onSelectDominant={selectPlanet}
        />
      ) : null}
    </div>
  )
}
