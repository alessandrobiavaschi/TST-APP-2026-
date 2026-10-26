import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getSingleRecordMatrixFilename,
  buildSingleRecordMatrixCsv,
  downloadCsvSingleRecordGestionale,
} from '../src/utils/reportRecordUtils.js'
import { parseMatriceCsv, assertMatriceHeaderLooksValid } from '../src/utils/matriceCsv.js'
import { testSchema } from '../src/dbSchema.js'

test('getSingleRecordMatrixFilename genera nomi file puliti e sicuri', () => {
  const rec1 = {
    raw: {
      Nome: 'Franco',
      Cognome: 'Adissum',
      Data_Ora_Fine_Test: '2026-08-01T10:00:00Z',
    },
  }
  assert.equal(getSingleRecordMatrixFilename(rec1), 'tst_matrice_Franco_Adissum_2026-08-01.csv')

  const rec2 = {
    raw: {
      Nome: 'Alessandro',
      Cognome: 'Biavaschi',
      Data_Test: '2026-10-26',
    },
  }
  assert.equal(getSingleRecordMatrixFilename(rec2), 'tst_matrice_Alessandro_Biavaschi_2026-10-26.csv')

  const rec3 = {
    raw: {
      Nome: 'Mario Rossi / Test',
      Data_Ora_Fine_Test: { seconds: 1785578400, nanoseconds: 0 },
    },
  }
  const name3 = getSingleRecordMatrixFilename(rec3)
  assert.ok(!name3.includes('/'), 'Il nome file non deve contenere slash')
  assert.ok(name3.startsWith('tst_matrice_Mario_Rossi'), 'Il prefisso deve contenere il nome normalizzato')
  assert.ok(name3.endsWith('.csv'))

  const recEmpty = { raw: {} }
  assert.equal(getSingleRecordMatrixFilename(recEmpty), 'tst_matrice_test.csv')
  assert.equal(getSingleRecordMatrixFilename(null), 'tst_matrice_singola.csv')
})

test('buildSingleRecordMatrixCsv genera una matrice valida e re-importabile da TST', () => {
  const sampleRecord = {
    id: 'test_rec_99',
    raw: {
      areaId: 'area_beta_1',
      Nome: 'Mario',
      Cognome: 'Rossi',
      Data_Nascita: '1985-05-15',
      Titolo_Studio: 'LAUREA',
      Pratica_Musicale: 'SI',
      Strumento_Suonato: 'Pianoforte',
      File_01: 'opzione1',
      File_02: 'opzione2',
      File_72: 'opzione5',
      PE_Simpatia: 40,
      PE_Antipatia: 20,
      PE_Indifferenza: 12,
      BLU_1_Depressiva: 3,
      ROSSO_1_Assertivita: 10,
      VERDE_1_CalmaContemplativa: 4,
      GIALLO_1_Gioia_Entusiasmo: 8,
      GRIGIO_1_Anaffettiva: 2,
      Disposizione_Prevalente: 'Volitività',
      Sottodisposizione_Prevalente: 'Assertività',
      Portato_Esperienziale_Prevalente: 'Simpatia',
      Data_Ora_Fine_Test: '2026-10-26T12:00:00.000Z',
      versione_modello: '2026_v4',
    },
  }

  const csv = buildSingleRecordMatrixCsv(sampleRecord)
  assert.ok(csv, 'Il CSV generato non deve essere vuoto')

  const lines = csv.split('\n')
  assert.equal(lines.length, 2, 'Il CSV deve contenere esattamente intestazione e 1 riga dati')

  const headers = lines[0].split(',')
  assertMatriceHeaderLooksValid(headers)
  assert.equal(headers[0], 'id')
  assert.equal(headers[1], 'areaId')
  assert.ok(headers.includes('File_01'))
  assert.ok(headers.includes('File_72'))
  assert.ok(headers.includes('Disposizione_Prevalente'))

  // Verifica che il parse di TST lo riconosca e lo importi senza errori
  const { payloads, rowCount } = parseMatriceCsv(csv)
  assert.equal(rowCount, 1)
  assert.equal(payloads.length, 1)

  const imported = payloads[0]
  assert.equal(imported.areaId, 'area_beta_1')
  assert.equal(imported.Nome, 'Mario')
  assert.equal(imported.Cognome, 'Rossi')
  assert.equal(imported.Strumento_Suonato, 'Pianoforte')
  assert.equal(imported.File_01, 'opzione1')
  assert.equal(imported.PE_Simpatia, 40)
  assert.equal(imported.Disposizione_Prevalente, 'Volitività')
})

test('downloadCsvSingleRecordGestionale restituisce CSV conforme a testSchema', () => {
  const sample = {
    id: 'single_doc_01',
    raw: {
      Nome: 'Laura',
      Cognome: 'Bianchi',
      File_01: 'Risposta1',
    },
  }

  const csv = downloadCsvSingleRecordGestionale(sample)
  assert.ok(csv.startsWith('id,areaId,'))
  assert.ok(csv.includes('Laura Bianchi'))
  assert.ok(csv.includes('Risposta1'))
})
