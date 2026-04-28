# Audit Checklist — Phase 1

Run this **before** writing any prompts. The goal: prove the repo matches your mental model, or find where it doesn't, in under 10 minutes.

Token budget: ~2k tokens of bash output to read. Most outputs are 5–20 lines.

## Setup

```bash
REPO_PATH="${REPO_PATH:-$(pwd)}"
cd "$REPO_PATH"
echo "Auditing $REPO_PATH"
```

## 1. Stack identity

```bash
# Framework + version
cat package.json | jq -r '.name + "@" + .version'
cat package.json | jq -r '.dependencies | to_entries[] | select(.key | test("^(next|react|vue|svelte|astro)$")) | "\(.key)@\(.value)"'

# Build tool / bundler signal
cat package.json | jq -r '.scripts.build // .scripts.dev'
ls turbo.json nx.json rush.json 2>/dev/null
```

## 2. TypeScript / path aliases

```bash
# Path aliases — single most common drift point
cat tsconfig.json | jq '.compilerOptions.paths' 2>/dev/null
cat tsconfig.base.json | jq '.compilerOptions.paths' 2>/dev/null

# Are they src-rooted or repo-rooted?
ls -d src lib components 2>/dev/null
```

## 3. Commerce / data backend

```bash
# What's actually integrated
grep -l "shopify\|stripe\|printful\|paddle\|chargebee" package.json
grep -l "supabase\|prisma\|drizzle\|firebase\|planetscale" package.json
grep -l "resend\|sendgrid\|postmark\|nodemailer\|mailgun" package.json
```

## 4. Existing automation infrastructure

```bash
# How much is already wired up?
ls -la .github/prompts/ 2>/dev/null | wc -l
ls -la .github/instructions/ 2>/dev/null | wc -l
ls -la .github/agents/ 2>/dev/null | wc -l
ls -la .github/workflows/ 2>/dev/null | head

# Custom skills / rules
ls -la .claude/ .cursor/ 2>/dev/null
ls CLAUDE.md AGENTS.md .cursorrules 2>/dev/null
```

## 5. Naming + commit conventions

```bash
# Read once, reference forever
head -100 .github/copilot-instructions.md 2>/dev/null
head -50 AGENTS.md 2>/dev/null
head -50 CLAUDE.md 2>/dev/null

# Last 5 PR titles to confirm convention
gh pr list --state merged --limit 5 --json title,number 2>/dev/null

# Last 10 commits
git log --oneline -10
```

## 6. Existing related work

For each item the stakeholder mentioned, check if it's already done or in flight:

```bash
# Replace ITEM_KEYWORD with each topic the stakeholder flagged
ITEM_KEYWORD="rebrand"  # or "media library", "auth", "email", etc.

git log --oneline --all -i --grep="$ITEM_KEYWORD" | head
gh pr list --state all --search "$ITEM_KEYWORD" --limit 5 --json title,number,state 2>/dev/null
grep -rln "$ITEM_KEYWORD" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head
```

## 7. Domain / redirect / env state

```bash
# Production domain mapping
cat next.config.js next.config.ts next.config.mjs 2>/dev/null | grep -A 30 "redirects\|rewrites" | head -50

# Env templates (NOT actual .env)
cat .env.example .env.local.example 2>/dev/null | grep -v "^#" | grep "="

# Vercel project config (if vercel CLI installed)
cat vercel.json 2>/dev/null
```

## 8. Database state

```bash
# Latest migration tells you the current schema state
ls -t supabase/migrations/*.sql 2>/dev/null | head -3
ls -t prisma/migrations/ 2>/dev/null | head -5
ls -t drizzle/ 2>/dev/null | head -5

# RLS / policies
grep -l "create policy\|alter table.*enable row level" supabase/migrations/*.sql 2>/dev/null | tail -5
```

## 9. The specific components / files referenced in the change request

For each file or component the stakeholder named, locate it. **This is where most drift hides.**

```bash
# Substitute the actual names. Examples from the JSR session:
find src -iname "*Story*" 2>/dev/null
find src -iname "*Hero*" 2>/dev/null
find src -iname "*ProductForm*" 2>/dev/null
find src -iname "*MediaLibrary*" 2>/dev/null
find src -iname "*Footer*" 2>/dev/null

# Read the ones you'll actually edit
cat src/features/[the-component]/[the-file].tsx
```

## 10. Stakeholder profile / role state

This catches the class of bug where a security policy is correct but the **user's account is misconfigured** — the most-missed root cause when an admin can't do something they should be able to.

```bash
# If Supabase, query for the stakeholder's profile state
# (run this in Supabase SQL editor, not bash)
# SELECT u.id, u.email, p.role
# FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
# WHERE u.email = 'stakeholder@example.com';

# What roles even exist?
grep -rn "role:" supabase/migrations/ --include="*.sql" | grep -i "admin\|super\|owner" | head
```

## 11. Sibling repos / cross-repo references

If the stakeholder mentioned "port from [other project]" or "do what we did on [other site]", locate the sibling repo.

```bash
# Default management workspace pattern
ls ~/management-git/ 2>/dev/null | head -20
ls ~/code/ ~/projects/ ~/repos/ 2>/dev/null | head -10

# For each named sibling, verify the source pattern
ls ~/management-git/[sibling-repo]/src/features/email 2>/dev/null
```

## 12. The thing the stakeholder is wrong about

Stakeholders will sometimes describe a problem that's symptomatic of a different root cause. Build a "the stakeholder said X but actually..." section in your reconciliation doc when you find these. Common patterns:

- "The button doesn't work" → it works, but the user lacks the role/permission
- "The image is broken" → DNS / CDN / cache, not the code
- "The page is slow" → one third-party script, not the framework
- "It logs me out" → cookie SameSite, not auth
- "I can't edit it" → RLS policy denies the role they're authenticated as

## Output

When done, produce `RECONCILIATION.md` using `templates/reconciliation.template.md`. List every assumption from the change request that turned out to be wrong, every item that's already shipped, every cross-reference that doesn't exist as the stakeholder described it.

Keep it brutal. The reconciliation doc is what saves you from shipping a wrong v1.
