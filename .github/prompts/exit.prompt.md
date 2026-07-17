---
description: "Session teardown for the documentation-standards hub: verify state, write Context Manifest, optional Slack via webhook and/or bot API. Use when: ending a session, cross-repo handoff, publishing standards updates."
argument-hint: "Optional path or alias; omit to use git root from cwd (this repository)"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/exit.prompt.md -- do not edit; run sync-agents.mts -->

# /exit — Session Teardown (documentation-standards)

This repository is the **shared documentation, templates, and scripts hub** (not an app with `src/`). Resolve the repo root with `git rev-parse --show-toplevel` (usually this clone). The handoff file matches **`/context-manifest`** sections 1–7.

## Step 1: Terminals and processes

If you started long-running jobs from this repo, stop them safely. This repo rarely runs dev servers; `node`/`npx` one-offs are the common case.

## Step 2: Commit state

1. `git status --short` and `git branch --show-current`
2. Quality checks that exist here (see `AGENTS.md`): e.g. from repo root, `npx tsc --noEmit` in `scripts/` if applicable; `npm run validate` or `npm run lint` if defined in `package.json`
3. Commit with a clear message; do not push to `main` without user approval

## Step 3: Handoff manifest (same format as `/context-manifest`)

Generate the same **Context Manifest** structure as in **`.github/prompts/context-manifest.prompt.md`** (sections 1–7). Focus on what changed under `docs/`, `templates/`, and `scripts/`, and pointers to `KEY-FILES.md` / `docs/REPO-INDEX.md` when relevant.

## Step 4: Save the manifest

`docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/CONTEXT_MANIFEST.md`

## Step 5: Slack — two supported mechanisms (pick what you use)

**A — Incoming webhook (typical for Copilot `/exit` from a repo `.env`)**  
- Read `SLACK_WEBHOOK_URL` from **this repo’s** `.env` or `.env.local` (first match).  
- Post a **short** JSON payload with `curl` to that URL.  
- The webhook is tied to **one** channel (often `#handoffs`) when you created it in Slack.

**B — Bot token + channel (full markdown handoffs — separate from A)**  
- Uses **`SLACK_BOT_TOKEN`** (`xoxb-…`) and **`SLACK_CHANNEL_HANDOFFS_ID`** or **`SLACK_CHANNEL_ID`** (`C…`) — usually loaded from **workspace** env such as sibling **`~/management-git/.env.mcp`** or this repo’s `.env`.  
- Run from this repo:  
  `node scripts/post-handoff-to-slack.mjs --file docs/context-manifests/.../CONTEXT_MANIFEST.md`  
- Do **not** confuse webhook URLs with bot tokens; keep secrets out of chat logs.

If neither webhook nor bot env is configured, **skip Slack** and say so.

## Step 6: Optional review issue

Open a GitHub issue if the session was large or risky; otherwise skip.

## Step 7: Final report

Summarize: manifest path, Slack path used (webhook / bot / skipped), branch/commit.

---

## CLI alternative

From **management-git** workspace root:  
`npx tsx documentation-standards/scripts/exit-session.mts`  
(Use `<alias>` if that script expects one — see script header.) Align **`SLACK_WEBHOOK_URL`** in repo `.env` with the same rules as Step 5A.

## Rules

- **Portable paths** — no machine-specific home directories in committed files.  
- **Secrets** — never paste tokens into issues or manifests.
