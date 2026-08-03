import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildNaturaNarrative,
  NATURA_NARRATIVE_STATUS,
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
    assert.match(text, new RegExp(`famiglia ${family}`))
    assert.match(text, new RegExp(`natura ${nature}`))
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
  assert.match(text, /mette in dialogo iniziativa e pausa/)
  assert.match(text, /Si affianca alla componente Marziale/)
  assert.doesNotMatch(text, /in accordo|buona armonia/i)
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
