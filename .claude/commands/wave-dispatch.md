# /wave-dispatch — Cloud Wave Executor (model-routed, scheduled)

**Model:** claude-opus (orchestrator) + claude-haiku (mechanical fan-out) + claude-sonnet (judgement triage)
**Agent:** CORTEX `582 pr-surgery-wave-executor` (cluster 12 Meta-Orchestration, swarm A)
**Born:** 2026-06-06 — dispatched ATB Wave-W2 PR-surgery to a scheduled cloud agent (`trig_01AGrMtkzWtKsMWSX3ZNH9qZ`).

Takes a self-contained wave handoff prompt and runs/schedules it as an autonomous **cloud** Claude Code agent, with per-task Claude model assignment baked in. Built for the safe, off-`main`, PR-only execution lanes that don't need the live DB.

---

## Step 1 — Route models (`/multi-model-task-assignment`)
For each sub-task, compute blast radius + assign a Claude model:
- **Opus 4.8** — judgement / conflict-resolution / auth-or-FSD correctness (orchestrator does these inline).
- **Haiku 4.5** — mechanical single-file refactors, string→constant swaps (fan out as parallel subagents).
- **Sonnet 4.6** — PR triage / review judgement.
Save the assignment to CORTEX: `assignment:<date>:<wave>` knowledge + `cortex_tasks.output_blob` per task.

## Step 2 — Make the prompt cloud-visible (anti-stranding)
A fresh cloud clone sees only `main`. Either **merge the docs PR carrying the handoff prompt to main first** (recommended), or add the prompt's branch as a routine git source. Confirm with `git ls-tree origin/main` that the prompt path exists.

## Step 3 — Bake guardrails into the prompt
The remote agent starts with ZERO context. The prompt MUST state: read the handoff index + wave prompt first; cloud-only (no live DB; the app prod DB is unreachable); no main push (fresh branch → PR via `gh`); each task passes `tsc`/`lint`/`build` or opens a DRAFT PR with blockers; never hardcode secrets; and any domain landmines (e.g. `[[project_membership_tier_two_columns]]` — do NOT edit `UserRow.membership_tier`). Add an **Environment & CORTEX access** block: gitignored env is absent and that's fine; reach CORTEX via the attached Supabase MCP (`eccpracfbrocmkzuogec`) and skip silently if unavailable — never block a PR on it.

## Step 4 — Schedule / run (`/schedule` → `RemoteTrigger`)
- One-time: `run_once_at` (RFC3339 UTC; convert from America/New_York; re-check `date -u` first).
- `job_config.ccr`: `environment_id`, `session_context.model = claude-opus-4-8`, `sources` = repo, `allowed_tools` include `Agent` for the Haiku fan-out.
- Confirm the resolved local+UTC time with the owner before creating. Output the routine URL `https://claude.ai/code/routines/{id}`.

## Step 5 — Track
Echo the routine id + run time to CORTEX; the deliverable is one PR per task group. Owner-only DB waves (verify/ledger/`db push`) are NOT dispatchable here — leave them in the W1/owner prompt.

## Guardrails
Never schedule a wave that needs the live DB. Never put secrets in a routine prompt. Confirm time + scope with the owner before `RemoteTrigger create`.
