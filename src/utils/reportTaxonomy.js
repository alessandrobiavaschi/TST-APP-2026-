export const MALINCONICA_NOSTALGICA_LABEL = 'Nostalgica (Solare o Lunare)'

const normalizeTaxonomyLabel = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')

const NOSTALGICA_LEGACY_LABELS = new Set([
  'nostalgia',
  'nostalgica',
  'nostalgico',
  'nostalgicosolareolunare',
  'nostalgicasolareolunare',
])

/**
 * Presenta la tassonomia corrente senza migrare i valori storici salvati.
 * La famiglia resta Malinconica; Nostalgica è una natura e può
 * articolarsi in forma Solare o Lunare.
 */
export function formatSubcategoryLabel(value = '') {
  const normalized = normalizeTaxonomyLabel(value)
  if (NOSTALGICA_LEGACY_LABELS.has(normalized)) return MALINCONICA_NOSTALGICA_LABEL
  return String(value || '').trim()
}
