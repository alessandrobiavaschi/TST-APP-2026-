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

test('usa «natura» senza «caratteristica» nel copy principale del report', () => {
  assert.match(CONTEXT.body.join(' '), /natura/)
  assert.doesNotMatch(CONTEXT.body.join(' '), /caratteristic/i)
  assert.equal(
    GLOSSARY.find((entry) => entry.id === 'corrente-emotiva')?.term,
    'Natura',
  )
  assert.equal(
    REPORT_SECTIONS.find((section) => section.id === 'report-tst-sintesi')?.label,
    'Natura',
  )

  assert.equal(
    buildProfiloThreadLine({
      profilo: { famigliaLabel: 'Marziale', disposizione: 'Volitivo-collerica' },
    }),
    'Famiglia prevalente: Marziale. Natura: Volitivo-collerica.',
  )

  const facts = buildSintesiKeyFacts({
    profilo: { famigliaLabel: 'Marziale', disposizione: 'Volitivo-collerica' },
  })
  assert.equal(
    facts.find((fact) => fact.id === 'natura')?.label,
    'Natura',
  )

  const heroSource = readFileSync(
    new URL('../src/components/report/HeroScreen.jsx', import.meta.url),
    'utf8',
  )
  const summarySource = readFileSync(
    new URL('../src/components/report/SintesiCorrenti.jsx', import.meta.url),
    'utf8',
  )
  // La prima schermata mostra solo la famiglia: la natura è nella sezione successiva.
  assert.doesNotMatch(heroSource, /Caratteristica emotiva \(natura\)/)
  assert.doesNotMatch(summarySource, /caratteristic/i)
})
