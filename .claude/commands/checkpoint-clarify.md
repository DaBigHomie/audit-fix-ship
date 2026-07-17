<!-- GENERATED FROM maximus-ai/.claude/commands/checkpoint-clarify.md -- do not edit; run sync-commands.mts -->
# /checkpoint-clarify — Checkpoint Reconciliation & No-Regression Planner

**Model:** claude-opus (orchestrator / synthesis lead)
**Agent:** CORTEX `581 checkpoint-clarifier` (cluster 12 Meta-Orchestration, swarm GOV)
**Panel (read-only specialists, `.claude/agents/`):** `supabase-specialist`, `fsd-architect`, `expo-mobile`, `vercel-deploy`
**Born:** 2026-06-06 session reconciling the ATB DB-regression checkpoints (`checkpoint:atb:2026-06-06-clarification-master-plan`).

Reconciles a pile of (possibly conflicting, partly-stranded) checkpoint/handoff docs into ONE corrected findings ledger + an ordered, regression-guarded execution plan + cloud-agent handoff prompts. Built for the failure mode where docs assert things that are stale or wrong.

---

## Step 0 — Ground before assuming (non-negotiable)
- Find EVERY referenced doc across **all branches, worktrees, and uncommitted working trees** — not just the current branch. A "missing" doc is usually on a PR branch or uncommitted in the primary checkout:
  ```bash
  git fetch --all -q
  for f in <doc-name-fragments>; do git log --all --oneline -- "*$f*"; git rev-list --all | xargs -I{} git ls-tree -r --name-only {} | grep -i "$f" | sort -u; done
  find "$(git rev-parse --show-toplevel)" /tmp/* -maxdepth 6 -iname "*<fragment>*" -not -path "*/node_modules/*" 2>/dev/null
  ```
- Verify live PR states with `gh pr view <n> --json state,mergedAt` — checkpoints lie about merge status. Treat doc claims as hypotheses.

## Step 1 — Live SSOT (what the docs couldn't reach)
- CORTEX mirror `eccpracfbrocmkzuogec` (Supabase MCP): read `cortex_tasks`/`cortex_knowledge` so the plan reconciles to existing tasks instead of duplicating.
- App prod DB is usually NOT reachable from cloud/sandbox — record verify-live items as owner-run, don't fake them.

## Step 2 — Deep-dive panel (read-only, parallel)
Run a `Workflow` fan-out (one stage per domain, `agentType` = the specialist), each returning a structured `{validated[], actions[]}` with `status ∈ {confirmed, refuted, already-fixed-on-main, cannot-verify-locally}`, `evidence` (file:line), and per-action `regressionRisk` + guard:
- **supabase-specialist** — migrations, ledger, RLS, type drift, destructive ops.
- **fsd-architect** — PR diffs → file-level KEEP/DROP cherry-pick & de-revert plans.
- **expo-mobile** — release gate: agent-doable vs owner-only; Stripe/EAS config.
- **vercel-deploy** — CI/migration-gate + the tracking matrix (finding → CORTEX task / GitHub / gap).

## Step 3 — Synthesize + adjudicate
- **Cross-read every doc + verify against source.** When the panel and a doc disagree, READ THE FILE (e.g. which interface owns a column) — the panel can reproduce a doc's bug. (See `[[project_membership_tier_two_columns]]`: a "reconcile schema.ts" recommendation was a reverted prod bug.)
- Output: corrected findings ledger → ordered execution waves (W0 verify-live first) → minimal NEW issues (most are already CORTEX-tracked) → PR dispositions → tracking plan → top risks + one guard each.

## Step 4 — Persist (durable, anti-stranding)
- Checkpoint doc → `docs/checkpoints/<date>-checkpoint-clarification-master-plan.md`.
- Cloud-agent handoff prompts → `docs/prompts/pending/NEXT-AGENT-*` (self-contained; commit + PR to **main** so cloud clones see them — never leave on a side branch).
- CORTEX: write `checkpoint:atb:<date>-*` knowledge; reconcile stale tasks (mark merged-PR tasks complete; correct mislabeled PR numbers); seed new gate tasks.

## Guardrails
Read-only until the plan is approved. No `db reset`/drop, no git hard-reset, no main push (fresh branch → PR). Gate every prod-ledger write on its confirm-SELECT. Hand to `/wave-dispatch` for cloud execution.
