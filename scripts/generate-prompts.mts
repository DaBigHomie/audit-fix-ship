#!/usr/bin/env tsx
/**
 * generate-prompts.mts
 *
 * Renders issues.ts into 24-section prompt files for an agent pipeline.
 * Skips IDs in CONFIG.handcraftedIds — those are authored by hand.
 *
 * Usage (from repo root, after copying these files into handoff/ or similar):
 *   npx tsx handoff/generate-prompts.mts
 *   npx tsx handoff/generate-prompts.mts --dry-run
 *   npx tsx handoff/generate-prompts.mts --out .github/prompts
 *
 * Outputs: {outDir}/{ID}-{slug}.prompt.md (one per non-handcrafted issue)
 *
 * SHA-256 gated — re-runs are free, only changed prompts are rewritten.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { issues, validate, CONFIG, type Issue } from './issues.js';

interface CliArgs {
  outDir: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const outIdx = argv.indexOf('--out');
  const outDir = outIdx >= 0 ? argv[outIdx + 1] ?? '.github/prompts' : '.github/prompts';
  return {
    outDir: resolve(process.cwd(), outDir),
    dryRun: argv.includes('--dry-run'),
  };
}

function sha(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

function tagsFor(issue: Issue): string {
  const typeLabel = `type:${issue.issueType === 'refactor' ? 'refactor' : issue.issueType === 'content' ? 'chore' : issue.issueType === 'infra' ? 'feat' : issue.issueType}`;
  const priorityLabel = `priority:${issue.priority.toLowerCase()}`;
  return `\`${typeLabel}\`, \`${priorityLabel}\`, \`scope:${issue.area}\`, \`prompt-spec\``;
}

function renderBootstrap(issue: Issue): string {
  const base = CONFIG.bootstrapFiles;
  const extra = CONFIG.areaBootstrap[issue.area] ?? [];
  return [...base, ...extra].map((f) => `- \`${f}\``).join('\n');
}

function renderFilesTable(issue: Issue): string {
  if (issue.files.length === 0) return '| _(agent locates during execution)_ | — | — | — |';
  return issue.files
    .map((f) => {
      const existsMark = f.exists ? '✅ Yes' : '⚠️ Verify / New';
      return `| \`${f.path}\` | ${f.action} | ${existsMark} | ${f.purpose} |`;
    })
    .join('\n');
}

function renderTestids(issue: Issue): string {
  if (!issue.testids || issue.testids.length === 0) {
    return '| _No testids affected — preserve existing_ | — | — |';
  }
  return issue.testids.map((t) => `| \`${t.id}\` | ${t.action} | ${t.usedBy} |`).join('\n');
}

function renderBlastRadius(issue: Issue): string {
  return issue.blastRadius.join('\n');
}

function renderAcceptance(issue: Issue): string {
  return issue.acceptance.map((a, i) => `${i + 1}. ${a}`).join('\n');
}

function renderBlockers(issue: Issue): string {
  if (issue.blockers.length === 0) return '_None_';
  return issue.blockers.map((b) => `- ⚠️ ${b}`).join('\n');
}

function renderRoutes(issue: Issue): string {
  if (issue.routes && issue.routes.length > 0) {
    return issue.routes.map((r) => `- \`${r}\``).join('\n');
  }
  // Inferred from area — edit this map per-project
  const inferred: Record<string, string[]> = {
    homepage: ['/'],
    admin: ['/admin/*'],
    auth: ['/auth/login', '/auth/register'],
    api: ['/api/*'],
    navigation: ['(all routes — header)'],
    global: ['(all routes)'],
  };
  const routes = inferred[issue.area] ?? ['(agent to determine)'];
  return routes.map((r) => `- \`${r}\``).join('\n');
}

function renderFSD(issue: Issue): string {
  return CONFIG.fsdMapping[issue.area] ?? '`src/features/` or cross-cutting';
}

function renderE2E(issue: Issue): string {
  const defaults = ['`e2e/specs/route-health.spec.ts` — smoke'];
  const extra = issue.extraE2E?.map((e) => `\`${e}\``) ?? [];
  return [...defaults, ...extra].map((e) => `- ${e}`).join('\n');
}

function renderPrompt(issue: Issue): string {
  return `---
agent: agent
description: "${issue.id}: ${issue.title}"
---

# ${issue.id}: ${issue.title}

**Priority**: ${issue.priority}
**Status**: ⏳ **NOT STARTED**
**Estimated Time**: ${issue.estimatedTime}
**Revenue Impact**: ${issue.revenueImpact}
**Dependencies**: ${issue.dependencies.length ? issue.dependencies.join(', ') : 'None'}
**Tags**: ${tagsFor(issue)}

---

## Agent Bootstrap

> ⚠️ Load these files before editing:

${renderBootstrap(issue)}

---

## Objective

${issue.problem}

---

## Pre-Flight Check

\`\`\`bash
${renderBlastRadius(issue)}
\`\`\`

---

## Intended Result

${issue.intendedResult}

---

## Files to Modify/Create

| File | Action | Exists? | Purpose |
|------|--------|---------|---------|
${renderFilesTable(issue)}

---

## data-testid Contracts

| testid | Action | Used By |
|--------|--------|---------|
${renderTestids(issue)}

---

## Blast Radius

\`\`\`bash
${renderBlastRadius(issue)}
\`\`\`

---

## A11y Checklist

- [ ] Interactive elements have \`aria-label\` where text is ambiguous
- [ ] Heading hierarchy preserved (no h1→h3 skip)
- [ ] Color contrast passes WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] \`useReducedMotion()\` respected on any animation

---

## Design System

- [ ] No hardcoded hex/rgb — design tokens only
- [ ] No hardcoded px — spacing scale
- [ ] Dark mode uses semantic tokens
- [ ] Typography follows project conventions

---

## Success Criteria

${renderAcceptance(issue)}

---

## Testing Checklist

\`\`\`bash
#!/bin/bash
set -e
npx tsc --noEmit
npm run lint
npm run build

# Smoke
npx playwright test e2e/specs/route-health.spec.ts --reporter=line
\`\`\`

---

## Implementation

${
  issue.approach ??
  `_Agent determines minimal diff. Follow repo conventions in \`.github/instructions/\`._

**Guardrails:**
- Branch: \`${CONFIG.branchPattern.replace('{nn}', issue.id.split('-')[1] ?? 'NN').replace('{slug}', issue.slug)}\`
- Commit format per repo convention
- Max 3 source files per UI commit (if your repo has this rule)`
}

---

## Reference Implementation

_Generated prompt — agent produces implementation based on repo conventions._

---

## Environment

- **Framework**: ${CONFIG.stackLabel}
- **Dependencies**: (already in \`package.json\` — see stack)
- **FSD Layer**: ${renderFSD(issue)}

---

## Database / Supabase

${issue.database ?? '_None._'}

---

## Routes Affected

${renderRoutes(issue)}

---

## Blocking Gate

\`\`\`bash
npx tsc --noEmit
npm run lint
npm run build
\`\`\`

---

## Merge Gate

\`\`\`bash
npx tsc --noEmit
npm run lint
npm run build
\`\`\`

---

## Blockers

${renderBlockers(issue)}

---

## Workflow & Lifecycle

**CI Validation**: \`${CONFIG.workflows.ci}\`
**PR Promotion**: \`${CONFIG.workflows.promote}\`
**PR Validation**: \`${CONFIG.workflows.validate}\`
**Chain Advance**: \`${CONFIG.workflows.chainAdvance}\`

**E2E Tests to Run**:
${renderE2E(issue)}
`;
}

function writeIfChanged(
  path: string,
  content: string,
  dryRun: boolean,
): 'written' | 'skipped' | 'would-write' {
  if (existsSync(path)) {
    const existing = readFileSync(path, 'utf-8');
    if (sha(existing) === sha(content)) return 'skipped';
  }
  if (dryRun) return 'would-write';
  writeFileSync(path, content, 'utf-8');
  return 'written';
}

function main(): void {
  const { outDir, dryRun } = parseArgs(process.argv.slice(2));

  console.log(`\n📦  ${CONFIG.prefix} prompt generator`);
  console.log(`    out:     ${outDir}`);
  if (dryRun) console.log(`    mode:    DRY RUN`);

  const errors = validate();
  if (errors.length) {
    console.error(`\n✗ Validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`✓ Validated ${issues.length} issues\n`);

  if (!dryRun && !existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
    console.log(`✓ Created ${outDir}\n`);
  }

  let written = 0;
  let skipped = 0;
  let handcraftedCount = 0;

  for (const issue of issues) {
    if (CONFIG.handcraftedIds.has(issue.id)) {
      handcraftedCount++;
      console.log(`  ◌ ${issue.id} — handcrafted (skipped)`);
      continue;
    }
    const filename = `${issue.id}-${issue.slug}.prompt.md`;
    const path = join(outDir, filename);
    const content = renderPrompt(issue);
    const result = writeIfChanged(path, content, dryRun);
    if (result === 'written' || result === 'would-write') written++;
    else skipped++;
    const glyph = result === 'skipped' ? '·' : result === 'written' ? '✓' : '◌';
    console.log(`  ${glyph} ${filename} (~${Math.ceil(content.length / 4)} tokens)`);
  }

  console.log(`\n  ${written} generated · ${skipped} unchanged · ${handcraftedCount} handcrafted\n`);
}

main();
