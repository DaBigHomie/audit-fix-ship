---
applyTo: "**"
---

# CI Pipeline Reference

> Source of truth for CI quality gates. Synced to repos as `.github/instructions/ci-instructions.md`.
> Auto-generated workflows are produced by UGWTF — do not edit ci.yml manually.

## What Runs

CI runs on every **pull request** and **push to the default branch**.

### Quality Gates (blocking — must pass to merge)

| Check | Command | What It Validates |
|-------|---------|-------------------|
| TypeScript | `npx tsc --noEmit` | Zero type errors |
| Lint | `npx eslint .` or `npx next lint` | Zero lint errors |
| Build | `npx vite build` or `npx next build` | Successful production build |

> Not all repos have all checks. UGWTF configures this per-repo via `RepoConfig.ci`.
> If a check command is `null`, that step is skipped entirely.

### Unit Tests (blocking — if configured)

| Check | Command | What It Validates |
|-------|---------|-------------------|
| Unit tests | `npx vitest run` | All unit tests pass |

Runs after quality gates pass. Only present if `ci.unitTestCommand` is set.

### E2E Tests (non-blocking by default)

| Check | Command | What It Validates |
|-------|---------|-------------------|
| Browser install | `npx playwright install --with-deps chromium` | Downloads browser binaries |
| E2E tests | `npx playwright test` | All E2E scenarios pass |

**Playwright browsers are NEVER pre-installed in CI.** The install step must run before every E2E job.

E2E runs after quality gates pass. Configured as `continue-on-error: true` unless `ci.e2e.blocking` is true.

## When It Runs

| Trigger | What Happens |
|---------|-------------|
| PR opened/updated | All configured jobs run |
| Push to default branch | All configured jobs run |
| Superseded run | Previous run is **cancelled** (concurrency group) |

Concurrency group: `ci-${{ github.ref }}` — only one CI run per branch at a time.

## What Happens on Failure

### Quality gate failure
- PR is **blocked from merging** (required check)
- Fix: Read the error output in the GitHub Actions log
- Common fixes:
  - TypeScript: `npx tsc --noEmit` locally to see errors
  - Lint: `npx eslint . --fix` or `npx next lint --fix`
  - Build: Check for missing imports, env vars, or type errors

### Unit test failure
- PR is **blocked from merging**
- Fix: Run `npx vitest run` locally to reproduce

### E2E failure (non-blocking)
- PR is **NOT blocked** — merge can proceed
- E2E failures are informational
- Fix: Run `npx playwright test` locally (after `npx playwright install`)
- Common issues:
  - Missing browser binaries → `npx playwright install --with-deps chromium`
  - Flaky tests → Re-run the workflow
  - Environment differences → Check if test expects specific env vars

## Per-Repo CI Configuration

UGWTF stores CI config in `RepoConfig.ci` (repo-registry.ts). Each repo has:

```typescript
ci: {
  lintCommand: string | null;       // null = skip lint
  typeCheckCommand: string | null;   // null = skip tsc
  buildCommand: string | null;       // null = skip build
  unitTestCommand: string | null;    // null = skip unit tests
  e2e: {
    command: string;                 // e.g. 'npx playwright test'
    installCommand: string;          // e.g. 'npx playwright install --with-deps chromium'
    blocking: boolean;               // true = failure blocks merge
  } | null;                          // null = no E2E
}
```

To change what CI runs for a repo, update the config in UGWTF and run `ugwtf install <alias>`.

## Workflow Ownership

- **ci.yml is auto-generated** by UGWTF's CI generator
- **Do NOT edit ci.yml manually** — changes will be overwritten by `ugwtf install`
- To change CI behavior: update `RepoConfig.ci` in UGWTF, then redeploy
- The copilot-full-automation.yml has its own Phase 3 quality checks (separate from ci.yml)

## Troubleshooting

### "npm run lint" fails — command not found
Repo may not have a lint script. Check `RepoConfig.ci.lintCommand` — if null, UGWTF skips it.

### E2E fails with "browser not found"
The Playwright install step is missing or failed. UGWTF now includes `npx playwright install --with-deps chromium` before E2E runs.

### CI keeps failing on the same PR
1. Check the Actions tab for the specific error
2. Run `ugwtf checks <alias>` locally to reproduce
3. If it's a UGWTF-generated workflow issue, fix the generator and redeploy
