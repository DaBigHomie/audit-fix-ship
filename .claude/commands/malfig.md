<!-- GENERATED FROM maximus-ai/.claude/commands/malfig.md -- do not edit; run sync-commands.mts -->
# MALFIG Gatekeeper Review (`/malfig`)

Run a MALFIG compliance review against the current repo and session work.

## Steps

1. Identify the active repo:
```bash
git rev-parse --show-toplevel 2>/dev/null && git branch --show-current
```

2. Load authority stack in order:
   - Repo root `CLAUDE.md`
   - Repo root `AGENTS.md` + `.github/copilot-instructions.md`
   - Path-scoped `.github/instructions/*.instructions.md` for touched areas
   - Full spec: `~/management-git/.github/agents/malfig-gatekeeper.agent.md`

3. Check all five gatekeeper requirements:

| ID | Requirement |
|----|-------------|
| G1 | Compliance text is plain — no emoji in verdicts |
| G2 | Layer/import rules match active repo AGENTS.md |
| G3 | No orphaned `package.json` under `src/` where forbidden |
| G4 | Tracked-task repos: state-sync path satisfied (SQLite / Linear / SCOREBOARD) |
| G5 | Build gates from active repo AGENTS.md verified (`tsc`, `lint`, `build`) |

4. If active repo is `maximus-ai`: additionally verify `MASTER-TASKLIST.json` reconciliation and `curate-master-tasklist.mts` was run after any completed tracked task.

5. Output verdict:

```
TASK-XXXX — MALFIG review ({repo-folder-name})
Verdict: PASS | BLOCKED
Violations: (rule IDs + paths, or NONE)
Actions: (ordered list, or NONE)
```

BLOCKED state: list directive IDs. Implement fixes only if session explicitly assigns implementation.
