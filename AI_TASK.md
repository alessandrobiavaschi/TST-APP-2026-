# AI PARALLEL TASK

## Missione
Ottimizzazione, allineamento grafico/funzionale e verifica visiva del Report Emotivo TST 2026, incluse le sezioni di calcolo, la vista Galassia, il comportamento responsivo e la stabilità complessiva.

## Stato iniziale
- Stack: React 19 + Vite 7 + Tailwind CSS 4 + Firebase (Auth & Firestore) + Recharts + Framer Motion
- Branch di partenza: `master`
- Comandi di avvio: `npm run dev` (avvia Vite su localhost:5173)
- Comandi di test: `npm run lint` (ESLint) e `npm run build` (nessuna test suite configurata)
- Vincoli esistenti:
  - Usare rigorosamente apici dritti (`'` o `"`) nei file JS/JSX/TS/TSX.
  - Seguire il design system e le classi CSS definite in `AGENTS.md` e `GUIDA_UI_UX.md`.
  - Non modificare i file condivisi ad alto rischio senza esplicito accordo.
- Bug o problema attuale: Mancanza di allineamento e verifica visiva in browser del refactoring delle sezioni del report, in particolare su viewport mobile.

## Criteri di accettazione
- [ ] Il comportamento richiesto è implementato (layout fluido, sezioni report complete, vista Galassia coerente).
- [ ] Non vengono introdotte regressioni nel calcolo dei punteggi delle correnti emotive e del portato esperienziale.
- [ ] Build e lint passano senza errori o warning critici.
- [ ] La UI viene verificata nel browser (desktop e mobile).
- [ ] Non vengono esposti dati o segreti (credenziali Firebase, chiavi API).
- [ ] Ogni agente produce il proprio handoff.
- [ ] Ogni agente esegue un commit sulla propria branch.

## Ownership

### Claude Code
Responsabile di:
- architettura;
- modello dati;
- business logic;
- stato applicativo;
- API interne;
- refactoring strutturali;
- documentazione tecnica.
Percorsi assegnati:
- `src/testLogic.js`
- `src/utils/buildReportData.js`
- `src/utils/reportRecordUtils.js`
- `src/content_report.json`
- `src/content/` (tutta la cartella dei testi)
File handoff:
`HANDOFF_CLAUDE.md`

### Antigravity
Responsabile di:
- componenti visivi;
- pagine;
- layout;
- responsive;
- accessibilità;
- interazioni;
- browser verification;
- screenshot e walkthrough.
Percorsi assegnati:
- `src/components/report/` (tutti i componenti visuali del report)
- `src/styles/` (fogli di stile dedicati al report)
- `src/pages/ReportPage.jsx`
- `src/App.css`
File handoff:
`HANDOFF_ANTIGRAVITY.md`

### Codex
Responsabile di:
- test;
- integrazione;
- gestione degli errori;
- controllo dei contratti;
- performance;
- sicurezza;
- regressioni;
- configurazione tecnica strettamente necessaria.
Percorsi assegnati:
- `test/` (se presenti script o utility di test)
- `eslint.config.js`
- `package.json`
- `vite.config.js`
File handoff:
`HANDOFF_CODEX.md`

## File condivisi ad alto rischio
Quanti segue non devono essere modificati senza una motivazione esplicita e condivisa:
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `firebase.json`
- `.env` e `.env.example`

## Regole
1. Ogni agente lavora esclusivamente nella propria branch e nel proprio worktree.
2. Nessun agente modifica direttamente `master`.
3. Nessun agente esegue deploy.
4. Nessun agente elimina dati o risorse.
5. Ogni cambiamento fuori ownership deve essere documentato nel relativo handoff.
6. Le decisioni dubbie devono privilegiare compatibilità e modifica minima.
