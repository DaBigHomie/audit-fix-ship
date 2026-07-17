<!-- GENERATED FROM maximus-ai/.claude/commands/deploy-infra.md -- do not edit; run sync-commands.mts -->
# /deploy-infra — Deploy Infra Cluster

**Model:** claude-sonnet  
**CORTEX tasks:** `task_post_investor_cloudflare_proxy`, `task_infra_caro_web_alias`

Deploy the venue-images Cloudflare Worker, wire Cloudflare proxy CNAMEs, and set Vercel aliases for caro-web.

> **Note — Fly pos-fanout worker:** `task_infra_fly_worker_deploy` is not yet scaffolded (no `deploy:worker:fly` script, no Fly app config in the repo). It is tracked separately and should not be attempted here.

---

## Pre-flight

```bash
# Confirm required env vars are set
echo "CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN:?required}"
echo "VERCEL_TOKEN=${VERCEL_TOKEN:?required}"

# Confirm Jay has set account_id in wrangler.toml (required before deploy)
grep "account_id" apps/workers/venue-images/wrangler.toml
# Must NOT show "TODO_SET_VIA_WRANGLER_OR_ENV" — if it does, stop and ask Jay
```

## Step 1 — Deploy venue-images Cloudflare Worker

This Worker serves `images.caro.damieus.app/*` — covers/gallery for 78 venues (70 currently broken).
TypeScript is clean; the only human-gated blocker is `account_id` in `wrangler.toml`.

```bash
cd apps/workers/venue-images

# Upload Supabase service role key as a Worker secret
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# (paste value from Supabase Dashboard → Settings → API → service_role)

# Deploy to Cloudflare
npx wrangler deploy --routes "images.caro.damieus.app/*"

# Smoke test
curl -i https://images.caro.damieus.app/healthz
curl -si https://images.caro.damieus.app/venues/flo-atl/cover.jpg | head -5
# → expect 302 to supabase storage (or SVG fallback for venues with no image)
```

> **Before deploying:** ensure `images.caro.damieus.app` is in `remotePatterns` in
> `apps/admin/next.config.ts` and `apps/web/next.config.ts` — without this,
> Next.js `<Image>` will 400 on every thumbnail after the Worker goes live.

## Step 2 — Cloudflare proxy: enable proxy on caro-api CNAME

## Step 3 — Vercel alias: caro-web

```bash
# Get latest web deploy URL
DEPLOY_URL=$(vercel ls atl-table-booking-app --token $VERCEL_TOKEN | grep "caro" | head -1 | awk '{print $1}')
echo "Deploy URL: $DEPLOY_URL"

# Set alias
vercel alias set "$DEPLOY_URL" web.caro.damieus.app --token $VERCEL_TOKEN

# Set API alias (points to Fly worker via Cloudflare)
vercel alias set caro-api.fly.dev api.caro.damieus.app --token $VERCEL_TOKEN 2>/dev/null || \
  echo "API alias may need DNS CNAME instead — set api.caro.damieus.app → caro-api.fly.dev in Cloudflare"
```

## Step 4 — Smoke test

```bash
curl -sf https://api.caro.damieus.app/health && echo "API OK"
curl -sI https://web.caro.damieus.app | head -5
```

## Step 5 — Checkpoint

```bash
# If .agent-kb is available:
npx tsx ../.agent-kb/anvil/run.mts checkpoint \
  --task=task_post_investor_cloudflare_proxy \
  --task=task_infra_caro_web_alias \
  --status=complete \
  --repo=atl-table-booking-app

# If not: update status in .cortex-handoff/atb-project-dashboard-kb.json manually
```
