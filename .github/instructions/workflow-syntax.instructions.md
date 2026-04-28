---
applyTo: "**/.github/workflows/**,**/*.yml"
---

# GitHub Actions Workflow Rules

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.

## CRITICAL: No Expressions in Comments

GitHub Actions parses `${{ }}` syntax even inside YAML comments, causing errors like "Unrecognized named-value".

```yaml
# WRONG - GitHub Actions tries to parse this
# Example: [[ "${{ expression }}" == "true" ]]

# CORRECT - Avoid ${{ }} in comments entirely
# Example: Check if condition equals true in bash
```

## Pre-Commit Validation

```bash
grep -n '${{.*}}' .github/workflows/*.yml | grep '#' && echo "Found expression in comments" || echo "No workflow syntax issues"
```
