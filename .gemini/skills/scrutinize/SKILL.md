---
name: scrutinize
description: >-
  SCRUTINIZE deep code review — line-level logic, security, data-flow, and
  edge-case audit beyond MALFIG policy gates. Use when the user says
  /scrutinize, deep review, logic audit, security review, or edge-case check.
disable-model-invocation: true
---

# SCRUTINIZE (`/scrutinize`)

Deep-read code review focused on **logic correctness, security, and edge cases**
— complements MALFIG (policy) and WARDEN (doc-placement).

Run MALFIG first; SCRUTINIZE is the implementation layer beneath it.

## Scope

- Business logic correctness (off-by-one, null paths, async race conditions)
- Security (SQL injection, RLS bypass, exposed secrets, unvalidated input)
- Data-flow (type coercion, JSONB casts, Supabase insert/select shape mismatches)
- Edge cases (empty arrays, deleted rows, network failure paths, retry storms)
- FSD import direction violations (runtime — not just policy)
- Dead code, orphaned exports, unreachable branches

## Run (from repo root)

```bash
# Type check first (required)
npx tsc --noEmit

# Lint
npm run lint

# Build smoke
npm run build 2>&1 | grep -Ei "error|warning" | head -20

# For Supabase-touching code: schema diff
npx supabase db diff
```

Then read the diff under review and apply the checklist below.

## Checklist

| ID | Check |
|----|-------|
| SC1 | All async paths have `try/catch` or `.catch()` — no unhandled promise rejections |
| SC2 | Supabase queries check `.error` before using `.data` |
| SC3 | JSONB fields cast through `unknown` first — no direct `as TargetType` |
| SC4 | No raw hex colors outside `tokens.ts` / CSS variable files |
| SC5 | No hardcoded secrets, API keys, or absolute `/Users/...` paths in committed code |
| SC6 | RLS policies cover all CRUD paths on new/modified tables |
| SC7 | FSD import direction: `pages` → `widgets` → `features` → `entities` → `shared` only |
| SC8 | Edge cases: empty input, zero rows, deleted foreign key, concurrent writes |
| SC9 | No orphaned `package.json` inside `src/` (runtime enforcement — see MALFIG G3) |
| SC10 | No `console.log` with sensitive data in production paths |

## Output format

```
TASK-XXXX — SCRUTINIZE ({repo}/{file-or-PR})
Verdict: PASS | NEEDS-FIXES | BLOCKED
Findings:
  SC2 — src/lib/supabase.ts:42 — missing .error check on insert
  SC5 — scripts/seed.ts:17 — hardcoded service role key
Actions: (ordered fix list, or NONE)
```

## Workflow

1. Run MALFIG first — resolve policy blockers before deep review.
2. `cd` to repo root; run type-check + lint + build (see commands above).
3. Read the diff / PR files under review.
4. Apply SC1–SC10 checklist.
5. Emit verdict with file:line references for every finding.
6. If BLOCKED — do not approve merge; surface to repo owner.

## Integration with MALFIG + WARDEN

| Tool | Focus | When |
|------|-------|------|
| WARDEN | Doc placement + repo structure | Pre-commit / PR open |
| MALFIG | Policy, architecture, CORTEX state | Pre-merge |
| SCRUTINIZE | Logic, security, edge cases | Deep review / sensitive changes |
