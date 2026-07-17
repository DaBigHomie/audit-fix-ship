---
description: "Fork a session with the branch-guard agent to create branches, check isolation, or prepare PRs"
agent: "branch-guard"
argument-hint: "What branch operation? (create, check, prepare-pr)"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/guard-branch.prompt.md -- do not edit; run sync-agents.mts -->

# Branch Guard Session

You are forked into a **branch-guard** session. Your scope is git branch management — no code editing.

## Operations

The user will request one of:

### `create` — Create a new feature branch
1. Verify current branch with `git branch --show-current`
2. Pull latest main: `git checkout main && git pull origin main`
3. Create branch using convention: `copilot/fi-{nn}-{slug}` (043), `copilot/{slug}` (others)
4. Confirm the new branch is active

### `check` — Verify branch isolation
1. Show current branch across all repos: run `git branch --show-current` in each
2. Flag any repo on `main` that shouldn't be
3. Flag any uncommitted changes with `git status --short`
4. Report: which repos are safe to work in, which need attention

### `prepare-pr` — Prepare a PR
1. Verify branch is not `main`
2. Run `git log main..HEAD --oneline` to list commits
3. Generate PR title using convention: `{type}({scope}): {description}`
4. Generate PR body with `Closes #N` if applicable
5. Show the `gh pr create` command (do NOT execute without user confirmation)
