---
name: goals
description: Define a goal and drive it through the standard delivery lifecycle — goals → spec → fix → pr → malfig → merge → completions. Records the goal and every stage to CORTEX as an index row (never the body). Use when the user says "/goals", "create a goal", "set a goal", "new goal", or wants a unit of work tracked from intent to completion through the MALFIG gate.
---
<!-- GENERATED FROM maximus-ai/skills/goals/SKILL.md -- do not edit; run sync-skills.mts -->

# /goals — goal → completion lifecycle

Turns a stated goal into a tracked, gated delivery run. One goal = one CORTEX `goal:<slug>` index
row + a fixed stage ladder. Mirrors the house PRM skill→malfig→merge pattern
(`maximus-ai/docs/handoff/2026-06-13_prm-skill-malfig-merge.md`).

## Lifecycle (fixed ladder — do not skip a rung)

| # | Stage | What | Tool / gate |
|---|-------|------|-------------|
| 1 | **goals** | capture intent + acceptance criteria | this skill → `goal:<slug>` CORTEX row |
| 2 | **spec** | architecture/spec doc (SSOT in repo) | `/technical-solution-architecture` (auto validate + scrutinize) |
| 3 | **fix** | implement on a branch | code; portable `fsd-audit.mts` clean; `tsc --noEmit` 0 |
| 4 | **pr** | open the PR | `gh pr create` |
| 5 | **malfig** | gate suite G1–G9 | `/malfig` — BLOCKS on any fail; G6 routes via `/multi-model-task-assignment` |
| 6 | **merge** | squash merge after PASS | `gh pr merge --squash` |
| 7 | **completions** | mark done | `cortex_tasks` → complete + `goal:<slug>` status=complete (PR + merge SHA) |

## Steps

1. **Capture.** Upsert `goal:<slug>` into `cortex_knowledge`:
   `{title, why, acceptance_criteria[], stages[{name,status,evidence}], status:'active', created}`.
   NEVER store doc bodies — pointer + metadata only (`rule:maximus:doc_ssot_cortex_index`).
2. **Blast radius first.** If the goal touches >1 file/repo/agent, run `/multi-model-task-assignment`
   and record the routing before any dispatch (this is also MALFIG G6).
3. **Walk the ladder.** Advance one stage at a time; after each, update the goal row's current
   `stage` + per-stage `status` with **evidence** (command output, PR URL, gate verdict). A stage
   that fails its gate BLOCKS — fix and retry; do not advance.
4. **Complete.** Only when MALFIG PASS **and** merged: set `status='complete'`, attach `pr` + `merge_sha`.

## CORTEX goal row shape
`key · title · why · acceptance_criteria[] · stages[] · status · pr · merge_sha · github_sha`

## Rules
- Content SSOT lives as version-controlled markdown in the repo; CORTEX holds the **index row** only.
- No stage marked done without evidence. Never fabricate a PASS — quote the failing gate verbatim.
- Plans/specs land only when BOTH the doc is committed+pushed AND its CORTEX index row is cloud-verified.

## Change Log
| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-06-13 | Claude (opus) | Initial — goal→completion ladder; mirrors PRM skill→malfig→merge pattern. |
