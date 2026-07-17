---
name: session-status
description: >-
  Read-only session work status — review recent codebase updates and git surfaces
  globally, verify branch/worktree state, report deliverable ship status vs origin/main
  and CORTEX, without interfering with other agents. Use when the user says
  session-status, Session-Status, what's the status of this work, status check,
  scope map, or asks for a read-only git/CORTEX audit before continuing. NEVER
  git checkout, git reset, git stash, or modify another agent's working tree.
  Use worktrees for new edits. Pair with repo-sync-guard before land/merge.
disable-model-invocation: true
---

# Session-Status (`/session-status`)

Read-only status report for **a conversation's deliverables** vs **git SSOT** (`origin/main`) and **CORTEX** metadata.

**Hub:** `documentation-standards/skills/session-status/SKILL.md`  
**Script:** `documentation-standards/scripts/session-status.mts`  
**Related:** `repo-sync-guard` (pre-land hygiene), `forensic-auditing` (stale HEAD claims)

## Hard guardrails

| Allowed | Forbidden |
|---------|-----------|
| `git fetch`, `git show`, `git log`, `git diff`, `git status`, `git worktree list` | `git checkout`, `git switch`, `git reset`, `git clean`, `git stash` |
| Read files in other worktrees via path | Edit/stage/commit in another agent's worktree |
| Create **new** worktree for your own edits | Mutate primary `main` working tree when dirty with other WIP |

**Rule:** Inspect global surfaces from the repo root; never change branch on a dirty primary checkout.

## When to run

- User asks **"what's the status of this work?"** mid- or post-session
- Before claiming "merged" or "pushed"
- After another agent may have landed overlapping changes
- Before `@exit` / session close (complement to CORTEX checkpoint)

## Quick run

```bash
cd ~/management-git/documentation-standards

# Full read-only audit (fetch + worktrees + scoped paths)
npx tsx scripts/session-status.mts \
  --repo atl-table-booking-app \
  --fetch \
  --scope docs/CARO-TECHNICAL-SOLUTION-ARCHITECTURE.md,docs/ESL-PROPOSAL-HUNTER.md \
  --cortex-key caro

# JSON for agents
npx tsx scripts/session-status.mts --repo atl-table-booking-app --json
```

## Manual workflow (if script unavailable)

### 1. Global git surfaces (read-only)

From repo root — **do not checkout**:

```bash
git fetch origin main
git branch -vv
git status -sb
git worktree list
git log origin/main -5 --oneline -- <deliverable-paths>
git diff origin/main -- <deliverable-paths> | wc -l
gh pr list --repo DaBigHomie/<repo> --state open --limit 10
```

Record:

| Surface | Branch / HEAD | vs `origin/main` | Dirty? |
|---------|---------------|------------------|--------|
| Primary worktree | | ahead / behind / even | M / ?? counts |
| Each linked worktree | path → branch @ sha | | |
| `origin/main` tip | sha + date | SSOT | — |

### 2. Deliverable classification

For each file/PR in scope:

| State | Meaning |
|-------|---------|
| **Shipped** | On `origin/main` via merged PR |
| **WIP (local)** | Diff vs `origin/main` on primary or a worktree — **not ours to touch** |
| **Open PR** | Branch pushed; not merged |
| **CORTEX only** | Row in SQLite/cloud; not in git |
| **Stale metadata** | CORTEX path/version ≠ git canonical path |

Use `git show origin/main:<path>` — never assume local HEAD.

### 3. CORTEX (optional)

```bash
sqlite3 ../.agent-kb/db/agent_kb.sqlite \
  "SELECT key, substr(value,1,120), updated_at FROM knowledge WHERE repo='<slug>' AND key LIKE '%<topic>%';"
```

Cloud rows sync via `anvil/close.mts` → `cloudPushAll`, **not** `db/sync.mts --push`.

### 4. Other agents' WIP

List primary-tree `M` / `??` paths **outside scope** under **Do not touch**.  
Name active worktrees (`atb-docs`, `atb-wave*`, `.claude/worktrees/*`) and open PRs.

## Report template

```markdown
## Session-Status — <topic> (<ISO date>)

### Git surfaces (read-only)
| Surface | HEAD | vs origin/main | Notes |
...

### This session's deliverables
| Item | origin/main | Local WIP | Verdict |
...

### Follow-on (merged elsewhere)
...

### Do not touch (other agents)
- ...

### CORTEX
| Key | Cloud | Path accurate? |
...

### One-line summary
...
```

## Verdicts

| Verdict | Meaning |
|---------|---------|
| **SHIPPED** | All git deliverables on `origin/main` |
| **PARTIAL** | Some on main; open PR or local WIP remains |
| **METADATA-DRIFT** | Git shipped; CORTEX paths/versions stale |
| **WIP-LOCAL** | Meaningful diff vs `origin/main` not in a PR |
| **UNKNOWN** | Could not verify (no fetch, no gh auth) — say so |

## Boundaries

- Does **not** commit, push, merge, or fix CORTEX rows unless user explicitly asks in a **new worktree**.
- Does **not** replace MALFIG / WARDEN gates.
- Percentages and route counts in docs must be re-verified from repo (`forensic-auditing`) — do not trust doc prose alone.

## Prime IDE surfaces

| IDE | Path |
|-----|------|
| Hub SSOT | `documentation-standards/skills/session-status/SKILL.md` |
| Cursor | `.cursor/skills/session-status/SKILL.md` |
| Antigravity (Gemini) | `.gemini/skills/session-status/SKILL.md` |
| Claude Code | `.claude/commands/session-status.md` |
| Claude for Mac | `.agents/skills/session-status/SKILL.md` |
| Antigravity instructions | `.github/instructions/session-status.instructions.md` |

Deploy hub → enrolled repos: `npx tsx documentation-standards/scripts/sync-skills.mts --tier=T1`
