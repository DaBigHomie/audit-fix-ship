---
name: orchestrator-continuation
version: "1.5.0"
updated: 2026-07-10
canonical_basis: documentation-standards/skills/orchestrator-continuation/SKILL.md
description: >-
  Orchestrator-handoff entry-point. Reduces "pick up where the prior Claude
  Code Opus orchestrator left off" to a single invocation. Queries CORTEX for
  the current Standing menu (pending / in_progress / blocked tasks +
  session:*:chapters-* markers + stale-worktree candidates + external-gate PRs),
  groups results into Quick wins / Standard cycles / Larger cycles / External,
  and either PROMPTS the user for a pick or (with --auto) dispatches the
  highest-priority QUICK-WIN cycle following RUNBOOK.md Patterns A-I. Use when
  the user says "continue cycles", "resume orchestration", "pick up where left
  off", "standing menu", "next cycle", or "orchestrator handoff". Does NOT
  execute standard or larger cycles under --auto — those require explicit
  human pick per the auto-dispatch policy in the runbook §7.
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/orchestrator-continuation/SKILL.md -- do not edit; run sync-skills.mts -->

# orchestrator-continuation

Read-only-by-default entry-point that lets a fresh Claude Code Opus orchestrator
session pick up the prior session's Standing menu **without regression**. This
skill wraps `scripts/orchestrator-continuation-boot.mts` — the script does the
observable-artifact query; the skill decides what to do with the result.

**Hub:** `documentation-standards/skills/orchestrator-continuation/SKILL.md`
**Runbook:** `documentation-standards/docs/runbooks/orchestrator-continuation.md`
**Slash command:** `documentation-standards/.claude/commands/continue-cycles.md`
**Launcher (primary-tree-lag safe):** `documentation-standards/scripts/continue-cycles-launcher.mts`
**Boot script:** `documentation-standards/scripts/orchestrator-continuation-boot.mts`
**Optional hook template:** `documentation-standards/skills/orchestrator-continuation/hook.template.json`

**Related skills:** `plan-audit-fix` (upstream doc-audit), `forecast-scrutiny`
(pre-dispatch blast radius), `forensic-auditing` (methodology),
`session-chapter-index` (session markers already in CORTEX),
`session-cleanup-checkpoint` (teardown pair),
`cortex-sync-skill` (durable checkpoint writes),
`doc-forensic-inventory` (downstream doc sweep),
`claude-board` (status render peer),
`multi-model-task-assignment` (agent routing for a picked cycle),
`malfig` / `malfig-ship` (downstream when the picked cycle produces a PR).

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill (Tier 1)** | `$MGMT_ROOT/documentation-standards/skills/orchestrator-continuation/SKILL.md` |
| **Launcher (invoke this)** | `$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts` |
| **Boot script (wrapped by launcher)** | `$MGMT_ROOT/documentation-standards/scripts/orchestrator-continuation-boot.mts` |
| **Runbook** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-continuation.md` |
| **Slash command** | `$MGMT_ROOT/documentation-standards/.claude/commands/continue-cycles.md` |
| **Optional hook template** | `$MGMT_ROOT/documentation-standards/skills/orchestrator-continuation/hook.template.json` |
| **Grant standing authorization** | `$MGMT_ROOT/documentation-standards/.claude/commands/prime-orchestration-grant-authorization.md` |
| **Revoke standing authorization** | `$MGMT_ROOT/documentation-standards/.claude/commands/prime-orchestration-revoke-authorization.md` |
| **Memory-file mirror sync** | `$MGMT_ROOT/documentation-standards/scripts/sync-standing-authorizations.mts` |
| **Runbook §11 — standing authorization** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-continuation.md#11-standing-authorization-for-cross-session-merge-approval` |
| **plan-audit-fix (upstream)** | `$MGMT_ROOT/documentation-standards/skills/plan-audit-fix/SKILL.md` |
| **session-chapter-index (peer)** | `$MGMT_ROOT/documentation-standards/skills/session-chapter-index/SKILL.md` |

## What this skill does

1. **Discovers** the current Standing menu via the boot script (below).
2. **Groups** rows by cycle-type — Quick wins, Standard cycles, Larger cycles, External.
3. **Prompts** the user for a pick (default) OR **dispatches** the highest-priority Quick-Win cycle (with `--auto`).
4. **Reports** the dispatch as a normal orchestrator status update — chat, or a CORTEX self-index task if the caller requests durable evidence.

## What this skill does NOT do

| Non-goal | Belongs to |
|----------|------------|
| Author a handoff document | `handoff-framework` (consumes `session-chapter-index` seed) |
| Rewrite solution / architecture / spec docs | `doc-forensic-inventory` + `plan-audit-fix` |
| Delete worktrees / branches / files | `session-cleanup-checkpoint` (plan only), `git-hygiene` (execution, gated) |
| Push, merge, or open PRs | `malfig-ship` |
| Auto-dispatch a **standard** or **larger** cycle | Explicit human pick — forbidden by §7 auto-dispatch policy |
| Modify CORTEX rows beyond a self-index task | Downstream orchestrator |
| Run any destructive git ops | Forbidden by Rule 6 |

## Inputs

| Input | Form | Required |
|-------|------|----------|
| `session` | CORTEX `cortex_tasks.session_id` (e.g. `polaris-bootstrap-20260607`) — filters menu | recommended |
| `repo` | Enrolled slug from `workspace-rules/maximus-prime-repo-scope.json` | optional |
| `auto` | Flag — when set, dispatch the top Quick-Win cycle after menu render | optional |
| `all_sessions` | Flag — merge all sessions in the menu | optional |
| `format` | `md` (default) or `json` | optional |

Env vars (loaded via each repo's `.env.local` / `scripts/lib/env.mts` pattern):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — CORTEX reads (mirrors `validate-env.mts`).
- `MANAGEMENT_GIT_ROOT` (or `MGMT_ROOT`) — workspace sibling-clones root.
- `GH_TOKEN` — only if `gh` needs to list unmerged PRs and is not already authed.

## Method

Deterministic steps. Every step consumes OBSERVABLE ARTIFACTS — never memory
of a prior conversation.

### Step 1 — Query the Standing menu (via the launcher)

Invoke the **launcher** — a thin, primary-tree-lag safe wrapper around the
boot script. The launcher fetches `origin` read-only, then either runs the
boot script from the primary tree (if present) or bootstraps a transient
worktree at `origin/master` under `$TMPDIR/continue-cycles-<uid>-<ts>`, runs
the boot script there, and cleans up. Flags, output, and exit code are
passed through verbatim. Do NOT call the boot script directly from the
skill — the launcher is the sanctioned entry point so a fresh session never
hits `ERR_MODULE_NOT_FOUND` when the primary docstd tree lags
`origin/master`.

```bash
: "${MGMT_ROOT:?export MGMT_ROOT}"

# Default: markdown menu, no dispatch
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --session=<session_id_or_omit> \
  --format=md

# JSON for programmatic downstream (e.g. claude-board)
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --format=json

# Merge all sessions (broad menu)
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --all-sessions --format=md
```

Ops-only fallback: if the launcher itself fails, an operator MAY
`git -C $MGMT_ROOT/documentation-standards pull --ff-only` to advance the
primary tree — a manual, documented, ops-only escape hatch (runbook §12).

The script emits four groups:

| Group | Definition |
|-------|------------|
| **Quick wins** | `status=pending` AND `priority IN ('P3','P4')` AND single-file / config-only shape (retirements, scope aliases, small config fixes) |
| **Standard cycles** | `status=pending` AND `priority IN ('P1','P2')` AND multi-file / gate-extension / feature-wave shape |
| **Larger cycles** | `status=blocked` OR multi-PR programs / held-per-directive tasks |
| **External** | `status=pending` AND description matches `human sign-off\|PR review\|external gate` (unmerged PRs cited in CORTEX also land here) |

The script also identifies:

- **Stale-worktree candidates** — worktree branches whose PRs are merged on `origin/master`.
- **External-gate PRs** — unmerged PRs cited in CORTEX rows.
- **Session markers** — `cortex_knowledge` rows with `key LIKE 'session:%:chapters-%'` (per BG-Y / `session-chapter-index` output).

### Step 1b — Check standing authorizations for the intended task scope

Before Step 2 (dispatch), consult the standing-authorization mechanism (runbook
§11) to determine whether a durable human grant already covers the picked
task's scope. Two shapes:

```bash
# One-shot per-scope check (returns a single verdict line):
npx tsx "$MGMT_ROOT/documentation-standards/scripts/continue-cycles-launcher.mts" \
  --check-authorization="merge PRs on all-4-gate PASS across enrolled repos"
# → AUTHORIZATION: GRANTED grant_id=<id> matched_scope="..."
# → AUTHORIZATION: EXCLUDED grant_id=<id> matched_exclude="..."
# → AUTHORIZATION: NOT_GRANTED

# Full menu (default md/json output now includes a "Standing authorizations
# (active)" table + a `standing_authorizations` array in json mode).
```

Interpretation:

| Verdict | Orchestrator behavior |
|---------|----------------------|
| `GRANTED` | Proceed through 4-gate + merge without stopping for human approval. Log the grant_id + matched_scope in the task's `output_blob.authorization_used`. |
| `EXCLUDED` | An exclude fired — MUST stop and ask the human, even if another grant's scope would have matched. |
| `NOT_GRANTED` | Default MALFIG G13 behavior — stop and ask. |

Excludes always win over grants; the `matchScopeAgainstGrants` helper enforces
this. The mechanism does NOT bypass `forecast-scrutiny`, `repo-sync-guard`, or
gate PASS requirements — it only waives the "stop and ask" step at G13.

### Step 1c — Check the branch-claim registry for hidden active dispatches

Runbook §13 — before dispatching, consult
`public.cortex_bg_dispatches` (branch-unique among rows with `status='active'`)
to detect a hidden or concurrent background child on the candidate
`(target_repo, target_branch)`. This closes the `ab30fd60` hidden-child-spawn
hazard: earlier "deflecting" sonnet agents self-delegated into a background
child that ran ~12 min on the same branch as a concurrent haiku redo (~192k
wasted tokens, no damage — but only by luck).

```bash
# Read-only sweep — the slash command wraps this helper:
/prime-orchestration-list-active-dispatches
/prime-orchestration-list-active-dispatches --repo=<slug>
/prime-orchestration-list-active-dispatches --repo=<slug> --branch=<name>

# Programmatic (from a dispatcher script):
npx tsx "$MGMT_ROOT/documentation-standards/scripts/lib/branch-claim.mts" list \
  --repo=<slug> --branch=<name>
```

Interpretation:

| State on `(target_repo, target_branch)` | Orchestrator behavior |
|------|-----------------------|
| No active claim | Proceed to Step 2 (dispatch). Dispatcher MUST `claimBranch(...)` before starting work; child MUST `releaseClaim(...)` on complete / stop / supersede. |
| Active claim, expired (`claim_expires_at < now()`) | Run `expireStale()` first; then the branch is free. |
| Active claim, not expired | STOP for this candidate. Report `conflicting_claim` to the human and pick the next Quick-win. Never dispatch on top of an active claim. |

Under `--auto` the boot sweep MUST NOT emit `DISPATCH_CANDIDATE:` for any
task whose `(repo, branch)` carries an active claim; the candidate is
silently skipped and the next-priority Quick-win considered. This is the
non-destructive stop-condition that would have prevented the `ab30fd60`
collision.

### Step 1d — Scope-check before boot invocation

Runbook §15. Before invoking the launcher, decide the **scope** for this
session's read. The `--scope` flag on the boot script (passed through by
the launcher) filters the menu so a session picking up "Prime work" never
sees repo work, and vice versa. Backward-compat MANDATORY: with no
`--scope`, behavior is unchanged (`--scope=all`).

| Session intent | Command |
|----------------|---------|
| Full workspace visibility (default) | `/continue-cycles` (== `--scope=all`) |
| Pick up ONE repo's cycle, Prime rows excluded | `/prime-orchestration-continue-repo --repo=<slug>` |
| Pick up the Prime queue (cross-repo concerns) | `/prime-orchestration-continue-prime` |
| Triage the human-review queue | `/prime-orchestration-continue-external` |

Scope-check contract:

1. If the user's ask is scope-agnostic ("keep going"), default to
   `--scope=all` (unchanged).
2. If the user's ask names a repo ("resume polaris work"), route to
   `/prime-orchestration-continue-repo --repo=<slug>` — this is the
   pollution-free repo cycle path.
3. If the user's ask names Prime ("attend the Prime queue", "work
   the @prime cycle"), route to `/prime-orchestration-continue-prime`.
4. If the user's ask names human review ("what's waiting on me?"),
   route to `/prime-orchestration-continue-external`.
5. **`--scope=prime` MUST retain the JSONB fallback path** even after
   the BG-VVVV column migration lands — historical rows written before
   the column existed keep `output_blob.prime_addressed=true` and MUST
   still appear.
6. Menu categorization (Quick / Standard / Larger / External) still
   applies WITHIN the filtered set; `--auto` remains Quick-Wins-only.

### Step 2 — Prompt (default) or auto-dispatch (--auto)

**Default (no `--auto`):** print the Menu block to chat, then ask the user:

> Standing menu ready. Which cycle do you want to pick up?
> — reply with the row id, or `auto-quickwins` to dispatch the top Quick-Win only.

**With `--auto`:** the skill dispatches the highest-priority row from
**Quick wins ONLY**. Standard + Larger cycles require an explicit human pick.
This constraint is enforced by the boot script (`--auto` flag filters the
dispatch candidate set to `group == "quick_win"` before selection).

### Step 3 — Dispatch a picked cycle (follow RUNBOOK.md Patterns A-I)

Once a cycle is picked (by user or by `--auto` from Quick wins), follow the
matching pattern from `documentation-standards/docs/runbooks/orchestrator-continuation.md`
§ "Cycle patterns catalog" — which itself cross-links the RUNBOOK.md /
PRIME-WORKFLOW-ARSENAL.md patterns.

The dispatch:

1. Pre-flight: `forecast-scrutiny` on the picked task's blast radius.
2. Pre-flight: `repo-sync-guard` — never dispatch into a worktree with active
   uncommitted work belonging to another agent.
3. Pattern-specific author + gate loop (Patterns A-I).
4. On success: append a status update to chat + optionally file a follow-up
   task via `cortex-sync-skill` if the picked cycle spawns downstream work.

### Step 4 — Report

Emit a single Markdown status block:

```markdown
## ORCHESTRATOR-CONTINUATION — <session_or_scope>

### Menu
- Quick wins: <n> (top: <task_id>)
- Standard cycles: <n>
- Larger cycles: <n>
- External: <n>
- Stale-worktree candidates: <n>
- Session markers: <n>

### Action
- picked_by: user | auto
- cycle_id: <task_id or "none">
- dispatch_pattern: A | B | C | ... | I | none
- forecast-scrutiny: SAFE | SAFE_WITH_GUARDS | HOLD

### Next
- <one-line hand-off to downstream skill or a follow-up prompt>
```

## Composition

- **Upstream** — invoke this skill at the start of a fresh orchestrator session
  (opt-in session-start hook available; see runbook §8 for the template).
- **Peer read-only** — `session-chapter-index` may run first if a prior
  handoff has not yet been indexed; markers it produces feed the menu.
- **Downstream on dispatch** — Patterns A-I compose the actual work (may in
  turn compose `malfig-ship` on gate-pass).
- **Blast-radius pre-flight** — `forecast-scrutiny` runs before dispatch;
  expected verdict `SAFE` or `SAFE_WITH_GUARDS`.

## Hard guardrails

| Allowed | Forbidden |
|---------|-----------|
| Read CORTEX rows via service-role | Write CORTEX rows other than a self-index task |
| Print the Standing menu to chat | Silently install a session-start hook |
| Dispatch a **Quick-Win** cycle under `--auto` | Dispatch a **Standard** or **Larger** cycle under `--auto` |
| `git fetch`, `git worktree list`, `git log` | `git reset`, `git rm`, `git worktree remove`, force-push |
| Read files in any enrolled repo | Edit files outside the picked cycle's declared scope |
| Compose downstream skills that ship a PR | Auto-merge a PR without the human-approval-gate |

## Auto-dispatch policy (mirrors runbook §7)

- Default: `--auto` dispatches at most **ONE** Quick-Win per invocation.
- Standard + Larger cycles: require **explicit human pick** — this is a hard
  rail, not a config toggle.
- `/loop` integration: safe to schedule recurring `/continue-cycles --auto`
  (e.g. every 4 hours). Because the auto-dispatch is Quick-Wins-only, the
  cumulative blast radius per loop iteration stays bounded.
- Escalation path: `task_orchestrator_continuation_auto_dispatch_hardening_20260709`
  captures future work to safely widen the auto-scope with explicit
  guardrails.

## Anti-patterns

| Do not | Do instead |
|--------|------------|
| Rebuild the menu from memory of the prior orchestrator's message | Run the boot script — it queries observable artifacts |
| Auto-dispatch a P1 blocker under `--auto` | Ask the user; blocker resolution is a Larger cycle |
| Dispatch into a worktree already owned by another lane | Run `repo-sync-guard` first — halt if lane is active |
| Merge the picked cycle's PR without gates | Compose `malfig-ship` — it runs the 4-gate stack |
| Hardcode `/Users/<who>/...` paths | Use `$MGMT_ROOT` + `$HOME` |

## /prime-orchestration-* command family

This skill also backs the `/prime-orchestration-*` slash-command family
shipped in `documentation-standards/.claude/commands/` (family runbook:
`documentation-standards/docs/runbooks/prime-orchestration-commands.md`).
Each family command is a thin preset over this skill or over
`orchestration-standards-enforcer`:

| Command | Preset / skill routed to |
|---------|--------------------------|
| `/prime-orchestration-audit-pr-set` | this skill, preset `audit-pr-set` (S13 fanning S9) |
| `/prime-orchestration-validate-cross-workstation` | this skill, preset `validate-cross-workstation` (S9 + repo test-suite) |
| `/prime-orchestration-enforce` | `orchestration-standards-enforcer` skill (S4) |
| `/prime-orchestration-delegate` | this skill, preset `delegate-shape` (direct MCP `dispatch_next_cycle` invocation, `maximus-ai#213`) |
| `/prime-orchestration-continue` | alias for `/continue-cycles` (this skill, default flow) |
| `/prime-orchestration-continue-prime` | this skill, preset `--scope=prime` (runbook §15) |
| `/prime-orchestration-continue-repo` | this skill, preset `--scope=repo=<slug>` (runbook §15) |
| `/prime-orchestration-continue-external` | this skill, preset `--scope=external` (runbook §15) |
| `/prime-orchestration-grant-authorization` | this skill, standing-authorization grant path (runbook §11) |
| `/prime-orchestration-revoke-authorization` | this skill, standing-authorization revoke path (runbook §11) |

All family commands inherit the hard-guardrails table above. No new
orchestration logic is added by the family — it is naming + argument
validation + preset composition. See the family runbook for argument
conventions and composition examples.

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.5.0 | 2026-07-10 | Added Step 1d (scope-check before boot invocation) + documented `--scope=all\|prime\|repo=<slug>\|external` on the boot script. Three new family commands `/prime-orchestration-continue-prime`, `-continue-repo`, `-continue-external` presets. Backward-compat mandatory: no-flag behavior unchanged; `--scope=prime` retains JSONB fallback for BG-VVVV transition window (and permanently for historical rows). Closes the mixed-queue gap where a fresh session had no way to distinguish Prime work from repo work (`task_scope_aware_continue_20260710`). |
| 1.4.0 | 2026-07-10 | Added Step 1c (branch-claim registry check) + non-destructive stop-condition on active claim. Backed by new helper `scripts/lib/branch-claim.mts` (`claimBranch` / `releaseClaim` / `findActiveClaims` / `expireStale`) writing to `public.cortex_bg_dispatches` (branch-unique among active). Surfaces via `/prime-orchestration-list-active-dispatches`. Closes the `ab30fd60` hidden-child-spawn hazard (~192k wasted tokens, no damage). Runbook §13 documents the incident + gate contract (`task_dispatch_claim_registry_20260710`). |
| 1.3.0 | 2026-07-10 | Added `continue-cycles-launcher.mts` — primary-tree-lag safe wrapper around the boot script (fetches `origin` read-only, then either runs the boot script from the primary tree OR bootstraps a transient worktree at `origin/master` under `$TMPDIR` and cleans up via try/finally). Slash commands `/continue-cycles` + `/prime-orchestration-continue` and SKILL Method Step 1 now invoke the launcher. Closes `ERR_MODULE_NOT_FOUND` when primary docstd tree lags `origin/master` (`task_continue_cycles_launcher_20260710`). |
| 1.2.0 | 2026-07-10 | Added standing-authorization mechanism (Step 1b, `--check-authorization`, grant/revoke slash commands, memory-file mirror). Boot script now queries `cortex_knowledge` keys `authorization:standing:*` (bounded 20 rows) and exposes GRANTED / EXCLUDED / NOT_GRANTED verdicts. Closes cross-session merge-approval gap (`task_standing_authorization_mechanism_20260710`). |
| 1.1.0 | 2026-07-09 | Documented the `/prime-orchestration-*` command family that composes this skill via presets (`audit-pr-set`, `validate-cross-workstation`, `delegate-shape`) alongside `orchestration-standards-enforcer`. No logic change (`task_prime_orchestration_commands_20260709`). |
| 1.0.0 | 2026-07-08 | Initial. Orchestrator-handoff entry-point that queries the Standing menu from CORTEX observable artifacts, prompts or `--auto`-dispatches (Quick wins only), and composes Patterns A-I via the runbook (`task_orchestrator_continuation_skill_20260708`). |
