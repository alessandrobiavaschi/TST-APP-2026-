---
name: parallel-delivery
description: Orchestrate safe parallel software development across separate Git branches or worktrees. Use when multiple coding agents work simultaneously on different parts of the same project and need clear ownership, verification, commits, and integration handoffs.
---

# Parallel Delivery

## Objective

Complete the assigned portion of a larger development task without creating conflicts with other agents.

## Mandatory procedure

1. Read `AI_TASK.md` completely.
2. Inspect `AGENTS.md`, `CLAUDE.md`, package scripts, and relevant documentation.
3. Confirm the current Git branch and assigned ownership.
4. Explore the codebase before editing.
5. Divide investigation and review work among read-only subagents when available.
6. Modify only files and directories assigned to this agent.
7. Do not alter another agent's owned files unless strictly required.
8. Do not deploy, publish, migrate production data, delete resources, or rotate credentials.
9. Never expose secrets, `.env` values, API keys, or private user data.
10. Prefer the smallest coherent implementation satisfying the acceptance criteria.
11. Run the relevant lint, typecheck, tests, and build commands.
12. Inspect the final Git diff for accidental changes.
13. Create the required handoff document.
14. Commit the completed work to the current branch.

## Conflict prevention

- Do not modify lockfiles unless the task genuinely requires a dependency change.
- Do not reformat unrelated files.
- Do not rename public interfaces without documenting the migration.
- Preserve backward compatibility unless `AI_TASK.md` explicitly allows breaking changes.
- When another component is unavailable, use a typed interface, adapter, or temporary stub rather than modifying another agent's area.

## Required handoff

Include:

- summary of the implementation;
- changed files;
- decisions and assumptions;
- commands executed;
- test and build results;
- unresolved problems;
- integration instructions;
- expected browser behavior when relevant.

## Completion standard

Complete the work only when:

- the assigned acceptance criteria are satisfied;
- relevant verification has passed;
- no unrelated files were modified;
- the handoff is complete;
- the branch contains a clear commit.
