import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { NATURE } from '../src/config/tstSistema.js'
import { MUSICISTI_SCHEDE } from '../src/content/musicaDisposizione.js'

const INTERVALLI_FONTE = new Set(NATURE.map((n) => n.intervallo).filter(Boolean))

test('la sezione Musica mostra solo intervalli presenti nella fonte unica', () => {
  for (const [famiglia, scheda] of Object.entries(MUSICISTI_SCHEDE)) {
    for (const corrente of scheda.intervalli?.correnti || []) {
      assert.ok(corrente.intervallo, `${famiglia}: intervallo mancante`)
      for (const parte of corrente.intervallo.split(' · ')) {
        assert.ok(INTERVALLI_FONTE.has(parte), `${famiglia}: «${parte}» non è in tstSistema.js`)
      }
    }
  }
})

test('musicaDisposizione non contiene intervalli scritti a mano', () => {
  const sorgente = readFileSync(new URL('../src/content/musicaDisposizione.js', import.meta.url), 'utf8')
  assert.doesNotMatch(sorgente, /intervallo:\s*['"`]/)
})
