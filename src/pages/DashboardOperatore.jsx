import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, deleteUser } from 'firebase/auth'
import { useAuth } from '../AuthContext.jsx'
import { auth } from '../firebaseConfig.js'

function DashboardOperatore() {
  const { user: currentUser, authReady } = useAuth()
  const navigate = useNavigate()
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')

  const handleLogout = async () => {
    setAccountError('')
    setAccountMessage('')
    try {
      if (auth) {
        await signOut(auth)
        setAccountMessage('Sei stato disconnesso.')
      }
    } catch (err) {
      setAccountError(err.message || 'Errore durante la disconnessione.')
    }
  }

  const handleDeleteAccount = async () => {
    setAccountError('')
    setAccountMessage('')
    if (!currentUser) {
      setAccountError('Nessun utente autenticato.')
      return
    }
    const confirmed = window.confirm(
      'Sei sicuro di voler cancellare definitivamente il tuo account operatore? Questa azione non è reversibile.',
    )
    if (!confirmed) return
    try {
      await deleteUser(currentUser)
      setAccountMessage('Il tuo account è stato cancellato. Puoi registrarti nuovamente in futuro.')
    } catch (err) {
      if (err?.code === 'auth/requires-recent-login') {
        setAccountError(
          'Per cancellare l’account devi prima effettuare nuovamente il login, poi riprovare.',
        )
      } else {
        setAccountError(err.message || "Errore durante l'eliminazione dell'account.")
      }
    }
  }

  useEffect(() => {
    if (!authReady) return
    if (!currentUser) {
      navigate('/home', { replace: true, state: { openLogin: true } })
    }
  }, [authReady, currentUser, navigate])

  return (
    <div className="page">
      <header className="page-header">
        <div className="info-hero-card">
          <h1 className="page-title">Dashboard operatore</h1>
          <p className="page-subtitle">
            La musica come lente sull'identità emotiva dei tuoi pazienti. Questa dashboard è il tuo laboratorio di ascolto: qui prepari, racconti e rileggi i percorsi TST.
          </p>
        </div>
      </header>
      <section className="page-card">
        <div className="account-management">
          <h2>Gestione account operatore</h2>
          {currentUser ? (
            <p>
              Utente collegato: <strong>{currentUser.email}</strong>
            </p>
          ) : (
            <p>Accedi come operatore per gestire il tuo account.</p>
          )}
          {accountError && <p className="auth-error">{accountError}</p>}
          {accountMessage && <p className="auth-success">{accountMessage}</p>}
          {currentUser && (
            <div className="account-actions">
              <button type="button" className="auth-secondary-button" onClick={handleLogout}>
                Esci
              </button>
              <button type="button" className="auth-link-button" onClick={handleDeleteAccount}>
                Cancella definitivamente il mio account
              </button>
            </div>
          )}
        </div>

        <p>
          Accesso come operatore attivo. La dashboard analitica dedicata verrà implementata qui a
          partire dai dati Firestore filtrati per il tuo identificativo utente.
        </p>

        <div className="home-institutional-text">
          <p>
            Questo Test è un primo concreto esempio di un uso della Musica a fini umanistici. Utilizza
            gli elementi del codice musicale come naturali strumenti suscitatori di emozioni e stati
            d&apos;animo, e i suoni di diverse famiglie di strumenti musicali come mezzi per l&apos;osservazione
            dell&apos;area del sentire individuale: l&apos;area emotiva e affettiva.
          </p>
          <p>
            È uno <strong>strumento per l&apos;osservazione dell&apos;area del sentire</strong>: attraverso gli stimoli
            sonori si esplorano le reazioni emotive e affettive della persona, al di là della sfera
            cognitiva.
          </p>
          <p>
            Le radici filosofiche e intellettuali di questo Test, che associa le percezioni emotive ai
            flussi musicali, sono esplicitate in termini tecnici in letteratura dedicata. La Musica è
            un&apos;arte antichissima, un linguaggio universale che qui è utilizzato in una visione che
            supera il consueto utilizzo formale creativo, espressivo, performativo, spettacolare e commerciale.
          </p>
          <p>
            I flussi musicali vengono così utilizzati come <strong>strumenti rivelatori di aspetti interiori che
            vanno oltre la sfera cognitiva</strong>: flussi di suono mossi da energia emotiva che, vibrando per
            simpatia o antipatia, entrano in contatto in modo diretto con la parte più sacra e privata
            della persona, rivelando le singole qualità temperamentali individuali e fornendo un quadro
            esaustivo della singola identità emotiva.
          </p>
          <p>
            Il Test può essere eseguito e fatto decodificare da professionisti autorizzati. Nella
            versione informatica viene utilizzato un linguaggio assemblato in modo automatico ma con
            un uso di parole controllato dal comitato scientifico che rispecchia in modo corretto il
            rapporto tra suoni, emozioni e caratteristiche temperamentali.
          </p>
          <p>
            Come negli studi che hanno generato il Test, la Musica è utilizzata come <strong>strumento
            rivelatore del portato umanistico temperamentale</strong> delle persone. Il metodo nasce dalla
            sperimentazione in <strong>13 istituti di pena</strong> italiani, per ricavare preziose informazioni
            preventive sull&apos;identità emotiva.
          </p>
          <p className="home-ps">
            PS – Se ne consiglia l&apos;uso a partire dal sedicesimo anno di età.
          </p>
        </div>
      </section>
    </div>
  )
}

export default DashboardOperatore

