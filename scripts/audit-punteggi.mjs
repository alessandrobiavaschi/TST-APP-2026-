#!/usr/bin/env node
/**
 * AUDIT PUNTEGGI TST — controllo da capo a fine, in sola lettura.
 *
 * Uso:
 *   node scripts/audit-punteggi.mjs <file.csv | file.json> [--out cartella]
 *
 * Input:
 *   - CSV "Scarica matrice" dall'archivio risultati (/risultati), oppure
 *   - JSON: array di documenti così come sono su Firestore (consigliato: è
 *     l'unico modo per confrontare i contatori SALVATI con quelli ricalcolati,
 *     perché l'export CSV dell'app ricalcola già i test del modello corrente).
 *
 * Cosa controlla per ogni test (dettagli in fondo al file):
 *   1. Riconoscimento: ogni risposta salvata corrisponde a una regola? (le risposte
 *      non riconosciute valgono 0 punti in silenzio: è il sintomo del bug di settembre)
 *   2. Motore vs oracolo: calcolaCeste() dell'app vs un ricalcolo indipendente scritto qui.
 *   3. Coerenza interna: somma nature = somma portati = somma famiglie; nessun valore
 *      oltre il massimo teorico; percentuali tra 0 e 100.
 *   4. Salvato vs ricalcolato: contatori e prevalenze salvati al momento del test
 *      contro quelli che l'app mostrerebbe oggi.
 *   5. Test storici: se il report li ricalcola (computeColorTotals lo fa sempre quando
 *      ci sono risposte grezze), i numeri mostrati divergono da quelli consegnati?
 *
 * Non scrive mai su Firestore. Nei file prodotti non compaiono nomi: solo R001, R002…
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  FAMIGLIE,
  NATURE,
  PASSI,
  PORTATI,
  TIPI_A_DIZIONARIO,
  VERSIONE_MODELLO,
  getRegolePerPasso,
} from '../src/config/tstSistema.js'
import { MASSIMI_TEORICI, calcolaCeste, percentualeNatura } from '../src/utils/cesteTst.js'
import { computeTestResultFields, versioneModelloDi } from '../src/utils/testRecordProcessing.js'
import { parseMatriceCsv } from '../src/utils/matriceCsv.js'

/* ── Input ──────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2)
const inputPath = args.find((a) => !a.startsWith('--'))
const outIdx = args.indexOf('--out')
const outDir = resolve(outIdx >= 0 ? args[outIdx + 1] : 'audit-punteggi')
if (!inputPath) {
  console.error('Uso: node scripts/audit-punteggi.mjs <export.csv | export.json> [--out cartella]')
  process.exit(1)
}

function caricaRecord(path) {
  const text = readFileSync(path, 'utf8')
  if (path.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(text)
    const arr = Array.isArray(data) ? data : Object.values(data)
    return { records: arr.map((d) => d.raw || d.data || d), sorgente: 'json' }
  }
  return { records: parseMatriceCsv(text).payloads, sorgente: 'csv' }
}

/* ── Oracolo indipendente ───────────────────────────────────────────────── */
/*
 * Riscrive da zero la regola di calcolo descritta nel metodo, senza usare
 * cestaPerRisposta()/calcolaCeste(). Legge solo le TABELLE (tstSistema.js):
 *   punti = punti_regola × peso_passo (solo sensazioni/aggettivi)
 *         + 1 se il passo è una riconferma (41, 42)
 * Se motore e oracolo divergono, l'errore è nel motore (o nell'oracolo): va capito.
 */
function oracolo(record) {
  const ceste = Object.fromEntries(NATURE.map((n) => [n.id, Object.fromEntries(PORTATI.map((p) => [p.id, 0]))]))
  const sconosciute = []
  let risposte = 0
  let riconosciute = 0
  for (const passo of PASSI) {
    const risposta = String(record?.[passo.campoDb] ?? '').trim()
    if (!risposta) continue
    risposte += 1
    const regola = getRegolePerPasso(passo.numero).find((r) => r.risposta === risposta)
    if (!regola) {
      sconosciute.push({ passo: passo.numero, risposta })
      continue
    }
    riconosciute += 1
    const moltiplicatore = TIPI_A_DIZIONARIO.includes(passo.tipoDomanda) ? passo.peso : 1
    const bonus = passo.riconferma ? 1 : 0
    ceste[regola.natura][regola.portato] += regola.punti * moltiplicatore + bonus
  }
  const nature = Object.fromEntries(
    NATURE.map((n) => [n.campoDb, PORTATI.reduce((s, p) => s + ceste[n.id][p.id], 0)]),
  )
  const portati = Object.fromEntries(
    PORTATI.map((p) => [p.campoDb, NATURE.reduce((s, n) => s + ceste[n.id][p.id], 0)]),
  )
  return { ceste, nature, portati, risposte, riconosciute, sconosciute }
}

/* ── Controlli per record ───────────────────────────────────────────────── */

const num = (v) => (v === '' || v == null ? null : Number(v))
const somma = (o) => Object.values(o).reduce((a, b) => a + b, 0)

function auditRecord(record, i) {
  const id = `R${String(i + 1).padStart(3, '0')}`
  const versione = versioneModelloDi(record)
  const modelloCorrente = versione === VERSIONE_MODELLO
  const problemi = []
  const avvisi = []

  const orc = oracolo(record)
  const motore = calcolaCeste(record)

  // 1. Riconoscimento delle risposte
  if (orc.sconosciute.length) {
    problemi.push(
      `${orc.sconosciute.length} risposte non riconosciute (valgono 0 punti): ` +
        orc.sconosciute.slice(0, 5).map((s) => `passo ${s.passo} «${s.risposta}»`).join('; ') +
        (orc.sconosciute.length > 5 ? ` … (+${orc.sconosciute.length - 5})` : ''),
    )
  }
  if (orc.risposte > 0 && orc.risposte < 72) avvisi.push(`test incompleto: ${orc.risposte}/72 risposte`)

  // 2. Motore vs oracolo, cesta per cesta
  for (const n of NATURE) {
    for (const p of PORTATI) {
      const a = motore.ceste[n.id][p.id]
      const b = orc.ceste[n.id][p.id]
      if (a !== b) problemi.push(`motore≠oracolo nella cesta ${n.nome} × ${p.nome}: ${a} vs ${b}`)
    }
  }
  if (motore.risposteValide !== orc.riconosciute) {
    problemi.push(`risposte valide: motore ${motore.risposteValide}, oracolo ${orc.riconosciute}`)
  }

  // 3. Coerenza interna
  const sNature = somma(motore.campiNature)
  const sPortati = somma(motore.campiPortato)
  const sFamiglie = somma(motore.famiglie)
  if (!(sNature === sPortati && sPortati === sFamiglie)) {
    problemi.push(`somme incoerenti: nature ${sNature}, portati ${sPortati}, famiglie ${sFamiglie}`)
  }
  for (const n of NATURE) {
    const v = motore.campiNature[n.campoDb]
    const max = MASSIMI_TEORICI.naturePerCampo[n.campoDb]
    if (v < 0 || v > max) problemi.push(`${n.nome} = ${v} fuori dall'intervallo 0–${max}`)
  }

  // 4. Salvato vs ricalcolato
  const differenzeSalvato = []
  for (const campo of [...NATURE.map((n) => n.campoDb), ...PORTATI.map((p) => p.campoDb)]) {
    const salvato = num(record[campo])
    if (salvato == null) continue
    const ricalcolato = motore.campiNature[campo] ?? motore.campiPortato[campo]
    if (salvato !== ricalcolato) differenzeSalvato.push(`${campo}: salvato ${salvato}, ricalcolato ${ricalcolato}`)
  }
  const prevalenzeOggi = computeTestResultFields({ ...record, ...motore.campiNature, ...motore.campiPortato })
  const prevalenzeDiverse = []
  for (const campo of ['Disposizione_Prevalente', 'Sottodisposizione_Prevalente', 'Portato_Esperienziale_Prevalente']) {
    const salvato = String(record[campo] || '').trim()
    const oggi = prevalenzeOggi[campo] || ''
    if (salvato && salvato !== oggi) prevalenzeDiverse.push(`${campo}: salvato «${salvato}», oggi «${oggi}»`)
  }

  if (modelloCorrente) {
    if (differenzeSalvato.length) problemi.push(`contatori salvati ≠ ricalcolati: ${differenzeSalvato.join('; ')}`)
    if (prevalenzeDiverse.length) problemi.push(`prevalenze salvate ≠ ricalcolate: ${prevalenzeDiverse.join('; ')}`)
  } else if (orc.risposte > 0) {
    // 5. Test storico: il report li ricalcola comunque dalle risposte grezze.
    const famSalvate = Object.fromEntries(FAMIGLIE.map((f) => [f.colorKey, 0]))
    for (const n of NATURE) famSalvate[n.colorKey] += num(record[n.campoDb]) || 0
    const famDiverse = FAMIGLIE.filter((f) => famSalvate[f.colorKey] !== motore.famiglie[f.colorKey])
    if (famDiverse.length) {
      problemi.push(
        `test ${versione}: il report ricalcola con le regole ${VERSIONE_MODELLO} e mostra famiglie diverse da quelle consegnate (` +
          famDiverse.map((f) => `${f.nome} ${famSalvate[f.colorKey]}→${motore.famiglie[f.colorKey]}`).join(', ') +
          ')',
      )
    }
    if (prevalenzeDiverse.length) avvisi.push(`con le regole di oggi cambierebbe: ${prevalenzeDiverse.join('; ')}`)
  }

  const famiglieAZero = FAMIGLIE.filter((f) => motore.famiglie[f.colorKey] === 0).map((f) => f.nome)

  return {
    id,
    versione,
    stato: String(record.Stato_Consegna || (record.Bozza_Test ? 'BOZZA' : '')).trim(),
    risposte: orc.risposte,
    riconosciute: orc.riconosciute,
    sconosciute: orc.sconosciute,
    famiglie: motore.famiglie,
    famiglieAZero,
    nature: Object.fromEntries(NATURE.map((n) => [n.campoDb, percentualeNatura(n.campoDb, motore.campiNature[n.campoDb])])),
    problemi,
    avvisi,
  }
}

/* ── Esecuzione e report ────────────────────────────────────────────────── */

const { records, sorgente } = caricaRecord(inputPath)
const risultati = records.map(auditRecord)

const perVersione = {}
risultati.forEach((r) => { perVersione[r.versione] = (perVersione[r.versione] || 0) + 1 })

// Raggruppa per etichetta: quali parole salvate non esistono più, in quali passi e in quanti test.
const risposteIgnote = new Map()
risultati.forEach((r) => r.sconosciute.forEach(({ passo, risposta }) => {
  const voce = risposteIgnote.get(risposta) || { risposta, passi: new Set(), test: new Set() }
  voce.passi.add(passo)
  voce.test.add(r.id)
  risposteIgnote.set(risposta, voce)
}))
const intervalli = (numeri) => {
  const v = [...numeri].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < v.length; i += 1) {
    let j = i
    while (j + 1 < v.length && v[j + 1] === v[j] + 1) j += 1
    out.push(i === j ? `${v[i]}` : `${v[i]}–${v[j]}`)
    i = j
  }
  return out.join(', ')
}
const ignoteOrdinate = [...risposteIgnote.values()]
  .map((x) => ({ risposta: x.risposta, passi: intervalli(x.passi), n: x.test.size }))
  .sort((a, b) => b.n - a.n)

const conProblemi = risultati.filter((r) => r.problemi.length)

mkdirSync(outDir, { recursive: true })

const md = []
md.push(`# Audit punteggi TST`, '')
md.push(`Sorgente: ${sorgente.toUpperCase()} · ${risultati.length} test · modello corrente ${VERSIONE_MODELLO}`, '')
if (sorgente === 'csv') {
  md.push('> Attenzione: l\'export CSV dell\'app ricalcola già i test del modello corrente, quindi il controllo "salvato vs ricalcolato" vale solo con un export JSON da Firestore.', '')
}
md.push('## Riepilogo', '')
md.push(`- Test per versione: ${Object.entries(perVersione).map(([v, n]) => `${v}: ${n}`).join(' · ')}`)
md.push(`- Test con almeno un problema: **${conProblemi.length}** su ${risultati.length}`)
md.push(`- Test con risposte non riconosciute: **${risultati.filter((r) => r.sconosciute.length).length}**`)
md.push(`- Test con almeno una famiglia a zero: ${risultati.filter((r) => r.famiglieAZero.length).length}`, '')
if (ignoteOrdinate.length) {
  md.push('## Risposte salvate che il motore non riconosce', '')
  md.push('Sono le etichette da mappare (retrocompatibilità). Ognuna oggi vale 0 punti.', '')
  md.push('| Risposta salvata | Passi | N. test |', '|---|---|---|')
  ignoteOrdinate.forEach((x) => md.push(`| ${x.risposta} | ${x.passi} | ${x.n} |`))
  md.push('')
}
md.push('## Dettaglio test con problemi', '')
if (!conProblemi.length) md.push('Nessun problema trovato.')
conProblemi.forEach((r) => {
  md.push(`### ${r.id} · ${r.versione}${r.stato ? ` · ${r.stato}` : ''} · ${r.riconosciute}/${r.risposte} risposte riconosciute`)
  r.problemi.forEach((p) => md.push(`- ❌ ${p}`))
  r.avvisi.forEach((a) => md.push(`- ⚠️ ${a}`))
  md.push('')
})
writeFileSync(join(outDir, 'audit-punteggi.md'), md.join('\n'))

const csvHeader = ['id', 'versione', 'stato', 'risposte', 'riconosciute', 'non_riconosciute',
  ...FAMIGLIE.map((f) => `punti_${f.colorKey}`), 'famiglie_a_zero', 'n_problemi', 'problemi']
const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
const csv = [csvHeader.join(',')].concat(risultati.map((r) => [
  r.id, r.versione, r.stato, r.risposte, r.riconosciute, r.sconosciute.length,
  ...FAMIGLIE.map((f) => r.famiglie[f.colorKey]), r.famiglieAZero.join(' '), r.problemi.length, r.problemi.join(' | '),
].map(esc).join(',')))
writeFileSync(join(outDir, 'audit-punteggi.csv'), csv.join('\n'))

console.log(`Test analizzati: ${risultati.length} (${Object.entries(perVersione).map(([v, n]) => `${v}: ${n}`).join(', ')})`)
console.log(`Con problemi: ${conProblemi.length}`)
if (ignoteOrdinate.length) {
  console.log('Risposte non riconosciute (risposta · passi · n. test):')
  ignoteOrdinate.slice(0, 20).forEach((x) => console.log(`  «${x.risposta}» · passi ${x.passi} · ${x.n}`))
}
console.log(`Report: ${join(outDir, 'audit-punteggi.md')}`)
process.exitCode = conProblemi.length ? 1 : 0
