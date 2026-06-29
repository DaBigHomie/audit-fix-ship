# Kickoff Prompt — 043 Wave 14 (remixed)

I'm starting an audit-fix-ship cycle. Use the workflow defined in `audit-fix-ship/SKILL.md`.

**Project:** ONE4THREE (one4three.co)
**Repo path:** `/Users/dame/management-git/one4three-co-next-app` (main worktree, read-only)
**Stack:** Next.js 15 (App Router, Turbopack), React 19, TypeScript strict, Supabase (project `bgqjgpvzokonkyiljasj`), Stripe v21, Tailwind CSS, Framer Motion, FSD architecture
**Stakeholder:** DaBigHomie (owner) — non-technical product direction; Jay Anthony (Vercel account holder)
**Source material:**
  1. Wave 14 handoff `docs/active/jsr-rescue-handoff/wave14-handoff-2026-04-28.md` (image-registry remix, 7 phases, ~22 PRs)
  2. Supabase audit findings (this session, 2026-04-28): type drift, duplicate client wrappers, direct `@supabase/supabase-js` imports
  3. User annotation patch `docs/active/jsr-rescue-handoff/wave14-annotations.patch`
**Deadline:** rolling — Wave 14 closes when image registry is Supabase-canonical and stale-scope code paths are migrated
**Batch prefix:** `W14`

**Sibling repos to reference:**
- `/Users/dame/management-git/image-gen-30x-cli` — source of truth for generated images, see `docs/AGENT_DOCS.md`
- `/Users/dame/management-git/ugwtf` — pipeline orchestrator (`node dist/index.js`)

**Agent pipeline this feeds into:** UGWTF + Copilot cloud agent. Commands the install runbook references:
- `cd ~/management-git/ugwtf && npm run build && node dist/index.js prompts 043`
- `node dist/index.js generate-chain 043 && node dist/index.js chain 043`
- `gh pr merge N --squash --delete-branch`

**Existing repo conventions to respect:**
- Branch pattern: `copilot/wave14-{slug}` (one issue → one PR → one **new** worktree off `origin/main`)
- Commit format: Conventional Commits, `Closes #N` in PR body, never local `git merge`
- Workflows that auto-run: `ci.yml`, `copilot-full-automation.yml`, `supabase-migration-automation.yml`, `enforce-naming-convention.yml`
- Existing automation: `.github/prompts/`, `.github/instructions/` (19 files), `.github/agents/`, UGWTF labels (79+)
- Worktree isolation MANDATORY (see Wave 14 handoff): never edit in `copilot-audit-blast-radius-fix-plan` (Wave 12 leftover with volatile annotations)
- Migration runner: `node scripts/apply-migration-via-rest.cjs <file>` (NOT `supabase db push`)
- Pre-commit gates: `npx tsc --noEmit` · `npm run lint` · `npm run build`
- Avoid the literal word "kill" in heredoc commit messages (Wave 12 shell parser quirk)

**Wave 0 verifications:**
- Confirm `main` worktree clean: `cd $REPO && git status --short` (must be empty)
- Confirm latest pulled: `git log -1 --oneline` shows `f4550ee` or newer
- Confirm `SUPABASE_ACCESS_TOKEN` in `.env.local` for Management API
- Confirm `OPENAI_API_KEY` set on Vercel (Jay Anthony account) for admin AI generator

**Optional flags:**
- 4-swarm scan: **no** (source is structured handoff + audit JSON, not transcript)
- Skip handcrafted prompts: **no** — write 6 by hand (B1/B2/B3 Supabase + Phase 0 discovery + Phase 1 schema + Phase 3 site-wide audit script)
