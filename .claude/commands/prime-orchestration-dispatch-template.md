<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-dispatch-template.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-dispatch-template — Emit a BG-dispatch prompt template

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Library:** `documentation-standards/skills/orchestrator-continuation/prompts/`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-playbook.md`
**Naming:** `documentation-standards/docs/policies/bg-agent-naming-convention.md`

Prints a copy-paste-ready BG-dispatch prompt template with the standard
delivery lifecycle, hard rails, and CORTEX status-write-ordering rule
already wired in.

## Invocation

```
/prime-orchestration-dispatch-template <template-name>
```

Where `<template-name>` is one of:

| Name | Use when |
|---|---|
| `research` | Discovery + evidence-only, no writes |
| `execution` | Standard delivery (author + gate + merge) |
| `retirement` | Dual-gate plan-doc / worktree retirement |
| `audit` | PR audit / report-only, no PR authored |
| `meta-plan` | Strategic doc / plan authoring |
| `fanout` | Governed cross-repo sync |
| `component-triad` | CGC L3-L5 component authoring (index + plan + optimize) |
| `reconciliation` | Cross-artifact reconciliation of divergent SSOTs |

## Contract

1. Read the file
   `documentation-standards/skills/orchestrator-continuation/prompts/<template-name>-bg-template.md`
   from the primary tree (or the transient bootstrap tree if the primary
   lags — same pattern as `continue-cycles-launcher.mts`).
2. Emit the file body verbatim to the transcript so the orchestrator can
   fill placeholders and dispatch.
3. Do NOT auto-dispatch — filling placeholders is the human's job (or the
   orchestrator's next transcript turn).
4. If `<template-name>` is invalid, list the valid names from
   `skills/orchestrator-continuation/prompts/README.md`.

## Placeholders

Every template contains `{{PLACEHOLDER}}` slots. Common ones:

- `{{BG_TAG}}` — allocate the next unused tag per
  `docs/policies/bg-agent-naming-convention.md`.
- `{{DISPATCH_ID}}` — will be filled by `claimBranch()` at Phase 2.
- `{{SESSION_ID}}` — current CORTEX session.
- `{{TARGET_REPO}}`, `{{TARGET_BRANCH}}` — dispatch subject.
- `{{TASK_ID}}` — CORTEX task_id for this cycle.
- `{{USER_DIRECTIVE}}` — the verbatim user quote authorizing the work.
- `{{STANDING_AUTH_ID}}` — the `standing_authorization:*` grant.
- `{{HARD_RAILS_ADDITIONS}}` — dispatch-specific rails on top of the
  standard checklist.

## Guardrails

- Read-only command. No CORTEX writes, no commits.
- The emitted template embeds a reference to CORTEX rule `12903` — the
  BG receiving the prompt is bound by it.
- Portable — no hardcoded `/Users/...` paths.
- No `find .` scans from the root — the template files sit in a known
  directory.

## Change Log

- 2026-07-10 — v1.0.0 initial. Companion to the prompt template library
  in `skills/orchestrator-continuation/prompts/`
  (task `task_orchestrator_playbook_20260710`).
