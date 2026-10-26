/**
 * Sommario del For Musicians.
 *
 * I titoli dei capitoli tratti dal libro sono quelli dell'indice di
 * «Il Pianeta della Musica» (Franco Mussida, ed. 2026), con le pagine stampate.
 * Il primo e l'ultimo capitolo leggono le risposte del test.
 */

import { TEMPERAMENTI_MUSICA } from '../content/musicistiTemperamenti.js'

const FONTE_LIBRO = 'Il Pianeta della Musica'

/** Provenienza mostrata sulla scheda del capitolo. */
export const PROVENIENZA = Object.freeze({
  test: 'Dal tuo test',
  libro: 'Dal libro',
})

// Nome del temperamento come lo usa il libro e pagine delle due schede: vedi
// content/musicistiTemperamenti.js. Il libro non ha queste schede per il continente
// del dubbio (Grigio): lì i due capitoli vengono omessi.
const TEMPERAMENTO_LIBRO = Object.fromEntries(
  Object.entries(TEMPERAMENTI_MUSICA).map(([famiglia, t]) => [
    famiglia,
    { aggettivo: t.aggettivo, predilige: t.predilige.pagine, piaceri: t.piaceri.pagine },
  ]),
)

const pagine = (p) => `${FONTE_LIBRO}, ${p.includes('–') ? 'pp.' : 'p.'} ${p}`

function capitoloLibro(voce, numero) {
  const { pagine: pp, shortLabel } = voce
  return { ...voce, label: `${numero}. ${shortLabel}`, subtitle: pagine(pp), readingFocus: PROVENIENZA.libro }
}

/**
 * Capitoli del For Musicians per la famiglia prevalente (chiave colore: 'Blu', 'Rosso', ...).
 * La numerazione segue i capitoli effettivamente mostrati.
 */
export function getMusicianRooms(famiglia = '') {
  const temperamento = TEMPERAMENTO_LIBRO[famiglia] || null
  const voci = [
    {
      id: 'fm-impronta',
      shortLabel: 'Il tuo test',
      title: 'Il tuo test nel codice musicale',
      subtitle: 'Le tue risposte lette nei cinque elementi: timbro, ritmo, melodia, intervallo, armonia.',
      readingFocus: PROVENIENZA.test,
    },
    temperamento && {
      id: 'fm-predilige',
      testo: TEMPERAMENTI_MUSICA[famiglia].predilige.paragrafi,
      shortLabel: 'Che Musica predilige',
      title: `Che Musica predilige il temperamento ${temperamento.aggettivo}`,
      pagine: temperamento.predilige,
    },
    temperamento && {
      id: 'fm-piaceri',
      testo: TEMPERAMENTI_MUSICA[famiglia].piaceri.paragrafi,
      shortLabel: 'I piaceri dell’ascolto',
      title: `I piaceri del temperamento ${temperamento.aggettivo} quando ascolta Musica`,
      pagine: temperamento.piaceri,
    },
    { id: 'fm-timbro', shortLabel: 'Timbro', title: 'Timbro: l’identità del suono', pagine: '80–87' },
    { id: 'fm-ritmo', shortLabel: 'Ritmo', title: 'Ritmo: la memoria del movimento', pagine: '88–99' },
    { id: 'fm-melodia', shortLabel: 'Melodia', title: 'Melodia: le linee del racconto musicale', pagine: '100–105' },
    { id: 'fm-distanze', shortLabel: 'Intervallo', title: 'Intervallo: il fiammifero che accende il sentire', pagine: '106–124' },
    { id: 'fm-armonia', shortLabel: 'Armonia', title: 'Armonia: il piacere di contemplare, sognare a occhi aperti', pagine: '125–136' },
    { id: 'fm-due-famiglie', shortLabel: 'Un suono per due famiglie', title: 'Un suono per due famiglie', pagine: '280–286' },
    { id: 'fm-ascolto', shortLabel: 'Ascolto consapevole', title: 'Metodo per l’Ascolto emotivo consapevole', pagine: '211–259' },
    {
      id: 'fm-passi',
      shortLabel: '72 ascolti',
      title: 'I 72 ascolti del test',
      subtitle: 'Tutti i suoni del test, con la risposta che hai indicato per ciascuno.',
      readingFocus: PROVENIENZA.test,
    },
  ].filter(Boolean)

  return voci.map((voce, i) =>
    voce.pagine
      ? capitoloLibro(voce, i + 1)
      : { ...voce, label: `${i + 1}. ${voce.shortLabel}` },
  )
}

/** Sommario di default (famiglia non nota): senza i due capitoli della famiglia. */
export const MUSICIAN_ROOMS = getMusicianRooms()

export const MUSICIAN_INDEX_UI = {
  title: 'I capitoli della lettura musicale',
  lead: 'Il primo capitolo legge le tue risposte al test. I successivi seguono «Il Pianeta della Musica» di Franco Mussida, con le pagine di riferimento.',
  backToReport: '← Torna al report principale',
  continuousBanner: 'Modalità continua attiva (scorrimento unico della lettura musicale)',
  backToChapters: 'Passa a lettura per capitoli',
}
