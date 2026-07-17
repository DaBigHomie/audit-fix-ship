<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-write-handoff.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-write-handoff — Write a resumable handoff to CORTEX (SSOT)

**Model:** claude-opus (orchestrator) · **Skill:** `handoff-cloud-direct`
**Spec:** `documentation-standards/skills/handoff-cloud-direct/SKILL.md`
**Policy:** `documentation-standards/docs/policies/handoff-cortex-ssot.md`
**Helper:** `documentation-standards/scripts/write-handoff-to-cortex.mts`
**Orchestration peer (session close):** `documentation-standards/skills/handoff-sunset-v30/SKILL.md` — for multi-repo session-close / workstream-fork, prefer sunset-v30 (which invokes this helper at its Step 4).
**Compliance rail:** `documentation-standards/skills/handoff-framework-guard/SKILL.md` — the helper is protected framework; run it, never edit it.

Writes a resumable handoff row directly to `cortex_knowledge` — the CORTEX
SSOT for handoffs per the MP continuity standard. Use when the
`handoff-framework` MCP is unavailable, when you want the durable SSOT
record deliberately, or from any script/hook path. The MCP writes to the
same row this command writes.

## When to use

- The `handoff-framework` MCP is not connected in this session but a
  handoff is due (session wind-down, cross-workstation transfer, or a
  `/loop`-scheduled orchestrator run).
- You want the durable CORTEX record explicitly (belt-and-suspenders even
  when the MCP is up).
- A future orchestrator session must be able to resume this session via
  `/continue-cycles` — that boot script queries the CORTEX row this
  command writes.

## Invocation

```
/prime-orchestration-write-handoff
```

The orchestrator then:

1. Prompts the user (or reads from prior session context) for the handoff
   shape — `from_session`, `to_session` (default `any-future`),
   `handoff_type`, `context.goal`, `context.current_state`,
   `artifacts[]`, `blockers[]`, `next_orchestrator_actions[]`,
   `resumable_via.command`, optional `resumable_via.authorization_check`,
   `supersedes` (default null).
2. Assembles the payload per the v1.0 schema (embedded in
   `skills/handoff-cloud-direct/SKILL.md` §3).
3. Runs the helper `--dry-run` first — prints proposed key + validated
   payload for human review.
4. On confirm, re-runs `--apply` — UPSERTs into `cortex_knowledge` on
   `(key, repo)`.
5. Reports the `handoff_id` and the CORTEX row id.

## Contract

1. Compose `forecast-scrutiny` before `--apply` — expected SAFE for
   `--dry-run`, SAFE_WITH_GUARDS for `--apply` (single-row UPSERT, no
   schema change).
2. Compose `session-chapter-index` upstream when possible — its
   `handoff_seed` block maps directly into `context.*`.
3. NEVER auto-`--apply` without an in-transcript human confirmation OR a
   valid `resumable_via.authorization_check` grant that covers "write
   handoff row".
4. Set `supersedes` when replacing a prior handoff — never silently
   overwrite. UPSERT on `(key, repo)` is idempotent by date; a same-day
   re-issue is fine, but a NEW handoff superseding a prior day's handoff
   should reference the prior key.
5. When done, print:
   - the `handoff_id` (= the CORTEX key)
   - the `cortex_row_id`
   - the discovery query the caller can run to verify

## Helper invocation (canonical)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"

# Dry-run (default)
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --payload-file=./handoff.json

# Apply after human confirmation
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --payload-file=./handoff.json \
  --apply
```

## Verification (after apply)

```sql
SELECT key, jsonb_pretty(value) AS value, updated_at
FROM   cortex_knowledge
WHERE  key = '<handoff_id>';
```

Discovery-side check — confirm a fresh session's `/continue-cycles` will
find it:

```sql
SELECT key, value->>'from_session' AS from_session, value->>'to_session' AS to_session, updated_at
FROM   cortex_knowledge
WHERE  key LIKE 'handoff:%'
  AND  (value->>'to_session' = 'any-future' OR value->>'to_session' = '<future_session_id>')
  AND  (value->>'superseded_by' IS NULL)
ORDER  BY updated_at DESC
LIMIT  5;
```

## Guardrails

- Helper defaults to `--dry-run`. `--apply` is opt-in.
- Never emits `SUPABASE_SERVICE_ROLE_KEY` to stdout / logs.
- Never DELETE from `cortex_knowledge` — use `supersedes` / `superseded_by`.
- Skill + helper + policy are portable (`$MGMT_ROOT`) — no hardcoded paths.

## Change Log

- 2026-07-08 — Cross-links: added `handoff-sunset-v30` (orchestration peer for session close) and `handoff-framework-guard` (execute-only compliance rail) references at top-of-doc. No behavioral change. Filed under `task_handoff_mechanism_reconciliation_20260710`.
- 2026-07-08 — Initial. Slash-command wrapper over
  `write-handoff-to-cortex.mts`. Filed under
  `task_handoff_cloud_direct_mechanism_20260710`.
