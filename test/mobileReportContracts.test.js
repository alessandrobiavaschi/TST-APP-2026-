import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import {
  getDefaultGroupOpenState,
  getReportGroups,
  getVisibleReportSections,
} from '../src/components/report/reportSectionsConfig.js'

const readSource = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

// shouldShowEmotionalIntegrations (reportFeatureFlags.js) ora è condizionale: la stanza
// "report-group-relazioni" compare solo se il profilo ha una famiglia realmente
// significativa oltre alla leader (banda exact_tie/near_parity/secondary in
// globalProfileContract). Questo fixture simula un profilo con una tale famiglia secondaria
// per continuare a testare l'ordine/struttura completa dei macro-blocchi, inclusa quella stanza.
const PROFILO_CON_FAMIGLIA_SECONDARIA = {
  globalProfileContract: {
    status: 'ready',
    ranking: [
      { familyKey: 'blu', rank: 1, band: 'leader' },
      { familyKey: 'rosso', rank: 2, band: 'secondary' },
    ],
  },
}

test('mantiene ordine, id e struttura desktop dei macro-blocchi', () => {
  const groups = getReportGroups(PROFILO_CON_FAMIGLIA_SECONDARIA)
  assert.deepEqual(groups.map(({ id }) => id), [
    'report-group-hero',
    'report-group-profilo-generale',
    'stanza-identita',
    'report-tst-rapporti',
    'report-group-forza-correnti',
    'report-group-educazione',
    'report-group-relazioni',
  ])
  assert.deepEqual(getDefaultGroupOpenState(), {
    'report-group-hero': false,
    'report-group-profilo-generale': true,
    'stanza-identita': false,
    'report-tst-rapporti': false,
    'report-group-forza-correnti': false,
    'report-group-educazione': false,
    'report-group-relazioni': false,
  })
  assert.deepEqual(groups.slice(1).map(({ stepLabel }) => stepLabel), ['1', '2', '3', '4', '5', '6'])
  assert.deepEqual(getVisibleReportSections(PROFILO_CON_FAMIGLIA_SECONDARIA).map(({ id }) => id), [
    'report-hero',
    'report-tst-sintesi',
    'report-tst-grafici',
    'report-tst-famiglia',
    'report-tst-mappa',
  ])
})

test('conserva i contratti responsive contro overflow e sovrapposizione della bottom navigation', async () => {
  const css = await readSource('src/styles/report-tst.css')
  assert.match(css, /\.report-tst-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s)
  assert.match(css, /@media\s*\(max-width:\s*768px\)/)
  assert.match(css, /\.report-tst-layout\s*\{[^}]*padding-bottom:\s*calc\(80px\s*\+\s*env\(safe-area-inset-bottom/s)
  assert.match(css, /\.navbar-tst--mobile\s*\{[^}]*position:\s*fixed/s)
  assert.match(css, /\.report-tst-layout,[\s\S]*max-width:\s*100vw/)
  const sintesiCss = await readSource('src/components/report/SintesiCorrenti.css')
  assert.match(sintesiCss, /@media\s*\(max-width:\s*768px\)[\s\S]*\.sintesi-correnti--mobile\s*\{[^}]*padding:/)
  assert.match(sintesiCss, /@media\s*\(max-width:\s*768px\)[\s\S]*\.sintesi-mobile-card\s*\{[^}]*border-radius:/)
})

test('i grafici restano responsive e mostrano valori statici su touch', async () => {
  const [radar, rapporti] = await Promise.all([
    readSource('src/components/report/ReportRadarChart.jsx'),
    readSource('src/components/report/QuattroRapporti.jsx'),
  ])
  assert.match(radar, /ResponsiveContainer/)
  assert.match(radar, /const isMobile =/)
  assert.match(radar, /label=/)
  assert.match(rapporti, /ResponsiveContainer/)
  assert.match(rapporti, /function RadarPoint/)
  assert.match(rapporti, /aria-label=\{label\}/)
})

test('la navigazione mobile espone controlli raggiungibili e gestione tastiera del menu', async () => {
  const navbar = await readSource('src/components/report/NavbarTST.jsx')
  const reportShell = await readSource('src/components/report/ReportShell.jsx')
  const mobileTabsBlock = navbar.slice(
    navbar.indexOf('const mobileTabs = ['),
    navbar.indexOf('return (', navbar.indexOf('const mobileTabs = [')),
  )
  assert.match(navbar, /<nav className="navbar-tst__bar navbar-tst__bar--mobile"/)
  assert.match(navbar, /aria-current=\{active \? 'page' : undefined\}/)
  assert.doesNotMatch(mobileTabsBlock, /tabIndex=\{active \? 0 : -1\}/)
  assert.match(navbar, /e\.key !== 'Escape'/)
  assert.match(navbar, /menuButtonRef\.current\?\.focus\(\)/)
  assert.doesNotMatch(mobileTabsBlock, /galassia/i)
  assert.match(navbar, /const desktopTabs = \[[\s\S]*galassia/)
  assert.match(reportShell, /function isMobileReportViewport\(\)/)
  assert.match(reportShell, /return isMobileReportViewport\(\) \? 'report' : 'galassia'/)
})
