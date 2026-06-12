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
    correntePrincipale: { nome: 'Calma', colore: '#22c55e' },
    datiRadar: [
      { corrente: 'Malinconia', valore: 3 },
      { corrente: 'Volitività', valore: 4 },
      { corrente: 'Calma', valore: 6 },
      { corrente: 'Entusiasmo', valore: 2 },
      { corrente: 'Anaffettività', valore: 1 },
    ],
  },
  {
    id: 'se',
    nome: 'Rapporto con te stesso',
    composizione: 'Intervalli + Melodia',
    definizione: 'Monologo interiore e riflessione.',
    cosaIndica: 'Spazio per l’interiorità.',
    correntePrincipale: { nome: 'Malinconia', colore: '#3b82f6' },
    datiRadar: [
      { corrente: 'Malinconia', valore: 5 },
      { corrente: 'Volitività', valore: 3 },
      { corrente: 'Calma', valore: 4 },
      { corrente: 'Entusiasmo', valore: 2 },
      { corrente: 'Anaffettività', valore: 2 },
    ],
  },
  {
    id: 'altro',
    nome: 'Rapporto con l’Altro',
    composizione: 'Timbro + Melodia',
    definizione: 'Disposizione relazionale.',
    cosaIndica: 'Come entri in contatto.',
    correntePrincipale: { nome: 'Entusiasmo', colore: '#eab308' },
    datiRadar: [
      { corrente: 'Malinconia', valore: 2 },
      { corrente: 'Volitività', valore: 5 },
      { corrente: 'Calma', valore: 3 },
      { corrente: 'Entusiasmo', valore: 6 },
      { corrente: 'Anaffettività', valore: 1 },
    ],
  },
  {
    id: 'agire',
    nome: 'Rapporto con l’Agire',
    composizione: 'Ritmo + Melodia',
    definizione: 'Energia volitiva e azione.',
    cosaIndica: 'Quanto ti muovi o sostai.',
    correntePrincipale: { nome: 'Volitività', colore: '#ef4444' },
    datiRadar: [
      { corrente: 'Malinconia', valore: 2 },
      { corrente: 'Volitività', valore: 7 },
      { corrente: 'Calma', valore: 4 },
      { corrente: 'Entusiasmo', valore: 3 },
      { corrente: 'Anaffettività', valore: 1 },
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
  { parola: 'Calmo', corrente: 'Calma', colore: '#22c55e' },
  { parola: 'Sereno', corrente: 'Calma', colore: '#22c55e' },
  { parola: 'Determinato', corrente: 'Volitività', colore: '#ef4444' },
  { parola: 'Nostalgico', corrente: 'Malinconia', colore: '#3b82f6' },
  { parola: 'Vivace', corrente: 'Entusiasmo', colore: '#eab308' },
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
