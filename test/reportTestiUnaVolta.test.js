// Regressione: nel report ogni concetto è detto una volta sola (decisione del 23/10/2026).
// Controlla che le frasi ridondanti eliminate non ricompaiano nelle sorgenti del report.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8')

test('le frasi ridondanti eliminate non ricompaiono nel report', async () => {
  const files = [
    'src/components/report/SintesiCorrenti.jsx',
    'src/components/report/SintesiIntro.jsx',
    'src/components/report/ProfiloEmotivo.jsx',
    'src/components/report/ParoleStatiAnimo.jsx',
    'src/components/report/reportUiCopy.js',
  ]
  const sources = (await Promise.all(files.map(read))).join('\n')
  for (const frase of [
    'non è fatto da una sola famiglia',
    'base di lettura; non annulla',
    'In essa emerge',
    'orienta la propria energia emotiva verso',
    'Le 5 componenti convivono',
    'il test evidenzia le nature specifiche',
    'educazioneSubtitle',
  ]) {
    assert.ok(!sources.includes(frase), `frase ripetuta ricomparsa: «${frase}»`)
  }
})

test('la composizione del profilo è descritta solo nell’apertura della stanza 01', async () => {
  const profilo = await read('src/components/report/ProfiloEmotivo.jsx')
  assert.ok(!profilo.includes('composizioneSintesi'), 'la stanza 02 non deve ripetere la composizione')
  const intro = await read('src/components/report/SintesiIntro.jsx')
  assert.match(intro, /Nel tuo profilo sono presenti le famiglie/)
})

test('il sommario di ogni stanza ha una sola fonte (REPORT_GROUPS)', async () => {
  const shell = await read('src/components/report/ReportShell.jsx')
  const leads = shell.match(/lead=\{roomMetaById\['[^']+'\]\?\.subtitle\}/g) || []
  assert.ok(leads.length >= 6, 'ogni stanza passa il proprio subtitle a RoomOpening')
})
