---
description: "Generate a Context Manifest for audit-fix-ship (skill templates + scripts). Use when: handing off a CR batch, wave status, or template changes."
argument-hint: "Optional; default = git root from cwd"
---

# Context Manifest Generator (audit-fix-ship)

You are generating a **Context Manifest** for **audit-fix-ship** — templates, `scripts/` TypeScript, `SKILL.md`, and `KICKOFF-PROMPT.md`. Use the **same numbered sections** as other repos (1–7) so handoffs stay consistent.

## Step 1: Gather Context

1. **Git**: `git log --oneline -15`, `git branch --show-current`, `git status --short`
2. **GitHub** (if available): `gh issue list`, `gh pr list`
3. **Layout**: `templates/`, `scripts/`, `SKILL.md`, `KICKOFF-PROMPT.md` — see `AGENTS.md` tree
4. **Instructions**: `AGENTS.md`, `.github/copilot-instructions.md` if present
5. **Quality**: `cd scripts && npx tsc --noEmit` status

## Step 2: Ask the User (if needed)

Session goal, blockers, decisions for the next agent.

## Step 3: Generate the Manifest

Use the standard sections **1–7** (Completed Work through Agent Quickstart). For **Completed Work**, reference template paths and script outputs (`scripts/issues.ts`, prompt batches) accurately.

Template skeleton:

```markdown
# Context Manifest

**Repo**: audit-fix-ship
**Branch**: {branch}
**Generated**: {YYYY-MM-DD HH:mm}
**Session Goal**: {goal}

---

## 1. Completed Work
(tables + commits)

## 2. Pending Logic Hurdles

## 3. Architectural Decisions

## 4. Next Steps

## 5. User Intention

## 6. Reference Links
- [AGENTS.md](AGENTS.md)
- [SKILL.md](SKILL.md)
- [templates/](templates/)

## 7. Agent Quickstart
- **Quality**: `cd scripts && npx tsc --noEmit`
- **UGWTF**: see AGENTS for CLI alias `audit-fix-ship`
```

## Step 4: Save

`docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/CONTEXT_MANIFEST.md`

## Rules

- Real paths only; concise tables; no stale claims — verify with git
