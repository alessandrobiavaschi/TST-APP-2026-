# AI PARALLEL TASK

## Missione

Trasformare la Galassia lessicale del report TST in un sistema analitico interattivo: campo di forze lessicale, costellazioni semantiche, lessico stabile e situazionale, contrasti lessicali, firma personale e tracciabilità musica-parola, senza modificare il calcolo scientifico del test.

## Obiettivo comune

Realizzare il task in modo completo, coerente e verificabile, senza introdurre regressioni nel TST.

## Divisione del lavoro

### Claude Code — logica e contenuti

Responsabile di:
- architettura e flusso dei dati;
- business logic;
- calcoli e trasformazioni;
- contenuti del report;
- contratti tra moduli;
- refactoring strettamente necessario.

Non deve occuparsi del ridisegno visivo, salvo modifiche minime indispensabili al contratto dati.

Consegna:
- `HANDOFF_CLAUDE.md`
- commit sulla branch `ai/claude`

### Antigravity — interfaccia e verifica visiva

Responsabile di:
- componenti React e presentazione;
- layout, responsive e accessibilità;
- grafici, animazioni e interazioni;
- verifica reale nel browser;
- screenshot o walkthrough.

Non deve modificare la logica di calcolo del TST.

Consegna:
- `HANDOFF_ANTIGRAVITY.md`
- commit sulla branch `ai/antigravity`

### Codex — test, robustezza e integrazione

Responsabile di:
- test automatici;
- casi limite e gestione errori;
- regressioni;
- lint, typecheck e build;
- compatibilità tra i contributi;
- report tecnico per l'integrazione.

Non deve ridisegnare la UI o riscrivere la logica principale senza motivazione documentata.

Consegna:
- `HANDOFF_CODEX.md`
- commit sulla branch `ai/codex`

## Criteri di accettazione

- [ ] La missione è completata.
- [ ] Il comportamento esistente non pertinente resta invariato.
- [ ] I dati mostrati sono coerenti con i dati calcolati.
- [ ] Stati vuoti, dati mancanti ed errori prevedibili sono gestiti.
- [ ] La UI è verificata su desktop e mobile quando rilevante.
- [ ] Lint e build passano.
- [ ] I test rilevanti passano.
- [ ] Ogni agente modifica solo la propria area.
- [ ] Ogni agente produce handoff e commit.
- [ ] Nessun deploy o modifica a credenziali e dati remoti.

## Regole operative

1. Leggere prima `AI_TASK.md`, `AGENTS.md` e le istruzioni specifiche del proprio agente.
2. Usare la skill `parallel-delivery`.
3. Lavorare esclusivamente nel proprio worktree e branch.
4. Non modificare `master`.
5. Non fare stash, reset, rebase o force push.
6. Non modificare lockfile o configurazioni condivise senza necessità documentata.
7. Terminare con diff controllato, handoff e commit.
