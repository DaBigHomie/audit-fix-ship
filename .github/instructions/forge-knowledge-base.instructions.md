---
applyTo: "**"
---

# Forge Knowledge Base — Agent Integration

> Managed by DaBigHomie/documentation-standards — synced to all repos.
> Version: 1.0.0 | Created: 2026-05-12

## Overview

All agents have access to a centralized knowledge base (`agent_kb.sqlite`) containing 1,365+ documents, 11,658 tasks, 987 credential mappings, and 580 agent definitions across all repos. Use it.

## On Session Start — Query Before Working

Before beginning any task, query the knowledge base for prior context:

```bash
# Semantic search (natural language)
cd ~/management-git/maximus-ai/.system/handoff/agent-kb/semantic && npx tsx query.mts "YOUR TASK TOPIC"

# Structured query (exact match)
sqlite3 ~/management-git/maximus-ai/.system/handoff/agent-kb/db/agent_kb.sqlite \
  "SELECT title, repo, doc_type FROM documents WHERE title LIKE '%YOUR_KEYWORD%' OR content LIKE '%YOUR_KEYWORD%' LIMIT 10;"

# Check if task already exists
sqlite3 ~/management-git/maximus-ai/.system/handoff/agent-kb/db/agent_kb.sqlite \
  "SELECT id, status, description FROM tasks WHERE description LIKE '%YOUR_KEYWORD%' LIMIT 5;"

# Check credential requirements
sqlite3 ~/management-git/maximus-ai/.system/handoff/agent-kb/db/agent_kb.sqlite \
  "SELECT key_name, service, is_populated FROM credentials WHERE repo='THIS_REPO_SLUG' AND is_populated=0;"
```

This prevents:
- Duplicate work (task already done)
- Missing context (prior decisions documented)
- Credential confusion (which keys exist/need rotation)

## On Session End — Save in Ingestible Format

All session outputs (handoffs, checkpoints, manifests, plans) MUST include YAML frontmatter for automatic ingestion:

```yaml
---
title: "Session Title — Descriptive Name"
doc_type: handoff | checkpoint | context-manifest | plan | memory
repo: damieus | 043 | ffs | maximus | ugwtf | docstd | atb | imgcli
session_id: "sess_YYYYMMDD_SLUG"
created: "YYYY-MM-DDTHH:MM"
status: complete | active | blocked
tags: [tag1, tag2, tag3]
tasks_completed:
  - id: "task_SLUG_NN"
    description: "What was done"
tasks_pending:
  - id: "task_SLUG_NN"
    description: "What remains"
    priority: P0 | P1 | P2
---
```

### Required Sections (in order)

1. **Session State** — What was accomplished
2. **Changes Made** — Files modified, commits, PRs
3. **Decisions & Rationale** — Why, not just what
4. **Blockers** — What's blocked and by what
5. **Next Steps** — Actionable entry points for the next agent

### File Naming Convention

```
docs/handoff/YYYY-MM-DD_SESSION-SLUG.md
docs/context-manifests/YYYY-MM-DD_DESCRIPTIVE-NAME.md
```

## Document Types Reference

| doc_type | When to Use | Example |
|----------|------------|---------|
| `handoff` | End of any agent session | Session summary with state transfer |
| `checkpoint` | Mid-session save point | Work-in-progress snapshot |
| `context-manifest` | Cross-session context | PR wave status, migration progress |
| `plan` | Implementation plans | IMPLEMENTATION_PLAN.md, task breakdowns |
| `memory` | Persistent domain knowledge | Architecture decisions, schema docs |
| `instruction` | Agent behavior rules | *.instructions.md |
| `prompt` | Reusable agent prompts | *.prompt.md |
| `agent-def` | Agent role definitions | *.agent.md |

## Database Quick Reference

```
DB: ~/management-git/maximus-ai/.system/handoff/agent-kb/db/agent_kb.sqlite
LanceDB: ~/management-git/maximus-ai/.system/handoff/agent-kb/semantic/.lancedb/

Tables: documents (1,365) | tasks (11,658) | sessions (982)
        credentials (987) | agents (580) | knowledge (109)

Repo slugs: maximus, damieus, 043, ffs, ugwtf, docstd, atb,
            imgcli, auditfs, prodgen, mgmt, workspace
```
