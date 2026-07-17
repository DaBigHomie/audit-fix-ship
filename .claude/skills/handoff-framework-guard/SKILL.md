---
name: handoff-framework-guard
version: "1.0.0"
updated: 2026-07-08
canonical_basis: documentation-standards/skills/handoff-framework-guard/SKILL.md
description: >-
  Execute-only guard for the handoff-framework across ALL IDE surfaces (Cursor,
  Claude Code, Gemini, Antigravity). Agents EXECUTE the framework scripts; they
  MUST NOT edit framework source (src/, workflows/, package.json, tsconfig.json)
  or the handoff prompt suite / NAMING-CONVENTIONS. Cross-surface peer of the
  Cursor rule `handoff-framework-execute-only.mdc`. Read before touching
  handoff-framework or documentation-standards/templates/handoff. Triggers:
  "edit handoff-framework", "change the handoff scripts", "modify the prompt
  suite", "run the handoff pipeline", "execute-only", "framework guard".
disable-model-invocation: false
---
<!-- GENERATED FROM maximus-ai/skills/handoff-framework-guard/SKILL.md -- do not edit; run sync-skills.mts -->

# handoff-framework-guard

Cross-surface execute-only contract. The Cursor rule `handoff-framework-execute-only.mdc`
is Cursor-only; this skill is the **Claude / Gemini / Antigravity** peer. Same contract,
same enforcement — agents **run** the framework, they do **not** edit it.

**Root contract:** `$MGMT_ROOT/handoff-framework/AGENTS.md`
**Cursor rule (peer):** `documentation-standards/.cursor/rules/handoff-framework-execute-only.mdc`
**Guard script:** `$MGMT_ROOT/handoff-framework/src/verify-framework-integrity.mts`
**Workflow:** `documentation-standards/skills/handoff-sunset-v30/SKILL.md`

## Do NOT edit (agents — any surface)

- `handoff-framework/src/**`, `handoff-framework/workflows/**`,
  `handoff-framework/package.json`, `handoff-framework/tsconfig.json`
- `documentation-standards/templates/handoff/**` (prompt suite + NAMING-CONVENTIONS)
- `documentation-standards/scripts/write-handoff-to-cortex.mts`,
  `documentation-standards/scripts/seed-handoff-30-cortex.mts`
- `documentation-standards/skills/handoff-sunset-v30/**`

Framework changes require an explicit **human** message or an independent **GOV**
reviewer (see `human-approval-gate`). The authoring agent may not self-approve a
framework edit.

## DO (execute only)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"
cd "$MGMT_ROOT/handoff-framework"
REPOS="<comma-separated touched repos>"          # --repos is a variable

npx tsx src/cli.mts verify-integrity --strict            # read-only guard (run first)
npx tsx src/cli.mts tasklist --repos="$REPOS"            # read-only task list
npx tsx src/cli.mts validate-manifests --repos="$REPOS"  # read-only gate
npx tsx src/cli.mts scaffold-sunset --from-session=<id> --repos="$REPOS" --scope=sunset
npx tsx src/cli.mts finalize --repo=<slug> --project=<dir> --from-session=<id> --session=<slug>
```

Handoff *content* is written to target repos + CORTEX — never back into the framework tree.

## Enforcement

- Run `verify-integrity --strict` at orchestrator boot / before dispatch. Non-zero exit =
  execute-only violation (framework source was modified) → revert or route to human/GOV.
- Surface parity: Cursor `.mdc` rule · this skill (`.claude`/`.gemini`/`.cursor` skills) ·
  `AGENTS.md` (Codex/Antigravity) · `CLAUDE.md` + `GEMINI.md` (always-on memory).

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-08 | agent-181 | Cross-surface execute-only guard skill (Claude/Gemini peer of the Cursor rule). |
