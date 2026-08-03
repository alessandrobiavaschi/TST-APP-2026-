import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  CONTEXT,
  GLOSSARY,
  buildProfiloThreadLine,
  buildSintesiKeyFacts,
} from '../src/content/reportRestitution.js'
import { REPORT_SECTIONS } from '../src/components/report/reportSectionsConfig.js'

test('usa natura (caratteristica emotiva) nel copy principale del report', () => {
  assert.match(CONTEXT.body.join(' '), /natura \(caratteristica emotiva\)/)
  assert.equal(
    GLOSSARY.find((entry) => entry.id === 'corrente-emotiva')?.term,
    'Natura (caratteristica emotiva)',
  )
  assert.equal(
    REPORT_SECTIONS.find((section) => section.id === 'report-tst-sintesi')?.label,
    'Natura (caratteristica emotiva)',
  )

  assert.equal(
    buildProfiloThreadLine({
      profilo: { famigliaLabel: 'Marziale', disposizione: 'Volitivo-collerica' },
    }),
    'Famiglia prevalente: Marziale. Natura (caratteristica emotiva): Volitivo-collerica.',
  )

  const facts = buildSintesiKeyFacts({
    profilo: { famigliaLabel: 'Marziale', disposizione: 'Volitivo-collerica' },
  })
  assert.equal(
    facts.find((fact) => fact.id === 'natura')?.label,
    'Natura (caratteristica emotiva)',
  )

  const heroSource = readFileSync(
    new URL('../src/components/report/HeroScreen.jsx', import.meta.url),
    'utf8',
  )
  const summarySource = readFileSync(
    new URL('../src/components/report/SintesiCorrenti.jsx', import.meta.url),
    'utf8',
  )
  assert.match(heroSource, /Natura \(caratteristica emotiva\): \{naturaText\}/)
  assert.doesNotMatch(heroSource, /Caratteristica emotiva \(natura\)/)
  assert.match(summarySource, /nature \(caratteristiche emotive\)/)
  assert.doesNotMatch(summarySource, /caratteristica emotiva\s*\n\s*\(natura\)/i)
})
