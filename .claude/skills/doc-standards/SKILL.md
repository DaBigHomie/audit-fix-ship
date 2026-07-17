---
name: doc-standards
description: "Strict formatting rules for documentation and scripts—tables, code-first structure, no prose."
---

# Documentation & Script Standards

## Format Rules

| Rule | Requirement |
|------|-------------|
| Prose | ⛔ Zero prose in agent docs — use tables, code blocks, decision matrices |
| Sections | Commands and code first, explanation second |
| Symbols | ✅ compliant · ⛔ prohibited · ⚠️ caveat · ❌ error/missing · 🚀 quick-start |
| Headers | `# Topic — Subtitle` with em-dash separator |
| Subheading | `> Location: ... · Runtime: ... · Scope: ...` (dot-separated metadata) |
| Separators | `---` between major sections |
| Cross-refs | `[FILENAME](FILENAME.md)` — relative links only |

## Line & Row Limits

| Target | Limit |
|--------|-------|
| Markdown line length | ≤ 100 chars (soft wrap OK in tables) |
| Table columns | ≤ 7 per table |
| Bullet nesting | ≤ 2 levels deep |
| Code block lines | ≤ 30 lines per block (split if longer) |
| Doc total length | ≤ 300 lines per file (split into numbered series) |

## Section Order (every doc)

```
1. Title + metadata subheading
2. Quick Run / Install (bash code block)
3. Reference tables (specs, rules, inventory)
4. Decision matrices (when X → do Y)
5. Code templates (copy-paste ready)
6. Validation / audit commands
7. Cross-references footer
```

## Token & Context Efficiency

| Rule | Details |
|------|---------|
| Scripts over chat | Create `.mts` scripts for read/audit/edit/fix tasks — one script run replaces dozens of file reads ¹ |
| Script location | `scripts/` for general, `e2e/audits/` for audit scripts |
| Self-contained | Scripts MUST include usage instructions in `--help` flag |
| No redundancy | Never duplicate information across docs — cross-reference instead |
| Portable paths | ⛔ NEVER `/Users/dame/...` · ✅ ALWAYS `./`, `../`, `$(pwd)` |
| Reuse constants | Import shared values from `src/shared/constants/` — don't hardcode |

> ¹ See `core-directives.instructions.md` §55-58

## Table Formatting

```markdown
| Column | Column | Column |        ← Header row
|--------|--------|--------|        ← Separator (no alignment colons needed)
| data   | data   | data   |        ← Left-aligned, concise values
```

- ✅ Use `code` for file paths, class names, CLI flags
- ✅ Use **bold** for key terms on first mention only
- ⛔ No italic emphasis (low contrast in terminals)
- ⛔ No blockquote `>` for emphasis — reserve for metadata subheadings and footnotes

## Instruction File Format (.github/instructions/)

```yaml
---
applyTo: "glob/pattern/**/*.{tsx,ts}"
---
# Topic — Concise Title

## Rules
- ✅ ALWAYS ...
- ⛔ NEVER ...

## Quick Reference (table or code block)

## Docs
Full spec: `docs/path/to/doc.md`
```

| Field | Requirement |
|-------|-------------|
| `applyTo` | YAML frontmatter, specific glob — never `"**"` for new files |
| Length | ≤ 60 lines |
| Structure | Rules (✅/⛔ bullets) → Reference (table/code) → Link to full doc |

## Script Standards (.mts / .ts)

| Rule | Details |
|------|---------|
| Language | TypeScript (`.mts` for standalone, `.ts` for project scripts) |
| Flags | `--json` (machine output) + `--strict` (non-zero exit on violations) minimum |
| Output | Summary table to stdout, JSON to stdout when `--json` |
| Exit codes | `0` = pass, `1` = violations found, `2` = script error |
| Imports | Use `node:fs`, `node:path` — no external deps for audit scripts |
| Header comment | `// Usage: npx tsx script-name.ts [--json] [--strict]` |

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Agent docs | `NN-TOPIC-NAME.md` (numbered) | `08-CARDS-AND-GRIDS.md` |
| Instructions | `topic.instructions.md` | `cards-grids.instructions.md` |
| Audit scripts | `audit-{subject}.ts` | `audit-card-design.ts` |
| Utility scripts | `{verb}-{subject}.mts` | `fix-imports.mts` |
