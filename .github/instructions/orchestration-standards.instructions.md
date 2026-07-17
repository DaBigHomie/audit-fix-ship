---
title: Orchestration Standards
version: 1.0.1
updated: 2026-07-08
applies_to: '**'
---
<!-- GENERATED FROM maximus-ai/.github/instructions/orchestration-standards.instructions.md -- do not edit; run sync-instructions.mts -->

<!-- BEGIN: orchestration-standards-enforcer (source: documentation-standards/skills/orchestration-standards-enforcer/SKILL.md) -->
## Orchestration Standards (MALFIG-aligned)

- **4-gate stack, in order:** `forecast-scrutiny` → `MALFIG` (G1-G14) → `forensic-auditing` (Rules 1-5) → `doc-forensic-inventory`. Bounded fix loop of 1 iteration per gate. Merge only on all-gates-PASS.
- **Fresh worktrees only.** No git checkout / reset / rm on shared trees. Cut a worktree per PR from `origin/main` (or `origin/master`). Peer prior-art (each verified MERGED via `gh pr view`, repo-prefixed to disambiguate): `maximus-ai #196`, `maximus-ai #197`, `maximus-ai #198`, `maximus-ai #199`, `maximus-ai #200`, `maximus-ai #201`, `maximus-ai #202`, `docstd #64`, `polaris #14`.
- **Verify-then-write.** Every SHA, PR, path, task_id, or CLI shape cited MUST be verified against real state (`gh pr view`, `git show origin/<branch>:<path>`, `test -f`, `which <bin>`, `--help` probe). Reject unverified subagent claims before durable writes.
- **No fabrication.** Unknown CLI shapes, model IDs, capability profiles, or invocation APIs are marked `UNKNOWN — research required` and filed as follow-up tasks. Never invent flags, headers, or paths.

Source: `documentation-standards/skills/orchestration-standards-enforcer/SKILL.md` — do not edit this block in place; run the enforcer script to update.
<!-- END: orchestration-standards-enforcer -->
