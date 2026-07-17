# /prime-orchestration-revoke-authorization — Revoke a standing authorization

**Model:** claude-opus (orchestrator) · **Skill:** `orchestrator-continuation`
**Spec:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md` §11

Reverses a `/prime-orchestration-grant-authorization` record. Marks the grant
`status: "revoked"` (soft-delete — preserves audit_trail), then re-runs
`sync-standing-authorizations.mts` so the memory-file mirror drops it.

## When to use

- The scope of a prior grant no longer applies (e.g. gates changed, ownership
  handed off, program ended).
- An incident post-mortem determined the grant enabled an unwanted outcome —
  revoke immediately, then debrief.
- A grant with `expires_at: null` needs to be manually retired.

## Invocation

```
/prime-orchestration-revoke-authorization <grant_id>
```

The orchestrator resolves `<grant_id>` against
`cortex_knowledge.key = 'authorization:standing:<grant_id>'`. If missing, it
prints the current active grants and asks the user to disambiguate.

## Contract

1. Compose `human-approval-gate` first — revocation is a governance action.
2. Query the row:
   `SELECT value FROM cortex_knowledge WHERE key = 'authorization:standing:<grant_id>';`
3. UPDATE the row: set `value->>'status'` to `"revoked"`, append a new
   `audit_trail` entry `{event: "revoked", at, by, via}`. Do NOT `DELETE`.
4. Run `sync-standing-authorizations.mts` — the revoked grant drops from the
   mirror automatically (the filter in `renderMarkdown` excludes
   `status=revoked`).
5. Print the revocation confirmation + the timestamp.

## Contract (SQL template)

```sql
UPDATE cortex_knowledge
SET value = jsonb_set(
      jsonb_set(value, '{status}', '"revoked"'),
      '{audit_trail}',
      (COALESCE(value->'audit_trail', '[]'::jsonb) || jsonb_build_object(
        'event', 'revoked',
        'at', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'by', 'human',
        'via', '/prime-orchestration-revoke-authorization'
      ))
    ),
    updated_at = now()
WHERE key = 'authorization:standing:<grant_id>' AND repo = 'workspace'
RETURNING key, value->>'status' AS status, updated_at;
```

## Verification (post-revoke)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"
# Prefer the launcher (primary-tree-lag safe) over the raw boot script.
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --check-authorization="<one-of-the-scope-phrases-from-the-revoked-grant>"
# Expect: AUTHORIZATION: NOT_GRANTED   (the boot-script filter drops revoked)

npx tsx "$MGMT_ROOT/documentation-standards/scripts/sync-standing-authorizations.mts" --verbose
# Expect: memory-file mirror rewritten without the revoked grant
```

## Guardrails

- Soft-delete only. `DELETE FROM cortex_knowledge` is forbidden — we must
  preserve the audit_trail for governance review.
- Revocation MUST be human-authorized (`human-approval-gate`). An orchestrator
  MAY NOT self-revoke a grant.
- If the grant to revoke was the one authorizing the current session's actions,
  the orchestrator SHOULD immediately stop any in-flight auto-dispatch and
  return control to the human.
- Idempotent: revoking an already-revoked grant is a no-op, but still writes
  a fresh audit_trail entry recording the attempt.
