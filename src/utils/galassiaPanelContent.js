/**
 * Testi e metadati per il pannello CRT di GalassiaView.
 * Riutilizza dispositions, galaxyTheoryContent e galaxyContent — niente copy inventato.
 */

import { DISPOSITIONS, POLARITY_LABEL } from '../config/dispositions'
import { CORRENTE_DESCRIPTIONS } from '../config/galaxyContent'
import {
  getGalaxyTheoryForDisposition,
  getGalaxyTheoryForRawKey,
} from '../config/galaxyTheoryContent'
import { GALASSIA_CRT } from '../content/reportRestitution.js'

const FAMIGLIA_LABEL = {
  blu: 'Malinconica',
  rosso: 'Marziale',
  verde: 'Flemmatica',
  giallo: 'Entusiasta',
  grigio: 'Razionale',
}

function pesoToPct(peso) {
  const p = Number(peso) || 0
  if (p > 0 && p < 1) return Math.round(p * 100)
  return Math.round(Math.min(100, p))
}

function firstSentence(text) {
  const t = String(text || '').trim()
  if (!t) return ''
  const dot = t.indexOf('.')
  return (dot > 0 ? t.slice(0, dot + 1) : t).trim()
}

function dispositionForId(dispositionId) {
  return DISPOSITIONS.find((d) => d.dispositionId === dispositionId) || null
}

/** Corrente con peso massimo nel dataset. */
export function getDominantCorrente(correntData = []) {
  if (!correntData.length) return null
  return correntData.reduce(
    (best, c) => (pesoToPct(c.peso) > pesoToPct(best.peso) ? c : best),
    correntData[0],
  )
}

function buildSubOverviewEntry(sub) {
  const theory = getGalaxyTheoryForRawKey(sub.id)
  return {
    id: sub.id,
    nome: sub.nome,
    pct: pesoToPct(sub.peso),
    colore: sub.colore,
    descrizione: theory?.description || sub.descrizione || '',
    statiDanimo: Array.isArray(sub.statiDanimo) ? sub.statiDanimo : [],
  }
}

/** Contenuto pannello per una corrente (pianeta). */
export function buildPlanetPanelContent(corrente, { inCostellazione = false } = {}) {
  if (!corrente) return null
  const disposition = dispositionForId(corrente.id)
  const theory = getGalaxyTheoryForDisposition(corrente.id)
  const colorKey = disposition?.colorKey || ''
  const subs = Array.isArray(corrente.sottoCorrenti) ? corrente.sottoCorrenti : []
  const definizione =
    corrente.descrizione ||
    CORRENTE_DESCRIPTIONS[corrente.id] ||
    firstSentence(disposition?.narrativeShort) ||
    ''
  const cosaIndica = theory ? firstSentence(theory.coreDescription) : ''
  const statiDanimo = Array.isArray(corrente.statiDanimo) ? corrente.statiDanimo : []
  return {
    kind: 'corrente',
    id: corrente.id,
    nome: corrente.nome,
    pct: pesoToPct(corrente.peso),
    colore: corrente.colore,
    famiglia: FAMIGLIA_LABEL[colorKey] || '',
    famigliaColore: colorKey,
    polarita: disposition ? POLARITY_LABEL[disposition.polarity] || '' : '',
    definizione,
    previewLead: inCostellazione ? '' : firstSentence(definizione),
    cosaIndica,
    previewTraits: inCostellazione ? [] : statiDanimo.slice(0, 3),
    hierarchy: GALASSIA_CRT.hierarchyPlanet,
    statiDanimo,
    sottoCount: subs.length,
    subsOverview: inCostellazione ? subs.map(buildSubOverviewEntry) : [],
  }
}

/** Contenuto pannello per una sotto-corrente (satellite). */
export function buildSubPanelContent(sub, parentCorrente) {
  if (!sub || !parentCorrente) return null
  const theory = getGalaxyTheoryForRawKey(sub.id)
  const parentDisp = dispositionForId(parentCorrente.id)
  const colorKey = parentDisp?.colorKey || ''
  return {
    kind: 'sottocorrente',
    id: sub.id,
    nome: sub.nome,
    parentId: parentCorrente.id,
    parentNome: parentCorrente.nome,
    pct: pesoToPct(sub.peso),
    colore: sub.colore || parentCorrente.colore,
    famiglia: FAMIGLIA_LABEL[colorKey] || '',
    famigliaColore: colorKey,
    definizione: theory?.description || sub.descrizione || '',
    cosaIndica: '',
    hierarchy: GALASSIA_CRT.hierarchySub(parentCorrente.nome),
    statiDanimo: Array.isArray(sub.statiDanimo) ? sub.statiDanimo : [],
  }
}

/** Pannello vuoto: chip prevalente + invito a toccare la mappa. */
export function buildMinimalIdlePanel(correntData = []) {
  const dominant = getDominantCorrente(correntData)
  return {
    kind: 'idle',
    id: 'idle',
    nome: GALASSIA_CRT.idleTitle,
    colore: dominant?.colore || '#94a3b8',
    pct: null,
    hint: GALASSIA_CRT.idleLead,
    tapHint: GALASSIA_CRT.idleTapHint,
    dominantChip: dominant
      ? {
          id: dominant.id,
          nome: dominant.nome,
          pct: pesoToPct(dominant.peso),
          colore: dominant.colore,
        }
      : null,
    definizione: '',
    cosaIndica: '',
    statiDanimo: [],
  }
}

/**
 * Risolve il contenuto del pannello — solo ciò che stai guardando adesso.
 * In zoom: solo il pianeta selezionato o la sua sfumatura (hover limitato alla costellazione).
 * A riposo: anteprima al passaggio su un pianeta, altrimenti invito minimo.
 */
export function resolveGalassiaPanelContent({
  correntData,
  selected,
  activeSub,
  hoveredPlanetId,
  hoveredSubId,
}) {
  if (selected) {
    if (activeSub) return buildSubPanelContent(activeSub, selected)
    if (hoveredSubId) {
      const sub = selected.sottoCorrenti?.find((s) => s.id === hoveredSubId)
      if (sub) return buildSubPanelContent(sub, selected)
    }
    return buildPlanetPanelContent(selected, { inCostellazione: true })
  }

  if (hoveredPlanetId) {
    const hovered = correntData.find((c) => c.id === hoveredPlanetId)
    if (hovered) return buildPlanetPanelContent(hovered)
  }

  return buildMinimalIdlePanel(correntData)
}

export { getGalaxyTheoryForRawKey }
