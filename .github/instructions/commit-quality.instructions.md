---
applyTo: "**"
---

# Commit & Quality Gate Rules

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.

## Pre-Commit Steps (MANDATORY)

1. `npx tsc --noEmit` — 0 errors
2. `npm run lint` — 0 errors
3. `npm run build` — succeeds
4. Test in browser if UI changes
5. Workflow files: NO `${{ }}` syntax in comments
6. Ask user to review before committing
7. `git status` then `git add -A` then `git status --short` then commit

## Commit Format

**Short**: `feat/fix/docs: [description]`

**Multi-line** — use heredoc (never `-m` with line breaks):
```bash
git commit -F - <<'EOF'
feat: Description

Testing Evidence:
- TypeScript: 0 errors
- Build: Successful
EOF
```

**Never**: `git reset`, `git commit -a` (doesn't stage untracked files)

## Pre-Deployment Quality Gates

| Gate | Command | Must Pass |
|------|---------|-----------|
| TypeScript | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| Build | `npm run build` | Success |
| Unit Tests | `npm test -- --run` | All pass |
| E2E | `npx playwright test` | All pass |

NEVER deploy if any gate fails.

## Terminal Output Rules

- Read ALL output — never ignore warnings, deprecation notices, or errors
- Never proceed if: build failed, type errors, test failures, security vulnerabilities
- Escalate to user if: unknown errors, conflicting messages, cannot determine root cause
