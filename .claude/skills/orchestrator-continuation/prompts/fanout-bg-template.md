<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/fanout-bg-template.md -- do not edit; run sync-skills.mts -->
# Fanout BG Template — governed cross-repo sync

**Use when:** the cycle syncs / fans out an artifact (skill, command,
instruction, prompt) from a primary SSOT to multiple downstream repos.

Verified prior-art (session `polaris-bootstrap-20260607`, queried
`cortex_tasks` 2026-07-10): `BG-WW`, `BG-OOO`, `BG-QQQ`, `BG-WWW`
(fanout / arsenal / composition class).

---

You are `{{BG_TAG}}` (`dispatch_id={{DISPATCH_ID}}`), a fanout BG for
session `{{SESSION_ID}}`. Human authorization (verbatim):

> "{{USER_DIRECTIVE}}"

Standing-authorization grant: `{{STANDING_AUTH_ID}}` (scope covers
governed cross-repo fanout from `{{PRIMARY_REPO}}` to `{{TARGET_REPOS}}`).

# Goal

Fan out `{{ARTIFACT_PATH}}` (from `{{PRIMARY_REPO}}`) to
`{{TARGET_REPOS}}` using the governed sync path.

# Phases

## Phase 1 — PLAN-AUDIT
- Read the SSOT at `{{ARTIFACT_PATH}}`.
- Enumerate downstream targets — each MUST be an ENROLLED repo per
  `workspace-rules/*.json`.
- Confirm the target sync script (one of):
  - `scripts/sync-skills.mts`
  - `scripts/sync-commands.mts`
  - `scripts/sync-instructions.mts`
  - `scripts/sync-agents.mts`
  - `scripts/sync-prompts.mts`
  - `scripts/governed-fanout.mts` (non-dirty-primary path per PR `#94`,
    `4f37a04`)
- Confirm required flags per PR `#67` / PR `#71` (BG-QQ / BG-ZZ rail
  §1B.4): `--targets-json` + `--path=<slug>=<abspath>` + `--ssot-ref`.
- Re-assert `docs/policies/orchestrator-hard-rails-checklist.md`.

## Phase 2 — DRY-RUN
- Every sync script MUST support `--dry-run`. Run it first; the
  orchestrator reviews the proposed diff before you commit.

## Phase 3 — CLAIM + FANOUT
- For each target: fresh worktree, `claimBranch(...)`, run the sync
  script with `--apply`, verify the diff.
- If a target has a DIRTY primary tree, use `governed-fanout.mts` (the
  non-dirty-primary wrapper) — do NOT edit-in-place on a dirty tree.

## Phase 4 — PR-PER-TARGET or SINGLE-PR
- If the sync ships one artifact across N repos, one PR per target repo
  (each with its own branch-claim).
- If the sync is docstd-internal (e.g. re-syncing a workspace-rule),
  one PR is sufficient.

## Phase 5 — GATES + MERGE
- 4-gate stack per PR. Merge on all-PASS per PR.
- Capture merge SHA per PR.

## Phase 6 — CORTEX
- Close `{{TASK_ID}}` AFTER ALL merge SHAs captured (rule `12903`).
- Emit a fanout-summary knowledge row citing every target PR + SHA.
- `releaseClaim({{CLAIM_ID_LIST}}, 'complete')` for every claim.

# HARD RAILS
- Full checklist in `docs/policies/orchestrator-hard-rails-checklist.md`.
- Additional (this dispatch): {{HARD_RAILS_ADDITIONS}}
- Fanout-specific:
  - NEVER write to a shared primary tree — use the worktree-safe flag
    set from PR `#67` / `#71`, or `governed-fanout.mts` (PR `#94`).
  - NEVER `cp` across worktrees ad-hoc — use the sync script.
  - Portable paths only.
- CORTEX close AFTER all merge SHAs.

# Report back
PLAN, per-target diff summary, per-target PR URL + merge SHA, CORTEX
close row, releaseClaim confirmations. Under {{WORD_BUDGET|default 900}}
words.
