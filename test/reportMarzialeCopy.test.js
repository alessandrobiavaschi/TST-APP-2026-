import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { PROFILE_PDF_BLOCKS } from '../src/reportProfiloPdf.js'
import { getProfiloPanelDisplay } from '../src/utils/profiloDisplayCopy.js'

const EXPECTED_COPY =
  'Nella famiglia Marziale emerge il piacere del fare, di realizzare ciò che si desidera, di governarsi e mettersi alla prova. Le sottocategorie Volitiva e Collerica prediligono assertività, costanza, sincerità e impegno nel qui e ora, con orientamento al presente.'

test('mantiene coerente la descrizione Marziale tra report, fallback e PDF', () => {
  const contentReport = JSON.parse(
    readFileSync(new URL('../src/content_report.json', import.meta.url), 'utf8'),
  )
  const fallback = getProfiloPanelDisplay({
    panelId: 'natura',
    famiglia: 'Rosso',
  })

  assert.equal(contentReport.Rosso.restituzione_caratteri_estesi, EXPECTED_COPY)
  assert.equal(PROFILE_PDF_BLOCKS.Rosso.restituzione_caratteri_estesi, EXPECTED_COPY)
  assert.equal(fallback.blocks[0]?.text, EXPECTED_COPY)
})
