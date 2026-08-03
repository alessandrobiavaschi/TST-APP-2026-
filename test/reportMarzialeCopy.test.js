import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PROFILE_PDF_BLOCKS } from '../src/reportProfiloPdf.js'
import { getProfiloPanelDisplay } from '../src/utils/profiloDisplayCopy.js'

const EXPECTED_OPENING =
  'Nella famiglia Marziale emerge il piacere Volitivo Collerico del fare, di realizzare ciò che si desidera, di governarsi e mettersi alla prova.'

test('mantiene coerente la descrizione Marziale tra report, fallback e PDF', () => {
  const contentReport = JSON.parse(
    readFileSync(new URL('../src/content_report.json', import.meta.url), 'utf8'),
  )
  const fallback = getProfiloPanelDisplay({
    panelId: 'natura',
    famiglia: 'Rosso',
  })

  assert.ok(contentReport.Rosso.restituzione_caratteri_estesi.startsWith(EXPECTED_OPENING))
  assert.ok(PROFILE_PDF_BLOCKS.Rosso.restituzione_caratteri_estesi.startsWith(EXPECTED_OPENING))
  assert.ok(fallback.blocks[0]?.text.startsWith(EXPECTED_OPENING))
})
