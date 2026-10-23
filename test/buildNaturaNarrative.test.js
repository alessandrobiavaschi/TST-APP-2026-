import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildNaturaNarrative,
  buildRelationBreakdown,
  NATURA_NARRATIVE_STATUS,
  NATURA_RELATION_RULES,
  resolveHarmonyDescriptor,
  resolveInfluenceDescriptor,
  resolveTensionDescriptor,
} from '../src/utils/buildNaturaNarrative.js'

const FAMILY_CASES = [
  // Senza dati di natura della persona si elencano le nature della famiglia (PDF).
  ['blu', 'Malinconica', 'Lunare Introspettiva, Lunare Depressiva, Solare o Nostalgica'],
  ['rosso', 'Marziale', 'Volitiva o Collerica'],
  ['verde', 'Flemmatica', 'Calma Contemplativa o Calma Fisica'],
  ['giallo', 'Entusiasta', 'Gioiosa Solare o Sanguigna Operosa'],
  ['grigio', 'Razionale', 'Anaffettiva o Distaccata'],
]

function radarItem(familyKey, rawValue, distributionPercent, valore) {
  return { familyKey, rawValue, distributionPercent, valore }
}

test('applica la formula editoriale a tutte le famiglie con maiuscole standard', () => {
  FAMILY_CASES.forEach(([familyKey, family, nature]) => {
    const result = buildNaturaNarrative({
      dominantFamilyKey: familyKey,
      ranking: [radarItem(familyKey, 10, 100, 7)],
    })
    const text = result.paragraphs.join(' ')

    assert.equal(result.status, NATURA_NARRATIVE_STATUS.CLEAR)
    assert.equal(result.paragraphs[0], `Nel tuo risultato, la famiglia ${family} ottiene il punteggio più alto ed è quindi la famiglia prevalente.`)
    assert.equal(result.paragraphs[1], `La lettura delle diverse aree del test converge nel riconoscere come ${nature} la tua natura emotiva di base.`)
    assert.equal(result.frontParagraphs.length, 2)
    assert.match(result.frontParagraphs[0], new RegExp(`famiglia ${family}`))
    assert.doesNotMatch(text, /profonda appartenenza|buona armonia/i)
  })
})

test('una opposizione marginale resta nel dettaglio ma non diventa tensione principale', () => {
  const breakdown = buildRelationBreakdown({
    agoFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 40, 40, 7),
      radarItem('blu', 32, 32, 6),
      radarItem('giallo', 19, 19, 3),
      radarItem('verde', 5, 5, 1),
      radarItem('grigio', 4, 4, 1),
    ],
  })

  assert.equal(breakdown.others.some((item) => item.familyKey === 'verde'), true)
  assert.equal(breakdown.tensions.some((item) => item.familyKey === 'verde'), false)
})

test('racconta tutte le componenti di un profilo 7 6 5 e solo le tensioni codificate', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 35, 7),
      radarItem('verde', 12, 30, 6),
      radarItem('giallo', 10, 25, 5),
      radarItem('blu', 2, 5, 1),
      radarItem('grigio', 2, 5, 1),
    ],
  })
  const text = result.paragraphs.join(' ')

  assert.equal(result.status, NATURA_NARRATIVE_STATUS.COMPOSITE)
  assert.deepEqual(result.highlightedFamilies, ['rosso', 'verde', 'giallo'])
  assert.match(text, /famiglia Marziale/)
  assert.match(text, /componente.*Flemmatica/)
  assert.match(text, /componente.*Entusiasta/)
  assert.match(text, /tensione intensa/)
  assert.match(text, /spinta all'azione con il bisogno di pausa/)
  assert.match(text, /slancio e volontà condividono un orientamento dinamico/)
  assert.doesNotMatch(text, /in accordo|buona armonia/i)
})

test('gradua al contrario l influenza delle famiglie successive rispetto alla prevalente', () => {
  assert.equal(resolveInfluenceDescriptor(10), 'marcata')
  assert.equal(resolveInfluenceDescriptor(15), 'discreta')
  assert.equal(resolveInfluenceDescriptor(25), 'moderata')
  assert.equal(resolveInfluenceDescriptor(35), 'leggera')
  assert.equal(resolveInfluenceDescriptor(36), 'blanda')

  const close = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 31, 31, 7),
      radarItem('blu', 23, 23, 5),
      radarItem('giallo', 23, 23, 5),
    ],
  })
  const distant = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 50, 50, 7),
      radarItem('blu', 15, 15, 2),
    ],
  })

  assert.match(close.paragraphs.join(' '), /distanza di 8 punti percentuali.*influenza marcata/i)
  assert.match(distant.paragraphs.join(' '), /distanza di 35 punti percentuali.*influenza leggera/i)
  assert.doesNotMatch(close.paragraphs.join(' '), /certa prevalenza|netta prevalenza/i)
})

test('il racconto in primo piano segue il peso prima delle opposizioni teoriche', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 19, 33.9, 7),
      radarItem('blu', 15, 26.8, 6),
      radarItem('giallo', 12, 21.4, 4),
      radarItem('verde', 7, 12.5, 3),
      radarItem('grigio', 3, 5.4, 1),
    ],
  })

  assert.equal(result.frontParagraphs.length, 4)
  assert.match(result.frontParagraphs[0], /appartenenza alla famiglia Marziale.*Volitiva o Collerica/i)
  assert.match(result.frontParagraphs[1], /natura Malinconica.*riflessione.*consapevole/i)
  assert.doesNotMatch(result.frontParagraphs.join(' '), /natura Flemmatica/i)
  assert.match(result.frontParagraphs[3], /eccellente armonia tra le diverse componenti/i)
  assert.doesNotMatch(result.frontParagraphs.join(' '), /%|punti percentuali/i)
  assert.match(result.paragraphs.join(' '), /quarta componente.*Flemmatica.*influenza moderata.*tensione/i)
  assert.match(result.paragraphs.join(' '), /quinta componente.*Razionale.*influenza leggera.*tensione/i)
})

test('gradua l armonia sull ampiezza delle componenti principali', () => {
  assert.equal(resolveHarmonyDescriptor(10), "un'eccellente armonia")
  assert.equal(resolveHarmonyDescriptor(15), 'una buona armonia')
  assert.equal(resolveHarmonyDescriptor(25), 'una discreta armonia')
  assert.equal(resolveHarmonyDescriptor(35), 'una leggera armonia')
  assert.equal(resolveHarmonyDescriptor(36), 'poca armonia')

  // L'armonia richiede almeno tre famiglie valide (vedi computeHarmonyMetric):
  // gap = media tra |leader-seconda| e |leader-terza|, non piu' max-min.
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 39, 39, 7),
      radarItem('giallo', 31, 31, 5),
      radarItem('verde', 30, 30, 4),
    ],
  })
  assert.match(result.paragraphs.join(' '), /ampiezza di 8,5 punti percentuali.*eccellente armonia/i)

  const decimalResult = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 51.9, 7),
      radarItem('verde', 13, 48.1, 7),
      radarItem('blu', 12, 47.0, 6),
    ],
  })
  assert.match(decimalResult.paragraphs.join(' '), /4,3 punti percentuali/)
  assert.doesNotMatch(decimalResult.paragraphs.join(' '), /999999/)

  const multiFamily = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 50, 50, 7),
      radarItem('blu', 30, 30, 5),
      radarItem('verde', 20, 20, 3),
    ],
  })
  assert.match(
    multiFamily.paragraphs.join(' '),
    /ampiezza di 25 punti percentuali.*discreta armonia/i,
  )
  assert.equal(multiFamily.harmonyBasis, 'mean_gap_from_leader_to_second_and_third')
})

test('l armonia non dipende dall ordine delle componenti ricevute', () => {
  const ordered = buildNaturaNarrative({
    ranking: [
      radarItem('rosso', 50, 50, 7),
      radarItem('blu', 30, 30, 5),
      radarItem('verde', 20, 20, 3),
    ],
  })
  const shuffled = buildNaturaNarrative({
    ranking: [
      radarItem('verde', 20, 20, 3),
      radarItem('rosso', 50, 50, 7),
      radarItem('blu', 30, 30, 5),
    ],
  })

  assert.equal(ordered.harmonyGap, 25)
  assert.equal(shuffled.harmonyGap, ordered.harmonyGap)
  assert.equal(shuffled.harmonyDescriptor, ordered.harmonyDescriptor)
})

test('la percentuale gradua la tensione solo dopo aver verificato la coppia teorica', () => {
  assert.equal(resolveTensionDescriptor(10), 'intensa')
  assert.equal(resolveTensionDescriptor(15), 'significativa')
  assert.equal(resolveTensionDescriptor(25), 'moderata')
  assert.equal(resolveTensionDescriptor(35), 'leggera')
  assert.equal(resolveTensionDescriptor(36), 'blanda')
  assert.equal(NATURA_RELATION_RULES['blu|verde'].kind, 'modulation')
  assert.equal(NATURA_RELATION_RULES['rosso|verde'].kind, 'tension')
  assert.equal(NATURA_RELATION_RULES['giallo|verde'].kind, 'tension')

  const malinconicaConFlemma = buildNaturaNarrative({
    dominantFamilyKey: 'blu',
    ranking: [
      radarItem('blu', 60, 60, 7),
      radarItem('verde', 30, 30, 5),
      radarItem('rosso', 10, 10, 1),
    ],
  })
  const marzialeConFlemma = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 70, 70, 7),
      radarItem('verde', 10, 10, 2),
      radarItem('blu', 20, 20, 3),
    ],
  })

  assert.match(malinconicaConFlemma.paragraphs.join(' '), /calma accompagna l'interiorità senza opporvisi/i)
  assert.doesNotMatch(malinconicaConFlemma.paragraphs.join(' '), /componente Flemmatica.*tensione/i)
  assert.match(marzialeConFlemma.paragraphs.join(' '), /componente.*Flemmatica.*10%.*tensione blanda/i)
})

test('distingue il pari livello grafico dal vero pari punti', () => {
  const roundedTie = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 52, 7),
      radarItem('verde', 13, 48, 7),
    ],
  })
  const trueTie = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 50, 7),
      radarItem('verde', 14, 50, 7),
    ],
  })

  assert.equal(roundedTie.status, NATURA_NARRATIVE_STATUS.ROUNDED_TIE)
  assert.match(roundedTie.paragraphs.join(' '), /per effetto dell'arrotondamento/)
  assert.equal(trueTie.status, NATURA_NARRATIVE_STATUS.TRUE_TIE)
  assert.match(trueTie.paragraphs.join(' '), /14 punti ciascuna/)
  assert.match(trueTie.paragraphs[0], /famiglie Marziale e Flemmatica.*stesso punteggio più alto/i)
  assert.doesNotMatch(trueTie.paragraphs.join(' '), /appartenenza alla famiglia/i)
})

test('racconta le sfumature come attivazioni complessive indipendenti', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [radarItem('rosso', 10, 100, 7)],
    shades: [
      { familyKey: 'rosso', nome: 'Assertività', percentuale: 25, misurabile: true },
      { familyKey: 'rosso', nome: 'Dubbio / Collera', percentuale: 18, misurabile: true },
    ],
  })
  const text = result.paragraphs.join(' ')

  assert.match(text, /Assertività raggiunge il 25%/)
  assert.match(text, /Dubbio \/ Collera raggiunge il 18%/)
  assert.match(text, /non appartengono alla singola lente/)
  assert.match(text, /non devono sommare a 100%/)
})

test('un profilo al 100% non inventa componenti secondarie', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [radarItem('rosso', 10, 100, 7)],
  })
  const text = result.paragraphs.join(' ')

  assert.match(text, /non emergono altre componenti misurate/i)
  assert.match(text, /nessun’altra famiglia ha ottenuto punti/i)
  assert.doesNotMatch(text, /altre famiglie restano presenti|senza escludere le altre/i)
})

test('un vero pari merito racconta le sfumature di entrambe le famiglie', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 50, 7),
      radarItem('verde', 14, 50, 7),
    ],
    shades: [
      { familyKey: 'rosso', nome: 'Assertività', percentuale: 25, misurabile: true },
      { familyKey: 'verde', nome: 'Calma', percentuale: 32, misurabile: true },
    ],
  })
  const text = result.paragraphs.join(' ')

  assert.match(text, /Assertività raggiunge il 25%/)
  assert.match(text, /Calma raggiunge il 32%/)
})

test('un vero pari merito non degrada la famiglia a pari punti a influenza secondaria', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 40, 7),
      radarItem('verde', 14, 40, 7),
      radarItem('blu', 7, 20, 4),
    ],
  })

  assert.doesNotMatch(result.frontParagraphs.join(' '), /seconda componente.*Flemmatica|Flemmatica.*influenza/i)
  assert.match(result.frontParagraphs.join(' '), /famiglie Marziale e Flemmatica/i)
  assert.match(result.frontParagraphs.join(' '), /eccellente armonia/i)
})

test('un vero pari merito senza altre famiglie non nega la componente condivisa', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [
      radarItem('rosso', 14, 50, 7),
      radarItem('verde', 14, 50, 7),
    ],
  })
  const text = result.paragraphs.join(' ')

  assert.equal(result.frontParagraphs.length, 2)
  assert.match(text, /risultato resta condiviso tra le famiglie Marziale e Flemmatica/i)
  assert.doesNotMatch(text, /nessun’altra famiglia ha ottenuto punti|senza altre componenti misurate/i)
  assert.match(result.frontParagraphs.join(' '), /pari peso delle famiglie al vertice/i)
})

test('la graduatoria prevale su una chiave dominante esterna incoerente', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'verde',
    ranking: [radarItem('rosso', 19, 60, 7), radarItem('verde', 12, 40, 4)],
  })

  assert.match(result.frontParagraphs[0], /famiglia Marziale.*Volitiva o Collerica.*prevalenza/i)
  assert.doesNotMatch(result.frontParagraphs[0], /Flemmatica/i)
})

test('uno stato vuoto non attribuisce appartenenza o prevalenza', () => {
  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [radarItem('rosso', 0, 0, 1)],
  })
  const text = result.paragraphs.join(' ')

  assert.equal(result.status, NATURA_NARRATIVE_STATUS.EMPTY)
  assert.match(text, /non sono sufficienti/)
  assert.doesNotMatch(text, /appartenenza|prevalenza della famiglia/i)
})
