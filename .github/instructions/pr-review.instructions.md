---
applyTo: "**"
---

# Pull Request Review Workflow

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.

## MANDATORY: Check Copilot Review Feedback

Before approving ANY PR:

1. CHECK for Copilot reviews
2. READ all inline comments from @copilot-pull-request-reviewer
3. FIX all identified issues — don't merge with open concerns
4. VALIDATE fixes — run TypeScript, ESLint, tests
5. COMMIT fixes with evidence
6. PUSH to update the PR branch
7. APPROVE & MERGE only after all issues resolved

## How to Check Copilot Reviews

```bash
gh pr view [PR_NUMBER] --json reviews,comments
gh api repos/[OWNER]/[REPO]/pulls/[PR_NUMBER]/comments --jq '.[] | {path: .path, line: .line, body: .body}'
```

## Common Copilot Review Issues

- Accessibility: Missing aria-labels, keyboard navigation
- UX: No-op buttons (onClick without handler), broken interactions
- API Compatibility: Breaking changes to hooks/functions
- Naming: camelCase vs snake_case mismatches
- Configuration: Missing constants, hardcoded values
- Workflow Syntax: `${{ }}` in YAML comments (GitHub Actions parse error)

## Quality Gate for PR Approval

- All Copilot review comments addressed
- TypeScript: 0 errors
- ESLint: 0 errors
- Unit tests pass (if applicable)
- No breaking API changes (or documented)
- Workflow files: NO `${{ }}` syntax in comments
- Commit message includes test evidence
