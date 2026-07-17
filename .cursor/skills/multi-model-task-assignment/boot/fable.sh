#!/usr/bin/env bash
# GENERATED FROM maximus-ai/skills/multi-model-task-assignment/boot/fable.sh -- do not edit; run sync-skills.mts
# fable.sh
#
# WIRED spawn shape for: Fable (Claude AI model — claude-fable-5)
#
# Fable is a *Claude AI model* dispatched via the Claude Code CLI's `--model`
# flag. This is distinct from the "Claude Code Agent tool subagent" (in-session
# Task tool). See boot/claude-code-agent-tool-subagent.sh for that.
#
# Verified 2026-07-07 against the Anthropic model catalog at
# https://platform.claude.com/docs/en/about-claude/models/overview
#
#   Model name: Claude Fable 5
#   Claude API ID:    claude-fable-5
#   Claude API alias: claude-fable-5
#   GA on Claude Code: 2026-07-01
#
# Research doc: maximus-ai/docs/research/2026-07-07_fable-model-id-research.md
#
# CLI shape (from `claude --help` on v2.1.146):
#
#   claude --model claude-fable-5 --print "<prompt>" \
#          [--output-format json|stream-json] \
#          [--session-id <uuid>] \
#          [--mcp-config <path>] \
#          [--add-dir <path>] \
#          [--allowedTools "<tools...>"]
#
# Required env:
#   FABLE_PROMPT       — the task envelope / brief for the Fable session
#   MMTA_TASK_ID       — CORTEX task id this dispatch is servicing (for logs)
# Optional env:
#   FABLE_MODEL        — override model id (default: claude-fable-5)
#   FABLE_SESSION_ID   — reuse an existing Claude Code session id (uuid)
#   FABLE_MCP_CONFIG   — path to .mcp-config.json (default: repo .mcp-config.json)
#   FABLE_OUTPUT_FORMAT — json | stream-json (default: json)
#   FABLE_ADD_DIR      — extra dir to grant tool access to
#   FABLE_ALLOWED_TOOLS — space-separated tool allowlist string
#
# Behavior:
#   1. Validate env; fail non-zero with a clear message if FABLE_PROMPT unset.
#   2. Resolve workspace root via resolve-workspace.mts (no hardcoded /Users/...).
#   3. Write the prompt to a tmp file (avoid inlining giant prompts on argv).
#   4. Launch `claude --model <FABLE_MODEL> --print` reading the prompt from stdin.
#   5. Print `pid=<n>` and `log=<path>` to stdout so the orchestrator can track it.
#
# The `claude` CLI must be on PATH. On this workstation it resolves to
# /Users/dabighomie/.nvm/versions/node/v22.12.0/bin/claude (v2.1.146).
#
# See also:
#   - skills/multi-model-task-assignment/SKILL.md — Step 8 dispatch matrix (fable row)
#   - skills/multi-model-task-assignment/boot/README.md — wired-vs-UNKNOWN inventory
#   - task_research_fable_model_id_20260707 — CORTEX task closing this gap

set -euo pipefail

# ---------- env validation ----------

: "${FABLE_PROMPT:?FABLE_PROMPT is required (task envelope / brief text for the Fable session)}"
: "${MMTA_TASK_ID:?MMTA_TASK_ID is required (CORTEX task id this dispatch is servicing)}"

FABLE_MODEL="${FABLE_MODEL:-claude-fable-5}"
FABLE_OUTPUT_FORMAT="${FABLE_OUTPUT_FORMAT:-json}"

# ---------- workspace resolution (no hardcoded paths) ----------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# skills/multi-model-task-assignment/boot -> documentation-standards
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RESOLVE_MTS="$REPO_ROOT/scripts/resolve-workspace.mts"

if [[ -f "$RESOLVE_MTS" ]]; then
  WORKSPACE_ROOT="$(npx --yes tsx "$RESOLVE_MTS" --print-root 2>/dev/null || true)"
fi
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(cd "$REPO_ROOT/.." && pwd)}"

# ---------- prompt tmp file (avoid argv bloat) ----------

TMP_DIR="${TMPDIR:-/tmp}/mmta-fable"
mkdir -p "$TMP_DIR"
PROMPT_FILE="$TMP_DIR/${MMTA_TASK_ID}.prompt.txt"
LOG_FILE="$TMP_DIR/${MMTA_TASK_ID}.log"
printf '%s' "$FABLE_PROMPT" > "$PROMPT_FILE"

# ---------- build args ----------

CLAUDE_BIN="$(command -v claude || true)"
if [[ -z "$CLAUDE_BIN" ]]; then
  echo "error: 'claude' CLI not on PATH — install Claude Code first" >&2
  exit 127
fi

ARGS=(--model "$FABLE_MODEL" --print --output-format "$FABLE_OUTPUT_FORMAT")

if [[ -n "${FABLE_SESSION_ID:-}" ]]; then
  ARGS+=(--session-id "$FABLE_SESSION_ID")
fi

DEFAULT_MCP="$WORKSPACE_ROOT/.mcp-config.json"
MCP_CONFIG="${FABLE_MCP_CONFIG:-$DEFAULT_MCP}"
if [[ -f "$MCP_CONFIG" ]]; then
  ARGS+=(--mcp-config "$MCP_CONFIG")
fi

if [[ -n "${FABLE_ADD_DIR:-}" ]]; then
  ARGS+=(--add-dir "$FABLE_ADD_DIR")
fi

if [[ -n "${FABLE_ALLOWED_TOOLS:-}" ]]; then
  # shellcheck disable=SC2206
  ARGS+=(--allowedTools $FABLE_ALLOWED_TOOLS)
fi

# ---------- launch ----------

# Stream stdin from the prompt file; capture stdout+stderr to LOG_FILE.
# nohup so the orchestrator can survive shell exit; & to background.
nohup "$CLAUDE_BIN" "${ARGS[@]}" < "$PROMPT_FILE" > "$LOG_FILE" 2>&1 &
CLAUDE_PID=$!

echo "pid=$CLAUDE_PID"
echo "log=$LOG_FILE"
echo "model=$FABLE_MODEL"
echo "task=$MMTA_TASK_ID"

exit 0
