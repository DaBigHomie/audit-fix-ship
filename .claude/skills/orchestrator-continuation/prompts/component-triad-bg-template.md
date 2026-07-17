<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/component-triad-bg-template.md -- do not edit; run sync-skills.mts -->
# Component-Triad BG Template — CGC L3-L5 component authoring

**Use when:** the cycle authors a new Prime Component with the standard
triad: index + plan + optimize. Verified prior-art: PR `#76`
(`docs(proposals): new Prime Component "workflow-conductor"`, merged
`2026-07-08T14:12:55Z`) — component discovery + naming class.

---

You are `{{BG_TAG}}` (`dispatch_id={{DISPATCH_ID}}`), a component-triad
BG for session `{{SESSION_ID}}`. Human authorization (verbatim):

> "{{USER_DIRECTIVE}}"

Standing-authorization grant: `{{STANDING_AUTH_ID}}` (scope covers
component authoring in `{{TARGET_REPO}}`).

# Goal

Author the three-doc component triad for `{{COMPONENT_NAME}}`:

1. `{{COMPONENT_NAME}}-index.md` — the discovery/index doc
2. `{{COMPONENT_NAME}}-plan.md` — the wave / delivery plan
3. `{{COMPONENT_NAME}}-optimize.md` — naming + optimization decisions

# Phases

## Phase 1 — PLAN-AUDIT
- Read the CGC (Component Governance Council) framework docs relevant to
  the target level (L3-L5).
- Read prior component-triad exemplars — verify with `gh pr view` before
  citing.
- Re-assert `docs/policies/orchestrator-hard-rails-checklist.md`.
- Confirm the component NAME is unique (see G13 —
  `human-approval-gate` — naming decisions require human sign-off).

## Phase 2 — NAMING GATE (G13)
- Propose 2-3 candidate names + rationale.
- STOP and surface to orchestrator for HUMAN approval before authoring
  the docs — self-approval prohibited (VIO-0002 precedent).

## Phase 3 — AUTHOR
- Fresh worktree off `origin/master`.
- `claimBranch(...)`.
- Author the triad, cross-linking the three docs.
- Every prior-art citation verified per
  `docs/policies/verify-then-write-discipline.md`.

## Phase 4 — DUAL VALIDATION
- `maximus-prime-doc-validation` skill on each of the three docs.
- Verdict must be PASS.

## Phase 5 — PR + GATES + MERGE
- Single PR carrying all three docs (unless the triad is intentionally
  staged).
- 4-gate stack. Merge on all-PASS.

## Phase 6 — CORTEX
- Create `{{TASK_ID}}` for the component's lifecycle.
- Close AFTER merge SHA (rule `12903`).
- Register the component in the components index / registry knowledge
  row.
- `releaseClaim({{CLAIM_ID}}, 'complete')`.

# HARD RAILS
- Full checklist in `docs/policies/orchestrator-hard-rails-checklist.md`.
- Additional (this dispatch): {{HARD_RAILS_ADDITIONS}}
- Component-triad-specific:
  - Naming decision REQUIRES human approval (G13) — never self-approve.
  - The three docs MUST cross-link to each other.
  - `doc_type` per triad member conforms to the frontmatter enum
    (`instruction` / `plan` — verify).
- CORTEX close AFTER merge SHA.

# Report back
Naming candidates + human-approved choice, PLAN, per-doc diff summary,
dual-validation verdict, PR URL, merge SHA, CORTEX row + component
registry entry. Under {{WORD_BUDGET|default 900}} words.
