---
name: cortex-query-patterns
version: "1.0.0"
updated: 2026-07-10
canonical_basis: documentation-standards/skills/cortex-query-patterns/SKILL.md
description: >-
  Canonical, LIVE-verified SQL query patterns for common CORTEX lookups
  (active sessions, pending tasks, standing menu, chapter markers, standing
  authorizations, resumable handoffs, active BG dispatches). Read-only. Pairs
  with docs/references/cortex-schema-reference.md (column truth) and the
  writer skills (session-chapter-index, handoff-cloud-direct,
  standing-authorization, dispatch-claim-registry). Use when an agent needs
  to inspect CORTEX state, verify a handoff, list pending work, or debug a
  "column does not exist" / "wrong project ref" error. Triggers: "query
  CORTEX", "list pending tasks", "read standing menu", "check standing
  authorization", "read resumable handoff", "active BG dispatches", "CORTEX
  SQL pattern".
disable-model-invocation: true
---

# cortex-query-patterns

Read-only. Seven executable SQL patterns for the CORTEX SSOT — every one
smoke-tested against `eccpracfbrocmkzuogec` on 2026-07-10 before landing.
Never fabricate columns; if a query fails with `column does not exist`,
consult `docs/references/cortex-schema-reference.md` §3 (column
disambiguation) before "fixing" the query.

**Hub:** `documentation-standards/skills/cortex-query-patterns/SKILL.md`
**Reference (column truth):** `documentation-standards/docs/references/cortex-schema-reference.md`
**Slash command:** `documentation-standards/.claude/commands/prime-orchestration-query-cortex.md`

**Related skills:** `session-chapter-index` (writer for chapter markers —
`session:*:chapters-*`), `handoff-cloud-direct` (writer for handoffs —
`handoff:*`), `standing-authorization` (writer for
`authorization:standing:*`), `dispatch-claim-registry` (writer for
`cortex_bg_dispatches`), `orchestrator-continuation` (top-level consumer —
its boot script composes several of these patterns).

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
: "${CORTEX_PROJECT_REF:=eccpracfbrocmkzuogec}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill (Tier 1)** | `$MGMT_ROOT/documentation-standards/skills/cortex-query-patterns/SKILL.md` |
| **Schema reference** | `$MGMT_ROOT/documentation-standards/docs/references/cortex-schema-reference.md` |
| **Slash command** | `$MGMT_ROOT/documentation-standards/.claude/commands/prime-orchestration-query-cortex.md` |
| **Runbook (composer)** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-continuation.md` |

## 1. When to use

- You need to inspect live CORTEX state (sessions, tasks, knowledge, dispatches).
- You are composing a boot / continuation / status script that must read
  observable artifacts (per `forensic-auditing` Rule 4, disk over manifests
  — CORTEX cloud IS the disk here).
- You hit `column "priority" does not exist` (or a similar cross-table
  confusion error) and need the verified pattern.
- You need to verify a handoff or standing-authorization row a writer skill
  just produced.

Do NOT use this skill to WRITE. Writes live in the producer skills
(`session-chapter-index`, `handoff-cloud-direct`, `standing-authorization`,
`dispatch-claim-registry`). This skill is read-only.

## 2. Common patterns (all smoke-tested 2026-07-10)

Every pattern below returned rows against `eccpracfbrocmkzuogec` in the
smoke run captured in the PR body. Row counts noted per pattern.

### 2.1 Active sessions per repo

Use when: you need the current session id(s) for a repo (e.g. to filter
pending tasks or write a handoff).

```sql
SELECT id, branch, status, created_at
FROM   cortex_sessions
WHERE  repo = '<repo_slug>'
  AND  status = 'active'
ORDER  BY created_at DESC
LIMIT  5;
```

**Smoke:** `repo='documentation-standards'` → 2 rows on 2026-07-10.

### 2.2 Pending tasks per session

Use when: you need the Standing menu for one session, or to hand off open
work. Note the JOIN — `priority` is on `cortex_tasks`, never
`cortex_sessions` (see reference doc §3).

```sql
SELECT id, description, priority, status
FROM   cortex_tasks
WHERE  session_id = '<session_id>'
  AND  status IN ('pending','in_progress','blocked')
ORDER  BY priority, updated_at DESC;
```

`priority` is `text` — `'P0'` sorts before `'P1'` lexicographically, so
`ORDER BY priority` gives P0→P3 without a CASE.

**Smoke:** `session_id='polaris-bootstrap-20260607'` → 10 rows.

### 2.3 Standing menu across ALL open sessions (grouped)

Use when: you are the orchestrator picking the next cycle and want the
whole workspace's open work at a glance.

```sql
SELECT priority,
       count(*) FILTER (WHERE status = 'pending')     AS pending,
       count(*) FILTER (WHERE status = 'in_progress') AS in_progress,
       count(*) FILTER (WHERE status = 'blocked')     AS blocked,
       count(*) AS total
FROM   cortex_tasks
WHERE  status IN ('pending','in_progress','blocked')
GROUP  BY priority
ORDER  BY priority;
```

Drill-down by role:

```sql
SELECT priority, assignee_agent, count(*) AS ct
FROM   cortex_tasks
WHERE  status IN ('pending','in_progress','blocked')
GROUP  BY priority, assignee_agent
ORDER  BY priority, ct DESC;
```

**Smoke:** priority totals — P0=26, P1=100, P2=285, P3=31 (442 open).

### 2.4 Latest chapter markers (session-chapter-index output)

Use when: you are seeding a handoff or the orchestrator wants recent
session-narrative markers.

```sql
SELECT key, value, updated_at
FROM   cortex_knowledge
WHERE  key LIKE 'session:%:chapters-%'
ORDER  BY updated_at DESC
LIMIT  5;
```

To scope to one session:

```sql
SELECT key, value, updated_at
FROM   cortex_knowledge
WHERE  key = 'session:<session_id>:chapters-<YYYY-MM-DD>';
```

**Smoke:** 1 row (`session:polaris-bootstrap-20260607:chapters-2026-07-07`).

### 2.5 Standing authorizations (BG-ZZZ, v1.1 scope taxonomy)

Use when: the orchestrator needs to know whether the human has granted
standing authorization for merges / retirements / fanout etc. before acting.

```sql
SELECT key,
       value->>'scope'      AS scope,
       value->>'granted_by' AS granted_by,
       value->>'expires_at' AS expires_at,
       updated_at
FROM   cortex_knowledge
WHERE  key LIKE 'authorization:standing:%'
  AND  (value->>'expires_at' IS NULL
        OR (value->>'expires_at')::timestamptz > now())
ORDER  BY updated_at DESC
LIMIT  5;
```

**Smoke:** 1 active row (`user-merge-on-4-gate-pass-standing-20260708`).

### 2.6 Latest resumable handoffs (BG-JJJJ, handoff-cloud-direct)

Use when: a fresh session boots and needs the prior orchestrator's handoff.
This is the discovery query from `docs/policies/handoff-cortex-ssot.md`.

```sql
SELECT key,
       value->>'from_session' AS from_session,
       value->>'to_session'   AS to_session,
       updated_at
FROM   cortex_knowledge
WHERE  key LIKE 'handoff:%'
  AND  (value->>'to_session' = 'any-future'
        OR value->>'to_session' = '<current_session_id>')
  AND  (value->>'superseded_by' IS NULL)
ORDER  BY updated_at DESC
LIMIT  5;
```

**Smoke:** 1 row (`handoff:project-polaris:polaris-bootstrap-20260607:2026-07-08`,
matches PR #87 evidence).

### 2.7 Active BG dispatches (BG-IIII, PR #86 — dispatch-claim registry)

Use when: you are about to spawn a background agent on a branch and need to
check for a live claim (hidden-child hazard).

```sql
SELECT id, parent_task_id, target_repo, target_branch,
       status, claim_started_at, claim_expires_at
FROM   cortex_bg_dispatches
WHERE  status = 'active'
  AND  claim_expires_at > now()
ORDER  BY claim_started_at DESC
LIMIT  10;
```

Check a specific branch is free:

```sql
SELECT count(*) AS active_claims
FROM   cortex_bg_dispatches
WHERE  target_repo = '<slug>'
  AND  target_branch = '<branch>'
  AND  status = 'active'
  AND  claim_expires_at > now();
```

**Smoke:** table exists, 0 active rows at query time — schema verified,
pattern shape verified.

## 3. Non-goals

| Non-goal | Owner |
|----------|-------|
| Write handoffs to `cortex_knowledge` | `handoff-cloud-direct` skill |
| Write chapter markers | `session-chapter-index` skill |
| Write standing authorizations | `standing-authorization` skill (BG-ZZZ) |
| Write BG dispatch claims | `dispatch-claim-registry` skill (BG-IIII) |
| Refactor `close.mts` to hydrate from cloud | Filed as `task_close_mts_cloud_ssot_refactor_20260711` |
| Modify schema (add columns, migrations) | Out of scope — this skill READS only |

## 4. Composition

- **Upstream (why you're reading CORTEX):** `orchestrator-continuation` (boot
  script composes patterns 2.1, 2.2, 2.4, 2.5, 2.6), `session-status`,
  `session-cleanup-checkpoint` (uses 2.1 + 2.7 to find current session and
  active dispatches).
- **Downstream (what you produce from the read):** the writer skills listed
  in §3 consume this skill's output as their input payloads.
- **Sibling reference:** `docs/references/cortex-schema-reference.md` — the
  column truth this skill's queries depend on. If a query breaks, read that
  first.
- **Pre-flight:** `forecast-scrutiny` — every query here is read-only, so
  expected verdict is SAFE.

## 5. Hard guardrails

| Allowed | Forbidden |
|---------|-----------|
| Read from any `cortex_*` table via Supabase MCP (`execute_sql`) | Any `INSERT` / `UPDATE` / `DELETE` — this skill is read-only |
| `project_id="eccpracfbrocmkzuogec"` (CORTEX SSOT) | `project_id="xlxufjjyyblhvwvsctdt"` (orphan — 0 rows) |
| Copy a smoke-tested pattern verbatim | Invent columns not in the reference doc (`priority` on `cortex_sessions` etc.) |
| Bounded queries (`LIMIT`, indexed `WHERE`) | Full-table scans on `cortex_tasks` / `cortex_knowledge` without a bounded `WHERE` |
| Read env from `.env.local` via inline parser | Echoing `SUPABASE_SERVICE_ROLE_KEY` |

## 6. Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-07-10 | Initial. 7 canonical read patterns, all smoke-tested against `eccpracfbrocmkzuogec`. Pairs with `docs/references/cortex-schema-reference.md` and slash command `/prime-orchestration-query-cortex`. `task_cortex_schema_reference_20260710`. |
