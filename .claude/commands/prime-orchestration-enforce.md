<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-enforce.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-enforce — Chain enforcer + 4-gate for a scope

**Model:** claude-opus (orchestrator) · **Skill:** `orchestration-standards-enforcer`
**Spec:** `documentation-standards/skills/orchestration-standards-enforcer/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md` §5.3
**ARSENAL shape:** `fanout-batch-gate-mechanical-apply` (S4)

Chains `orchestration-standards-enforcer` (documentation-standards#65 +
documentation-standards#66) with the 4-gate stack (forecast-scrutiny →
MALFIG → forensic-auditing → doc-forensic-inventory) for a specific scope.
Ensures the canonical orchestration-standards policy block is present and
up-to-date in every enrolled surface within scope.

## Invocation

```
/prime-orchestration-enforce <scope>
```

Scope must be one of:

- an enrolled repo slug from `workspace-rules/maximus-prime-repo-scope.json`
  (e.g. `maximus-ai`, `documentation-standards`, `atl-table-booking-app`);
- the literal string `all` — every enrolled repo;
- an explicit absolute path (must start with `$MGMT_ROOT` / `$MANAGEMENT_GIT_ROOT`).

Examples:

```
/prime-orchestration-enforce documentation-standards
/prime-orchestration-enforce all
/prime-orchestration-enforce $MGMT_ROOT/atl-table-booking-app
```

## Contract

1. Validate the scope token. Reject if it is not an enrolled slug, `all`, or
   an absolute path under `$MGMT_ROOT`. HALT on invalid.
2. Dispatch an enforcer BG (`orchestration-standards-enforcer` skill) with
   the resolved scope. The BG runs
   `scripts/enforce-orchestration-standards.mts` with the scope-appropriate
   flags (`--path=<slug>=<abspath>` + `--targets-json`), per PR #67 / PR #71.
3. On enforcer completion, run the 4-gate stack over the resulting diff:
   - `forecast-scrutiny` — blast radius on the sync;
   - MALFIG G1-G14;
   - `forensic-auditing` — verify every canonical-block anchor resolves;
   - `doc-forensic-inventory` — sweep for stale references to the old block.
4. Report a per-surface PASS / FAIL / SKIPPED board.
5. File ONE self-index task via `cortex-sync-skill`
   (`task_prime_orchestration_enforce_<scope>_<yyyymmdd>`).

## Guardrails

- **Scope validation is BLOCKING.** No wildcard, no glob, no `..` traversal.
- **Fresh-worktree discipline.** The enforcer BG runs in a fresh worktree
  per PR #67 rails; never a shared tree.
- **No destructive git ops** (`reset` / `rm` / `worktree remove` / force-push).
- **No policy edits from this command.** The canonical block lives in
  `skills/orchestration-standards-enforcer/SKILL.md`; edits there require
  their own PR + gates.
- **Portable.** No hardcoded user paths.
