<!-- GENERATED FROM maximus-ai/.claude/commands/exit.md -- do not edit; run sync-commands.mts -->
# Session exit (`/exit`)

Run this when the user wants a **clean session close**: processes checked, work committed, manifests written, **Management / Slack "handoffs"** notified, optional **partner-facing Slack summary** (plain language, diagrams, links for Jay), **40x** review queued for background fix agents.

## Preconditions

- Know **which repo(s)** this session touched (`cwd`, workspace roots, or ask once).
- **`~/management-git` is not one git repo** — run **`git` inside each clone**, never assuming a root repo.

## 1. Terminals and processes (verify -> close)

1. List **integrated terminals** (Cursor metadata when available) or infer from conversation (running `npm run dev`, `vite`, `next dev`, watchers).
2. For each long-running process tied to this session:
   - Prefer **graceful stop** (Ctrl+C in that terminal, or `kill` PID after user confirms).
   - Do **not** mass-kill system processes or unrelated user jobs.
3. If terminals cannot be inspected programmatically, output a **short checklist** for the user: "Stop dev servers in repos X, Y."
4. Confirm **no orphan background jobs** the session started (Playwright, vitest watch, etc.).

## 2. Git -- committed state

For **every repo edited** in this session:

```bash
git status --short
git branch --show-current
```

- If there are **uncommitted** changes: either **commit** with a clear message (per project conventions) or state **explicitly** what was left dirty and why.
- **Do not** commit secrets, `.env`, or machine paths.
- **Do not** `reset --hard` or force-push without explicit user approval.
- If the user only wanted a handoff without commit, **document** WIP in the manifest (see S3).

## 2.5. Forensic sanity pass (before writing the manifest)

If this session made non-trivial claims that will end up in the manifest -- new cross-repo
references, new tool/version pointers, "delivered" or "fixed" statements -- run a **forensic-auditing**
pass over the touched files before writing them down as fact:

- **Diff against live git HEAD** (not memory) -- does the referenced file/branch/PR actually exist
  where the doc says it does, right now?
- **Trace, don't assume, tool behavior** -- if the manifest says "ran X to do Y," confirm by reading
  X, not by its name.
- **Cross-repo sync copies** -- if a referenced file is known to be synced across repos (MALFIG
  gatekeeper pattern), name the canonical copy explicitly; check for a second untracked/divergent
  copy before calling one "the" canonical source.

Invoke the `forensic-auditing` skill for sessions with material claims; skip it for routine
sessions with no new cross-references.

## 3. Handoff and agent manifests

1. **Primary hub:** `documentation-standards` -- use `KEY-FILES.md` and `docs/AGENT-CONTEXT-KEY.md` as pointers.
2. Write or update a **session manifest** under **`documentation-standards/docs/context-manifests/`** (or repo-local path if user prefers):
   - Filename: **`YYYY-MM-DD_HH-mm_scope.md`** or **`SESSION-<repo>-<branch>-YYYYMMDD.md`**.
   - Include: repos touched, branches, commits made (hashes), files intentionally dirty, **next steps**, links to PRs/issues if any.
3. **For larger sessions** (many files, multiple repos, cold handoff): use **`@dabighomie/handoff-framework`**
   at `~/management-git/handoff-framework` instead of a single freeform manifest --
   `node bin/handoff.mjs init <project> --session <slug>`, then `generate`, then `validate`.
   Use the single-file manifest for routine sessions; the framework for the ones where handoff
   quality actually matters. Not mutually exclusive.
4. Align with **`docs/PROMPT-NEXT-AGENT-HANDOFF.md`** -- note whether **Mechanism A/B** (delegate / Cursor handoff) applies later.

See **`~/.claude/commands/exit-reference.md`** for a manifest skeleton.

## 4. Session summary -> Slack ("handoffs" in Management workspace)

1. **Slack workspace:** user's **Management** org (not the same as other Slack teams). The target channel is named **"handoffs"** (or the user's equivalent).
2. **Env (local, never commit):**
   - `SLACK_BOT_TOKEN` -- bot must be **in** the handoffs channel (`channels:join` or invite).
   - **Channel ID** for handoffs: prefer **`SLACK_CHANNEL_HANDOFFS_ID`** (set to that channel's `C...` ID). Fall back to `SLACK_CHANNEL_ID` only if the user confirms it points at **handoffs**.

3. Post using **`documentation-standards/scripts/post-handoff-to-slack.mjs`**:

```bash
cd ~/management-git/documentation-standards
node scripts/post-handoff-to-slack.mjs \
  --file docs/context-manifests/<your-manifest>.md \
  --kind handoff \
  --channel "${SLACK_CHANNEL_HANDOFFS_ID:-Cxxxxxxxx}"
```

Use **`--channel C...`** with the **#handoffs** channel ID from the **Management** Slack workspace (or set **`SLACK_CHANNEL_HANDOFFS_ID`** / **`SLACK_CHANNEL_ID`** in `.env.mcp`). **`SLACK_BOT_TOKEN`** must be loaded (same loader as other scripts).

If `--kind plan` is better for a roadmap chunk, use **`SLACK_CHANNEL_PLANS_ID`** per script docs.

4. If Slack env is missing, **do not fabricate** -- output the manifest path + exact command for the user to run after sourcing `.env.mcp` / `.env`.

### 4.1 Partner executive report (non-technical, for Jay)

After the technical handoff (or in the same closeout window), post a **plain-language** update that explains **value and business impact** of the session, not implementation detail. This is for a business partner (Jay) and must read well in Slack: **no emojis**, short sentences, no unexplained jargon.

1. **Source of truth:** the latest **session checkpoint** in the repo you worked in, for example `docs/checkpoints/YYYY-MM-DD-<title>-HHMM.md` (see `~/.claude/commands/exit-reference.md` "Checkpoint for partner reporting").

2. **What to include in the checkpoint (so the script can post it):**
   - **`## For Jay`** or **`## Stakeholder summary`:** why the work mattered, revenue or risk, what customers or operations gain (plain English).
   - **`## Diagram`:** optional. Put an **ASCII** flow in a fenced code block, or **Mermaid** in a ` ```mermaid ` block, and/or a line **`Diagram link:`** with a full `https://...` URL (Mermaid Live, FigJam, Lucid, and so on). Slack does not render Mermaid natively; the link is how Jay opens the visual.
   - **`## Related links`:** optional. Pull requests, GitHub issues, analytics, or documentation that anchor scope and follow-ups.

3. **Run** (example for damieus):

```bash
cd ~/management-git/damieus-com-migration
npx tsx scripts/slack/post-session-summary.mts docs/checkpoints/<your-checkpoint>.md
```

- **`--dry-run`** prints Block Kit JSON without posting (verify before sending).
- **Auth:** `SLACK_WEBHOOK_URL` (incoming webhook for the partner or shared channel), **or** `SLACK_BOT_TOKEN` plus **`SLACK_CHANNEL_PARTNER_ID`** (or `SLACK_CHANNEL_ID` if that channel is the partner channel). Bot needs **`chat:write`** and must be **invited** to the target channel, same as handoffs.

4. The script posts **two messages in order:** (1) **executive** summary (Jay-oriented, including optional diagram and links from the checkpoint), (2) **technical** summary for the team. If env is missing, print the exact command and checkpoint path; do not invent channel IDs or tokens.

**Diagram guidance:** Prefer one simple "before to after" or "customer path" picture over a dense architecture chart. If the checkpoint includes Mermaid, always add a **`Diagram link:`** line so Jay can open the full-size or interactive view.

## 5. 40x logic review and background follow-up

1. **Read-only checks** (no git mutation):

```bash
cd ~/management-git/documentation-standards
node scripts/verify-workspace-40x.mjs
```

(includes the per-repo footprint table -- `verify-context-footprint.mjs` is deprecated
2026-07-05, do not call it separately.)

2. **Review** session work against:
   - `SESSION-ISOLATION-CONTEXT-40X.md` (scope, worktrees, separate Cursor vs Antigravity workspace files)
   - `AGENT-HANDOFF-CROSS-REPO-CONFIG.md` S0
   - `CURSOR-40X-REVISED-PLAN-2026-05.md` (forecast + audit before wide changes)

3. **Delegate to a background agent** (Cursor Task / subagent / async run -- product-dependent):
   - **Input:** manifest path + list of **gaps** (e.g. missing tests, TODO, footprint warning, duplicate workspace files).
   - **Instruction template:** "Fix only listed items; read-only verify after; do not expand scope; follow 40x and repo `AGENTS.md`."
   - If no background agent is available, output a **single copy-paste prompt** for the user to start a new chat with the same payload.

## 6. Exit checklist (copy to chat when done)

```
- [ ] Terminals / session dev processes addressed
- [ ] Each touched repo: committed or WIP noted in manifest
- [ ] Manifest file path: ____________________
- [ ] Slack handoffs post: sent or command provided
- [ ] Partner executive report (Jay): checkpoint includes For Jay / Diagram / Links as needed; post-session-summary run or command provided
- [ ] 40x review + background follow-up: queued or prompt provided
```

## 7. Limits

- Cannot guarantee **all OS processes** are stopped without user confirmation.
- **Slack** requires valid bot token and channel ID for the **Management** workspace.
- **Background agents** require the product feature (e.g. Cursor Task); otherwise substitute a **new-chat prompt**.
