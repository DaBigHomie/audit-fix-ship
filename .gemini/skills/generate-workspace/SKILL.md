---
name: generate-workspace
description: >-
  Generate MALFIG-compatible IDE workspaces (Antigravity, Cursor, VS Code) plus
  projects.json and .handoff.config.json for a repo under ~/management-git.
  Driven by a per-repo .workspace.config.json. Use when the user says "create
  workspaces for <repo>", "generate workspace for <repo>", "set up MALFIG
  workspaces for <repo>", or onboards a new sibling clone.
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/generate-workspace/SKILL.md -- do not edit; run sync-skills.mts -->

# Workspace Factory (`/generate-workspace`)

Generates the canonical workspace files MALFIG expects so a new (or refreshed)
sibling clone in `~/management-git` opens cleanly in **Antigravity**, **Cursor**,
and **VS Code** under the same governance (CORTEX boot, ANVIL session
lifecycle, handoff config).

## Preconditions

- `~/management-git` is the sibling-clones root. The repo MUST be checked out at
  `~/management-git/<slug>` before running this skill.
- The repo MUST contain a `.workspace.config.json` at its root.
  - If it doesn't, run with `--init` first to drop the starter template, then
    edit `repo.{name,slug,alias,techStack,owner,packageManager,description}`.
- `slug` MUST match the directory name. The script enforces this.

## 1. Run from `documentation-standards`

```bash
cd ~/management-git/documentation-standards
npx tsx scripts/generate-workspace.mts --repo <slug> --dry-run   # preview
npx tsx scripts/generate-workspace.mts --repo <slug>             # write
npx tsx scripts/generate-workspace.mts --repo <slug> --init      # starter config
```

Always run `--dry-run` first when generating for a repo that already has
workspace files — the script overwrites.

## 2. Files produced

| Path | Purpose |
|---|---|
| `~/management-git/<slug>_antigravity.code-workspace` | Antigravity multi-root with `_inactive_folders` reserve list |
| `~/management-git/<slug>.cursor.code-workspace` | Cursor multi-root (aliased folder names) |
| `~/management-git/<slug>.code-workspace` | VS Code multi-root with favorites |
| `<slug>/projects.json` | MALFIG manifest — repo identity, workspaces, CORTEX boot command, quality gates, governance flags, **primeGate hook commands** |
| `<slug>/.handoff.config.json` | Handoff framework v3.1.0 config (token budget, quality gates, deployment gates) |
| `<slug>/.cursor/hooks/*` + `hooks.json` | **When `cortex` is configured:** SSOT Prime Gate hooks synced from `.agent-kb/templates/cursor-prime-gate/` (stop hook = noop `{}` — prevents auto-followup loop) |

## 3. Config shape (`.workspace.config.json`)

Minimum:

```json
{
  "repo": {
    "name": "Display Name",
    "slug": "repo-slug",
    "alias": "rs",
    "techStack": ["TypeScript"],
    "owner": "DaBigHomie",
    "packageManager": "npm",
    "description": "One-line description"
  }
}
```

Optional overrides: `cortex`, `primeGate`, `qualityGates`, `utilityRepos`, `inactiveRepos`.
Defaults are sourced from `scripts/generate-workspace.mts`. See
[`reference.md`](reference.md) for the full schema and merge semantics.

## 4. After generating

- Open the right workspace file per IDE (`*_antigravity.*` for Antigravity,
  `*.cursor.*` for Cursor, plain `*.code-workspace` for VS Code) — never share
  one workspace file between Cursor and Antigravity (see
  `docs/SESSION-ISOLATION-CONTEXT-40X.md`).
- Commit `.workspace.config.json` to the repo. Do **not** commit the generated
  workspace files at the management-git root — they are per-machine artifacts
  governed by `.gitignore` at that level.
- `projects.json` and `.handoff.config.json` SHOULD be committed inside the
  repo (they encode governance and quality gates).
- Commit `.cursor/hooks/*` and `.cursor/hooks.json` when Prime Gate hooks were
  installed (default when `cortex` is set). **Reload Window** in Cursor after hook changes.
- Audit hooks anytime: `npx tsx scripts/verify-prime-gate-hooks.mts --strict`

## 5. MALFIG verdict format

```
TASK-WORKSPACE — MALFIG review ({slug})
Verdict: PASS | BLOCKED
Violations: (rule IDs + paths, or NONE)
Actions: (ordered list, or NONE)
```

Common BLOCKED reasons:

- `.workspace.config.json` slug mismatches directory name.
- Repo directory not present under `~/management-git`.
- Existing workspace files would be clobbered without `--dry-run` review.

## 6. Limits

- Does not clone the repo. The user / agent must `git clone` first.
- Does not register the repo in `documentation-standards/workspace-rules/repo-registry.json`. That is a separate step.
- Installs **Prime Gate Cursor hooks** from SSOT when `cortex` is configured (override with `primeGate.installHooksOnGenerate: false` or `--skip-prime-gate`). Does not install MCP servers or other per-IDE settings beyond workspace JSON + hooks.
