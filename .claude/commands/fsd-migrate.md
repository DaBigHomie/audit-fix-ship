<!-- GENERATED FROM maximus-ai/.claude/commands/fsd-migrate.md -- do not edit; run sync-commands.mts -->
# /fsd-migrate — FSD Service Layer Migration

**Model:** claude-sonnet (worktree isolation recommended)  
**CORTEX tasks:** `task_atb_fsd_p1f_caro_direct_db`, `task_atb_fsd_p2_venue_split`, `task_atb_fsd_p2_admin_subslice`

Move direct-DB calls out of routes into a service layer. The venues domain split is already partially complete on `main` — see reconciliation note in Step 3.

---

## Pre-flight: baseline violations

```bash
npx tsx scripts/schema-guard.mts 2>&1 | tee /tmp/fsd-baseline.txt
npx tsx scripts/fsd-audit.mts 2>&1 | tee /tmp/fsd-audit.txt
```

## Step 1 — Identify direct-DB calls in routes

```bash
# Find direct supabase calls in routes (violation: routes must only call services)
grep -rn "from(T\.\|supabase\.from\|\.select(\|\.insert(\|\.update(\|\.delete(" \
  apps/api/src/routes/ apps/api/src/controllers/ \
  --include="*.ts" | grep -v ".service.ts" | head -40
```

## Step 2 — Service layer pattern

For each domain, the migration pattern is:

```
apps/api/src/routes/foo.routes.ts
  → calls apps/api/src/services/foo.service.ts
    → calls lib/supabase (ONLY location with direct DB access)
```

No `from(T.*)` or `.select()` calls anywhere in routes or controllers.

## Step 3 — Venues domain: reconcile with what's already on main

The venues controller split is **partially complete**. Actual path: `apps/api/src/routes/venues/` (not `apps/api/src/controllers/`).

**Already split on `main`:**

| File | Status |
|------|--------|
| `venues/availability.controller.ts` | ✅ Done |
| `venues/collections.controller.ts` | ✅ Done |
| `venues/dj.controller.ts` | ✅ Done |
| `venues/favorites.controller.ts` | ✅ Done |
| `venues/reviews.controller.ts` | ✅ Done |
| `venues/seating.controller.ts` | ✅ Done |
| `venues/venues.controller.ts` | Remaining — CRUD + search + admin ops |

**Remaining work for `task_atb_fsd_p2_venue_split`:**
Split `apps/api/src/routes/venues/venues.controller.ts` into:
- `venues.search.ts` — search/filter/geo queries
- `venues.admin.ts` — tenant CRUD, status updates
- `venues.media.ts` — image upload, Cloudflare Worker integration

The `venues.controller.ts` is the CRUD/admin residual after the earlier splits. Confirm line count before starting:

```bash
wc -l apps/api/src/routes/venues/venues.controller.ts
```

## Step 4 — Pre-commit gates

```bash
npx tsc --noEmit
pnpm lint
pnpm build:api
```

All must pass before committing.

## Step 5 — Checkpoint

Update `.cortex-handoff/atb-project-dashboard-kb.json` — set `status: "complete"` on:
- `task_atb_fsd_p1f_caro_direct_db`
- `task_atb_fsd_p2_venue_split`
- `task_atb_fsd_p2_admin_subslice`
