/**
 * Contenuti nominativi per UI Galaxy (pannello / chip / meta sottocorrente).
 * Deriva da dispositions + RAW_DOC_VISUAL senza inventare testi clinici nuovi.
 */

import { DISPOSITIONS } from './dispositions'
import { RAW_DOC_VISUAL, type RawDocVisual } from './galaxyDocBridge'
import { hexToRgb, rgbToHex } from '../utils/galaxyColor'

function mixRgbChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const u = Math.min(1, Math.max(0, t))
  return rgbToHex({
    r: mixRgbChannel(A.r, B.r, u),
    g: mixRgbChannel(A.g, B.g, u),
    b: mixRgbChannel(A.b, B.b, u),
  })
}

/** Chip colore deterministico da indice + tint sottocorrente. */
export function chipHexForSottocorrente(baseHex: string, index: number): string {
  const phase = (index % 5) / 5
  const toward = phase < 0.5 ? '#ffffff' : '#0f172a'
  return mixHex(baseHex, toward, 0.22 + (index % 3) * 0.08)
}

export type StatoAnimoChip = { label: string; chipHex: string }

export type SottocorrenteMeta = {
  colorHex: string
  intervalNote: string
  statiAnimo: StatoAnimoChip[]
}

/** Descrizione breve per corrente (primi periodi da narrativeShort). */
export const CORRENTE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  DISPOSITIONS.map((d) => {
    const t = d.narrativeShort.trim()
    const dot = t.indexOf('.')
    const short = (dot > 0 ? t.slice(0, dot + 1) : t).trim()
    return [d.dispositionId, short]
  }),
)

function buildMetaForKey(rawKey: string, doc: RawDocVisual): SottocorrenteMeta {
  const statiAnimo: StatoAnimoChip[] = doc.lexiconChips.map((label, i) => ({
    label,
    chipHex: chipHexForSottocorrente(doc.accentHex, i),
  }))
  return {
    colorHex: doc.accentHex,
    intervalNote: doc.intervalNote,
    statiAnimo,
  }
}

/** Meta per ogni chiave grezza (allineato a RAW_DOC_VISUAL). */
export const SOTTOCORRENTE_META: Record<string, SottocorrenteMeta> = Object.fromEntries(
  Object.entries(RAW_DOC_VISUAL).map(([key, doc]) => [key, buildMetaForKey(key, doc)]),
)

/** Alias esplicito: stati d'animo strutturati per chip (stesso contenuto di SOTTOCORRENTE_META[].statiAnimo). */
export const SOTTOCORRENTE_STATI_ANIMO: Record<string, StatoAnimoChip[]> = Object.fromEntries(
  Object.entries(SOTTOCORRENTE_META).map(([k, m]) => [k, m.statiAnimo]),
)

export function getSottocorrenteMeta(rawKey: string): SottocorrenteMeta | null {
  return SOTTOCORRENTE_META[rawKey] ?? null
}
