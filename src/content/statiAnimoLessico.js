/**
 * Lessico e stati d'animo per famiglia.
 * Parole: SOLO dal PDF «Parole per TST» (content/paroleTst.js, via reportProfiloPdf
 * e galaxyTheoryContent). Lettura di famiglia e descrizioni di natura: SOLO dai
 * «Testi fissi» (content/testiFissiTemperamenti.js).
 */

import { PROFILE_PDF_BLOCKS } from '../reportProfiloPdf.js'
import { GALAXY_THEORY_BY_DISPOSITION } from '../config/galaxyTheoryContent.ts'
import { getTestoFamiglia } from './testiFissiTemperamenti.js'

const FAMILY_TO_DISPOSITION = {
  Blu: 'malinconica_nostalgica',
  Rosso: 'collerico_volitiva',
  Verde: 'flemmatica',
  Giallo: 'entusiasmo',
  Grigio: 'agnostica_anaffettiva',
}

/** Introduzione fenomenologica (PDF: comune struttura emotiva). */
export const LESSICO_INTRO = [
  'Gli stati d\'animo sono parti della struttura emotiva che la musica illumina ed eccita. In evidenza le parole emerse dal test; aprendo l\'elenco completo trovi le forme nominali e gli aggettivi di ogni natura (fonte «Parole per TST», Franco Mussida).',
]

function buildFamigliaDettaglio(familyName) {
  const dispositionId = FAMILY_TO_DISPOSITION[familyName]
  const theory = GALAXY_THEORY_BY_DISPOSITION[dispositionId]
  const pdf = PROFILE_PDF_BLOCKS[familyName]
  if (!theory) return null

  const vocabolarioForme = Array.isArray(pdf?.lessico) ? pdf.lessico : []
  const sottoCorrenti = theory.currents.map((c) => ({
    id: c.rawKey,
    titolo: c.title,
    intervallo: c.interval,
    colore: c.color,
    descrizione: c.description,
    stati: c.states,
  }))
  const aggettiviSet = new Set()
  for (const sub of sottoCorrenti) {
    for (const stato of sub.stati || []) {
      const t = String(stato || '').trim()
      if (t) aggettiviSet.add(t)
    }
  }
  const vocabolarioAggettivi = [...aggettiviSet]

  return {
    familyName,
    famigliaLabel: theory.familyLabel,
    lettura: getTestoFamiglia(familyName)?.testo?.[0] || theory.coreDescription,
    /** @deprecated usa vocabolarioForme */
    paroleComplete: vocabolarioForme,
    vocabolarioForme,
    vocabolarioAggettivi,
    sottoCorrenti,
  }
}

/** @type {Record<string, ReturnType<typeof buildFamigliaDettaglio>>} */
export const FAMIGLIE_LESSICO = Object.fromEntries(
  ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio'].map((f) => [f, buildFamigliaDettaglio(f)]),
)

export function getFamigliaLessico(familyName) {
  return FAMIGLIE_LESSICO[familyName] || null
}

export function getFullLessicoForFamily(familyName, reportLessico = []) {
  const dettaglio = getFamigliaLessico(familyName)
  const fromPdf = dettaglio?.vocabolarioForme || dettaglio?.paroleComplete || []
  const merged = [...fromPdf]
  for (const w of reportLessico) {
    const t = String(w || '').trim()
    if (t && !merged.some((x) => x.toLowerCase() === t.toLowerCase())) merged.push(t)
  }
  return merged
}
