---
agent: agent
description: "W14-02: Consolidate duplicate Supabase client wrappers (src/shared/lib → lib/supabase canonical)"
---

# W14-02: Consolidate Supabase client wrappers

**Priority**: P0
**Status**: ⏳ NOT STARTED
**Estimated Time**: 1 hour
**Revenue Impact**: Low (cleanup) · **Risk: HIGH** — auth/cookie wrapper bypass
**Dependencies**: None (parallelizable with W14-01)
**Tags**: `type:refactor`, `scope:db`, `priority:p0`, `prompt-spec`

---

## Agent Bootstrap

- `.github/copilot-instructions.md`
- `.github/instructions/supabase.instructions.md`
- `.github/instructions/fsd-architecture.instructions.md`
- `.github/instructions/commit-quality.instructions.md`

---

## Objective

Two parallel client-wrapper sets exist:

| Canonical (75+ callers) | Duplicate (3 callers) |
|---|---|
| `lib/supabase/client.ts` | `src/shared/lib/supabase-browser.ts` |
| `lib/supabase/server.ts` | `src/shared/lib/supabase-server.ts` |

Per `tsconfig.json`, `@/lib/*` resolves to `./lib/*` (root) and is the documented canonical path. The 3 stragglers risk:
1. Drifting cookie/auth handling between wrappers
2. Inconsistent SSR behavior
3. Future agents copy-pasting either wrapper, expanding the duplication

---

## Pre-Flight Check

```bash
cd /Users/dame/management-git/one4three-co-next-app
git branch --show-current  # MUST be: copilot/wave14-supabase-dedupe-wrappers

# Diff the wrappers — confirm functional parity before deleting
diff -u lib/supabase/client.ts src/shared/lib/supabase-browser.ts || echo "Files differ — review carefully"
diff -u lib/supabase/server.ts src/shared/lib/supabase-server.ts || echo "Files differ — review carefully"

# Locate the 3 callers
grep -rn "from ['\"]@/shared/lib/supabase-browser['\"]\|from ['\"]@/shared/lib/supabase-server['\"]" src/ --include="*.ts" --include="*.tsx"
```

Expected callers:
- `src/features/admin/components/RealtimeOrderFeed.tsx` — uses `getSupabase` from supabase-browser
- `src/shared/lib/brand-assets.ts` — uses `createServerSupabase` from supabase-server
- `src/shared/lib/analytics.ts` — uses `getSupabase` from supabase-browser

---

## Intended Result

- 3 callers migrated to canonical `@/lib/supabase/{client,server}`
- `src/shared/lib/supabase-browser.ts` and `src/shared/lib/supabase-server.ts` deleted
- Function-name mapping: if duplicate exposed `getSupabase` and canonical exposes `createClient`, refactor callers to canonical name OR add a thin re-export shim ONLY if a caller depends on instance singleton behavior the canonical doesn't provide
- Smoke E2E (`route-health.spec.ts`) still passes

---

## Migration Decision Tree

For each caller:

```
1. Read the duplicate's exported function signature
2. Check the canonical equivalent in lib/supabase/{client,server}.ts
3. If signatures match → swap import path only
4. If duplicate has a singleton getter (`getSupabase()`) and canonical exports
   a factory (`createClient()`) → either:
   a. Refactor the caller to use the factory (preferred), OR
   b. Add a `createBrowserSingleton()` helper to canonical lib/supabase/client.ts
      and migrate all 3 callers + future code
5. Re-test the affected feature path manually if it's user-visible
```

---

## Files to Modify/Create

| File | Action | Purpose |
|---|---|---|
| `src/features/admin/components/RealtimeOrderFeed.tsx` | Edit | Swap import |
| `src/shared/lib/brand-assets.ts` | Edit | Swap import |
| `src/shared/lib/analytics.ts` | Edit | Swap import |
| `src/shared/lib/supabase-browser.ts` | Delete | Duplicate |
| `src/shared/lib/supabase-server.ts` | Delete | Duplicate |
| `lib/supabase/client.ts` | Edit (only if shim needed) | Add singleton helper |

---

## Blast Radius

```bash
# After delete: confirm no lingering references
grep -rn "supabase-browser\|supabase-server" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 hits (only the deleted files would have matched)

# Verify all 75+ canonical callers still resolve
grep -rn "from ['\"]@/lib/supabase" src/ --include="*.ts" --include="*.tsx" | wc -l
```

---

## Validation Gates

```bash
npx tsc --noEmit
npm run lint
npm run build
npx playwright test e2e/specs/route-health.spec.ts e2e/specs/ux-deep-audit.spec.ts
# Manual: load /admin/orders (RealtimeOrderFeed), confirm realtime updates work
# Manual: load any page using brand-assets / analytics, confirm no 500
```

---

## Risk Notes

- `RealtimeOrderFeed` uses Supabase Realtime — if the duplicate had a cached singleton and the canonical creates a new client per call, channel subscriptions could break. Test the realtime subscription end-to-end.
- `brand-assets.ts` is server-side and likely cached — confirm SSR cookie context still passes through.
