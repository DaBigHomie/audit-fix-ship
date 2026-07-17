<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/prompts/README.md -- do not edit; run sync-skills.mts -->
# Orchestrator Prompt Template Library

Copy-paste prompt templates for BG dispatches. Each template embeds:

- Standard delivery lifecycle (Phase 1 PLAN-AUDIT → Phase N CORTEX close)
- Hard rails section (references
  `docs/policies/orchestrator-hard-rails-checklist.md`)
- Report-back format
- Standing-authorization citation slot
- CORTEX status-write-ordering rule reference (id `12903`)
- `BG-<TAG>` + `dispatch_id` placeholders

Companion docs:

- `docs/runbooks/orchestrator-playbook.md`
- `docs/policies/bg-agent-naming-convention.md`
- `docs/policies/orchestrator-hard-rails-checklist.md`
- `docs/policies/verify-then-write-discipline.md`

## When to use which template

| Template | Use when | Verified prior-art |
|---|---|---|
| `research-bg-template.md` | Discovery + evidence-only, no writes | `BG-JJ`, `BG-R`, `BG-S`, `BG-XX` |
| `execution-bg-template.md` | Standard delivery (author + gate + merge) | `BG-GGG`, `BG-HHH`, `BG-DDD` |
| `retirement-bg-template.md` | Dual-gate worktree / plan-doc retirement | Pattern A shape |
| `audit-bg-template.md` | PR audit / report-only, no PR authoring | `BG-KK`, `BG-LL` (contrast paths) |
| `meta-plan-bg-template.md` | Strategic doc / meta-plan authoring | `BG-FFFF` (arsenal expansion class) |
| `fanout-bg-template.md` | Governed cross-repo sync / fanout | `BG-WW`, `BG-OOO`, `BG-QQQ`, `BG-WWW` |
| `component-triad-bg-template.md` | CGC L3-L5 component authoring (index + plan + optimize) | Component-authoring class (e.g. PR `#76`) |
| `reconciliation-bg-template.md` | Cross-artifact reconciliation of divergent SSOTs | `BG-LLLL` (handoff mechanism reconciliation) |

All BG tags above were verified in `cortex_tasks` on 2026-07-10 via a
`description=ilike.%25BG-%25` scan. Fabricated tags are prohibited (see
`docs/policies/verify-then-write-discipline.md`).

## Placeholders (every template)

| Placeholder | Meaning |
|---|---|
| `{{BG_TAG}}` | Session-local nickname (e.g. `BG-KLMN`) |
| `{{DISPATCH_ID}}` | Global UUID from `cortex_bg_dispatches` |
| `{{SESSION_ID}}` | CORTEX `cortex_sessions.id` |
| `{{TARGET_REPO}}` | Repo slug (e.g. `documentation-standards`) |
| `{{TARGET_BRANCH}}` | Feature branch (e.g. `feat/foo-20260710`) |
| `{{TASK_ID}}` | CORTEX `cortex_tasks.id` for this cycle |
| `{{USER_DIRECTIVE}}` | Verbatim user quote authorizing the dispatch |
| `{{STANDING_AUTH_ID}}` | `standing_authorization:*` grant id |
| `{{DELIVERABLE_DESCRIPTION}}` | 1-2 sentence "what ships" summary |
| `{{HARD_RAILS_ADDITIONS}}` | Dispatch-specific rails on top of the standard checklist |

## Contract for every dispatch

1. Fresh worktree off `origin/master` — never in place.
2. `claimBranch()` (`documentation-standards#86`) BEFORE first commit.
3. Hard rails checklist re-asserted in the BG's PLAN block.
4. 4-gate stack: forecast-scrutiny → MALFIG → forensic-auditing →
   doc-forensic-inventory.
5. `status=complete` written LAST, after merge SHA is captured per rule
   `12903`.
