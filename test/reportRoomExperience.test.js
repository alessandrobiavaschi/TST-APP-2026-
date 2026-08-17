import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const readSource = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('la home del report mantiene le due CTA sul flusso a stanze', async () => {
  const [hero, shell, newTest] = await Promise.all([
    readSource('src/components/report/HeroScreen.jsx'),
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/pages/NewTestPage.jsx'),
  ])

  assert.match(hero, />\s*LEGGI IL TUO REPORT\s*</)
  assert.match(hero, />\s*NUOVO TEST\s*</)
  assert.match(hero, /href="#report-group-profilo-generale"/)
  assert.match(hero, /navigate\('\/nuovo-test', \{ state: \{ startAtProfile: true \} \}\)/)
  assert.match(shell, /id="report-group-profilo-generale"/)
  for (const anchorId of [
    'report-tst-rapporti',
    'report-group-forza-correnti',
    'report-group-educazione',
    'report-group-approfondimento',
    'report-group-relazioni',
  ]) {
    assert.match(shell, new RegExp(`id="${anchorId}"`))
  }
  assert.match(newTest, /useState\(\(\) => !location\.state\?\.startAtProfile\)/)
})

test('le stanze usano RoomRevealContent senza ripristinare i wrapper obsoleti', async () => {
  const [shell, reveal, css] = await Promise.all([
    readSource('src/components/report/ReportShell.jsx'),
    readSource('src/components/report/RoomRevealContent.jsx'),
    readSource('src/styles/report-tst.css'),
  ])

  assert.match(shell, /import RoomRevealContent from '\.\/RoomRevealContent'/)
  assert.doesNotMatch(shell, /ReportDetailTabs|ReportSectionGroup|ReportRoom/)
  assert.ok((shell.match(/<RoomRevealContent/g) || []).length >= 7)
  assert.match(reveal, /useReducedMotion\(\)/)
  assert.match(reveal, /useScroll\(/)
  assert.match(reveal, /style=\{reduceMotion \? style : \{ \.\.\.style, opacity, y \}\}/)
  assert.match(css, /\.report-room-section\s*\{[^}]*min-height:\s*calc\(100svh/s)
  assert.match(css, /\.report-room-section::before\s*\{[^}]*background:\s*var\(--sky-glow-gradient\)/s)
  assert.doesNotMatch(css, /scroll-snap-type:\s*[^;]*mandatory/)
})

test('le stanze separate restano accessibili e reversibili', async () => {
  const shell = await readSource('src/components/report/ReportShell.jsx')

  assert.match(shell, /window\.location\.hash === '#aree-sonore'/)
  assert.match(shell, /window\.location\.hash === '#famiglie'/)
  assert.match(shell, /window\.location\.hash === '#for-musicians'/)
  assert.match(shell, /event\.key === 'Escape'/)
  assert.ok((shell.match(/role="dialog"/g) || []).length >= 3)
  assert.match(shell, /inert=\{modalita !== 'aree-sonore' \? true : undefined\}/)
  assert.match(shell, /inert=\{modalita !== 'famiglie' \? true : undefined\}/)
  assert.match(shell, /returnFocusRef\.current\?\.focus\(\)/)
  assert.match(shell, /data-report-mode="aree-sonore"/)
  assert.match(shell, /data-report-mode="famiglie"/)
  assert.match(shell, /data-report-mode="for-musicians"/)
  assert.match(shell, /galassiaEverOpened && !isMobileViewport/)
  assert.match(shell, /data-time-of-day=\{timeOfDay\}/)
  assert.match(shell, /data-sky-tone=\{visualProfile\.tone\}/)
})

test('gli stati vuoti del report non finiscono sotto l header mobile', async () => {
  const [page, css] = await Promise.all([
    readSource('src/pages/ReportPage.jsx'),
    readSource('src/styles/report-tst.css'),
  ])

  assert.equal((page.match(/className="page report-page-empty"/g) || []).length, 2)
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.app-shell--report \.report-page-empty\s*\{[^}]*padding-top:\s*calc\(var\(--app-header-offset\) \+ var\(--space-sm\)\)/)
})
