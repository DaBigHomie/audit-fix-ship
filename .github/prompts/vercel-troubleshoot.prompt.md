---
description: "Troubleshoot Vercel build errors, warnings, and deployment failures"
agent: "vercel-doctor"
argument-hint: "Paste build log or describe the error"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/vercel-troubleshoot.prompt.md -- do not edit; run sync-agents.mts -->
Diagnose and fix the Vercel build issue described below.

**Steps:**
1. If the user pasted a build log, parse it for errors and warnings
2. If no log provided, run `npm run build 2>&1` in the target repo and capture full output
3. Grep the FULL output for: `error`, `warning`, `deprecated`, `Unexpected`, `Parsing CSS`, `Module not found`
4. Trace each issue to its source file
5. Apply fixes and verify with a clean rebuild

**CRITICAL**: Never use `tail` on build output. Never assume exit code 0 means clean. Always grep the full output.

{{input}}
