import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildActionNarrative,
  buildOtherNarrative,
  buildSelfNarrative,
  resolveActionPropensity,
  resolveRelationalOpenness,
} from '../src/utils/buildFourRelationsNarrative.js'

function item(familyKey, distributionPercent, rawValue = distributionPercent, valore = 5) {
  return { familyKey, distributionPercent, rawValue, valore }
}

const marzialeProfile = [
  item('rosso', 31, 31, 7),
  item('blu', 23, 23, 5),
  item('giallo', 23, 23, 5),
  item('verde', 13, 13, 3),
  item('grigio', 10, 10, 2),
]

test('Sé separa osservazione Malinconica e armonia con la famiglia dominante', () => {
  const result = buildSelfNarrative({
    dominantFamilyKey: 'rosso',
    ranking: marzialeProfile,
  })
  const text = result.paragraphs.join(' ')

  assert.equal(result.metrics.awarenessPercent, 23)
  assert.equal(result.metrics.harmonyPercent, 31)
  assert.equal(result.metrics.relationKind, 'compensation')
  assert.match(result.levelLabel, /Consapevolezza discreta.*armonia buona/i)
  assert.match(text, /Malinconica raggiunge il 23%/)
  assert.match(text, /Marziale.*raggiunge il 31%/)
  assert.match(text, /compensazione/)
  assert.doesNotMatch(text, /una ottima/i)
})

test('Sé dichiara la convergenza quando la natura dominante è Malinconica', () => {
  const result = buildSelfNarrative({
    dominantFamilyKey: 'blu',
    ranking: [item('blu', 42), item('rosso', 25), item('giallo', 18)],
  })

  assert.equal(result.metrics.sameFamily, true)
  assert.match(result.paragraphs.join(' '), /convergono nello stesso valore.*non sono due misure indipendenti/i)
})

test('Altro legge insieme presenza Entusiasta e distanza dalla famiglia dominante', () => {
  const close = buildOtherNarrative({ dominantFamilyKey: 'rosso', ranking: marzialeProfile })
  const distant = buildOtherNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [item('rosso', 55), item('giallo', 8), item('blu', 20), item('verde', 10), item('grigio', 7)],
  })

  assert.equal(close.metrics.deficit, 8)
  assert.equal(close.metrics.grade, 4)
  assert.match(close.levelLabel, /Ottima propensione/)
  assert.match(close.paragraphs.join(' '), /Entusiasmo.*23%.*Marziale.*31%.*8 punti percentuali/i)
  assert.match(close.paragraphs.join(' '), /affinità dinamica/i)

  assert.equal(distant.metrics.deficit, 47)
  assert.equal(distant.metrics.grade, 1)
  assert.match(distant.levelLabel, /parziale/i)
  assert.match(distant.paragraphs.join(' '), /Entusiasmo.*8%.*Marziale.*55%.*47 punti percentuali/i)
})

test('Altro applica un limite quando l Entusiasmo assoluto è debole', () => {
  assert.equal(resolveRelationalOpenness({ dominantPercent: 8, enthusiasmPercent: 7 }).grade, 1)
  assert.equal(resolveRelationalOpenness({ dominantPercent: 31, enthusiasmPercent: 23 }).grade, 4)
})

test('Altro distingue uno svantaggio da un vantaggio dell Entusiasmo', () => {
  const result = buildOtherNarrative({
    dominantFamilyKey: 'rosso',
    ranking: [item('rosso', 25), item('giallo', 40), item('blu', 20)],
  })
  const text = result.paragraphs.join(' ')

  assert.equal(result.metrics.signedDifference, -15)
  assert.match(text, /Entusiasmo supera la componente Marziale di 15 punti percentuali/i)
  assert.doesNotMatch(text, /a sfavore dell'Entusiasmo/i)
})

test('Altro applica la matrice a tutte le famiglie e gestisce la coincidenza Entusiasta', () => {
  const expected = [
    ['blu', 'modulation'],
    ['rosso', 'affinity'],
    ['verde', 'tension'],
    ['grigio', 'tension'],
  ]
  expected.forEach(([dominantFamilyKey, relationKind]) => {
    const result = buildOtherNarrative({ dominantFamilyKey, ranking: marzialeProfile })
    assert.equal(result.metrics.relationKind, relationKind)
  })

  const entusiasta = buildOtherNarrative({
    dominantFamilyKey: 'giallo',
    ranking: [item('giallo', 42), item('rosso', 25), item('blu', 18)],
  })
  assert.equal(entusiasta.metrics.sameFamily, true)
  assert.match(entusiasta.paragraphs.join(' '), /famiglia di base e il fattore relazionale coincidono/i)
  assert.doesNotMatch(entusiasta.paragraphs.join(' '), /Entusiasta ed Entusiasta/i)
})

test('Agire applica le soglie percentuali concordate per la componente Marziale', () => {
  assert.equal(resolveActionPropensity(9).adjective, 'molto bassa')
  assert.equal(resolveActionPropensity(10).adjective, 'parziale')
  assert.equal(resolveActionPropensity(20).adjective, 'discreta')
  assert.equal(resolveActionPropensity(31).adjective, 'buona')
  assert.equal(resolveActionPropensity(40).adjective, 'spiccata')
  assert.equal(resolveActionPropensity(50).adjective, 'eccezionalmente alta')

  const result = buildActionNarrative({ dominantFamilyKey: 'rosso', ranking: marzialeProfile })
  const text = result.paragraphs.join(' ')
  assert.match(result.levelLabel, /Buona propensione all'azione/)
  assert.match(text, /natura Volitivo-collerica ha un rapporto simbiotico con la volontà/)
  assert.match(text, /Marziale raggiunge il 31%/)
  assert.match(text, /buona propensione all'azione/)
})

test('Agire modula il testo secondo tutte le famiglie di base', () => {
  const cases = [
    ['blu', /natura Lunare.*compensando/i],
    ['verde', /natura Contemplativa.*tensione/i],
    ['giallo', /natura di tipo Gioioso-sanguinico.*nuove possibilità/i],
    ['grigio', /natura Intellettuale-razionale.*calcolo e controllo/i],
  ]

  cases.forEach(([dominantFamilyKey, expectation]) => {
    const result = buildActionNarrative({ dominantFamilyKey, ranking: marzialeProfile })
    assert.match(result.paragraphs.join(' '), expectation)
  })
})

test('le tre lenti restituiscono uno stato esplicito quando non esistono punti reali', () => {
  const ranking = [item('rosso', 0, 0, 1), item('blu', 0, 0, 1), item('giallo', 0, 0, 1)]
  ;[
    buildSelfNarrative({ dominantFamilyKey: 'rosso', ranking }),
    buildOtherNarrative({ dominantFamilyKey: 'rosso', ranking }),
    buildActionNarrative({ dominantFamilyKey: 'rosso', ranking }),
  ].forEach((result) => {
    assert.equal(result.status, 'empty')
    assert.equal(result.levelLabel, 'Dati insufficienti')
  })
})
