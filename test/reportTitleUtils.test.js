import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildFamilyProfileSectionTitle,
  buildProfileSectionTitle,
  formatReportDisposition,
  resolveProfileFamilyLabel,
} from '../src/utils/reportTitleUtils.js'

test('aggiunge la caratteristica emotiva tra parentesi al titolo del profilo', () => {
  assert.equal(
    buildProfileSectionTitle(
      'La tua natura emotiva di appartenenza',
      'VOLITIVO-COLLERICA',
    ),
    'La tua natura emotiva di appartenenza (Volitivo-Collerica)',
  )
})

test('normalizza le diciture salvate ed evita parentesi vuote', () => {
  assert.equal(formatReportDisposition('NATURA INTELLETTUALE-RAZIONALE'), 'Intellettuale-Razionale')
  assert.equal(buildProfileSectionTitle('Titolo', ''), 'Titolo')
  assert.equal(buildProfileSectionTitle('Titolo'), 'Titolo')
})

test('distingue la famiglia dalla natura nel titolo del profilo', () => {
  assert.equal(
    buildFamilyProfileSectionTitle(
      'La tua natura emotiva di appartenenza',
      'MARZIALE',
    ),
    'La tua natura emotiva di appartenenza (Famiglia Marziale)',
  )
  assert.equal(buildFamilyProfileSectionTitle('Titolo'), 'Titolo')
})

test('usa il nome pubblico della famiglia invece della chiave colore', () => {
  assert.equal(
    resolveProfileFamilyLabel({ correnteDominante: 'Marziale' }, 'Rosso'),
    'Marziale',
  )
  assert.equal(
    resolveProfileFamilyLabel({ famigliaLabel: 'Marziale' }, 'Rosso'),
    'Marziale',
  )
  assert.equal(resolveProfileFamilyLabel({}, 'Rosso'), 'Rosso')
})
