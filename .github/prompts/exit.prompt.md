---
description: "Session teardown for audit-fix-ship (skill repo): commit templates/scripts safely, write Context Manifest, optional Slack via webhook; bot-token handoffs are a separate path."
argument-hint: "Optional; default = git root from cwd (audit-fix-ship)"
---

# /exit — Session Teardown (audit-fix-ship)

**audit-fix-ship** is a **skill / templates + TypeScript scripts** repository — not a web app. Resolve repo root with `git rev-parse --show-toplevel`. Handoff content follows **`/context-manifest`** sections 1–7 (see **`.github/prompts/context-manifest.prompt.md`**).

## Step 1: Processes

Rare long-lived servers; stop any local watchers you started. Do not mass-`kill -9` without confirming PIDs.

## Step 2: Quality and commit

Per `AGENTS.md`:

```bash
cd scripts && npx tsc --noEmit
```

Then `git status --short`, commit with a clear message. No push to `main` without user approval.

## Step 3: Handoff manifest

Write the same **section structure** as `/context-manifest` (Completed Work, Hurdles, Decisions, Next Steps, User Intention, Links, Quickstart). Emphasize `templates/`, `scripts/`, `SKILL.md`, and UGWTF chain touchpoints if relevant.

## Step 4: Save

`docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/CONTEXT_MANIFEST.md`  
(create `docs/context-manifests` if needed)

## Step 5: Slack

**Incoming webhook (Copilot-style exit, repo-local env)**  
- Read `SLACK_WEBHOOK_URL` from this repo’s **`.env`** or **`.env.local`** (see `.env.example`).  
- `curl` a small JSON summary if the variable is set; otherwise skip and note it.

**Bot API (separate workflow)**  
- Full markdown posts (e.g. to Management `#handoffs`) use **`SLACK_BOT_TOKEN`** + **`SLACK_CHANNEL_ID`** and often live in a **sibling** clone’s env (e.g. `documentation-standards`’s `post-handoff-to-slack.mjs` and parent `~/**/.env.mcp`).  
- Do **not** mix these up with the webhook URL; they are different integration types.

## Step 6: Optional `gh` issue

For large changes, consider an issue; skip for small clean sessions.

## Step 7: Report

Manifest path, Slack (webhook / skipped), commit hash.

---

## CLI

From **management-git** root:  
`npx tsx documentation-standards/scripts/exit-session.mts audit`  
(only if that matches your alias; see `exit-session.mts` help). Same **webhook** rules as Step 5.

## Rules

- No secrets in commits; use `.env` locally (never commit it)
