---
description: "Fix design system violations in a specific dimension"
agent: "ds-orchestrator"
argument-hint: "Dimension + repo (e.g., 'tokens 043', 'typography maximus')"
---
Fix design system violations for the specified dimension in the target repo.

1. Run the dimension-specific audit first to get current violations
2. For each violation, apply the fix:
   - Replace hardcoded values with design tokens
   - Add missing aria-labels, alt text, dark: variants
   - Swap inline styles for Tailwind classes
3. Re-run the audit to verify fixes
4. Report before/after scores

Dimensions: tokens, typography, color, spacing, animation, components, responsive, a11y, dark-mode, assets
