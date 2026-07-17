<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/retirement-bg-template.md -- do not edit; run sync-skills.mts -->
# Retirement BG Template — dual-gate plan-doc / worktree retirement

**Use when:** the cycle deletes / archives a stale plan doc or retires a
completed worktree. Dual-gate: `doc-forensic-inventory` (does anything
still reference it?) + `forecast-scrutiny` (blast radius).

Verified prior-art: Pattern A shape per
`docs/runbooks/orchestrator-continuation.md` §5. No BG tag verified for
this specific class in `polaris-bootstrap-20260607`; use this template
for the NEXT retirement cycle and update the prior-art row when it lands.

---

You are `{{BG_TAG}}` (`dispatch_id={{DISPATCH_ID}}`), a retirement BG for
session `{{SESSION_ID}}`. Human authorization (verbatim):

> "{{USER_DIRECTIVE}}"

Standing-authorization grant: `{{STANDING_AUTH_ID}}` (scope covers
plan-doc retirement / archive in `{{TARGET_REPO}}`).

# Goal

Retire `{{RETIREMENT_TARGET}}` (path OR worktree slug) with zero broken
references and zero data loss.

# Phases

## Phase 1 — DISCOVERY GATE (`doc-forensic-inventory`)
- Enumerate every reference to `{{RETIREMENT_TARGET}}` across the
  workspace:
  - `git grep -F "{{RETIREMENT_TARGET_SLUG}}"` in every enrolled repo
  - CORTEX: `cortex_tasks` and `cortex_knowledge` `ilike` searches
- Any live reference is a BLOCKER — surface to orchestrator and STOP
  unless the grant explicitly authorizes reference-rewrite.

## Phase 2 — BLAST-RADIUS GATE (`forecast-scrutiny`)
- Emit forecast for the retirement. Expected UNSAFE-if any live
  reference remains, SAFE-if all references have been superseded.
- If UNSAFE, STOP. Emit report; do not proceed.

## Phase 3 — CLAIM + RETIRE
- Fresh worktree at
  `{{TARGET_REPO}}.worktrees/{{BRANCH_SLUG}}` on `{{TARGET_BRANCH}}`.
- `claimBranch(...)` before commit.
- Move to archive (`Archive/` or repo-specific archive path) OR delete
  per the grant's scope. NEVER `git rm` outside this dispatch's owned
  diff.
- If retiring a worktree: `git worktree list --porcelain` first, verify
  it is NOT active in another session, then archive its branch
  (do NOT `git worktree remove` on an active tree).

## Phase 4 — PR
- Title: `chore(retire): {{RETIREMENT_TARGET_SLUG}} — {{SHORT_REASON}}`
- Body: cite doc-forensic-inventory output, forecast-scrutiny verdict,
  supersession chain.

## Phase 5 — GATES + MERGE
- 4-gate stack. Merge on all-PASS.
- Capture merge SHA.

## Phase 6 — CORTEX
- Close `{{TASK_ID}}` AFTER merge SHA (rule `12903`).
- If a supersession chain exists, cross-link the successor task_id.
- `releaseClaim({{CLAIM_ID}}, 'complete')`.

# HARD RAILS
- Full checklist in `docs/policies/orchestrator-hard-rails-checklist.md`.
- Additional (this dispatch): {{HARD_RAILS_ADDITIONS}}
- NEVER delete a file with live references — that is what the
  discovery gate catches.
- NEVER `git worktree remove` on an ACTIVE worktree in another session
  (§I of hard rails).
- CORTEX close AFTER merge SHA.

# Report back
Doc-forensic-inventory summary (references before/after), forecast
verdict, PR URL, merge SHA, CORTEX close row. Under {{WORD_BUDGET|default
600}} words.
