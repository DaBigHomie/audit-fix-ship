---
description: "Run a full 30x design system audit on a repo"
agent: "ds-orchestrator"
argument-hint: "Repo alias or path (e.g., 043, maximus, ffs)"
---
Run a full 30x design system audit on the specified repo.

1. `cd` into the repo directory
2. Detect framework (Next.js vs Vite) and Tailwind version (v3 vs v4)
3. Run all 10 dimension audits via specialist agents
4. Aggregate results into the master scorecard
5. Highlight critical violations that need immediate fixes

Target score: 85%+. Report each dimension even if it passes 100%.
