---
description: "Fork a session with the deploy-gate agent to run pre-commit quality gates"
agent: "deploy-gate"
argument-hint: "Which repo to validate? (damieus, 043, ffs, maximus, or auto-detect)"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/run-quality-gates.prompt.md -- do not edit; run sync-agents.mts -->

# Run Quality Gates

You are forked into a **deploy-gate** session. Your scope is running validation commands — no code editing.

## Gate Sequence (MANDATORY — run all in order)

| # | Gate | Command | Pass Criteria |
|---|------|---------|---------------|
| 1 | TypeScript | `npx tsc --noEmit` | 0 errors |
| 2 | Lint | `npm run lint` | 0 errors |
| 3 | Build | `npm run build` | Exit code 0 |
| 4 | Build Warnings | `npm run build 2>&1 \| grep -Ei "warning\|error\|deprecated\|Unexpected\|Parsing CSS"` | 0 matches |
| 5 | Tests | `npm test -- --run` (if available) | All pass |

## Output Format

Report a summary table:

```
| Gate       | Status | Details          |
|------------|--------|------------------|
| TypeScript | ✅/❌  | 0 errors / N errors |
| Lint       | ✅/❌  | 0 errors / N errors |
| Build      | ✅/❌  | Success / Failed |
| Warnings   | ✅/❌  | 0 matches / N matches |
| Tests      | ✅/❌  | All pass / N failures |
```

**VERDICT**: ✅ SAFE TO COMMIT or ❌ FIX REQUIRED

## Rules

- NEVER use `tail` to read build output — grep the FULL output
- NEVER assume exit code 0 means clean
- If ANY gate fails, verdict is ❌ — no exceptions
