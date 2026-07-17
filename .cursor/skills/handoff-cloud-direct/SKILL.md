---
name: handoff-cloud-direct
version: "1.0.1"
updated: 2026-07-08
canonical_basis: documentation-standards/skills/handoff-cloud-direct/SKILL.md
description: >-
  Write a resumable session/agent/workstation handoff CLOUD-DIRECT to
  cortex_knowledge — the SSOT for handoffs per the MP continuity standard.
  Use when the handoff-framework MCP is unavailable, when you want the
  durable SSOT record independent of any MCP wrapper, or from
  scripts/hooks that cannot invoke MCP tools. The MCP writes to the same
  row this skill writes; both are convenience wrappers over the CORTEX
  SSOT. Triggers: "write handoff to CORTEX", "cortex-direct handoff",
  "handoff MCP unavailable", "resumable handoff SSOT", "durable handoff".
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/handoff-cloud-direct/SKILL.md -- do not edit; run sync-skills.mts -->

# handoff-cloud-direct

Write a resumable handoff **directly to `cortex_knowledge`** — the CORTEX SSOT
for handoffs. CORTEX is authoritative; the `handoff-framework` MCP is a
convenience wrapper that writes to the same row this skill writes. Use this
when the MCP isn't connected, when a script/hook needs to author a handoff, or
when you want the durable SSOT record without going through the MCP.

**Hub:** `documentation-standards/skills/handoff-cloud-direct/SKILL.md`
**Helper:** `documentation-standards/scripts/write-handoff-to-cortex.mts`
**Policy:** `documentation-standards/docs/policies/handoff-cortex-ssot.md`
**Slash command:** `documentation-standards/.claude/commands/prime-orchestration-write-handoff.md`

**Related skills:** `handoff-sunset-v30` (Sunset 3.0 orchestration — this skill is
its Step 4 write primitive; both write the SAME row), `handoff-framework-guard`
(execute-only compliance rail — this skill's helper is a protected framework file;
run, never edit), `session-chapter-index` (per-session markers — pair upstream
to seed the payload), `orchestrator-continuation` (fresh-session resumption —
consumes handoff rows via `to_session` discovery), `standing-authorization`
(grant that lets the resumer act on the handoff without re-asking), plan-audit-fix
(upstream doc-audit if a change motivates a handoff), `handoff-framework` (MCP
peer — writes the same row when connected).

**Compliance note (handoff-framework-guard):** The helper
`documentation-standards/scripts/write-handoff-to-cortex.mts` is listed as
protected framework in `skills/handoff-framework-guard/SKILL.md`. Agents on any
IDE surface (Cursor, Claude Code, Gemini, Antigravity) MUST run it (via CLI or
the slash command) and MUST NOT edit its source. Framework edits require an
explicit human message or an independent GOV reviewer per `human-approval-gate`.

**Mechanism selection (when to use which):**

| Situation | Use |
|-----------|-----|
| Session close / workstream fork / chapter close (multi-repo, multi-manifest) | `handoff-sunset-v30` (which invokes this helper at Step 4) |
| Single resumable handoff, MCP unavailable, or CORTEX-only record (no Markdown mirror) | this skill directly (or `/prime-orchestration-write-handoff`) |
| Script / hook that cannot invoke MCP tools | this skill's helper (`--dry-run` default) |
| MCP is connected AND you want the explicit CORTEX row | either — both write the same row |

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill (Tier 1)** | `$MGMT_ROOT/documentation-standards/skills/handoff-cloud-direct/SKILL.md` |
| **Helper** | `$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts` |
| **Policy** | `$MGMT_ROOT/documentation-standards/docs/policies/handoff-cortex-ssot.md` |
| **Slash command** | `$MGMT_ROOT/documentation-standards/.claude/commands/prime-orchestration-write-handoff.md` |
| **Runbook §14** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-continuation.md#14-handoff-read--write-on-continuation` |
| **handoff-sunset-v30 (workflow)** | `$MGMT_ROOT/documentation-standards/skills/handoff-sunset-v30/SKILL.md` |
| **session-chapter-index (peer)** | `$MGMT_ROOT/documentation-standards/skills/session-chapter-index/SKILL.md` |
| **orchestrator-continuation (peer)** | `$MGMT_ROOT/documentation-standards/skills/orchestrator-continuation/SKILL.md` |

## 1. When to use

- The `handoff-framework` MCP is not connected in the current session — you
  can still author the SSOT row directly.
- You want the durable SSOT record deliberately (e.g. writing a resumable
  handoff for a `/loop`-scheduled orchestrator).
- A script or hook needs to write a handoff and cannot invoke MCP tools.
- Both — MCP is up **and** you want the CORTEX row explicitly (they're the
  same row anyway).

## 2. Why CORTEX is the SSOT

Per the MP continuity standard, handoffs are governed data. They must be
queryable from a fresh session, from a different machine, from a
`/continue-cycles` boot script, and from downstream skills. Local Markdown
handoff files can be lost with a worktree cleanup; the MCP can be
disconnected; only the CORTEX row survives all of those. The MCP writes to
this row; this skill writes to this row; they are the same row.

## 3. Schema (v1.0)

Embedded in the helper and mirrored in the policy doc. Any change here MUST
bump `schema_version` and update both. Key pattern (matches existing on-disk
rows `handoff:<repo>:<session-or-purpose>[:date]`):

```
key = handoff:<repo>:<from_session_id>:<YYYY-MM-DD>
```

`to_session` (default `any-future`) lives INSIDE the payload — discovery
filters on `value->>'to_session'`.

```json
{
  "schema_version": "1.0",
  "handoff_type": "resumable-session | closeout | cross-agent | cross-workstation",
  "from_session": "<canonical session_id>",
  "to_session": "<canonical session_id | any-future>",
  "author_agent": "<agent identity>",
  "created_at": "<iso-8601>",
  "context": {
    "goal": "<one-liner>",
    "current_state": "<paragraph>",
    "artifacts": [
      { "kind": "pr|skill|doc|worktree|cortex-task", "ref": "<id>", "sha": "<optional-sha>" }
    ],
    "blockers": [
      { "description": "...", "blocked_on": "<task_id|external>" }
    ],
    "next_orchestrator_actions": [
      { "action": "...", "priority": "P0|P1|P2|P3" }
    ]
  },
  "resumable_via": {
    "command": "/continue-cycles | /prime-orchestration-continue | custom",
    "authorization_check": "<optional standing-authorization grant_id>"
  },
  "supersedes": "<prior handoff_id | null>",
  "superseded_by": null
}
```

## 4. Invocation

### 4.1 Helper (canonical path)

Default is `--dry-run`. `--apply` is opt-in and idempotent (UPSERT on
`(key, repo)`).

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"

# Dry-run: validate + print the proposed key + payload
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --from-session=<id> \
  --to-session=any-future \
  --payload-file=./handoff.json

# Apply: UPSERT into cortex_knowledge
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<slug> \
  --from-session=<id> \
  --payload-file=./handoff.json \
  --apply
```

### 4.2 Slash command

```
/prime-orchestration-write-handoff
```

The orchestrator prompts for the payload, drafts it against the schema, calls
the helper in `--dry-run` for review, then re-invokes with `--apply` after
human confirmation.

## 5. Composition

- **`session-chapter-index`** — pair upstream. Its `handoff_seed` block maps
  directly into the payload's `context` fields.
- **`orchestrator-continuation`** — pair downstream. Its boot script's
  discovery query (§6 below) picks up the row on next session start.
- **`standing-authorization`** — set `resumable_via.authorization_check` to a
  standing grant_id so the resuming orchestrator can proceed without
  re-asking.
- **`plan-audit-fix`** — upstream when a doc change motivates a handoff.
- **`forecast-scrutiny`** — pre-flight. Expected verdict SAFE for `--dry-run`,
  SAFE_WITH_GUARDS for `--apply` (single-row write, no schema change).

## 6. Discovery — fresh-session lookup

```sql
-- Bounded, deterministic. Any future session runs this on boot.
SELECT key, value, updated_at
FROM   cortex_knowledge
WHERE  key LIKE 'handoff:%'
  AND  (value->>'to_session' = 'any-future'
        OR value->>'to_session' = '<current_session_id>')
  AND  (value->>'superseded_by' IS NULL)
ORDER  BY updated_at DESC
LIMIT  5;
```

Consumers: `/continue-cycles`, `orchestrator-continuation-boot.mts`,
`session-status` — all safe to invoke this query verbatim.

## 7. Non-goals

| Non-goal | Why |
|----------|-----|
| Replace the `handoff-framework` MCP | This skill IS the SSOT the MCP writes to. When the MCP is connected it should write via this same schema. |
| Author Markdown handoff files | Legacy Markdown handoffs are informational-only; the CORTEX row supersedes. |
| Modify prior handoffs | Use `supersedes` / `superseded_by` — never DELETE historical rows. |
| Author solution/architecture docs | `doc-forensic-inventory` + `plan-audit-fix`. |
| Delete worktrees | `session-cleanup-checkpoint`. |
| Push, merge, or open PRs | `malfig-ship`. |

## 8. Hard guardrails

| Allowed | Forbidden |
|---------|-----------|
| `--dry-run` (default) | Auto-`--apply` from a non-interactive context without explicit human intent |
| UPSERT one row on `(key, repo)` | Bulk overwrite of prior handoff rows |
| Read prior handoffs | `DELETE FROM cortex_knowledge` |
| Read env from `.env.local` via inline parser | Echoing `SUPABASE_SERVICE_ROLE_KEY` |
| Set `supersedes` when replacing a prior handoff | Silent overwrite (loses supersession chain) |

## 9. Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.1 | 2026-07-08 | Cross-links to `handoff-sunset-v30` (this skill is its Step 4 write primitive) and `handoff-framework-guard` (execute-only compliance rail). Mechanism-selection table added. No schema change. (`task_handoff_mechanism_reconciliation_20260710`, audit report `docs/audit-reports/2026-07-08_handoff-mechanism-reconciliation.md`). |
| 1.0.0 | 2026-07-08 | Initial. Schema v1.0, helper `write-handoff-to-cortex.mts`, slash command `/prime-orchestration-write-handoff`, policy `handoff-cortex-ssot.md`, runbook §14. Codifies CORTEX-as-SSOT for handoffs per MP continuity standard (`task_handoff_cloud_direct_mechanism_20260710`). |
