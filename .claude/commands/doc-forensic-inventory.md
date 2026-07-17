# /doc-forensic-inventory — Forensic doc update inventory

**Hub skill:** `documentation-standards/skills/doc-forensic-inventory/SKILL.md`  
**Agent:** `doc-forensic-auditor` · **Pairs with:** `/warden`, `sync-skills.mts`

Find every doc/skill/rule/command surface that must change when implementation shifts but prose lags.

---

## Usage

```bash
cd ../documentation-standards
npx tsx scripts/warden.mts --repo atl-table-booking-app --domain supabase
npx tsx scripts/sync-skills.mts --dry-run --tier=T1
```

## Workflow (summary)

1. **forecast-scrutiny** — read-only grep scope unless user approves writes.
2. Read change anchor (PR SHA, script, migration version).
3. Forensic `rg` for stale references vs SSOT.
4. Output P1–P4 inventory table.
5. **Lane A:** `sync-skills.mts --tier=T1`
6. **Lane B:** align manifest `impl` paths (this command, rules, instructions, agents skill).

## Output format

Priority table (P1–P4) + WARDEN verdict + remediation commands.
