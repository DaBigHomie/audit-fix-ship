---
name: orchestration-standards-enforcer
version: "1.0.1"
updated: 2026-07-08
canonical_basis: documentation-standards/skills/orchestration-standards-enforcer/SKILL.md
description: >-
  Codifies the MALFIG-aligned orchestration standards contract — 4-gate stack
  (forecast-scrutiny → MALFIG G1-G14 → forensic-auditing → doc-forensic-inventory,
  1-iter bounded fix loop, merge only on all-gates-PASS), fresh-worktree-only
  discipline, verify-then-write on every SHA/PR/path/task_id citation, and a
  no-fabrication rule for unknown CLI/model/capability shapes — and syncs the
  canonical policy block into CLAUDE.md, AGENTS.md, and root-level Copilot/Claude
  instruction surfaces across every Prime-enrolled repo via
  `scripts/enforce-orchestration-standards.mts`. Trigger phrases: "orchestration
  standards", "4-gate stack policy", "CLAUDE.md sync", "verify-then-write",
  "no fabrication policy", "enforce standards", "enforce orchestration standards",
  "sync orchestration policy".
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/orchestration-standards-enforcer/SKILL.md -- do not edit; run sync-skills.mts -->

# orchestration-standards-enforcer

Tier 1 hub SSOT for the workspace's **orchestration standards contract**. Documents
WHAT the policy is, WHY it exists, WHERE it applies, and provides the sync
mechanism (`scripts/enforce-orchestration-standards.mts`) that writes/updates a
single delimited block in each enrolled policy surface.

**Single source of truth:** the canonical block lives in this file, between the
`<!-- BEGIN: orchestration-standards-enforcer ... -->` and
`<!-- END: orchestration-standards-enforcer -->` markers below. The enforcer script
greps those markers, extracts the block verbatim, and replaces the same delimited
region in each target file. **Do not edit the block in target files** — run the
enforcer to update.

Delimiter convention (HTML-comment BEGIN/END pair) is **house-new** for
`documentation-standards` — no peer skill in this repo currently uses a
markdown-embedded delimited enforcement region. This skill establishes it.

---

## Why this policy exists

Four gaps observed in multi-agent orchestration sessions on 2026-07-06 → 2026-07-07:

1. **Gate skipping / gate reordering** — agents ran `MALFIG` before
   `forecast-scrutiny`, or ran `forensic-auditing` without a bounded fix loop, so
   findings compounded across iterations and merges shipped on partial PASS.
2. **Shared-tree mutation** — agents ran `git checkout <feature>` on the primary
   worktree while another agent held a lock, corrupting in-flight work.
3. **Subagent-claim propagation** — background-agent SHA/PR/path claims were
   written into durable docs and CORTEX rows without deterministic verification
   (`gh pr view`, `git show origin/<branch>:<path>`, `test -f`).
4. **CLI / API fabrication** — flags, headers, and model IDs were invented when
   a real capability probe would have flagged the unknown.

The policy block below is the minimum contract that closes all four gaps.

---

## The canonical policy block

The following block is the SSOT. The script `enforce-orchestration-standards.mts`
reads between the BEGIN/END markers verbatim (byte-for-byte, including the outer
comment lines) and writes that same region into each target file.

<!-- BEGIN: orchestration-standards-enforcer (source: documentation-standards/skills/orchestration-standards-enforcer/SKILL.md) -->
## Orchestration Standards (MALFIG-aligned)

- **4-gate stack, in order:** `forecast-scrutiny` → `MALFIG` (G1-G14) → `forensic-auditing` (Rules 1-5) → `doc-forensic-inventory`. Bounded fix loop of 1 iteration per gate. Merge only on all-gates-PASS.
- **Fresh worktrees only.** No git checkout / reset / rm on shared trees. Cut a worktree per PR from `origin/main` (or `origin/master`). Peer prior-art (each verified MERGED via `gh pr view`, repo-prefixed to disambiguate): `maximus-ai #196`, `maximus-ai #197`, `maximus-ai #198`, `maximus-ai #199`, `maximus-ai #200`, `maximus-ai #201`, `maximus-ai #202`, `docstd #64`, `polaris #14`.
- **Verify-then-write.** Every SHA, PR, path, task_id, or CLI shape cited MUST be verified against real state (`gh pr view`, `git show origin/<branch>:<path>`, `test -f`, `which <bin>`, `--help` probe). Reject unverified subagent claims before durable writes.
- **No fabrication.** Unknown CLI shapes, model IDs, capability profiles, or invocation APIs are marked `UNKNOWN — research required` and filed as follow-up tasks. Never invent flags, headers, or paths.

Source: `documentation-standards/skills/orchestration-standards-enforcer/SKILL.md` — do not edit this block in place; run the enforcer script to update.
<!-- END: orchestration-standards-enforcer -->

---

## Where the block gets synced

Per authority plan
[`~/.cursor/plans/malfig_workflow_diff_map_ba19fb65.plan.md`](file:///Users/dabighomie/.cursor/plans/malfig_workflow_diff_map_ba19fb65.plan.md)
§7.1 (Prime surface type taxonomy). This PR ships enforcement for the primary
**instruction-adjacent** and **instruction** surfaces only:

| Surface | Path pattern | Rationale |
|---------|--------------|-----------|
| Repo CLAUDE.md | `{repo}/CLAUDE.md` | Claude Code per-repo policy (surface 3-adjacent) |
| Repo AGENTS.md | `{repo}/AGENTS.md` | Agent-runtime instructions (surface 3) |
| Copilot / Claude instruction | `{repo}/.github/instructions/orchestration-standards.instructions.md` | Path-scoped instruction — created if the file does not exist (surface 3). Does NOT touch other `.instructions.md` files. |
| Workspace-root CLAUDE.md | `$MGMT_ROOT/CLAUDE.md` | Single write, workspace-wide policy |

**Out of scope this PR** (broader IDE-surface fan-out is a governed follow-up
task, ships via `sync-skills.mts` + this script's next iteration):

- `.cursor/rules/*.mdc` (Cursor rules)
- `.gemini/rules/*.md` (Gemini rules)
- `.claude/commands/*.md` (Claude Code slash commands)
- `.system/plugins/*/` (plugin bundles)
- Any legacy `.agents/skills/` layout

---

## How the script targets repos

```
scripts/enforce-orchestration-standards.mts
```

- Enrolled repos discovered via `workspace-rules/maximus-prime-repo-scope.json`
  through the shared helper `scripts/lib/resolve-prime-repos.mts`
  (`requireCheckout: true` — only repos with a local `.git/` directory).
- Never invents surface enrollment; never scans sibling directories outside the
  scope SSOT.
- `--dry-run` is the DEFAULT — prints the per-file diff (`written` /
  `up-to-date` / `missing-target-file` / `skipped`) without touching disk.
- `--apply` performs atomic BEGIN/END-delimited section replacement (or appends
  if the block is missing). Idempotent: re-running against a file that already
  carries the current block is a no-op.
- `--repo=<slug>` narrows to a single enrolled repo; `--all` is explicit (also
  the default target set when neither is passed).
- Exits non-zero if the canonical block cannot be extracted from this skill file
  (SSOT integrity check).

### CLI

```bash
# default: dry-run across all enrolled repos
npx tsx documentation-standards/scripts/enforce-orchestration-standards.mts

# narrow to one repo
npx tsx documentation-standards/scripts/enforce-orchestration-standards.mts --repo=maximus-ai

# apply (write)
npx tsx documentation-standards/scripts/enforce-orchestration-standards.mts --apply --all
```

---

## Dogfood scope (this PR)

The script's initial application is **`documentation-standards` only** — this PR
adds the block to:

- `documentation-standards/CLAUDE.md` (created if missing)
- `documentation-standards/AGENTS.md` (created if missing)
- `documentation-standards/.github/instructions/orchestration-standards.instructions.md`

Fan-out to the other enrolled repos is the follow-up task
`task_orchestration_standards_apply_all_repos_20260708`, executed post-merge
with a fresh worktree, gates, and an explicit `--apply`.

---

## Portability

- Uses `MANAGEMENT_GIT_ROOT` (or falls back to `$HOME/management-git` via
  `mgRoot()` in `resolve-prime-repos.mts`). Never hardcodes user paths.
- Script is `.mts`, Node built-ins only, no new npm dependencies.

---

## Recommended fanout wrapper — `governed-fanout.mts`

For any operator running enforcer fanouts (this script, `sync-skills.mts`,
`sync-agents.mts`, `sync-instructions.mts`, `sync-prompts.mts`,
`sync-commands.mts`, `sync-user-claude.mts`), the **recommended non-dirty-primary
path is the wrapper**:

```bash
npx tsx documentation-standards/scripts/governed-fanout.mts \
  --sync-script=<skills|agents|instructions|prompts|commands|user-claude> \
  [--apply] [--auto-merge] [--cleanup-after-merge]
```

The wrapper cuts a fresh worktree per enrolled repo, generates the
`targets.json`, invokes the requested sync script, and (optionally) opens +
merges the resulting PRs — leaving every primary worktree clean. Bare
invocation of the sync-* scripts is a low-level primitive; typical users
should call the wrapper. See `docs/runbooks/governed-fanout.md`.

---

## Governance references

- Authority plan: `~/.cursor/plans/malfig_workflow_diff_map_ba19fb65.plan.md`
  (surface taxonomy §7.1, artifact placement §7.4)
- Peer scope loader: `scripts/lib/resolve-prime-repos.mts`
- Peer sync pattern: `scripts/sync-skills.mts`
- Recommended wrapper: `scripts/governed-fanout.mts` (task
  `task_governed_fanout_wrapper_20260710`)
- Gate stack skills: `forecast-scrutiny`, `malfig`, `forensic-auditing`,
  `doc-forensic-inventory`

---

## Change Log

| Version | Date | Change | Task |
|---------|------|--------|------|
| 1.0.0 | 2026-07-07 | Initial skill + canonical block + `enforce-orchestration-standards.mts` (dogfood scope: documentation-standards). Shipped in `docstd #65`. | `task_skill_orchestration_standards_enforcer_20260707` |
| 1.0.1 | 2026-07-08 | Corrected canonical block prior-art citations: every PR now verified MERGED via `gh pr view` on its specific repo and repo-prefixed to disambiguate (`maximus-ai #196-#202`, `docstd #64`, `polaris #14`). Pre-fires ahead of the all-repos fan-out to prevent propagating unverified refs to 33 files across 11 repos. | `task_enforcer_block_correction_20260708` |
| 1.0.2 | 2026-07-10 | Cross-linked the new `governed-fanout.mts` wrapper as the recommended non-dirty-primary path for all sync-* fanouts. | `task_governed_fanout_wrapper_20260710` |
