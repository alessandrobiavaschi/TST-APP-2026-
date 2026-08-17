import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GalassiaView from './components/report/GalassiaView.jsx'
import { EXAMPLE_CORRENT_DATA } from './utils/galassiaData.js'

const EXAMPLE_RAPPORTI = [
  {
    id: 'natura',
    nome: 'Natura di base',
    composizione: 'Timbro + Intervalli + Armonia',
    definizione: 'Impronta emotiva di fondo.',
    cosaIndica: 'Come risuoni nel profondo.',
    correntePrincipale: { nome: 'Flemmatica', colore: '#22c55e' },
    datiRadar: [
      { corrente: 'Malinconica', valore: 3 },
      { corrente: 'Marziale', valore: 4 },
      { corrente: 'Flemmatica', valore: 6 },
      { corrente: 'Entusiasta', valore: 2 },
      { corrente: 'Razionale', valore: 1 },
    ],
  },
  {
    id: 'se',
    nome: 'Rapporto con te stesso',
    composizione: 'Intervalli + Melodia',
    definizione: 'Monologo interiore e riflessione.',
    cosaIndica: 'Spazio per l’interiorità.',
    correntePrincipale: { nome: 'Malinconica', colore: '#3b82f6' },
    datiRadar: [
      { corrente: 'Malinconica', valore: 5 },
      { corrente: 'Marziale', valore: 3 },
      { corrente: 'Flemmatica', valore: 4 },
      { corrente: 'Entusiasta', valore: 2 },
      { corrente: 'Razionale', valore: 2 },
    ],
  },
  {
    id: 'altro',
    nome: 'Rapporto con l’Altro',
    composizione: 'Timbro + Melodia',
    definizione: 'Disposizione relazionale.',
    cosaIndica: 'Come entri in contatto.',
    correntePrincipale: { nome: 'Entusiasta', colore: '#eab308' },
    datiRadar: [
      { corrente: 'Malinconica', valore: 2 },
      { corrente: 'Marziale', valore: 5 },
      { corrente: 'Flemmatica', valore: 3 },
      { corrente: 'Entusiasta', valore: 6 },
      { corrente: 'Razionale', valore: 1 },
    ],
  },
  {
    id: 'agire',
    nome: 'Rapporto con l’Agire',
    composizione: 'Ritmo + Melodia',
    definizione: 'Energia volitiva e azione.',
    cosaIndica: 'Quanto ti muovi o sostai.',
    correntePrincipale: { nome: 'Marziale', colore: '#ef4444' },
    datiRadar: [
      { corrente: 'Malinconica', valore: 2 },
      { corrente: 'Marziale', valore: 7 },
      { corrente: 'Flemmatica', valore: 4 },
      { corrente: 'Entusiasta', valore: 3 },
      { corrente: 'Razionale', valore: 1 },
    ],
  },
]

const EXAMPLE_PORTATO = {
  prevalente: 'Simpatia',
  prevalenteLabel: 'Simpatia',
  descrizione: 'Tendenza al coinvolgimento e al piacere verso gli stimoli.',
  dimensioni: [
    { key: 'Simpatia', label: 'Simpatia', valore: 42, percentuale: 52, definizioneBreve: 'Attrazione e coinvolgimento.' },
    { key: 'Antipatia', label: 'Antipatia', valore: 24, percentuale: 30, definizioneBreve: 'Distanza o fastidio selettivo.' },
    { key: 'Indifferenza', label: 'Indifferenza', valore: 15, percentuale: 18, definizioneBreve: 'Distacco e neutralità.' },
  ],
  hasData: true,
}

const EXAMPLE_PAROLE = [
  { parola: 'Calmo', corrente: 'Flemmatica', colore: '#22c55e' },
  { parola: 'Sereno', corrente: 'Flemmatica', colore: '#22c55e' },
  { parola: 'Determinato', corrente: 'Marziale', colore: '#ef4444' },
  { parola: 'Nostalgico', corrente: 'Malinconica', colore: '#3b82f6' },
  { parola: 'Vivace', corrente: 'Entusiasta', colore: '#eab308' },
]

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <main style={{ height: '100svh', minHeight: 0, overflow: 'hidden' }}>
      <GalassiaView
        correntData={EXAMPLE_CORRENT_DATA}
        rapporti={EXAMPLE_RAPPORTI}
        portato={EXAMPLE_PORTATO}
        paroleEmerse={EXAMPLE_PAROLE}
      />
    </main>
  </React.StrictMode>,
)
