---
description: "Generate MALFIG-compatible IDE workspaces (Antigravity, Cursor, VS Code) plus projects.json and .handoff.config.json for a repo under ~/management-git. Use when onboarding a new sibling clone or refreshing workspace files after a stack change."
argument-hint: "Repo slug (directory name under ~/management-git). Example: career-corpus"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/generate-workspace.prompt.md -- do not edit; run sync-agents.mts -->

# Generate Workspace (`/generate-workspace`)

You are running the **Workspace Factory** (WSF-001) against the slug provided
as argument. The canonical script lives at
`documentation-standards/scripts/generate-workspace.mts` and is driven by
`<slug>/.workspace.config.json`.

## Step 1: Verify preconditions

1. Confirm `~/management-git/<slug>` exists. If not — STOP and tell the user
   to clone first. Output the exact `git clone` command if a remote URL is
   in scope.
2. Read `<slug>/package.json`, `<slug>/README.md`, and `<slug>/AGENTS.md` (if
   present) to learn the tech stack and any non-default quality gates.
3. Check whether `<slug>/.workspace.config.json` already exists.

## Step 2: Author or update `.workspace.config.json`

If absent, create it at `~/management-git/<slug>/.workspace.config.json` using
the schema in
`documentation-standards/skills/generate-workspace/reference.md`.

Required:

```json
{
  "repo": {
    "name": "<display name>",
    "slug": "<must match directory name>",
    "alias": "<2-4 char lowercase>",
    "techStack": ["<curated 3-7 entries>"],
    "owner": "DaBigHomie",
    "packageManager": "<npm | pnpm | yarn | bun>",
    "description": "<one line, no emoji>"
  }
}
```

Add `qualityGates` ONLY when `package.json` defines scripts for them. Default
gate (`typescript: npx tsc --noEmit`) is auto-applied when omitted.

## Step 3: Dry-run, then write

```bash
cd ~/management-git/documentation-standards
npx tsx scripts/generate-workspace.mts --repo <slug> --dry-run
```

Review the 5 listed paths. If any pre-existing file at
`~/management-git/<slug>{_antigravity,.cursor,}.code-workspace`,
`<slug>/projects.json`, or `<slug>/.handoff.config.json` would be clobbered,
SHOW the dry-run output to the user and confirm before writing.

Then:

```bash
npx tsx scripts/generate-workspace.mts --repo <slug>
```

This also syncs **Prime Gate Cursor hooks** from SSOT when `cortex` is configured
(stop hook = noop `{}` to prevent auto-followup loops). Skip with `--skip-prime-gate`.

## Step 4: Emit MALFIG verdict

```
TASK-WSF-<short> — Workspace Factory ({slug})
Verdict: PASS | BLOCKED
Files written:
  - ~/management-git/<slug>_antigravity.code-workspace
  - ~/management-git/<slug>.cursor.code-workspace
  - ~/management-git/<slug>.code-workspace
  - ~/management-git/<slug>/projects.json
  - ~/management-git/<slug>/.handoff.config.json
Violations: NONE
Actions:
  1. Open the right workspace file per IDE (never share between Cursor + Antigravity).
  2. Commit .workspace.config.json, projects.json, .handoff.config.json inside <slug>.
  3. Commit .cursor/hooks/* + hooks.json if Prime Gate hooks were installed; Reload Window in Cursor.
  4. (Optional) Register <slug> in documentation-standards/workspace-rules/repo-registry.json.
```

## Limits

- This prompt only orchestrates the script — it never edits the script itself,
  the template, or the skill/agent/prompt files. Those are governance.
- Does not clone the repo or modify per-IDE settings beyond generated workspace JSON.
- **Does** install Prime Gate Cursor hooks from SSOT when `cortex` is configured (unless `--skip-prime-gate`).
