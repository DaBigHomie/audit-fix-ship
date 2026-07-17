# /wire-admin — Wire Admin Live API

**Model:** claude-sonnet  
**CORTEX tasks:** `task_atb_wire_admin_ops_live_fetch`

Replace hardcoded seed data in the admin app with live API calls to `api.caro.damieus.app`.

---

## Step 1 — Find hardcoded data

```bash
# Locate static arrays and seed fixtures in admin
grep -rn "seed\|SEED\|mockData\|fixtures\|staticData\|\[\s*{" \
  apps/admin/src/ --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules\|\.test\." | head -30
```

## Step 2 — Map views to API endpoints

| Admin view | Live endpoint |
|-----------|--------------|
| Bookings list | `GET /api/bookings?tenant_id={tid}` |
| Orders list | `GET /api/orders?tenant_id={tid}` |
| Platform analytics / KPIs | `GET /admin/analytics/platform` (admin role required) |
| Venue stats | `GET /analytics/venues/:venueId/stats` |
| Venues list | `GET /api/venues?tenant_id={tid}` |
| Users | `GET /api/users` (see `users.ts` route) |

All requests must include `x-tenant-id` header (or `tenant_id` query param per API convention).

## Step 3 — Replace with live fetch

Pattern to apply for each view:

```typescript
// Before: static seed
const bookings = SEED_BOOKINGS;

// After: live fetch with SWR
import useSWR from 'swr';
const fetcher = (url: string) =>
  fetch(url, { headers: { 'x-tenant-id': tenantId } }).then(r => r.json());
const { data: bookings, error, isLoading } = useSWR(
  `/api/bookings?tenant_id=${tenantId}`,
  fetcher
);
```

Every replaced view needs: loading state, error state, empty state.

## Step 4 — Test

```bash
# Start admin dev server
pnpm --filter admin dev

# Verify on mobile width (375px) and dark mode
# Open browser DevTools → toggle device toolbar → 375px
# Check that all views render without console errors
```

## Step 5 — Build check

```bash
pnpm build:admin 2>&1 | tail -20
```

## Checkpoint

Update `.cortex-handoff/three-pillar-status-2026-05-29-kb.json` — set `status: "complete"` on `task_atb_wire_admin_ops_live_fetch`.
