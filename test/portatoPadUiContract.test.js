import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import {
  buildPortatoInterpretation,
  buildPortatoViewData,
} from '../src/utils/portatoPadViewData.js'

const readSource = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('il pad usa il contratto baricentrico e mantiene il fallback dai valori grezzi', async () => {
  const source = await readSource('src/utils/portatoPadViewData.js')

  assert.match(source, /portato\?\.pad\?\.punto/)
  assert.match(source, /portato\?\.quoteNormalizzate/)
  assert.match(source, /TRIANGLE_VERTICES\[dimension\.key\]\.x \* dimension\.share/)
  assert.match(source, /TRIANGLE_VERTICES\[dimension\.key\]\.y \* dimension\.share/)
  assert.match(source, /portato\?\.hasData === false \? false/)
})

test('il fallback riconosce una terna percentuale 77 22 1 sulla stessa scala', () => {
  const viewData = buildPortatoViewData({
    shares: { Sintonia: 77, Distonia: 22, Distanza: 1 },
  })

  assert.equal(viewData.hasData, true)
  assert.deepEqual(viewData.dimensions.map((item) => item.percentage), [77, 22, 1])
  assert.deepEqual(viewData.dimensions.map((item) => item.share), [0.77, 0.22, 0.01])
  assert.equal(viewData.point.x, 26.9)
  assert.equal(viewData.point.y, 8.84)
})

test('la compresenza in terzi coincide con il centro geometrico della griglia', () => {
  const viewData = buildPortatoViewData({
    quoteNormalizzate: {
      Simpatia: 1 / 3,
      Antipatia: 1 / 3,
      Indifferenza: 1 / 3,
    },
  })

  assert.deepEqual(viewData.dimensions.map((item) => item.percentage), [34, 33, 33])
  assert.ok(Math.abs(viewData.point.x - 50) < Number.EPSILON * 64)
  assert.ok(Math.abs(viewData.point.y - 36) < Number.EPSILON * 64)
})

test('il fallback interpreta parità e quasi parità senza inventare una prevalenza', () => {
  const tied = buildPortatoViewData({ shares: { Sintonia: 45, Distonia: 45, Distanza: 10 } })
  const nearTied = buildPortatoViewData({ shares: { Sintonia: 46, Distonia: 44, Distanza: 10 } })
  const tiedText = buildPortatoInterpretation(tied.dimensions)
  const nearTiedText = buildPortatoInterpretation(nearTied.dimensions)

  assert.match(tiedText, /sintonia e distonia sono emerse con intensità simile/)
  assert.match(nearTiedText, /sintonia e distonia sono emerse con intensità simile/)
  assert.doesNotMatch(`${tiedText} ${nearTiedText}`, /ha prevalso/)
})

test('lo stato vuoto non mostra triangolo, puck o vertici a zero', async () => {
  const source = await readSource('src/components/report/SezionePortatoEsperienziale.jsx')
  const positiveDataBlock = source.slice(
    source.indexOf('{viewData.hasData ? ('),
    source.lastIndexOf(') : ('),
  )

  assert.match(positiveDataBlock, /report-tst-portato__figure/)
  assert.match(positiveDataBlock, /report-tst-portato__puck/)
  assert.match(positiveDataBlock, /report-tst-portato__vertex/)
  assert.doesNotMatch(source, /report-tst-portato__figure--empty/)
})

test('il risultato resta leggibile senza affidarsi soltanto al colore', async () => {
  const [source, css] = await Promise.all([
    readSource('src/components/report/SezionePortatoEsperienziale.jsx'),
    readSource('src/styles/report-tst.css'),
  ])

  assert.match(source, /aria-describedby="report-tst-portato-map-summary"/)
  assert.match(source, /className="sr-only">\{chartSummary\}/)
  assert.match(source, /<line x1="50" y1="36" x2="8" y2="8" \/>/)
  assert.match(source, /Sintonia/)
  assert.match(source, /Distonia/)
  assert.match(source, /Distanza/)
  assert.match(source, /aria-expanded=\{isOpen\}/)
  assert.match(source, /report-tst-portato__vertex-percent/)
  assert.match(css, /\.report-tst-portato__vertex:focus-visible/)
})

test('il pad vive nella stanza Portato e usa un solo anchor', async () => {
  const [shell, section] = await Promise.all([
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/components/report/SezionePortatoEsperienziale.jsx'),
  ])

  assert.match(shell, /<RoomRevealContent id="report-tst-portato"/)
  assert.match(shell, /<SezionePortatoEsperienziale/)
  assert.doesNotMatch(shell, /ReportDetailTabs/)
  assert.doesNotMatch(shell, /ReportSectionGroup/)
  assert.doesNotMatch(section, /id="report-tst-portato"/)
})
