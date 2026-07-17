---
name: audit-fix-ship
description: Audit an implementation/plan/change with 50x logic tools (doc-forensic-inventory, forecast-scrutiny, forensic-auditing, supabase-postgres-best-practices), FIX every finding without exception, then SHIP it safely to a PR for MALFIG — using non-destructive git only. Use when the user says "audit-fix-ship", "audit fix and ship", "run audit fix ship", "package and PR this for malfig", or wants a change taken from raw work → audited → fixed → PR-ready under PRIME/MALFIG governance. Extends audit-fix-plan with a governed Ship phase.
---

# audit-fix-ship

Global evolution of `audit-fix-plan`: **Audit → Fix → Ship**. Adds a governed shipping
phase (safe git + gates + PR for MALFIG) on top of the 50x audit/fix loop. Import target for
"Audit-Fix-Ship as a global skill."

## Phase 1 — Audit (50x logic)
Run against the target file(s)/change:
- `forensic-auditing` — crude regex, filename assumptions, ignored Git HEAD, DAG-dependency violations.
- `forecast-scrutiny` — blast radius (git ops, file writes, DB ops); adversarial scrutiny for wrong
  targets, hidden defaults, name != behavior, partial-state risk. Must return **PROCEED** to Ship.
- `doc-forensic-inventory` — downstream docs/manifests/instructions that will suffer semantic drift.
- `supabase-postgres-best-practices` — any Postgres/RLS op for performance + best practice.

Emit inline `> [!WARNING]` / `> [!IMPORTANT]` alerts into the target where risks live, tagged with
the skill that found them.

## Phase 2 — Fix (no exceptions)
Craft a 50x remediation plan and execute it. Leave **zero** identified risks unresolved. Re-run the
Phase 1 tools until clean. Repo-specific hard rules to fix on sight (maximus-ai / MALFIG):
- Scripts must be `.ts`/`.mts` only — port any `.py`/`.sh`/`.js` helper.
- No orphaned `package.json` under `src/` (MALFIG G6). CLI/libs live in `.system/` or `packages/`.
- No emojis, no prose filler in artifacts. YAML frontmatter on every doc (title, doc_type, repo,
  session_id, created, status, tags).
- No hardcoded user paths or hex/rgb/hsl colors.

## Phase 3 — Ship (governed, non-destructive git)
> [!CAUTION]
> NEVER `git reset --hard`, `git push --force`, or delete unmerged branches/worktrees. Stash first,
> always. Never commit directly to `main`. `git fetch → rebase (--autostash)`, never a destructive checkout.

1. **Pre-flight**: `git fetch origin`; `git status --short`. If the working tree is dirty and unrelated,
   isolate in a **new worktree** off `origin/main` (`git worktree add ../<slug> -b feat/<slug> origin/main`).
2. **Place** files per FSD + PAC (see PRIME-PLACEMENT-ASSIGNMENT-CHARTER): `src/features/{slice}/`
   one-way imports; docs flat in `{repo}/docs/`; charters in `docs/prime-governance/`.
3. **Gates (MALFIG)**: `npx tsc --noEmit && npm run lint && npm run build` → 0 errors.
   `npx tsx documentation-standards/scripts/warden-doc-place.mts docs/ --json` → 0 blocker.
   If schema touched: `get_advisors security` → no new zero-policy tables.
4. **Target dry-run** (PR/merge): `git fetch origin && git merge origin/main --no-commit --no-ff` then
   `git merge --abort` (or `gh pr view <n> --json mergeable`). CONFLICTING → BLOCKED.
5. **Commit + PR**: unique `TASK-*` id in the message; end with the repo's commit trailer. Push the
   feature branch; `gh pr create`. Add the MALFIG label (e.g. `audit:malfig-gatekeeper`) so MALFIG runs.
6. **Register (if PRIME component)**: attach the PAR bundle (see PRIME-APPLICATION-FOR-REVIEW), diff
   `prime-component-registry.json`, and note the seed + ANVIL checkpoint command — do not merge to main.

## Output — plain text, MALFIG-compliant (no emoji)
```
TASK-XXXX — Audit-Fix-Ship
Audit:  {forensic|forecast|doc-inventory|pg} findings: N (all fixed)
Forecast verdict: PROCEED | HOLD
Gates:  tsc PASS | lint PASS | build PASS | warden SHIP
Git:    branch <feat/...>  (no destructive ops)
PR:     <url>   label: <malfig label>
Verdict: SHIPPED-TO-PR | BLOCKED (reason)
```
