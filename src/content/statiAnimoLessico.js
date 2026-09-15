/**
 * Lessico e stati d'animo per famiglia — tracciato ai PDF
 * «parole - STATI D'ANIMO IN 4 FAMIGLIE» e «STATI D'ANIMO IN 4 FAMIGLIE».
 * Testi di lettura integrativa per restituzione ad alta voce.
 */

import { PROFILE_PDF_BLOCKS } from '../reportProfiloPdf.js'
import { GALAXY_THEORY_BY_DISPOSITION } from '../config/galaxyTheoryContent.ts'

const FAMILY_TO_DISPOSITION = {
  Blu: 'malinconica_nostalgica',
  Rosso: 'collerico_volitiva',
  Verde: 'flemmatica',
  Giallo: 'entusiasmo',
  Grigio: 'agnostica_anaffettiva',
}

/** Introduzione fenomenologica (PDF: comune struttura emotiva). */
export const LESSICO_INTRO = [
  'Gli stati d\'animo sono parti della struttura emotiva che la musica illumina ed eccita. In evidenza le parole emerse dal test; aprendo l\'elenco completo trovi le forme nominali (fonte «parole - STATI D\'ANIMO») e gli aggettivi per sotto-corrente (fonte «STATI D\'ANIMO IN 4 FAMIGLIE»).',
]

/** Lettura integrativa per famiglia (restituzione, non manuale). */
const LETTURA_BY_FAMILY = {
  Blu:
    'Emerge il piacere di stare con sé stessi: introversione che non teme la solitudine scelta, luce lunare che rimanda indietro ciò che è stato vissuto. La tristezza è un volto della malinconia, non l\'intera corrente; accanto al chiuso più cupo convivono nostalgia, timore riflesso e una breccia solare verso fiducia e speranza.',
  Rosso:
    'Emerge il piacere del fare nel presente: l\'Io che si mette alla prova, assume responsabilità, cerca ostacoli da superare. La stessa energia che realizza può oscillare verso rigidità e collera quando il dialogo si inceppa — due versanti della volitività, non due persone diverse.',
  Verde:
    'Emerge il piacere della lentezza e del riposo: bonaccia al centro dell\'Energia Emotiva, come l\'occhio del ciclone. La calma flemmatica non è assenza di sentire, ma orientamento verso equilibrio e contemplazione; quando si irrigidisce, la stessa qualità scivola in pigrizia o in evitamento del conflitto.',
  Giallo:
    'Emerge il piacere del movimento verso il fuori: curiosità, scoperta, slancio vitale che premia ogni piccolo successo. La gioia cinetica convive con una passione più profonda — innamoramento, ardore, adesione totale —; insieme costituiscono antidoto al gelo dell\'apatia e dell\'indifferenza.',
  Grigio:
    'Emerge il piacere del calcolo e dell\'oggettività intellettuale: corrente trasversale che può raffreddare l\'affetto o, nel versante maturo, orientare l\'intelletto verso saggezza e dedizione. Due poli della stessa area — distacco nichilista e lucidità etica — convivono nella stessa famiglia.',
}

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
    lettura: LETTURA_BY_FAMILY[familyName] || theory.coreDescription,
    rapportoSe: theory.selfRelation,
    noteMusicali: theory.musicNotes,
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
