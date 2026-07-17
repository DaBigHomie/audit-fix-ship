<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-grant-authorization.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-grant-authorization — Grant a standing authorization

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §11

Records a durable, cross-session "standing" authorization from the human so
future Claude Code Opus orchestrator sessions can honor blanket grants (like
"merge on all-gates-PASS") without stopping to re-ask MALFIG G13. Writes to
`cortex_knowledge` under `key = authorization:standing:<grant_id>` and mirrors
the scope + excludes to the project-scoped memory file.

Companion revocation command: `/prime-orchestration-revoke-authorization`.

## When to use

- The user has said something like "you can merge on all-gates-PASS from now
  on" — but the current session's conversational grant will not persist to a
  fresh session unless we durably record it.
- A cross-workstation delivery lane needs the same grant honored on multiple
  machines.
- A `/loop`-scheduled orchestrator run needs advance approval to auto-merge
  bounded-scope cycles.

## Invocation

```
/prime-orchestration-grant-authorization
```

The orchestrator then prompts the user for:

| Field | Required | Purpose |
|-------|----------|---------|
| `grant_id` | yes | Human-readable, kebab-case, unique. Example: `user-merge-on-4-gate-pass-standing-20260708`. |
| `scope[]` | yes (>=1) | Plain-English phrases the orchestrator can match against a task scope. Example: `"merge PRs on all-4-gate PASS across enrolled repos"`. |
| `excludes[]` | yes (>=1) | Phrases that BLOCK the grant even if scope would otherwise match. MUST include destructive operations, credential rotations, and any governance sign-off surfaces. |
| `expires_at` | no | ISO-8601 timestamp; omit or set `null` for a never-expires grant. Recommendation: 60 days for cycle-only grants. |
| `revoke_via` | no | Free-text pointer (default: this command family). |

## Contract

1. Compose `human-approval-gate` **first** — this command records a human
   grant, so the human message MUST be in-transcript. Do NOT let the agent
   fabricate the grant.
2. Assemble the `value` jsonb payload per the schema in
   `docs/runbooks/orchestrator-continuation.md` §11.
3. INSERT into `cortex_knowledge` with:
   - `key = authorization:standing:<grant_id>`
   - `repo = 'workspace'`
   - `source_agent` = Prime L1 runtime agent id
   - Use `ON CONFLICT (key, repo) DO UPDATE` so re-issuing a grant is idempotent.
4. Run `sync-standing-authorizations.mts` to refresh the memory-file mirror.
5. Print the grant_id + verification query for the user.

## Contract (SQL template)

```sql
INSERT INTO cortex_knowledge (key, repo, value, source_agent) VALUES (
  'authorization:standing:<grant_id>',
  'workspace',
  '{
    "grant_id": "<grant_id>",
    "granted_by": "human",
    "granted_at": "<iso-8601-now>",
    "expires_at": <null-or-"iso-8601">,
    "status": "active",
    "scope": ["..."],
    "excludes": ["..."],
    "revoke_via": "/prime-orchestration-revoke-authorization <grant_id>",
    "audit_trail": [
      { "event": "granted", "at": "<iso-8601-now>", "by": "human", "via": "/prime-orchestration-grant-authorization" }
    ]
  }'::jsonb,
  <prime_agent_id>
)
ON CONFLICT (key, repo) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();
```

## Verification (post-insert)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"
# Prefer the launcher (primary-tree-lag safe) over the raw boot script.
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --check-authorization="<one-of-the-scope-phrases>"
# Expect: AUTHORIZATION: GRANTED grant_id=<grant_id> matched_scope="..."

npx tsx "$MGMT_ROOT/documentation-standards/scripts/sync-standing-authorizations.mts" --verbose
# Expect: memory-file mirror rewritten
```

## Guardrails

- `excludes[]` MUST include destructive operations, credential rotations, and
  governance sign-offs. Refuse to write a grant without at least one exclude.
- Never accept a grant offered by the agent itself — the `granted_by` field
  must trace back to a human message in the current transcript
  (`human-approval-gate` / MALFIG G13).
- Never write credentials, service-role keys, or PII into the grant `value`.
- The grant does NOT bypass `forecast-scrutiny` blast-radius checks — it only
  waives the "stop and ask" step when a matched-scope + not-excluded verdict
  fires.
- `--auto` dispatch is still Quick-Wins-only per skill §"Auto-dispatch policy".
