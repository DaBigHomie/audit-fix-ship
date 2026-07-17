<!-- GENERATED FROM maximus-ai/skills/warden/reference.md -- do not edit; run sync-skills.mts -->
# WARDEN reference — DOC-PLACEMENT policy

From `maximus-ai/docs/WARDEN-ARCHITECTURE.md` sec 4.

| Doc kind | Location | Naming |
|----------|----------|--------|
| Architecture | `{repo}/docs/<SYSTEM>-ARCHITECTURE.md` | `-ARCHITECTURE` |
| Technical Solution | `{repo}/docs/<SYSTEM>-SOLUTION.md` | `-SOLUTION` |
| Spec | `{repo}/docs/<SYSTEM>-SPEC.md` | `-SPEC` |
| Cross-repo governance | `documentation-standards/docs/<NAME>.md` | same tokens |
| Session/handoff | `{repo}/docs/handoff/` or `checkpoints/` | `YYYY-MM-DD_slug.md` |

**Blockers:** `*SOLUTION-ARCHITECTURE*`, `*TSA*`, `*TECHNICAL-SOLUTION-ARCHITECTURE*`

**Major:** docs under `docs/agent-docs/`, `docs/maximus-prime/`, `docs/reference/`; duplicate bodies

**Minor:** missing `## Change Log` at bottom

## Supabase domain findings (`--domain supabase`)

| Category | Severity | Meaning |
|----------|----------|---------|
| `schema-guard-fail` | blocker | Raw `.from()` / banned columns in ATB |
| `migration-gate-fail` | blocker | Changed migration SQL / types / schema.ts drift |
| `advisors-stamp-missing` | major | Storage migration without `supabase/advisors/<version>.json` |
| `migration-closeout-public` | minor | Public DDL — remind `pnpm gen:types` |
| `migration-closeout-storage` | minor | Storage-only — types N/A |

Run after migration plans; pair with **forecast-scrutiny** before apply.
