---
name: git-hygiene
description: >-
  Git hygiene orchestrator to trigger pre-flight git-hygiene and safety gates in any repository.
  Strictly prevents destructive operations (git reset, git rm) that cause feature regression,
  and applies 50x logic for deep state tracing and pipeline verification.
---

# git-hygiene (`/git-hygiene`)

Workspace-wide Git hygiene orchestrator. Enforces safe, non-destructive workflows and integrates 50x logic to verify CORTEX DB state, linked worktrees, and branch alignment before any landing or checkout.

## Core Rules

> [!CAUTION]
> **NO DESTRUCTIVE GIT OPERATIONS:** 
> Do not execute `git reset --hard`, `git push --force`, or destructive branch/worktree deletions without explicit user approval. All operations must be fully reversible or run in dry-run mode first.

### 50x Logic Principles
- **CORTEX State Verification:** Check the local SQLite database state (`.agent-kb/db/agent_kb.sqlite`) and run `cortex-sync-guard.mts` if present in the active repo before shifting branch states to ensure no session provenance is lost.
- **Pipeline Integrity:** Check `.cortex-boot.json` and verify that all workspace plugins and hooks are correctly loaded. Ensure there are no disconnected agents or stalled loops.
- **Loop/Workspace Audit:** Trace all linked sibling worktrees. If `worktree-lint.mts` exists in the active repo, run it to ensure parallel tasks are properly isolated and do not clash on the same branch.

---

## Workflow

1. **Verify CORTEX DB State (50x logic)**
   Check the current session's SQLite state to ensure task registry and state hydration are aligned.
   If `scripts/cortex-sync-guard.mts` exists in the active repo:
   ```bash
   npx tsx scripts/cortex-sync-guard.mts
   ```
   Otherwise skip this step.

2. **Audit Worktree Isolation**
   Run the worktree linter to detect overlapping branch mutations or uncommitted changes in linked sibling worktrees.
   If `scripts/worktree-lint.mts` exists in the active repo:
   ```bash
   npx tsx scripts/worktree-lint.mts
   ```
   Otherwise skip this step.

3. **Pre-flight Audit (`repo-sync-guard`)**
   Run the pre-flight tool to refresh remote references and check tree cleanliness.
   If `scripts/repo-sync-guard.mts` exists in the active repo, run:
   ```bash
   npx tsx scripts/repo-sync-guard.mts <repo> --fetch
   ```
   Otherwise see `reference/repo-sync-guard.md` for guidance.
   *If findings are returned, resolve them via safe commits, pushes, or pulls. Run `/forecast-scrutiny` before any safe remediation (`--remediate`).*

4. **Target Integration Dry-Run (MANDATORY FOR PRs/MERGES)**
   If reviewing a Pull Request or preparing a branch for merge, you MUST explicitly test for conflicts against the target integration branch (e.g., `origin/main`). `git status` alone is INSUFFICIENT as it only compares against the isolated tracking branch.
   ```bash
   git fetch origin && gh pr view <PR_NUMBER> --json mergeable
   # OR
   git fetch origin && git merge origin/main --no-commit --no-ff
   git merge --abort
   ```
   *If the API returns `CONFLICTING` or the dry-run merge fails, the verdict MUST be BLOCKED.*

5. **Safety Check**
   Review proposed commands. Forbid any command that overwrites git history or deletes unmerged branches.

---

## Safe Branch Cleanup

Before deleting any local branch, classify it — never trust `git merge-base` or `git cherry` alone; both LIE for squash-merged branches (the tip SHA is never an ancestor of main post-squash, so ancestry checks false-negative). The reliable proof: **branch tip SHA == a merged PR's `headRefOid`**.

**Tool:** `atl-table-booking-app/scripts/branch-cleanup-audit.mts` — READ-ONLY, never deletes; emits a suggested command list only.

**Verdicts:** `SAFE-MERGED` (ancestor of origin/main) · `SAFE-SQUASH` (tip SHA == merged-PR head SHA) · `SAFE-REMOTE` (contained by some `origin/*` ref) · `KEEP-LIVE` (checked out in a worktree) · `KEEP-ARCHIVE` (intentional archive/forensic ref) · `HOLD` (unpushed, unmatched — real loss risk).

**Usage:**
```bash
npx tsx scripts/branch-cleanup-audit.mts [--repo owner/name] [--json] [--emit-deletes]
```
`--emit-deletes` only prints the `git branch -D` commands for SAFE-* verdicts — it never executes them.

---

## Output Format

Emits compliance verdict matching MALFIG plain-text guidelines (no emoji):

```
TASK-XXXX — Git Hygiene Audit
Verdict: PASS | BLOCKED
Violations: (rule IDs, e.g., GH-001 Destructive git reset proposed, or NONE)
Actions: (safe sync/remediation steps, or NONE)
```
