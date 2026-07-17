---
description: "Run forensic doc inventory after WARDEN/supabase/plugin changes. MP-WG-006."
---
<!-- GENERATED FROM maximus-ai/.github/prompts/MP-WG-006-doc-forensic-inventory.prompt.md -- do not edit; run sync-agents.mts -->

# MP-WG-006 — Forensic Doc Inventory (Multi-Surface)

## TASK ASSIGNMENT — prime-forensic-audit plugin + doc drift pass

### Blast Radius
- Files: `documentation-standards/skills/`, `docs/WARDEN-ARCHITECTURE.md`, ATB warden surfaces
- Risk: **low** (read-only inventory; writes are explicit follow-up PRs)
- RLS risk: **none**

### Forge Routing
- Tool: **Cursor**
- Agent: **583** (WARDEN) + **doc-forensic-auditor**
- Skills: `doc-forensic-inventory`, `warden`, `malfig-ship`, `forecast-scrutiny`

### Spec
- `skills/doc-forensic-inventory/SKILL.md`
- `templates/plugins/prime-forensic-audit/manifest.json`
- `docs/WARDEN-ARCHITECTURE.md` (implementation guide)

## Steps
1. Read change anchor (PR #17 / `warden-supabase.mts` / migration version).
2. Run forecast-scrutiny — grep-only unless user approves edits.
3. Run WARDEN `--domain supabase` on ATB.
4. Produce P1–P4 inventory table.
5. Pack plugin: `npx tsx scripts/pack-prime-plugin.mts --plugin=prime-forensic-audit`
6. malfig-ship doc PR on DS `master`.

## Acceptance criteria
- [ ] `prime-forensic-audit` manifest + plugin.json committed
- [ ] `skills/warden/SKILL.md` lists supabase domain as shipped (opt-in)
- [ ] `docs/WARDEN-ARCHITECTURE.md` matches `warden-supabase.mts` behavior
- [ ] WARDEN supabase verdict SHIP on ATB after migration work
- [ ] Storage advisors WARN resolved (migration 130) — forecast-scrutiny documented
