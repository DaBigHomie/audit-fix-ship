---
name: repo-sync-guard
description: >
  Pre-flight git-hygiene + regression-risk audit for a repo BEFORE you commit, push,
  merge, or land work. Checks a repo (this machine + the git remote) for: dirty/staged/
  untracked files, stashes, branches ahead/behind/diverged or with a gone upstream, stale
  prunable worktrees, open PRs/issues that could regress on merge, and Supabase migration
  drift (local vs applied — is the DB migrated, not overwritten?). Cross-machine aware:
  run it on each machine (e.g. the MacBook too) to cover that machine's local disk state.
  Emits a verdict SYNCED | NEEDS_SYNC | HOLD. Triggers: "sync repo", "is my repo clean",
  "safe to commit/push/land", "stale worktrees/branches", "repo hygiene", "before I merge",
  "migration drift", "did I push everything", "regression check", "repo pre-flight".
  BOUNDARY: MALFIG owns CI, Vercel, and git hooks — this skill only READS state and reports;
  it never deploys, pushes, applies migrations, or writes a tracked file. Run forecast-scrutiny
  before any --remediate.
---
<!-- GENERATED FROM maximus-ai/skills/repo-sync-guard/SKILL.md -- do not edit; run sync-skills.mts -->

# repo-sync-guard

Read-only pre-flight that answers one question: **would landing work here regress code or lose work?**
Backed by the portable tool `maximus-ai/.system/scripts/repo-sync-guard.mts` (no hardcoded paths,
stdout-only output — never a tracked JSON mirror).

## When to run
Before any commit / push / merge / branch land, before cleaning up worktrees or branches, and
when reconciling work across machines (iMac + MacBook). Always run before a `--remediate`.

## How to run

```bash
# audit one repo (default: current dir)
npx tsx "$HOME/Management Git/maximus-ai/.system/scripts/repo-sync-guard.mts" <repoDir>

# refresh remote refs first (read-only on your branches), then audit
npx tsx "$HOME/Management Git/maximus-ai/.system/scripts/repo-sync-guard.mts" <repoDir> --fetch

# audit every git repo under a root
npx tsx "$HOME/Management Git/maximus-ai/.system/scripts/repo-sync-guard.mts" --root "$HOME/Management Git"

# machine-readable verdict to STDOUT (never a file)
npx tsx "$HOME/Management Git/maximus-ai/.system/scripts/repo-sync-guard.mts" <repoDir> --json
```

## What it checks
- **Dirty tree / stashes** — staged, unstaged, untracked counts; pending stashes.
- **Branches vs remote** — ahead (unpushed), behind, diverged, or `gone` upstream (deleted on remote).
- **Worktrees** — lists them; flags prunable (already-deleted) admin entries.
- **Open PRs / issues** — via `gh` (read-only) when present and authed; a surface that could land/regress.
- **Supabase migration safety** — local `supabase/migrations/*.sql` vs applied (`supabase migration list` when linked); maps repo to its project ref (maximus-ai `xlxufjjyyblhvwvsctdt`; global CORTEX `eccpracfbrocmkzuogec`). Confirms the DB is migrated, **not overwritten**. Never applies DDL.

## Verdict
- **SYNCED** — clean tree, no unpushed/behind/gone, no stash, no migration ambiguity. Safe to proceed.
- **NEEDS_SYNC** — unpushed/behind/diverged work, dirty tree, or stashes. Push/pull/commit before landing.
- **HOLD** — dirty tree **and** unpushed commits (risk of losing work), or unverified migration state. Stop; resolve first.

## Cross-machine
This machine's local/uncommitted state is only visible on this machine. The audit compares local vs the
remote and flags unpushed work — **run it on the MacBook too** so its local disk state is covered. Anything
not pushed is invisible to other machines until it is.

## Remediation (gated)
`--remediate` performs ONLY safe, reversible cleanup (`git worktree prune` of already-deleted entries) and
prints recommended commands for everything else (commit/stash/push/pull/migrate). It never auto-commits,
auto-pushes, auto-stashes, or applies migrations. **Run `forecast-scrutiny` first** to forecast blast radius.

## Boundaries
MALFIG owns CI, Vercel, and git hooks. This skill reports and defers gating to MALFIG. For deploy account
scoping (jay-anthony vs dame-luthas per repo) see the Vercel Technical Solution Architecture doc
(`docs/agent-docs/technical_solution_architecture_vercel.md`). Output is stdout-only — it never writes a
git-tracked JSON file (CORTEX is SSOT).
