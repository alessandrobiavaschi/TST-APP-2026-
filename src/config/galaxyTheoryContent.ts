/**
 * Contenuti teorici della Galassia derivati ESCLUSIVAMENTE dai PDF
 * «Testi fissi — Temperamenti» e «Parole per TST» (Franco Mussida).
 *
 * AGGIORNAMENTO: titoli, etichette di famiglia, `coreDescription` e `description`
 * delle nature vengono ora dai «Testi fissi» (content/testiFissiTemperamenti.js);
 * gli elenchi `states` dal PDF «Parole per TST» (content/paroleTst.js).
 * Rimossi `selfRelation`, `musicNotes` e l'introduzione teorica delle vecchie
 * fonti: nessun testo di famiglia/natura arriva più da documenti diversi dai due PDF.
 */

import { getAggettiviForRawKey, getNaturaByRawKey } from '../content/paroleTst.js'
import { getNaturaByCampo } from './tstSistema.js'
import { getTestoFamiglia, getTestoNatura } from '../content/testiFissiTemperamenti.js'

/** Intervallo/parametro: si legge sempre dal sistema unico (config/tstSistema.js). */
const intervalloDi = (rawKey: string): string => getNaturaByCampo(rawKey)?.intervallo || ''

/** Titolo e descrizione di natura/famiglia: SOLO dai «Testi fissi» (content/testiFissiTemperamenti.js). */
// Nome della natura come nel PDF «Parole per TST» (es. «Natura Lunare — Depressiva»).
const titoloNatura = (rawKey: string): string => getNaturaByRawKey(rawKey)?.nome || getTestoNatura(rawKey)?.titolo || ''
const testoNatura = (rawKey: string): string => getTestoNatura(rawKey)?.testo || ''
const etichettaFamiglia = (colorKey: string): string =>
  (getTestoFamiglia(colorKey)?.titolo || '').replace(/^La famiglia /, 'Famiglia ')
const testoFamiglia = (colorKey: string): string => (getTestoFamiglia(colorKey)?.testo || []).join('\n\n')

export type GalaxyTheoryCurrent = {
  rawKey: string
  title: string
  interval: string
  color: string
  description: string
  states: string[]
}

export type GalaxyTheoryFamily = {
  dispositionId: string
  familyLabel: string
  coreDescription: string
  currents: GalaxyTheoryCurrent[]
}

export const GALAXY_THEORY_BY_DISPOSITION: Record<string, GalaxyTheoryFamily> = {
  malinconica_nostalgica: {
    dispositionId: 'malinconica_nostalgica',
    familyLabel: etichettaFamiglia('blu'),
    coreDescription: testoFamiglia('blu'),
    currents: [
      {
        rawKey: 'BLU_1_Depressiva',
        title: titoloNatura('BLU_1_Depressiva'),
        interval: intervalloDi('BLU_1_Depressiva'),
        color: 'Blu notte / Blu scuro',
        description: testoNatura('BLU_1_Depressiva'),
        states: getAggettiviForRawKey('BLU_1_Depressiva'),
      },
      {
        rawKey: 'BLU_2_Lunare',
        title: titoloNatura('BLU_2_Lunare'),
        interval: intervalloDi('BLU_2_Lunare'),
        color: 'Blu medio',
        description: testoNatura('BLU_2_Lunare'),
        states: getAggettiviForRawKey('BLU_2_Lunare'),
      },
      {
        rawKey: 'BLU_3_Nostalgia',
        title: titoloNatura('BLU_3_Nostalgia'),
        interval: intervalloDi('BLU_3_Nostalgia'),
        color: 'Blu reale',
        description: testoNatura('BLU_3_Nostalgia'),
        states: getAggettiviForRawKey('BLU_3_Nostalgia'),
      },
      {
        rawKey: 'BLU_4_Solare',
        title: titoloNatura('BLU_4_Solare'),
        interval: intervalloDi('BLU_4_Solare'),
        color: 'Celeste',
        description: testoNatura('BLU_4_Solare'),
        states: getAggettiviForRawKey('BLU_4_Solare'),
      },
    ],
  },
  collerico_volitiva: {
    dispositionId: 'collerico_volitiva',
    familyLabel: etichettaFamiglia('rosso'),
    coreDescription: testoFamiglia('rosso'),
    currents: [
      {
        rawKey: 'ROSSO_1_Assertivita',
        title: titoloNatura('ROSSO_1_Assertivita'),
        interval: intervalloDi('ROSSO_1_Assertivita'),
        color: 'Rosso',
        description: testoNatura('ROSSO_1_Assertivita'),
        states: getAggettiviForRawKey('ROSSO_1_Assertivita'),
      },
      {
        rawKey: 'ROSSO_2_Dubbio_Collera',
        title: titoloNatura('ROSSO_2_Dubbio_Collera'),
        interval: intervalloDi('ROSSO_2_Dubbio_Collera'),
        color: 'Amaranto',
        description: testoNatura('ROSSO_2_Dubbio_Collera'),
        states: getAggettiviForRawKey('ROSSO_2_Dubbio_Collera'),
      },
    ],
  },
  flemmatica: {
    dispositionId: 'flemmatica',
    familyLabel: etichettaFamiglia('verde'),
    coreDescription: testoFamiglia('verde'),
    currents: [
      {
        rawKey: 'VERDE_1_CalmaContemplativa',
        title: titoloNatura('VERDE_1_CalmaContemplativa'),
        interval: intervalloDi('VERDE_1_CalmaContemplativa'),
        color: 'Verde',
        description: testoNatura('VERDE_1_CalmaContemplativa'),
        states: getAggettiviForRawKey('VERDE_1_CalmaContemplativa'),
      },
      {
        rawKey: 'VERDE_2_CalmaFisica',
        title: titoloNatura('VERDE_2_CalmaFisica'),
        interval: intervalloDi('VERDE_2_CalmaFisica'),
        color: 'Verde',
        description: testoNatura('VERDE_2_CalmaFisica'),
        states: getAggettiviForRawKey('VERDE_2_CalmaFisica'),
      },
    ],
  },
  entusiasmo: {
    dispositionId: 'entusiasmo',
    familyLabel: etichettaFamiglia('giallo'),
    coreDescription: testoFamiglia('giallo'),
    currents: [
      {
        rawKey: 'GIALLO_1_Gioia_Entusiasmo',
        title: titoloNatura('GIALLO_1_Gioia_Entusiasmo'),
        interval: intervalloDi('GIALLO_1_Gioia_Entusiasmo'),
        color: 'Giallo',
        description: testoNatura('GIALLO_1_Gioia_Entusiasmo'),
        states: getAggettiviForRawKey('GIALLO_1_Gioia_Entusiasmo'),
      },
      {
        rawKey: 'GIALLO_2_Volitivo_Passionale',
        title: titoloNatura('GIALLO_2_Volitivo_Passionale'),
        interval: intervalloDi('GIALLO_2_Volitivo_Passionale'),
        color: 'Giallo dorato',
        description: testoNatura('GIALLO_2_Volitivo_Passionale'),
        states: getAggettiviForRawKey('GIALLO_2_Volitivo_Passionale'),
      },
    ],
  },
  agnostica_anaffettiva: {
    dispositionId: 'agnostica_anaffettiva',
    familyLabel: etichettaFamiglia('grigio'),
    coreDescription: testoFamiglia('grigio'),
    currents: [
      {
        rawKey: 'GRIGIO_1_Anaffettiva',
        title: titoloNatura('GRIGIO_1_Anaffettiva'),
        interval: intervalloDi('GRIGIO_1_Anaffettiva'),
        color: 'Grigio',
        description: testoNatura('GRIGIO_1_Anaffettiva'),
        states: getAggettiviForRawKey('GRIGIO_1_Anaffettiva'),
      },
      {
        rawKey: 'GRIGIO_2_Distaccata',
        title: titoloNatura('GRIGIO_2_Distaccata'),
        interval: intervalloDi('GRIGIO_2_Distaccata'),
        color: 'Grigio chiaro',
        description: testoNatura('GRIGIO_2_Distaccata'),
        states: getAggettiviForRawKey('GRIGIO_2_Distaccata'),
      },
    ],
  },
}

const THEORY_BY_RAW_KEY = Object.values(GALAXY_THEORY_BY_DISPOSITION).reduce<Record<string, GalaxyTheoryCurrent>>(
  (acc, family) => {
    family.currents.forEach((current) => {
      acc[current.rawKey] = current
    })
    return acc
  },
  {},
)

export function getGalaxyTheoryForDisposition(dispositionId: string): GalaxyTheoryFamily | null {
  return GALAXY_THEORY_BY_DISPOSITION[dispositionId] ?? null
}

export function getGalaxyTheoryForRawKey(rawKey: string): GalaxyTheoryCurrent | null {
  return THEORY_BY_RAW_KEY[rawKey] ?? null
}
