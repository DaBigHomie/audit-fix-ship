<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/meta-plan-bg-template.md -- do not edit; run sync-skills.mts -->
# Meta-Plan BG Template — strategic doc / plan authoring

**Use when:** the cycle authors a strategic document — a plan, an
architecture doc, a workflow-arsenal expansion, or a governance policy.
Higher stakes than a normal execution cycle; requires meta-plan gate.

Verified prior-art (session `polaris-bootstrap-20260607`, queried
`cortex_tasks` 2026-07-10): `BG-FFFF` (arsenal expansion class —
`task_workflow_arsenal_expansion_ongoing_20260709`).

---

You are `{{BG_TAG}}` (`dispatch_id={{DISPATCH_ID}}`), a meta-plan BG for
session `{{SESSION_ID}}`. Human authorization (verbatim):

> "{{USER_DIRECTIVE}}"

Standing-authorization grant: `{{STANDING_AUTH_ID}}` (scope covers
strategic-doc authoring in `{{TARGET_REPO}}`).

# Goal

Author `{{META_PLAN_TARGET}}` — a `{{DOC_TYPE}}` doc that ships
`{{DELIVERABLE_DESCRIPTION}}`.

# Phases

## Phase 1 — PLAN-AUDIT (meta)
- Read every referenced predecessor doc (canonical basis).
- Read the frontmatter policy: `workspace-rules/forge-knowledge-base.instructions.md`.
- Confirm `doc_type` is valid (fall back to `instruction` if the
  natural type isn't in the enum — same precedent as
  `env-local-service-role-rotation.md`).
- Re-assert `docs/policies/orchestrator-hard-rails-checklist.md`.

## Phase 2 — AUTHOR
- Fresh worktree off `origin/master`.
- `claimBranch(...)` before commit.
- Draft the doc. MUST include:
  - Standard frontmatter (doc_type, title, version, updated, repo,
    canonical_basis, owner, status, task_id, tags).
  - One-line rule at the top.
  - Change Log section at the bottom.
- Every citation is verified per
  `docs/policies/verify-then-write-discipline.md`.

## Phase 3 — DUAL VALIDATION (meta-plan-specific)
- Run `maximus-prime-doc-validation` skill (frontmatter validator +
  plan-completeness + handoffs validator + prime-doc-lattice +
  documentation-standards).
- Verdict must be PASS before opening the PR.

## Phase 4 — PR + GATES
- 4-gate stack. Merge on all-PASS.

## Phase 5 — CORTEX
- Close `{{TASK_ID}}` AFTER merge SHA (rule `12903`).
- Cross-link from any dependent tasks / knowledge rows.
- `releaseClaim({{CLAIM_ID}}, 'complete')`.

# HARD RAILS
- Full checklist in `docs/policies/orchestrator-hard-rails-checklist.md`.
- Additional (this dispatch): {{HARD_RAILS_ADDITIONS}}
- Meta-plan-specific:
  - NO fabrication in prior-art tables — every cited BG / PR / task_id
    verified against CORTEX or `gh pr view`.
  - Every acronym / component name defined on first use.
  - `doc_type` conforms to the enum in
    `workspace-rules/forge-knowledge-base.instructions.md`.
- CORTEX close AFTER merge SHA.

# Report back
PLAN, doc structure summary, dual-validation verdict, per-gate verdicts,
PR URL, merge SHA, CORTEX row id. Under {{WORD_BUDGET|default 900}} words.
