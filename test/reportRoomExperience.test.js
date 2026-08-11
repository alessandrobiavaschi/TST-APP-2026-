import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readSource = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('la home del report espone le due CTA senza duplicare il flusso del test', async () => {
  const [hero, shell, newTest] = await Promise.all([
    readSource('src/components/report/HeroScreen.jsx'),
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/pages/NewTestPage.jsx'),
  ])

  assert.match(hero, />\s*Leggi il tuo report\s*</)
  assert.match(hero, />\s*Nuovo test\s*</)
  assert.match(hero, /onClick=\{onReadReport\}/)
  assert.match(hero, /onClick=\{onNewTest\}/)
  assert.match(shell, /navigate\('\/nuovo-test', \{ state: \{ startAtProfile: true \} \}\)/)
  assert.match(newTest, /useState\(\(\) => !location\.state\?\.startAtProfile\)/)
})

test('overview e contenuti narrativi sono stanze fullscreen con movimento ridotto', async () => {
  const [shell, room, css] = await Promise.all([
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/components/report/ReportRoom.jsx'),
    readSource('src/styles/report-tst.css'),
  ])

  assert.match(shell, /report-room--overview/)
  assert.match(shell, /report-room--narrative/)
  assert.match(room, /useReducedMotion\(\)/)
  assert.match(room, /whileInView=/)
  assert.match(css, /\.report-room\s*\{[^}]*min-height:\s*calc\(100svh/s)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.report-room/)
  assert.doesNotMatch(css, /scroll-snap-type:\s*[^;]*mandatory/)
})

test('Dettaglio e Musicians restano stanze separate, accessibili e reversibili', async () => {
  const [shell, musicians] = await Promise.all([
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/components/report/ForMusiciansView.jsx'),
  ])

  assert.match(shell, /window\.location\.hash === '#dettaglio'/)
  assert.match(shell, /window\.location\.hash === '#for-musicians'/)
  assert.match(shell, /event\.key === 'Escape'/)
  assert.match(shell, /detailBackButtonRef\.current\?\.focus\(\)/)
  assert.match(shell, /musiciansBackButtonRef\.current\?\.focus\(\)/)
  assert.match(shell, /role="dialog"/)
  assert.match(shell, /inert=\{modalita !== 'dettaglio'/)
  assert.match(musicians, /onClick=\{onBack\}/)
  assert.match(musicians, />\s*Torna al report\s*</)
})

test('Aree sonore compare una sola volta e soltanto in Musicians', async () => {
  const [shell, musicians] = await Promise.all([
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/components/report/ForMusiciansView.jsx'),
  ])

  assert.doesNotMatch(shell, /import\('\.\/ApprofondimentoSezioni/)
  assert.match(shell, /group\.id !== 'report-group-approfondimento'/)
  assert.match(musicians, /import ApprofondimentoSezioni from '\.\/ApprofondimentoSezioni\.jsx'/)
  assert.equal((musicians.match(/<ApprofondimentoSezioni/g) || []).length, 1)
  assert.equal((musicians.match(/<SezioneMusica/g) || []).length, 1)
})

test('gli stati vuoti del report non finiscono sotto l header mobile', async () => {
  const [page, css] = await Promise.all([
    readSource('src/pages/ReportPage.jsx'),
    readSource('src/styles/report-tst.css'),
  ])

  assert.equal((page.match(/className="page report-page-empty"/g) || []).length, 2)
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.app-shell--report \.report-page-empty\s*\{[^}]*padding-top:\s*calc\(var\(--app-header-offset\) \+ var\(--space-sm\)\)/)
})
