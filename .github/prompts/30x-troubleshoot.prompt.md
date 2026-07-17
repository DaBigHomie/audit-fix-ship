---
description: "30x troubleshooting — diagnose errors, blast radius analysis, phased fix with portable .mts scripts"
argument-hint: "Paste the error output, or describe the issue"
agent: "30x-troubleshoot"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/30x-troubleshoot.prompt.md -- do not edit; run sync-agents.mts -->

# 30x Troubleshoot

Diagnose the reported issue, produce a Blast Radius Reduction Plan, and implement a phased fix using portable TypeScript scripts. Zero scope creep.

## Invoke

```
@30x-troubleshoot {error output or issue description}
```

## Workflow

### 1. Load Context

The agent loads workspace and repo instructions automatically:

```bash
cat .github/copilot-instructions.md
cat AGENTS.md
cat .github/instructions/commit-quality.instructions.md
cat .github/instructions/core-directives.instructions.md
cat .github/instructions/typescript.instructions.md
```

Plus any domain-specific instruction files matching the error type.

### 2. Triage

- Reproduce the error (run failing command, capture full output)
- Classify: build / type / lint / runtime / CI / CSS warning
- Isolate root cause file(s) and line(s)

### 3. Blast Radius Analysis

- Map every file importing or consuming the broken symbol
- Produce a **Blast Radius Reduction Plan** table:
  - File path, action (MODIFY/READ-ONLY), risk level, phase, consequence

### 4. Phased Fix

- **Phase A**: Fix root cause (types, interfaces, exports)
- **Phase B**: Fix direct consumers
- **Phase C**: Fix indirect consumers (pages, tests)
- Max 3 files per phase
- Quality gates (`tsc` + `lint` + `build`) between every phase
- If > 3 files total → create `scripts/fix-{slug}.mts`

### 5. Report

Output a structured report with:
- Error classification + root cause
- Blast radius table with consequences
- Phase results with gate evidence
- Scripts created (if any)

## Rules

- **Zero scope creep** — fix only the reported issue
- **Max 3 files per phase** — split larger fixes into phases
- **TypeScript scripts only** — no Python, no Bash automation
- **Verify after every phase** — `npx tsc --noEmit && npm run lint && npm run build`
- **Never delete files without confirmation** — present table first

## Related Agents

- `@30x-troubleshoot` — primary agent for this workflow
- `@deploy-gate` — post-fix quality gate validation
- `@code-review` — review fix before commit
- `@playwright-runner` — E2E verification for UI fixes
