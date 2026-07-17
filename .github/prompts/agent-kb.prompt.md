---
description: "Initialize Agent KB session — query current state, route task, or search agent docs semantically. Replaces manual file scanning with a single DB+vector query."
agent: "agent-kb"
argument-hint: "<repo-alias> [task description or query]"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/agent-kb.prompt.md -- do not edit; run sync-agents.mts -->

# Agent KB

Universal session bootstrap and routing intelligence for the DaBigHomie workspace.

## Invoke

```
@agent-kb 043
@agent-kb ffs "what's pending in checkout?"
@agent-kb maximus "find agent for stripe payment flow"
@agent-kb "search: handoff compressed context"
```

## What It Does

1. **Queries SQLite** — loads session state, open tasks, last handoff for target repo
2. **Routes the task** — matches intent to agent cluster via capability index
3. **Searches semantically** — natural language query over 300+ agent doc chunks
4. **Writes handoff** — at session end, preserves state for next agent

## Workflow

1. Detect repo alias from arg or workspace CWD
2. Query `db/agent_kb.sqlite` → session + tasks + last handoff
3. If task/query given → route via DB capability match or LanceDB semantic search
4. Return session brief + routing result in ≤500 tokens
5. At end of work → write handoff + sync to GitHub

## DB Location

```
/Users/dame/management-git/.agent-kb/db/agent_kb.sqlite
```

## Semantic Index

```bash
# Build index (first time / after new agent docs added)
cd /Users/dame/management-git/.agent-kb/semantic && npm run build

# Query
npx tsx query.mts "find agents for auth flow"
npx tsx query.mts "checkout stripe" --repo=ffs --top=3
npx tsx query.mts "handoff protocol" --type=handoff-template --json
```

## Rules

- Query before reading — DB first, semantic second, files only to execute
- Write handoff before every session exit
- If semantic index missing: prompt user to run `npm run build` in `.agent-kb/semantic/`

## Related Agents

- `@agent-kb` — this agent (primary session operator)
- `@session-cleanup` — end-of-session cleanup + handoff
- `@ugwtf-mastery` — cross-repo pipeline execution
- `@deep-dive-audit` — reads semantic results before scanning
