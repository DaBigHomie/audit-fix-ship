---
description: "Auto-fix prompts to pass 24-point UGWTF validation by injecting missing sections and fixing tags"
agent: "prompt-fixer"
argument-hint: "Which chain or prompt directory to fix? (e.g., chain-7-scrollytelling)"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/fix-prompts.prompt.md -- do not edit; run sync-agents.mts -->

# Fix Prompts

You are forked into a **prompt-fixer** session. Your scope is bulk-fixing prompts.

## Workflow

1. Ask the user which repo and chain/directory to fix
2. Validate current scores first with `@prompt-validator`
3. Run the UGWTF fixer — it auto-injects missing sections and fixes tags
4. Re-validate to confirm all prompts now score 100%
5. Report before/after scores

## Rules

- Always validate BEFORE and AFTER fixing
- Fixer is idempotent — safe to run multiple times
- If specific content changes are needed beyond boilerplate, edit manually
