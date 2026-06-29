# 043 Wave 14 — Install Runbook

One-page handoff for feeding W14 prompts into UGWTF + Copilot cloud agent.

---

## What's in this delivery

```
audit-fix-ship/sessions/043-wave14-supabase/
├── KICKOFF-PROMPT-043.md            ← remixed kickoff (paste into new session)
├── RECONCILIATION.md                ← Phase 1 audit output (read first)
├── W14-issues-for-stakeholder.md    ← stakeholder-facing tracker
├── INSTALL.md                       ← this file
├── issues.ts                        ← typed source for 19 generated prompts
└── prompts-handcrafted/
    ├── W14-01-supabase-dedupe-types.prompt.md
    ├── W14-02-supabase-dedupe-wrappers.prompt.md
    └── W14-03-supabase-clients-contract.prompt.md
```

Still-to-author handcrafted prompts (3 — author next session):
- `W14-04` Phase 0 Supabase image inventory discovery
- `W14-09` Phase 3 site-wide audit script rewrite
- `W14-24` New `.github/instructions/supabase-audit.instructions.md`

---

## Step 1 — Confirm worktree isolation (MANDATORY)

```bash
cd /Users/dame/management-git/one4three-co-next-app
git branch --show-current   # MUST print: main
git status --short          # MUST be empty
git pull --ff-only origin main
git log -1 --oneline        # confirm f4550ee or newer
```

⛔ Do **not** `cd` into `copilot-audit-blast-radius-fix-plan` worktree.

---

## Step 2 — Drop handcrafted prompts into the repo

```bash
cd /Users/dame/management-git/one4three-co-next-app
mkdir -p .github/prompts/wave14
cp /Users/dame/management-git/audit-fix-ship/sessions/043-wave14-supabase/prompts-handcrafted/*.prompt.md \
   .github/prompts/wave14/
ls .github/prompts/wave14/W14-*.prompt.md | wc -l
# expect: 3 (will grow to 6 after the remaining handcrafted prompts are authored)
```

## Step 3 — Drop the generator

```bash
mkdir -p handoff/wave14
cp /Users/dame/management-git/audit-fix-ship/sessions/043-wave14-supabase/issues.ts handoff/wave14/
cp /Users/dame/management-git/audit-fix-ship/scripts/generate-prompts.mts handoff/wave14/
cp /Users/dame/management-git/audit-fix-ship/scripts/tsconfig.json handoff/wave14/
cp /Users/dame/management-git/audit-fix-ship/scripts/package.json handoff/wave14/
```

Commit `handoff/wave14/` so the next wave can fork from this template.

## Step 4 — Generate the bulk prompts

```bash
cd /Users/dame/management-git/one4three-co-next-app
npx tsx handoff/wave14/generate-prompts.mts --out .github/prompts/wave14
ls .github/prompts/wave14/W14-*.prompt.md | wc -l
# expect: 9 after generation (3 handcrafted + 6 generated from issues.ts)
# Will reach 22+ once W14-04, W14-09, W14-24 are added and the 12 swarm IDs are split into individual issues
```

Re-runs are SHA-gated — safe.

---

## Step 5 — Wave 0 verifications (BEFORE assigning to Copilot)

- [ ] `cd ~/management-git/ugwtf && npm run build` succeeds
- [ ] `node ~/management-git/ugwtf/dist/index.js status 043` reports green
- [ ] Confirm `SUPABASE_ACCESS_TOKEN` in `/Users/dame/management-git/one4three-co-next-app/.env.local`
- [ ] Confirm `OPENAI_API_KEY` set on Vercel (Jay Anthony account)
- [ ] Stakeholder has answered Q1–Q7 (see tracker) — required before Wave 2 starts
- [ ] Confirm Settings → Copilot → Coding agent → "Require approval for workflow runs" is **OFF** (per `ugwtf-workflow.instructions.md`)

---

## Step 6 — Feed into UGWTF pipeline (in order — never skip steps)

```bash
cd ~/management-git/ugwtf && npm run build

# 1. Spec issues from prompts
node dist/index.js prompts 043

# 2. Build chain
node dist/index.js generate-chain 043

# 3. Create chain-tracker issues + assign Copilot + advance
node dist/index.js chain 043

# 4. Triage
node dist/index.js issues 043

# 5. PR review gate
node dist/index.js prs 043
```

---

## Step 7 — Per-PR worktree convention

```bash
# For EACH issue Copilot picks up (one PR = one worktree):
cd /Users/dame/management-git/one4three-co-next-app
git worktree add ../one4three-co-next-app.worktrees/wave14-{slug} \
  -b copilot/wave14-{slug} origin/main

# After merge:
gh pr merge N --squash --delete-branch
cd /Users/dame/management-git/one4three-co-next-app
git worktree remove ../one4three-co-next-app.worktrees/wave14-{slug} --force
git branch -D copilot/wave14-{slug}
```

---

## Step 8 — Monitor

```bash
gh pr list --label "automation:in-progress" --search "W14"
gh issue list --label "chain-tracker" --search "W14"
node ~/management-git/ugwtf/dist/index.js audit 043
```

---

## Wave order (recommended sequence)

1. **W14-01, W14-02** parallel → cleanup type drift + duplicate wrappers (BEFORE schema work)
2. **W14-03** after 01+02 land → ESLint guard
3. **W14-04** Phase 0 discovery (read-only, single PR)
4. **Stakeholder answers Q1–Q7**
5. **W14-05** Phase 1 schema (sequential)
6. **W14-06, W14-07, W14-08** parallel doc rewrites
7. **W14-09** Phase 3 audit script rewrite
8. **W14-10..W14-21** Phase 4 swarm (12 parallel — strict no-overlap)
9. **W14-22** Phase 5b bundles deprecation
10. **W14-23** Phase 6 close + Wave 15 handoff

---

## Conventions reminder (don't violate)

- Branch: `copilot/wave14-{slug}` only
- Worktree per PR: NEW from `origin/main`
- Pre-commit gates: `npx tsc --noEmit` · `npm run lint` · `npm run build`
- Migration apply: `node scripts/apply-migration-via-rest.cjs <file>`
- Backup before destructive: `npx tsx scripts/backup-supabase-state.mts <scope>`
- PR body must include `Closes #N`
- Merge ONLY via GitHub UI (`gh pr merge` or web), never local `git merge`
- No literal "kill" in heredoc commit messages
