---
agent: agent
description: "W14-03: Document canonical Supabase client topology + ESLint guard against duplicates"
---

# W14-03: Codify the Supabase client contract

**Priority**: P1
**Status**: ⏳ NOT STARTED
**Estimated Time**: 45 min
**Revenue Impact**: Low · **Prevents recurrence of W14-01/02**
**Dependencies**: W14-01, W14-02 (must merge first)
**Tags**: `type:docs`, `scope:db`, `priority:p1`, `prompt-spec`

---

## Agent Bootstrap

- `.github/copilot-instructions.md`
- `.github/instructions/doc-standards.instructions.md`
- `.github/instructions/supabase.instructions.md`
- `eslint.config.mjs`

---

## Objective

After W14-01 and W14-02 land, encode the canonical client topology in a written contract + automated ESLint guard so future agents cannot recreate the duplicates.

---

## Pre-Flight Check

```bash
cd /Users/dame/management-git/one4three-co-next-app
git branch --show-current  # MUST be: copilot/wave14-supabase-clients-contract

# Confirm W14-01 + W14-02 already landed
ls src/shared/types/database.ts 2>/dev/null && echo "❌ W14-01 not merged yet, abort" && exit 1
ls src/shared/lib/supabase-browser.ts 2>/dev/null && echo "❌ W14-02 not merged yet, abort" && exit 1
echo "✅ Prereqs landed"

# Inventory current direct @supabase/supabase-js imports (should be import-type only)
grep -rn "from ['\"]@supabase/supabase-js['\"]" src/ --include="*.ts" --include="*.tsx"
grep -rn "import type" src/ --include="*.ts" --include="*.tsx" | grep "@supabase/supabase-js" | wc -l
```

---

## Intended Result

1. New file `.github/instructions/supabase-clients.instructions.md` (`applyTo: "**/*.ts,**/*.tsx"`) declaring the canonical map
2. `eslint.config.mjs` adds `no-restricted-imports` rule blocking:
   - `@/shared/lib/supabase-browser` (deleted in W14-02)
   - `@/shared/lib/supabase-server` (deleted in W14-02)
   - `@/shared/types/database` (deleted in W14-01)
   - Runtime (non-`import type`) `@supabase/supabase-js` outside `lib/supabase/*.ts` and `middleware.ts`
3. Cross-link added to `.github/instructions/supabase.instructions.md` ("Client Topology" section)
4. ESLint passes; intentional `import type` from `@supabase/supabase-js` continues to work

---

## File Content — `supabase-clients.instructions.md`

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
---

# Supabase Client Topology — Canonical Imports

> Created after W14-01/02 deduped two parallel wrapper sets. Re-introducing duplicates is a build failure.

## Canonical map

| Layer | Import path | Use |
|---|---|---|
| Browser singleton | `@/lib/supabase/client` | Client components, hooks |
| Server (cookies) | `@/lib/supabase/server` | Server components, server actions |
| Service role | `@/lib/supabase/service` | API routes only — privileged ops |
| Static (no cookies) | `@/lib/supabase/static` | `generateStaticParams`, build-time |
| Generated types | `@/lib/supabase/types` | `import type { Database, Tables<...> }` |

## Direct package imports

- `@supabase/supabase-js` — **`import type` ONLY** (`Session`, `User`, `SupabaseClient`)
- `@supabase/ssr` — direct allowed ONLY in `lib/supabase/*.ts` and `middleware.ts`

## Forbidden

- ⛔ `@/shared/lib/supabase-browser` (removed in W14-02)
- ⛔ `@/shared/lib/supabase-server` (removed in W14-02)
- ⛔ `@/shared/types/database` (removed in W14-01)
- ⛔ Runtime `import { createClient } from '@supabase/supabase-js'` outside `lib/supabase/`

## Rules

- ✅ ALWAYS use the canonical path even for one-off scripts in `scripts/`
- ✅ ALWAYS prefer `@/lib/supabase/server` over manual cookie wiring
- ⛔ NEVER add a new wrapper in `src/shared/lib/`
- ⛔ NEVER duplicate `lib/supabase/types.ts` — it's CI-regenerated
```

## ESLint rule (add to `eslint.config.mjs`)

```js
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@/shared/lib/supabase-browser', '@/shared/lib/supabase-server', '@/shared/types/database'],
          message: 'Removed in W14-01/02. Use @/lib/supabase/{client|server|types}.' },
      ],
      paths: [
        { name: '@supabase/supabase-js', importNames: ['createClient'],
          message: 'Use @/lib/supabase/{client|server|service|static} — direct createClient is forbidden outside lib/supabase/.' },
      ],
    }],
  },
}
```

(Apply the rule with an `overrides` block that exempts `lib/supabase/**/*.ts` and `middleware.ts` from the `paths` restriction.)

---

## Validation Gates

```bash
npx tsc --noEmit
npm run lint                # The new rule MUST pass cleanly (0 violations)
npm run build

# Sanity: deliberately introduce a forbidden import in a temp file, run lint,
# confirm it's flagged, then revert.
```
