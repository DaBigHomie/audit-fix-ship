---
name: orchestrator-response-templates
version: "1.0.0"
updated: 2026-07-08
canonical_basis: documentation-standards/skills/orchestrator-response-templates/SKILL.md
description: >-
  The reproducible OUTPUT shape of the orchestrator persona — status board,
  menu, BG-acknowledgment, session-tally rule, verify-then-write helper. Wraps
  the `scripts/orchestrator-persona/` module. Use when the user says
  "orchestrator persona", "status board template", "session tally rule", "how
  to format the menu", "BG acknowledgment format", or when a new orchestrator
  session needs to reproduce the persona's response discipline. Pairs with
  `orchestrator-continuation` (BG-GGG process) and the MMTA MCP tools (BG-HHH).
disable-model-invocation: true
---
<!-- GENERATED FROM maximus-ai/skills/orchestrator-response-templates/SKILL.md -- do not edit; run sync-skills.mts -->

# orchestrator-response-templates

The **persona = process + output**. Process (skill + boot script + slash
command + runbook) lives in `orchestrator-continuation`. MCP tools live in the
MMTA MCP surface. **This skill = output** — the reproducible response shapes
the orchestrator emits between BG dispatches.

**Companion module:** `documentation-standards/scripts/orchestrator-persona/`
**Companion runbook:** `documentation-standards/docs/runbooks/orchestrator-persona.md`

## Path resolution (portable)

```bash
: "${MGMT_ROOT:?export MGMT_ROOT to workspace sibling-clones root}"
```

| Resource | Resolve order |
|----------|---------------|
| **This skill (Tier 1)** | `$MGMT_ROOT/documentation-standards/skills/orchestrator-response-templates/SKILL.md` |
| **Module** | `$MGMT_ROOT/documentation-standards/scripts/orchestrator-persona/index.mts` |
| **Runbook** | `$MGMT_ROOT/documentation-standards/docs/runbooks/orchestrator-persona.md` |
| **Fixture** | `$MGMT_ROOT/documentation-standards/scripts/orchestrator-persona/fixtures/session-state-example.json` |
| **Process peer** | `$MGMT_ROOT/documentation-standards/skills/orchestrator-continuation/SKILL.md` (BG-GGG) |
| **Pattern catalog** | `$MGMT_ROOT/maximus-ai/docs/prime-governance/PRIME-WORKFLOW-ARSENAL.md` (maximus-ai PR #212 · `32b71207`) |
| **MMTA runbook** | `$MGMT_ROOT/documentation-standards/skills/multi-model-task-assignment/RUNBOOK.md` (docstd PR #64 · `fd877de`) |

---

## 1. Overview

The orchestrator persona has TWO halves. Reproducing the persona for a future
session requires BOTH:

| Half | Home | Delivery |
|---|---|---|
| Process (how to dispatch + gate + merge) | `skills/orchestrator-continuation/` | BG-GGG |
| Output (what the orchestrator says in chat) | this skill + `scripts/orchestrator-persona/` | THIS PR |
| MCP tools (tool surface for the above) | MMTA MCP | BG-HHH |

Session-tally, status-board, menu, and BG-acknowledgment discipline are the
FOUR shapes a user watches repeat every cycle. If they are inconsistent, the
persona is broken even when the process is intact.

---

## 2. The 5 output shapes

Each shape has a canonical example drawn from THIS session's real prior-art.
Every PR + SHA below is verifiable via `gh pr view`.

### 2.1 Status board — `formatStatusBoard(state: SessionState): string`

Text-first dual of `claude-board` (docstd PR #61 · `3821468`). Emitted at
cycle boundaries: after a BG completes, or when the user asks "what's the
state".

Canonical example (fixture-driven, 2026-07-08):

```
## Status — polaris-bootstrap-20260607 · cycle 2026-07-08

### Still in flight (2)
- BG-GGG · `task_orchestrator_continuation_skill_20260708` · documentation-standards · orchestrator-continuation skill + boot script + slash command + runbook [in_progress]
- BG-HHH · `task_orchestrator_mcp_tools_20260708` · documentation-standards · MMTA MCP tools for orchestrator handoff [in_progress]

### Completed this cycle (2)
- BG-FF · documentation-standards #72 (`bfe1fa0e5f0d`) — remote-name alias damieus_workflow_analysis registered — resolves cross-workstation drift
- BG-EE · documentation-standards #71 (`a813b12c207d`) — sync-agents/prompts/instructions worktree-safe flags parity with sync-skills PR #67

### Session tally
8 merged PRs across 2 repos (documentation-standards:6, maximus-ai:2)

### Menu
...
```

### 2.2 Menu — `formatMenu(items: MenuItem[]): string`

Four-bucket categorization per PRIME-WORKFLOW-ARSENAL (maximus-ai PR #212):

- **Quick wins** — single-file docs edit / one-line config / trivial follow-up
- **Standard cycles** — one PR, 4-gate stack, ~30-60 min BG cycle
- **Larger cycles** — multi-PR wave, cross-repo, retirement gate
- **External** — vendor/infra/human-only (Supabase dashboard, secret rotation)

Canonical example:

```
### Menu

**Quick wins**
- Update CLAUDE.md active-work block with new PR merges (`task_claude_md_active_work_refresh_20260708`) — single-file edit, no code paths

**Standard cycles**
- Ship orchestrator-persona module (this PR) (`task_orchestrator_persona_module_20260708`) — one PR, 4-gate stack, ~30 min

**Larger cycles**
- Cross-repo relocation of stale MMTA docs (ADD-then-DELETE) (`task_mmta_stray_docs_cleanup_20260709`) — 2 PRs, strict merge order, per Pattern B

**External**
- Rotate SUPABASE_SERVICE_ROLE_KEY (dashboard-only) (`task_env_local_rotation_execute_20260709`) — human-only per runbook §3
```

### 2.3 BG-acknowledgment — `formatBgAcknowledgment(result: BgResult): string`

Brief post-BG summary. **1–3 lines**. No verbose recap — the user has the BG
report; the orchestrator confirms receipt + surfaces the ONE notable finding
+ notes the retirement-queue impact.

Canonical example (BG-FF completing docstd PR #72):

```
BG-FF landed documentation-standards #72 (bfe1fa0e5f0d) — forecast-scrutiny=PASS malfig=PASS forensic-auditing=PASS doc-forensic-inventory=PASS.
Notable: remote-name alias damieus_workflow_analysis registered — resolves cross-workstation drift.
Retirement queue: +1.
```

### 2.4 Session tally — `computeSessionTally(prs: PrRecord[]): number`

Canonical monotonic PR counting rule:

- **Uniqueness key = `${repo}#${pr_number}`** — NOT title, NOT SHA
- **One PR = one increment**, even when mentioned across multiple BG reports
- **Monotonic** — a PR counted once stays counted

Rationale: squash-merge can rewrite SHAs on rebase; titles drift on amend;
only the PR number is stable across the merge lifecycle.

### 2.5 Verify-then-write — `verifyBeforeWrite<T>(claim, verifyFn)`

Every PR / SHA / task_id / skill path / CLI shape cited in an orchestrator
response MUST be verified before it lands. MMTA RUNBOOK Pattern E enforces
this at author time; this helper enforces it at code time.

Canonical example:

```ts
const pr = await verifyBeforeWrite(
  { repo: "documentation-standards", pr_number: 61, merge_sha: "3821468bac..." },
  async (c) => {
    const out = execSync(
      `gh pr view ${c.pr_number} --repo DaBigHomie/${c.repo} --json state,mergeCommit`,
    );
    const j = JSON.parse(out.toString());
    return j.state === "MERGED" && j.mergeCommit.oid.startsWith(c.merge_sha);
  },
);
```

Throws `UnverifiedClaimError` when the verifier returns false OR throws.

---

## 3. Persona invariants

The response discipline the orchestrator must hold on EVERY cycle:

| # | Invariant |
|---|---|
| 1 | Session tally counts monotonically — one PR = one increment, never double-counted |
| 2 | Status boards categorize by lifecycle stage — In flight / Completed this cycle / Session tally / Menu |
| 3 | Menus prioritize by wave — Quick wins / Standard / Larger / External |
| 4 | BG-acknowledgments are brief — 1–3 lines, one notable finding, retirement delta |
| 5 | Verify-then-write on every claim about PR / SHA / path / skill / task_id |
| 6 | Honest UNKNOWN over fabrication — mark unknowns, file research task, never invent |
| 7 | Empty sections render `(none — ...)` — never silently omit; the reader must see the section was considered |

---

## 4. When to use the module vs improvise

| Use module | Improvise |
|---|---|
| Status boards (stable shape) | Novel error narratives |
| Session-tally counting | Cross-BG coordination decisions |
| Menu categorization | Multi-turn planning conversations |
| BG-acknowledgment (post-cycle) | User Socratic exchanges |
| Verify-then-write on every citation | (always use the helper — no exceptions) |

**Never fabricate PR numbers or SHAs — use `verifyBeforeWrite`, or report UNKNOWN.**

---

## 5. Composition

Pairs with:

- `orchestrator-continuation` (BG-GGG delivery) — process side of the persona (dispatch cadence, boot script, slash command, runbook)
- MMTA MCP tools (BG-HHH delivery) — tool surface exposed to the orchestrator
- `multi-model-task-assignment` RUNBOOK (docstd PR #64 · `fd877de`) — pattern catalog
- `claude-board` (docstd PR #61 · `3821468`) — HTML dual of the text status board
- `session-status` — one-shot status audit peer

References `PRIME-WORKFLOW-ARSENAL.md` (maximus-ai PR #212 · `32b71207`) for
pattern selection when routing a menu item to the right wave sizing.

---

## 6. Anti-patterns

| Do not | Do instead |
|---|---|
| Silently double-count PRs when a BG re-cites an earlier PR | `computeSessionTally` — repo#pr_number dedup |
| Cite a merge SHA from memory | `verifyBeforeWrite` with `gh pr view --json mergeCommit` |
| Invent a gate verdict when a gate wasn't run | Emit `verdict: "SKIP"` and note it in the ack |
| Omit "Still in flight" when zero BGs are running | Render `Still in flight (0)` + `(none — cycle idle)` |
| Bury the menu below verbose commentary | Menu is section 4 of the status board, always visible |
| Recap a BG's report verbatim | `formatBgAcknowledgment` — 3 lines max |
| Categorize every menu item as "standard" | Actually size — quick / standard / larger / external |

---

## 7. Example invocation

User: "Set up the persona for the next orchestrator session."

1. Install the process side — `skills/orchestrator-continuation/` (BG-GGG).
2. Install this skill + module (this PR).
3. In the new session, import the module:
   ```ts
   import { formatStatusBoard, formatMenu, formatBgAcknowledgment, computeSessionTally, verifyBeforeWrite }
     from "$MGMT_ROOT/documentation-standards/scripts/orchestrator-persona/index.mts";
   ```
4. On every cycle: after a BG returns, call `verifyBeforeWrite` on each cited
   PR/SHA, then `formatBgAcknowledgment(result)` for the reply, then
   `formatStatusBoard(updatedState)` for the next status block.

---

## Change Log

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-08 | Initial skill — codifies the 5 output shapes + 7 invariants + anti-patterns |
