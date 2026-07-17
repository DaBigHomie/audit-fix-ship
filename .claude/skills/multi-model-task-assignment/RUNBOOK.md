---
title: "Multi-Model Task Assignment — RUNBOOK"
doc_type: instruction
repo: documentation-standards
session_id: task_mmta_runbook_20260707
created: 2026-07-07
status: active
tags: [mmta, runbook, orchestration, prime-orchestration, wave-delivery, loop-goal, patterns]
---

# multi-model-task-assignment — RUNBOOK

Companion runbook for `loop-goal-workflow.template.mts`.

**Version:** 1.0.0
**Updated:** 2026-07-07
**Canonical basis:** `documentation-standards/skills/multi-model-task-assignment/RUNBOOK.md` (Tier 1 hub SSOT — distributed to per-repo `.cursor/skills/` and `.gemini/skills/` mirrors via `scripts/sync-skills.mts`).

---

## 1. Overview

The mmta template is a **loop-until-dry, dynamic risk-routing** workflow scaffold (Shape A per SKILL.md §Step 3). The 2026-07-07 orchestration session ran ~20 merged PRs across `maximus-ai`, `documentation-standards`, and `project-polaris` and codified **9 reproducible patterns** for wave-shaped delivery on top of the base loop.

Use this RUNBOOK when you need to:

- Chain program waves (T0..Tn) through gate-and-merge cycles.
- Relocate docs across repos without a zero-window gap.
- Retire session rows safely (dual-gate).
- Author + gate + merge a new skill in one lifecycle.
- Coordinate BG (background) agents under G13 separation of duties + human authorization.

**Use the template alone (no RUNBOOK) when** the task is a single-scope find-fix sweep with unknown-N findings and no cross-wave/cross-repo coordination — that's what the base `Ground → Find → Route → Fix → Verify → Report` loop is for.

---

## 2. Prerequisites

| Requirement | Notes |
|---|---|
| `MGMT_ROOT` env var | Points at the sibling-clones root (`~/management-git` symlink). All paths in this RUNBOOK and the template resolve relative to it. |
| `SUPABASE_SERVICE_ROLE_KEY` | Loaded via `.env.local` or `import-env-from-knowledge.mts`. Required for CORTEX task/knowledge writes. |
| `SUPABASE_PROJECT` | Constant `eccpracfbrocmkzuogec` (CORTEX / maximus-ai). Do NOT derive dynamically per SKILL.md §Env loading. |
| CORTEX `session_id` | Either an active session id or a borrowed one (see §9). Never write CORTEX rows without one. |
| PAC placement understanding | Per `maximus-ai/docs/prime-governance/PRIME-PLACEMENT-ASSIGNMENT-CHARTER.md` §7.4 — repo-scoped docs live in the owning repo. |
| `gh` CLI authenticated | For every PR/merge assertion. |
| Baseline BG tool set | `Bash, Edit, Read, Skill, ToolSearch, Write` — Pattern I. |

---

## 3. The 4-gate stack

**Order matters. Bounded fix loop 1 iter per gate. Merge only on all-gates-PASS.**

| # | Gate | Purpose | Skill path |
|---|---|---|---|
| 1 | `forecast-scrutiny` | Blast radius, ownership locks, downstream drift preview | `documentation-standards/skills/forecast-scrutiny/SKILL.md` |
| 2 | `malfig` | G3 (secrets), G6 (path/SHA resolution), G8 (frontmatter + tsc), G11 (plan completeness), G13 (separation of duties), G14 where applicable | `documentation-standards/skills/malfig/SKILL.md` |
| 3 | `forensic-auditing` | Rules 1 (SSOT anchor), 4 (evidence citations resolve), 5 (no future-tense scope creep) | `~/.claude/skills/forensic-auditing/SKILL.md` |
| 4 | `doc-forensic-inventory` | Drift sweep — every other place the changed artifact is referenced gets updated | `documentation-standards/skills/doc-forensic-inventory/SKILL.md` |

**Prior-art PRs that passed this stack (2026-07-07):**

- `documentation-standards` PR #60 (`27de59b`) — session-chapter-index
- `documentation-standards` PR #61 (`3821468`) — claude-board
- `documentation-standards` PR #62 (`2a1f0c2`) — plan-by-surface-repo-layer-signal
- `maximus-ai` PR #197 (`44a2047`) — T1 validate-topology
- `maximus-ai` PR #198 (`71ada41`) — T2 blocking gate MALFIG G14

**How to invoke:** iterate `WavePlan.gate_stack` (see template `runGateStack` scaffold) and call each gate via the Claude Code Skill tool. The template does NOT ship a runtime invoker — it references gates by installed skill path so the caller wires them to whatever surface is available.

---

## 4. Patterns catalog

Each pattern below is a codified shape from the 2026-07-07 session. Every prior-art row was deterministically verified (`gh pr view`, `git ls-tree`) before this RUNBOOK landed — E-pattern discipline (§4.E).

### 4.A — Wave dispatch

**Purpose.** Chain `plan-audit-fix` + 4-gate + merge across T0..Tn program waves. One BG per wave, own PLAN block, own gate cycle, own merge, own CORTEX update, chained follow-up task at each merge.

**Prior-art.**

| Wave | task_id | Repo | PR | Merge SHA |
|---|---|---|---|---|
| T0 (seed) | `task_prime_routing_t0_seed_20260707` (rolled into `task_prime_model_selection_routing_20260707`) | maximus-ai | #196 | `f785ac5` |
| T1 (validator report-only) | `task_prime_routing_t1_validator_20260707` | maximus-ai | #197 | `44a2047` |
| T2 (blocking gate G14) | `task_prime_routing_t2_blocking_gate_20260707` | maximus-ai | #198 | `71ada41` |
| T2 (federated framing) | — | project-polaris | #14 | `eb8b34f` |

**Minimal invocation shape.** Copy `WAVE_PLAN_TEMPLATE` per wave; set `blocked_on: ['T<n-1>']`; land `follow_up_task_id` pointing at wave N+1 at merge time.

**Hard rails.** Never dispatch wave N+1 until wave N's PR is MERGED (not just OPEN, not just APPROVED). Never chain gates within a single PR — each wave = own PR.

### 4.B — Cross-repo relocation

**Purpose.** ADD-first-then-DELETE with 2 PRs, strict merge order. Zero-window guarantee: docs never absent across repos.

**Prior-art.**

| Role | Repo | PR | Merge SHA | Order |
|---|---|---|---|---|
| ADD | maximus-ai | #195 | `c202f5c` | merged FIRST |
| DELETE | documentation-standards | #59 | `123d6d2` | merged SECOND |

**Hard rails.** DELETE PR body must cite ADD PR merge SHA. Do NOT open both PRs simultaneously without documented merge order. Cross-ref rewrite happens on the ADD side (new canonical) — the DELETE side only removes the strays.

### 4.C — Session retirement (dual-gate)

**Purpose.** Retire session rows safely. Per row: expected HEAD SHA + `gh pr view --json state → MERGED` + `git status` clean. Only `--force` on explicit human authorization AND evidence.

**Prior-art.**

| Batch | Rows | Notes |
|---|---|---|
| `session_retirement` | 5 | baseline |
| `wave_2_retirement` | 2 | dual-gated |
| `row_1_retirement` | 1 | 1 gated + forced (auth cited) |
| `wave_3_retirement` | 12 | dual-gated (forecast-scrutiny + forensic-auditing) |

**Hard rails.** Never force-retire without a cited human-authorization string (§8). Dual-gate = forecast-scrutiny for blast-radius/lock check AND forensic-auditing for evidence check.

### 4.D — Skill authoring

**Purpose.** Author + gate + merge a new skill in ONE `plan-audit-fix` + 4-gate + merge lifecycle. Same pattern as this RUNBOOK+template lands under.

**Prior-art.**

| Skill | Repo | PR | Merge SHA |
|---|---|---|---|
| `session-chapter-index` | documentation-standards | #60 | `27de59b` |
| `claude-board` | documentation-standards | #61 | `3821468` |
| `plan-by-surface-repo-layer-signal` | documentation-standards | #62 | `2a1f0c2` |

**Hard rails.** New skills land in `documentation-standards/skills/<name>/` (Tier 1 hub SSOT). Fan-out to per-repo `.cursor/skills/` and `.gemini/skills/` mirrors is a post-merge `sync-skills.mts` follow-up, NOT part of the authoring PR.

### 4.E — Verify-then-write

**Purpose.** Every SHA / PR / task_id / skill path / CLI shape MUST be deterministically verified before it lands in a doc, template, CORTEX row, or downstream prompt. Subagent claims are claims, not evidence.

**Prior-art corrections in-session.**

- BG-Y's `desyncs` output — caught its own drift.
- `.agent-kb/anvil/cortex-boot.mts` claimed absent — deterministic check overturned.
- Boot script E10 falsification — retracted via `git ls-tree`.
- Fable framing corrected twice against Anthropic catalog.
- Antigravity CLI verified GUI-only (no `--model` flag) via `--help` probe.

**Memory anchor.** `~/.claude/projects/-Users-dabighomie-Management-Git-project-polaris/memory/verify-bg-agent-claims-before-cortex-write.md`

**Hard rails.** `test -f <path>` before citing a skill path. `gh pr view <N> --json state,mergeCommit` before citing a PR. `git ls-tree <sha> <path>` before citing an on-disk file at a SHA.

### 4.F — G13 separation of duties + human authorization

**Purpose.** Author ≠ reviewer ≠ fixer across cycles. Human authorization from an orchestrator brief satisfies G13 for merge-on-all-gates-PASS policy.

**Prior-art.** BG-AA's initial refusal to proceed under G13-self-review concern was overcome by re-dispatch with an explicit human-authorization citation. The `human-approval-gate` skill (installed at `~/.claude/skills/human-approval-gate/SKILL.md`) enforces this at build time.

**Hard rails.** The authoring agent may never self-approve. An approver identity may never be fabricated. When the same agent identity would be both author and reviewer, STOP and require re-dispatch to a distinct agent OR a cited human authorization string.

### 4.G — Honest UNKNOWN over fabrication

**Purpose.** STOP + report UNKNOWN over fabrication. Never invent invocation APIs, CLI flags, function signatures, or model ids. File a research follow-up in CORTEX.

**Prior-art.**

- Antigravity boot scripts NOT created — would have fabricated a non-existent `--model` flag (SKILL.md §Step 8 v1.1.2).
- Fable model-id research disclosed billing-exhaustion CLI probe caveat.
- T0 seeds refused to invent unknowns (`dame-luthas` `anvil_path` filed as follow-up).

**Hard rails.** If a required value is UNKNOWN, mark it `UNKNOWN — research required` and file `task_research_<scope>_<YYYYMMDD>` in CORTEX. Never proceed by fabricating.

### 4.H — 4-gate stack (order matters)

See §3. Prior-art PRs listed there.

**Hard rails.** Bounded fix loop 1 iter per gate. If gate N fails after 1 fix iter, STOP and report — do not loop indefinitely.

### 4.I — Baseline tool loading via ToolSearch

**Purpose.** Default BG tool set is sufficient for author + gate + merge cycles:

```
Bash, Edit, Read, Skill, ToolSearch, Write
```

Load Supabase MCP dynamically: `ToolSearch("select:mcp__claude_ai_Supabase__execute_sql")`. Git worktree + `gh` via Bash.

**Prior-art BGs (all succeeded on this baseline):** BG-X, BG-V0, BG-V1, BG-A93, BG-AA2, BG-Z, BG-Y, BG-BB.

**Hard rails.** Do NOT preload the full Chrome/Figma/Semrush MCP surface — that inflates the tool budget and slows the BG's first turn. Load MCP tools lazily via ToolSearch when the BG actually needs them.

---

## 5. Common failure modes

| Mode | Symptom | Resolution |
|---|---|---|
| BG-agent refusal (G13-self-review concern) | BG returns "cannot proceed — same identity as author" | Re-dispatch with explicit human-authorization citation (§4.F). BG-AA-style resolution. |
| Credit exhaustion mid-run | BG completes some waves then errors out on billing | Split scope: narrower `WAVE_PLAN` per BG, one wave per BG. BG-K-style. |
| Verify-then-write violation | Cited SHA/PR/path doesn't resolve on gate audit | Fix source doc, re-run gate 3 (forensic-auditing). Do NOT proceed with unverified claims. |
| Fabricated CLI shape | Boot script references non-existent flag | Mark UNKNOWN, file research task, remove the boot script (Pattern G). BG-J Fable claim was corrected this way. |
| Wrong merge order in cross-repo | DELETE PR merged before ADD PR | Zero-window gap opened; revert DELETE, re-merge in order (§4.B). |
| Retirement forced without auth | `--force` used on session row without cited authorization | Add authorization to `output_blob.authorization`, re-audit via forensic-auditing. |

---

## 6. Cross-repo coordination

**ADD-first-then-DELETE.** See §4.B.

**Cross-ref rewrite lives on the ADD side.** The new canonical PR updates every reference to the new location. The DELETE PR only removes the strays that the ADD side already replaced.

**Merge-order enforcement.** Cite the ADD PR's merge SHA in the DELETE PR body. Reviewers verify the SHA is on `origin/master` before approving the DELETE.

**Prior-art.** PR #195 (`c202f5c`, ADD in maximus-ai) merged 2026-07-07T22:16:11Z BEFORE PR #59 (`123d6d2`, DELETE in docstd) merged 2026-07-07T22:16:19Z — 8-second window with docs present in both repos.

---

## 7. Retirement discipline

Per §4.C, every retirement row goes through **dual-gate** verification:

**Forecast-scrutiny check (blast radius).**

1. Expected HEAD SHA matches `origin/master @ <sha>`.
2. No other live session owns the branch/worktree being retired.
3. Downstream refs (docs, plans, CORTEX pointers) have been updated.

**Forensic-auditing check (evidence).**

1. Every PR cited in the retirement row is `MERGED` per `gh pr view --json state`.
2. Every file cited exists at the cited SHA per `git ls-tree`.
3. `git status -sb` is clean on the retirement lane.

**`--force` policy.** Only on explicit human authorization (cited as a string in `output_blob.authorization`) AND evidence overriding the failing check. Prior-art: `row_1_retirement` was force-retired with `output_blob.authorization = "orchestrator brief 2026-07-07: proceed with force on stale worktree"`.

---

## 8. G13 separation of duties

**Rule.** The agent that authored a change may NOT approve it. The agent that fixed a gate finding may NOT then verify its own fix.

**Human authorization pattern.** Cite the orchestrator brief as a string:

```
output_blob.authorization = "orchestrator brief 2026-07-07: merge on all-gates-PASS, human-authorized"
```

**When to STOP + report vs proceed.**

- STOP if: you are about to approve your own PR, name a component/product/agent/skill, record a GOV verdict on your own work, or merge to a protected branch without human authorization.
- PROCEED if: an independent agent has verified the gate, OR a cited human authorization covers the specific action.

**Skill enforcement.** `human-approval-gate` (installed at `~/.claude/skills/human-approval-gate/SKILL.md`) — Separation-of-duties gate (MALFIG G13).

---

## 9. CORTEX conventions

**task_id format.** `task_<scope>_<YYYYMMDD>` — snake_case scope, ISO date.

**`output_blob` shape.** JSONB containing at minimum:

```json
{
  "gate_verdicts": {"forecast-scrutiny": "PASS", "malfig": "PASS", "forensic-auditing": "PASS", "doc-forensic-inventory": "PASS"},
  "prs": [{"repo": "...", "number": 123, "merge_sha": "abc1234"}],
  "follow_ups": ["task_<next_scope>_<YYYYMMDD>"],
  "authorization": "orchestrator brief <date>: <verb>"
}
```

**`session_id` borrowing.** If no active session exists, borrow the closest live session id per the `cortex-sync-skill` rules — do NOT invent a new session id row. If borrowing is not appropriate, STOP and require the caller to start a session first.

**Never mirror doc bodies into CORTEX.** CORTEX rows are index-only (pointers, verdicts, follow-ups). The doc body stays in git.

**Write via loaded MCP tool.** `mcp__claude_ai_Supabase__execute_sql` with `project_id: 'eccpracfbrocmkzuogec'`. Never hardcode credentials in a workflow file.

---

## 10. See also

**Tier 1 hub skills (documentation-standards/skills/):**

- `plan-audit-fix` — orchestrator for the 2-phase reconciliation + audit-fix flow used by every wave in this RUNBOOK.
- `forecast-scrutiny` — gate 1 of the 4-gate stack.
- `malfig` — gate 2 of the 4-gate stack.
- `doc-forensic-inventory` — gate 4 of the 4-gate stack.
- `session-chapter-index` — Pattern D prior-art (PR #60).
- `claude-board` — Pattern D prior-art (PR #61).
- `plan-by-surface-repo-layer-signal` — Pattern D prior-art (PR #62).
- `malfig-ship` — one-command ship workflow (PR/gate/merge).
- `orchestrator-continuation` — orchestrator-handoff entry-point (Standing menu + Patterns A-I dispatcher; PR #73, v1.2.0 adds standing-authorization via PR #82). Composes this RUNBOOK's patterns from a slash command.
- `orchestrator-response-templates` — reproducible OUTPUT shape of the orchestrator persona (status board, menu, BG-ack, session-tally, verify-then-write helper; PR #74).
- `orchestration-standards-enforcer` — sync + verify the canonical orchestration-standards block across enrolled surfaces (PR #65, #66).

**`/prime-orchestration-*` slash-command family (documentation-standards/.claude/commands/):**

- `/continue-cycles` — alias origin (PR #73).
- `/prime-orchestration-continue` — family-prefixed alias for `/continue-cycles` (PR #75).
- `/prime-orchestration-continue-prime` — scoped continuation: `prime_addressed=true` tasks only (scope-aware family, PR #75 line).
- `/prime-orchestration-continue-repo` — scoped continuation: one repo's non-Prime tasks (`--scope=repo=<slug>`).
- `/prime-orchestration-continue-external` — scoped continuation: the human-review queue only.
- `/prime-orchestration-adopt` — un-queued session-init: boot a session into PrimeO discipline when work is NOT yet tracked in CORTEX; `--concern` backfills a `cortex_tasks` row (PR #108 `aebd2de5`, v1.1.0).
- `/prime-orchestration-diagnose-session` — 8-stage session diagnostic (bootstrap → identity → CORTEX self-check → PR-CORTEX drift → git deep-dive → CLAUDE.md audit → MMTA hints → report); SSOT §10 invariant (PR #109 `a3c223bd`).
- `/prime-orchestration-audit-pr-set` — read-only 4-gate audit of N PRs across N repos (PR #75).
- `/prime-orchestration-validate-cross-workstation` — validate work authored on another workstation (PR #75).
- `/prime-orchestration-enforce` — chain enforcer + 4-gate for a scope (PR #75).
- `/prime-orchestration-delegate` — direct ARSENAL shape invocation via MCP `dispatch_next_cycle` (PR #75).
- `/prime-orchestration-grant-authorization` — record a durable cross-session standing authorization (PR #82).
- `/prime-orchestration-revoke-authorization` — soft-delete a prior standing authorization (PR #82).
- Family runbook: `documentation-standards/docs/runbooks/prime-orchestration-commands.md`.

**User-installed skills (`~/.claude/skills/`):**

- `forensic-auditing` — gate 3 of the 4-gate stack.
- `session-cleanup-checkpoint` — retirement + handoff support (§7).
- `human-approval-gate` — G13 separation of duties (§8).
- `audit-fix-plan` — Phase 2 delegate of `plan-audit-fix`.
- `audit-fix-ship` — extension that adds a governed Ship phase.

**Canonical docs:**

- `maximus-ai/docs/prime-governance/PRIME-PLACEMENT-ASSIGNMENT-CHARTER.md` — PAC §7.4 owning-repo rules.
- `documentation-standards/docs/DOC-TYPE-RUBRIC.md` — doc_type definitions.
- SKILL.md §Step 8 Dispatch Wiring — `boot/*.sh` scripts for `fable` and the Agent-tool reference stub.

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.2.0 | 2026-07-15 | §10 command family de-drifted (TASK-CRASH-RECOVER-06): added `/prime-orchestration-adopt` (PR #108), `/prime-orchestration-diagnose-session` (PR #109), and scoped `continue-prime`/`continue-repo`/`continue-external` — the list had frozen pre-2026-07-10 while the commands landed on `origin/master`. Verified each command file present via `git ls-tree origin/master .claude/commands/`. No pattern changes. |
| 1.1.0 | 2026-07-10 | §10 See also extended with cross-links to the `/prime-orchestration-*` slash-command family (`documentation-standards#75`, #82), `orchestrator-continuation` skill (#73, v1.2.0 standing-authorization via #82), `orchestrator-response-templates` (#74), `orchestration-standards-enforcer` (#65, #66), and the family runbook `docs/runbooks/prime-orchestration-commands.md`. No pattern changes. (`task_prime_orchestration_docs_sweep_20260710`.) |
| 1.0.0 | 2026-07-07 | Initial RUNBOOK companion to `loop-goal-workflow.template.mts` v1.1.0. Codifies Patterns A-I from the 2026-07-07 orchestration session. |
