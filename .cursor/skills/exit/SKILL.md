---
name: exit
description: >-
  End-of-session exit workflow: verify terminals/processes, ensure git commit
  state, write handoff manifests, post session summary to Slack handoffs channel,
  run 40x review and delegate follow-ups. Use when the user says /exit, session
  exit, end session, or closeout with handoff to Slack.
disable-model-invocation: true
---

# Session exit (`/exit`)

Run this when the user wants a **clean session close**: processes checked, work committed, manifests written, **Management / Slack “handoffs”** notified, optional **partner-facing Slack summary** (plain language, diagrams, links for Jay), **40x** review queued for background fix agents.

## Preconditions

- Know **which repo(s)** this session touched (`cwd`, workspace roots, or ask once).
- **`~/management-git` is not one git repo** — run **`git` inside each clone**, never assuming a root repo.

## 1. Terminals and processes (verify → close)

1. List **integrated terminals** (Cursor metadata when available) or infer from conversation (running `npm run dev`, `vite`, `next dev`, watchers).
2. For each long-running process tied to this session:
   - Prefer **graceful stop** (Ctrl+C in that terminal, or `kill` PID after user confirms).
   - Do **not** mass-kill system processes or unrelated user jobs.
3. If terminals cannot be inspected programmatically, output a **short checklist** for the user: “Stop dev servers in repos X, Y.”
4. Confirm **no orphan background jobs** the session started (Playwright, vitest watch, etc.).

## 2. Git — committed state

For **every repo edited** in this session:

```bash
git status --short
git branch --show-current
```

- If there are **uncommitted** changes: either **commit** with a clear message (per project conventions) or state **explicitly** what was left dirty and why.
- **Do not** commit secrets, `.env`, or machine paths.
- **Do not** `reset --hard` or force-push without explicit user approval.
- If the user only wanted a handoff without commit, **document** WIP in the manifest (see §3).

## 3. Handoff and agent manifests

1. **Primary hub:** `documentation-standards` — use [`KEY-FILES.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/KEY-FILES.md) and [`docs/AGENT-CONTEXT-KEY.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/docs/AGENT-CONTEXT-KEY.md) as pointers.
2. Write or update a **session manifest** under **`documentation-standards/docs/context-manifests/`** (or repo-local path if user prefers):

   - Filename: **`YYYY-MM-DD_HH-mm_scope.md`** or **`SESSION-<repo>-<branch>-YYYYMMDD.md`**.
   - Include: repos touched, branches, commits made (hashes), files intentionally dirty, **next steps**, links to PRs/issues if any.

3. Align with **[`docs/PROMPT-NEXT-AGENT-HANDOFF.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/docs/PROMPT-NEXT-AGENT-HANDOFF.md)** — note whether **Mechanism A/B** (delegate / Cursor handoff) applies later.

See **[reference.md](reference.md)** for a manifest skeleton.

## 4. Session summary → Slack (“handoffs” in Management workspace)

1. **Slack workspace:** user’s **Management** org (not the same as other Slack teams). The target channel is named **“handoffs”** (or the user’s equivalent).
2. **Env (local, never commit):**
   - `SLACK_BOT_TOKEN` — bot must be **in** the handoffs channel (`channels:join` or invite).
   - **Channel ID** for handoffs: prefer **`SLACK_CHANNEL_HANDOFFS_ID`** (set to that channel’s `C…` ID). Fall back to `SLACK_CHANNEL_ID` only if the user confirms it points at **handoffs**.

3. Post using **`documentation-standards/scripts/post-handoff-to-slack.mjs`**:

```bash
cd ~/management-git/documentation-standards
node scripts/post-handoff-to-slack.mjs \
  --file docs/context-manifests/<your-manifest>.md \
  --kind handoff \
  --channel "${SLACK_CHANNEL_HANDOFFS_ID:-Cxxxxxxxx}"
```

Use **`--channel C…`** with the **#handoffs** channel ID from the **Management** Slack workspace (or set **`SLACK_CHANNEL_HANDOFFS_ID`** / **`SLACK_CHANNEL_ID`** in `.env.mcp`). **`SLACK_BOT_TOKEN`** must be loaded (same loader as other scripts).

If `--kind plan` is better for a roadmap chunk, use **`SLACK_CHANNEL_PLANS_ID`** per script docs.

4. If Slack env is missing, **do not fabricate** — output the manifest path + exact command for the user to run after sourcing `.env.mcp` / `.env`.

### 4.1 Partner executive report (non-technical, for Jay)

After the technical handoff (or in the same closeout window), post a **plain-language** update that explains **value and business impact** of the session, not implementation detail. This is for a business partner (Jay) and must read well in Slack: **no emojis**, short sentences, no unexplained jargon.

1. **Source of truth:** the latest **session checkpoint** in the repo you worked in, for example `docs/checkpoints/YYYY-MM-DD-<title>-HHMM.md` (see [`reference.md`](reference.md) “Checkpoint for partner reporting”).

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

**Diagram guidance:** Prefer one simple “before to after” or “customer path” picture over a dense architecture chart. If the checkpoint includes Mermaid, always add a **`Diagram link:`** line so Jay can open the full-size or interactive view.

### 4.2 Email report (HTML via Resend — portable)

After writing the checkpoint, send a formatted HTML email using the **portable send script** in `documentation-standards`. Works from **any repo**, no npm install needed.

1. **Pick template** from `documentation-standards/templates/email-reports/` — check the **Template Audience Matrix** in `EMAIL-REPORT-STANDARDS.md` to confirm this template is appropriate for the recipient (Template I is internal-only, never sent to Jay).
   - `TEMPLATE-A-strategic-value-report.html` — multi-day sprint summary
   - `TEMPLATE-B-session-report.html` — single-project session
   - `TEMPLATE-C-cross-project-sync.html` — cross-scope status

2. **Copy, populate, save** as `docs/checkpoints/YYYY-MM-DD-{name}-email.html`. Keep all inline styles.

3. **Run the Pre-Send Quality Gate** (see `EMAIL-REPORT-STANDARDS.md` § Pre-Send Quality Gate):
   - **Persona review** — read the entire email as Jay. Every sentence must answer "What changed for the business?" No jargon, no commit SHAs, no file paths.
   - **Link verification** — live ≠ complete. Only link pages where the work is finished, not just deployed. Check the deployment plan or visit the page. If work is in-progress, mention the page by name with percent complete instead of linking.
   - **Deployment status** — confirm "Live on Production" pages are actually deployed AND content-complete.
   - **Messaging alignment** — results first, percent completion, dollar impact. Not a dev log.

4. **Send** (from any repo — dates are always variables, never hardcoded):

```bash
DATE_RANGE="May 3-5, 2026"  # set per session
npx tsx ~/management-git/documentation-standards/scripts/send-report.mts \
  --file=docs/checkpoints/YYYY-MM-DD-{name}-email.html \
  --subject="[PROJECT] Title — ${DATE_RANGE}" \
  --to=jarvis.cromedy@gmail.com,jayanthonyatl@gmail.com,admcromedy@gmail.com \
  --cc=dameluthas@gmail.com
```

5. **Rules:** Only `.html` (rejects `.md`). Always CC `dameluthas@gmail.com`. No emojis. Log Resend ID. See `templates/email-reports/EMAIL-REPORT-STANDARDS.md`.


## 5. 40x logic review and background follow-up

1. **Read-only checks** (no git mutation):

   ```bash
   cd ~/management-git/documentation-standards
   node scripts/verify-workspace-40x.mjs --strict-prime-gate
   node scripts/verify-workspace-40x.mjs --test-health
   node scripts/verify-context-footprint.mjs
   ```

   When **`atl-table-booking-app`** was touched and tests ran:

   ```bash
   cd ~/management-git/atl-table-booking-app
   npx tsx scripts/write-40x-test-health.mts --playwright=pass|fail --maestro=pass|fail|pending --note="exit handoff"
   ```

   (`pnpm test:e2e:admin` writes this automatically via `scripts/test-e2e-admin.mts`.)

2. **Review** session work against:
   - [`SESSION-ISOLATION-CONTEXT-40X.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/docs/SESSION-ISOLATION-CONTEXT-40X.md) (scope, worktrees, **separate** Cursor vs Antigravity workspace files)
   - [`AGENT-HANDOFF-CROSS-REPO-CONFIG.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/docs/AGENT-HANDOFF-CROSS-REPO-CONFIG.md) §0
   - [`CURSOR-40X-REVISED-PLAN-2026-05.md`](https://github.com/DaBigHomie/documentation-standards/blob/master/docs/CURSOR-40X-REVISED-PLAN-2026-05.md) (forecast + audit before wide changes)

3. **Delegate to a background agent** (Cursor **Task** / subagent / async run — product-dependent):
   - **Input:** manifest path + list of **gaps** (e.g. missing tests, TODO, footprint warning, duplicate workspace files).
   - **Instruction template:** “Fix only listed items; read-only verify after; do not expand scope; follow 40x and repo `AGENTS.md`.”
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
