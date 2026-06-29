# W14 — Wave 14 Issue Tracker (043 / one4three.co)

**Batch:** W14 (Wave 14: Image Registry Remix + Supabase Cleanup)
**Total issues:** 25
**Last updated:** 2026-04-28

Legend: ⏳ not started · 🔄 in progress · ✅ done · ⛔ blocked · 📋 awaiting answer

---

## Summary by track

| Track | Count | Wave | Goal |
|---|---:|---|---|
| **B — Supabase config cleanup** (NEW from audit) | 3 | 1 | Eliminate type drift + duplicate clients before schema work |
| **A0 — Discovery** | 1 | 1 | Read-only Supabase image inventory |
| **A1 — Schema** | 1 | 2 | Backfill `media_library`, canonical bucket decision |
| **A2 — Doc rewrite** | 3 | 2 | IMAGE-REGISTRY.md, image-audit-plan.md, agent doc |
| **A3 — Site-wide audit script** | 1 | 2 | `audit-product-images.mts` rewrite |
| **A4 — Code migration swarm** | 12 | 3 | One PR per stale-scope file |
| **A5 — Static catalog deprecation** | 2 | 3 | products.ts + bundles.ts → dev fallback |
| **A6 — Tracker + Wave 15 handoff** | 1 | 4 | Close Wave 14 |
| **N — New deliverable** | 1 | 1 | `supabase-audit.instructions.md` |

---

## Open questions — RESOLVED (40x recommendations, 2026-04-28)

| # | Question | Decision | Rationale |
|---|---|---|---|
| Q1 | `public/images/**` drain vs fallback? | **Keep 4-week fallback.** Drain in Wave 15 only after Phase 4 swarm lands + 2-week bake. | Aggressive drain risks broken homepage during partial rollout; existing `feature-flags.ts` (W14-10) gives clean kill-switch. |
| Q2 | CDN choice? | **Supabase Storage CDN.** | Single source of truth; integrated RLS/auth; no separate billing. Vercel CDN already fronts `/public` → double-origin confusion. Cloudinary adds vendor lock + invalidation complexity. |
| Q3 | Audit script severity? | **Hard-error in CI, warn locally** (gate on `process.env.CI === 'true'` → `exit 1`; else `console.warn`). | Warnings get ignored forever; hard-error in CI is the only way to prevent re-drift. |
| Q4 | Bestsellers naming? | **`is_bestseller boolean NOT NULL DEFAULT false` + `bestseller_rank int NULL`** on `products`. Treat `bestseller` (data-driven) and `featured` (admin-curated) as separate concerns. | Keeps it queryable + sortable + manually overridable. Two booleans avoids enum churn. |
| Q5 | Brand chrome exception list? | `logo.svg`, `logo-white.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `og-default.png`, `og-default-square.png`, `twitter-card.png`, `manifest-icon-192.png`, `manifest-icon-512.png`. Codify in `.github/instructions/image-import.instructions.md` + W14-24. | Standard PWA + social-share manifest; everything else goes to Supabase Storage. |
| Q6 | Variant seeding source? | **Manual canonical list** (committed `scripts/seed/variants.json`). Printful API only at fulfillment time. | Printful API has rate limits + breaking schema changes; canonical JSON is deterministic, diffable, version-controlled, reproducible across envs. |
| Q7 | `media_library` write authority? | **DB trigger on `storage.objects`** is source of truth; admin UI is metadata-editor overlay (alt text, tags, brand-chrome flag). | Trigger guarantees zero drift across upload channels (dashboard / CLI / API / migrations). |

---

## Wave 1 — Foundation (do first)

| ID | Title | Pri | Status | Notes |
|---|---|---|---|---|
| W14-01 | Delete stale `src/shared/types/database.ts`, rewrite imports | P0 | ⏳ | Handcrafted · Blocks W14-04 |
| W14-02 | Consolidate duplicate Supabase client wrappers | P0 | ⏳ | Handcrafted · 3 callers to migrate |
| W14-03 | Add `supabase-clients.instructions.md` + ESLint guard | P1 | ⏳ | Handcrafted · prevents recurrence |
| W14-04 | Phase 0 — Supabase image inventory discovery (read-only) | P0 | ⏳ | Handcrafted · gates Wave 2 |
| W14-24 | New `.github/instructions/supabase-audit.instructions.md` | P1 | ⏳ | Handcrafted · 11-section outline |

## Wave 2 — Schema + docs (parallel after Q1-Q7 answered)

| ID | Title | Pri | Status |
|---|---|---|---|
| W14-05 | Phase 1 — Backfill `media_library` + canonical buckets | P0 | 📋 |
| W14-06 | Phase 2a — Rewrite `docs/audits/IMAGE-REGISTRY.md` | P1 | ⏳ |
| W14-07 | Phase 2b — Rewrite `docs/active/image-audit-plan.md` | P1 | ⏳ |
| W14-08 | Phase 2c — Update `design-system-asset-pipeline.agent.md` | P1 | ⏳ |
| W14-09 | Phase 3 — Rewrite `scripts/audit-product-images.mts` site-wide | P0 | ⏳ Handcrafted |

## Wave 3 — Code migration swarm (12 parallel PRs · NO overlapping paths)

| ID | File scope | Pri |
|---|---|---|
| W14-10 | `src/lib/feature-flags.ts` | P2 |
| W14-11 | `src/shared/data/bundles.ts` | P2 |
| W14-12 | `src/shared/types/bundle.ts` | P2 |
| W14-13 | `src/shared/lib/bundle-analytics.ts` | P2 |
| W14-14 | `src/shared/hooks/useImageLoadMonitor.ts` | P2 |
| W14-15 | `scripts/lighthouse-audit.mts` | P2 |
| W14-16 | `src/app/api/subscribe/route.ts` | P1 |
| W14-17 | `src/app/api/reviews/photos/route.ts` | P1 |
| W14-18 | `src/app/api/admin/photos/[id]/route.ts` | P1 |
| W14-19 | `src/app/api/webhooks/order-fulfilled/route.ts` | P1 |
| W14-20 | `lib/review-solicitation.ts` | P1 |
| W14-21 | `src/shared/data/products.ts` (demote to dev fallback) | P0 |

## Wave 4 — Closeout

| ID | Title | Pri |
|---|---|---|
| W14-22 | Phase 5b — Deprecate `bundles.ts` static catalog | P2 |
| W14-23 | Phase 6 — Tracker close + Wave 15 handoff | P1 |

---

## Carry-forward from Wave 13 (separate tracker)

- Kids catalog seed (0/4 SKUs) — depends on W14-04 image migration
- Accessories catalog seed (2/11 SKUs) — same dependency
- I-68 PDP DevTools console error — needs incognito repro from stakeholder
