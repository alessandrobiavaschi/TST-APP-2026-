// Estrae le regole di punteggio dell'app (codice reale, nessun valore a mano).
// Uso: node estrai_regole_app.mjs <root progetto> <out.csv> [corrente|2025_v1|2025_v2]
import fs from 'node:fs'
import path from 'node:path'
const [root, out, epoca = 'corrente'] = process.argv.slice(2)
const imp = (p) => import(path.resolve(root, p))
const { PASSI, getRegolePerPasso } = await imp('src/config/tstSistema.js')
const { cestaPerRisposta } = await imp('src/utils/cesteTst.js')
const { REGOLE_STORICHE } = await imp('src/utils/testStorici.js')
const regolePerPasso = epoca === 'corrente' ? getRegolePerPasso : REGOLE_STORICHE[epoca]
const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
const righe = ['domanda,risposta,famiglia,portato,punti,tipo,riconferma']
for (const p of PASSI) {
  for (const regola of regolePerPasso(p.numero)) {
    const c = cestaPerRisposta({ fileNumber: p.numero, risposta: regola.risposta, isConfirmation: p.riconferma, regolePerPasso })
    righe.push([p.numero, q(regola.risposta), c?.natura.colorKey ?? '', c?.portato.id ?? '', c?.punti ?? '', p.tipoDomanda, p.riconferma ? 'si' : ''].join(','))
  }
}
fs.writeFileSync(out, righe.join('\n') + '\n')
console.log(`${epoca}: ${righe.length - 1} regole -> ${out}`)
