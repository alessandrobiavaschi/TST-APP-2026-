import React from 'react'
import LogoBlock from '../components/LogoBlock.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

function InfoPage() {
  useDocumentTitle('Informazioni')
  return (
    <div className="page info-page">
      <header className="page-header info-hero">
        <div className="info-hero-card section-hero-card section-hero-card--newtest">
          <h1 className="section-hero-title">Contatti</h1>
          <p className="section-hero-subtitle">
            Crediti, certificazioni, contatti istituzionali e informazioni sul Test Temperamentale.
          </p>
        </div>
      </header>

      <section className="info-section info-contacts--refined">
        <div className="info-card info-card--stacked">
          <h2 className="info-section-title">Contatti e partner</h2>
          <div className="info-grid">
            <div className="info-card info-card--partner">
              <p className="info-partner-name">
                <strong>MUSSIDA MUSIC PUBLISHING SRL</strong>
              </p>
              <p className="info-partner-line">
                VIA ELIO REGUZZONI, 15 | 20125 MILANO | ITALY
              </p>
              <p className="info-partner-line">
                <strong>T</strong> +39 02 641146.1&nbsp;|&nbsp;<strong>F</strong> +39 02 641146.23
              </p>
              <p className="info-partner-line">
                <strong>P.I. / C.F.</strong> 05345880966&nbsp;|&nbsp;<strong>REA:</strong> MI-1814294
              </p>
              <p className="info-partner-line">
                <strong>CAPITALE SOCIALE</strong> 25.000,00 I.V.
              </p>
            </div>
            <div className="info-card info-card--contacts">
              <h3 className="info-card-subtitle">Contatti</h3>
              <p>
                Per informazioni generali sul Test Temperamentale e sui percorsi formativi collegati,
                puoi fare riferimento ai seguenti contatti istituzionali.
              </p>
              <p className="info-contacts-links">
                <a href="https://www.cpm.it" target="_blank" rel="noopener noreferrer">
                  www.cpm.it
                </a>
                {' · '}
                <a href="mailto:corsi@cpm.it">corsi@cpm.it</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section" id="privacy">
        <h2 className="info-section-title">Informativa privacy e GDPR</h2>
        <div className="info-card info-card--legal">
          <p>
            Il trattamento dei dati personali raccolti tramite il Test Temperamentale avviene nel
            rispetto del Regolamento (UE) 2016/679 (&quot;GDPR&quot;) e della normativa nazionale vigente.
            I dati vengono utilizzati esclusivamente per consentire l&apos;erogazione del servizio, la
            gestione dell&apos;account e, ove previsto, per scopi statistici in forma aggregata e anonima.
          </p>
          <p>
            Ogni account operatore ha un proprio archivio separato: i risultati dei test che svolgi o gestisci
            con il tuo account vengono salvati in un archivio dedicato e non sono visibili da altri account.
            L&apos;accesso ai dati è tecnicamente limitato tramite credenziali personali e regole di sicurezza
            applicate sul database (ogni test è legato in modo univoco all&apos;operatore che lo ha generato).
          </p>
          <p>
            La base giuridica del trattamento è l&apos;esecuzione del contratto (art. 6, par. 1, lett. b GDPR)
            e, per eventuali attività facoltative (ad es. comunicazioni informative o analisi aggiuntive),
            il consenso dell&apos;interessato (art. 6, par. 1, lett. a GDPR).
          </p>
          <p>
            I dati sono conservati per il tempo strettamente necessario al perseguimento delle finalità
            sopra indicate e non vengono ceduti a terzi per finalità di marketing. L&apos;utente può in
            qualsiasi momento esercitare i diritti di accesso, rettifica, cancellazione, limitazione del
            trattamento, portabilità e opposizione scrivendo all&apos;indirizzo email indicato nella sezione
            &quot;Contatti&quot; di questa pagina.
          </p>
          <p>
            Per informazioni complete sull&apos;informativa privacy (inclusi i dettagli sui responsabili del
            trattamento, eventuali trasferimenti extra-UE e le categorie dettagliate di dati trattati) ti
            invitiamo a richiedere il testo integrale all&apos;indirizzo email ufficiale indicato nei contatti.
          </p>
        </div>
      </section>

      <section className="info-section info-certifications--compact">
        <LogoBlock
          logos={[
            '/logos/ACCREDITAMENTO N°0493.svg',
            '/logos/ACCREDITAMENTO N°0493-2.svg',
            '/logos/ACCREDITAMENTO N°0493-3.svg',
          ]}
          text={
            <>
              Accreditamento N° 0493 - UNI EN 9001:2008
              <br />
              Certificato N° 006/14
            </>
          }
          className="landing-logo-block landing-logo-block--horizontal landing-logo-block--compact"
        />
      </section>
    </div>
  )
}

export default InfoPage

