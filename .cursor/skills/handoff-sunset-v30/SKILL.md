---
name: handoff-sunset-v30
version: "3.1.0"
updated: 2026-07-08
canonical_basis: documentation-standards/skills/handoff-sunset-v30/SKILL.md
description: >-
  Universal Sunset Handoff 3.0 workflow for all IDE surfaces (Cursor, Claude Code,
  Gemini, Antigravity). One manifest per touched repo × scope (sunset/chapter/thread),
  strict session-manifests naming, CORTEX SSOT write, and multi-agent dispatch.
  Use at session close, workstream-fork phase boundary, or when the user says
  "sunset handoff", "session manifest", "handoff 3.0", "@exit", or "write the baton".
disable-model-invocation: false
---

# handoff-sunset-v30

**Universal workflow** for Maximus Prime Sunset Handoff 3.0 — same steps on every IDE
surface. Markdown manifests are **mirrors**; **CORTEX** (`cortex_knowledge`) is SSOT.

> **Execute-only:** the handoff-framework is shared infrastructure. Agents **run** its
> scripts; agents do **NOT** edit framework source. See `handoff-framework/AGENTS.md`
> and rule `handoff-framework-execute-only`. Framework changes require human / GOV review.

## Formatted task list (read-only, automatable)

Print the Sunset 3.0 execution DAG as a formatted checklist — never edits anything:

```bash
cd "$MGMT_ROOT/handoff-framework"
REPOS="<comma-separated touched repos>"
npx tsx src/cli.mts tasklist --repos="$REPOS" --from-session=<session_id>
# guard before running write steps:
npx tsx src/cli.mts verify-integrity --strict
```

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
| **CORTEX writer** | `$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts` |
| **One-shot pipeline** | `$MGMT_ROOT/handoff-framework/src/finalize-session-handoff.mts` |
| **Scaffold stubs** | `$MGMT_ROOT/handoff-framework/src/scaffold-sunset-handoffs.mts` |
| **Validate manifests** | `$MGMT_ROOT/handoff-framework/src/validate-session-manifests.mts` |
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

### Step 1 — Scaffold (optional)

`--repos` is a **variable** (touched-repo list). `--session-path` optionally overrides
the derived `<repo>/docs/session-manifests/` output dir.

```bash
cd "$MGMT_ROOT/handoff-framework"
REPOS="<repo-a>,<repo-b>"

npx tsx src/scaffold-sunset-handoffs.mts \
  --from-session=<session_id> \
  --repos="$REPOS" \
  --scope=sunset \
  --description=<detailed-description-slug> \
  [--session-path=<dir>]
```

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

### Step 3.5 — Validate manifests (required gate)

Every handoff manifest MUST pass the validation script before CORTEX write:

```bash
cd "$MGMT_ROOT/handoff-framework"
REPOS="<comma-separated touched repos>"
npx tsx src/validate-session-manifests.mts --repos="$REPOS"
#   or explicit dir:
#   npx tsx src/validate-session-manifests.mts --session-path=<dir>
```

Validates: v3.1 filename pattern, UTC datetime, required frontmatter keys, `## Change Log` row.
Non-zero exit blocks the handoff.

### Step 4 — Build payload + CORTEX (default dry-run)

```bash
cd "$MGMT_ROOT/handoff-framework"
npx tsx src/finalize-session-handoff.mts \
  --repo=<primary-repo> \
  --from-session=<session_id> \
  --description=<detailed-description-slug> \
  --goal="One-line outcome"

# After human review of .handoff-work/<session>/handoff.json:
npx tsx src/finalize-session-handoff.mts \
  --repo=<repo> --from-session=<id> \
  --description=<slug> --build-payload --cortex-apply
```

Or cloud-direct:

```bash
npx tsx "$MGMT_ROOT/documentation-standards/scripts/write-handoff-to-cortex.mts" \
  --repo=<repo> --from-session=<id> --scope-segment=sunset \
  --payload-file=./handoff.json --apply
```

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
| 3.1.0 | 2026-07-08 | agent-181 | Universal IDE skill; `session-manifests` + datetime filename v3.1 |
| 3.0.0 | 2026-07-08 | agent-181 | Initial Sunset 3.0 paired with prompt suite |
