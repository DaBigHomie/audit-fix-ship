# /prime-orchestration-continue-repo — Repo-scope standing menu

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §15
**Family runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md`
**Alias for:** `/continue-cycles --scope=repo=<slug>`

Family-prefixed alias that shows ONLY one repo's non-Prime work. Excludes
tasks that have been dispatched to Prime (`prime_addressed=true` OR the
JSONB fallback `output_blob->>'prime_addressed'='true'`) so the repo cycle
is not polluted by cross-repo concerns already in the Prime queue.

## When to use

- The user is working inside a single repo and asks "keep going" — they
  want to resume that repo's cycle, not the whole workspace.
- After dispatching cross-repo concerns to Prime via
  `/prime-orchestration-dispatch-to-prime`, resume the local repo cycle
  without seeing the dispatched rows in the menu.
- A per-repo `/loop` schedule where one loop runs per enrolled repo.

Non-symptoms (do **not** use this command):

- Multi-repo orchestration — use `/continue-cycles` (default `--scope=all`).
- Prime queue clearing — use `/prime-orchestration-continue-prime`.
- Human-review triage — use `/prime-orchestration-continue-external`.

## Invocation

```
/prime-orchestration-continue-repo --repo=project-polaris
/prime-orchestration-continue-repo --repo=maximus-ai --auto
/prime-orchestration-continue-repo --repo=one4three-co-next-app --format=json
/prime-orchestration-continue-repo --repo=documentation-standards --session=<id>
```

`--repo=<slug>` is REQUIRED. The slug MUST match an enrolled repo in
`workspace-rules/maximus-prime-repo-scope.json` (validated by the launcher
via the boot script's existing `--repo` codepath).

## Contract

1. Run the **launcher** (primary-tree-lag safe wrapper — do NOT call the boot
   script directly):
   `npx tsx $MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts --scope=repo=<slug> <other-flags>`.
2. Read the emitted menu — it will contain ONLY that repo's non-Prime rows
   across Quick / Standard / Larger / External groups. Menu categorization
   still applies WITHIN the filtered set.
3. If `--auto`: dispatch the `DISPATCH_CANDIDATE` line's task via Patterns A-I
   (runbook §5). Otherwise ask the user which row to pick.
4. Compose `forecast-scrutiny` + `repo-sync-guard` BEFORE any dispatch.
5. `malfig-ship` handles the downstream PR/gate/merge flow when the picked
   cycle produces a PR.

## Guardrails

- **`--repo=<slug>` REQUIRED.** Without it the command errors before
  invoking the launcher. Do NOT default to a repo — pick-your-own is the
  point of this command.
- `--auto` scope is **Quick wins only** — enforced by the boot script filter.
- **Prime exclusion MANDATORY.** The filter drops rows where
  `prime_addressed=true` OR `output_blob->>'prime_addressed'='true'` so
  cross-repo concerns already dispatched to Prime never appear in the
  repo cycle.
- No destructive git ops (`reset` / `rm` / `worktree remove` / force-push).
- Never write to CORTEX beyond a self-index task.
- Skill, launcher, and boot script are **portable** (`$MGMT_ROOT`); no
  hardcoded paths.
- **Alias parity.** If the underlying `/continue-cycles --scope=repo=<slug>`
  contract changes, this command's contract updates in the same PR.

## Composition example

```
Session A (working on project-polaris)
  → /prime-orchestration-continue-repo --repo=project-polaris
  → sees ONLY polaris rows (Prime dispatches excluded)
  → picks the top Quick-Win
  → dispatches, cycle completes
  → menu re-renders — one fewer polaris row
  → repeats until repo menu is at zero
```

## Change Log

- 2026-07-10 — Initial. Alias for `/continue-cycles --scope=repo=<slug>` —
  part of the scope-aware continue-cycles family
  (`task_scope_aware_continue_20260710`).
