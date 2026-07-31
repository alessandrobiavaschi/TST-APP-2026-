# CODEX TASK

## Missione

Trasformare la Galassia lessicale del report TST in un sistema analitico interattivo: campo di forze lessicale, costellazioni semantiche, lessico stabile e situazionale, contrasti lessicali, firma personale e tracciabilità musica-parola, senza modificare il calcolo scientifico del test.

## Obiettivo

Realizzare il task in modo completo, coerente e verificabile, senza introdurre regressioni nel TST.

## Responsabilità

Codex è responsabile dell'intera consegna:

- architettura e flusso dei dati;
- business logic;
- calcoli e trasformazioni;
- contenuti del report;
- contratti tra moduli;
- refactoring strettamente necessario;
- componenti React e presentazione;
- layout, responsive e accessibilità;
- grafici, animazioni e interazioni;
- verifica reale nel browser;
- screenshot o walkthrough quando utili;
- test automatici;
- casi limite e gestione errori;
- regressioni;
- lint, typecheck e build;
- compatibilità e integrazione;
- report tecnico finale.

Claude Code e Antigravity non sono prerequisiti e non devono bloccare l'avanzamento. I loro branch e handoff esistenti possono essere consultati o integrati soltanto quando risultano utili e compatibili.

## Criteri di accettazione

- [ ] La missione è completata.
- [ ] Il comportamento esistente non pertinente resta invariato.
- [ ] I dati mostrati sono coerenti con i dati calcolati.
- [ ] Stati vuoti, dati mancanti ed errori prevedibili sono gestiti.
- [ ] La UI è verificata su desktop e mobile quando rilevante.
- [ ] Lint e build passano.
- [ ] I test rilevanti passano.
- [ ] Codex completa e verifica tutte le aree necessarie.
- [ ] Le modifiche completate sono documentate e committate.
- [ ] Nessun deploy senza richiesta esplicita dell'utente; nessuna modifica a credenziali o dati remoti.

## Regole operative

1. Leggere prima `AI_TASK.md`, `AGENTS.md` e la documentazione pertinente.
2. Lavorare nel worktree Codex sulla branch `ai/codex`, salvo diversa indicazione esplicita dell'utente.
3. Procedere in modalità singolo agente; non attendere Claude Code, Antigravity o crediti di servizi esterni.
4. Non modificare `master`.
5. Non fare stash, reset, rebase o force push.
6. Non modificare lockfile o configurazioni condivise senza necessità documentata.
7. Per ogni intervento, modificare solo i file pertinenti e preservare il comportamento non coinvolto.
8. Terminare con verifiche pertinenti, diff controllato, riepilogo tecnico e commit.
9. Eseguire il deploy solo su richiesta esplicita dell'utente e dopo avere verificato progetto, configurazione e build.
