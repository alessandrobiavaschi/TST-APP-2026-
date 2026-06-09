import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
// AnimatePresence + motion usati per zoom costellazione e pannello CRT
import { EXAMPLE_CORRENT_DATA } from '../../utils/galassiaData.js'
import { resolveGalassiaPanelContent } from '../../utils/galassiaPanelContent.js'
import { getGalaxyTheoryForRawKey } from '../../config/galaxyTheoryContent'
import { GALASSIA_CRT } from '../../content/reportRestitution.js'
import {
  getDialogoKeywords,
  getFamigliaDot,
  getFamigliaLabel,
} from '../../content/dialogoCorrenti.js'
import { GALASSIA_UI } from './reportUiCopy.js'
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

/** Margini % della mappa: riservano spazio a titolo, etichette sotto i cerchi e pannello CRT. */
const MAP_SAFE_DESKTOP = { top: 10, bottom: 13, left: 10, right: 10 }
const MAP_SAFE_MOBILE = { top: 12, bottom: 18, left: 12, right: 12 }
const MAP_LABEL_PAD_PX = 104
const CONSTELLATION_CORE_DIAM = 96
const CONSTELLATION_NODE_GAP = 30
const CONSTELLATION_LABEL_CLEAR = 58
/** Bias upward so orbit + labels sit in the visual center of the map viewport. */
const MAP_ZOOM_FOCUS_Y = 46

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
  const slack = 180
  const limitX = Math.max(slack, safeW * (scale - 1) * 0.58 + slack)
  const limitY = Math.max(slack, safeH * (scale - 1) * 0.58 + slack)

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

/** Angoli orbita: 2–3 satellite sparsi (evita ammassamento orizzontale). */
function constellationAngle(count, index) {
  if (count <= 1) return -Math.PI / 2
  if (count === 2) {
    return index === 0 ? -Math.PI * 0.58 : Math.PI * 0.42
  }
  if (count === 3) {
    return -Math.PI / 2 + (index * (Math.PI * 2)) / 3
  }
  return (index / count) * Math.PI * 2 - Math.PI / 2
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
  const sinHalf = Math.sin(Math.PI / count)
  const orbitForPeers =
    sinHalf > 0.01 ? minCenterDistance / (2 * sinHalf) : orbitForCore
  const yFlatten = count === 2 ? 0.76 : 0.74
  return Math.ceil(Math.max(orbitForCore, orbitForPeers / yFlatten))
}

function maxViewportOrbit(mapW, mapH, focusCenter, nodeDiameter) {
  if (mapW < 1 || mapH < 1) return Infinity
  const labelPad = MAP_LABEL_PAD_PX
  const nodeR = nodeDiameter / 2 + CONSTELLATION_LABEL_CLEAR
  const focusYpx = (focusCenter.y / 100) * mapH
  const focusXpx = (focusCenter.x / 100) * mapW
  const vertRoom = Math.min(focusYpx - labelPad * 0.3, mapH - focusYpx - labelPad)
  const horizRoom = Math.min(focusXpx - labelPad * 0.3, mapW - focusXpx - labelPad)
  const vertCap = (vertRoom - nodeR) / 0.74
  const horizCap = horizRoom - nodeR
  return Math.max(0, Math.min(vertCap, horizCap))
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
    const maxOrbit = maxViewportOrbit(mapW, mapH, focusCenter, estNode + CONSTELLATION_LABEL_CLEAR)
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
  { className: 'galassia-view__axis-label--north', title: 'Nord', text: 'Entusiasmo' },
  { className: 'galassia-view__axis-label--west', title: 'Ovest', text: 'Malinconia' },
  { className: 'galassia-view__axis-label--east', title: 'Est', text: 'Volitività' },
  { className: 'galassia-view__axis-label--center', title: 'Centro', text: 'Calma' },
  { className: 'galassia-view__axis-label--south', title: 'Sud', text: 'Anaffettività' },
]

const FAMILY_KEY_BY_DISPOSITION = {
  malinconica_nostalgica: 'blu',
  collerico_volitiva: 'rosso',
  flemmatica: 'verde',
  entusiasmo: 'giallo',
  agnostica_anaffettiva: 'grigio',
}

const CORRENTE_NAME_BY_FAMILY = {
  blu: 'Malinconia',
  rosso: 'Volitività',
  verde: 'Calma',
  giallo: 'Entusiasmo',
  grigio: 'Anaffettività',
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

function getParoleForFamily(paroleEmerse = [], familyKey = '') {
  const correnteName = CORRENTE_NAME_BY_FAMILY[familyKey]
  if (!correnteName) return []
  return paroleEmerse
    .filter((item) => item?.corrente === correnteName)
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
      }
    })
    .filter((item) => item.keywords.length > 0)

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
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
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

function GalassiaCrtPanel({
  panel,
  selected,
  activeSubId,
  profileInfo,
  onBackToParent,
  onSelectSub,
}) {
  if (!panel) return null

  const isSub = panel.kind === 'sottocorrente'
  const isIdle = panel.kind === 'idle'
  const isPreview = !selected && panel.kind === 'corrente'
  const isCostellazione = selected && panel.kind === 'corrente' && !isPreview
  const isCompact = isIdle || isPreview
  const meaning = shortText(panel.definizione || panel.cosaIndica || '', isSub ? 150 : 120)
  const interval = isSub ? shortText(panel.cosaIndica || '', 72) : ''
  const parole = Array.isArray(panel.statiDanimo) ? panel.statiDanimo : []
  const paroleLimit = isSub ? 5 : 4
  const showSubnav = isCostellazione && !activeSubId
  const showProfileReading = isCostellazione && profileInfo && !isSub

  return (
    <aside
      className={`galassia-view__crt${isCompact ? ' galassia-view__crt--compact' : ''}`}
      aria-label={GALASSIA_UI.monitorAria}
    >
      <div className="galassia-view__crt-bezel" style={{ '--panel-color': panel.colore || '#22c55e' }}>
        <div className="galassia-view__crt-head">
          <p className="galassia-view__crt-kicker">
            {isIdle
              ? GALASSIA_CRT.kickerIdle
              : isCostellazione
                ? GALASSIA_CRT.kickerCostellazione
                : isPreview
                  ? GALASSIA_CRT.kickerPreview
                  : GALASSIA_CRT.kickerViewing}
          </p>
          {panel.pct != null && (
            <span className="galassia-view__crt-head-pct">{panel.pct}%</span>
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
                <h2 className="galassia-view__crt-title">
                  <span className="galassia-view__crt-title-dot" aria-hidden />
                  <span>{panel.nome}</span>
                </h2>
                <p className="galassia-view__crt-indica">{panel.hint}</p>
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
                            <b>{sub.nome}</b>
                            <em>{sub.pct}%</em>
                          </span>
                          <MiniBar value={sub.pct} color={sub.colore || panel.colore} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {profileInfo.activePartners.length > 0 && (
                  <section className="galassia-view__profile-block galassia-view__profile-block--dialogue">
                    <h3>Dialogo</h3>
                    <ul className="galassia-view__dialogue-list">
                      {profileInfo.activePartners.map((partner) => (
                        <li key={partner.id}>
                          <span className="galassia-view__dialogue-head">
                            <i style={{ backgroundColor: partner.colore }} aria-hidden="true" />
                            <b>{partner.nome}</b>
                            <em>{partner.pct}%</em>
                          </span>
                          <span className="galassia-view__dialogue-keywords">
                            {partner.keywords.join(' · ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {profileInfo.rapporti.length > 0 && (
                  <section className="galassia-view__profile-block galassia-view__profile-block--rapporti">
                    <h3>Rapporti</h3>
                    <ul className="galassia-view__rapporti-list">
                      {profileInfo.rapporti.map((rapporto) => (
                        <li key={rapporto.id}>
                          <span>{rapporto.nome}</span>
                          <b>{rapporto.valore}/7</b>
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

                {isSub && (panel.intervallo || panel.coloreTST) && (
                  <p className="galassia-view__crt-meta galassia-view__crt-meta--compact">
                    {[
                      panel.intervallo ? `${GALASSIA_CRT.intervalloLabel}: ${panel.intervallo}` : '',
                      panel.coloreTST ? `${GALASSIA_CRT.coloreLabel}: ${panel.coloreTST}` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
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

                {interval && isSub && (
                  <p className="galassia-view__crt-hint galassia-view__crt-hint--compact">{interval}</p>
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
                            <strong>{sub.nome}</strong>
                            <em>{sub.pct}%</em>
                          </span>
                          {(sub.intervallo || sub.coloreTST) && (
                            <span className="galassia-view__subnav-card-meta">
                              {[sub.intervallo, sub.coloreTST].filter(Boolean).join(' · ')}
                            </span>
                          )}
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  )
}

export default function GalassiaView({ correntData, paroleEmerse = [], rapporti = [] }) {
  const data = useMemo(
    () => (Array.isArray(correntData) && correntData.length ? correntData : EXAMPLE_CORRENT_DATA),
    [correntData],
  )
  const rankedData = useMemo(
    () => [...data].sort((a, b) => pesoToPct(b.peso) - pesoToPct(a.peso)),
    [data],
  )

  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const containerRef = useRef(null)
  const mapLayerRef = useRef(null)
  const mapCanvasRef = useRef(null)
  const cameraRef = useRef(CAMERA_RESET)
  const pointersRef = useRef(new Map())
  const pinchGestureRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const { w, h } = useElementSize(containerRef)
  const { w: mapW, h: mapH } = useElementSize(mapCanvasRef)

  const [selectedId, setSelectedId] = useState(null)
  const [activeSubId, setActiveSubId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [hoveredSubId, setHoveredSubId] = useState(null)
  const [camera, setCamera] = useState(CAMERA_RESET)
  const [cameraAnimating, setCameraAnimating] = useState(false)
  const cameraAnimTimerRef = useRef(null)

  const selected = useMemo(
    () => data.find((c) => c.id === selectedId) || null,
    [data, selectedId],
  )
  const activeSub = useMemo(
    () => selected?.sottoCorrenti?.find((s) => s.id === activeSubId) || null,
    [selected, activeSubId],
  )
  const selectedProfileInfo = useMemo(
    () =>
      selected
        ? buildProfileInfo({
            corrente: selected,
            rankedData,
            paroleEmerse,
            rapporti,
          })
        : null,
    [selected, rankedData, paroleEmerse, rapporti],
  )

  const viewportBase = Math.max(1, Math.min(w || 0, h || 0))
  const zoomSubCount = useMemo(() => {
    const match = data.find((item) => item.id === selectedId)
    return Math.max(1, match?.sottoCorrenti?.length ?? 1)
  }, [data, selectedId])
  const zoomLayout = useMemo(
    () =>
      computeGalassiaZoomLayout({
        mapW,
        mapH,
        viewportBase,
        isMobile,
        isZoomed: Boolean(selectedId),
        subCount: zoomSubCount,
      }),
    [mapW, mapH, viewportBase, isMobile, selectedId, zoomSubCount],
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

  const panelContent = useMemo(
    () =>
      resolveGalassiaPanelContent({
        correntData: data,
        selected,
        activeSub,
        hoveredPlanetId: selected ? null : hoveredId,
        hoveredSubId: selected ? hoveredSubId : null,
      }),
    [data, selected, activeSub, hoveredId, hoveredSubId],
  )

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

  const applyCamera = useCallback((nextCamera) => {
    const next = typeof nextCamera === 'function' ? nextCamera(cameraRef.current) : nextCamera
    const clamped = clampCamera(next, mapW, mapH)
    cameraRef.current = clamped
    setCamera(clamped)
  }, [mapW, mapH])

  const resetCamera = () => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    cameraRef.current = CAMERA_RESET
    setCamera(CAMERA_RESET)
  }

  const selectPlanet = (id) => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    beginCameraAnimation()
    cameraRef.current = CAMERA_RESET
    setCamera(CAMERA_RESET)
    setSelectedId(id)
    setActiveSubId(null)
    setHoveredId(null)
    setHoveredSubId(null)
  }

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
  }

  const backToMap = useCallback(() => {
    pointersRef.current.clear()
    pinchGestureRef.current = null
    mouseDragRef.current = null
    webkitGestureRef.current = null
    beginCameraAnimation()
    cameraRef.current = CAMERA_RESET
    setCamera(CAMERA_RESET)
    const delay = reducedMotion ? 0 : 340
    window.setTimeout(() => {
      setSelectedId(null)
      setActiveSubId(null)
      setHoveredId(null)
      setHoveredSubId(null)
    }, delay)
  }, [beginCameraAnimation, reducedMotion])

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
      return
    }

    const panFactor = cameraRef.current.scale > 1 ? 1 : 0.82
    applyCamera((prev) => ({
      ...prev,
      x: prev.x - event.deltaX * panFactor,
      y: prev.y - event.deltaY * panFactor,
    }))
  }

  const handleMapPointerDown = (event) => {
    const target = event.target instanceof Element ? event.target : null
    const isInteractive = Boolean(target?.closest(INTERACTIVE_MAP_SELECTOR))

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

    if (!selectedId && event.pointerType === 'mouse' && event.button === 0) {
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
      setCamera(clamped)
    }

    const handleGestureEnd = () => {
      webkitGestureRef.current = null
    }

    layer.addEventListener('gesturestart', handleGestureStart, { passive: false })
    layer.addEventListener('gesturechange', handleGestureChange, { passive: false })
    layer.addEventListener('gestureend', handleGestureEnd)

    return () => {
      layer.removeEventListener('gesturestart', handleGestureStart)
      layer.removeEventListener('gesturechange', handleGestureChange)
      layer.removeEventListener('gestureend', handleGestureEnd)
    }
  }, [mapW, mapH])

  const zoomCameraByStep = (direction) => {
    const viewport = mapCanvasRef.current || mapLayerRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    const origin = { x: 0, y: 0 }
    const factor = direction > 0 ? CAMERA_ZOOM_STEP : 1 / CAMERA_ZOOM_STEP
    beginCameraAnimation()
    applyCamera((prev) =>
      zoomCameraAt(prev, prev.scale * factor, origin, rect.width, rect.height),
    )
  }

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (event.key === 'Escape') {
        if (activeSubId) setActiveSubId(null)
        else if (selectedId) backToMap()
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
  }, [selectedId, activeSubId, mapW, mapH, backToMap])

  const planetLayout = useMemo(() => {
    return data.map((c, index) => {
      const isSelected = c.id === selectedId
      let pos
      const scaleCap =
        mapH > 0 && mapH < 700 ? Math.min(selectedScale, 1.15) : selectedScale
      let scale = selectedId ? (isSelected ? scaleCap : 0.58) : 1
      let opacity = selectedId ? (isSelected ? 1 : 0.16) : 1

      if (selectedId && isSelected) {
        pos = focusCenter
      } else if (isMobile) {
        pos = MOBILE_GRID[index] || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length]
      } else {
        pos = WIND_ANCHORS[c.id] || DEFAULT_ANCHORS[index % DEFAULT_ANCHORS.length]
      }
      pos = clampMapPosition(pos, safeBounds)

      const pct = pesoToPct(c.peso)
      const circle = Math.round(
        Math.max(
          20,
          Math.min(base * planetSizeFactor, 22 + (pct / 100) * base * planetSizeK),
        ),
      )
      return { id: c.id, pos, scale, opacity, circle, pct, isSelected }
    })
  }, [
    data,
    selectedId,
    isMobile,
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
    if (!selected || !selectedProfileInfo) return []
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
  }, [selected, selectedProfileInfo, layoutById, focusCenter])

  const guideStars = useMemo(() => {
    if (selectedId) return []
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
  }, [data, isMobile, layoutById, safeBounds, selectedId])

  const positionTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 88, damping: 17, mass: 0.85 }

  const subs = useMemo(
    () => (Array.isArray(selected?.sottoCorrenti) ? selected.sottoCorrenti : []),
    [selected],
  )
  const constellationLayout = useMemo(() => {
    const n = Math.max(1, subs.length)
    const nodeMax = Math.round(Math.max(56, Math.min(84, base * 0.13)))
    const yFlatten = n === 2 ? 0.76 : 0.74

    let sizes = subs.map((sub) => {
      const pct = pesoToPct(sub.peso)
      return Math.round(Math.max(50, Math.min(nodeMax, 48 + pct * 0.36)))
    })
    let maxNode = Math.max(...sizes, 50)
    let orbitForCount = Math.max(orbitRadius, minOrbitRadius(n, maxNode))

    const maxFit = maxViewportOrbit(mapW, mapH, focusCenter, maxNode + CONSTELLATION_LABEL_CLEAR)
    if (maxFit > 0 && orbitForCount > maxFit) {
      const floor = minOrbitRadius(n, maxNode)
      if (maxFit >= floor) {
        orbitForCount = Math.round(maxFit)
      } else {
        const shrink = clamp(maxFit / Math.max(floor, 1), 0.72, 1)
        sizes = sizes.map((size) => Math.round(Math.max(46, size * shrink)))
        maxNode = Math.max(...sizes, 46)
        orbitForCount = Math.round(Math.max(minOrbitRadius(n, maxNode), maxFit))
      }
    }

    const nodes = subs.map((sub, index) => {
      const angle = constellationAngle(n, index)
      const x = Math.cos(angle) * orbitForCount
      const y = Math.sin(angle) * orbitForCount * yFlatten
      const pct = pesoToPct(sub.peso)
      const size = sizes[index]
      const theory = getGalaxyTheoryForRawKey(sub.id)
      const trait = theory?.interval || theory?.color || ''
      return { sub, x, y, pct, size, orbitForCount, trait }
    })

    const labelPad = CONSTELLATION_LABEL_CLEAR + 12
    const span = orbitForCount * 2 + maxNode + labelPad
    const fitW = mapW > 0 ? mapW * 0.94 : span
    const fitH = mapH > 0 ? mapH * 0.9 : span
    const constellationSize = Math.min(
      Math.max(span, orbitForCount * 2 + constellationPadding),
      fitW,
      fitH,
    )

    return { nodes, constellationSize, orbitForCount }
  }, [subs, orbitRadius, base, mapW, mapH, focusCenter, constellationPadding])

  const constellationNodes = constellationLayout.nodes
  const constellationSize = constellationLayout.constellationSize

  return (
    <div
      ref={containerRef}
      className={`galassia-view relative h-full w-full text-slate-100 select-none${selectedId ? ' galassia-view--zoomed' : ' galassia-view--overview'}${activeSubId ? ' galassia-view--reading-sub' : ''}${reducedMotion ? ' is-reduced-motion' : ''}`}
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
            background: `radial-gradient(55% 45% at ${selectedId ? focusCenter.x : 50}% ${selectedId ? focusCenter.y : 45}%, ${focusColor}33 0%, transparent 72%)`,
          }}
        />
      </div>
      <div className="galassia-view__bg-vignette" aria-hidden />

      <header className="galassia-view__scene-head">
        {selected ? (
          <div className="galassia-view__scene-head-copy galassia-view__scene-head-copy--zoomed">
            <p>{GALASSIA_CRT.costellazioneKicker}</p>
            <h1>{selected.nome}</h1>
            <span>
              {GALASSIA_CRT.costellazioneSubtitle(selected.sottoCorrenti?.length || 0)}
            </span>
          </div>
        ) : (
          <div className="galassia-view__scene-head-copy">
            <p>{GALASSIA_UI.sceneKicker}</p>
            <h1>{GALASSIA_UI.sceneTitle}</h1>
            <span>{GALASSIA_UI.sceneSubtitle}</span>
          </div>
        )}
        <div
          className="galassia-view__map-controls"
          role="toolbar"
          aria-label="Navigazione mappa: più e meno per zoomare, Centra per ripristinare la vista"
        >
          <button
            type="button"
            className="galassia-view__map-control"
            aria-label="Zoom avanti"
            onClick={(event) => {
              event.stopPropagation()
              zoomCameraByStep(1)
            }}
          >
            +
          </button>
          <button
            type="button"
            className="galassia-view__map-control"
            aria-label="Zoom indietro"
            onClick={(event) => {
              event.stopPropagation()
              zoomCameraByStep(-1)
            }}
          >
            −
          </button>
          <button
            type="button"
            className="galassia-view__map-control galassia-view__map-control--ghost"
            aria-label={selectedId ? GALASSIA_UI.backToMap : GALASSIA_UI.resetCamera}
            onClick={(event) => {
              event.stopPropagation()
              if (selectedId) backToMap()
              else resetCamera()
            }}
          >
            {selectedId ? GALASSIA_UI.backToMap : GALASSIA_UI.resetCamera}
          </button>
        </div>
      </header>

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
          if (!selectedId) return
          const target = event.target
          if (!(target instanceof Element)) return
          if (target.closest(INTERACTIVE_MAP_SELECTOR)) {
            return
          }
          backToMap()
        }}
      >
        <div ref={mapCanvasRef} className="galassia-view__map-viewport">
          <div
            className={`galassia-view__map-canvas${cameraAnimating ? ' galassia-view__map-canvas--animating' : ''}`}
            style={{
              transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
            }}
          >
        <div className="galassia-view__map-stage">
        {selectedId ? (
          <button type="button" className="galassia-view__back-chip" onClick={backToMap}>
            <span aria-hidden="true">←</span>
            {GALASSIA_UI.backToMap}
          </button>
        ) : null}
        <svg
          className="galassia-view__axis"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <ellipse cx="50" cy="50" rx="29" ry="20" />
          <ellipse cx="50" cy="50" rx="43" ry="30" />
          <line x1="17" y1="52" x2="83" y2="52" />
          <line x1="50" y1="18" x2="50" y2="82" />
        </svg>
        <svg
          className="galassia-view__wind-field"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className="galassia-view__wind-line galassia-view__wind-line--blu" d="M18 54 C31 45, 40 45, 50 51" />
          <path className="galassia-view__wind-line galassia-view__wind-line--rosso" d="M82 54 C70 47, 61 47, 50 51" />
          <path className="galassia-view__wind-line galassia-view__wind-line--giallo" d="M50 20 C56 34, 56 43, 50 51" />
          <path className="galassia-view__wind-line galassia-view__wind-line--grigio" d="M50 84 C44 70, 44 60, 50 51" />
          <path className="galassia-view__wind-line galassia-view__wind-line--verde" d="M38 50 C44 45, 56 45, 62 50 C56 57, 44 57, 38 50" />
        </svg>
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
                style={{ '--relation-color': line.colore }}
              />
            ))}
          </svg>
        ) : null}
        <div className="galassia-view__axis-labels" aria-hidden="true">
          {GALASSIA_AXIS.map((item) => (
            <span key={item.className} className={`galassia-view__axis-label ${item.className}`}>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </span>
          ))}
        </div>

        <AnimatePresence>
          {!selectedId && guideStars.map((star) => (
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
          {selected && constellationNodes.length > 0 && (
            <motion.div
              key={`constellation-${selected.id}`}
              className="galassia-view__constellation"
              style={{
                left: `calc(${focusCenter.x}% - ${constellationSize / 2}px)`,
                top: `calc(${focusCenter.y}% - ${constellationSize / 2}px)`,
                width: constellationSize,
                height: constellationSize,
                '--constellation-color': selected.colore,
              }}
              initial={{ opacity: 0, scale: 0.28 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 78, damping: 15, mass: 1.1 }
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
                className="galassia-view__constellation-core"
                style={{ '--core-color': selected.colore }}
                onClick={(event) => {
                  event.stopPropagation()
                  setActiveSubId(null)
                }}
                aria-pressed={!activeSubId}
                aria-label={`${selected.nome}, ${pesoToPct(selected.peso)}%`}
              >
                <span className="galassia-view__constellation-core-node" aria-hidden="true" />
                <span className="galassia-view__constellation-core-label">
                  <strong>{selected.nome}</strong>
                  <small>{pesoToPct(selected.peso)}%</small>
                </span>
              </button>
              {constellationNodes.map(({ sub, x, y, pct, size, trait }, index) => {
                const isActive = sub.id === activeSubId
                const isHovered = sub.id === hoveredSubId
                const labelSide = y >= 0 ? 'above' : 'below'
                return (
                  <motion.div
                    key={sub.id}
                    className={`galassia-view__constellation-wrap galassia-view__constellation-wrap--label-${labelSide}${isActive ? ' galassia-view__constellation-wrap--active' : ''}${isHovered ? ' galassia-view__constellation-wrap--hovered' : ''}`}
                    style={{
                      left: `calc(50% + ${x - size / 2}px)`,
                      top: `calc(50% + ${y - size / 2}px)`,
                    }}
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{ opacity: 1, scale: isActive ? 1.06 : 1 }}
                    exit={{ opacity: 0, scale: 0.35 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : {
                            delay: 0.12 + index * 0.06,
                            type: 'spring',
                            stiffness: 120,
                            damping: 16,
                          }
                    }
                  >
                    <button
                      type="button"
                      className="galassia-view__constellation-hit"
                      style={{
                        '--node-color': sub.colore || selected.colore,
                        '--node-size': `${size}px`,
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveSubId(sub.id)
                      }}
                      onMouseEnter={() => setHoveredSubId(sub.id)}
                      onMouseLeave={() => setHoveredSubId((prev) => (prev === sub.id ? null : prev))}
                      onFocus={() => setHoveredSubId(sub.id)}
                      onBlur={() => setHoveredSubId((prev) => (prev === sub.id ? null : prev))}
                      aria-label={`${sub.nome}, ${pct}%`}
                      aria-pressed={isActive}
                    >
                      <span className="galassia-view__constellation-node" aria-hidden="true" />
                      <span className="galassia-view__constellation-label" aria-hidden={!isActive && !isHovered}>
                        <strong>{sub.nome}</strong>
                        <small>{pct}%</small>
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

        {/* Pianeti (correnti) */}
        {data.map((c) => {
          const layout = layoutById[c.id]
          if (!layout) return null
          const isHovered = hoveredId === c.id
          return (
            <motion.div
              key={c.id}
              className={`galassia-view__planet-wrap absolute -translate-x-1/2 -translate-y-1/2${layout.isSelected ? ' galassia-view__planet-wrap--selected' : ' galassia-view__planet-wrap--dimmed'}`}
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
                whileHover={reducedMotion ? undefined : { scale: layout.scale * 1.05 }}
                whileTap={{ scale: layout.scale * 0.97 }}
                onClick={(event) => {
                  event.stopPropagation()
                  selectPlanet(c.id)
                }}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId((prev) => (prev === c.id ? null : prev))}
                onFocus={() => setHoveredId(c.id)}
                onBlur={() => setHoveredId((prev) => (prev === c.id ? null : prev))}
                aria-label={`Corrente ${c.nome}, peso ${layout.pct}%`}
                aria-pressed={layout.isSelected}
              >
                <span className="relative flex items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      width: layout.circle + 12,
                      height: layout.circle + 12,
                      border: `1px solid ${c.colore}`,
                      opacity: isHovered ? 0.55 : 0.3,
                    }}
                  />
                  <span
                    aria-hidden
                    className="rounded-full"
                    style={{
                      width: layout.circle,
                      height: layout.circle,
                      backgroundColor: c.colore,
                      opacity: 0.85,
                      boxShadow: isHovered
                        ? `0 0 24px ${c.colore}, 0 0 8px ${c.colore}`
                        : `0 0 14px ${c.colore}66`,
                    }}
                  />
                </span>
              </motion.button>

              <span
                className="galassia-view__planet-label"
                style={{ top: `calc(50% + ${layout.circle / 2 + 8}px)` }}
                title={`${c.nome} · ${layout.pct}%`}
              >
                <strong>{c.nome}</strong>
                <small>{layout.pct}%</small>
              </span>
            </motion.div>
          )
        })}
        </div>
        </div>
        </div>
      </div>

      <GalassiaCrtPanel
        panel={panelContent}
        selected={selected}
        activeSubId={activeSubId}
        profileInfo={selectedProfileInfo}
        onBackToParent={() => setActiveSubId(null)}
        onSelectSub={setActiveSubId}
      />
    </div>
  )
}
