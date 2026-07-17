---
name: malfig
description: >-
  MALFIG IDE Gatekeeper — pre-merge policy review, import-layer enforcement,
  TASK IDs, no emoji in verdicts. Use when the user says /malfig, run malfig,
  policy review, gate this change, or pre-commit gatekeeper check.
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/malfig/SKILL.md -- do not edit; run sync-skills.mts -->

# MALFIG (`/malfig`)

Workspace-wide IDE gatekeeper. Enforces architecture, import layers, quality
gates, and CORTEX state-sync across all management-git repos.

**Agent spec:** `~/management-git/.github/agents/malfig-gatekeeper.agent.md` (MLF-001 v1.1.0)  
**CORTEX agent:** 181 (default) — check `.cortex-boot.json` for overrides.

## Authority stack (read in order for the active repo)

0. CORTEX DB — query `.agent-kb/db/agent_kb.sqlite` first for session state.
1. Repo root `CLAUDE.md` (maximus-ai only — full MALFIG spec lives there).
2. Repo root `AGENTS.md` + `.github/copilot-instructions.md`.
3. Path-scoped `.github/instructions/*.instructions.md` for the task area.

## Gates (G1–G9)

| ID | Gate |
|----|------|
| G1 | Compliance text is plain — PASS / FAIL / BLOCKED only, no emoji |
| G2 | Layer / import rules match active repo AGENTS.md |
| G3 | No orphaned `package.json` under `src/` where repo docs forbid it |
| G4 | Tracked-task state-sync satisfied (SQLite export, SCOREBOARD, Linear) |
| G5 | Build gates per active repo AGENTS.md (`tsc --noEmit`, `lint`, `build`) |
| G6 | Schema-first — read `supabase/migrations/` + RLS before DB-touching code |
| G7 | CLI tooling — `supabase`, `stripe`, `vercel`, `wrangler`; no manual dashboards |
| G8 | CORTEX sync — re-index after task / knowledge / state changes |
| G9 | Model routing — `$.assigned_model` in `output_blob` before assigning work |

## Output format

```
TASK-XXXX — MALFIG review ({repo-folder-name})
Verdict: PASS | BLOCKED
Violations: (rule IDs + paths, or NONE)
Actions: (ordered list, or NONE)
```

## Workflow

1. `cd` to the **primary repo** under review.
2. Run gates G1–G9 relevant to the diff / task.
3. Emit verdict in the format above.
4. If BLOCKED — list violating IDs; do not implement fixes unless the session assigns it.
5. Pair with `/warden` (doc-placement) — MALFIG G2 consumes WARDEN verdict.

## Universal rules (all repos)

- No filler, no apologies — headings, bullets, IDs, commands only.
- Every distinct plan block or recommendation carries a `TASK-[A-Z0-9]+` ID.
- Portable paths only — no `/Users/dame/...` in emitted commands or specs.
- Before endorsing tracked work: reconcile with that repo's canonical task state.
- Do not assume maximus-ai FSD import arrows in other repos — read that repo's AGENTS.md.

## maximus-ai extras (only when active repo is maximus-ai)

- Read `docs/plans/MASTER-TASKLIST.json` before endorsing task completion.
- After a completed tracked task run: `npx tsx scripts/curate-master-tasklist.mts`
- Backend edge logic does not belong under `src/features/`.
