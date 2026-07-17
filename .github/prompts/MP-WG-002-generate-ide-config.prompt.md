---
description: "Implement generate-ide-config.mts — multi-surface MCP/config from repo-infra-registry.json (closes GAP-MCP-01). Use when implementing MP-WG-002."
argument-hint: "Repo slug e.g. atl-table-booking-app"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/MP-WG-002-generate-ide-config.prompt.md -- do not edit; run sync-agents.mts -->

# MP-WG-002 — Multi-Surface IDE Config Generator

## TASK ASSIGNMENT — generate-ide-config.mts (5 surfaces)

### Blast Radius
- Files: `documentation-standards/scripts/generate-ide-config.mts`, `workspace-rules/repo-infra-registry.json`, `{repo}/.cursor/mcp.json`, `{repo}/.mcp.json`, `{repo}/.vscode/mcp.json`
- Repos: documentation-standards + each T1 repo on rollout
- Risk: **medium**
- RLS risk: **none**
- PRIME intake: **deferred** (pre-#106 merge) — document intent in PR body

### Forge Routing
- Tool: **Cursor** (scaffold) → **Claude Code** (parity validation)
- Swarm: **C**
- Rationale: Cross-surface config; must pass `ide-parity-audit.mts`

### MAXIMUS AI Assignment
- Agent: **124** — DevOps & Edge (CI/CD, secrets)
- Reviewer: **SA-PARITY** — `convention-drift` agent
- Model: **claude-sonnet-4-6**

### Spec SSOT
- `documentation-standards/docs/MAXIMUS-PRIME-WORKSPACE-GOVERNANCE-SOLUTION.md` §3.1, §5
- `documentation-standards/docs/MULTI-SURFACE-CAPABILITY-DEPLOYMENT.md`
- `maximus-ai/docs/CORTEX-50X-SOLUTION.md` GAP-MCP-01
- Parent epic: [maximus-ai#105](https://github.com/DaBigHomie/maximus-ai/issues/105)

## Implementation steps

1. Extend `generate-cursor-config.mts` → `generate-ide-config.mts` with `--surface=cursor|claude-code|vscode|all`.
2. Emit Claude Code root `.mcp.json` mirroring ATB `cortex/ide-capability-manifest.json` exception list (prime-gate, supabase-{alias}, etc.).
3. Emit `.vscode/mcp.json` (CORTEX-ENV-03) with portable paths — no `/Users/...`.
4. Register new capability `mcp:repo-infra` in `{repo}/cortex/ide-capability-manifest.json` with `parity: "parity"` or documented `exception` per surface.
5. Dry-run all T1 repos: `npx tsx scripts/generate-ide-config.mts --all --tier=T1 --dry-run`.
6. Run `npx tsx scripts/cortex/ide-parity-audit.mts` on ATB (reference repo).

## Acceptance criteria
- [ ] All T1 repos get consistent Supabase project-ref per registry entry
- [ ] CORTEX ref (`eccpracfbrocmkzuogec`) never mixed with app refs
- [ ] ide-parity-audit passes on ATB
- [ ] WARDEN doc-place SHIP on changed docs

## Guardrails
- No secrets in committed JSON — env var refs only
- Do not commit `.system/warden/` artifacts
