---
agent: agent
description: "{ID}: {One-line title — imperative form}"
---

# {ID}: {Title}

**Priority**: {P0|P1|P2}
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: {X hours / X min}
**Revenue Impact**: {High|Medium|Low}
**Dependencies**: {comma-separated IDs, or "None"}
**Tags**: `type:{feat|fix|refactor|chore}`, `scope:{area}`, `priority:{p0-p2}`, `prompt-spec`

---

## Agent Bootstrap

> ⚠️ Load these files before editing:

- `.github/copilot-instructions.md`
- `AGENTS.md` (or `CLAUDE.md`)
- `.github/instructions/{relevant}.instructions.md`
- {project-specific cross-references}

---

## Objective

{Plain-English problem statement. What's broken or missing. Why it matters. Quote stakeholder verbatim where useful.}

---

## Pre-Flight Check

```bash
# Commands the agent runs before editing — confirms reality matches the prompt's assumptions
# These should match the audit checklist patterns

cat src/path/to/relevant-file.tsx | head -50
grep -rn "pattern" src/ --include="*.tsx" | head -10
ls supabase/migrations/ | tail -5
```

---

## Intended Result

{One paragraph: what the end state looks like. User-visible behavior + technical state.}

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
| `src/path/to/file.tsx` | Edit | ✅ | {What changes} |
| `src/path/to/new.ts` | Create | ❌ | {Why new file} |
| `path/to/another.tsx` | Audit | ⚠️ | {Verify behavior} |

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
| `existing-testid` | Preserve | `e2e/specs/foo.spec.ts` |
| `new-testid` | Add | New E2E |

---

## Blast Radius

```bash
# Everything that might be affected by the change
grep -rn "ComponentName" src/ e2e/ --include="*.ts" --include="*.tsx"
grep -rn "import.*from.*@/path" src/ --include="*.ts"
```

---

## A11y Checklist

- [ ] Interactive elements have `aria-label` where text is ambiguous
- [ ] Heading hierarchy preserved (no h1→h3 skip)
- [ ] Color contrast passes WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] `useReducedMotion()` respected on any animation

---

## Design System

- [ ] No hardcoded hex/rgb — design tokens only
- [ ] No hardcoded px — spacing scale
- [ ] Dark mode: semantic tokens
- [ ] Typography: {project font conventions}

---

## Success Criteria

1. {Testable criterion 1}
2. {Testable criterion 2}
3. ...

---

## Testing Checklist

```bash
#!/bin/bash
set -e
npx tsc --noEmit
npm run lint
npm run build

# Smoke
npx playwright test e2e/specs/route-health.spec.ts --reporter=line

# Specific
npx playwright test e2e/specs/{relevant-spec}.spec.ts --reporter=line
```

---

## Implementation

{Step-by-step or full code where helpful. For complex items, include actual code blocks the agent can use as reference.

For investigation-type items, document the diagnostic flow:

### Step 1 — Inspect
{What to look at first}

### Step 2 — Diagnose
{What patterns to check for}

### Step 3 — Fix
{What change to apply}}

---

## Reference Implementation

```tsx
// Optional: full reference code if it would save the agent time
// Especially valuable for items that touch a single component end-to-end
```

---

## Environment

- **Framework**: {Next.js 15, etc}
- **Dependencies**: {list any new ones to install}
- **FSD Layer**: `src/features/{slice}/` or cross-cutting

**Required env vars** (add to all environments):
- `EXAMPLE_VAR=value` (description)

---

## Database / Supabase

{Schema changes, RLS updates, migrations needed. Include the actual SQL if it's compact. _None._ if no DB changes.}

---

## Routes Affected

- `/route-1`
- `/api/endpoint`

---

## Blocking Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Merge Gate

```bash
npx tsc --noEmit
npm run lint
npm run build
npx vitest run src/{relevant-area}
```

**Post-merge manual steps** (if any):
1. {Stakeholder/dev action — e.g. update env var on Vercel, update Supabase dashboard config}

---

## Blockers

- ⚠️ {External dependency} — needed from {who} for {what}

OR

_None_

---

## Workflow & Lifecycle

**CI Validation**: `{ci.yml}`
**PR Promotion**: `{automation-workflow.yml}`
**PR Validation**: `{validation-workflow.yml}`
**Chain Advance**: `{chain-advance-workflow.yml}` — unblocks {next ID}

**E2E Tests to Run**:
- `e2e/specs/route-health.spec.ts` — smoke
- `e2e/specs/{specific}.spec.ts`

---

## Authoring notes (delete before shipping)

> Use this section while drafting; remove before committing the prompt to `.github/prompts/`.

- This template is 24 sections by design — comprehensive enough that an agent can execute without round-trips
- Aim for ≤1500 tokens per filled-out prompt; trim sections that are truly N/A
- Write 5–8 prompts in this format for the most nuanced items in the batch; mechanical items use the generator
- The "Implementation" section is where to invest authorship time — that's where good prompts beat bad ones
