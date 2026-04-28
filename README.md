# audit-fix-ship

A reusable Claude skill for converting a stakeholder change request into a typed, validated, agent-ready prompt batch — with reality reconciliation built in.

## What this is

A folder of templates + scripts you drop into a Claude session (or a project) to repeat the audit/fix/ship cycle on any deadline-driven dev project. Codifies five lessons from the first run:

1. **Audit reality before authoring prompts** — save the wrong v1
2. **Split handcrafted vs generated 1:8** — invest authorship time on the gnarly few
3. **Type the data, render the prompts** — one TypeScript file, N prompts, SHA-gated
4. **Wave-based execution with explicit blockers** — 0/1/2/3/3.5/4
5. **4-swarm scan when source material is dense** — catches what summarization compressed out

## Folder map

```
audit-fix-ship/
├── README.md                                 ← you are here
├── SKILL.md                                  ← skill definition + workflow guide
├── KICKOFF-PROMPT.md                         ← paste into new sessions
├── templates/
│   ├── audit-checklist.md                    ← Phase 1 — verify reality
│   ├── reconciliation.template.md            ← Phase 1 output
│   ├── stakeholder-tracker.template.md       ← Phase 2 — non-technical view
│   ├── handcrafted-prompt.template.md        ← Phase 3 — 24-section format
│   ├── install-runbook.template.md           ← Phase 5 — handoff
│   └── four-swarm-scan.template.md           ← Optional QA pass
├── scripts/
│   ├── issues.ts                             ← Phase 4 — typed data (parameterize per project)
│   ├── generate-prompts.mts                  ← Phase 4 — generator
│   ├── tsconfig.json                         ← For tsx execution
│   └── package.json                          ← Standalone npm package
└── examples/
    └── README.md                             ← Worked example pointer (JSR session)
```

## Two ways to use it

### Option A: Drop into the project repo (recommended)

```bash
# In the target project repo
mkdir -p .claude/skills
cp -r /path/to/audit-fix-ship .claude/skills/

# Or as a workflow handoff folder
mkdir -p handoff
cp -r /path/to/audit-fix-ship/scripts/* handoff/
cd handoff && npm install
```

Claude sessions opened against this repo will discover the skill via the SKILL.md frontmatter and use it automatically when triggered.

### Option B: Per-session resource

Upload the folder as a project resource in Claude.ai, or paste the contents of `KICKOFF-PROMPT.md` at the start of a new conversation.

## Token efficiency

This skill exists primarily to reduce token cost on repeat cycles. Mechanism:

1. **One-time skill load (~6k tokens)** vs re-deriving the workflow each session (~15–20k tokens)
2. **Templates loaded only when needed** — `audit-checklist.md` for Phase 1, `handcrafted-prompt.template.md` for Phase 3, etc.
3. **Generator renders prompts locally** — 40 prompts × ~1000 tokens = 40k tokens of output if rendered in chat. With the generator: ~5k tokens for the typed data + 0 marginal tokens per prompt (TypeScript runs locally).
4. **Reference repo conventions, don't inline them** — every generated prompt points to `.github/instructions/typescript.instructions.md` rather than including its content.

A 30-issue cycle on a familiar stack: ~30k tokens end-to-end.
A 50-issue cycle with deep audit + 4-swarm scan: ~80k tokens.

## Quickstart

1. Copy this folder somewhere accessible to your Claude session
2. Open a new conversation
3. Paste `KICKOFF-PROMPT.md` contents, replacing the bracketed values with your actual project details
4. Claude reads SKILL.md, runs the audit, and produces deliverables in 30–60 minutes

## Customization per project

The skill is opinionated but parameterized:

- **`scripts/issues.ts` → CONFIG object** — change `prefix`, `bootstrapFiles`, `areaBootstrap`, `stackLabel`, `fsdMapping`, `branchPattern`, `workflows`. These adapt the generated prompts to whatever conventions your repo already uses.
- **`templates/handcrafted-prompt.template.md`** — strip sections that don't apply to your stack (e.g. remove "Database / Supabase" if you don't use Supabase)
- **`templates/audit-checklist.md`** — add project-specific checks (e.g. if you use a custom internal tool, add a step to verify it's installed)

Resist the urge to hand-edit generated prompts. Always edit `issues.ts` and re-run.

## Worked example

See `examples/README.md` for the JSR-2026-04-22 session — 44 issues, 5 handcrafted, 39 generated, full audit + 4-swarm scan. Token cost: ~80k.
