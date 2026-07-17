---
applyTo: "**/docs/**,**/skills/**,**/*WARDEN*,**/*warden*"
---
<!-- GENERATED FROM maximus-ai/.github/instructions/doc-forensic-inventory.instructions.md -- do not edit; run sync-instructions.mts -->

# doc-forensic-inventory — Antigravity

After WARDEN, migration, or plugin changes, run a **forensic doc inventory** before closing the session.

## SSOT

- Skill: `documentation-standards/skills/doc-forensic-inventory/SKILL.md`
- Plugin manifest: `documentation-standards/templates/plugins/prime-forensic-audit/manifest.json`
- Agent: `documentation-standards/.github/agents/doc-forensic-auditor.agent.md`

## Commands

```bash
cd documentation-standards
npx tsx scripts/warden.mts --repo atl-table-booking-app --domain supabase
npx tsx scripts/sync-skills.mts --dry-run
npx tsx scripts/pack-prime-plugin.mts --plugin=prime-forensic-audit --dry-run
```

## Output

Priority table (P1–P4) listing files with stale prose vs shipped scripts.
