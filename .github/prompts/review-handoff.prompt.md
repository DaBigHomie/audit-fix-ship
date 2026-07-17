---
description: "30x handoff review — audit docs, UGWTF PR/issue sweep, create task prompts, update scoreboard & roadmap"
agent: "agent"
---

# 30x Handoff Review Session

You are starting a **30x-level handoff review**. This is a full audit: review instructions, sweep PRs/issues, assess handoff doc completeness, generate task prompts, and update project tracking.

---

## Step 1: Ask Which Repo & Handoff

**Before doing anything**, ask me TWO questions:

### 1a. Which repo?

> Which repository should I review?

List repos in the workspace and wait for selection. Once selected, `cd` into that repo.

### 1b. Which handoff folder?

Scan the repo for all handoff folders and present the list:

```bash
find docs/ -maxdepth 1 -type d -name 'handoff-*' | sort
```

> Which handoff folder should I review? Here are the available ones:
> 1. `docs/handoff-xyz/`
> 2. `docs/handoff-abc/`
> ...

Wait for selection before proceeding.

---

## Step 2: Review Instructions (FIRST — Before Any Code Work)

Read the repo's instruction files to understand project context, conventions, and rules:

```bash
# Read in this order:
cat AGENTS.md                                    # Agent-specific rules
cat .github/copilot-instructions.md              # Copilot configuration
ls .github/instructions/                         # Path-specific rules
cat .github/instructions/*.instructions.md       # Skim key rules
```

**Document what you learned**:
- Tech stack & architecture pattern (FSD? flat? monorepo?)
- Build/test commands (which quality gates exist?)
- Supabase project ID (if applicable)
- Import rules & anti-patterns
- Any special pre-commit requirements (devtools tests, lint-staged, etc.)

---

## Step 2.5: Locate Project Tracking Data Sources

Before auditing handoff docs, **find where the real tracking data lives**. Different repos keep progress in different places — verify what exists and which is the source of truth.

### Common locations to check:

```bash
# Scoreboard / progress tracker
find . -name 'SCOREBOARD*' -not -path '*/node_modules/*'

# Roadmap / plan / todo files
find . -name '*PLAN*' -o -name '*TODO*' -o -name '*ROADMAP*' -o -name '*roadmap*' -o -name '*scoreboard*' 2>/dev/null | grep -v node_modules | grep -v .next

# Customer-facing status page (if one exists)
find src/app -path '*project-status*' -o -path '*status*' 2>/dev/null

# Config files that drive status pages
find src -name '*roadmap*' -o -name '*milestone*' 2>/dev/null | grep -v node_modules

# Workflow automation scripts
find . -path '*workflow*' -name '*.sh' -o -name '*.js' -o -name '*.ts' 2>/dev/null | grep -v node_modules | grep -v .next | head -20
```

### Document what you find:

| Data Source | Path | Current? | Notes |
|-------------|------|----------|-------|
| Dev scoreboard | `docs/SCOREBOARD.json` | ? | Main dev tracking |
| Customer roadmap | `src/shared/config/project-roadmap.ts` | ? | Drives /project-status |
| Task tracker | Handoff folder `03-TASK_TRACKER` | ? | May be stale vs scoreboard |
| TODO / plan | `docs/01_MVP_MASTER_PLAN.md` or similar | ? | Original plan |
| Automation | `.workflow-templates/` or `scripts/` | ? | Scoreboard updater |

**Cross-reference the scoreboard against the task tracker** — if the scoreboard shows items as complete that the task tracker shows as planned, the task tracker is stale and needs updating.

**The most recently updated data source is the source of truth.** Update stale docs to match.

---

## Step 3: UGWTF PR & Issue Sweep

Run a complete **Up, Get, What The F*** monitor** on the repo's GitHub state:

### 3a. Open Pull Requests

```bash
gh pr list --repo DaBigHomie/{REPO_NAME} --state open --json number,title,author,updatedAt,labels,headRefName
```

For each open PR:
- Read the PR description and review comments
- Check if it has unresolved Copilot reviewer feedback
- Determine: **merge**, **close**, **needs work**, or **stale**
- Note any PRs from Copilot coding agent (branch pattern: `copilot-*`)

### 3b. Open Issues

```bash
gh pr list --repo DaBigHomie/{REPO_NAME} --state open --json number,title,labels,assignees,updatedAt
```

For each open issue:
- Is it still relevant?
- Has it been addressed by recent commits?
- Should it be closed, assigned, or left open?
- Cross-reference against handoff task tracker (03-TASK_TRACKER)

### 3c. UGWTF Summary Table

Present findings:

| # | Type | Title | Status | Action |
|---|------|-------|--------|--------|
| #12 | PR | feat: add hero | Stale 30d | Close or merge? |
| #8 | Issue | Fix mobile nav | Addressed in abc123 | Close |
| ... | ... | ... | ... | ... |

Ask for approval before taking action on any PR/issue.

---

## Step 4: Deep Handoff Audit (30x Level)

Read **every file** in the selected handoff folder and assess:

### Completeness Check
- [ ] 00-MASTER_INDEX: Has real content (not template placeholders)?
- [ ] 01-PROJECT_STATE: Reflects current state (not stale)?
- [ ] 02-CRITICAL_CONTEXT: Documents real gotchas, anti-patterns, architecture decisions?
- [ ] 03-TASK_TRACKER: All tasks have accurate status (not-started/in-progress/completed)?
- [ ] 04-SESSION_LOG: Documents actual work sessions with dates and outcomes?
- [ ] 05-NEXT_STEPS: Prioritized P0-P3 with actionable items?
- [ ] 06-14 (if present): Filled with real content vs template stubs?

### Quality Scoring
Rate each doc 1-5:
- **5**: Production-ready, complete, accurate
- **4**: Good, minor gaps
- **3**: Partial — has content but missing sections
- **2**: Mostly template placeholders
- **1**: Empty or broken

### Gap Analysis
Identify:
- Stale information (dates, statuses that don't match reality)
- Missing docs that should exist for this project size
- Tasks marked "in-progress" that may be abandoned
- P0 items with no corresponding GitHub issue
- Architecture decisions not documented
- Known bugs or anti-patterns not captured
- PRs/issues discovered in Step 3 that aren't tracked in handoff docs

---

## Step 5: Create Task Prompts

For every **actionable gap or new task** discovered, create a `.prompt.md` file in the repo's `.github/prompts/`:

**Naming convention**: `{task-slug}.prompt.md`

**Format**:
```markdown
---
description: "Short action description"
agent: "agent"
---

[Detailed implementation instructions with:]
1. What to do (specific files, functions, components)
2. Acceptance criteria
3. Quality gates to run after
4. Which handoff docs to update when done
```

Group related tasks into single prompts when they share context. Create separate prompts for independent work streams.

---

## Step 6: Update Scoreboard & Roadmap

### Scoreboard
Find and update `docs/SCOREBOARD.json` (or create if missing):
- Update progress percentages based on audit findings
- Mark completed items as done
- Add newly discovered items from PR/issue sweep
- Update `lastUpdated` timestamp to today
- Ensure quality gate statuses reflect reality (`npx tsc --noEmit`, `npm run lint`, `npm run build`)

### Roadmap
Update `05-NEXT_STEPS` (or a dedicated roadmap file if one exists) with **all** prioritized items:

- **P0 — This Week**: Ship immediately, blocking deployment
- **P1 — Next Sprint**: Important but not blocking
- **P2 — Backlog**: Nice-to-have improvements
- **P3 — Future**: Ideas, experiments, stretch goals
- **Blocked**: Items waiting on external input, decisions, or dependencies

Include items from:
- Handoff gap analysis (Step 4)
- Open issues still relevant (Step 3)
- PR review findings (Step 3)
- Quality gate failures found during audit

---

## Step 7: Present Summary & Commit

### Summary Table

| Doc | Score | Status | Action Needed |
|-----|-------|--------|---------------|
| 00-MASTER_INDEX | 4/5 | Good | Update session count |
| ... | ... | ... | ... |

**Overall Handoff Health**: X/5
**PRs Reviewed**: X open → Y actionable
**Issues Reviewed**: X open → Y actionable
**Prompts Created**: [list new .prompt.md files]
**Scoreboard Updated**: Yes/No
**Roadmap Updated**: Yes/No

### Commit Workflow

Ask: **"Ready to commit and merge these updates?"**

On approval:
1. Create a feature branch: `git checkout -b handoff-review/{handoff-folder-slug}`
2. Run quality gates: `npx tsc --noEmit && npm run lint && npm run build`
3. Stage and commit:
   ```bash
   git add -A
   git commit -F - <<'EOF'
   docs: 30x handoff review — {handoff-folder-name}

   - Audited X handoff docs (avg score: Y/5)
   - Reviewed X PRs, X issues
   - Created X task prompts
   - Updated scoreboard + roadmap

   Testing Evidence:
   - TypeScript: 0 errors
   - Lint: 0 errors
   - Build: Successful
   EOF
   ```
4. Push branch: `git push origin handoff-review/{handoff-folder-slug}`
5. Merge to main:
   ```bash
   git checkout main
   git merge handoff-review/{handoff-folder-slug}
   git push origin main
   ```
6. Clean up: `git branch -d handoff-review/{handoff-folder-slug}`

---

## Rules

- **Read instructions FIRST** (Step 2) — understand the project before auditing
- **Read ALL handoff files** before scoring — don't skim
- **Cross-reference** handoff docs against actual codebase state (run `git log`, check file existence)
- **Cross-reference** PRs/issues against task tracker — flag orphaned items
- **Don't create prompts for trivial tasks** — only actionable work that takes >15 minutes
- **Preserve existing content** — append/update, don't overwrite good work
- **Use portable paths** — never hardcode user-specific paths
- **Run quality gates** before committing any changes
- **Always branch, commit, push, merge** — never commit directly to main
