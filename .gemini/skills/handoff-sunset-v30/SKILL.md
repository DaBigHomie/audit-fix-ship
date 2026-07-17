---
name: handoff-sunset-v30
version: "3.1.0"
updated: 2026-07-17
canonical_basis: documentation-standards/skills/handoff-sunset-v30/SKILL.md
description: >-
  Universal Sunset Handoff 3.0 workflow for all IDE surfaces (Cursor, Claude Code,
  Gemini, Antigravity). One manifest per touched repo × scope (sunset/chapter/thread),
  strict session-manifests naming, CORTEX SSOT write, and multi-agent dispatch.
  Use at session close, workstream-fork phase boundary, or when the user says
  "sunset handoff", "session manifest", "handoff 3.0", "@exit", or "write the baton".
disable-model-invocation: false
---
<!-- GENERATED FROM maximus-ai/skills/handoff-sunset-v30/SKILL.md -- do not edit; run sync-skills.mts -->

# handoff-sunset-v30

**Universal workflow** for Maximus Prime Sunset Handoff 3.0 — same steps on every IDE
surface. Markdown manifests are **mirrors**; **CORTEX** (`cortex_knowledge`) is SSOT.

> **Execute-only:** the handoff-framework is shared infrastructure. Agents **run** its
> scripts; agents do **NOT** edit framework source. See `handoff-framework/AGENTS.md`
> and rule `handoff-framework-execute-only`. Framework changes require human / GOV review.

## Framework v3.1.0 note (read this first)

> `src/cli.mts tasklist`, `src/cli.mts verify-integrity`, `src/scaffold-sunset-handoffs.mts`,
> `src/validate-session-manifests.mts`, and `src/finalize-session-handoff.mts` are **NOT
> shipped** in the installed `@dabighomie/handoff-framework@3.1.0`. Verify:
> `ls $MGMT_ROOT/handoff-framework/src/` and
> `npx tsx $MGMT_ROOT/handoff-framework/src/cli.mts version`. Installed surface is
> `cli.mts` (`init` / `tag-index` / `generate` / `validate` / `validate:naming` /
> `migrate` / `version`) plus `generate-state.mts`, `init-project.mts`,
> `migrate-existing.mts`, `tag-index.mts`, `validate-docs.mts`, `validate-naming.mts`,
> `version-bump.mts`. Below, Steps 0–1 are performed **manually** (no task-list CLI),
> Step 3.5 uses a **manual validation contract**, and Step 4 uses the **direct CORTEX
> writer** — this is the real, exercised path, not the one-shot pipeline. Restoring the
> missing orchestration entry points is tracked as a Prime Governance follow-up
> (CORTEX handoff row 13325, session `sess_atb_wd_waves_20260717_b0ca36`).

**Hub:** `$MGMT_ROOT/documentation-standards/skills/handoff-sunset-v30/SKILL.md`

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
```

| Resource | Path |
|----------|------|
| **Naming SSOT** | `$MGMT_ROOT/documentation-standards/templates/handoff/NAMING-CONVENTIONS.md` |
| **Sunset prompt** | `$MGMT_ROOT/documentation-standards/templates/handoff/PROMPT-SUNSET-HANDOFF-PROTOCOL.md` |
| **Manifest prompt** | `$MGMT_ROOT/documentation-standards/templates/handoff/PROMPT-SESSION-HANDOFF-MANIFEST.md` |
| **Orchestrator prompt** | `$MGMT_ROOT/documentation-standards/templates/handoff/PROMPT-CORTEX-HANDOFF-ORCHESTRATOR.md` |
| **Solution doc** | `$MGMT_ROOT/documentation-standards/docs/HANDOFF-AUTOMATION-SOLUTION.md` |
| **Session manifests dir** | `$MGMT_ROOT/<repo>/docs/session-manifests/` |
| **CORTEX writer** | `$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts` (redirect shim to `$MGMT_ROOT/maximus-ai/scripts/write-handoff-to-cortex.mts`) |
| **One-shot pipeline** | NOT SHIPPED in v3.1.0 — see Step 4 (direct CORTEX writer) |
| **Scaffold stubs** | NOT SHIPPED in v3.1.0 — see Step 1 (manual authoring) |
| **Validate manifests** | NOT SHIPPED in v3.1.0 — see Step 3.5 (manual validation contract) |
| **Multi-agent workflow** | `$MGMT_ROOT/handoff-framework/workflows/handoff-orchestrator-multi-agent.md` |

## Paired skills (read before authoring)

| Skill | Role |
|-------|------|
| [`session-chapter-index`](../session-chapter-index/SKILL.md) | Wave 0 — read-only markers (chapters, threads, artifact pointers) |
| [`handoff-cloud-direct`](../handoff-cloud-direct/SKILL.md) | CORTEX-direct SSOT write when MCP unavailable |
| [`multi-model-task-assignment`](../multi-model-task-assignment/SKILL.md) | Orchestrator Step 0 — agent/cluster routing |
| [`orchestrator-continuation`](../orchestrator-continuation/SKILL.md) | Fresh session resume — consumes CORTEX handoff rows |
| [`forecast-scrutiny`](../forecast-scrutiny/SKILL.md) | Pre-apply blast radius for `--cortex-apply` |

**Policy:** `$MGMT_ROOT/documentation-standards/docs/policies/handoff-cortex-ssot.md`

## Filename convention (v3.1 — strict)

Folder: **`$MGMT_ROOT/<repo>/docs/session-manifests/`**

Filename pattern:

```
<YYYYMMDD>T<HHMMSS>-<detailed-description>-<repo>-<handoff-type>-<cortex-id>.md
```

| Segment | Rule | Example |
|---------|------|---------|
| datetime | UTC `YYYYMMDDTHHMMSS` | `20260708T140530` |
| detailed-description | kebab-case, 2–60 chars | `handoff-automation-v3-rollout` |
| repo | git folder slug | `documentation-standards` |
| handoff-type | `sunset` \| `chapter` \| `thread` \| `index` \| `fork` | `sunset` |
| cortex-id | session_id with `:` → `-` | `task-handoff-automation-solution-20260708` |

Example:

`20260708T140530-handoff-automation-v3-documentation-standards-sunset-task-handoff-automation-solution-20260708.md`

Hub cross-repo index (pointers only): same folder under `documentation-standards`, `handoff-type=index`.

## Workflow (all IDE surfaces)

### Step 0 — Scope

1. List **touched repos** (commits, dirty files, authored docs).
2. Run **session-chapter-index** if chapters/threads need closing manifests.
3. One **sunset manifest per touched repo**; optional **chapter/thread** manifests per scope.

### Step 1 — Scaffold (manual — framework v3.1.0 note)

> `src/scaffold-sunset-handoffs.mts` is NOT shipped in the installed framework
> (verify: `ls $MGMT_ROOT/handoff-framework/src/`). Scaffold the manifest
> manually instead:

1. Create `$MGMT_ROOT/<repo>/docs/session-manifests/` if it does not exist.
2. Create one file per touched repo × scope, named per **Filename convention**
   above (`<YYYYMMDD>T<HHMMSS>-<detailed-description>-<repo>-<handoff-type>-<cortex-id>.md`).
3. Seed frontmatter with the 5 mandatory keys (`version`, `created`, `updated`,
   `cortex_key`, `manifest_path`) and stub the 7 required H2 sections from Step 2
   before drafting content.

Restoring this scaffold entry point is tracked as a Prime Governance follow-up
(CORTEX handoff row 13325, session `sess_atb_wd_waves_20260717_b0ca36`).

### Step 2 — Author manifest

Use [`PROMPT-SUNSET-HANDOFF-PROTOCOL.md`](../../templates/handoff/PROMPT-SUNSET-HANDOFF-PROTOCOL.md).
Required H2 sections:

1. `## [SESSION MANIFEST]`
2. `## [ARTIFACT REGISTRY]`
3. `## [COMMAND SUNSET LOG]`
4. `## [THE BATON]`
5. `## [REPO STATE]` · `## [CORTEX CHECKPOINT]` · `## Change Log`

Mandatory frontmatter: `version`, `created`, `updated`, `cortex_key`, `manifest_path`.

### Step 3 — Multi-agent waves (orchestrator)

| Wave | Agent(s) | Deliverable |
|------|----------|-------------|
| 0 | 181 + session-chapter-index | Markers only |
| 1 | 180 (manifest) + 590 (knowledge) | Parallel |
| 2 | 594 | validate-docs |
| 3 | 181 | CORTEX SSOT `--apply` |
| 4 | 40x panel | If high/critical risk |

See `$MGMT_ROOT/handoff-framework/workflows/handoff-orchestrator-multi-agent.md`.

### Step 3.5 — Validate manifests (required gate — manual contract)

> `src/validate-session-manifests.mts` is NOT shipped in the installed framework
> (verify: `ls $MGMT_ROOT/handoff-framework/src/`). `src/validate-naming.mts` and
> `src/validate-docs.mts` are the nearest shipped validators, but they check a
> **different** convention — the framework's own numeric `init`-generated docs
> (`{NN}-{SLUG}_{YYYY-MM-DD}.md` under `docs/handoff-{session}/`), not this
> skill's `session-manifests` filename pattern. They cannot be pointed directly
> at a sunset/chapter/thread manifest. Until a dedicated manifest validator
> ships, validate every manifest manually against this contract before CORTEX
> write:

| Check | Rule |
|-------|------|
| Filename | Matches the v3.1 pattern in **Filename convention** above, UTC `YYYYMMDDTHHMMSS` datetime |
| Frontmatter | All 5 mandatory keys present: `version`, `created`, `updated`, `cortex_key`, `manifest_path` |
| H2 sections | All 7 present: `[SESSION MANIFEST]`, `[ARTIFACT REGISTRY]`, `[COMMAND SUNSET LOG]`, `[THE BATON]`, `[REPO STATE]`, `[CORTEX CHECKPOINT]`, `Change Log` |
| Change Log | At least one dated row |

A failed check blocks the handoff — fix the manifest, do not proceed to Step 4.
Restoring a dedicated `session-manifests` validator is tracked as a Prime
Governance follow-up (CORTEX handoff row 13325, session
`sess_atb_wd_waves_20260717_b0ca36`).

### Step 4 — Build payload + CORTEX write (direct writer — the shipped path)

> `src/finalize-session-handoff.mts` is NOT shipped in the installed framework
> (verify: `ls $MGMT_ROOT/handoff-framework/src/`). Use the direct CORTEX
> writer instead — dry-run first, apply only after review:

```bash
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<repo> --from-session=<id> --scope-segment=sunset \
  --payload-file=./handoff.json --dry-run

# After human review of the dry-run output:
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<repo> --from-session=<id> --scope-segment=sunset \
  --payload-file=./handoff.json --apply
```

`documentation-standards/scripts/write-handoff-to-cortex.mts` is a redirect
shim to `$MGMT_ROOT/maximus-ai/scripts/write-handoff-to-cortex.mts` (payload
schema v1.0 embedded in that script). Restoring the one-shot
`finalize-session-handoff.mts` pipeline is tracked as a Prime Governance
follow-up (CORTEX handoff row 13325, session
`sess_atb_wd_waves_20260717_b0ca36`).

**CORTEX key:** `handoff:<repo>:<session_id>:<scope-segment>:<YYYY-MM-DD>`

### Step 5 — Governance gate

Do not wide-rollout until **`TASK-GOV-HANDOFF-AUTOMATION-REVIEW-01`** is complete
(CORTEX task + human/GOV sign-off). See `docs/HANDOFF-AUTOMATION-SOLUTION.md`.

## CORTEX knowledge pointers (SSOT index)

| Key | Purpose |
|-----|---------|
| `knowledge:handoff-automation:v3.1:ssot` | Prompt suite + path convention index |
| `handoff:<repo>:<session>:sunset:<date>` | Resumable handoff payload |

Seed script: `$MGMT_ROOT/documentation-standards/scripts/seed-handoff-30-cortex.mts`

## Change Log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 3.1.0 | 2026-07-17 | claude-code | TASK-DOCSTD-SUNSET-SKILL-DRIFT-20260717 — corrected Workflow to match installed `@dabighomie/handoff-framework@3.1.0` reality: `src/cli.mts tasklist`/`verify-integrity`, `src/scaffold-sunset-handoffs.mts`, `src/validate-session-manifests.mts`, `src/finalize-session-handoff.mts` are not shipped. Steps 0–1 now manual, Step 3.5 now a manual validation contract (nearest shipped: `validate-naming.mts`/`validate-docs.mts`, different convention), Step 4 routes to the direct CORTEX writer (`write-handoff-to-cortex.mts --dry-run` → `--apply`). Follow-up to restore the missing entry points tracked at CORTEX handoff row 13325, session `sess_atb_wd_waves_20260717_b0ca36`. |
| 3.1.0 | 2026-07-08 | agent-181 | Universal IDE skill; `session-manifests` + datetime filename v3.1 |
| 3.0.0 | 2026-07-08 | agent-181 | Initial Sunset 3.0 paired with prompt suite |
