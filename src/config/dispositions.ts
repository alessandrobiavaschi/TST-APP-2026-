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
    narrativeShort:
      'Questa corrente orienta all’interiorità: riflessione, memoria e ascolto profondo di ciò che si è vissuto. Nelle fasi di equilibrio aiuta a dare senso; in fase di sovraccarico può irrigidire nel rimuginio.',
    strengths: ['capacità introspettiva', 'sensibilità al significato', 'fedeltà alla memoria emotiva'],
    growthAreas: ['aprire l’ascolto verso il presente', 'evitare isolamento prolungato'],
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
    narrativeShort:
      'Questa corrente sostiene l’azione e la direzione intenzionale. In forma armonica porta decisione e responsabilità; se sbilanciata può diventare tensione, rigidità o conflitto.',
    strengths: ['determinazione', 'capacità di finalizzare', 'energia nel presente'],
    growthAreas: ['integrare ascolto e pausa', 'ridurre impulsi reattivi nei contrasti'],
  },
  {
    dispositionId: 'flemmatica',
    colorKey: 'verde',
    label: 'Flemmatica',
    colorHex: '#4ade80',
    polarity: 'neutra',
    directionVector: { x: 0.05, y: 0.25, z: -0.2 },
    reportAnchorId: 'report-chapter-ombre',
    rawKeys: ['VERDE_1_Calma'],
    narrativeShort:
      'La corrente flemmatica custodisce calma, lentezza e contemplazione. È una base di equilibrio che aiuta a modulare gli eccessi; se prevale troppo può diventare rinvio o passività.',
    strengths: ['stabilità emotiva', 'prudenza relazionale', 'capacità di creare pausa'],
    growthAreas: ['mantenere iniziativa', 'evitare immobilità difensiva'],
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
    narrativeShort:
      'Questa corrente esprime curiosità, movimento e slancio vitale verso il nuovo. In equilibrio facilita partecipazione e vitalità; in eccesso può frammentare attenzione e continuità.',
    strengths: ['energia esplorativa', 'apertura al nuovo', 'coinvolgimento sociale'],
    growthAreas: ['proteggere continuità e profondità', 'modulare iperattivazione'],
  },
  {
    dispositionId: 'agnostica_anaffettiva',
    colorKey: 'grigio',
    label: 'Razionale',
    colorHex: '#9ca3af',
    polarity: 'trasversale',
    directionVector: { x: -0.55, y: -0.35, z: 0.7 },
    reportAnchorId: 'report-lessico',
    rawKeys: ['GRIGIO_1_Distaccato_Nichilista', 'GRIGIO_2_Intellettuale_Saggio'],
    narrativeShort:
      'Questa corrente introduce distanza osservativa e calcolo. Se ben orientata favorisce lucidità e discernimento; se estrema può raffreddare i legami e ridurre il coinvolgimento affettivo.',
    strengths: ['capacità analitica', 'distacco regolativo', 'chiarezza decisionale'],
    growthAreas: ['riattivare contatto affettivo', 'evitare indifferenza protettiva'],
  },
]

export const POLARITY_LABEL = {
  centripeta: 'Verso l’interiorità',
  centrifuga: 'Verso il mondo esterno',
  neutra: 'Asse di equilibrio',
  trasversale: 'Asse trasversale',
}
