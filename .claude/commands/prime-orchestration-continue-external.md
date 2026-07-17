<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-continue-external.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-continue-external — Human-review standing menu

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §15
**Family runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md`
**Alias for:** `/continue-cycles --scope=external`

Family-prefixed alias that shows ONLY the human-review queue — CORTEX tasks
whose `assignee_role='human_or_prime'` OR whose description matches the
external-gate shape already used by the boot script's `classify()` (human
sign-off, PR review, awaiting review, external gate). Use it when the
orchestrator is triaging what needs a human's eyes vs what an agent can
progress alone.

## When to use

- The user asks "what's waiting on me?", "what needs review?", or "what's
  stuck on human sign-off?".
- After a round of dispatches, to see which of the resulting PRs still need
  a human decision before they can be merged.
- A `/loop`-scheduled sweep that pings a channel when the external queue
  becomes non-empty.

Non-symptoms (do **not** use this command):

- Agent-executable work — use `/continue-cycles` (default `--scope=all`),
  `/prime-orchestration-continue-repo`, or
  `/prime-orchestration-continue-prime` depending on lane.
- Merging a PR that already has human approval — use `/malfig-ship` to
  drive the gate-and-merge flow.

## Invocation

```
/prime-orchestration-continue-external                # print external-only Standing menu
/prime-orchestration-continue-external --format=json  # machine-readable
/prime-orchestration-continue-external --session=<id> # filter within a session
```

Argument surface is identical to `/continue-cycles`. `--auto` is technically
accepted but almost always yields `NO_QUICK_WIN` — external rows are not
auto-dispatch candidates by design (they require a human).

## Contract

1. Run the **launcher** (primary-tree-lag safe wrapper — do NOT call the boot
   script directly):
   `npx tsx $MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts --scope=external <other-flags>`.
2. Read the emitted menu — it will contain ONLY external-gate rows.
3. Report the queue to the user. For each row, surface the specific gate
   (PR number, review URL, awaiting-approval note) so the human can act
   directly without opening more context.
4. Do NOT dispatch external rows automatically — even with `--auto`, the
   boot script's Quick-Wins-only rail prevents auto-dispatch of external
   rows (external is not `quick_win`).

## Guardrails

- **Auto-dispatch is a no-op.** External rows are never `quick_win`, so
  `--scope=external --auto` reliably prints `NO_QUICK_WIN`. This is by
  design — humans decide external work.
- No destructive git ops (`reset` / `rm` / `worktree remove` / force-push).
- Never write to CORTEX beyond a self-index task.
- Skill, launcher, and boot script are **portable** (`$MGMT_ROOT`); no
  hardcoded paths.
- **Alias parity.** If the underlying `/continue-cycles --scope=external`
  contract changes, this command's contract updates in the same PR.

## Composition example

```
Orchestrator finishes a Prime cycle sweep
  → /prime-orchestration-continue-external
  → sees 3 rows — 2 PRs awaiting review, 1 task needing human sign-off
  → reports to the user with direct action links
  → user approves / reviews
  → next /continue-cycles sweep re-classifies rows out of external
```

## Change Log

- 2026-07-10 — Initial. Alias for `/continue-cycles --scope=external` — part
  of the scope-aware continue-cycles family
  (`task_scope_aware_continue_20260710`).
