import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RESEARCH_MATRIX_HEADERS,
  buildResearchMatrixRow,
  buildResearchMatrixCsv,
  formatCellValue,
  computeAge,
  getPseudonymId,
} from '../src/utils/reportRecordUtils.js'

test('Matrice Ricerca Standard: intestazioni conformi a standard sociologico e GDPR', () => {
  // 1. Nessun dato nominativo in chiaro tra le colonne
  assert.equal(RESEARCH_MATRIX_HEADERS.includes('Nome'), false)
  assert.equal(RESEARCH_MATRIX_HEADERS.includes('Cognome'), false)
  assert.equal(RESEARCH_MATRIX_HEADERS[0], 'ID_Soggetto')

  // 2. Variabili socio-demografiche incluse
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Data_Test'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Data_Nascita'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Eta'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Titolo_Studio'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Pratica_Musicale'))

  // 3. 72 item grezzi
  for (let i = 1; i <= 72; i += 1) {
    const key = `File_${String(i).padStart(2, '0')}`
    assert.ok(RESEARCH_MATRIX_HEADERS.includes(key), `Manca colonna ${key}`)
  }

  // 4. Totali famiglie colore
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Totale_BLU'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Totale_ROSSO'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Totale_VERDE'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Totale_GIALLO'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Totale_GRIGIO'))

  // 5. Dummy atomiche 0/1 per risposte multiple
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('SA_SERENO'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('SA_CURIOSO'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('SA_CONFUSO'))

  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Area_Maggior_Agio_A'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Area_Maggior_Agio_E'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Area_Minor_Agio_A'))
  assert.ok(RESEARCH_MATRIX_HEADERS.includes('Area_Minor_Agio_E'))

  assert.ok(RESEARCH_MATRIX_HEADERS.includes('DD_CONCENTRAZIONE'))
})

test('Matrice Ricerca Standard: calcolo Eta esatta', () => {
  // Nato il 31 marzo 1947, test il 1 agosto 2026 -> 79 anni
  const eta = computeAge('1947-03-31', '2026-08-01')
  assert.equal(eta, 79)

  // Test prima del compleanno
  const etaPrima = computeAge('1947-03-31', '2026-03-01')
  assert.equal(etaPrima, 78)

  // Valori non validi
  assert.equal(computeAge(null, '2026-08-01'), '')
})

test('Matrice Ricerca Standard: pseudonimizzazione ID_Soggetto (GDPR)', () => {
  const recordWithName = {
    id: 'FRANCO ADISSUM',
    raw: {
      Nome: 'FRANCO',
      Cognome: 'ADISSUM',
      Data_Test: '2026-08-01',
      Data_Nascita: '1947-03-31',
    },
  }
  const pseudoId = getPseudonymId(recordWithName)
  assert.ok(!pseudoId.includes('FRANCO'), 'L ID non deve contenere il nome')
  assert.ok(!pseudoId.includes('ADISSUM'), 'L ID non deve contenere il cognome')
  assert.match(pseudoId, /^SUBJ_[0-9A-F]+$/)

  const recordWithDocId = {
    id: 'doc_abc123',
    raw: {
      Nome: 'FRANCO',
      Cognome: 'ADISSUM',
    },
  }
  assert.equal(getPseudonymId(recordWithDocId), 'doc_abc123')
})

test('Matrice Ricerca Standard: serializzazione date senza bug [object Object]', () => {
  assert.equal(formatCellValue({ seconds: 1785578400, nanoseconds: 0 }), '2026-08-01T10:00:00.000Z')
  assert.equal(formatCellValue({ _seconds: 1785578400 }), '2026-08-01T10:00:00.000Z')
  assert.equal(formatCellValue(new Date('2026-08-01T10:00:00Z')), '2026-08-01T10:00:00.000Z')
  assert.equal(formatCellValue({}), '')
  assert.equal(formatCellValue('[object Object]'), '')
})

test('Matrice Ricerca Standard: generazione corretta con risposte multiple atomizzate (dummy 0/1)', () => {
  const sampleRecord = {
    id: 'sample_rec_01',
    raw: {
      Nome: 'FRANCO',
      Cognome: 'ADISSUM',
      Data_Test: '2026-08-01',
      Data_Nascita: '1947-03-31',
      Titolo_Studio: 'LICENZA MEDIA',
      Pratica_Musicale: 'SI',
      Strumento_Suonato: 'CHITARRA',
      File_01: 'opzione3',
      File_05: 'Mi stupisce',
      PE_Simpatia: 61,
      PE_Antipatia: 17,
      PE_Indifferenza: 1,
      BLU_1_Depressiva: 4,
      BLU_2_Lunare: 5,
      BLU_3_Nostalgia: 5,
      BLU_4_Solare: 4,
      ROSSO_1_Assertivita: 20,
      ROSSO_2_Dubbio_Collera: 5,
      VERDE_1_CalmaContemplativa: 2,
      VERDE_2_CalmaFisica: 12,
      GIALLO_1_Gioia_Entusiasmo: 17,
      GIALLO_2_Volitivo_Passionale: 1,
      GRIGIO_1_Anaffettiva: 0,
      GRIGIO_2_Distaccata: 4,
      Stato_Animo_Finale: 'SA_SERENO,SA_CURIOSO',
      Difficolta_Test: 'DT_NO',
      Difficolta_Dettaglio: 'DD_NESSUNA',
      Area_Maggior_Agio: 'E,B,A',
      Area_Minor_Agio: 'D',
      Disposizione_Prevalente: 'Volitività',
      Sottodisposizione_Prevalente: 'Assertività',
      Portato_Esperienziale_Prevalente: 'Simpatia',
      Qualita_Suoni: 'QS_BUONI',
      Data_Ora_Fine_Test: { seconds: 1785578400, nanoseconds: 0 },
      versione_modello: '2025_v1',
    },
  }

  const rowValues = buildResearchMatrixRow(sampleRecord)
  assert.equal(rowValues.length, RESEARCH_MATRIX_HEADERS.length)

  const rowObj = Object.fromEntries(
    RESEARCH_MATRIX_HEADERS.map((header, idx) => [header, rowValues[idx]]),
  )

  // Verifica pseudonimo
  assert.equal(rowObj.ID_Soggetto, 'sample_rec_01')

  // Verifica età
  assert.equal(rowObj.Eta, '79')

  // Verifica dummy Stati d animo (SA_SERENO e SA_CURIOSO = 1, altri = 0)
  assert.equal(rowObj.SA_SERENO, '1')
  assert.equal(rowObj.SA_CURIOSO, '1')
  assert.equal(rowObj.SA_CONFUSO, '0')
  assert.equal(rowObj.SA_STANCO, '0')

  // Verifica dummy Area Maggior Agio ('E,B,A' -> A=1, B=1, E=1, C=0, D=0)
  assert.equal(rowObj.Area_Maggior_Agio_A, '1')
  assert.equal(rowObj.Area_Maggior_Agio_B, '1')
  assert.equal(rowObj.Area_Maggior_Agio_E, '1')
  assert.equal(rowObj.Area_Maggior_Agio_C, '0')
  assert.equal(rowObj.Area_Maggior_Agio_D, '0')

  // Verifica dummy Area Minor Agio ('D' -> D=1, altri=0)
  assert.equal(rowObj.Area_Minor_Agio_D, '1')
  assert.equal(rowObj.Area_Minor_Agio_A, '0')

  // Verifica data corretta senza [object Object]
  assert.equal(rowObj.Data_Ora_Fine_Test, '2026-08-01T10:00:00.000Z')

  // Verifica generazione CSV
  const csv = buildResearchMatrixCsv([sampleRecord])
  const lines = csv.split('\n')
  assert.equal(lines.length, 2)
  assert.ok(!csv.includes('[object Object]'))
  assert.ok(!csv.includes('FRANCO'))
})
