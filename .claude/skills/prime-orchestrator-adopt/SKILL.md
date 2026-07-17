---
name: prime-orchestrator-adopt
version: "1.1.0"
updated: 2026-07-11
canonical_basis: documentation-standards/skills/prime-orchestrator-adopt/SKILL.md
description: >-
  Boot a session into PrimeO discipline for un-queued work. Loads persona +
  playbook + naming + hard-rails; queries standing-auth grants; determines
  next BG-XXXX tag; optionally backfills a concern into the queue. Also
  surfaces an informational Prime-queue view (visibility only — never
  auto-dispatches) so operators can see what is queued in case they want to
  work on that instead of their un-queued concern. Use at session start when
  the work is not yet tracked in CORTEX. Triggers: "/prime-orchestration-adopt",
  "adopt primeo", "primeO session-init", "start a primeO session for
  un-queued work".
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/prime-orchestrator-adopt/SKILL.md -- do not edit; run sync-skills.mts -->

# prime-orchestrator-adopt

Session-init entry-point that lets a fresh Claude Code Opus orchestrator
session **adopt** PrimeO discipline for work that is NOT yet queued in
CORTEX. Companion to `orchestrator-continuation` (which is the standing-menu
entry-point for work that IS queued).

**Hub:** `documentation-standards/skills/prime-orchestrator-adopt/SKILL.md`
**Slash command:** `documentation-standards/.claude/commands/prime-orchestration-adopt.md`
**Boot script:** `documentation-standards/scripts/prime-orchestrator-adopt-boot.mts`
**SSOT:** `maximus-ai/docs/PRIME-ORCHESTRATOR-SSOT.md`
**Persona:** `maximus-ai/docs/PRIME-ORCHESTRATOR-PERSONA.md`
**Architecture:** `maximus-ai/docs/PRIME-ORCHESTRATOR-ARCHITECTURE.md`

**Related skills:** `orchestrator-continuation` (standing-menu peer for
queued work), `forecast-scrutiny` (pre-dispatch blast radius),
`forensic-auditing` (methodology), `session-chapter-index` (session markers),
`session-cleanup-checkpoint` (teardown pair), `handoff-cloud-direct`
(durable checkpoint writes), `multi-model-task-assignment` (agent routing
for the picked cycle), `malfig` / `malfig-ship` (downstream when the picked
cycle produces a PR).

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill** | `$MGMT_ROOT/documentation-standards/skills/prime-orchestrator-adopt/SKILL.md` |
| **Boot script** | `$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-adopt-boot.mts` |
| **Slash command** | `$MGMT_ROOT/documentation-standards/.claude/commands/prime-orchestration-adopt.md` |
| **Persona (loaded)** | `$MGMT_ROOT/maximus-ai/docs/PRIME-ORCHESTRATOR-PERSONA.md` |
| **Playbook (loaded)** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-playbook.md` |
| **Naming (loaded)** | `$MGMT_ROOT/documentation-standards/docs/policies/bg-agent-naming-convention.md` |
| **Hard rails (loaded)** | `$MGMT_ROOT/documentation-standards/docs/policies/orchestrator-hard-rails-checklist.md` |
| **Verify-then-write (loaded)** | `$MGMT_ROOT/documentation-standards/docs/policies/verify-then-write-discipline.md` |
| **SSOT (loaded)** | `$MGMT_ROOT/maximus-ai/docs/PRIME-ORCHESTRATOR-SSOT.md` |
| **Architecture (loaded)** | `$MGMT_ROOT/maximus-ai/docs/PRIME-ORCHESTRATOR-ARCHITECTURE.md` |
| **Arsenal (referenced)** | `$MGMT_ROOT/maximus-ai/docs/prime-governance/PRIME-WORKFLOW-ARSENAL.md` |

## 1. When to use

- A fresh session opens and the work is **not yet tracked** in CORTEX. There
  is no queued task, no standing-menu row, no chapter marker for this
  concern.
- An operator wants to enter PrimeO discipline for a free-form concern
  before the work is a formal cycle.
- A `/loop`-scheduled sweep specifically to onboard un-queued concerns into
  the Prime queue.

Non-symptoms:

- The session already has queued work → use `orchestrator-continuation` and
  the `/prime-orchestration-continue*` family.
- The session is closing → use `session-cleanup-checkpoint` +
  `handoff-cloud-direct`.

## 2. What this skill loads

The boot script emits an ADOPTION_REPORT that surfaces the paths of the
canonical context files. The adopting agent is expected to read them
directly (the boot script does not inline their bodies — that would violate
verify-then-write on cached copies):

- `PRIME-ORCHESTRATOR-PERSONA.md` — agent-facing spec + slash-command surface
- `docs/runbooks/orchestrator-playbook.md` — Patterns A-I (dispatch shapes)
- `docs/policies/bg-agent-naming-convention.md` — BG-XXXX letter series
- `docs/policies/orchestrator-hard-rails-checklist.md` — the do-not-do list
- `docs/policies/verify-then-write-discipline.md` — subagent-claims discipline
- `PRIME-ORCHESTRATOR-SSOT.md` — taxonomy + governance chain
- `PRIME-ORCHESTRATOR-ARCHITECTURE.md` — component design
- `PRIME-WORKFLOW-ARSENAL.md` — 14-shape catalog

## 3. Args

| Flag | Purpose |
|------|---------|
| `--concern="<text>"` | Optional. Backfills the concern into `cortex_tasks` as `prime_addressed=true`, P2, pending. |
| `--scope=prime\|repo=<slug>\|external` | Optional. Sets the session default scope and — if `--concern` is provided — the `repo` field on the new row. |
| `--dry-run` | Report the planned write without touching CORTEX. |
| `--no-menu` | Suppress the informational Queued-work section (default: menu is shown when the Prime queue is non-empty). |
| `--format=md\|json` | Output format (default `md`). |
| `--env-file=<path>` | Override env file (default `$MGMT_ROOT/maximus-ai/.env.local`). |
| `--project=<ref>` | Override Supabase project ref. |
| `--verbose` | Log intermediate steps (never prints secrets). |

## 4. Output format

Markdown (default) or JSON. The report contains:

- Scope and dry-run flags
- Loaded context file paths (persona, playbook, naming, hard-rails,
  verify-then-write, SSOT, architecture, arsenal)
- Active standing-authorization grants (count + up to 20 summary rows)
- Active BG-XXXX claims from `cortex_bg_dispatches` (count, tags in use,
  branches in use)
- The next BG-XXXX tag (per naming convention, skipping tags already in use)
- Recommended workflow shapes (a short static pointer set)
- Concern outcome: `provided=false` | `dry_run` (`would_write`) |
  `written` (`id`) | `error`
- **Informational Queued-work menu** (v1.1.0): a read-only view of the
  Prime queue (`prime_addressed=true`, status in `pending/in_progress/blocked`),
  rendered ONLY IF the queue is non-empty AND `--no-menu` was NOT passed.
  Clearly labeled "informational" — ADOPT never auto-picks or dispatches a
  queued row. This closes the visibility gap so ADOPT operators can decide
  whether their un-queued concern is actually higher-priority than what is
  already queued. To see the FULL standing menu (all scopes, hygiene items,
  chapter markers, stale worktrees), chain
  `/prime-orchestration-continue-prime`.

## 5. How to transition into standing-menu mode

If `--concern` is provided AND the write succeeds:

```
/prime-orchestration-adopt --concern="…" --scope=repo=<slug>
  → task written, prime_addressed=true
/prime-orchestration-continue-prime
  → row appears in the Prime queue and is picked up by the standing menu
```

If no concern is written, proceed directly with the recommended workflow
shape — the arsenal catalog is the SSOT for shape selection.

## 6. HARD RAILS

- **Never dispatch a BG.** The boot script loads context; the adopting agent
  decides what to dispatch. `/prime-orchestration-adopt --auto` does not
  exist by design — auto-dispatch is not a valid adopt-mode operation.
- **Read-only-by-default.** The boot script writes to CORTEX ONLY when
  `--concern` is provided AND `--dry-run` is NOT provided. All other
  invocations are pure queries.
- **rule 12903 preserved.** Any `--concern` write uses `status='pending'`.
  The script never writes `status='complete'` — that ordering is owned by
  the merge-SHA capture step.
- **No destructive git ops.** No `reset` / `rm` / `worktree remove` /
  force-push. The script never touches trees.
- **No manifest edits.** Do not edit `manifest.json` from this skill — the
  skill is declarative; parity to `.cursor/skills/`, `.gemini/skills/`, and
  `.agents/skills/` is Phase 3 territory (fanout program).
- **Portability.** `$MGMT_ROOT` resolution mandatory. No hardcoded
  `/Users/...` paths.

## 7. Change Log

- 2026-07-11 (v1.1.0) — Add informational Queued-work section rendered when
  the Prime queue is non-empty (visibility fix per user report). Never
  auto-dispatches; read-only. Adds `--no-menu` opt-out. Closes the
  ADOPT-menu-gap. Tracker: `task_adopt_missing_standing_menu_20260711`
  (finding-to-heal §7.4 invocation, dispatcher BG-VVVVV).
- 2026-07-10 (v1.0.0) — Initial. Fills the session-init gap between fresh
  session start and the standing-menu discipline required by
  `/prime-orchestration-continue*`. Tracker:
  `task_prime_orchestration_adopt_delivered_20260710`.
