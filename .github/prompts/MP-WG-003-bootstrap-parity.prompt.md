---
description: "Bootstrap Maximus Prime governance to T1 repos with multi-surface parity audit gate. Use when implementing MP-WG-003."
argument-hint: "Tier e.g. T1"
---

# MP-WG-003 — Bootstrap + IDE Parity Gate

## TASK ASSIGNMENT — bootstrap-maximus-repos.mts hardening

### Blast Radius
- Files: `documentation-standards/scripts/bootstrap-maximus-repos.mts`, `sync-skills.mts`, `sync-agents.mts`, 12+ sibling repos' `.cursor/`, `.gemini/`, `.github/instructions/`, `.agents/`
- Repos: all `sync-agents.mts` REPOS where tier=T1
- Risk: **high** (cross-repo)
- PRIME intake: deferred until #106 merges

### Forge Routing
- Tool: **Antigravity** (multi-repo batch) or **Cursor BG** per repo
- Agent: **181** orchestrator + **SA-CURSOR**, **SA-CLAUDE**, **SA-GEMINI**, **SA-MAC** lanes (parallel)
- Model: **claude-haiku-4-5** per repo; **opus** for SA-GOV review

### Spec SSOT
- `MAXIMUS-PRIME-WORKSPACE-GOVERNANCE-SOLUTION.md` §7
- `MULTI-SURFACE-CAPABILITY-DEPLOYMENT.md` Scenario E
- [maximus-ai#105](https://github.com/DaBigHomie/maximus-ai/issues/105) TASK-PRIME-IDE-SURFACE-001 lanes

## Implementation steps

1. Add `--parity` flag to bootstrap: after sync, run `ide-parity-audit.mts` if `{repo}/cortex/ide-capability-manifest.json` exists.
2. Copy or symlink parity audit script to `documentation-standards/scripts/` OR invoke ATB script via relative path (document chosen approach in PR).
3. Run: `npx tsx scripts/bootstrap-maximus-repos.mts --tier=T1 --all --dry-run` then without dry-run on **one** pilot repo (`documentation-standards`).
4. For each T1 repo: ensure `sync-skills.mts` populated `.cursor/skills/` AND `.gemini/skills/` AND `.agents/skills/` for warden, malfig-ship, multi-model-task-assignment.
5. Wire WARDEN pre-commit only where `.githooks/pre-commit` exists (`--warden`).

## Acceptance criteria
- [ ] Pilot repo parity audit PASS
- [ ] No machine-specific paths in generated configs
- [ ] Issue comment on #105 with bootstrap report JSON
