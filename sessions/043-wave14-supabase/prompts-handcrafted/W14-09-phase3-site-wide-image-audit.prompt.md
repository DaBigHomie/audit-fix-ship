---
agent: agent
description: "W14-09: Phase 3 — rewrite scripts/audit-product-images.mts as a CI-blocking site-wide audit"
---

# W14-09: Phase 3 — site-wide audit script rewrite

**Priority**: P0
**Status**: ⏳ NOT STARTED
**Estimated Time**: 75 min
**Revenue Impact**: Low (tooling) · **Drift cost: HIGH** if shipped without
**Dependencies**: W14-04 (uses inventory report as ground truth), W14-05 (`media_library` table exists)
**Tags**: `type:refactor`, `scope:ci`, `priority:p0`, `prompt-spec`, `scripts`

---

## Agent Bootstrap

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/typescript.instructions.md`
- `.github/instructions/supabase.instructions.md`
- `.github/instructions/doc-standards.instructions.md`
- `docs/audits/wave14-image-inventory-2026-04-28.md` (produced by W14-04 — ground truth)

---

## Objective

Replace `scripts/audit-product-images.mts` (currently scoped to product images only) with a **site-wide image audit** that scans:

- All `products.image_url` / `gallery` for non-Supabase origins
- All `**/*.{ts,tsx,mts,js}` source files for hardcoded `/images/...` strings
- All `media_library` rows for orphaned bucket references (file in DB but missing from Storage)
- All Supabase Storage objects orphaned from `media_library`

Severity per stakeholder Q3: **hard-error in CI, warn locally**.

```ts
const isCI = process.env.CI === 'true';
if (violations.length > 0) {
  console[isCI ? 'error' : 'warn'](formatReport(violations));
  if (isCI) process.exit(1);
}
```

---

## Stakeholder Decisions Already Made

| # | Decision |
|---|---|
| Q3 | **Hard-error in CI, warn locally** (`process.env.CI === 'true'` → `exit 1`) |
| Q5 | Brand-chrome list (see W14-04) is exempt from violations |
| Q7 | `media_library` is the source of truth |

---

## Pre-Flight Check

```bash
cd /Users/dame/management-git/one4three-co-next-app
git branch --show-current        # MUST be: copilot/wave14-phase3-audit-script
ls scripts/audit-product-images.mts                                # exists today
ls docs/audits/wave14-image-inventory-2026-04-28.md               # W14-04 must be merged
psql -c "select count(*) from media_library;" 2>/dev/null || echo "W14-05 not yet merged — run AFTER"
```

---

## Files to Modify/Create

| File | Action | Exists | Purpose |
|---|---|---|---|
| `scripts/audit-product-images.mts` | Rewrite | ✅ | Renamed in spirit to "site-wide image audit"; preserves the CLI entry point so CI workflows don't break |
| `.github/workflows/ci.yml` | Edit | ✅ | Add `npx tsx scripts/audit-product-images.mts` step (CI-blocking) |

---

## Implementation Approach

```ts
// scripts/audit-product-images.mts (rewrite)
import { createClient } from '@supabase/supabase-js';
import { glob } from 'glob';
import fs from 'node:fs/promises';

const BRAND_CHROME = new Set([
  'logo.svg', 'logo-white.svg', 'favicon.ico',
  'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png',
  'og-default.png', 'og-default-square.png', 'twitter-card.png',
  'manifest-icon-192.png', 'manifest-icon-512.png',
]);

type Violation = {
  category: 'product' | 'source' | 'orphan-db' | 'orphan-storage';
  detail: string;
  file?: string;
  line?: number;
};

async function auditProductImages(supabase): Promise<Violation[]> { /* ... */ }
async function auditSourceFiles(): Promise<Violation[]> { /* glob + grep */ }
async function auditOrphanDbRows(supabase): Promise<Violation[]> { /* media_library left-join storage */ }
async function auditOrphanStorageObjects(supabase): Promise<Violation[]> { /* storage left-join media_library */ }

async function main() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const violations = [
    ...await auditProductImages(supabase),
    ...await auditSourceFiles(),
    ...await auditOrphanDbRows(supabase),
    ...await auditOrphanStorageObjects(supabase),
  ];
  const isCI = process.env.CI === 'true';
  if (violations.length > 0) {
    console[isCI ? 'error' : 'warn'](formatReport(violations));
    if (isCI) process.exit(1);
  }
}
```

CI step (added near the existing test job):

```yaml
- name: Image audit (site-wide, blocking)
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL_043 }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_043 }}
  run: npx tsx scripts/audit-product-images.mts
```

---

## Blast Radius

```bash
# Find every CI workflow currently invoking the script
grep -rn 'audit-product-images' .github/workflows/

# Confirm the rewrite still accepts the same CLI args (or document new ones in PR body)
grep -n 'process\.argv' scripts/audit-product-images.mts
```

---

## Validation Gates

```bash
npx tsc --noEmit                                                   # 0 errors
npm run lint                                                       # 0 errors
CI=false npx tsx scripts/audit-product-images.mts || true          # warns, exit 0
CI=true  npx tsx scripts/audit-product-images.mts ; echo "exit=$?" # hard-errors with violations
```

---

## Acceptance Criteria

1. Script runs all 4 audit categories above
2. `CI=true` + violations → `exit 1`
3. `CI=false` + violations → `exit 0` with `console.warn`
4. Brand-chrome list exempt
5. CI workflow step added; gates merge of any PR that introduces a new local-image reference
6. Script reads `SUPABASE_URL_043` / `SUPABASE_SERVICE_ROLE_KEY_043` secrets (per UGWTF naming)

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml` (this PR adds the gate)
**PR Validation**: `copilot-pr-validate.yml`
**Chain Advance**: blocks Phase 4 swarm merges (W14-10..W14-21) — once landed, swarm PRs that re-introduce local refs will fail CI

---

## PR Body Template

```
## Summary
Rewrite scripts/audit-product-images.mts as a site-wide blocking image audit (4 categories). Add CI step.

## Audit categories
1. products.image_url / gallery non-canonical origins
2. Hardcoded /images/... strings in source
3. media_library rows orphaned from Storage
4. Storage objects orphaned from media_library

## Severity
- CI=true → exit 1 (blocks merge)
- CI=false → console.warn (dev-friendly)

## Validation
- TypeScript: 0 errors
- Lint: 0 errors
- CI=true with synthetic violation → exit 1 ✓
- CI=false with synthetic violation → exit 0 + warn ✓

Closes #<issue>
```
