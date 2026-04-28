---
applyTo: "**"
---

# UGWTF — Unified GitHub Workflow Task Framework

> Agent-parseable reference for `@dabighomie/ugwtf@1.0.0`.
> This document is the single source of truth for Copilot agents operating in this repository.

---

## Mission

UGWTF's primary job is **full end-to-end orchestration**: 

```
Prompts → Issues → PRs → Production
```

All other commands (validate, audit, scan, fix, status) exist to **support** this pipeline.

---

## 1. Package Info

| Field | Value |
|---|---|
| Name | `@dabighomie/ugwtf` |
| Version | `1.0.0` |
| Registry | npm (public) |
| Local dev command | `cd ~/management-git/ugwtf && npx tsx src/index.ts <command>` |
| Published command | `npx @dabighomie/ugwtf <command>` |
| Update mechanism | Git tag `v*` → `release.yml` → npm publish + GitHub release |
| CHANGELOG | `/Users/dame/management-git/ugwtf/CHANGELOG.md` |

---

## 2. Registered Repos

UGWTF manages **10 repositories**. Each repo has an alias used in all CLI commands.

| Alias | Slug | Framework | Supabase |
|---|---|---|---|
| `damieus` | `DaBigHomie/damieus-com-migration` | vite-react | ✓ |
| `ffs` | `DaBigHomie/flipflops-sundays-reboot` | vite-react | ✓ |
| `043` | `DaBigHomie/one4three-co-next-app` | nextjs | ✓ |
| `maximus` | `DaBigHomie/maximus-ai` | nextjs | ✓ |
| `cae` | `DaBigHomie/Cae` | vite-react | ✗ |
| `atb` | `DaBigHomie/atl-table-booking-app` | node | ✗ |
| `ugwtf` | `DaBigHomie/ugwtf` | node | ✗ |
| `image-gen` | `DaBigHomie/image-gen-30x-cli` | node | ✗ |
| `audit-fix-ship` | `DaBigHomie/audit-fix-ship` | node | ✗ |
| `docs-standards` | `DaBigHomie/documentation-standards` | node | ✗ |

---

## 3. Commands

UGWTF exposes **25 commands** organized by pipeline hierarchy.

### Primary Pipeline (e2e orchestration)

| Command | Description |
|---|---|
| `prompts` | Scan, validate, and create issues from .prompt.md files |
| `issues` | Detect stalled issues, assign Copilot, auto-triage |
| `prs` | Review Copilot PRs, enforce DB firewall |
| `chain` | Manage prompt-chain lifecycle (load, create issues, advance) |
| `cleanup` | Close orphan PRs, strip labels, re-assign Copilot |
| `dry-run` | E2E pipeline validation without side effects |

### Setup (one-time per repo)

| Command | Description |
|---|---|
| `install` | Sync labels + deploy workflows (alias: `deploy`) |
| `labels` | Sync universal + repo-specific labels (idempotent) |

### Quality & Support

| Command | Description |
|---|---|
| `validate` | Run quality-gate checks on issues, PRs, and repo config |
| `fix` | Auto-fix issues found by `validate` |
| `audit` | Generate a health-score report for repo(s) |
| `status` | Show current state of labels, workflows, and config |
| `generate-chain` | Auto-generate prompt-chain.json from scanned prompts |

### Domain Scan Commands

| Command | Description |
|---|---|
| `security` | Run security-focused scan |
| `performance` | Run performance-focused scan |
| `a11y` | Run accessibility scan |
| `seo` | Run SEO scan |
| `docs` | Run documentation coverage scan |
| `commerce` | Run e-commerce domain scan |
| `scenarios` | Run scenario-based test scan |
| `design-system` | Run design-system consistency scan |
| `supabase` | Run Supabase configuration and migration scan |
| `gateway` | Run API gateway scan |
| `scan` | Run all domain scans combined |

### Scaffold Commands

| Command | Description |
|---|---|
| `new-agent` | Scaffold a new Copilot agent configuration |
| `new-repo` | Register and scaffold a new repository in UGWTF |

### Utility Commands

| Command | Description |
|---|---|
| `list` | List registered repos and their metadata |
| `run` | Execute an arbitrary script in the context of a repo |
| `watch` | Watch repo for changes and re-run commands |

---

## 4. Universal Labels

**41 labels** synced to all registered repos. Organized by category.

### Priority (4)

| Label | Color | Description |
|---|---|---|
| `p0` | `#b60205` | Critical — drop everything |
| `p1` | `#d93f0b` | High priority |
| `p2` | `#fbca04` | Medium priority |
| `p3` | `#0e8a16` | Low priority / nice-to-have |

### Automation (6)

| Label | Color | Description |
|---|---|---|
| `copilot` | `#1d76db` | Copilot-generated or Copilot-assisted |
| `full` | `#0075ca` | Fully automated |
| `partial` | `#e4e669` | Partially automated |
| `manual` | `#d876e3` | Requires manual intervention |
| `in-progress` | `#fbca04` | Work is actively in progress |
| `completed` | `#0e8a16` | Work is completed |

### Agent (1)

| Label | Color | Description |
|---|---|---|
| `agent:copilot` | `#1d76db` | Assignable to Copilot coding agent |

### Status (3)

| Label | Color | Description |
|---|---|---|
| `needs-pr` | `#d93f0b` | Issue needs a pull request |
| `stalled` | `#e4e669` | Work has stalled — needs attention |
| `needs-review` | `#fbca04` | Awaiting human review |

### Category (7)

| Label | Color | Description |
|---|---|---|
| `database` | `#0075ca` | Database schema or migration |
| `infrastructure` | `#d4c5f9` | CI/CD, hosting, infrastructure |
| `enhancement` | `#a2eeef` | New feature or improvement |
| `bug` | `#d73a4a` | Something is broken |
| `documentation` | `#0075ca` | Documentation updates |
| `dependencies` | `#0366d6` | Dependency updates |
| `security` | `#b60205` | Security vulnerability or hardening |

### Merge Safety (3)

| Label | Color | Description |
|---|---|---|
| `safe-migration` | `#0e8a16` | Migration is backward-compatible |
| `destructive-migration` | `#b60205` | Migration may cause data loss — review carefully |
| `types-update` | `#e4e669` | TypeScript types changed |

### Type Prefix (7)

| Label | Color | Description |
|---|---|---|
| `type:feat` | `#a2eeef` | New feature |
| `type:fix` | `#d73a4a` | Bug fix |
| `type:chore` | `#e4e669` | Maintenance task |
| `type:docs` | `#0075ca` | Documentation only |
| `type:refactor` | `#d4c5f9` | Code refactor (no behavior change) |
| `type:test` | `#bfd4f2` | Test addition or update |
| `type:ci` | `#f9d0c4` | CI/CD pipeline change |

### Scope (5)

| Label | Color | Description |
|---|---|---|
| `scope:ci` | `#f9d0c4` | CI/CD scope |
| `scope:db` | `#0075ca` | Database scope |
| `scope:ui` | `#a2eeef` | UI/frontend scope |
| `scope:api` | `#d4c5f9` | API/backend scope |
| `scope:auth` | `#fbca04` | Authentication scope |

### Copilot (1)

| Label | Color | Description |
|---|---|---|
| `copilot:ready` | `#0e8a16` | Issue is ready for Copilot to pick up |

### Chain System (3)

| Label | Color | Description |
|---|---|---|
| `prompt-spec` | `#c5def5` | Prompt specification attached |
| `chain-tracker` | `#bfdadc` | Part of a prompt chain |
| `prompt-chain` | `#d4c5f9` | Prompt chain orchestration |

---

## 5. 043-Specific Labels

These **8 extra labels** are synced ONLY to `one4three-co-next-app` (alias `043`):

| Label | Description |
|---|---|
| `ecommerce` | General e-commerce feature |
| `checkout` | Checkout flow |
| `pdp` | Product detail page |
| `admin` | Admin dashboard |
| `orders` | Order management |
| `conversion` | Conversion optimization |
| `marketing` | Marketing features |
| `social` | Social media integration |

---

## 6. Supabase Secrets Configuration

### Secret Naming Pattern

UGWTF expects GitHub Actions secrets following this pattern:

```
SUPABASE_URL_{ALIAS}
SUPABASE_SERVICE_ROLE_KEY_{ALIAS}
```

Where `{ALIAS}` is the uppercase repo alias from the registered repos table.

### 043 Configuration

| Secret Name | Status |
|---|---|
| `SUPABASE_URL_043` | ❌ **NOT SET** |
| `SUPABASE_SERVICE_ROLE_KEY_043` | ❌ **NOT SET** |

**Current state for 043:** Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist as secrets. These are client-side keys and do NOT satisfy UGWTF's expected secret names.

**To fix:** Go to repo **Settings → Secrets and variables → Actions** and add:
- `SUPABASE_URL_043` — the Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY_043` — the Supabase service role key

---

## 7. Workflows Deployed

UGWTF deploys **6 workflows** to each repo via `ugwtf install` (previously `deploy`):

| Workflow File | Purpose |
|---|---|
| `ci.yml` | Lint, type-check, build, test on push/PR |
| `copilot-assign.yml` | Phase 1: Assign Copilot on `repository_dispatch: chain-next` |
| `copilot-pr-promote.yml` | Phase 2: Draft → ready, request Copilot review |
| `copilot-pr-validate.yml` | Phase 3+5+6+7: Validate, merge, DB firewall, retry |
| `copilot-pr-review.yml` | Phase 4: Re-assign on changes_requested |
| `copilot-pr-merged.yml` | Phase 8: Close issues, dispatch chain-next |
| `copilot-chain-advance.yml` | Phase 9: Advance chain on issue close |
| `security-audit.yml` | Scheduled and on-demand security audits |
| `dependabot-auto-merge.yml` | Auto-merge passing Dependabot PRs |
| `supabase-migration-automation.yml` | Automate Supabase migration checks and deployment |
| `visual-audit.yml` | Visual regression and UI audit |

> **Note:** `install` replaces the legacy `deploy` command. `deploy` remains as a backward-compatible alias.

---

## 8. Label Sync Behavior

Labels are a **one-time setup operation** per repo, performed as part of `install`.

- **Idempotent:** Creates missing labels, updates existing labels (color + description). Never deletes labels.
- **Safe to run repeatedly:** No side effects on subsequent runs, but should not be needed after initial install.
- **Triggered by:** `ugwtf install` or `ugwtf labels`.
- **Label set:** `UNIVERSAL_LABELS` (41) + `repo.extraLabels` (repo-specific).
- **Command:** `ugwtf labels 043` or `ugwtf install --all`.

---

## 9. Chore Workflows

> **UGWTF has NO `chore` command.** Chores must be created manually.

### Steps to Create a Chore

1. Create a GitHub issue with the `type:chore` label.
2. Add appropriate `scope:*` label (e.g., `scope:ci`, `scope:db`).
3. Add appropriate `priority:*` label (e.g., `p1`, `p2`).
4. Add `agent:copilot` label if the chore is automatable by Copilot.
5. Run `ugwtf issues 043` to triage and process.

---

## 10. Agent Workflow Enforcement

### VSCode (Local Agents)

- All Copilot agents in VSCode read:
  - `.github/copilot-instructions.md`
  - `.github/instructions/*.instructions.md`
- These files define naming conventions, metadata requirements, and quality gates.
- UGWTF validates compliance via `ugwtf validate` and `ugwtf audit`.

### GitHub Web/Cloud Agents

- Same instruction files are read by GitHub Copilot cloud agents.
- Workflows in `.github/workflows/` enforce naming, metadata, and quality gates automatically.
- `enforce-naming-convention.yml` blocks PRs/issues without proper titles and metadata.

### Enforcement Checklist

Before any PR merge, ALL of the following must be true:

- [ ] PR title matches `{type}({scope}): {description} — closes #{issue}`
- [ ] Has `type:*` label
- [ ] Has milestone assigned
- [ ] Has assignee
- [ ] Has `Closes #N` in PR body
- [ ] TypeScript, lint, and build checks pass

---

## 11. Pipeline Operations

> For the full pipeline runbook (commands, troubleshooting, common operations), see **[`docs/agent-guide/10-PIPELINE-OPERATIONS.md`](agent-guide/10-PIPELINE-OPERATIONS.md)**.

---

## 12. Image Generation Pipeline

> For the full image generation guide, see **[`image-gen-30x-cli/docs/agent-docs/image/`](https://github.com/DaBigHomie/image-gen-30x-cli/tree/main/docs/agent-docs/image)** in the `image-gen-30x-cli` repo.

| Doc | Purpose |
|-----|---------|
| `00-QUICK-START.md` | Run commands, categories, quality gates |
| `01-ARCHITECTURE.md` | File tree, data flow, core types |
| `02-MANIFEST.md` | Job schema, adding new jobs |
| `03-ASPECT-RATIOS.md` | Standard dimensions per component (3:4 products, 16:9 heroes) |
| `04-PROMPT-ASSEMBLY.md` | 6-block prompt builder |
| `05-GENERATION.md` | Gemini config, resume, MIME handling |
| `06-DEPLOY-WORKFLOW.md` | Full deploy workflow to o43 |
| `07-BRAND-GUIDELINES.md` | Brand rules, logo handling, representation |
| `08-TROUBLESHOOTING.md` | Common pitfalls and fixes |

> **Local path**: `~/management-git/image-gen-30x-cli/docs/agent-docs/image/`
