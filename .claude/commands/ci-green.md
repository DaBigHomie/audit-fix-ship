# /ci-green — CI Green

**Model:** claude-sonnet  
**CORTEX tasks:** `task_post_investor_vercel_ci_green`, `task_post_investor_pr119_merge`

Fix all typecheck, lint, and build errors so Vercel CI goes green on PR #119.

---

## Step 1 — Typecheck

```bash
pnpm typecheck 2>&1 | tail -30
```

Fix any errors before continuing. Common fixes: add missing types, remove `any`, resolve import paths.

## Step 2 — Lint

```bash
pnpm lint 2>&1 | tail -30
```

## Step 3 — Build all apps

```bash
pnpm build:api 2>&1 | tail -20
pnpm build:web 2>&1 | tail -20
pnpm build:admin 2>&1 | tail -20
```

Fix errors in order. API build errors block web/admin builds.

## Step 4 — Push and monitor

```bash
git push origin HEAD
```

Watch Vercel deployment status via the GitHub PR checks panel, or:

```bash
# If Vercel MCP is configured:
# mcp__claude_ai_Vercel__get_deployment --deploymentId <id>
```

## Step 5 — Merge PR #119

Once all checks are green:

```bash
# Via GitHub MCP:
# mcp__github__merge_pull_request --owner dabighomie --repo atl-table-booking-app --pullNumber 119 --mergeMethod squash
```

## Checkpoint

Update `.cortex-handoff/post-investor-comms-2026-05-26-kb.json` — set `status: "complete"` on:
- `task_post_investor_vercel_ci_green`
- `task_post_investor_pr119_merge`
