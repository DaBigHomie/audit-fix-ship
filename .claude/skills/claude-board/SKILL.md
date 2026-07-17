---
name: claude-board
version: "1.0.0"
updated: 2026-07-07
canonical_basis: documentation-standards/skills/claude-board/SKILL.md
description: >-
  Generate a self-contained, refreshable HTML "Claude board" for a CORTEX
  session — a 5-section snapshot dashboard covering (1) In flight, (2) Completed
  this cycle, (3) Completed all time in session, (4) Full session PRs tally, and
  (5) Queued. Data sources are LIVE: CORTEX (cortex_tasks, cortex_knowledge,
  cortex_sessions), `gh pr list --state merged` per relevant repo, and worktree
  retirement records in cortex_tasks.output_blob. The HTML file is a SNAPSHOT
  (not persistent state — CORTEX remains SSOT); the skill is the source of truth
  for how to build it. Emits the file path AND an `open` / `xdg-open` command;
  never auto-opens. Use when the user says "claude board", "session board",
  "board html", "dashboard", "in flight", "PR tally", "what's shipped today",
  or "show me the session's five-section board".
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/claude-board/SKILL.md -- do not edit; run sync-skills.mts -->

# claude-board

Read-only snapshot generator: given a CORTEX `session_id` and a date window,
emit a single self-contained HTML file with **five sections** describing that
session's live state. The file is a snapshot; CORTEX remains the system of
record. Regeneratable at any time from the same live inputs.

**Hub:** `documentation-standards/skills/claude-board/SKILL.md`
**Related:** `session-status` (text status peer), `session-chapter-index`
(forensic markers peer), `session-cleanup-checkpoint` (session teardown pair),
`forecast-scrutiny` (blast-radius upstream when the board seeds a decision).

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
: "${HOME:?HOME must be set}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill (Tier 1)** | `$MGMT_ROOT/documentation-standards/skills/claude-board/SKILL.md` |
| **session-status (peer)** | `$MGMT_ROOT/documentation-standards/skills/session-status/SKILL.md` |
| **session-chapter-index (peer)** | `$MGMT_ROOT/documentation-standards/skills/session-chapter-index/SKILL.md` |
| **CORTEX env** | `$MGMT_ROOT/maximus-ai/.env.local` (project-polaris uses same key set; other repos override) |
| **Output dir (default)** | `$MGMT_ROOT/.claude/board/` if writable, else `$HOME/Downloads/` |

## Differentiation — `claude-board` vs peers

| Skill | Output | Refresh model | Purpose |
|-------|--------|---------------|---------|
| `session-status` | Text status block in chat | On invoke | Read-only status audit before continuing work |
| `session-chapter-index` | Structured markers (chapters, threads, seed) | On invoke | Seed downstream handoff / solution-doc authoring |
| `claude-board` (this) | Standalone HTML file on disk | Snapshot; re-run to refresh | Visual dashboard for humans to open in a browser |

They compose: `session-status` gives text; `claude-board` gives visual;
`session-chapter-index` seeds authoring. None persist state.

## Hard guardrails

| Allowed | Forbidden |
|---------|-----------|
| `gh pr list` (read), Supabase `SELECT` on `cortex_*` | Any `INSERT`/`UPDATE` to CORTEX from this skill |
| Write HTML to `$MGMT_ROOT/.claude/board/` or `$HOME/Downloads/` | Write HTML to any git-tracked path |
| Emit `open <path>` for the user to run | Auto-execute `open` — human decides |
| External URLs as `<a href>` links | External CDN `<script src>` or `<link rel="stylesheet">` — HTML must work offline |

**Rule:** The board is a snapshot. If the user wants a "live" board, they re-run
the skill. Never claim the file auto-updates unless a separate cron/hook wraps it.

## Inputs

| Input | Required | Default | Notes |
|-------|----------|---------|-------|
| `session_id` | yes | — | e.g. `polaris-bootstrap-20260607` |
| `date_window` | no | today (YYYY-MM-DD in local tz) | Format: `YYYY-MM-DD` or `YYYY-MM-DD..YYYY-MM-DD` |
| `repos` | no | auto-detect from session's primary_repo + linked repos | Comma-separated `owner/repo` list for `gh pr list` |
| `output_dir` | no | `$MGMT_ROOT/.claude/board/` → fallback `$HOME/Downloads/` | Must NOT be a git-tracked path |
| `filename` | no | `claude-board-{session_id}-{date_window}.html` | Colons replaced with `-` |

## Data sources (LIVE — no narrative summary)

1. **CORTEX tasks** — `cortex_tasks` filtered by `session_id = <input>` OR
   `id LIKE '%_${YYYYMMDD}'` (captures tasks tagged with today's date even
   when the session_id borrows a peer session). Return columns: `id`, `status`,
   `priority`, `title`, `summary`, `output_blob`, `updated_at`, `created_at`.
2. **CORTEX knowledge** — `cortex_knowledge` where `key LIKE 'session:<session_id>:%'`.
3. **CORTEX sessions** — `cortex_sessions` where `session_id = <input>` for
   session metadata (primary_repo, cluster, swarm).
4. **Merged PRs** — for each repo in `repos`:
   ```bash
   gh pr list --repo <owner/repo> --state merged \
     --search "merged:<date_window>" \
     --json number,title,mergeCommit,author,url,mergedAt
   ```
   Filter authors to Claude identities (`Claude`, `dabighomie` co-authored with
   Claude, or any author matching `/claude/i`). If the caller wants all authors,
   they pass `--all-authors`.
5. **Retirement records** — parse `cortex_tasks.output_blob` for keys
   `session_retirement`, `wave_2_retirement`, `row_1_retirement`, and any
   `*_retirement` key. These describe closed worktrees / lanes.
6. **In-flight background agents** — `cortex_tasks.status = 'in_progress'` in
   session. **Header note:** live BG-agent identity is orchestrator-tracked
   and CORTEX may lag by seconds-to-minutes.

## Output shape — the 5 sections

Single HTML file, `<!doctype html>`, inline `<style>` and `<script>`, no
external CDN. UTF-8, `<meta name="viewport">`, dark-mode friendly (respect
`prefers-color-scheme`). Header shows session_id, date window, generation
timestamp, and total counts. Optional auto-refresh meta tag is present but
**commented out** by default (this snapshot doesn't auto-refresh; a separate
job would).

Each section is a `<section id="…">` with an `<h2>` including the count.

| # | Section id | Content | Layout |
|---|------------|---------|--------|
| 1 | `in-flight` | `cortex_tasks.status IN ('in_progress','blocked')` | Cards |
| 2 | `completed-cycle` | `status = 'complete'` where `updated_at` in date_window | Cards |
| 3 | `completed-all` | `status = 'complete'` for the full session (any date) | Compact list |
| 4 | `prs` | Merged PRs in date_window across `repos` | Table: repo · PR # · merge SHA · title · link |
| 5 | `queued` | `status IN ('pending','todo','queued')` in session | Cards |

Card fields: `id`, `priority`, `title`, `summary` (truncate ~200 chars),
`updated_at`. Table row: repo, PR number as link, first 12 chars of merge SHA,
title, `mergedAt`.

Include a **Retirement roll-up** panel above section 5 listing every parsed
`*_retirement` key with worktree path + closing SHA + timestamp.

## Method

### Step 1 — Resolve inputs + env

```bash
: "${MGMT_ROOT:?}"
SESSION_ID="${1:?session_id required}"
DATE_WIN="${2:-$(date +%F)}"
OUT_DIR="${3:-$MGMT_ROOT/.claude/board}"
mkdir -p "$OUT_DIR" 2>/dev/null || OUT_DIR="$HOME/Downloads"
```

### Step 2 — Query CORTEX (read-only)

Use `mcp__claude_ai_Supabase__execute_sql` or `psql` against the CORTEX
project ref declared in the session's `.cortex-boot.json`. Never write.

Queries:

```sql
-- tasks in session or tagged with the date_window
SELECT id, status, priority, title, summary, output_blob, updated_at, created_at
FROM cortex_tasks
WHERE session_id = :session_id
   OR id LIKE '%_' || regexp_replace(:date_window_start, '-', '', 'g');

-- knowledge scoped to session
SELECT key, value_summary, updated_at
FROM cortex_knowledge
WHERE key LIKE 'session:' || :session_id || ':%';

-- session metadata
SELECT session_id, primary_repo, cluster, swarm, started_at
FROM cortex_sessions
WHERE session_id = :session_id;
```

### Step 3 — Query merged PRs

```bash
for repo in $REPOS; do
  gh pr list --repo "$repo" --state merged \
    --search "merged:$DATE_WIN" \
    --json number,title,mergeCommit,author,url,mergedAt \
    --limit 200
done
```

Filter authors client-side to Claude identities unless `--all-authors`.

### Step 4 — Parse retirements

For each task's `output_blob` (JSON), look for keys matching `*_retirement`.
Extract `worktree`, `sha`, `at` if present. Emit into the roll-up panel.

### Step 5 — Render HTML

Emit a single file. Structure:

```html
<!doctype html>
<html lang="en" data-session="{{session_id}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <!-- <meta http-equiv="refresh" content="60"> -->
  <title>Claude Board — {{session_id}} — {{date_window}}</title>
  <style>/* inline; dark-mode-friendly */</style>
</head>
<body>
  <header>
    <h1>Claude Board</h1>
    <div class="meta">session: {{session_id}} · window: {{date_window}} · generated: {{iso_ts}}</div>
    <div class="counts">in-flight: {{n1}} · cycle: {{n2}} · session: {{n3}} · PRs: {{n4}} · queued: {{n5}}</div>
  </header>
  <section id="in-flight"><h2>In flight <span class="count">{{n1}}</span></h2>
    <p class="note">Live BG-agent identity is orchestrator-tracked; CORTEX may lag.</p>
    <!-- cards -->
  </section>
  <section id="completed-cycle"><h2>Completed this cycle <span class="count">{{n2}}</span></h2></section>
  <section id="completed-all"><h2>Completed — session all-time <span class="count">{{n3}}</span></h2></section>
  <section id="retirements"><h2>Retirements</h2></section>
  <section id="prs"><h2>PRs merged in window <span class="count">{{n4}}</span></h2>
    <table><thead><tr><th>Repo</th><th>PR</th><th>Merge SHA</th><th>Title</th><th>Merged at</th></tr></thead>
      <tbody><!-- rows --></tbody></table>
  </section>
  <section id="queued"><h2>Queued <span class="count">{{n5}}</span></h2></section>
  <script>/* optional client-side collapse / filter */</script>
</body>
</html>
```

### Step 6 — Write file + emit path + open command

```bash
FILE="$OUT_DIR/claude-board-${SESSION_ID}-${DATE_WIN}.html"
# write HTML to $FILE
echo "Wrote: $FILE"
case "$(uname)" in
  Darwin) echo "Run: open '$FILE'" ;;
  Linux)  echo "Run: xdg-open '$FILE'" ;;
esac
```

**Never** execute `open` inside the skill — human decides.

## Non-goals

- Does NOT persist state anywhere. Board is a snapshot.
- Does NOT modify CORTEX (no `INSERT`/`UPDATE`/`DELETE`).
- Does NOT write to any git-tracked path.
- Does NOT auto-refresh. The `<meta http-equiv="refresh">` line is commented
  out by default. Wrap in cron/hook for live behavior.
- Does NOT author handoffs, solution docs, or problem records.
- Does NOT enumerate BG agents beyond `cortex_tasks.status = 'in_progress'`.

## Anti-patterns

| Do not | Do instead |
|--------|------------|
| Auto-execute `open <path>` | Print the command; human runs it |
| Load Tailwind/React from a CDN | Inline all CSS/JS; file must open offline |
| Write board to `docs/` or any repo path | Write to `$MGMT_ROOT/.claude/board/` or `$HOME/Downloads/` |
| Claim BG-agent list is complete | Include the "orchestrator-tracked; may lag" note |
| Fabricate PR list from memory | `gh pr list --state merged` per repo, filter authors |
| Persist board state to CORTEX | CORTEX is SSOT; the board only READS |

## Example invocation

User: "Make me the claude board for polaris-bootstrap-20260607."

1. Resolve `session_id = polaris-bootstrap-20260607`, `date_window = 2026-07-07`,
   `output_dir = $MGMT_ROOT/.claude/board/` (fallback `$HOME/Downloads/`).
2. Query CORTEX for tasks/knowledge/session; query `gh pr list` for
   `DaBigHomie/project-polaris`, `DaBigHomie/maximus-ai`,
   `DaBigHomie/documentation-standards`.
3. Parse `output_blob.*_retirement`.
4. Render single self-contained HTML at
   `$OUT_DIR/claude-board-polaris-bootstrap-20260607-2026-07-07.html`.
5. Print file path + `open <path>` command. Stop.

## Governance references

- Placement: this is a Tier 1 hub skill under `documentation-standards/skills/`.
  Auto-discovered by `scripts/sync-skills.mts`; no manual registry entry.
- Session-artifact placement (if wrapping the board in a persisted per-session
  archive): `{owning-repo}/docs/session-artifacts/{YYYY-MM-DD}_{slug}/` per PAC.
  This skill's default output is scratch, not session-artifacts.
