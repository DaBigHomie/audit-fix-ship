#!/usr/bin/env bash
# GENERATED FROM maximus-ai/skills/multi-model-task-assignment/boot/claude-code-agent-tool-subagent.sh -- do not edit; run sync-skills.mts
# claude-code-agent-tool-subagent.sh
#
# WIRED spawn shape for: Claude Code Agent tool subagent (in-session)
#
# IMPORTANT: This is a DOCUMENTATION STUB, not an executable shell fork.
# The Claude Code Agent tool is only reachable from *inside* a Claude Code
# session's tool-use loop. There is no CLI that spawns "an Agent subagent"
# from a plain shell — the orchestrator must be a running Claude Code
# session that invokes the `Task` tool.
#
# This file exists so:
#   1. Step 8 of SKILL.md has a real boot_script path to point at, not just "n/a".
#   2. Anyone auditing wired-vs-unwired dispatch can grep this file for the
#      canonical Agent-tool call shape without opening the Claude Code docs.
#   3. Fabrication is prevented — running this script prints the shape and
#      exits; it does NOT pretend to spawn anything.
#
# Canonical Agent-tool call shape (from inside a Claude Code session):
#
#   Tool: Task
#   Parameters:
#     subagent_type: general-purpose | Explore | Plan
#     description:   "<3-5 word verb-object>"     # short label the harness shows
#     prompt:        "<full brief for the subagent>"
#     run_in_background: true                     # for long-running work; harness notifies on completion
#
# Required env (inherited from the parent Claude Code session):
#   - MCP config: .mcp-config.json in the repo (or ~/.claude/mcp.json)
#   - SUPABASE_SERVICE_ROLE_KEY, CORTEX_DB (for CORTEX writes inside the subagent)
#   - Anything the parent session has via .env.mcp / ~/.zshrc
#
# Result handling:
#   - Synchronous: the Task tool returns the subagent's final assistant text.
#   - Background (run_in_background: true): the harness fires a completion
#     notification; the orchestrator picks it up on the next turn.
#
# See:
#   - skills/multi-model-task-assignment/SKILL.md — Step 8 dispatch matrix
#   - task_skill_mmta_glasswing_to_fable_20260707 — origin of this wiring
#
# Usage from a shell (informational only — will NOT spawn a subagent):
#   ./claude-code-agent-tool-subagent.sh

set -euo pipefail

cat <<'SHAPE'
[claude-code-agent-tool-subagent] This is a documentation stub, not a shell spawner.

The Claude Code Agent tool is in-session only. Canonical call shape:

  Task(
    subagent_type = "general-purpose",   # or "Explore", "Plan"
    description   = "<short label>",
    prompt        = "<full brief>",
    run_in_background = true              # for long-running work
  )

To actually dispatch: be inside a Claude Code session and call the Task tool
with the parameters above. There is no shell CLI that reaches the Agent tool
from outside a running session.

Exit 0 — nothing spawned.
SHAPE

exit 0
