---
description: "Execute PRIME-PLUGIN-50X-DEPLOYMENT-PLAN waves 0–6 with IDE surface agent lanes. Use for issue MP-WG-005."
---
<!-- GENERATED FROM maximus-ai/.github/prompts/MP-WG-005-plugin-50x-deploy.prompt.md -- do not edit; run sync-agents.mts -->

# MP-WG-005 — Prime Plugin 50x Deployment

## TASK ASSIGNMENT — Full plugin program (waves 0–6)

### Blast Radius
- Files: `templates/plugins/**`, `maximus-ai/.system/plugins/**`, all T1 `.cursor/`, `.gemini/`, `.agents/`, MCP configs
- Repos: documentation-standards, maximus-ai, all T1 MALFIG repos
- Risk: **high** (cross-repo, cross-surface)
- RLS risk: **none**
- PRIME intake: **deferred** until [maximus-ai#106](https://github.com/DaBigHomie/maximus-ai/issues/106) merges

### Forge Routing
- **Wave 0–1:** Cursor BG | Swarm B | Model haiku
- **Wave 2, 6:** Antigravity batch | Swarm GOV | Model sonnet
- **Wave 3–4:** Claude Code | Swarm C | Agent 124
- **Wave 5:** Claude for Mac (interactive) | Agent 350 sign-off

### MAXIMUS AI — Parallel lanes (spawn together)
| Lane | Agent | Wave |
|------|-------|------|
| SA-CURSOR | codebase-explorer | 1, 2, 5 |
| SA-CLAUDE | copilot-debugger | 0, 2 |
| SA-GEMINI | session-cleanup | 1, 2 |
| SA-MAC | agent-instructions | 1, 5 |
| SA-PARITY | convention-drift | 2, 3, 6 |
| SA-GOV | malfig-gatekeeper | all |

### Plugin bundles to pack
1. **prime-governance** — warden, malfig-ship, scrutinize, multi-model-task-assignment, exit
2. **prime-session** — prime-gate MCP, session hooks, exit
3. **git-hygiene** — already shipped (refresh only)
4. **prime-infra** — generated per repo (Plugin C, issue #12)

## Commands (run in order)

```bash
cd ~/management-git/documentation-standards

# Preview entire program
npx tsx scripts/deploy-prime-plugins-50x.mts --dry-run --wave=all

# Wave by wave
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=0
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=1
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=2
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=3 --tier=T1
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=4
# Wave 5 — manual (see plan §7)
npx tsx scripts/deploy-prime-plugins-50x.mts --wave=6 --tier=T1
```

## Acceptance
- [ ] `maximus-ai/.system/plugins/prime-governance/` exists with 5 skills + agent
- [ ] `marketplace.json` lists prime-governance + prime-session + git-hygiene
- [ ] T1 parity audit PASS on ATB
- [ ] Report JSON attached to this issue + comment on maximus-ai#105

## SSOT
`docs/PRIME-PLUGIN-50X-DEPLOYMENT-PLAN.md`
