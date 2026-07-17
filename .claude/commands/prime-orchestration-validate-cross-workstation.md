# /prime-orchestration-validate-cross-workstation — Validate work created elsewhere

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation` (preset: `validate-cross-workstation`)
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md` §5.2
**ARSENAL shape:** `discovery-first-bg-audit-only` (S9) + repo test-suite invocation

User creates PRs / scripts on **workstation A** (e.g. MacBook) then validates
on **workstation B** (e.g. iMac). This command orchestrates the workstation-B
side: pull latest, run test suites + gate stack + smoke, report deltas.

## Invocation

```
/prime-orchestration-validate-cross-workstation <target-repo> [--source-workstation=<name>]
```

- `<target-repo>` — enrolled slug from `workspace-rules/maximus-prime-repo-scope.json`.
- `--source-workstation=<name>` — optional; provenance label for the report
  (`macbook`, `imac`, ...). No routing effect; report-only.

Examples:

```
/prime-orchestration-validate-cross-workstation atl-table-booking-app
/prime-orchestration-validate-cross-workstation maximus-ai --source-workstation=macbook
```

## Contract

1. Resolve `$MANAGEMENT_GIT_ROOT` (or `$MGMT_ROOT`) on the current workstation.
   Verify `$MANAGEMENT_GIT_ROOT/<target-repo>` exists — HALT if missing.
2. Read the workspace-root `CLAUDE.md` block for dual-workstation env
   (per PRIME governance §1B.4 — repo-sync-guard) so the validator knows
   which mount points and env files apply to the current host.
3. Compose the dispatch spec via `orchestrator-continuation` preset
   `validate-cross-workstation`. The preset:
   - runs `git fetch origin` in the target repo (read-only);
   - runs the repo's declared quality gates (`npx tsc --noEmit`,
     `npm run lint`, `npm run build`, `npx playwright test` when present);
   - runs `forecast-scrutiny` + `forensic-auditing` read-only over the delta
     between local `HEAD` and `origin/master`;
   - captures any smoke script the repo declares under
     `scripts/smoke*.mts` or `package.json` scripts prefixed `smoke:`.
4. Report a delta board: PASS / FAIL / UNKNOWN per gate, with the source-
   workstation label for provenance.
5. File ONE self-index task via `cortex-sync-skill`
   (`task_prime_orchestration_validate_<repo>_<yyyymmdd>`).

## Guardrails

- **READ-ONLY validation.** No commits, no PR edits, no pushes.
- **Honest UNKNOWN.** If a repo declares no lint / build / test script, the
  validator reports UNKNOWN for that gate — it does not fabricate a PASS.
- **No cross-workstation writes.** This command runs entirely on
  workstation B (the current host).
- **No destructive git ops** (`reset` / `rm` / `worktree remove` / force-push).
- **No auto-remediation.** Deltas are reported; the caller chooses next.
