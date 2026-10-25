import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DISTANZE_MUSICALI_13,
  ASCOLTI_72_TEST,
  SUONO_PER_FAMIGLIA,
  COPPIE_ARTISTI_MUSSIDA,
  NATURE_DETTAGLIO_12,
} from '../src/content/musicaPerMusicisti.js'

test('le 13 distanze musicali contengono esattamente 13 intervalli ordinati da 0 a 12 semitoni', () => {
  assert.equal(DISTANZE_MUSICALI_13.length, 13)
  DISTANZE_MUSICALI_13.forEach((d, idx) => {
    assert.equal(d.semitoni, idx, `Distanza ${idx} ha semitoni non corrispondenti`)
    assert.ok(d.nome, `Distanza ${idx} senza nome`)
    assert.ok(d.note, `Distanza ${idx} senza note`)
    assert.ok(d.evocativa, `Distanza ${idx} senza evocativa`)
    assert.ok(d.famigliaKey, `Distanza ${idx} senza famigliaKey`)
    assert.ok(['consolidato', 'in verifica'].includes(d.stato), `Stato non valido per distanza ${idx}: ${d.stato}`)
  })

  // Casi speciali aperti documentati con stato "in verifica"
  const unisono = DISTANZE_MUSICALI_13.find((d) => d.semitoni === 0)
  const calmaFisica = DISTANZE_MUSICALI_13.find((d) => d.semitoni === 8)
  const ottava = DISTANZE_MUSICALI_13.find((d) => d.semitoni === 12)

  assert.equal(unisono.stato, 'in verifica')
  assert.equal(calmaFisica.stato, 'in verifica')
  assert.equal(ottava.stato, 'in verifica')
})

test('i 72 ascolti del test contengono esattamente 72 passi con titoli tecnici e spiegazioni', () => {
  assert.equal(ASCOLTI_72_TEST.length, 72)
  ASCOLTI_72_TEST.forEach((a, idx) => {
    const passo = idx + 1
    assert.equal(a.passo, passo, `Passo ${passo} disallineato`)
    assert.ok(a.sezione, `Passo ${passo} senza sezione`)
    assert.ok(a.sezioneNome, `Passo ${passo} senza sezioneNome`)
    assert.ok(a.titoloTecnico, `Passo ${passo} senza titoloTecnico`)
    assert.ok(a.spiegazione, `Passo ${passo} senza spiegazione`)
  })
})

test('il suono per famiglia copre tutte le 5 famiglie emotive', () => {
  const families = ['Blu', 'Verde', 'Giallo', 'Rosso', 'Grigio']
  families.forEach((fam) => {
    const s = SUONO_PER_FAMIGLIA[fam]
    assert.ok(s, `Famiglia ${fam} mancante in SUONO_PER_FAMIGLIA`)
    assert.ok(s.timbri?.titolo && s.timbri?.descrizione, `Timbri mancanti per ${fam}`)
    assert.ok(s.ritmoBpm?.titolo && s.ritmoBpm?.descrizione, `RitmoBpm mancante per ${fam}`)
    assert.ok(s.armonieModi?.titolo && s.armonieModi?.descrizione, `ArmonieModi mancante per ${fam}`)
    assert.ok(s.ilMusicistaCheSei?.titolo && s.ilMusicistaCheSei?.descrizione, `ilMusicistaCheSei mancante per ${fam}`)
  })
})

test('le 5 coppie di artisti contengono le 5 dimensioni e l\'analisi di Franco Mussida', () => {
  assert.equal(COPPIE_ARTISTI_MUSSIDA.length, 5)
  const dimensioni = ['Timbro', 'Ritmo', 'Melodia', 'Intervallo', 'Armonia']
  COPPIE_ARTISTI_MUSSIDA.forEach((c, idx) => {
    assert.equal(c.dimensione, dimensioni[idx])
    assert.equal(c.coppia.length, 2)
    c.coppia.forEach((traccia) => {
      assert.ok(traccia.artista, 'Artista mancante')
      assert.ok(traccia.brano, 'Brano mancante')
      assert.ok(traccia.analisi, 'Analisi mancante')
      assert.ok(traccia.polo, 'Polo mancante')
    })
  })
})

test('le 12 nature musicali contengono esattamente 12 profili allineati alle 5 famiglie', () => {
  assert.equal(NATURE_DETTAGLIO_12.length, 12)
  NATURE_DETTAGLIO_12.forEach((n) => {
    assert.ok(n.id, 'id mancante')
    assert.ok(n.nome, 'nome mancante')
    assert.ok(n.famigliaNome, 'famigliaNome mancante')
    assert.ok(n.intervallo, 'intervallo mancante')
    assert.ok(n.evocativa, 'evocativa mancante')
    assert.ok(n.codiceSonoro, 'codiceSonoro mancante')
    assert.ok(n.timbriEvocati, 'timbriEvocati mancante')
    assert.ok(n.attitudineMusicale, 'attitudineMusicale mancante')
  })
})

