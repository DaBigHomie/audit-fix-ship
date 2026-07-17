# /secrets-rotate — Secrets Rotation

**Model:** claude-sonnet  
**CORTEX tasks:** `task_atl_legacy_09de07`

Confirm secrets were removed from git history and rotate any exposed credentials.

---

## Step 1 — Verify deletion from history

```bash
# Check if .env files were ever tracked
git log --all --full-history --diff-filter=D -- apps/api/.env
git log --all --full-history --diff-filter=D -- .env
git log --all --full-history --diff-filter=D -- .claude/settings.local.json

# Search for credential patterns in history (dry run — read only)
git log --all -p --follow -- apps/api/.env 2>/dev/null | \
  grep -E "(supabase|stripe|resend|twilio)" | head -20
```

## Step 2 — If secrets found in history: purge with BFG

**STOP — confirm with user before running any destructive git commands.**

```bash
# Install BFG (macOS)
brew install bfg

# Run from PARENT of repo dir
cd ..
bfg --delete-files .env --no-blob-protection atl-table-booking-app
bfg --delete-files settings.local.json --no-blob-protection atl-table-booking-app

cd atl-table-booking-app
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push — REQUIRES USER CONFIRMATION first
# git push --force-with-lease origin HEAD
```

## Step 3 — Rotate exposed credentials

If any of the following appeared in history, rotate immediately:

| Service | Where to rotate |
|---------|----------------|
| Supabase anon key | Supabase Dashboard → Settings → API → Regenerate |
| Supabase service role key | Same — generates new key, old one invalidated immediately |
| Stripe secret key | Stripe Dashboard → Developers → API keys → Roll key |
| Resend API key | Resend Dashboard → API Keys → Delete + create new |
| Twilio auth token | Twilio Console → Account → Auth tokens → Request secondary |

## Step 4 — Update Vercel env with new keys

```bash
# For each rotated key:
vercel env rm SUPABASE_SERVICE_ROLE_KEY production --token $VERCEL_TOKEN
vercel env add SUPABASE_SERVICE_ROLE_KEY production --token $VERCEL_TOKEN
# (Vercel prompts for value)
```

## Checkpoint

Update `.cortex-handoff/atb-project-dashboard-kb.json` — set `status: "complete"` on `task_atl_legacy_09de07` (or whichever task ID maps to secrets cleanup in your CORTEX export).
