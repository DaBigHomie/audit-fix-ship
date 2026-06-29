# Exit skill — reference

## Session manifest skeleton

```markdown
# Session exit — YYYY-MM-DD

## Scope
- Repos: …
- Branches: …
- Worktrees (if any): …

## Commits
- `repo@sha` — message

## WIP (intentionally uncommitted)
- …

## Session summary
- …

## 40x / risks
- Footprint / workspace / isolation notes

## Next agent
- Tasks:
- Blockers:
```

## Slack handoffs channel

- Resolve channel ID: Slack → channel → **View channel details** → copy **Channel ID** (starts with `C`).
- Export: `export SLACK_CHANNEL_HANDOFFS_ID=Cxxxxxxxx`

Bot must have **`chat:write`** and be **invited** to `#handoffs`.

## Checkpoint for partner reporting (exit / Jay)

Use this shape in `docs/checkpoints/YYYY-MM-DD-<title>-HHMM.md` so `scripts/slack/post-session-summary.mts` can post a plain-language Slack update (see exit skill §4.1).

```markdown
# Session checkpoint — <short title>

**Date:** YYYY-MM-DD

## Objective

What we set out to do (one short paragraph).

## For Jay

Why this session matters for the business: money, risk, customer experience, or time saved. No stack names unless you explain them in one phrase.

## Diagram

Optional. One visual helps partners follow the story. Use a single fenced code block: label it `text` for ASCII, or `mermaid` for a flowchart. Example line content: `Visitor -> Choose service -> Pay -> Confirmation` (ASCII) or Mermaid source in the block.

On the line after the code block, add: `Diagram link: https://...` (Mermaid Live, FigJam, and so on).

If you use Mermaid in the checkpoint body, still include **Diagram link** so Jay can open the full chart (Slack only shows text).

## Related links

| Item | URL |
|------|-----|
| Handoff doc | https://github.com/.../blob/.../SESSION.md |
| Issue | https://github.com/.../issues/N |

## Changes Shipped

| Area | Change |
|------|--------|
| ... | ... |

## Key Findings

- **Finding:** ...

## Remaining Issues

| Area | Issue | Severity |
|------|-------|----------|
| ... | ... | P1 |

## Next Steps

1. ...
```

The script also recognizes **`## Stakeholder summary`** as an alias for **`## For Jay`**. Keep wording readable in Slack (no emojis in source markdown).
