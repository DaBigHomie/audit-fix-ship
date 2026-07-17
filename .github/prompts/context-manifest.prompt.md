---
description: "Generate a Context Manifest for the documentation-standards hub (docs, templates, scripts, cross-repo indexes). Use when: handing off work, checkpointing, onboarding an agent to this repo."
argument-hint: "Optional; default = git root from cwd (this repository)"
---

# Context Manifest Generator (documentation-standards)

You are generating a **Context Manifest** for **`documentation-standards`** — the workspace hub for shared instructions, templates, CLI scripts (Slack, workspace audit), and indexes (`KEY-FILES.md`, `docs/REPO-INDEX.md`). Use the **same section layout** as application repos so agents can rely on one format.

## Step 1: Gather Context

Collect from **this repo**:

1. **Git**: `git log --oneline -20`, `git branch --show-current`, `git status --short`, `git diff --stat HEAD~3`
2. **GitHub**: `gh pr list` / `gh issue list` if `gh` is available
3. **Layout**: Primary dirs are `docs/`, `templates/`, `scripts/` — there is typically **no** app `src/` tree
4. **Instructions**: `.github/copilot-instructions.md`, `AGENTS.md`, task-scoped `.github/instructions/` when relevant
5. **Indexes**: `KEY-FILES.md`, `docs/AGENT-CONTEXT-KEY.md`, `docs/REPO-INDEX.md` when the session touched cross-repo guidance
6. **Quality**: Note last `npx tsc --noEmit` / `npm run validate` / `npm run lint` if recorded or run now for `scripts/` or repo root per `AGENTS.md`

## Step 2: Ask the User

Ask only if not already stated:

- Primary goal this session?
- Blockers or decisions to record?
- Anything a fresh agent must know that is not in files?

## Step 3: Generate the Manifest

Use this structure:

```markdown
# Context Manifest

**Repo**: documentation-standards
**Branch**: {current-branch}
**Generated**: {YYYY-MM-DD HH:mm}
**Session Goal**: {user's stated intention}

---

## 1. Completed Work

| Item | Change Type | Status | Notes |
|------|---------------|--------|-------|
| `docs/...` or `templates/...` or `scripts/...` | created/modified/deleted | ✅ / ⚠️ | Brief |

### Recent Commits
- `hash` — message

---

## 2. Pending Logic Hurdles

| Hurdle | Severity | Blocking? | Context |
|--------|----------|-----------|---------|

---

## 3. Architectural Decisions

| Decision | Rationale | Alternatives |

---

## 4. Next Steps

| # | Task | Priority | Notes |

---

## 5. User Intention

> {Broader goal}

---

## 6. Reference Links

- [AGENTS.md](AGENTS.md)
- [.github/copilot-instructions.md](.github/copilot-instructions.md)
- [KEY-FILES.md](KEY-FILES.md)
- [docs/REPO-INDEX.md](docs/REPO-INDEX.md) — if applicable

---

## 7. Agent Quickstart

### Environment
- **Role**: Shared docs + scripts hub (not a deployed app)
- **Checks**: Per `AGENTS.md` / `package.json`

### Critical Rules
- Do not commit secrets; portable paths only
- Slack tooling: see `scripts/README.md`, `post-handoff-to-slack.mjs`, parent `.env.mcp` patterns in docs

### Current State
- **Uncommitted changes**: Yes/No
```

## Step 4: Save the Manifest

Save to: `docs/context-manifests/{YYYY-MM-DD}_{HH-mm}/CONTEXT_MANIFEST.md`

## Rules

- **Precise paths** — real files only  
- **Concise** — tables over prose  
- **Cross-repo** — when this session affected “which repo loads what,” cite `KEY-FILES.md` / manifests
