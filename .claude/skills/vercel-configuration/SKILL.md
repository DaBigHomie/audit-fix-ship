---
name: vercel-configuration
description: Configures and deploys monorepo apps to Vercel with pinned project IDs, DNS, and conventions. Use for deploying to Vercel, fixing wrong projects, linking .vercel, configuring env vars, managing domains, and understanding app-to-project mappings. Configuration only — for deployment ops and failure diagnosis, use the `vercel-deploy` agent.
---

# Vercel configuration

## Orchestration (required)

**GitHub Actions deploy workflows are out of scope for most repos.** Run deploy and quality tasks via the project's orchestration system (Maximus Prime, CORTEX / ANVIL, or equivalent) and repo scripts — not `.github/workflows/deploy-*.yml`.

```bash
cd "$(git rev-parse --show-toplevel)"
npm run cortex:boot  # or your project's equivalent orchestration
npx tsx scripts/sync-env-local.mts   # Sync env vars from <ENV_FILE>
```

## What deploys where

Example monorepo structure (customize per project):

| Monorepo path | Vercel project | Domain |
|---------------|----------------|--------|
| `apps/api` | `<PROJECT_NAME>-api` | `api.<DOMAIN>` |
| `apps/admin` | `<PROJECT_NAME>-admin` | `admin.<DOMAIN>` |
| `apps/web` | `<PROJECT_NAME>-web` | `web.<DOMAIN>` |
| `apps/mobile` | — | EAS only |
| `packages/<LIB>` | — | library only |

Canonical IDs: stored in `scripts/vercel-projects.ts` or equivalent config file. See your project's deployment runbook for specifics.

## Deploy workflow

**Git pushes do not deploy.** Each app `vercel.json` sets `ignoreCommand` to exit 0 — Vercel skips all Git-triggered builds. Deploy only via CLI:

```bash
vercel whoami
npx tsx scripts/sync-env-local.mts
set -a && source .env.local && set +a
export VERCEL_REMOTE_BUILD=1
pnpm deploy:api:staging
pnpm deploy:admin:staging
pnpm deploy:web:staging
```

Deployment scripts (e.g., `deploy-vercel.mts`) write `apps/<app>/.vercel/project.json` before each deploy, pinning the correct Vercel project.

## Anti-patterns

- `vercel link --yes` — wrong scope / stray projects
- `vercel deploy` without pinned `project.json` or `VERCEL_PROJECT_ID`
- Treat library packages as deployable apps
- Rely on GitHub Actions for CI-gated deploys

## Rate limit fallback (multi-team setup)

When the primary team/org returns `api-deployments-free-per-day`, a fallback team may be configured:

1. **Do not retry** failing deploys — retries burn quota and do not promote production.
2. **Fallback is typically guest/preview only** (subset of apps). No API or admin fallback.
3. Set `<ORG_ID>`, `<PROJECT_ID>`, `<VERCEL_TOKEN>` in `<ENV_FILE>` for the fallback team. Replace with your project values.
4. Checkpoint: `task_infra_vercel_fallback_deploy` with `deploy_profile=fallback target=<APP>`.

See `docs/VERCEL-DEPLOY-RUNBOOK.md` and `docs/VERCEL-DEPLOY-FALLBACK-PLAN.md` in the active repo for rate-limit policy and fallback SOP.

## Additional resources

- See `architecture.md` in this skill for deploy topology.
- See `docs/VERCEL-DEPLOY-RUNBOOK.md` and `docs/VERCEL-DEPLOY-FALLBACK-PLAN.md` in the active repo for deployment procedures and fallback runbooks.
