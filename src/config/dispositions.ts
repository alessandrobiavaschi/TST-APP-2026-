import { getSintesiFamiglia } from '../content/testiFissiTemperamenti.js'

/** `narrativeShort`: prima frase del testo di famiglia dai «Testi fissi». */
export const DISPOSITIONS = [
  {
    dispositionId: 'malinconica_nostalgica',
    colorKey: 'blu',
    label: 'Malinconica',
    colorHex: '#60a5fa',
    polarity: 'centripeta',
    directionVector: { x: -0.8, y: 0.12, z: -0.9 },
    reportAnchorId: 'report-chapter-natura',
    rawKeys: ['BLU_1_Depressiva', 'BLU_2_Lunare', 'BLU_3_Nostalgia', 'BLU_4_Solare'],
    narrativeShort: getSintesiFamiglia('blu'),
  },
  {
    dispositionId: 'collerico_volitiva',
    colorKey: 'rosso',
    label: 'Marziale',
    colorHex: '#f87171',
    polarity: 'centrifuga',
    directionVector: { x: 0.95, y: -0.15, z: 0.35 },
    reportAnchorId: 'report-chapter-risorse',
    rawKeys: ['ROSSO_1_Assertivita', 'ROSSO_2_Dubbio_Collera'],
    narrativeShort: getSintesiFamiglia('rosso'),
  },
  {
    dispositionId: 'flemmatica',
    colorKey: 'verde',
    label: 'Flemmatica',
    colorHex: '#4ade80',
    polarity: 'neutra',
    directionVector: { x: 0.05, y: 0.25, z: -0.2 },
    reportAnchorId: 'report-chapter-ombre',
    rawKeys: ['VERDE_1_CalmaContemplativa', 'VERDE_2_CalmaFisica'],
    narrativeShort: getSintesiFamiglia('verde'),
  },
  {
    dispositionId: 'entusiasmo',
    colorKey: 'giallo',
    label: 'Entusiasta',
    colorHex: '#fde047',
    polarity: 'centrifuga',
    directionVector: { x: 0.45, y: -0.55, z: 0.95 },
    reportAnchorId: 'report-chapter-racconto',
    rawKeys: ['GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale'],
    narrativeShort: getSintesiFamiglia('giallo'),
  },
  {
    dispositionId: 'agnostica_anaffettiva',
    colorKey: 'grigio',
    label: 'Razionale',
    colorHex: '#9ca3af',
    polarity: 'trasversale',
    directionVector: { x: -0.55, y: -0.35, z: 0.7 },
    reportAnchorId: 'report-lessico',
    rawKeys: ['GRIGIO_1_Anaffettiva', 'GRIGIO_2_Distaccata'],
    narrativeShort: getSintesiFamiglia('grigio'),
  },
]

export const POLARITY_LABEL = {
  centripeta: 'Verso l’interiorità',
  centrifuga: 'Verso il mondo esterno',
  neutra: 'Asse di equilibrio',
  trasversale: 'Asse trasversale',
}
