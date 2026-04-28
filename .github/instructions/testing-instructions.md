---
applyTo: "**"
---

# Testing Instructions — UGWTF Standard

> Source of truth: `ugwtf/docs/testing-instructions.md`
> Synced to all repos via `ugwtf install`

## Standardized Test Scripts

Every UGWTF-managed repo uses these exact script names:

| Script | Command | Purpose |
|--------|---------|---------|
| `npm test` | `vitest run` | Unit tests (all) |
| `npm run test:watch` | `vitest` | Unit tests (watch mode) |
| `npm run test:coverage` | `vitest run --coverage` | Unit tests + coverage report |
| `npm run test:e2e` | `npx playwright test` | All E2E tests |
| `npm run test:e2e:ui` | `npx playwright test --ui` | E2E with Playwright UI |
| `npm run test:e2e:headed` | `npx playwright test --headed` | E2E in headed browser |
| `npm run test:e2e:critical` | repo-specific | Route health, accessibility, devtools |
| `npm run test:e2e:cart` | repo-specific | Cart + checkout flow tests |
| `npm run test:e2e:mobile` | repo-specific | Mobile viewport tests |
| `npm run test:e2e:visual` | repo-specific | Visual regression tests |
| `npm run type-check` | `tsc --noEmit` | TypeScript type checking |
| `npm run validate` | type-check + lint + build | Full quality gate |

## File-Change → Test-Suite Mapping

When an agent modifies files, run the corresponding test suites:

### UI / CSS Tests → `npm test` + `npm run test:e2e:visual`

Trigger when ANY of these change:
- `**/*.tsx` (React components)
- `**/*.css`, `**/*.scss` (stylesheets)
- `**/tailwind.config.*` (Tailwind configuration)
- `**/globals.css`, `**/layout.tsx` (global styles/layout)
- `**/theme/**` (theme files)
- `**/fonts/**` (font configuration)

### Cart / Commerce Tests → `npm test` + `npm run test:e2e:cart`

Trigger when ANY of these change:
- `**/cart/**` (cart components/logic)
- `**/checkout/**` (checkout flow)
- `**/orders/**` (order management)
- `**/products/**` (product pages/components)
- `**/hooks/useCart*` (cart hooks)
- `**/lib/stripe*`, `**/lib/payment*` (payment logic)
- `**/supabase/**/*order*`, `**/supabase/**/*cart*` (cart/order edge functions)

### Navigation / Menu Tests → `npm test` + `npm run test:e2e:critical`

Trigger when ANY of these change:
- `**/navigation/**`, `**/nav/**` (navigation components)
- `**/header/**`, `**/footer/**` (header/footer)
- `**/layout/**` (layout components)
- `**/menu/**`, `**/mega-menu/**` (menu components)
- `**/sidebar/**` (sidebar navigation)
- `**/routes*`, `**/middleware*` (routing)

### Auth Tests → `npm test` + `npm run test:e2e:critical`

Trigger when ANY of these change:
- `**/auth/**` (auth components/logic)
- `**/login/**`, `**/signup/**` (auth pages)
- `**/middleware*` (auth middleware)
- `**/lib/supabase*` (Supabase client)
- `**/hooks/useAuth*`, `**/hooks/useSession*` (auth hooks)

### API / Backend Tests → `npm test`

Trigger when ANY of these change:
- `**/api/**` (API routes)
- `**/server/**` (server actions)
- `**/supabase/**` (edge functions)
- `**/lib/**` (shared libraries)
- `**/utils/**` (utility functions)

### Config / CI Tests → `npm run validate`

Trigger when ANY of these change:
- `package.json` (dependencies)
- `tsconfig*.json` (TypeScript config)
- `next.config.*`, `vite.config.*` (build config)
- `eslint.config.*`, `.eslintrc*` (linting)
- `playwright.config.*` (E2E config)
- `vitest.config.*` (unit test config)
- `.github/**` (CI/CD workflows)

## Agent Decision Matrix

```
┌──────────────────────┬─────────┬───────────────┬──────────┬──────────┐
│ Changed Files        │ Unit    │ E2E Critical  │ E2E Cart │ E2E Full │
├──────────────────────┼─────────┼───────────────┼──────────┼──────────┤
│ *.tsx, *.css         │ ✅ RUN  │ ⬡ optional    │ ⬡ skip   │ ⬡ skip   │
│ cart/, checkout/     │ ✅ RUN  │ ⬡ skip        │ ✅ RUN   │ ⬡ skip   │
│ nav/, layout/, menu/ │ ✅ RUN  │ ✅ RUN        │ ⬡ skip   │ ⬡ skip   │
│ auth/, middleware     │ ✅ RUN  │ ✅ RUN        │ ⬡ skip   │ ⬡ skip   │
│ api/, lib/, utils/   │ ✅ RUN  │ ⬡ optional    │ ⬡ skip   │ ⬡ skip   │
│ package.json, config │ ⬡ skip  │ ⬡ skip        │ ⬡ skip   │ ⬡ skip   │
│ push to main         │ ✅ RUN  │ ✅ RUN        │ ✅ RUN   │ ✅ RUN   │
│ nightly schedule     │ ✅ RUN  │ ✅ RUN        │ ✅ RUN   │ ✅ RUN   │
└──────────────────────┴─────────┴───────────────┴──────────┴──────────┘
```

## CI Pipeline Integration

The `ci.yml` workflow runs:
1. **quality-gates** (blocking): `type-check` → `lint` → `build`
2. **unit-tests** (blocking): `npm test`
3. **e2e** (non-blocking, **scoped**): runs only relevant specs

### Smart E2E Scoping (043)

The E2E job detects changed files via `git diff` and maps to specific Playwright specs:

| Changed Path Pattern | Specs Run |
|---------------------|-----------|
| `entities/cart/`, `features/checkout/`, `widgets/CartDrawer` | `cart` + `checkout-flow` |
| `entities/product/`, `pages/shop/` | `cart` |
| `app/*page.*`, `app/*layout.*` | `route-health` + `navigation` |
| `shared/ui/`, `.css`, `tailwind.config` | `visual-regression` + `accessibility` |
| `e2e/specs/*.spec.ts` | The changed spec directly |
| No match | `@critical` tag only (fast sanity) |
| Docs/config-only (`.md`, `.json`, `.instructions`) | **Skip E2E entirely** |

This uses existing Playwright features: `TEST_GREP` env var for tag filtering, file-based spec selection, and `--project=chromium` to skip mobile/firefox.

## Per-Repo Test Inventory

### one4three-co-next-app (043)
- **Unit**: 3 test files (cart, products, utils)
- **E2E**: 7 specs (navigation, browser-devtools, visual-regression, cart, checkout-flow, route-health, accessibility)
- **E2E Dir**: `e2e/specs/`
- **Port**: 3000 (Next.js)

### damieus-com-migration
- **Unit**: 2 test files
- **E2E**: 4 active specs + 15 archived (navigation, browser-devtools, atl-skylift-project, cart)
- **E2E Dir**: `e2e/specs/`
- **Port**: 8080 (Vite)

### flipflops-sundays-reboot (ffs)
- **Unit**: 5 test files (ProductDetail, ProductCard, MiniCart, useCart)
- **E2E**: 7 specs in `src/e2e/` + 5 specs in `tests/` (split location)
- **E2E Dir**: `tests/` (Playwright config) + `src/e2e/` (user journeys)
- **Port**: 8080 (Vite)
- **Note**: E2E tests split across two directories — `tests/` for API/config, `src/e2e/` for user flows

### maximus-ai
- **Unit**: 6 test files (promo, cost-router, readiness-scorer, addons, packages, rate-limiter)
- **E2E**: 6 specs (agents, a11y, auth, onboarding, payments, visual)
- **E2E Dir**: `tests/e2e/`
- **Port**: 3000 (Next.js)

## Critical Testing Rules

1. **Never skip unit tests on PR** — `npm test` must run on every PR
2. **E2E is non-blocking in CI** — failures are warnings, not blockers (except `test:e2e:critical`)
3. **Cart tests require running dev server** — Playwright `webServer` handles this automatically
4. **Stripe tests need iframe handling** — CardNumberElement, CardExpiryElement, CardCvcElement are in separate iframes
5. **Visual regression baselines** — update with `npx playwright test visual-regression --update-snapshots`
6. **Mobile tests use specific projects** — `--project=mobile-safari` or `--project=Mobile Safari` depending on config
7. **Coverage thresholds** — maximus-ai enforces 80% on lines/functions/branches/statements
