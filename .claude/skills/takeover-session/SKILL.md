---
name: takeover-session
description: >-
  Ingests a prior session's artifacts, creates a forensic branch, and maps intention/logic
  from session logs. Use when taking over another agent's session, forensically inspecting
  a session id, or recovering state.
---

# Session Takeover Protocol (`/takeover <session_id>`)

1. **Locate Artifacts:** Read session artifacts from the scratchpad or operator-provided artifact directory.
2. **Preserve:** Create branch `forensic/sess-<session_id>` in the active repo, copy artifacts to `.system/handoff/sessions/<session_id>/`, and commit.
3. **Analyze:** Parse session logs to map control flow, MCP bottlenecks, and learned logic.
4. **Register:** Document the takeover (CORTEX DB integration is not available in Claude surface — run manually if CORTEX DB is present).

## Execution Commands

```bash
# Branch & preserve
git switch -c forensic/sess-<session_id>
# Confirm no active session exists on this branch before creating.
mkdir -p .system/handoff/sessions/<session_id>
cp <SESSION_ARTIFACT_DIR>/*.md .system/handoff/sessions/<session_id>/
git add .system/handoff/sessions/<session_id>/
git commit -m "chore(forensic): preserve artifacts for session <session_id>"
```

**Note on artifact directories:**
- `<SESSION_ARTIFACT_DIR>` is a placeholder — replace with the actual path where session artifacts are stored (Claude scratchpad, operator-provided location, or equivalent).
- Antigravity-specific paths like `~/.gemini/antigravity/brain/<session_id>/` do not exist in Claude; adapt to your artifact storage location.

**CORTEX DB Update:**
<!-- CORTEX-UPDATE: not available in Claude surface — run manually if CORTEX DB is present -->

If you have access to CORTEX DB, manually insert the following record after committing:
```sql
INSERT OR REPLACE INTO knowledge (key, value, repo, updated_at)
VALUES (
  'handoff:<repo>:sess_<session_id>',
  '{"session_id":"<session_id>","summary":"Forensic takeover complete.","branch":"forensic/sess-<session_id>"}',
  '<repo>',
  datetime('now')
);
```
