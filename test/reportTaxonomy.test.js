import assert from 'node:assert/strict'
import test from 'node:test'

import { FAMILY_THEME } from '../src/config/reportFamilyTheme.js'
import reportContent from '../src/content_report.json' with { type: 'json' }
import { getRelationalCorpusForDominant } from '../src/content/relational/index.js'
import {
  MALINCONICA_NOSTALGICA_LABEL,
  formatSubcategoryLabel,
} from '../src/utils/reportTaxonomy.js'

const EXPECTED_TAXONOMY = {
  Blu: ['Malinconica', 'LUNARE'],
  Rosso: ['Marziale', 'VOLITIVO-COLLERICA'],
  Verde: ['Flemmatica', 'CONTEMPLATIVA'],
  Giallo: ['Entusiasta', 'GIOIOSO-SANGUINICO'],
  Grigio: ['Razionale', 'INTELLETTUALE-RAZIONALE'],
}

test('separa le cinque famiglie dalle rispettive nature emotive', () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(FAMILY_THEME).map(([color, theme]) => [
        color,
        [theme.family, theme.characteristic],
      ]),
    ),
    EXPECTED_TAXONOMY,
  )
})

test('mantiene allineati tema e vocabolario narrativo del report', () => {
  Object.entries(EXPECTED_TAXONOMY).forEach(([color, [family, characteristic]]) => {
    assert.equal(FAMILY_THEME[color].corrente, family)
    assert.equal(reportContent[color].restituzione_caratteri, characteristic)
    assert.match(reportContent[color].restituzione_caratteri_estesi, new RegExp(`famiglia ${family}`, 'i'))
  })
})

test('riconosce la natura Gioioso-Sanguinico mantenendo la compatibilità con il legacy Solare', () => {
  assert.equal(
    getRelationalCorpusForDominant('Gioioso-Sanguinico').corpusKey,
    getRelationalCorpusForDominant('Solare').corpusKey,
  )
  assert.notEqual(FAMILY_THEME.Giallo.characteristic, 'SOLARE')
})

test('presenta la natura Nostalgica come Solare o Lunare senza rompere i valori storici', () => {
  assert.equal(formatSubcategoryLabel('Nostalgica'), MALINCONICA_NOSTALGICA_LABEL)
  assert.equal(formatSubcategoryLabel('Nostalgia'), MALINCONICA_NOSTALGICA_LABEL)
  assert.match(reportContent.Blu.descrizione_estesa, /natura Nostalgica \(solare o lunare\)/i)
})
