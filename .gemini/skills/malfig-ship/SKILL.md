---
name: malfig-ship
description: >
  One-command ship workflow: take the current branch's work from "done" to "merged"
  through the MALFIG gates. Runs forecast-scrutiny, a repo-sync-guard pre-flight, commits
  with a MALFIG-compliant message, runs the gates (tsc + eslint + build, plus playwright if
  app surfaces changed), FIXES any gate failures, pushes the branch (explicitly, never a bare
  push), opens a PR, waits for CI/Vercel green, then squash-merges. Triggers: "ship it",
  "ship this", "create PR and merge", "run malfig and merge", "PR malfig merge", "gate and
  merge", "land this branch", "open a PR and merge when green". BOUNDARY: MALFIG owns CI/Vercel
  /hooks — this skill runs the LOCAL gates and drives the PR/merge; it does not author CI.
---

# malfig-ship

From done -> merged, gated. Never merges red. Each step has a unique TASK id (MALFIG #3).

## Pre-flight (do not skip)
1. **forecast-scrutiny** — forecast the ship: what does merge trigger (prod deploy?), is it
   reversible, right branch, right repo? HOLD on a material unknown and escalate.
2. **repo-sync-guard** — `npx tsx "$HOME/Management Git/maximus-ai/.system/scripts/repo-sync-guard.mts" .`
   Confirm you are on the intended feature branch (NOT main), and note any diverged/dirty state.
3. **Upstream trap** — check `git rev-parse --abbrev-ref @{u}`. If it is `origin/main`, NEVER `git push`
   bare; always `git push -u origin <branch>` by explicit name.

## Gates (MALFIG, must be 0/green)
```bash
npx tsc --noEmit          # 0 errors
npx eslint <changed files> # 0 errors (lint your diff; fix what you introduced incl. surfaced pre-existing)
npm run build             # exit 0
# npx playwright test     # only if app/page/component/route surfaces changed
```
If any gate fails, **fix it and re-run** before committing. Do not commit red.

## Commit
MALFIG message: `type(scope): subject (TASK-XXXX-YYYYMMDD)` <=72 chars, zero emojis, dense body,
and `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Do not hand-edit JSON mirrors (SSOT).

## PR
```bash
git push -u origin <branch>                 # explicit branch name
gh pr create --base main --head <branch> --title "..." --body "...gates: tsc/lint/build..."
```

## Wait for green, then merge
```bash
gh pr view <n> --json mergeable,mergeStateStatus   # MERGEABLE; state may be UNSTABLE while checks run
gh pr checks <n> --watch --interval 15             # block until Vercel/CI resolve
gh pr merge <n> --squash --delete-branch           # squash-merge convention; only after checks pass
```
Never merge while a required check is `pending`/`fail`. If a check fails, fix on the branch, push, re-watch.

## Report
Verdict + PR link + merge SHA + gate results. If anything held, say what and why.

## Pairs with
`forecast-scrutiny`, `repo-sync-guard`, and the MALFIG G-gates. CI/Vercel/hooks remain MALFIG's.
