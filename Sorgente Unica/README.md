# Sorgente Unica

Fonte unica di verità per il "team di agenti" del progetto TST 2026, condivisa tra i diversi tool AI usati sul repo:

- `claude-code/` — definizioni/istruzioni per Claude Code (oggi in `CLAUDE.md`)
- `codex/` — definizioni/istruzioni per Codex (oggi in `AGENTS.md`)
- `cursor/` — definizioni/istruzioni per Cursor (oggi in `.cursor/agents/`)
- `antigravity/` — definizioni/istruzioni per Antigravity (non ancora presente nel repo)

Scopo: evitare che le regole di progetto (stack, architettura, convenzioni) vengano duplicate e divergano tra `AGENTS.md`, `CLAUDE.md` e `.cursor/agents/*`, mantenendo qui la versione di riferimento.

Le cartelle sono al momento vuote (solo placeholder `.gitkeep`): il contenuto va definito nel prossimo passaggio, decidendo insieme:
1. cosa resta comune a tutti i tool (es. stack, architettura, convenzioni UI) vs. cosa è specifico di un singolo tool;
2. se i file esistenti (`AGENTS.md`, `CLAUDE.md`, `.cursor/agents/*`) diventano wrapper che referenziano questa cartella, o vengono generati a partire da essa.
