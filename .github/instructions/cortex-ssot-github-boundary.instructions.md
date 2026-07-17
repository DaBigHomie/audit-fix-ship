---
applyTo: "**"
---
<!-- GENERATED FROM maximus-ai/.github/instructions/cortex-ssot-github-boundary.instructions.md -- do not edit; run sync-instructions.mts -->

# CORTEX-first, GitHub-last — SSOT and gate-authority boundary

Task-state, knowledge, and gate authority live in CORTEX, not GitHub. GitHub is a
transport (PR mechanics) — never a lookup surface for work state.

## Rules

1. **Task discovery: CORTEX only.** NEVER use `gh issue list`, `gh pr list`, GitHub
   search, or grep over markdown plans to find work. The SSOT is `cortex_tasks`
   (Supabase `eccpracfbrocmkzuogec`, PostgREST). Standing menus come from
   `/prime-orchestration-continue*`, not GitHub queries.
2. **gh CLI allowed ONLY for PR mechanics on a known PR:** create / view / merge /
   comment, merge-SHA capture (rule 12903), and CI status of that specific PR.
3. **Gate authority (PRM-0012):** GitHub Actions results and Copilot surfaces are
   NOT merge-gate authority. Valid CI signals: Vercel preview + Supabase advisors.
   A red GHA check requires DIAGNOSIS before trust — check-run annotations can be
   infrastructure (e.g. 2026-07-17: account billing lock failed every job in 3s
   with empty steps; code was green locally).
4. **Knowledge lookups: query `cortex_knowledge` first.** GitHub code search across
   repos is a last resort, never the first.
5. **File content: read the LOCAL clone.** Use `git show origin/<branch>:<path>`
   for verified state (never the worktree for state claims, never
   raw.githubusercontent.com / api.github.com for files that exist locally).
6. **Copilot config is config.** `.github/copilot-instructions.md` and
   `.github/instructions/*` are read from the local checkout and obeyed — not
   fetched from github.com, not treated as governance authority.

## Recognize-and-route

Symptom: an agent enumerating `gh issue list --assignee @me` or grepping
MASTER-TASKLIST/plans for a queue. Route: stop, run the CORTEX boot/query pattern
(`/prime-orchestration-query-cortex`), file drift against this instruction.

Change Log: 2026-07-17 initial (TASK-GH-BOUNDARY-PROGRAM-20260717; composes
PRM-0012, rule 12903, bgs-must-read-origin-main-not-worktree).
