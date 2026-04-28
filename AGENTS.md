# AGENTS.md — audit-fix-ship

**Repository**: audit-fix-ship
**Type**: Reusable skill (templates + TypeScript scripts)
**UGWTF Alias**: `audit-fix-ship`

---

## Mission

Convert a stakeholder change request into a typed, validated, agent-ready prompt
batch with reality reconciliation. Codifies five lessons:

1. Audit reality before authoring prompts
2. Split handcrafted vs generated 1:8
3. Type the data, render the prompts (TS → N prompts, SHA-gated)
4. Wave-based execution with explicit blockers (0/1/2/3/3.5/4)
5. 4-swarm scan when source material is dense

---

## 5-Phase Workflow

| Phase | Output | Template |
|-------|--------|----------|
| 1. Audit | `reconciliation.md` | `templates/audit-checklist.md`, `templates/reconciliation.template.md` |
| 2. Stakeholder view | tracker | `templates/stakeholder-tracker.template.md` |
| 3. Handcrafted prompts | 24-section MDs | `templates/handcrafted-prompt.template.md` |
| 4. Generated prompts | typed batch | `scripts/issues.ts` + `scripts/generate-prompts.mts` |
| 5. Install runbook | handoff doc | `templates/install-runbook.template.md` |
| Optional | QA scan | `templates/four-swarm-scan.template.md` |

See `SKILL.md` for the full workflow guide. See `KICKOFF-PROMPT.md` to bootstrap
a new session.

---

## Repo Layout

```
audit-fix-ship/
├── README.md
├── SKILL.md                  ← workflow guide
├── KICKOFF-PROMPT.md         ← session bootstrap
├── templates/                ← 6 markdown templates (the contract)
├── scripts/                  ← standalone npm package (TS generator)
└── examples/                 ← worked example pointer
```

---

## Quality Gates

| Gate | Where | Command |
|------|-------|---------|
| TypeScript | `scripts/` | `cd scripts && npx tsc --noEmit` |
| Template stability | `templates/` | manual — section headings are the contract |
| Markdown lint | optional | none enforced |

No build, lint, or test pipeline at repo root — this is a templates+scripts
skill, not an app.

---

## How Agents Should Use This Repo

- **Authoring a new prompt batch** for any project: copy `KICKOFF-PROMPT.md`
  into a fresh session, then follow the 5 phases.
- **Drop-in mode**: copy `templates/` + `scripts/` into the consumer project
  repo (recommended) — see README.md "Option A".
- **Reference mode**: keep this repo standalone, point consumer projects at
  `~/management-git/audit-fix-ship/` paths.

---

## UGWTF Pipeline

```bash
cd ~/management-git/ugwtf
export GITHUB_TOKEN=$(gh auth token)
node dist/index.js status audit-fix-ship --no-cache
node dist/index.js issues audit-fix-ship --no-cache
node dist/index.js prs audit-fix-ship --no-cache
```

---

## Key References

- `SKILL.md` — full 5-phase workflow guide
- `KICKOFF-PROMPT.md` — paste into new Claude sessions
- `README.md` — repo overview, two usage modes
- `examples/README.md` — worked example pointer (JSR session)
- `.github/instructions/*.instructions.md` — universal workspace rules
