<!-- GENERATED FROM maximus-ai/.claude/commands/continue-cycles.md -- do not edit; run sync-commands.mts -->
# /continue-cycles — Orchestrator-handoff entry-point

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md`

Loads the Standing menu (pending / in_progress / blocked CORTEX tasks + session
markers + stale-worktree candidates + external-gate PRs) and either PROMPTS
the user for a pick or (with `--auto`) dispatches the top **Quick-Win** cycle.
Standard / Larger / External cycles ALWAYS require an explicit human pick.

## Invocation

```
/continue-cycles                              # print Standing menu (markdown), prompt user
/continue-cycles --auto                       # print menu + auto-dispatch top Quick-Win only
/continue-cycles --session=polaris-bootstrap-20260607
/continue-cycles --repo=documentation-standards --format=json
/continue-cycles --all-sessions

# Scope-aware invocation (added 2026-07-10):
/continue-cycles --scope=all                  # default; every open task (unchanged)
/continue-cycles --scope=prime                # ONLY prime_addressed=true tasks
/continue-cycles --scope=repo=project-polaris # ONLY that repo's non-Prime tasks
/continue-cycles --scope=external             # ONLY human-review queue
```

## Scope filter

The `--scope` flag lets an orchestrator switch context between "current repo
work" and "Prime work" without seeing a mixed queue — see
`documentation-standards/docs/runbooks/orchestrator-continuation.md` §15 for
the scope-switching workflow and the peer command family
(`/prime-orchestration-continue-prime`, `-continue-repo`,
`-continue-external`).

- `--scope=all` — DEFAULT; backward-compatible with pre-2026-07-10 behavior.
- `--scope=prime` — matches `prime_addressed=true` OR (JSONB fallback for
  the BG-VVVV transition window) `output_blob->>'prime_addressed'='true'`.
- `--scope=repo=<slug>` — server-side `repo=eq.<slug>` AND client-side drop
  of prime-addressed rows (excludes Prime pollution from the repo cycle).
- `--scope=external` — client-side filter to `assignee_role='human_or_prime'`
  OR rows the classifier already places in the External group.

Menu categorization (Quick / Standard / Larger / External) still applies
WITHIN the filtered set. `--auto` remains Quick-Wins-only.

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
- **Fallback (ops-only):** if the launcher itself fails, an operator MAY
  `git -C $MGMT_ROOT/documentation-standards pull --ff-only` to advance the
  primary tree. That is a MANUAL, documented, ops-only fallback — never
  automation. See runbook §12.

## Change Log

- 2026-07-10 — Document `--scope=all|prime|repo=<slug>|external` flag. Menu
  categorization still applies WITHIN the filtered set; `--auto` remains
  Quick-Wins-only. Backward-compat mandatory: no-flag behavior unchanged
  (`task_scope_aware_continue_20260710`).
- 2026-07-10 — Point at `continue-cycles-launcher.mts` (primary-tree-lag safe
  wrapper) instead of the raw boot script — closes the `ERR_MODULE_NOT_FOUND`
  class of failures when the primary docstd tree lags `origin/master`
  (`task_continue_cycles_launcher_20260710`).
