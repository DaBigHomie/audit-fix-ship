# /prime-orchestration-continue-prime — Prime-scope standing menu

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §15
**Family runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md`
**Alias for:** `/continue-cycles --scope=prime`

Family-prefixed alias that shows ONLY Prime-scoped work — CORTEX tasks whose
`prime_addressed=true` (or, during the pre-BG-VVVV transition window,
`output_blob->>'prime_addressed'='true'`). Use it when a dedicated session is
picking up the **Prime cycle** and does not want repo-local work to dilute
the menu.

## When to use

- A fresh session opens for the express purpose of clearing the Prime queue
  — cross-repo concerns that were dispatched to Prime via
  `/prime-orchestration-dispatch-to-prime` from other repos' work.
- The orchestrator has been alternating between repo-scoped work and Prime
  work and wants a clean context switch to the Prime cycle.
- A `/loop`-scheduled sweep specifically for Prime quick-wins.

Non-symptoms (do **not** use this command):

- Working inside a single repo's cycles — use
  `/prime-orchestration-continue-repo --repo=<slug>` instead.
- Reviewing the human-review queue — use
  `/prime-orchestration-continue-external` instead.
- Full unfiltered menu — use `/continue-cycles` (default `--scope=all`).

## Invocation

```
/prime-orchestration-continue-prime                # print Prime-only Standing menu
/prime-orchestration-continue-prime --auto         # menu + auto-dispatch top Prime Quick-Win
/prime-orchestration-continue-prime --format=json  # machine-readable
/prime-orchestration-continue-prime --session=<id> # filter within a session
```

Argument surface is identical to `/continue-cycles` — this command simply
appends `--scope=prime` before the launcher call. All other flags pass
through verbatim.

## Contract

1. Run the **launcher** (primary-tree-lag safe wrapper — do NOT call the boot
   script directly):
   `npx tsx $MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts --scope=prime <other-flags>`.
2. Read the emitted menu — it will contain ONLY Prime-scoped rows across
   Quick / Standard / Larger / External groups. Menu categorization still
   applies WITHIN the Prime-filtered set.
3. If `--auto`: dispatch the `DISPATCH_CANDIDATE` line's task via Patterns A-I
   (runbook §5). Otherwise ask the user which row to pick.
4. Compose `forecast-scrutiny` + `repo-sync-guard` BEFORE any dispatch.
5. `malfig-ship` handles the downstream PR/gate/merge flow when the picked
   cycle produces a PR.

## Guardrails

- `--auto` scope is **Quick wins only** — enforced by the boot script filter.
  Under `--scope=prime --auto`, the auto-dispatch candidate is drawn from
  Prime Quick-Wins only.
- **JSONB fallback MANDATORY.** The filter matches `prime_addressed=true`
  OR `output_blob->>'prime_addressed'='true'` so the command works both
  before and after the BG-VVVV column migration. Do NOT remove the JSONB
  fallback path.
- No destructive git ops (`reset` / `rm` / `worktree remove` / force-push).
  Launcher's transient-worktree cleanup is the only sanctioned use.
- Never write to CORTEX beyond a self-index task.
- Skill, launcher, and boot script are **portable** (`$MGMT_ROOT`); no
  hardcoded paths.
- **Alias parity.** If the underlying `/continue-cycles --scope=prime`
  contract changes, this command's contract updates in the same PR.

## Composition example

```
Session A (working on project-polaris)
  → discovers a Prime-scoped concern
  → files it via /prime-orchestration-dispatch-to-prime
  → task lands in CORTEX with prime_addressed=true
  → resumes polaris work
  ...

Session B (fresh session, dedicated Prime cycle)
  → /prime-orchestration-continue-prime
  → sees ONLY the Prime queue
  → dispatches the Prime cycle
  → returns menu to zero
```

## Change Log

- 2026-07-10 — Initial. Alias for `/continue-cycles --scope=prime` — part of
  the scope-aware continue-cycles family
  (`task_scope_aware_continue_20260710`).
