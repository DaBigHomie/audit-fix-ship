<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-list-active-dispatches.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-list-active-dispatches — List active background dispatches

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §13
**Helper:** `documentation-standards/scripts/lib/branch-claim.mts`
**CORTEX table:** `public.cortex_bg_dispatches` (unique-active on `(target_repo, target_branch)`)

Read-only surface that answers: **"what background children are currently
running against which branches, on whose behalf?"** — the same question the
`ab30fd60` incident could not answer for 12 minutes.

Returns a table of every row in `cortex_bg_dispatches` whose `status='active'`
and (optionally) filtered by `--repo=<slug>` and/or `--branch=<name>`.

## When to use

- The user asks "is anything still running?", "any hidden children?", or
  "what's on branch X right now?".
- Before dispatching a new background agent onto a repo/branch — to detect a
  live claim and avoid the two-agents-on-one-branch race that produced the
  `ab30fd60` incident (~192k wasted tokens, no damage because the child
  correctly stopped when its worktree vanished — but that was luck, not
  design).
- As part of the `/continue-cycles` boot sweep — the standing menu should
  never dispatch onto a repo/branch already carrying an active claim.

## Invocation

```
/prime-orchestration-list-active-dispatches
/prime-orchestration-list-active-dispatches --repo=maximus-ai
/prime-orchestration-list-active-dispatches --repo=maximus-ai --branch=feat/foo-20260710
```

## Contract

1. **Read-only.** This command MUST NOT insert, update, or delete any row.
   Dispatching is a separate surface (`multi-model-task-assignment` +
   `orchestrator-continuation`).
2. Invoke `findActiveClaims({repo?, branch?})` from
   `scripts/lib/branch-claim.mts` — the helper hits `cortex_bg_dispatches`
   directly via the service-role REST endpoint.
3. Render the result as a Markdown table:

   ```
   | dispatch_id | parent_agent | target_repo | target_branch | parent_task_id | expires_in | status |
   |-------------|--------------|-------------|---------------|----------------|------------|--------|
   ```

   - `expires_in` is a signed duration relative to `now()` — negative values
     mean the row is past `claim_expires_at` and SHOULD be swept by the next
     `expireStale()` invocation.
   - `status` is always `active` (that is the query filter), but is rendered
     for callers who pipe the output into a wider dispatch dashboard.

4. When zero rows match, print:
   ```
   No active dispatches (checked target_repo=<r?>, target_branch=<b?>).
   ```

5. Suggest a follow-up ONLY when the caller supplied no filter and the table
   has >5 rows — invite them to re-run with `--repo=<slug>` to narrow.

## Behaviour under `--auto` (from `/continue-cycles`)

When the orchestrator-continuation skill runs with `--auto` and this command
is part of the boot sweep:

- If any active claim exists on the candidate repo/branch, the boot script
  MUST NOT emit `DISPATCH_CANDIDATE:` for that task.
- The candidate is skipped (with a "branch is claimed by dispatch
  `<id>` from parent `<agent>`" note) and the next-priority Quick-win is
  considered instead — never dispatch on top of an active claim.

## Sample output

```markdown
### Active background dispatches (2)

| dispatch_id                              | parent_agent | target_repo    | target_branch                     | parent_task_id                          | expires_in | status |
|------------------------------------------|--------------|----------------|-----------------------------------|-----------------------------------------|------------|--------|
| bg-dispatch-hkfamily-flip-g16-20260711   | opus-XYZ     | maximus-ai     | feat/flip-g16-to-blocking-20260711| task_g16_flip_to_blocking_20260711       | 12m 34s    | active |
| bg-dispatch-atb-e2e-recovery-20260711    | opus-ABC     | atl-table-booking-app | fix/e2e-econnrefused-20260711 | task_infra_bg_followup_e2e              | 04m 12s    | active |
```

## Governance

- Reads the CORTEX `cortex_bg_dispatches` ledger — that ledger is the SSOT.
- Does NOT read `cortex_worktree_claims` (worktree-unique — different fault
  class; that ledger is owned by `prime_claim_worktree`).
- Does NOT read the local `.cortex-boot.json` (may be stale) — cloud-first.

## References

- Runbook §13 — hidden-child-spawn hazard, branch-claim gate, deflection
  anti-pattern.
- Skill (Step 1c) — `orchestrator-continuation` `checkBranchClaim()` before
  dispatch.
- Migration — `db/migrations/003_cortex_bg_dispatches.sql`.
- Prior-art incident — dispatch `ab30fd60` (2026-07-08): sonnet self-delegated
  onto a branch already carrying a haiku redo. 12 min / 80 tool-calls /
  ~192k tokens wasted, no damage. This gate is the durable fix.
