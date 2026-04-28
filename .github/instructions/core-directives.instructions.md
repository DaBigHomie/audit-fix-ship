---
applyTo: "**"
---

# Core Coding Directives

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.

## Synthesize & Implement Priority
Always synthesize findings into actionable implementation plans. Offer to implement immediately OR create `*.prompt.md` files for cloud agents to execute later.

## Automation First
Prioritize creating automation scripts over suggesting manual terminal commands.

## FSD Architecture (Required for New Projects)
```
project-name/
├── features/     # Business features (isolated)
├── entities/     # Business entities (shared models)
├── shared/       # Shared utilities, constants, types
├── lib/          # External API wrappers
├── docs/         # Documentation
└── [entry-points]
```

## Portable Paths
- NEVER: `/Users/dame/...` or any hard-coded user path
- ALWAYS: `cd ../`, `./`, `$(pwd)`, `Path.home()`, `~`

## Research Before Planning
Use a research subagent (Plan agent) before creating implementation plans.

## Syntax Safety
Validate that all quotes (single/double) are closed before running shell commands.

## Workspace File Boundary
- NEVER create files outside the workspace directory (no `/tmp/`, `~/Desktop/`, `~/Downloads/`, etc.)
- ALL generated files (scripts, configs, logs, exports) MUST live inside the project repo
- If no suitable directory exists, extend the FSD structure: add `scripts/`, `docs/`, or a new feature folder
- Exception: package manager caches and tool configs that conventionally live elsewhere (~/.config, ~/.cache)

## Concurrency
Implement locking or sequential logic to prevent parallel tasks from creating conflicting commits.

## Token-Efficient Scripting
- ALWAYS create portable `.mts` scripts for repetitive or complex tasks (read, audit, edit, fix, validate) to reduce token usage and time
- Store scripts in the project's `scripts/` directory
- Prefer a single script execution over multiple manual chat-based file reads/edits
- Scripts MUST be self-contained with clear usage instructions

## No Hardcoded Colors
- NEVER use static hardcoded color values (hex, rgb, hsl) directly in components or stylesheets
- ALWAYS use CSS variables, Tailwind theme colors, or design token references
- Colors MUST come from a single source of truth (theme config, CSS variables, or design tokens)
