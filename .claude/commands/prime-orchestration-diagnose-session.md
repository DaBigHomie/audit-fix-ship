# /prime-orchestration-diagnose-session — Portable session-diagnostic composite

**Model:** claude-opus (orchestrator) · **Skill:** `prime-orchestrator-diagnose`
**Spec:** `documentation-standards/skills/prime-orchestrator-diagnose/SKILL.md`
**Script:** `documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts`
**Family runbook:** `documentation-standards/docs/runbooks/prime-orchestration-commands.md`

One-command portable diagnostic. From ANY enrolled Prime Repo's worktree, this
command answers seven questions in a single report:

1. Which worktree of which repo on which branch am I in? (identity)
2. Which CORTEX session am I bound to? (session identity)
3. Do the canonical CORTEX queries land on this session? (query-self-check)
4. Is there drift between merged PRs and cortex_tasks rows? (drift detection)
5. What's the local + remote git state right now? (git state)
6. Does CLAUDE.md have the ideal boot section? (CLAUDE.md audit)
7. Where should each finding be routed? (MMTA hints)

## When to use

- Fresh session in an unfamiliar worktree — before adopt/continue
- User asks "why can't I find my tasks in CORTEX?" or "what session am I in?"
- Suspected PR-CORTEX drift (task counts don't match merged PRs)
- Before writing a new cortex_tasks row — verify the session_id lands as expected
- Before editing CLAUDE.md boot — verify current shape vs SSOT

## Portability

**MANDATORY.** No hardcoded paths. Auto-detects repo via
`git rev-parse --show-toplevel` + remote parse. Reads
`workspace-rules/maximus-prime-repo-scope.json` for enrollment. Works from any
enrolled Prime Repo's worktree.

## Args

```
--repo=<slug>          Force repo slug (default: auto-detect)
--scope=all|prime|repo=<slug>   (default: prime)
--depth=quick|standard|deep     (default: standard)
--format=md|json                (default: md)
--fix-claude-md        Opt-in: apply CLAUDE.md boot section IF safe
--fix-cortex-drift     Opt-in: v1.0.0 STUB — full §7.4 wiring pending
--dry-run              Skip network + writes; render structure only
--verbose              Log intermediate steps
```

## Quick invocations

```bash
# Standard diagnostic — most common
npx tsx "$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts"

# Quick — skip PR-CORTEX drift scan
npx tsx "$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts" --depth=quick

# Deep — 30-row drift scan + 20 recent commits
npx tsx "$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts" --depth=deep

# JSON for programmatic use
npx tsx "$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts" --format=json

# Auto-apply the CLAUDE.md boot section (only if safe)
npx tsx "$MGMT_ROOT/documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts" --fix-claude-md
```

## Exit codes

- `0` — diagnostic emitted (findings may exist; caller decides)
- `1` — env / CORTEX failure
- `2` — arg validation failure

## Governance

- Read-only by default. All `--fix-*` flags are opt-in.
- `--fix-claude-md` refuses to write when `safe_to_auto_apply=false`.
- `--fix-cortex-drift` is reserved for future §7.4 wiring; v1.0.0 logs intent only.
- No destructive git ops. No CORTEX writes (except opt-in `--fix-*`).

## See also

- `/prime-orchestration-continue-prime` — Prime-scope standing menu
- `/prime-orchestration-query-cortex` — canonical CORTEX read patterns
- `documentation-standards/skills/session-status/SKILL.md` — complementary read-only status
- `maximus-ai/docs/prime-governance/PRIME-WORKFLOW-ARSENAL.md` Shape 18 (§6.4)
