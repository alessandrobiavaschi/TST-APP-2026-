import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TEMPERAMENTI_MUSICA } from '../src/content/musicistiTemperamenti.js'
import { getMusicianRooms } from '../src/config/musiciansConfig.js'

// Estratto testuale del libro, con a capo e sillabazione di stampa ricomposti.
const libro = readFileSync(new URL('../docs/fonti-scientifiche/_estratto/Il_Pianeta_della_Musica_-_FM.txt', import.meta.url), 'utf8')
  .replace(/mussida_new\.indd.*\n/g, '')
  .replace(/--- PAGE \d+ ---\n\d+\n/g, '')
  .replace(/-\s*\n/g, '')
  .replace(/\s+/g, ' ')
  .replaceAll(' bpm .', ' bpm.')
  .replaceAll(' bpm ,', ' bpm,')

test('i testi dei temperamenti sono trascritti alla lettera dal libro', () => {
  for (const [famiglia, t] of Object.entries(TEMPERAMENTI_MUSICA)) {
    for (const scheda of ['predilige', 'piaceri']) {
      for (const paragrafo of t[scheda].paragrafi) {
        assert.ok(libro.includes(paragrafo), `${famiglia} / ${scheda}: «${paragrafo.slice(0, 60)}…» non è nel libro`)
      }
    }
  }
})

test('i titoli dei capitoli di famiglia sono quelli dell’indice del libro', () => {
  for (const [famiglia, t] of Object.entries(TEMPERAMENTI_MUSICA)) {
    const titoli = getMusicianRooms(famiglia).map((r) => r.title)
    assert.ok(titoli.includes(`Che Musica predilige il temperamento ${t.aggettivo}`))
    assert.ok(titoli.includes(`I piaceri del temperamento ${t.aggettivo} quando ascolta Musica`))
  }
})

test('per la famiglia Grigio i due capitoli di famiglia non compaiono', () => {
  const ids = getMusicianRooms('Grigio').map((r) => r.id)
  assert.ok(!ids.includes('fm-predilige') && !ids.includes('fm-piaceri'))
})
