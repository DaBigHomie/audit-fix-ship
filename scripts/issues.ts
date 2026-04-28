/**
 * issues.ts — Typed data for the audit-fix-ship batch generator.
 *
 * One entry per issue. Edit this file, run generate-prompts.mts, get prompts.
 *
 * Conventions:
 * - Each issue has a stable {PFX}-NN ID where PFX is the batch prefix
 *   (initials of the review, e.g. JSR for Jay Site Review)
 * - Acceptance criteria are testable
 * - File paths are absolute repo-relative
 * - Dependencies reference other {PFX}-NN IDs in this same batch
 *
 * Usage:
 *   npx tsx generate-prompts.mts
 *   npx tsx generate-prompts.mts --dry-run
 *   npx tsx generate-prompts.mts --out .github/prompts
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types — adjust to your project's conventions
// ─────────────────────────────────────────────────────────────────────────────

export type Priority = 'P0' | 'P1' | 'P2';
export type Wave = 0 | 1 | 2 | 3 | 3.5 | 4;
export type Complexity = 'S' | 'M' | 'L';
export type IssueType = 'bug' | 'feat' | 'refactor' | 'content' | 'infra';

/** Project-specific area taxonomy — edit this enum to fit your codebase */
export type Area =
  | 'global'
  | 'homepage'
  | 'navigation'
  | 'admin'
  | 'auth'
  | 'api'
  | 'database'
  | 'polish'
  | 'deferred'
  | 'sibling-repo'; // for cross-repo work

export interface Issue {
  /** Stable ID — never reused. Format: {PFX}-NN */
  id: string;
  /** URL-safe slug used in filename + branch name */
  slug: string;
  /** One-line imperative title (≤80 chars) */
  title: string;
  priority: Priority;
  wave: Wave;
  complexity: Complexity;
  issueType: IssueType;
  area: Area;
  revenueImpact: 'High' | 'Medium' | 'Low';
  estimatedTime: string;

  /** IDs of issues that must ship first */
  dependencies: string[];
  /** External blockers (stakeholder content, credentials, etc.) */
  blockers: string[];

  /** Plain-English problem statement (technical) */
  problem: string;
  /** Short technical intended result */
  intendedResult: string;
  /** Acceptance criteria — each testable */
  acceptance: string[];

  /** Repo-relative paths likely to change */
  files: { path: string; action: 'Edit' | 'Create' | 'Delete' | 'Audit'; exists: boolean; purpose: string }[];

  /** Bash commands to enumerate affected files before editing */
  blastRadius: string[];

  /** Optional implementation sketch */
  approach?: string;
  /** Routes affected — auto-inferred from area if absent */
  routes?: string[];
  /** data-testids to preserve, add, or rename */
  testids?: { id: string; action: 'Preserve' | 'Add' | 'Rename'; usedBy: string }[];
  /** Additional E2E specs beyond the smoke set */
  extraE2E?: string[];
  /** DB notes if relevant */
  database?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration — edit before running
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIG = {
  /** The batch prefix — e.g. "JSR" for Jay Site Review */
  prefix: 'XYZ',
  /** IDs that should NOT be regenerated (handcrafted prompts already exist) */
  handcraftedIds: new Set<string>([
    // 'XYZ-01',
    // 'XYZ-14',
  ]),
  /** Bootstrap files every prompt loads */
  bootstrapFiles: [
    '.github/copilot-instructions.md',
    'AGENTS.md',
    '.github/instructions/commit-quality.instructions.md',
    '.github/instructions/typescript.instructions.md',
  ],
  /** Optional area-specific bootstrap files added when relevant */
  areaBootstrap: {
    admin: ['.github/instructions/admin-features.instructions.md'],
    homepage: [
      '.github/instructions/design-system.instructions.md',
      '.github/instructions/fsd-architecture.instructions.md',
    ],
    auth: ['.github/instructions/security.instructions.md'],
  } as Record<string, string[]>,
  /** Project's stack labels for the Environment section */
  stackLabel: 'Next.js 15 (App Router) + TypeScript strict',
  /** FSD layer mapping by area — edit per project */
  fsdMapping: {
    admin: '`src/features/admin/`',
    homepage: '`src/features/homepage/`',
    navigation: '`src/features/layout/`',
    global: 'cross-cutting',
  } as Record<string, string>,
  /** Branch naming convention */
  branchPattern: 'copilot/fi-{nn}-{slug}',
  /** Workflows to reference in the lifecycle section */
  workflows: {
    ci: 'ci.yml',
    promote: 'pr-promote.yml',
    validate: 'pr-validate.yml',
    chainAdvance: 'chain-advance.yml',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// The data — populate from the stakeholder tracker
// ─────────────────────────────────────────────────────────────────────────────

export const issues: Issue[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // Sample entries — replace with your own
  // ──────────────────────────────────────────────────────────────────────────

  {
    id: 'XYZ-01',
    slug: 'sample-rebrand',
    title: 'Sample: rebrand all references from old name to new name',
    priority: 'P0',
    wave: 1,
    complexity: 'M',
    issueType: 'refactor',
    area: 'global',
    revenueImpact: 'Medium',
    estimatedTime: '1 hour',
    dependencies: [],
    blockers: [],
    problem: `Plain-English description of the problem from the stakeholder's perspective. Quote them where useful.`,
    intendedResult: `One-paragraph description of the end state.`,
    acceptance: [
      'Testable criterion 1',
      'Testable criterion 2',
      'Testable criterion 3',
    ],
    files: [
      { path: 'src/path/to/file.tsx', action: 'Edit', exists: true, purpose: 'What changes here' },
      { path: 'src/path/to/new.ts', action: 'Create', exists: false, purpose: 'Why the new file' },
    ],
    blastRadius: [
      'grep -rn "old-name" src/ --include="*.tsx" --include="*.ts" | wc -l',
      'grep -rn "OldComponent" src/ e2e/ --include="*.ts" --include="*.tsx"',
    ],
    approach: `Optional sketch — bullet points or a paragraph on how to attack this.`,
  },

  {
    id: 'XYZ-02',
    slug: 'sample-bug-fix',
    title: 'Sample: fix the X bug in the Y flow',
    priority: 'P0',
    wave: 3,
    complexity: 'S',
    issueType: 'bug',
    area: 'admin',
    revenueImpact: 'High',
    estimatedTime: '30 min',
    dependencies: ['XYZ-01'],
    blockers: [],
    problem: `Bug description. Include reproduction steps if known.`,
    intendedResult: `What should happen instead.`,
    acceptance: [
      'Reproduction steps no longer trigger the bug',
      'No regression on adjacent flows',
    ],
    files: [
      { path: 'src/features/admin/Component.tsx', action: 'Edit', exists: true, purpose: 'Fix the handler' },
    ],
    blastRadius: [
      'grep -rn "buggyFunction" src/ --include="*.ts" --include="*.tsx"',
    ],
    extraE2E: ['e2e/specs/admin-flow.spec.ts'],
  },

  // Add more entries here...
];

// ─────────────────────────────────────────────────────────────────────────────
// Validation — fails fast on bad data
// ─────────────────────────────────────────────────────────────────────────────

export function validate(items: Issue[] = issues): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`Duplicate id: ${item.id}`);
    ids.add(item.id);
    if (item.acceptance.length === 0) errors.push(`${item.id} missing acceptance criteria`);
    if (item.title.length > 120) errors.push(`${item.id} title too long (${item.title.length} chars)`);
    if (!item.id.startsWith(`${CONFIG.prefix}-`)) {
      errors.push(`${item.id} doesn't match prefix "${CONFIG.prefix}-"`);
    }
  }

  // Cross-reference dependencies
  for (const item of items) {
    for (const dep of item.dependencies) {
      if (!ids.has(dep) && !CONFIG.handcraftedIds.has(dep)) {
        errors.push(`${item.id} depends on unknown id: ${dep}`);
      }
    }
  }

  return errors;
}
