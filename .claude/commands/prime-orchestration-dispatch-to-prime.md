# /prime-orchestration-dispatch-to-prime — Route a concern to Maximus Prime via `@prime`

**Model:** claude-opus (orchestrator) · **MCP tool:** `prime_dispatch`
**Spec:** `documentation-standards/docs/runbooks/prime-dispatch-routing.md`
**Policy:** `documentation-standards/docs/policies/prime-scope-taxonomy.md`
**Server:** `maximus-ai/.system/plugins/multi-model-orchestration/mcp/server.mts` (v0.4.0+)

Dispatches a Prime-scoped concern directly into the Prime queue by
inserting a `cortex_tasks` row with `output_blob.prime_addressed = true`
so it is isolated from repo-scoped task streams.

Keeps the originating repo's task stream **unpolluted** — the whole
point of `@prime` addressing per user directive (2026-07-10).

## When to use

- The concern touches a Prime surface per `docs/policies/prime-scope-taxonomy.md`
  §2 (governance / MALFIG / ANVIL / cross-component / explicit
  `assignee_role=human_or_prime|prime|human`).
- You want the concern visible in the Prime queue for triage.
- You are running inside a repo but the concern is NOT owned by that
  repo alone.

Do NOT use for repo-scoped concerns per taxonomy §3 — a single-repo
bug, doc typo, or one-off dispatch fault stays in the owning repo's
task stream.

## Invocation

```
/prime-orchestration-dispatch-to-prime
```

The orchestrator then:

1. Prompts the user for the dispatch shape — `subject`, `context`,
   `dispatcher_agent_id` (self), optional `discovered_in_repo`,
   optional `priority`, optional `session_id`.
2. **Scope check** — compares the concern against
   `docs/policies/prime-scope-taxonomy.md` §2 vs §3. If §3-like, offers
   the option to file in the owning repo's stream instead. Aborts on
   ambiguous scope pending human clarification.
3. Calls the MCP tool `prime_dispatch` with the assembled arguments.
4. Reports the returned `task_id` and confirms the row is visible via
   `prime_queue_list`.

## Contract

1. **Scope-check before dispatch.** Cite the taxonomy §2 surface in
   `context` so the Prime queue row is self-documenting.
2. **`status='pending'` on insert** — cortex-status-write-ordering.
   `prime_dispatch` enforces this; never call the tool with a status
   override.
3. **Preserve `discovered_in_repo`.** If the concern was surfaced in
   `project-polaris`, pass `discovered_in_repo: "project-polaris"`. The
   MCP tool sets the row's `repo` field to that value and NEVER rewrites
   it later.
4. **`dispatcher_agent_id` is required** — never dispatch anonymously.
   Use your BG-XXXX tag, cluster/swarm handle, or a human ID. This is
   the audit key for `prime_queue_list.tasks[].dispatcher_agent_id`.
5. **G13 self-approval forbidden** — the dispatching agent may not
   later mark the row `complete`. Prime or a standing-authorization
   grantee performs the transition.
6. **Idempotency is triage-owned.** Re-dispatching the same subject
   produces a distinct row (task ID includes `Date.now()`). Dedupe
   is a Prime triage decision, not a dispatch-side gate.

## MCP tool invocation (canonical)

```jsonc
{
  "name": "prime_dispatch",
  "arguments": {
    "subject": "MALFIG G16 default flip: report-only -> blocking after clean cycles",
    "context": "MALFIG surface change (prime-scope-taxonomy §2.2). Cross-cycle policy — not a single-PR fix. Blocked on 3 clean report-only cycles first.",
    "dispatcher_agent_id": "BG-XXXX-name",
    "discovered_in_repo": "maximus-ai",
    "priority": "P2"
  }
}
```

## Verification (after dispatch)

Confirm the row landed in the Prime queue and NOT in the owning repo's
generic stream:

```jsonc
// Read the queue via MCP
{ "name": "prime_queue_list", "arguments": { "status": "pending", "limit": 20 } }
```

Or via SQL:

```sql
SELECT id, status, priority, repo,
       output_blob->>'discovered_in_repo'   AS discovered_in_repo,
       output_blob->>'prime_routing_reason' AS reason,
       output_blob->>'dispatcher_agent_id'  AS dispatcher_agent_id,
       updated_at
FROM   cortex_tasks
WHERE  output_blob->>'prime_addressed' = 'true'
  AND  id = '<task_id_returned_by_dispatch>';
```

## Guardrails

- MCP tool defaults `session_id` to `prime-dispatch-queue` when omitted;
  set it explicitly if the dispatch belongs to an active session.
- Never emit `SUPABASE_SERVICE_ROLE_KEY` to stdout / logs — the MCP
  server force-overrides CORTEX cloud keys from
  `maximus-ai/.env.local` via `scripts/lib/cortex-env.mts`.
- Never DELETE from `cortex_tasks` to "correct" a dispatch — use
  `prime_addressing_reversed: true` + reversal reason (see
  `docs/policies/prime-scope-taxonomy.md` §6 correction pattern).
- Never rewrite `repo` after insert.

## Related

- Runbook: `documentation-standards/docs/runbooks/prime-dispatch-routing.md`
- Policy: `documentation-standards/docs/policies/prime-scope-taxonomy.md`
- MCP: `maximus-ai/.system/plugins/multi-model-orchestration/mcp/server.mts` (v0.4.0+)
- Orchestrator continuation: `docs/runbooks/orchestrator-continuation.md` §14.1 (cross-link)

## Change Log

- 2026-07-10 — Initial. Slash-command wrapper over `prime_dispatch` MCP
  tool (maximus-ai PR #234, multi-model-orchestration v0.4.0). Filed
  under `task_prime_dispatch_mcp_infrastructure_20260710`.
