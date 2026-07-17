<!-- GENERATED FROM maximus-ai/.claude/commands/prime-orchestration-query-cortex.md -- do not edit; run sync-commands.mts -->
# /prime-orchestration-query-cortex — Return a canonical CORTEX read pattern (SQL)

**Model:** claude-opus (orchestrator) · **Skill:** `cortex-query-patterns`
**Spec:** `documentation-standards/skills/cortex-query-patterns/SKILL.md`
**Reference (column truth):** `documentation-standards/docs/references/cortex-schema-reference.md`

Return a smoke-tested, LIVE-verified SQL pattern for a common CORTEX lookup —
and, on confirmation, execute it via the Supabase MCP against the CORTEX SSOT
(`eccpracfbrocmkzuogec`). Never against `xlxufjjyyblhvwvsctdt` (orphan, 0
rows).

## When to use

- You need to inspect CORTEX state (sessions, tasks, knowledge, dispatches)
  from a Claude Code session.
- You hit `column "priority" does not exist` (or a similar cross-table
  confusion error) and want the correct pattern without re-deriving it.
- A `/loop` or `/continue-cycles` boot flow needs one of these queries and
  the operator wants to review it before it runs.

## Invocation

```
/prime-orchestration-query-cortex <pattern>
/prime-orchestration-query-cortex active-sessions repo=documentation-standards
/prime-orchestration-query-cortex pending-tasks session_id=polaris-bootstrap-20260607
/prime-orchestration-query-cortex standing-menu
/prime-orchestration-query-cortex chapter-markers
/prime-orchestration-query-cortex standing-auth
/prime-orchestration-query-cortex handoffs current_session=<id>
/prime-orchestration-query-cortex bg-dispatches
```

## Pattern names → skill sections

| Pattern arg | Skill section | Description |
|-------------|--------------|-------------|
| `active-sessions` | §2.1 | Active sessions per repo |
| `pending-tasks` | §2.2 | Pending / in_progress / blocked tasks per session |
| `standing-menu` | §2.3 | All open tasks grouped by priority (± assignee) |
| `chapter-markers` | §2.4 | Latest `session:*:chapters-*` rows |
| `standing-auth` | §2.5 | Active `authorization:standing:*` rows |
| `handoffs` | §2.6 | Latest resumable handoffs (`handoff:*`) |
| `bg-dispatches` | §2.7 | Active `cortex_bg_dispatches` rows |

If the caller passes an unknown pattern name, the orchestrator returns the
list above and points at
`documentation-standards/skills/cortex-query-patterns/SKILL.md` §2.

## Contract

1. Copy the pattern verbatim from
   `skills/cortex-query-patterns/SKILL.md` — do NOT paraphrase columns. If a
   column is wrong, fix the reference doc (`docs/references/cortex-schema-reference.md`),
   never the copy in the response.
2. Inject caller-supplied bindings (e.g. `<repo_slug>`, `<session_id>`) into
   the query.
3. Print the query for review.
4. On explicit user confirmation OR a valid standing authorization scope
   covering "read CORTEX", execute via Supabase MCP with
   `project_id="eccpracfbrocmkzuogec"`.
5. Return rows (truncate to first 50) + the row count + the elapsed ms.
6. If the query errors with `column "..." does not exist`, do NOT silently
   fix and retry — surface the error and cite
   `docs/references/cortex-schema-reference.md` §3 (column disambiguation).

## Guardrails

- Project ref is ALWAYS `eccpracfbrocmkzuogec`. Never `xlxufjjyyblhvwvsctdt`
  (orphan — 0 rows). See reference doc §1.
- READ-ONLY. Never emit `INSERT` / `UPDATE` / `DELETE`. Writer skills
  (`session-chapter-index`, `handoff-cloud-direct`, `standing-authorization`,
  `dispatch-claim-registry`) own writes.
- Every query MUST include a bounded `WHERE` and a `LIMIT`. Never
  full-table-scan `cortex_tasks` / `cortex_knowledge`.
- Never emit `SUPABASE_SERVICE_ROLE_KEY` to stdout / logs.
- If the caller asks for a pattern this command does not know, do NOT invent
  one — point at the skill and reference doc.

## Verification (after execute)

Row count + first 3 rows are printed inline. To re-run the same query later:

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"
# Consult skill §2 for the copyable query
cat "$MGMT_ROOT/documentation-standards/skills/cortex-query-patterns/SKILL.md"
```

## Change Log

- 2026-07-10 — Initial. Slash-command wrapper over
  `skills/cortex-query-patterns/SKILL.md`. Filed under
  `task_cortex_schema_reference_20260710`.
