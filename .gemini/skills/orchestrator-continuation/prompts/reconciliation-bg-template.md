<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/reconciliation-bg-template.md -- do not edit; run sync-skills.mts -->
# Reconciliation BG Template — cross-artifact reconciliation

**Use when:** two or more artifacts drifted apart (e.g. a doc says X, a
skill says Y, CORTEX says Z) and the cycle reconciles them to a single
SSOT with a supersession chain.

Verified prior-art (session `polaris-bootstrap-20260607`, queried
`cortex_tasks` 2026-07-10): `BG-LLLL` (handoff mechanism reconciliation —
`documentation-standards#91`, `6277bfd`, supersedes closed PR `#90`).
Trigger incident for CORTEX rule `12903` (pre-emptive
`status=complete`).

---

You are `{{BG_TAG}}` (`dispatch_id={{DISPATCH_ID}}`), a reconciliation
BG for session `{{SESSION_ID}}`. Human authorization (verbatim):

> "{{USER_DIRECTIVE}}"

Standing-authorization grant: `{{STANDING_AUTH_ID}}` (scope covers
cross-artifact reconciliation in `{{TARGET_REPO}}`).

# Goal

Reconcile `{{ARTIFACT_A}}` ↔ `{{ARTIFACT_B}}` (add `↔ ARTIFACT_C` as
needed) into a single SSOT with a documented supersession chain.

# Phases

## Phase 1 — DIVERGENCE MAP
- Read all divergent artifacts.
- For each, capture:
  - Current state (with evidence: file SHA, CORTEX id, PR merge SHA).
  - Which claim is CURRENT-TRUTH per real state (`gh pr view`,
    `git show`, CORTEX query).
- Emit a DIVERGENCE_MAP table.

## Phase 2 — SSOT DECISION
- Pick the SSOT (usually the artifact closest to observable disk state).
- Emit rationale + supersession chain (`supersedes: [old_ids]`,
  `superseded_by: null`).

## Phase 3 — CLAIM + RECONCILE
- Fresh worktree off `origin/master`.
- `claimBranch(...)`.
- Update the SSOT to reflect current truth.
- Update every divergent artifact to point at the SSOT (or archive it
  with a `superseded_by` pointer).

## Phase 4 — PR
- Title: `docs(reconcile): {{ARTIFACT_A_SLUG}} + {{ARTIFACT_B_SLUG}} — {{DECISION_SUMMARY}}`
- Body: DIVERGENCE_MAP, SSOT decision, supersession chain, verification
  evidence.

## Phase 5 — GATES + MERGE
- 4-gate stack. Rule 4 (non-fabrication) CRITICAL — the whole point of
  this cycle is to bottom out on real state.
- Merge on all-PASS.

## Phase 6 — CORTEX
- Close `{{TASK_ID}}` AFTER merge SHA (rule `12903` — this template's
  origin story is a violation of that rule).
- Update superseded knowledge rows: set `superseded_by` to point at the
  new SSOT.
- `releaseClaim({{CLAIM_ID}}, 'complete')`.

# HARD RAILS
- Full checklist in `docs/policies/orchestrator-hard-rails-checklist.md`.
- Additional (this dispatch): {{HARD_RAILS_ADDITIONS}}
- Reconciliation-specific:
  - EVERY current-state claim backed by a probe (verify-then-write).
  - Supersession chain is explicit: `supersedes: [...]`,
    `superseded_by: <id or null>`.
  - CORTEX rule `12903` — the historical BG-LLLL error was pre-emptive
    close. Do NOT repeat.
- CORTEX close AFTER merge SHA.

# Report back
DIVERGENCE_MAP, SSOT decision, supersession chain, per-gate verdicts,
PR URL, merge SHA, CORTEX close row + superseded-rows update log. Under
{{WORD_BUDGET|default 800}} words.
