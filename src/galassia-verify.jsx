import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GalassiaView from './components/report/GalassiaView.jsx'
import { EXAMPLE_CORRENT_DATA } from './utils/galassiaData.js'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <main style={{ height: '100svh', minHeight: 0, overflow: 'hidden' }}>
      <GalassiaView correntData={EXAMPLE_CORRENT_DATA} />
    </main>
  </React.StrictMode>,
)
