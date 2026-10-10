// Dizionario e parser delle parole chiave per i pannelli interattivi della landing page TST

export const PANEL_KEYWORDS = {
  '01': [
    'sensibilità al suono',
    'relazione emotiva',
    'identità emotiva',
    'sentire musicale',
    'ascoltatori',
    'ascoltatore',
    'musicisti',
    'Musica',
    'Test',
  ],
  '02': [
    'flussi sonori organizzati',
    'comunicazione emotiva',
    'educazione emotiva',
    'area del sentire',
    'fasi evolutive',
    'sfera cognitiva',
    'Test sonoro',
    'Musica',
    'Test',
    'TST',
  ],
  '03': [
    'Simpatia, Antipatia e Indifferenza',
    'qualità oggettive',
    'Codice Musicale',
    'area del sentire',
    'struttura emotiva',
    '5 forze emotive',
    'identità emotiva',
    'forme archetipiche',
    'protocollo TST',
    'Timbro, Ritmo, Intervalli, Armonia e Melodia',
    'Malinconia-Nostalgia',
    'Anaffettività',
    'Marzialità',
    'Entusiasmo',
    'Flemma',
    'Timbro',
    'Ritmo',
    'Intervalli',
    'Armonia',
    'Melodia',
  ],
  '04': [
    'sensazioni, emozioni e sentimenti',
    '72 brevi stimoli sonori',
    'percorso di ascolto',
    'stimoli sonori',
    'flussi sonori',
    'Intervalli',
    'Timbri',
    'Melodie',
    'Armonie',
    'Ritmi',
    'TST',
  ],
  '05': [
    'complessità emotiva interiore',
    'identità emotiva individuale',
    'disposizioni dell\'Uomo',
    'complessità emotiva',
    'profilo interiore',
    'flussi musicali',
    'sfera cognitiva',
    'mappa sintetica',
    'disposizioni',
    'Musica',
    'TST',
  ],
  '06': [
    'complessità temperamentale',
    'rapporto con te stesso',
    'rapporto con l\'altro',
    'rapporto con l\'agire',
    'autoconoscenza di Sé',
    'quattro indicatori',
    'report finale TST',
    'natura di base',
    'For Musicians',
    'sfera emotiva',
    'Test',
  ],
  '07': [
    'ricerca, studi e sperimentazioni',
    'Università degli Studi di Pavia',
    'realtà emotiva individuale',
    'comitato scientifico Co2',
    'CPM Music Institute',
    'pannello di accesso',
    'Franco Mussida',
    'Codice Musicale',
  ],
}

/**
 * Normalizza e compila regex sicura per trovare le parole chiave nel testo
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Scompone il testo di un paragrafo in token (testo ordinario e parole chiave),
 * preservando il case originale e garantendo che le parole composte più lunghe
 * abbiano la precedenza.
 */
export function parseParagraphTokens(text, panelNum = '01') {
  if (!text) return []

  const keywords = PANEL_KEYWORDS[panelNum] || PANEL_KEYWORDS['01']
  // Ordina per lunghezza decrescente per matchare prima le frasi composte
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)

  const pattern = new RegExp(
    `(${sortedKeywords.map((k) => escapeRegex(k)).join('|')})`,
    'gi'
  )

  const tokens = []
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    const matchIndex = match.index
    const matchedText = match[0]

    // Testo antecedente alla keyword
    if (matchIndex > lastIndex) {
      tokens.push({
        text: text.slice(lastIndex, matchIndex),
        isKeyword: false,
      })
    }

    // Token keyword interattivo
    tokens.push({
      text: matchedText,
      isKeyword: true,
      keywordKey: matchedText.toLowerCase(),
    })

    lastIndex = matchIndex + matchedText.length
  }

  // Eventuale residuo finale
  if (lastIndex < text.length) {
    tokens.push({
      text: text.slice(lastIndex),
      isKeyword: false,
    })
  }

  return tokens
}
