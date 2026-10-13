import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function LocalDeveloperPage({ section }) {
  const isResults = section === 'results'
  useDocumentTitle(isResults ? 'Risultati locali' : 'Profilo di sviluppo')
  const navigate = useNavigate()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{isResults ? 'Risultati locali' : 'Profilo di sviluppo'}</h1>
      </header>
      <section className="page-card">
        <p>
          {isResults
            ? 'La modalita sviluppo non legge l\'archivio Firebase. Completa un test locale per aprire e verificare il report senza salvare dati remoti.'
            : 'Questa e una sessione tecnica locale: non esiste un profilo Firebase associato e nessun dato account puo essere modificato.'}
        </p>
        <div className="report-final-actions-buttons">
          <button
            type="button"
            className="nav-button primary"
            onClick={() => navigate(isResults ? '/nuovo-test' : '/home')}
          >
            {isResults ? 'Avvia un test locale' : 'Torna alla mia area'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default LocalDeveloperPage
