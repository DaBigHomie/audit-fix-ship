/**
 * issues.ts — Wave 14 (W14) batch for ONE4THREE / 043
 * Generates 19 prompts (W14-04 through W14-23 minus 6 handcrafted)
 *
 * Handcrafted (skip in generator):
 *   W14-01, W14-02, W14-03, W14-04, W14-09, W14-24
 *
 * Run: npx tsx scripts/generate-prompts.mts
 */

export type Priority = 'P0' | 'P1' | 'P2';
export type Wave = 0 | 1 | 2 | 3 | 3.5 | 4;
export type Complexity = 'S' | 'M' | 'L';
export type IssueType = 'bug' | 'feat' | 'refactor' | 'content' | 'infra';
export type Area =
  | 'global' | 'admin' | 'api' | 'database' | 'docs'
  | 'scripts' | 'images' | 'catalog' | 'handoff';

export interface Issue {
  id: string; slug: string; title: string;
  priority: Priority; wave: Wave; complexity: Complexity;
  issueType: IssueType; area: Area;
  revenueImpact: 'High' | 'Medium' | 'Low'; estimatedTime: string;
  dependencies: string[]; blockers: string[];
  problem: string; intendedResult: string; acceptance: string[];
  files: { path: string; action: 'Edit' | 'Create' | 'Delete' | 'Audit'; exists: boolean; purpose: string }[];
  blastRadius: string[]; approach?: string;
  routes?: string[];
  testids?: { id: string; action: 'Preserve' | 'Add' | 'Rename'; usedBy: string }[];
}

export const CONFIG = {
  prefix: 'W14',
  branchPrefix: 'copilot/wave14-',
  branchPattern: 'copilot/wave14-{slug}',
  stackLabel: 'Next.js 15 + App Router + Supabase + Stripe + Tailwind CSS',
  workflows: {
    ci: 'ci.yml',
    promote: 'copilot-full-automation.yml',
    validate: 'copilot-pr-validate.yml',
    chainAdvance: 'chain-advance.yml',
  },
  fsdMapping: {
    database: '`lib/supabase/`, `supabase/migrations/`',
    images: '`src/shared/`, `src/features/`, `public/images/`',
    admin: '`src/features/admin/`, `src/app/admin/`',
    api: '`src/app/api/`',
    scripts: '`scripts/`',
    docs: '`docs/`, `.github/instructions/`',
    catalog: '`src/entities/product/`, `src/features/shop/`',
    handoff: '`docs/active/jsr-rescue-handoff/`',
    global: 'cross-cutting',
  },
  handcraftedIds: new Set(['W14-01', 'W14-02', 'W14-03', 'W14-04', 'W14-09', 'W14-24']),
  bootstrapFiles: [
    '.github/copilot-instructions.md',
    'AGENTS.md',
    '.github/instructions/commit-quality.instructions.md',
    '.github/instructions/typescript.instructions.md',
    '.github/instructions/regression-prevention.instructions.md',
  ],
  areaBootstrap: {
    database: ['.github/instructions/supabase.instructions.md', '.github/instructions/supabase-clients.instructions.md'],
    images: ['.github/instructions/image-import.instructions.md', '.github/agents/design-system-asset-pipeline.agent.md'],
    admin: ['.github/instructions/admin-features.instructions.md'],
    api: ['.github/instructions/app-router.instructions.md'],
    scripts: ['.github/instructions/doc-standards.instructions.md'],
    docs: ['.github/instructions/doc-standards.instructions.md'],
    catalog: ['.github/instructions/fsd-architecture.instructions.md'],
    handoff: ['docs/active/jsr-rescue-handoff/wave14-handoff-2026-04-28.md'],
    global: [],
  },
} as const;

const SWARM_DO_NOT_TOUCH = [
  'src/lib/feature-flags.ts',
  'src/shared/data/bundles.ts',
  'src/shared/types/bundle.ts',
  'src/shared/lib/bundle-analytics.ts',
  'src/shared/hooks/useImageLoadMonitor.ts',
  'scripts/lighthouse-audit.mts',
  'src/app/api/subscribe/route.ts',
  'src/app/api/reviews/photos/route.ts',
  'src/app/api/admin/photos/[id]/route.ts',
  'src/app/api/webhooks/order-fulfilled/route.ts',
  'lib/review-solicitation.ts',
  'src/shared/data/products.ts',
];

function swarmIssue(num: number, slug: string, title: string, file: string, priority: Priority, problem: string): Issue {
  const others = SWARM_DO_NOT_TOUCH.filter(f => f !== file);
  return {
    id: `W14-${String(num).padStart(2, '0')}`, slug, title, priority,
    wave: 3, complexity: 'S', issueType: 'refactor', area: 'images',
    revenueImpact: priority === 'P0' ? 'High' : 'Low', estimatedTime: '30-60 min',
    dependencies: ['W14-04', 'W14-05'], blockers: [],
    problem,
    intendedResult: `\`${file}\` migrated off local-image assumptions; references Supabase Storage / CDN URLs per Wave 14 canonical decision.`,
    acceptance: [
      `Only \`${file}\` is modified in this PR — no other Phase 4 swarm files touched.`,
      'Local image path constants/strings replaced with Supabase Storage URLs from canonical bucket map.',
      'TypeScript compile clean; lint clean; build succeeds.',
      'Smoke E2E (`route-health.spec.ts`) passes.',
    ],
    files: [{ path: file, action: 'Edit', exists: true, purpose: 'Single file scope per Phase 4 swarm rule' }],
    blastRadius: [
      `# DO NOT TOUCH any of these (other swarm PRs own them):\n# ${others.map(f => '#   ' + f).join('\n')}`,
      `grep -rn "${file.split('/').pop()}" src/ scripts/ lib/ --include="*.ts" --include="*.tsx"`,
    ],
    approach: 'Read the file. Identify any hardcoded `/images/...` or `public/images/...` references. Replace with Supabase Storage public URLs sourced from `src/shared/constants/supabase-cdn.ts` or the canonical bucket map produced by W14-05.',
  };
}

export const issues: Issue[] = [
  // W14-05 — Phase 1 Schema (would be handcrafted but going through generator for template uniformity)
  {
    id: 'W14-05', slug: 'phase1-media-library-backfill',
    title: 'Phase 1 — Backfill media_library + decide canonical buckets',
    priority: 'P0', wave: 2, complexity: 'L', issueType: 'infra', area: 'database',
    revenueImpact: 'High', estimatedTime: '3-4 hours',
    dependencies: ['W14-04'], blockers: ['Q1', 'Q2', 'Q5', 'Q7'],
    problem: 'Wave 14 makes Supabase Storage the canonical image source, but `media_library` currently lacks rows for assets that exist in `storage.objects`. Without backfill, the new audit script (W14-09) will report false-positive missing entries.',
    intendedResult: 'Every asset in `storage.objects` has a corresponding `media_library` row. Canonical bucket map documented. Optional: trigger to auto-insert on storage upload (decision pending Q7).',
    acceptance: [
      'Migration `supabase/migrations/YYYYMMDDHHMMSS_media_library_backfill.sql` exists and is idempotent.',
      'Backup taken: `npx tsx scripts/backup-supabase-state.mts media_library` referenced in commit message.',
      'Dry-run via `node scripts/apply-migration-via-rest.cjs --dry-run` (or equivalent) shows expected row inserts.',
      'After apply: `SELECT count(*) FROM media_library` matches `storage.objects` count for canonical buckets.',
      'Canonical bucket decision documented in `docs/audits/SUPABASE-IMAGE-INVENTORY.md` (W14-04 output).',
    ],
    files: [
      { path: 'supabase/migrations/YYYYMMDDHHMMSS_media_library_backfill.sql', action: 'Create', exists: false, purpose: 'Idempotent backfill INSERT … ON CONFLICT DO NOTHING' },
      { path: 'docs/audits/SUPABASE-IMAGE-INVENTORY.md', action: 'Edit', exists: false, purpose: 'Append canonical bucket map' },
    ],
    blastRadius: [
      'grep -rn "media_library" src/ supabase/ scripts/ --include="*.ts" --include="*.sql"',
      'node -e "fetch from storage admin API to count objects per bucket"',
    ],
  },
  // W14-06, 07, 08 — Phase 2 doc rewrites (parallel)
  {
    id: 'W14-06', slug: 'phase2a-image-registry-rewrite',
    title: 'Phase 2a — Rewrite docs/audits/IMAGE-REGISTRY.md as Supabase-first migration ledger',
    priority: 'P1', wave: 2, complexity: 'M', issueType: 'content', area: 'docs',
    revenueImpact: 'Low', estimatedTime: '1-2 hours',
    dependencies: ['W14-04'], blockers: [],
    problem: 'IMAGE-REGISTRY.md frames `public/images/**` as canonical. Wave 14 inverts that: Supabase Storage + CDN URLs are canonical; local `public/images/**` is a legacy holding area to drain.',
    intendedResult: 'IMAGE-REGISTRY.md is a Supabase-first migration ledger that tracks: (a) which assets live where, (b) which need migration to Supabase, (c) the brand-chrome exception list (logo/favicons/og-default).',
    acceptance: [
      '`docs/audits/IMAGE-REGISTRY.md` rewritten with Supabase-canonical framing.',
      'Each table row indicates canonical location (Supabase bucket/path) and migration status.',
      'Brand chrome exceptions explicitly listed (Q5 answer).',
      'Cross-links to W14-04 inventory and `image-import.instructions.md`.',
    ],
    files: [{ path: 'docs/audits/IMAGE-REGISTRY.md', action: 'Edit', exists: true, purpose: 'Rewrite framing' }],
    blastRadius: ['grep -rn "IMAGE-REGISTRY" docs/ src/ scripts/ .github/'],
  },
  {
    id: 'W14-07', slug: 'phase2b-image-audit-plan-rewrite',
    title: 'Phase 2b — Rewrite docs/active/image-audit-plan.md per user annotations',
    priority: 'P1', wave: 2, complexity: 'M', issueType: 'content', area: 'docs',
    revenueImpact: 'Low', estimatedTime: '1-2 hours',
    dependencies: ['W14-04'], blockers: [],
    problem: 'image-audit-plan.md predates the Supabase-canonical decision. User annotations (preserved in `wave14-annotations.patch`) specify the rewrite intent.',
    intendedResult: 'image-audit-plan.md aligns with Wave 14 inversion. Audit flags LOCAL-ONLY assets as needing migration; Supabase/CDN URLs are ✅ acceptable.',
    acceptance: [
      'Document rewritten — read `docs/active/jsr-rescue-handoff/wave14-annotations.patch` `+`-prefixed lines as specification (do NOT `git apply`).',
      'Brand chrome exception clearly documented.',
      'No conflicting framing remains.',
    ],
    files: [
      { path: 'docs/active/image-audit-plan.md', action: 'Edit', exists: true, purpose: 'Rewrite' },
      { path: 'docs/active/jsr-rescue-handoff/wave14-annotations.patch', action: 'Audit', exists: true, purpose: 'Spec source' },
    ],
    blastRadius: ['grep -rn "image-audit-plan" docs/ .github/'],
  },
  {
    id: 'W14-08', slug: 'phase2c-design-system-asset-pipeline-update',
    title: 'Phase 2c — Mark Supabase/CDN URLs as ✅ acceptable in design-system-asset-pipeline agent',
    priority: 'P1', wave: 2, complexity: 'S', issueType: 'content', area: 'docs',
    revenueImpact: 'Low', estimatedTime: '30-45 min',
    dependencies: [], blockers: [],
    problem: '`.github/agents/design-system-asset-pipeline.agent.md` flags non-local URLs as drift. Wave 14 inverts this — Supabase Storage and CDN URLs are the canonical asset source.',
    intendedResult: 'Agent doc updated: Supabase/CDN URLs are ✅ acceptable; flag local-only assets as needing migration; brand chrome exception list inline.',
    acceptance: [
      'Agent file updated with new acceptance rules.',
      'Examples show ✅ Supabase URL, ✅ CDN URL, ⚠️ local path (needs migration), ✅ brand chrome local path.',
    ],
    files: [{ path: '.github/agents/design-system-asset-pipeline.agent.md', action: 'Edit', exists: true, purpose: 'Update acceptance rules' }],
    blastRadius: ['grep -rn "design-system-asset-pipeline" .github/ docs/'],
  },
  // W14-09 handcrafted (Phase 3 site-wide audit script)
  // W14-10..21 — Phase 4 swarm
  swarmIssue(10, 'phase4-feature-flags', 'Phase 4 — Migrate src/lib/feature-flags.ts off local-image assumptions', 'src/lib/feature-flags.ts', 'P2', 'feature-flags.ts may reference image-related flags or paths predating Supabase canonicalization.'),
  swarmIssue(11, 'phase4-bundles-data', 'Phase 4 — Migrate src/shared/data/bundles.ts to Supabase URLs', 'src/shared/data/bundles.ts', 'P2', 'bundles.ts contains static data with local-image paths.'),
  swarmIssue(12, 'phase4-bundle-types', 'Phase 4 — Update src/shared/types/bundle.ts for Supabase URL types', 'src/shared/types/bundle.ts', 'P2', 'bundle types may constrain image fields to local-path strings.'),
  swarmIssue(13, 'phase4-bundle-analytics', 'Phase 4 — Migrate src/shared/lib/bundle-analytics.ts asset references', 'src/shared/lib/bundle-analytics.ts', 'P2', 'bundle-analytics may emit events with stale local-image identifiers.'),
  swarmIssue(14, 'phase4-image-load-monitor', 'Phase 4 — Update useImageLoadMonitor for Supabase/CDN URLs', 'src/shared/hooks/useImageLoadMonitor.ts', 'P2', 'Hook may pattern-match local paths only; needs to recognize Supabase + CDN domains.'),
  swarmIssue(15, 'phase4-lighthouse-audit', 'Phase 4 — Update scripts/lighthouse-audit.mts asset enumeration', 'scripts/lighthouse-audit.mts', 'P2', 'Lighthouse audit may exclude Supabase/CDN URLs from its checks.'),
  swarmIssue(16, 'phase4-api-subscribe', 'Phase 4 — Migrate src/app/api/subscribe/route.ts asset references', 'src/app/api/subscribe/route.ts', 'P1', 'Subscribe API may serve email assets from local paths instead of Supabase.'),
  swarmIssue(17, 'phase4-api-review-photos', 'Phase 4 — Migrate reviews/photos API to Supabase Storage', 'src/app/api/reviews/photos/route.ts', 'P1', 'Review photos must persist to Supabase Storage, not local FS.'),
  swarmIssue(18, 'phase4-api-admin-photos', 'Phase 4 — Migrate admin/photos/[id] API to Supabase Storage', 'src/app/api/admin/photos/[id]/route.ts', 'P1', 'Admin photos endpoint must read/write Supabase Storage.'),
  swarmIssue(19, 'phase4-webhook-order-fulfilled', 'Phase 4 — Update order-fulfilled webhook asset URLs', 'src/app/api/webhooks/order-fulfilled/route.ts', 'P1', 'Order fulfillment emails may embed stale local image URLs.'),
  swarmIssue(20, 'phase4-review-solicitation', 'Phase 4 — Update lib/review-solicitation.ts email assets', 'lib/review-solicitation.ts', 'P1', 'Review-solicitation emails may embed local image paths.'),
  swarmIssue(21, 'phase4-products-static-demote', 'Phase 4 — Demote src/shared/data/products.ts to dev-only fallback', 'src/shared/data/products.ts', 'P0', 'products.ts is treated as canonical in some flows; must become a dev-only fallback. Bestsellers query moves to Supabase per Q4 decision.'),
  // W14-22 — Phase 5b
  {
    id: 'W14-22', slug: 'phase5b-bundles-deprecation',
    title: 'Phase 5b — Deprecate bundles.ts static catalog (move to Supabase)',
    priority: 'P2', wave: 4, complexity: 'M', issueType: 'refactor', area: 'catalog',
    revenueImpact: 'Low', estimatedTime: '2 hours',
    dependencies: ['W14-11', 'W14-12', 'W14-13'], blockers: [],
    problem: 'After W14-11/12/13 align bundle types and data with Supabase URLs, the static catalog can be deprecated in favor of a Supabase `bundles` table query.',
    intendedResult: '`src/shared/data/bundles.ts` becomes a dev-only fallback; production reads from a Supabase `bundles` table.',
    acceptance: [
      'Migration creates `bundles` table with RLS enabled.',
      'Seeded with current bundle data (idempotent).',
      'Bundle-consuming code reads from Supabase with `bundles.ts` as fallback only when env=dev.',
      'TypeScript types regenerated via `supabase gen types`.',
    ],
    files: [
      { path: 'supabase/migrations/YYYYMMDDHHMMSS_create_bundles.sql', action: 'Create', exists: false, purpose: 'New table + RLS + seed' },
      { path: 'src/shared/data/bundles.ts', action: 'Edit', exists: true, purpose: 'Demote to dev fallback' },
    ],
    blastRadius: ['grep -rn "from.*shared/data/bundles" src/ --include="*.ts" --include="*.tsx"'],
  },
  // W14-23 — Phase 6 close
  {
    id: 'W14-23', slug: 'phase6-wave15-handoff',
    title: 'Phase 6 — Close Wave 14 + write Wave 15 kickoff handoff',
    priority: 'P1', wave: 4, complexity: 'S', issueType: 'content', area: 'handoff',
    revenueImpact: 'Low', estimatedTime: '1-2 hours',
    dependencies: ['W14-22'], blockers: [],
    problem: 'Wave 14 needs a closeout doc capturing what shipped, what carried forward, and a Wave 15 kickoff.',
    intendedResult: 'Wave 14 closure doc + Wave 15 kickoff handoff committed to `main`. Tracker updated to ✅ for shipped items.',
    acceptance: [
      '`docs/active/jsr-rescue-handoff/wave14-close-YYYY-MM-DD.md` written.',
      '`docs/active/jsr-rescue-handoff/wave15-handoff-YYYY-MM-DD.md` written.',
      'W14 stakeholder tracker updated to ✅ for all shipped IDs.',
      'Wave 14 worktrees pruned per worktree-isolation rules.',
    ],
    files: [
      { path: 'docs/active/jsr-rescue-handoff/wave14-close-YYYY-MM-DD.md', action: 'Create', exists: false, purpose: 'Close doc' },
      { path: 'docs/active/jsr-rescue-handoff/wave15-handoff-YYYY-MM-DD.md', action: 'Create', exists: false, purpose: 'Next wave kickoff' },
    ],
    blastRadius: ['ls docs/active/jsr-rescue-handoff/'],
  },
];

export function validate(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const i of issues) {
    if (ids.has(i.id)) errors.push(`Duplicate ID: ${i.id}`);
    ids.add(i.id);
    if (!i.title || !i.acceptance.length) errors.push(`${i.id}: missing title or acceptance`);
  }
  for (const i of issues) {
    for (const dep of i.dependencies) {
      if (!ids.has(dep) && !CONFIG.handcraftedIds.has(dep)) {
        errors.push(`${i.id}: dependency ${dep} not in batch or handcrafted list`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
