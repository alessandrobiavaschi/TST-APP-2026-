import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAuth } from '../AuthContext.jsx'
import { db } from '../firebaseConfig.js'
import { USERS_COLLECTION } from '../firestorePaths.js'
import {
  changeAccountPassword,
  setAccountPassword,
  updateUserDisplayName,
  userHasPasswordProvider,
} from '../auth.js'
import SkySettingsPanel from '../components/SkySettingsPanel.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function ProfilePage() {
  useDocumentTitle('Profilo')
  const { user: currentUser, authReady } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    ente: '',
    telefono: '',
    email: '',
  })
  const [displayName, setDisplayName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState({ error: '', ok: '' })
  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState({ error: '', ok: '' })
  const [newPwdA, setNewPwdA] = useState('')
  const [newPwdB, setNewPwdB] = useState('')
  const [settingPwd, setSettingPwd] = useState(false)
  const [linkPwdMsg, setLinkPwdMsg] = useState({ error: '', ok: '' })

  const hasPassword = currentUser ? userHasPasswordProvider(currentUser) : false

  useEffect(() => {
    if (!authReady) return
    if (!currentUser) {
      navigate('/home', { replace: true, state: { openLogin: true } })
      return
    }
    setDisplayName((currentUser.displayName || '').trim())
    if (!db) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const ref = doc(db, USERS_COLLECTION, currentUser.uid)
        const snap = await getDoc(ref)
        const data = snap.exists() ? snap.data() : {}
        setForm({
          nome: data.nome || '',
          cognome: data.cognome || '',
          ente: data.ente || '',
          telefono: data.telefono || '',
          email: currentUser.email || data.email || '',
        })
        if (!(currentUser.displayName || '').trim() && data.nome) {
          setDisplayName(String(data.nome).trim())
        }
      } catch (e) {
        console.error('Errore nel caricamento del profilo utente:', e)
        setError('Errore nel caricamento dei dati di contatto.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authReady, currentUser, navigate])

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!currentUser || !db) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const ref = doc(db, USERS_COLLECTION, currentUser.uid)
      await setDoc(
        ref,
        {
          email: currentUser.email || form.email || '',
          nome: form.nome,
          cognome: form.cognome,
          ente: form.ente,
          telefono: form.telefono,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      setSuccess('Dati aggiornati.')
    } catch (e) {
      console.error('Errore durante il salvataggio del profilo utente:', e)
      setError('Errore durante il salvataggio dei dati.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDisplayName = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    setNameSaving(true)
    setNameMsg({ error: '', ok: '' })
    try {
      await updateUserDisplayName(currentUser, displayName)
      setNameMsg({ error: '', ok: 'Nome visualizzato aggiornato.' })
    } catch (err) {
      setNameMsg({ error: err?.message || 'Operazione non riuscita.', ok: '' })
    } finally {
      setNameSaving(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    setLinkPwdMsg({ error: '', ok: '' })
    if (newPwdA.length < 6) {
      setLinkPwdMsg({ error: 'La password deve avere almeno 6 caratteri.', ok: '' })
      return
    }
    if (newPwdA !== newPwdB) {
      setLinkPwdMsg({ error: 'Le password non coincidono.', ok: '' })
      return
    }
    setSettingPwd(true)
    try {
      await setAccountPassword(currentUser, newPwdA)
      setNewPwdA('')
      setNewPwdB('')
      setLinkPwdMsg({
        error: '',
        ok: 'Password impostata. Ora puoi accedere anche con email e password.',
      })
    } catch (err) {
      setLinkPwdMsg({ error: err?.message || 'Operazione non riuscita.', ok: '' })
    } finally {
      setSettingPwd(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    setPwdMsg({ error: '', ok: '' })
    if (pwdNew.length < 6) {
      setPwdMsg({ error: 'La nuova password deve avere almeno 6 caratteri.', ok: '' })
      return
    }
    if (pwdNew !== pwdConfirm) {
      setPwdMsg({ error: 'Le nuove password non coincidono.', ok: '' })
      return
    }
    setPwdSaving(true)
    try {
      await changeAccountPassword(currentUser, pwdCurrent, pwdNew)
      setPwdCurrent('')
      setPwdNew('')
      setPwdConfirm('')
      setPwdMsg({ error: '', ok: 'Password aggiornata.' })
    } catch (err) {
      setPwdMsg({ error: err?.message || 'Impossibile aggiornare la password.', ok: '' })
    } finally {
      setPwdSaving(false)
    }
  }

  if (!authReady || loading) {
    return (
      <div className="page">
        <header className="page-header">
          <h1 className="page-title">Info di contatto</h1>
        </header>
        <section className="page-card">
          <p>Caricamento dati…</p>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="info-hero-card">
          <h1 className="page-title">Info di contatto</h1>
          <p className="page-subtitle">
            Aggiorna i dati del tuo account operatore. I risultati dei test restano collegati in modo
            univoco al tuo account.
          </p>
        </div>
      </header>
      <section className="page-card">
        <header className="page-card-header">
          <h2 className="page-card-title">Nome visualizzato</h2>
          <p className="page-card-subtitle">
            Come compare nell&apos;account Firebase (es. iniziali in header). Separato da nome/cognome
            anagrafici sotto.
          </p>
        </header>
        <form className="profile-form" onSubmit={handleSaveDisplayName}>
          <label className="profilazione-field">
            <span>Nome visualizzato</span>
            <input
              type="text"
              value={displayName}
              onChange={(ev) => setDisplayName(ev.target.value)}
              placeholder="Es. Mario Rossi"
            />
          </label>
          {nameMsg.error && <p className="auth-error">{nameMsg.error}</p>}
          {nameMsg.ok && <p className="auth-success">{nameMsg.ok}</p>}
          <div className="profilazione-actions">
            <button type="submit" className="nav-button secondary" disabled={nameSaving}>
              {nameSaving ? 'Salvataggio…' : 'Salva nome visualizzato'}
            </button>
          </div>
        </form>
      </section>
      <section className="page-card">
        <form className="profile-form" onSubmit={handleSubmit}>
          <header className="page-card-header">
            <h2 className="page-card-title">Dati di contatto</h2>
          </header>
          <div className="profile-grid">
            <label className="profilazione-field">
              <span>Nome</span>
              <input
                type="text"
                value={form.nome}
                onChange={handleChange('nome')}
                placeholder="Nome"
              />
            </label>
            <label className="profilazione-field">
              <span>Cognome</span>
              <input
                type="text"
                value={form.cognome}
                onChange={handleChange('cognome')}
                placeholder="Cognome"
              />
            </label>
            <label className="profilazione-field">
              <span>Ente / struttura</span>
              <input
                type="text"
                value={form.ente}
                onChange={handleChange('ente')}
                placeholder="Es. Istituto, comunità, cooperativa…"
              />
            </label>
            <label className="profilazione-field">
              <span>Telefono</span>
              <input
                type="text"
                value={form.telefono}
                onChange={handleChange('telefono')}
                placeholder="Numero di telefono"
              />
            </label>
            <label className="profilazione-field profile-email-field">
              <span>Email (non modificabile)</span>
              <input type="email" value={form.email} disabled />
            </label>
          </div>
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
          <div className="profilazione-actions">
            <button
              type="submit"
              className="nav-button primary"
              disabled={saving}
            >
              {saving ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
          </div>
        </form>
      </section>
      {hasPassword && (
        <section className="page-card">
          <header className="page-card-header">
            <h2 className="page-card-title">Password</h2>
            <p className="page-card-subtitle">
              Inserisci la password attuale e scegli una nuova password per l&apos;accesso con email.
            </p>
          </header>
          <form className="profile-form" onSubmit={handleChangePassword}>
            <div className="profile-grid">
              <label className="profilazione-field">
                <span>Password attuale</span>
                <input
                  type="password"
                  value={pwdCurrent}
                  onChange={(ev) => setPwdCurrent(ev.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className="profilazione-field">
                <span>Nuova password</span>
                <input
                  type="password"
                  value={pwdNew}
                  onChange={(ev) => setPwdNew(ev.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label className="profilazione-field">
                <span>Conferma nuova password</span>
                <input
                  type="password"
                  value={pwdConfirm}
                  onChange={(ev) => setPwdConfirm(ev.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </div>
            {pwdMsg.error && <p className="auth-error">{pwdMsg.error}</p>}
            {pwdMsg.ok && <p className="auth-success">{pwdMsg.ok}</p>}
            <div className="profilazione-actions">
              <button type="submit" className="nav-button secondary" disabled={pwdSaving}>
                {pwdSaving ? 'Aggiornamento…' : 'Aggiorna password'}
              </button>
            </div>
          </form>
        </section>
      )}
      {!hasPassword && currentUser && (
        <section className="page-card">
          <header className="page-card-header">
            <h2 className="page-card-title">Imposta una password</h2>
            <p className="page-card-subtitle">
              Hai eseguito l&apos;accesso con Google. Puoi aggiungere una password a questo account
              ({currentUser.email}) per poter accedere anche con email e password.
            </p>
          </header>
          <form className="profile-form" onSubmit={handleSetPassword}>
            <div className="profile-grid">
              <label className="profilazione-field">
                <span>Nuova password</span>
                <input
                  type="password"
                  value={newPwdA}
                  onChange={(ev) => setNewPwdA(ev.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                />
              </label>
              <label className="profilazione-field">
                <span>Conferma nuova password</span>
                <input
                  type="password"
                  value={newPwdB}
                  onChange={(ev) => setNewPwdB(ev.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                />
              </label>
            </div>
            {linkPwdMsg.error && <p className="auth-error">{linkPwdMsg.error}</p>}
            {linkPwdMsg.ok && <p className="auth-success">{linkPwdMsg.ok}</p>}
            <div className="profilazione-actions">
              <button type="submit" className="nav-button secondary" disabled={settingPwd}>
                {settingPwd ? 'Impostazione…' : 'Imposta password'}
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="page-card">
        <header className="page-card-header">
          <h2 className="page-card-title">Impostazioni visive</h2>
          <p className="page-card-subtitle">
            Definisci come deve comportarsi il cielo dinamico di sfondo durante l’uso dell’app.
          </p>
        </header>
        <SkySettingsPanel />
      </section>
    </div>
  )
}

export default ProfilePage
