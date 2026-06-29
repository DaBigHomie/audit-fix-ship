# RECONCILIATION — 043 Wave 14

**Date:** 2026-04-28
**Sources reconciled:** Wave 14 handoff · Supabase audit (this session) · live repo state on `main` (commit `f4550ee`)

---

## ✅ Confirmed (assumptions held)

| Assumption | Verified by |
|---|---|
| Next.js 15 + App Router | `package.json` next@15.x · `app/` exists, no `pages/` |
| Path alias `@/lib/*` → `./lib/*` (root, NOT `src/lib`) | `tsconfig.json` lines: `"@/*":["./src/*"]`, `"@/lib/*":["./lib/*"]` |
| Supabase project ref `bgqjgpvzokonkyiljasj` | `lib/supabase/*.ts` + `.env.local` |
| 30 migrations applied · 0 `.skip` files · latest `20260427000001_admin_bug_fixes.sql` | `ls supabase/migrations/` |
| RLS coverage complete — 37 ENABLE RLS / 37 CREATE TABLE / 100 CREATE POLICY | `grep` over `supabase/migrations/` |
| Service role key only in `src/shared/lib/env.ts` zod schema + 3 server-only API routes | `grep -rn SERVICE_ROLE src/` |
| No SQL injection vectors (no `.from(\`)`, no `.eq(\`)`, no `exec_sql` in client) | `grep` clean |
| UGWTF deploys 6 workflows, 79+ universal labels + 8 043-specific | `.github/workflows/` listing |

## ⚠️ Drift discovered (NEW — needs PRs)

| # | Drift | Evidence | Fix → PR |
|---|---|---|---|
| D1 | **Two type files exist with different schemas** | `src/lib/supabase/types.ts` = 39 Rows, Apr 27 (CI-regenerated) vs `src/shared/types/database.ts` = 37 Rows, Apr 25 (manual, stale) | W14-01 |
| D2 | **Duplicate Supabase client wrappers in two locations** | `src/shared/lib/supabase-{browser,server}.ts` (3 callers) duplicate canonical `lib/supabase/{client,server}.ts` (75+ callers) | W14-02 |
| D3 | **No written contract on which client to import where** | Only convention is implied by import counts; future agents will recreate duplicates | W14-03 |
| D4 | **`scripts/supabase-type-sync.mts` references both type paths** | Lines 25, 71, 77, 91, 111 still expect `src/shared/types/database.ts` to exist | Folded into W14-01 |
| D5 | **Wave 14 image-registry remix not started** | `docs/audits/IMAGE-REGISTRY.md` still pre-Wave-14 framing; `scripts/audit-product-images.mts` still hardcoded 6-product scope | W14-04 → W14-22 (whole 7-phase plan) |
| D6 | **Annotation patch unstaged on Wave 12 leftover branch** | `docs/active/jsr-rescue-handoff/wave14-annotations.patch` (26KB) preserved on main, but source worktree `copilot-audit-blast-radius-fix-plan` is on `copilot/admin-bugs-1198-1206-fixes` | Treat patch as spec, not as `git apply` target (per handoff) |
| D7 | **3 direct `@supabase/supabase-js` imports** | All `import type` only (Session, User, SupabaseClient types) — currently safe but easy to misuse | Codified in W14-03 |

## 🚫 Stop-and-pivot decisions

None. Wave 14 plan in handoff is intact; this audit ADDS a 3-issue Supabase cleanup track (B1/B2/B3 → W14-01/02/03) that should land **before** Phase 1 schema work to prevent compounding drift.

## Conventions confirmed

- Branch: `copilot/wave14-{slug}`
- Worktree per PR: `git worktree add ../one4three-co-next-app.worktrees/wave14-{slug} -b copilot/wave14-{slug} origin/main`
- Pre-commit: `npx tsc --noEmit` · `npm run lint` · `npm run build`
- Migration apply: `node scripts/apply-migration-via-rest.cjs <file>`
- Backup before destructive migration: `npx tsx scripts/backup-supabase-state.mts <scope>`
