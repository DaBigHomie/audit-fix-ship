---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
---

# TypeScript & Build Rules

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.

## Dev Server vs Production Build

CRITICAL: Local dev server may show NO errors while production build fails.

| Mode | Tool | Type Checking |
|------|------|---------------|
| `npm run dev` | esbuild | None (fast) |
| `npm run build` | tsc + esbuild | Full (strict) |

ALWAYS run before committing:
```bash
npx tsc --noEmit    # Must have 0 errors
npm run lint        # Must have 0 errors
```

## Strict Settings Enforced in Production

These tsconfig.json settings are checked by tsc but ignored by esbuild:
- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`
