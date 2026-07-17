---
name: doc-forensic-inventory
description: >-
  Forensic doc update inventory after code/infra changes. Cross-walks WARDEN
  domains, skills, agents, scripts, and docs for stale references. Use after
  shipping WARDEN supabase, migration closeout, or plugin changes. Triggers:
  doc inventory, forensic pass, stale docs, what docs need updating, doc drift.
disable-model-invocation: true
---

# doc-forensic-inventory

Find **every doc/skill/rule/command surface** that must change when implementation
shifts but prose lags. Complements WARDEN `doc-place` (format/placement) with
**semantic drift** detection.

**Plugin:** `prime-forensic-audit` · **Agent:** CORTEX 583 + doc-forensic-auditor

## Pre-flight (mandatory)

1. **forecast-scrutiny** — scope to read-only grep/read; no prod writes unless explicit.
2. **repo-sync-guard** — confirm repo + branch; note dirty tree.
3. Identify the **change anchor** (merged PR SHA, script path, migration version).

## Phase 1 — Trace implementation SSOT

Read the actual shipped code (never forecast from names):

| SSOT | Typical path |
|------|----------------|
| WARDEN domain | `documentation-standards/scripts/warden-*.mts` |
| Repo gate | `{repo}/scripts/schema-guard.mts`, `migration-gate.mts` |
| Skill hub | `documentation-standards/skills/{name}/SKILL.md` |
| Implementation guide | `documentation-standards/docs/WARDEN-ARCHITECTURE.md` |
| Full spec index | `maximus-ai/docs/WARDEN-ARCHITECTURE.md` |
| ATB Supabase closeout | `{repo}/.agents/skills/supabase/SKILL.md` |

Extract: **what changed**, **new commands**, **new findings categories**, **what is N/A**.

## Phase 2 — Forensic grep (cross-repo)

Run from `management-git` root (adjust slug):

```bash
# Stale "not shipped" / old one-liner descriptions
rg -l "not shipped|schema-guard only|Wraps.*schema-guard" \
  documentation-standards maximus-ai atl-table-booking-app \
  --glob '*.md' --glob '*.mdc' --glob 'SKILL.md'

# Domain CLI usage
rg -l "warden-supabase|domain supabase|migration-gate|advisors stamp" \
  documentation-standards maximus-ai atl-table-booking-app \
  --glob '*.{md,mdc,mdx}'

# Command/surface parity
rg -l "/warden|/malfig-ship|/forecast-scrutiny|/scrutinize" \
  documentation-standards atl-table-booking-app \
  --glob '*.{md,mdc,md}'
```

## Phase 3 — WARDEN validation

```bash
cd documentation-standards
npx tsx scripts/warden.mts --repo atl-table-booking-app --domain supabase
npx tsx scripts/warden.mts --repo atl-table-booking-app --domain doc-place
```

Fix blockers before closing inventory.

## Phase 4 — Build inventory table

Output **priority-ordered** rows:

| P | File | Gap | Action |
|---|------|-----|--------|
| P1 | path | stale vs SSOT | edit / sync-skills / pack plugin |

**P1** — wrong behavior documented (blocks operators).  
**P2** — index/spec cross-links missing.  
**P3** — AGENTS.md / runbook mentions.  
**P4** — optional reference tables.

## Phase 5 — Remediate + sync surfaces

**Lane A:** `sync-skills.mts` (hub → `.cursor/skills/` + `.gemini/skills/` on T1 repos).  
**Lane B:** update `.claude/commands`, `.cursor/rules`, `.github/instructions`, `.agents/skills/` per `ide-capability-manifest.json`.

```bash
cd documentation-standards
npx tsx scripts/sync-skills.mts --dry-run --tier=T1
npx tsx scripts/sync-skills.mts --tier=T1
# Then align lane B trigger files per manifest impl paths
```

Update multi-surface commands if domain list changed:
- `atl-table-booking-app/.claude/commands/warden.md`
- `atl-table-booking-app/.cursor/rules/warden.mdc`
- `atl-table-booking-app/.github/instructions/warden.instructions.md`

## Phase 6 — malfig-ship doc PR

Branch (not bare push to main). Gates: WARDEN SHIP on touched product repo if applicable.
Docs-only DS changes: WARDEN doc-place + script smoke (`tsx --help` / dry-run).

## Pairs with

`/warden`, `/malfig-ship`, `/forecast-scrutiny`, `/scrutinize`, `repo-sync-guard`,
`sync-skills.mts`, `pack-prime-plugin.mts`

## Worked example (2026-06-21 — WARDEN supabase extension)

**Anchor:** PR #17 merged `warden-supabase.mts` — migration-gate + advisors stamp.

**P1 gaps found:**
- `docs/WARDEN-ARCHITECTURE.md` — "schema-guard only"
- `skills/warden/SKILL.md` — supabase listed "not shipped"

**P2 gaps:**
- `maximus-ai/docs/WARDEN-ARCHITECTURE.md` — script index
- `MULTI-SURFACE-CAPABILITY-DEPLOYMENT.md` — `/warden` example

**Storage WARN (forecast-scrutiny):** migration 130 drops redundant SELECT on public bucket;
public URL reads unchanged; advisors WARN cleared.
