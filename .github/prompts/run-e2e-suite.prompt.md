---
description: "Run the critical E2E test suite for the current repo and report structured results"
agent: "playwright-runner"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/run-e2e-suite.prompt.md -- do not edit; run sync-agents.mts -->

# Run E2E Test Suite

Detect which repo I'm in and run the appropriate critical E2E test suite. Report structured failure results.

## Steps

1. Determine the current repo from `git rev-parse --show-toplevel`
2. Run the primary test command for this repo
3. If tests fail, output a structured failure table with: spec file, test name, error message, and line number
4. Suggest which tests to fix first (prioritize by: blocking other tests > simple locator fix > timeout increase)
