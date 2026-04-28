# Copilot Instructions — audit-fix-ship

**Repository**: audit-fix-ship
**Owner**: DaBigHomie
**Type**: Reusable Claude skill (templates + TypeScript scripts)
**UGWTF Alias**: `audit-fix-ship`

---

## What This Is

A drop-in skill that converts stakeholder change requests into typed, validated,
agent-ready prompt batches with reality reconciliation. See `SKILL.md` for the
5-phase workflow and `KICKOFF-PROMPT.md` for session bootstrap.

---

## Standards Reference

This repo follows the DaBigHomie workspace standards. Universal rules live in
`.github/instructions/` and are synced from
[DaBigHomie/documentation-standards](https://github.com/DaBigHomie/documentation-standards)
via `scripts/push-rules.mts`.

Every agent MUST load before any work:
1. `.github/copilot-instructions.md` — this file
2. `AGENTS.md` — repo context + the 5-phase audit/fix/ship workflow
3. `.github/instructions/*.instructions.md` — universal rules (6 files)

---

## Mandatory Pre-Commit Checks

```bash
# scripts/ contains a standalone npm package
cd scripts && npx tsc --noEmit   # 0 errors required
```

The repo root has no build/lint pipeline (templates + markdown). Quality gates
apply to anything inside `scripts/`.

---

## Core Rules

### Portable Paths
- NEVER `/Users/dame/...` or any hard-coded user path
- ALWAYS `~/`, `./`, `$(pwd)`, relative paths

### Branch Safety
1. Create a new branch before editing — never commit to `main` directly
2. `git branch --show-current` before every commit
3. Never delete a branch you didn't create

### Commit Format
`feat/fix/docs/chore: [description]`

Multi-line: use heredoc (`git commit -F - <<'EOF' ... EOF`).

### Templates Are the Product
- `templates/*.template.md` files are the contract — keep section headings stable
- Breaking template structure breaks every downstream consumer's generator
- When changing a template, bump the version note at the top and document in `SKILL.md`

---

## UGWTF Pipeline

Monitored by UGWTF (alias: `audit-fix-ship`).

```bash
cd ~/management-git/ugwtf
export GITHUB_TOKEN=$(gh auth token)
node dist/index.js status audit-fix-ship --no-cache
```

---

## Instruction Files (auto-synced)

| File | Purpose |
|------|---------|
| `agent-execution-constraints.instructions.md` | Stop, scripts-over-commands, TS-only |
| `commit-quality.instructions.md` | Pre-commit gates, branch safety |
| `core-directives.instructions.md` | Automation-first, FSD, portable paths |
| `pr-review.instructions.md` | Copilot review handling, gates |
| `typescript.instructions.md` | TS conventions |
| `workflow-syntax.instructions.md` | GitHub Actions YAML rules |

To resync: `cd ~/management-git/documentation-standards && npx tsx scripts/push-rules.mts --repo audit-fix-ship`
