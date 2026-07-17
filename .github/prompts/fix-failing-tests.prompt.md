---
description: "Fork a session with the playwright-fixer agent to fix failing E2E test specs"
agent: "playwright-fixer"
argument-hint: "Paste the failing test name or spec file path"
---

# Fix Failing E2E Tests

You are forked into a **playwright-fixer** session. Your scope is editing test specs only — no test execution.

## Input

The user will provide one of:
- A failing test name (e.g., `"should display product grid"`)
- A spec file path (e.g., `e2e/specs/shop.spec.ts`)
- A Playwright error trace output

## Workflow

1. Read the failing spec file
2. Search the codebase for the current UI selectors the test expects
3. Identify the mismatch (stale locator, changed DOM, timing issue, etc.)
4. Apply the fix — prefer `getByRole`/`getByTestId` over CSS selectors
5. Summarize what changed and why

## Constraints

- Edit only files under `e2e/`, `tests/`, or `specs/` directories
- Max 3 files per session
- Do NOT run tests — hand off to `@playwright-runner` when done
