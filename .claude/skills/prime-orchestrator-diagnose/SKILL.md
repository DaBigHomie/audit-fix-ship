---
name: prime-orchestrator-diagnose
version: "1.0.0"
updated: 2026-07-12
canonical_basis: documentation-standards/skills/prime-orchestrator-diagnose/SKILL.md
description: >-
  Portable session-diagnostic composite. Invoked as
  /prime-orchestration-diagnose-session, it answers seven questions from ANY
  enrolled Prime Repo's worktree: (1) which worktree of which repo on which
  branch, (2) which CORTEX session am I bound to, (3) do the canonical CORTEX
  queries land on this session, (4) is there drift between merged PRs and
  cortex_tasks rows, (5) what's the local + remote git state, (6) does
  CLAUDE.md have the ideal boot section, (7) where should each finding be
  routed (MMTA hints). Use when the user says "diagnose session", "why can't
  I find my tasks in CORTEX", "identify my worktree", "check for PR drift",
  "audit CLAUDE.md boot", "what session am I in", or "run session diagnostic
  before adopting". Composes orchestrator-continuation-boot env pattern,
  session-cleanup-checkpoint git-state pattern, and multi-model-task-assignment
  routing hints per workflow-assembly-pattern-combine-skills.
disable-model-invocation: true
---

# prime-orchestrator-diagnose (`/prime-orchestration-diagnose-session`)

Portable session diagnostic. Composes the existing boot pattern with three new
sub-tools + inline compositions of session-cleanup-checkpoint (git state) and
multi-model-task-assignment (routing hints) to answer the seven questions
above in one invocation, from any enrolled Prime Repo's worktree.

**Hub:** `documentation-standards/skills/prime-orchestrator-diagnose/SKILL.md`
**Script:** `documentation-standards/scripts/prime-orchestrator-diagnose-boot.mts`
**Command:** `documentation-standards/.claude/commands/prime-orchestration-diagnose-session.md`
**SSOT reference:** `maximus-ai/docs/PRIME-ORCHESTRATOR-SSOT.md` §7.4 (finding-to-heal — invoked only when `--fix-cortex-drift` is set)

## When to run

- User says "diagnose session", "session diagnostic", "run diagnose", "why can't I find my tasks"
- Before adopt/continue on a fresh session in an unfamiliar worktree
- After suspected CORTEX drift (task counts don't match merged PRs)
- Before writing a new task to verify the session_id will land where expected
- Before editing CLAUDE.md to verify the boot section shape

## Composed skills (reference index)

Per memory rule `workflow-assembly-pattern-combine-skills`, this skill is an
assembly — not a reimplementation. It composes:

| # | Composed skill / script | What it contributes | How it's invoked |
|---|---|---|---|
| 1 | `orchestrator-continuation-boot.mts` | env-load, PostgREST fetch pattern, worktree-list logic | pattern replicated (not shelled — direct import would create a dep cycle) |
| 2 | `session-cleanup-checkpoint` | git-state inspection (worktrees, ahead/behind, recent commits) | inline replication of the READ-ONLY subset (`git worktree list`, `git log`, `git status --porcelain`, `git rev-list --left-right`) |
| 3 | `multi-model-task-assignment` | routing hints per finding (cluster/swarm/agent) | inline heuristic — for each drift/failed-check, emits a suggested cluster + swarm + agent |
| 4 | `cortex-query-patterns` | canonical CORTEX query shapes | `lib/cortex-query-self-check.mts` runs the five canonical queries |

## Args

| Flag | Default | Purpose |
|---|---|---|
| `--repo=<slug>` | auto | Force repo slug (default: auto-detect via `git rev-parse --show-toplevel` + remote parse) |
| `--scope=all\|prime\|repo=<slug>` | `prime` | Filter for downstream (informational — the diagnostic runs for the current repo regardless) |
| `--depth=quick\|standard\|deep` | `standard` | quick = skip drift; standard = 20-row drift scan + 10 recent commits; deep = 30-row + 20 commits |
| `--format=md\|json` | `md` | Report format |
| `--fix-claude-md` | OFF | Opt-in: apply the CLAUDE.md boot section IF `safe_to_auto_apply=true` (marker block not present OR byte-identical) |
| `--fix-cortex-drift` | OFF | Opt-in: v1.0.0 STUB — logs the intent; §7.4 finding-to-heal chain wiring lands in follow-up |
| `--dry-run` | OFF | Skip all network + write; render report structure only |
| `--verbose` | OFF | Log intermediate steps to stderr |

## Portability contract

**MANDATORY.** The script + sub-tools MUST work from any enrolled Prime Repo's
worktree. There are NO hardcoded paths:

- Management-git root: `MANAGEMENT_GIT_ROOT` env, fallback `MGMT_ROOT`, fallback `~/management-git`
- Repo slug: auto-detected via `git rev-parse --show-toplevel` + `git remote get-url origin` + basename-of-primary via `git rev-parse --git-common-dir`
- Enrollment: read from `workspace-rules/maximus-prime-repo-scope.json` under the resolved MGMT_ROOT
- Env file: default `$MGMT_ROOT/maximus-ai/.env.local`, override with `--env-file=`

## Output shape (md)

1. **Worktree identity** — cwd, repo_toplevel, slug, branch, HEAD, is_worktree
2. **Session identity** — session_id + source (cortex-boot | claude-md-hint | cortex-recent | unknown)
3. **CORTEX query self-check** — 5-query health table
4. **PR-CORTEX drift** — orphan_sha + unlogged_pr lists
5. **Git state** — worktrees, ahead/behind, recent commits
6. **CLAUDE.md audit** — proposal + safe_to_auto_apply verdict
7. **MMTA routing hints** — cluster/swarm/agent per finding

## Hard rails

- Read-only by default. All `--fix-*` flags are opt-in.
- `--fix-claude-md` applies ONLY when `safe_to_auto_apply=true` (marker block absent OR byte-identical to proposal — never overwrites user edits).
- `--fix-cortex-drift` is a v1.0.0 stub. Real §7.4 wiring will land in a future PR — this flag is reserved to keep the CLI stable.
- No `git checkout`, `git reset`, `git rm`, `git worktree remove`, `git branch -d`.
- Bounded shell buffer (8 MiB).
- Verify-then-write on every citation.

## Integration with §7.4 finding-to-heal

When `--fix-cortex-drift` graduates from stub to real (planned follow-up), each
drift item becomes a candidate remediation task per SSOT §7.4:

- `orphan_sha`  → depth-1 auto-heal: mark the cortex_tasks row `status='blocked'` with a warning, file a follow-up
- `unlogged_pr` → depth-2 auto-heal: create a shadow cortex_tasks row (`prime_addressed=false`, priority P3) so the PR appears in the standing menu

Until then, the flag emits a log line only.

## See also

- `documentation-standards/skills/orchestrator-continuation/SKILL.md` — the standing-menu companion
- `documentation-standards/skills/session-cleanup-checkpoint/SKILL.md` — the deeper checkpoint/handoff shape
- `documentation-standards/skills/multi-model-task-assignment/SKILL.md` — routing SSOT for the MMTA hints
- `documentation-standards/skills/session-status/SKILL.md` — read-only status audit (complementary read pattern)
- `maximus-ai/docs/prime-governance/PRIME-WORKFLOW-ARSENAL.md` Shape 18 — session-diagnostic composite (§6.4)
