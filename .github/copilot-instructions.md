# Copilot Instructions
See `AGENTS.md` for project context, architecture, and rules.
See `.github/instructions/` for path-specific rules.

## Quick Rules
- JSONB: cast through `unknown` first
- Supabase insert type issues: use `as never`
- Motion components: destructure conflicting handlers before spreading
- Colors: NEVER hardcode — use CSS vars / Tailwind theme
