---
description: "Wire WARDEN doc-place into .githooks/pre-commit across T1 repos. Use when implementing MP-WG-004."
---

# MP-WG-004 — WARDEN Pre-Commit (Multi-Surface)

## TASK ASSIGNMENT — warden-pre-commit.mts rollout

### Blast Radius
- Files: `{repo}/.githooks/pre-commit`, `documentation-standards/scripts/warden-pre-commit.mts`
- Risk: **low**
- RLS risk: **none**

### Forge Routing
- Tool: **Cursor**
- Agent: **583** (WARDEN) + **124** (hooks)
- Swarm: **C**

### Spec
- `maximus-ai/docs/WARDEN-ARCHITECTURE.md` phase 7
- `MAXIMUS-PRIME-WORKSPACE-GOVERNANCE-SOLUTION.md` §6
- **Do NOT** duplicate schema-guard in WARDEN pre-commit

## Steps
1. Verify `warden-pre-commit.mts` detects repo slug via `.repo-root.json`.
2. Append hook fragment via `bootstrap-maximus-repos.mts --warden` on ATB first.
3. Document in each repo's AGENTS.md pre-commit section (agent-context surface).
4. Register `/warden` pre-commit behavior in `ide-capability-manifest.json` if hook is considered a capability surface.

## Acceptance criteria
- [ ] Staged `docs/*.md` with banned filename → commit blocked (REWORK)
- [ ] Staged code-only commit → WARDEN hook skipped (fast path)
- [ ] Deferred JSON written to `.system/warden/`
