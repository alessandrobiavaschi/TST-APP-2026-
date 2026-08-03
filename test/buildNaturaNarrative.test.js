import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildNaturaNarrative,
  NATURA_NARRATIVE_STATUS,
  NATURA_RELATION_RULES,
  resolveHarmonyDescriptor,
  resolvePrevalenceDescriptor,
  resolveTensionDescriptor,
} from '../src/utils/buildNaturaNarrative.js'

const FAMILY_CASES = [
  ['blu', 'Malinconica', 'Lunare'],
  ['rosso', 'Marziale', 'Volitivo-collerica'],
  ['verde', 'Flemmatica', 'Contemplativa'],
  ['giallo', 'Entusiasta', 'Gioioso-sanguinico'],
  ['grigio', 'Razionale', 'Intellettuale-razionale'],
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
    assert.equal(result.paragraphs[0], `Il test conferma la tua appartenenza alla famiglia ${family}.`)
    assert.equal(result.paragraphs[1], `La lettura delle diverse aree del test converge nel riconoscere come ${nature} la tua natura emotiva di base.`)
    assert.doesNotMatch(text, /profonda appartenenza|buona armonia/i)
  })
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
  assert.match(text, /componente Flemmatica/)
  assert.match(text, /componente Entusiasta/)
  assert.match(text, /tensione significativa/)
  assert.match(text, /spinta all'azione con il bisogno di pausa/)
  assert.match(text, /slancio e volontà condividono un orientamento dinamico/)
  assert.doesNotMatch(text, /in accordo|buona armonia/i)
})

test('gradua la prevalenza sulla distanza percentuale tra prima e seconda famiglia', () => {
  assert.equal(resolvePrevalenceDescriptor(10), 'certa')
  assert.equal(resolvePrevalenceDescriptor(20), 'discreta')
  assert.equal(resolvePrevalenceDescriptor(30), 'chiara')
  assert.equal(resolvePrevalenceDescriptor(40), 'marcata')
  assert.equal(resolvePrevalenceDescriptor(41), 'netta')

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

  assert.match(close.paragraphs.join(' '), /una certa prevalenza.*8 punti percentuali/i)
  assert.match(distant.paragraphs.join(' '), /una marcata prevalenza.*35 punti percentuali/i)
})

test('gradua l armonia sulla distanza tra le due componenti principali', () => {
  assert.equal(resolveHarmonyDescriptor(9), "un'eccellente armonia")
  assert.equal(resolveHarmonyDescriptor(10), 'una buona armonia')
  assert.equal(resolveHarmonyDescriptor(20), 'una buona armonia')
  assert.equal(resolveHarmonyDescriptor(21), "un'armonia fragile")
  assert.equal(resolveHarmonyDescriptor(31), 'una scarsa armonia')
  assert.equal(resolveHarmonyDescriptor(41), "un'armonia molto scarsa")

  const result = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [radarItem('rosso', 31, 31, 7), radarItem('giallo', 23, 23, 5)],
  })
  assert.match(result.paragraphs.join(' '), /distanza di 8 punti percentuali.*eccellente armonia/i)

  const decimalResult = buildNaturaNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [radarItem('rosso', 14, 51.9, 7), radarItem('verde', 13, 48.1, 7)],
  })
  assert.match(decimalResult.paragraphs.join(' '), /3,8 punti percentuali/)
  assert.doesNotMatch(decimalResult.paragraphs.join(' '), /999999/)
})

test('la percentuale gradua la tensione solo dopo aver verificato la coppia teorica', () => {
  assert.equal(resolveTensionDescriptor(10), 'leggera')
  assert.equal(resolveTensionDescriptor(20), 'moderata')
  assert.equal(resolveTensionDescriptor(30), 'significativa')
  assert.equal(resolveTensionDescriptor(40), 'marcata')
  assert.equal(resolveTensionDescriptor(41), 'molto intensa')
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
  assert.match(marzialeConFlemma.paragraphs.join(' '), /tensione leggera.*componente Flemmatica.*10%/i)
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
  assert.match(trueTie.paragraphs[0], /appartenenza condivisa.*Marziale.*Flemmatica/i)
  assert.doesNotMatch(trueTie.paragraphs.join(' '), /conferma la tua appartenenza alla famiglia/i)
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
