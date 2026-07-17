---
name: forecast-scrutiny
description: >
  Pre-action forecasting + adversarial scrutiny for any risky operation in the
  MALFIG ecosystem — BEFORE running it. Forecasts blast radius (files, repos,
  DB rows, git ops, external side effects, reversibility) and then scrutinizes
  the plan adversarially (wrong source/path, name not equal to behavior, hidden
  defaults, worktree/branch impact, machine mismatch). Use whenever about to: run a
  sync / deploy / migration script, push, git rm, untrack, register agents, set secrets,
  modify multiple repos, or touch production. Triggers: "forecast", "blast radius",
  "scrutinize", "what could go wrong", "is this safe", "before I run", "will this
  push/overwrite/break", "dry run first", "scenario", "second opinion".
  Run this before destructive or multi-repo/multi-machine actions.
---
<!-- GENERATED FROM maximus-ai/skills/forecast-scrutiny/SKILL.md -- do not edit; run sync-skills.mts -->

# forecast-scrutiny

Two adversarial passes before a risky action. The goal is to be wrong on paper,
not in production. Maps to the MAXIMUS PRIME Scenario & Forecasting family and the
multi-model-task-assignment blast-radius step.

**Golden rule: READ the actual code/command. Never forecast from the name.**
A script called `sync` may copy from a source you don't expect; `deploy` may not
distribute what you think. Open it and trace it.

---

## Phase 1 — FORECAST (blast radius)

Trace the real behavior and fill this in. Read the script/command end-to-end.

```
BLAST_RADIUS = {
  reads_from:   [exact source paths/dirs/tables — is it what you assume?],
  writes_to:    [exact target paths/repos/tables/rows],
  git_ops:      [none | commit | push | branch | worktree | reset],  # grep the code
  db_ops:       [none | select | insert | update | DDL],  # which tables, prod?
  repos_touched:[list every repo/dir written],
  external:     [secrets, network, CI, webhooks, deploys, $ cost],
  reversible:   [yes/no + how to undo each effect],
  idempotent:   [re-run safe? backups taken?],
}
```

Hard checks (each must be answered from the code, not assumed):
- **Source identity** — what dir/table does it actually read FROM? Is the "obvious" source actually the source?
- **Path/machine** — hardcoded paths? Do they match THIS machine/user? (`/Users/<who>/...` vs `$HOME`)
- **Git scope** — does it push? touch branches/worktrees? commit in other repos?
- **Production** — does it write a live DB / deploy / send anything?
- **JSON/SSOT** — does it hand-edit or emit a git-tracked JSON mirror? CORTEX is SSOT; mirrors drift.

## Phase 2 — SCRUTINY (adversarial)

Try to make the plan fail. Assume the forecast is optimistic.

- **name != behavior**: does the tool do what its name implies, or something narrower/wider?
- **wrong source/target**: could it copy the wrong direction, or overwrite work you just did?
- **hidden defaults**: constructor/env defaults that change source, scope, or target silently.
- **stale assumptions**: "X syncs via Y" — did you verify Y's source is X?
- **dirty-tree / partial**: what if a target has uncommitted changes, or the run aborts midway?
- **multi-repo / parallel-session**: would it sweep in work from another session/worktree?
- **secrets/creds**: writing creds to the right place? right repo (name vs dir mismatch)?

For HIGH/CRITICAL stakes, spawn N independent scrutiny agents (distinct lenses:
correctness, reversibility, wrong-source, security) and require majority "safe".

## Phase 3 — VERDICT

```
VERDICT = SAFE | SAFE_WITH_GUARDS | HOLD
guards   = [dry-run first, scope to paths, backup, confirm target repo, single-repo test]
unknowns = [anything not verifiable from code -> escalate to the user]
```

- **SAFE** — reversible, single-scope, no prod/push, verified source. Proceed.
- **SAFE_WITH_GUARDS** — proceed only with the listed guards (e.g. `--dry-run`, explicit paths).
- **HOLD** — a hard check failed or an unknown is material. Report and get a human decision.

## Output format

```
## FORECAST — {action}
- reads_from / writes_to / git_ops / db_ops / repos / external / reversible
## SCRUTINY — {top risks, each: likelihood + impact + mitigation}
## VERDICT — SAFE | SAFE_WITH_GUARDS | HOLD  (+ guards / unknowns)
```

## Worked example (real)

Action: "run `sync-workflow-configs.ts` to roll the hook to all repos."
- FORECAST: git_ops = **none but read-only `git status`** (no push/branch/worktree);
  reads_from = **`workflow-configs/`** (default `$HOME/Management Git` — verify it is THIS machine's
  path, not a different user's `/Users/<other>`); writes_to = 9 approved repos' main checkout;
  backups taken; skips dirty repos; reversible (backups + git).
- SCRUTINY: **name != behavior** — "sync my work" is false; source is `workflow-configs/`, so it
  would NOT distribute the edited DWA `.github`, and could overwrite it. A hardcoded `/Users/<other>`
  base that does not resolve on this machine throws "source not found".
- VERDICT: **HOLD** — wrong tool for the goal; running it does nothing here (missing source) or
  clobbers work if "fixed". Escalated to user instead of running.

## Pairs with
`repo-sync-guard` (run forecast-scrutiny before any `--remediate`) and the MALFIG G-gates.
