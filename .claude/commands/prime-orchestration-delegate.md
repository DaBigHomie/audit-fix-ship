# /prime-orchestration-delegate — Direct ARSENAL shape invocation (meta-command)

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation` (preset: `delegate-shape`)
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**ARSENAL:** `maximus-ai/docs/prime-governance/PRIME-WORKFLOW-ARSENAL.md` (maximus-ai#212)
**MCP:** `dispatch_next_cycle` in `maximus-ai/.system/plugins/multi-model-orchestration/mcp/server.mts` (maximus-ai#213)
**Runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md` §5.4

The meta-command. Directly invokes an ARSENAL workflow shape with structured
input. Every other `/prime-orchestration-*` command is a preset over this one.

## Invocation

```
/prime-orchestration-delegate <ARSENAL-shape-id> <input-JSON>
```

- `<ARSENAL-shape-id>` — one of the canonical slugs declared in
  `ARSENAL_SHAPES` (`maximus-ai/.system/plugins/multi-model-orchestration/mcp/server.mts`).
  Verified slugs (as of maximus-ai#213 merge):
  `standard-delivery-lifecycle` (S1),
  `wave-dispatch-t0-tn` (S2),
  `cross-repo-relocation-add-first-then-delete` (S3),
  `fanout-batch-gate-mechanical-apply` (S4),
  `parallel-bg-fanout-5plus-lanes` (S13).
  Slugs for S5-S12 and S14 land as the ARSENAL_SHAPES const is extended —
  read the const at invocation time; do NOT invent a slug.
- `<input-JSON>` — a single JSON literal (single-quoted at the shell) that
  supplies the shape's declared inputs (goal, gates override, hard_rails,
  target_repo, target_task_id, etc.).

Example (S1 standard-delivery):

```
/prime-orchestration-delegate standard-delivery-lifecycle '{
  "goal": "Fix a typo in the README",
  "target_repo": "documentation-standards",
  "target_task_id": "task_readme_typo_20260709"
}'
```

Example (S13 parallel fanout):

```
/prime-orchestration-delegate parallel-bg-fanout-5plus-lanes '{
  "lanes": [
    {"lane_id": "A", "task_id": "task_a"},
    {"lane_id": "B", "task_id": "task_b"}
  ]
}'
```

## Contract

1. Read the current `ARSENAL_SHAPES` const from
   `$MGMT_ROOT/maximus-ai/.system/plugins/multi-model-orchestration/mcp/server.mts`.
   Validate `<ARSENAL-shape-id>` against `s.canonical_name` for every entry.
   HALT on unknown slug — do NOT fabricate.
2. Parse `<input-JSON>`. Reject on malformed JSON. HALT if required inputs
   for the picked shape are missing (`goal` is always required; other inputs
   are shape-specific).
3. Compose the dispatch spec via the MCP `dispatch_next_cycle` tool
   (maximus-ai#213) — pass `shape_id_override = <ARSENAL-shape-id>` and the
   parsed input as the task-blob overlay. The MCP returns a
   `next_orchestrator_action` spec (PARTIAL_PREP: MCPs cannot invoke the
   Claude Code Agent tool at runtime — this is an honest limitation
   preserved from PR #213).
4. Emit the returned dispatch spec + child `task_id` to chat. The caller
   completes the actual dispatch via the standard Task-tool path.

## Guardrails

- **Verify shape id against the CURRENT `ARSENAL_SHAPES` const.** Fabricated
  slugs must HALT the command with an explicit `unknown_shape` error.
- **JSON input is a single literal.** Do not accept multi-arg key=value form
  in this command — a future preset command may.
- **PARTIAL_PREP honesty.** The MCP prepares the spec; it does not execute
  it. The command reports this transparently.
- **No fanout to other repos in this command.** Fanout is Shape 4 / S13
  territory — invoke those shapes explicitly.
- **No destructive git ops** (`reset` / `rm` / `worktree remove` / force-push).
- **Portable.** No hardcoded user paths.
