# /prime-orchestration-continue — Family-prefixed alias for /continue-cycles

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md`
**Family runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md` §5.5

Family-prefixed alias for the existing `/continue-cycles` command
(documentation-standards#73) — same skill, same launcher, same boot script,
same rails. Purpose is family consistency: users can reach the Standing menu
via either `/continue-cycles` (legacy) or `/prime-orchestration-continue`
(family form).

## Invocation

```
/prime-orchestration-continue                              # print Standing menu (markdown), prompt user
/prime-orchestration-continue --auto                       # print menu + auto-dispatch top Quick-Win only
/prime-orchestration-continue --session=polaris-bootstrap-20260607
/prime-orchestration-continue --repo=documentation-standards --format=json
/prime-orchestration-continue --all-sessions

# Scope-aware invocation (added 2026-07-10):
/prime-orchestration-continue --scope=all                  # default; every open task
/prime-orchestration-continue --scope=prime                # ONLY prime_addressed=true tasks
/prime-orchestration-continue --scope=repo=project-polaris # ONLY that repo's non-Prime tasks
/prime-orchestration-continue --scope=external             # ONLY human-review queue
```

Argument surface is identical to `/continue-cycles` — see that command file
for the canonical contract, including the `--scope` filter documented in
`/continue-cycles` §"Scope filter". For scope-specific one-line entry-points,
prefer the family aliases `/prime-orchestration-continue-prime`,
`-continue-repo`, and `-continue-external`.

## Contract

1. Run the **launcher** (primary-tree-lag safe wrapper — do NOT call the boot
   script directly):
   `npx tsx $MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts <flags>`.
   The launcher fetches `origin` read-only, then either runs the boot script
   from the primary tree (if present) or bootstraps a transient worktree at
   `origin/master` under `$TMPDIR/continue-cycles-<uid>-<ts>`, runs the boot
   script there, and cleans up. Same flags, same output, same exit code.
2. Read the emitted menu — do NOT rebuild it from memory.
3. If `--auto`: dispatch the `DISPATCH_CANDIDATE` line's task via Patterns A-I
   (runbook §5). Otherwise ask the user which row to pick.
4. Compose `forecast-scrutiny` + `repo-sync-guard` BEFORE any dispatch.
5. `malfig-ship` handles the downstream PR/gate/merge flow when the picked
   cycle produces a PR.

## Guardrails

- `--auto` scope is **Quick wins only** — enforced by the boot script filter.
- No destructive git ops (`reset` / `rm` / `worktree remove` / force-push).
  The launcher's transient-worktree cleanup uses `git worktree remove` on a
  tmp path it created — the only sanctioned use.
- Never write to CORTEX beyond a self-index task.
- Skill, launcher, and boot script are **portable** (`$MGMT_ROOT`); no
  hardcoded paths.
- **Alias parity.** If the underlying `/continue-cycles` contract changes,
  this command's contract updates in the same PR — the two files must stay
  in lockstep.
- **Fallback (ops-only):** if the launcher itself fails, an operator MAY
  `git -C $MGMT_ROOT/documentation-standards pull --ff-only` to advance the
  primary tree. That is a MANUAL, documented, ops-only fallback — never
  automation. See runbook §12.

## Change Log

- 2026-07-10 — Document `--scope=all|prime|repo=<slug>|external` flag —
  lockstep with `/continue-cycles`. Peer family aliases
  `/prime-orchestration-continue-prime`, `-continue-repo`,
  `-continue-external` are the preferred entry-points for single-scope
  work. Backward-compat mandatory (`task_scope_aware_continue_20260710`).
- 2026-07-10 — Point at `continue-cycles-launcher.mts` (primary-tree-lag safe
  wrapper) instead of the raw boot script — lockstep with `/continue-cycles`
  (`task_continue_cycles_launcher_20260710`).
