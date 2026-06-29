---
agent: agent
description: "W14-04: Phase 0 — read-only Supabase image inventory discovery; produces canonical bucket map for Wave 2"
---

# W14-04: Phase 0 — Supabase image inventory discovery (read-only)

**Priority**: P0
**Status**: ⏳ NOT STARTED
**Estimated Time**: 90 min
**Revenue Impact**: Low (discovery) · **Blocks**: W14-05, W14-09, all Phase 4 swarm
**Dependencies**: W14-01, W14-02 (clean type/client surface)
**Tags**: `type:docs`, `scope:db`, `priority:p0`, `prompt-spec`, `database`

---

## Agent Bootstrap

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `.github/instructions/supabase.instructions.md`
- `.github/instructions/image-import.instructions.md`
- `.github/instructions/commit-quality.instructions.md`
- `docs/active/jsr-rescue-handoff/wave14-handoff-2026-04-28.md`

---

## Objective

Produce the **canonical image inventory** that every later Wave 14 PR depends on. This is **read-only** — no code edits, no schema edits, no data writes. Output is a single Markdown report committed to `docs/audits/wave14-image-inventory-2026-04-28.md`.

The downstream wave assumes a canonical map of:

1. Every Supabase Storage bucket and the count + sample paths it contains
2. Every `public/images/**` asset still referenced by source code
3. Every `products.image_url` / `products.gallery` value pointing at `/images/...` (local) vs Supabase Storage CDN (canonical)
4. Every code reference to a local image path (the Phase 4 swarm's hit list)

Without this report, W14-05 (`media_library` backfill) cannot decide what to backfill, and W14-09 (audit script) has no ground truth to assert against.

---

## Stakeholder Decisions Already Made (use these)

| # | Decision |
|---|---|
| Q2 | **Supabase Storage CDN** is the canonical origin (not Cloudinary, not Vercel `/public`) |
| Q5 | **Brand-chrome exception list** stays in `public/`: `logo.svg`, `logo-white.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `og-default.png`, `og-default-square.png`, `twitter-card.png`, `manifest-icon-192.png`, `manifest-icon-512.png` |
| Q7 | `media_library` will be written by a DB trigger on `storage.objects` (this PR does not implement the trigger; it reports the gap) |

---

## Pre-Flight Check

```bash
cd /Users/dame/management-git/one4three-co-next-app
git branch --show-current        # MUST be: copilot/wave14-phase0-image-inventory
grep -c '^SUPABASE_ACCESS_TOKEN=' .env.local   # MUST be: 1
ls scripts/apply-migration-via-rest.cjs        # confirm migration runner exists
```

---

## Files to Modify/Create

| File | Action | Exists | Purpose |
|---|---|---|---|
| `scripts/wave14-image-inventory.mts` | Create | ❌ | Read-only inventory script (idempotent, re-runnable) |
| `docs/audits/wave14-image-inventory-2026-04-28.md` | Create | ❌ | Generated report (committed) |

**No edits to** `src/`, `lib/`, `supabase/migrations/`, or any production code path.

---

## Implementation Approach

`scripts/wave14-image-inventory.mts` does the following, in order, using `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (read-only queries):

1. **Storage scan**: list all buckets via `supabase.storage.listBuckets()`. For each: list first 100 objects per page, capture `name`, `size`, `updated_at`, `mimetype`. Aggregate count + total bytes per bucket.
2. **DB scan**: `select id, slug, image_url, gallery from products`. Bucketize each URL into `local` (`/images/...` or `public/`), `supabase` (matches storage CDN host), `external` (Printful, etc.), `null`.
3. **Source scan**: `glob` for `**/*.{ts,tsx,mts,js,mjs}` under `src/`, `lib/`, `scripts/`, excluding `node_modules`, `.next`, `dist`. For each match of `/images/[^"' )]+`, capture `{file, line, path}`.
4. **Brand chrome filter**: any path in the Q5 exception list is moved to its own section (expected to stay local).
5. **Output**: write Markdown to `docs/audits/wave14-image-inventory-2026-04-28.md` with sections:
   - Summary counts (buckets, products, source refs)
   - Per-bucket object listing (truncated)
   - Products needing migration (table: id, slug, current image_url, recommended bucket)
   - Source code refs needing migration (table: file, line, path) — this is the **Phase 4 swarm hit list**
   - Brand chrome (expected to stay local)
   - Open gaps (e.g., bucket exists but unused, or referenced bucket missing)

---

## Blast Radius

```bash
# 0 — confirm script touches nothing dangerous
grep -E '\b(insert|update|delete|drop|truncate|alter)\b' scripts/wave14-image-inventory.mts -i
# expect: 0 matches (read-only)

# Verify all output is under docs/ + scripts/
git diff --name-only | grep -vE '^(docs/|scripts/)' && echo "VIOLATION" || echo "OK"
```

---

## Validation Gates

```bash
npx tsc --noEmit                                                   # 0 errors
npm run lint                                                       # 0 errors
npx tsx scripts/wave14-image-inventory.mts                         # produces report
test -f docs/audits/wave14-image-inventory-2026-04-28.md           # exists
wc -l docs/audits/wave14-image-inventory-2026-04-28.md             # > 100 lines
```

---

## Acceptance Criteria

1. `scripts/wave14-image-inventory.mts` exists, is read-only (no `insert/update/delete/drop`)
2. Report exists at `docs/audits/wave14-image-inventory-2026-04-28.md`, committed
3. Report has all 6 sections from "Implementation Approach" step 5
4. Source refs section lists at minimum the 12 files in W14-10..W14-21 (validates the swarm scope)
5. Re-running the script overwrites the report cleanly (idempotent)
6. PR body includes a one-line summary of bucket count, product migration count, source ref count

---

## Workflow & Lifecycle

**CI Validation**: `ci.yml`
**PR Validation**: `copilot-pr-validate.yml`
**Chain Advance**: blocks W14-05 and the entire Phase 4 swarm

---

## PR Body Template

```
## Summary
Phase 0 read-only inventory: catalogs every Supabase bucket, every product image_url, every source-code local-image reference. Report committed to docs/audits/.

## Inventory
- Buckets: <N>
- Products needing migration: <N>
- Source refs needing migration: <N>
- Brand chrome (kept local): <N>

## Validation
- TypeScript: 0 errors
- Lint: 0 errors
- Script: idempotent

Closes #<issue>
```
