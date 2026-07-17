<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-audit-pr-set.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-audit-pr-set — Audit N PRs across N repos (4-gate)

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation` (preset: `audit-pr-set`)
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md` §5.1
**ARSENAL shape:** `parallel-bg-fanout-5plus-lanes` (S13) fanning `discovery-first-bg-audit-only` (S9)

Runs the standard 4-gate stack (forecast-scrutiny → MALFIG → forensic-auditing
→ doc-forensic-inventory) READ-ONLY against each PR in the argument set. Each
PR gets its own reviewer BG so the G13 separation-of-duties rail is preserved
(author agent may not review its own PR). Verdicts are aggregated into a
single status board.

## Invocation

```
/prime-orchestration-audit-pr-set <repo>#<pr> [<repo>#<pr>...]
```

Argument shape: space-separated `<repo>#<pr>` tokens where `<repo>` is an
enrolled slug from `workspace-rules/maximus-prime-repo-scope.json` and `<pr>`
is a numeric PR number.

```
/prime-orchestration-audit-pr-set maximus-ai#214
/prime-orchestration-audit-pr-set maximus-ai#214 atl-table-booking-app#362
/prime-orchestration-audit-pr-set documentation-standards#65 documentation-standards#66 maximus-ai#212
```

## Contract

1. Parse the argument list; reject any token that does not match
   `<enrolled-slug>#<positive-int>`. Emit the parsed set to chat.
2. For each `<repo>#<pr>`: verify existence via `gh -R DaBigHomie/<repo> pr view <pr> --json number,title,state,url,mergedAt` — HALT the whole invocation if any lookup fails (verify-then-write).
3. Compose the dispatch spec via `orchestrator-continuation` preset
   `audit-pr-set`, one reviewer BG per PR. Each BG runs the 4-gate stack
   read-only against the target PR's changed files.
4. Aggregate verdicts into a status board and report to chat. Do NOT open a
   remediation PR from this command — that is the caller's next choice.
5. On completion, file ONE self-index task via `cortex-sync-skill`
   (`task_prime_orchestration_audit_<yyyymmdd>_<n>`) linking every reviewer
   verdict.

## Guardrails

- **READ-ONLY.** No commits, no PR body edits, no merges from this command.
- **G13 preserved.** A reviewer BG may not audit a PR whose author agent id
  matches its own routing id — enforced by the preset before fanout.
- **Bounded parallelism.** Max 5 reviewer BGs per invocation (Shape S13
  cap). Larger sets require chunking.
- **No destructive git ops** (`reset` / `rm` / `worktree remove` / force-push).
- **Portable.** Uses `$MGMT_ROOT`; no hardcoded user paths.
- **No auto-merge.** Human-approval-gate applies to any downstream ship
  action.
