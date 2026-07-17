---
name: multi-model-task-assignment
description: >
  Assign tasks to the right model and MAXIMUS AI agent using Forge routing, cluster affinity,
  swarm membership, blast radius analysis, and CORTEX DB lookup. Use whenever assigning work
  across Cursor, Antigravity, Claude Code, Claude for Mac, or Fable — or when a task needs
  to be routed to a specific MAXIMUS AI agent (1–580), cluster (1–34), or swarm (A/B/C/D/E/GOV).
  Triggers: "who should do this", "assign to the right model", "route this task", "blast radius",
  "which agent handles", "forge routing", "which swarm", "model assignment", "custom agent research",
  "40x assignment", "cheap background agents", "loop until dry", "workflow dispatch", "goals-driven loop",
  or any task that mentions multiple repos/agents working in parallel.
  Always run this before dispatching work that touches more than one file, repo, or agent surface.
---
<!-- GENERATED FROM maximus-ai/skills/multi-model-task-assignment/SKILL.md -- do not edit; run sync-skills.mts -->

# multi-model-task-assignment

Route any task to the correct model + MAXIMUS AI agent using the real cluster/swarm/Forge data
from CORTEX. Compute blast radius before dispatch. Save all assignments to CORTEX.

## Step 0 — Orchestrator execution rule (updated 2026-07-04)

The legacy doctrine "Opus orchestrates only; file work goes to subagents" is superseded for
Mythos-class orchestrators (Claude Fable 5 / Mythos 5). The orchestrator is fully capable of
direct file work; **delegation is a token-economy and parallelism decision, not a capability
limit.** Apply this decision table before Step 1:

| Condition | Route |
|---|---|
| Task is small, high-precision, or single-file (≤ ~3 files) | Orchestrator executes DIRECTLY — a subagent brief would cost more tokens than the edit |
| Verification/context that feeds an orchestrator decision | Orchestrator (or cheap read-only Explore agent if multi-file sweep) |
| Mechanical/bulk/repetitive (codemods, renames, doc sweeps) | haiku subagent |
| Feature slice, multi-file cascade, ~5–15 files | sonnet subagent |
| Independent workstreams that can run concurrently | Parallel subagents (one message, disjoint write targets) |
| Cross-repo architecture, P0 security, irreversible ops | Orchestrator directly (Fable/Opus tier) — do not delegate judgment |
| Open-ended sweep/audit/migration across an unknown-N of files, "find and fix until clean" | `Workflow` tool, cheap (haiku) background agents in a loop + explicit-goals shape (see Step 3) — only when the user has opted into multi-agent orchestration |

Rules that still hold: disjoint write targets per agent; constraints baked inline in briefs;
`git status --short` before dispatch; stand down if another live session owns the tree.

---

## Step 1 — Blast radius analysis

Before any assignment, map what the task touches:

```
BLAST_RADIUS = {
  files:   [glob patterns of files to be modified],
  repos:   [which MALFIG repos are involved],
  tables:  [Supabase tables affected — check for RLS impact],
  routes:  [API routes / pages affected],
  agents:  [MAXIMUS AI agent IDs that own those domains],
  risk:    low | medium | high | critical,
  rls_risk: none | read | write | schema,
}
```

**Risk scoring:**
- `low` — single file, single repo, no DB change, no auth path
- `medium` — 2–5 files, may touch shared components or types
- `high` — cross-repo, migration, auth/RLS change, Stripe path, public API change
- `critical` — P0 production path, schema destructive op, cross-cluster coordination needed

If `risk = high | critical`: require MAXIMUS PRIME IntentEnvelope before dispatch.
If `rls_risk = write | schema`: assign Cluster 5 (Database Integrity) agent 84 for review.

---

## Step 2 — Forge routing decision

Forge routing maps task type → tool surface. Apply in order — first match wins.

```
FORGE ROUTING TABLE (from forge:atb:agent-assignments + PRIME-GATE-AGENT-REVIEW.md):

task.type              → tool              → swarm → notes
─────────────────────────────────────────────────────────────────
prompt_engineering     → Antigravity       → B     → Core Antigravity domain
repetitive_file_rewrite → Cursor BG       → B     → File-by-file, low reasoning
deep_restructure       → Claude Code       → B     → TypeScript + type extraction
high_context_cross_segment → Fable        → GOV   → Mythos-tier orchestration + verify-first gates
pr_review / security   → Claude Code       → A     → Agent 84 reviewer
ugwtf / cross_swarm    → Fable             → GOV   → Cross-swarm orchestration (Fable orchestrates; delegates bulk work)
quick_fix / scaffold   → Cursor            → B     → Small scope, fast iteration
migration / long_running → Antigravity    → B     → Multi-day, persistent context
db_schema / rls        → Claude Code       → A     → Agent 81 + 84 pair
planning / unclassified → Claude for Mac  → —     → Interactive, needs you watching
```

**Tool capability matrix (confirmed from CORTEX):**

| Tool | Strengths | Weaknesses | Optimal task size |
|---|---|---|---|
| Cursor BG | Fast, repetitive, file-aware | Low reasoning ceiling | < 20 files, clear spec |
| Antigravity | Persistent state, multi-day, parallel agents | Slower start | Large batches, migration |
| Claude Code | Deep reasoning, MCP access, subagents | No persistent state | Complex single sessions |
| Fable | Mythos-tier orchestrator (verify-first, direct execution ≤3 files, delegates bulk work); high-context cross-repo judgment. **Fable is a Claude AI model** — distinct from any specific interactive session. Dispatched by launching `claude --model claude-fable-5` (see §Step 8 Dispatch Wiring; boot script `boot/fable.sh`). | Fable is **higher-cost** than Opus 4.8 ($10/$50 vs $5/$25 per MTok) — reserve for genuinely Mythos-tier / long-horizon work per §Step 0. Adaptive thinking is always-on and cannot be disabled. | Orchestration seat + P0 judgment calls |
| Claude for Mac | Interactive, architecture decisions | Manual, no automation | Planning, research |

---

## Step 3 — Workflow dispatch: cheap background agents (loops + goals)

Extends Step 2. Reach for the `Workflow` tool instead of a single Forge tool surface when the task is
open-ended or bulk-shaped rather than a fixed edit — audits, cross-repo sweeps, migrations across an
unknown-N of files, "find and fix until clean." **Gate:** this skill recommends the pattern; it does not
authorize spawning one uninvited. Only dispatch a Workflow when the user has explicitly opted in (named
the keyword, asked for multi-agent orchestration, or invoked a skill/command that calls Workflow).

Two proven shapes exist on disk — mine one of these before authoring a third:

**Shape A — dynamic risk-routing loop** (`multi-model-audit-fix.mts`): declare explicit GOALS (G1..Gn) in
a comment block above the script — the loops exist to satisfy the goals, not the reverse. Loop-until-dry
over N independent lenses/finders with a dedup `seen` Set keyed on `lens::location::claim`; then
`pipeline()` each fresh finding through ROUTE (blast radius → risk, this skill's Step 1) → FIX-or-FLAG via
a `routeToModel(risk, finding)` function driven by the Step 5 assignment matrix → verify-loop with an
independent attempt cap. Use when the total finding count is unknown up front.

**Shape B — static tiered pipeline** (`caro-mvf-40x.mts`): fixed model per phase, no loop — Plan (opus,
scope/collision check) → Build (sonnet feature slice / haiku boilerplate, parallel disjoint slices) → Gate
(haiku, cheap scoped pass/fail on the slice's own changed files only) → Verify (sonnet, N-lens adversarial
`parallel()` fan-out) → Govern (deterministic count check, no model call). Use when the work-unit count is
known (N slices, N files) and a loop isn't needed.

**Cheap-tier default (governance):**
- Default every routing/classification/cheap-fix call to `haiku` / `effort: 'low'`. Escalate to `sonnet`/
  `opus` only when Step 1's risk = high|critical, rls_risk = write|schema, or domain = code|schema.
- Never let a cheap-tier or docs-lane agent `autoFix` code/schema — flag it and route to a gated lane
  instead (mirrors the irreversible-ops row of Step 0's decision table).
- Check `budget.remaining()` before every loop round, not only at the end. Cap the discovery loop (a
  dry-round counter) and the verify/fix loop independently — two separate caps, not one shared counter.

**Known gotchas (from prior runs — do not rediscover these):**
1. `agentType` must be a valid workflow-registry type (`fsd-architect`, `supabase-specialist`, etc.) —
   passing a `.github/agents/*` persona name there fails every spawn. Carry the persona in the prompt text.
2. Narrow Supabase errors before touching `.data` (`if (error) throw error` first) — an unnarrowed result
   otherwise throws `Property does not exist on GenericStringError` inside a workflow agent.
3. Never `cd` to an absolute repo path from inside a worktree-isolated agent — it defeats isolation and
   can write into a tree another live session owns.
4. Scope cheap gate checks to the current slice's own changed files — an unscoped gate misattributes
   full-repo baseline debt to the change under review.

**Reference implementation:** a portable, repo-agnostic template following Shape A ships alongside this
skill at `multi-model-task-assignment/loop-goal-workflow.template.mts`. Copy it into a repo's
`.claude/workflows/<name>.mts`, fill in `args.target`/`args.repo`, and adapt the lens list and
`routeToModel()` gate thresholds to the task at hand.

---

## Step 4 — MAXIMUS AI agent lookup

Query CORTEX for best agent match:

**Option A — domain-based lookup (routing table):**
```sql
-- Find agents for a capability domain
SELECT a.id, a.name, a.cluster_id, a.model, a.max_tokens, c.name as cluster_name
FROM agents a
JOIN clusters c ON c.id = a.cluster_id
WHERE a.status = 'registered'
  AND (
    a.role ILIKE '%{domain_keyword}%'
    OR a.name ILIKE '%{domain_keyword}%'
  )
ORDER BY a.cluster_id ASC, a.id ASC
LIMIT 5;
```

**Option B — cluster-based lookup:**
```sql
-- All agents in a cluster
SELECT a.id, a.name, a.role, a.model
FROM agents a
WHERE a.cluster_id = {cluster_id} AND a.status = 'registered'
ORDER BY a.id ASC;
```

**Option C — AGENT-ROUTING-TABLE.md fast-path (no DB needed):**
Read `~/management-git/.agent-kb/01-AGENT-ROUTING-TABLE.md` for pre-built capability index.
Use when CORTEX is unreachable or for quick lookup.

### Cluster → domain mapping (29 clusters, 544 agents, all `gpt-4o` baseline)

| Cluster | Name | Domain | Lead agent |
|---|---|---|---|
| 1 | FSD Enforcer | Layer boundaries, public APIs, cross-slice | 5 |
| 2 | Next.js Implementation | App Router, layouts, server/client components | — |
| 3 | Zero-Regression Testing | Playwright E2E, unit, visual regression | 49 |
| 4 | Cloud Integration (MCP) | Supabase, Stripe, Resend, external APIs | — |
| 5 | Database Integrity | Migrations, RLS, type gen, query opt | 81+84 |
| 6 | Design Bridge (Stitch) | Visual-to-AST, component gen, design tokens | 101 |
| 7 | DevOps & Edge | CI/CD, Vercel, secrets, multi-region | 124 |
| 8 | Intelligence & Memory | Context persist, vectors, cross-session | 141 |
| 9 | Analytics & Personalization | Event tracking, A/B, segmentation | 161 |
| 10 | Sovereign Completion | Final validation, sign-off, prod certification | 182 |
| 11 | Chat Intelligence | NLP, intent detection, conversational AI | 210 |
| 12 | Meta-Orchestration | Cross-cluster coordination, A2A comms | — |
| 13 | Commerce & Revenue | Payments, cart, pricing logic | 276 |
| 14 | Migration Framework | Legacy migration, porting, compatibility | — |
| 15 | Marketplace Ops | E-commerce testing, checkout resilience | 306 |
| 16 | Context & Handoff (A2A) | Agent handoff protocol, context passing | 312 |
| 17 | Sovereign Command | Executive oversight, priority, cross-cluster | 350 |
| 18 | Strategic Forecasting | Predictive analytics, trend, roadmap | — |
| 19 | Cognitive Intent Decoding | Deep user intent, semantic, query decompose | 344 |
| 20 | 20x Result Conversion | Output optimization, quality amplification | — |
| 21 | Multimodal Media | Image, video, content pipelines | — |
| 22 | Spatial Design & Motion | GSAP, animation, interaction design | — |
| 23 | Demographic Intelligence | Audience analysis, cultural context | — |
| 24 | A/B Testing & Forecast | Experiment design, stats, conversion opt | — |
| 30 | WP Migration & Parity | WP-to-Next.js, content extraction | — |
| 31 | Data Deconstruction & Supabase | Legacy data, schema mapping | — |
| 32 | Swarm Discovery & Agile | Dynamic agent discovery, swarm coordination | — |
| 33 | Forensic Capture | Visual forensics for migration | — |
| 34 | Zero-Friction Control | Handoff, error recovery, friction elimination | — |

### Swarm responsibility matrix

| Swarm | Mission | Assign when |
|---|---|---|
| A | Review & Merge | security, db/schema, pr_review, auth |
| B | Build & Wire | ui, state, feature impl, analytics |
| C | Harden & Ship | a11y, devops, perf, ci/cd |
| D | Docs & Quality | handoff, onboarding, docs |
| E | Intel & Memory | session, memory, token, context |
| GOV | Governance | arbiter, standards, deploy auth, cross-swarm |

### Key named agents for common task types

| Task type | Agent ID | Name | Notes |
|---|---|---|---|
| Orchestration, new project | 181 | Project CEO Orchestrator | Default session agent |
| PR review, quality gate | 182 | Production Readiness Gatekeeper | Pre-merge |
| RLS audit, security | 84 | RLS Attacker Simulator | Pair with 81 |
| Schema, migration | 81 | Schema Parity Auditor | Pair with 84 |
| Session memory, handoff | 141 | Vectorized Intent Memory Historian | Session end |
| Context compression | 312 | Semantic Compression Agent | Token overflow |
| Token budget | 313 | Token Budget Strategist | Budget check |
| Multi-agent coordination | 210 | Cross-Agent Collaboration Lead | Parallel spawn |
| A11y | 49 | A11y Compliance Auditor | UI PRs |
| Payments, PCI | 306 | PCI Shield Agent | Stripe path |
| Final sign-off | 350 | Production Sign-Off | Pre-production |
| Fallback (unclassified) | 344 | Global Intent Decoder | No match |
| Visual-to-code | 101 | Multimodal Visual-to-AST Parser | Design specs |

---

## Step 5 — Model assignment per agent

**Current state as-of 2026-06-01 CORTEX snapshot (verify with live query if newer):** All 544 agents have `model = 'gpt-4o'` as baseline.
The `agents.model` field is the override column — use it to assign per-agent models.

### 40x model assignment logic

From the 40x Code Review Agent system and Forge routing:

```
ASSIGNMENT MATRIX:
Task complexity    → Model          → When
─────────────────────────────────────────────────────────
Orchestration / Mythos-tier → claude-fable-5             → Session orchestrator, verify-first passes,
                                                            judgment calls, direct execution when
                                                            cheaper than delegating (see Step 0)
P0 critical / GOV  → claude-opus-4-8 (or GPT-5.5 High)  → RLS audit, arch decisions, incident
P1 deep reasoning  → claude-sonnet-4-6 (or GPT-5.5 Med) → Feature impl, PR review, schema
P2 implementation  → claude-haiku-4-5 (or GPT-5.5 Low)  → Repetitive, cataloging, docs
P3 sweep / scan    → gpt-4o-mini                         → Lint, format, bulk scan
```

**Tool ↔ model pairings (from 40x-agents master spec):**
- Cursor BG: GPT-5.5 Medium (default), GPT-5.5 High for bug-hunter
- Antigravity: Gemini 3 (native inside the Antigravity IDE), or route via Forge to Anthropic
  tiers (Opus / Sonnet / Haiku) — external CLI spawn shape UNKNOWN as of 2026-07-07 (see §Step 8)
- Claude Code (current session): Claude Fable 5 (as the routing target Anthropic model, available
  via `claude --model claude-fable-5` since 2026-07-01), Sonnet/Haiku subagents per Step 0; Opus 4.8
  for sentry-incident-responder. **Do not conflate**: "the current Claude Code session's model" is
  whatever the harness reports (e.g. Opus 4.7); Fable is a *distinct* Claude model reachable via
  `claude --model claude-fable-5`.
- Fable (as a routing target): `claude-fable-5` (Mythos-tier orchestrator; escalate to
  `claude-opus-4-8` only for P0 arch/incident when Fable is unavailable). Dispatched by launching
  `claude` with `--model claude-fable-5` (see `boot/fable.sh`) — NOT by relying on whatever model
  the current session happens to be running.

### Updating model assignment in DB

```sql
-- Override model for a specific agent
UPDATE agents
SET model = '{model_id}', updated_at = now()
WHERE id = {agent_id};

-- Bulk-update a cluster to a different model
UPDATE agents
SET model = 'claude-sonnet-4-6', updated_at = now()
WHERE cluster_id = 5  -- Database Integrity → security tasks need reasoning
  AND status = 'registered';
```

---

## Step 6 — MAXIMUS PRIME integration check

Before finalizing any assignment that preassigns a worktree or branch, query active claims via MCP:

**Option A — List active claims (optional, for visibility):**
Call `prime_list_assignments` on the prime-gate MCP server to see active lane claims.
Optional filters: `waveId`, `repo`. Returns all active claims and their TTLs — use to check if a lane is currently held.

```
prime_list_assignments(filters: { waveId?: string, repo?: string })
→ [{ worktree, sessionId, owner, claimedAt, expiresAt, ... }]
```

**Option B — Claim a lane for the session:**
Before dispatch, call `prime_claim_worktree` with:
- Required: `worktree` (path or branch key), `sessionId`
- Optional: `repo` (auto from cwd if omitted), `branch`, `waveId`, `taskId`, `agent`, `ttlMinutes`

The DB unique index (`claimed=false` + current owner) is the arbiter: if another session holds the lane, the call fails. Pick another lane or wait; never read-then-insert.

```
prime_claim_worktree({
  worktree: string,         // path or branch key
  sessionId: string,        // required
  repo?: string,            // optional; auto from cwd
  branch?: string,
  waveId?: string,
  taskId?: string,
  agent?: string,
  ttlMinutes?: number
})
→ { success: boolean, claim: {...} } or throw on conflict
```

**Option C — Release at lane completion:**
```
prime_release_worktree(worktree: string, sessionId: string)
→ { released: boolean }
```

**Error handling:** Tool errors are non-blocking — log and continue. A thrown error means the lane is held; it is not a system failure. Callers must NEVER wedge the assignment on tool failure.

**Fine-grained coordination note:** The DB unique index on `maximus_prime.file_locks` is a separate, TTL-based mechanism for per-file coordination and is NOT what worktree claims use (granularity mismatch per PRIME-WAVE plan sec 6). If PRIME is live and blast radius touches locked files as reported by `prime_list_assignments`, wait for lock release or narrow scope.

---

## Step 7 — Save assignment to CORTEX + update cortex_tasks

```sql
-- Record model/agent assignment on the task
UPDATE cortex_tasks
SET
  assignee_agent = {agent_id},
  output_blob = jsonb_build_object(
    'forge_tool', '{cursor-bg|antigravity|claude-code|fable|claude-mac|workflow}',
    'model', '{model_id}',
    'cluster', {cluster_id},
    'swarm', '{A|B|C|D|E|GOV}',
    'blast_radius', '{low|medium|high|critical}',
    'rls_risk', '{none|read|write|schema}',
    'declared_files', '{globs}',
    'mp_intake_required', true|false
  ),
  updated_at = now()
WHERE id = '{task_id}';

-- Save research to knowledge
INSERT INTO cortex_knowledge (key, repo, value, source_agent, github_sha)
VALUES (
  'assignment:{YYYY-MM-DD}:{task_id_short}',
  '{REPO_SLUG}',
  '{...assignment_record...}'::jsonb,
  181,
  '{HEAD_SHA}'
)
ON CONFLICT (key, repo) DO UPDATE SET value = excluded.value, updated_at = now();
```

---

## Step 8 — Dispatch Wiring (CLI spawn commands)

Every routing decision this skill emits must be paired with a **reproducible spawn command** or an
honest `spawn_command: UNKNOWN — research required`. This section closes the honest-note gap where
orchestrators emit labels (`Cursor BG`, `Antigravity`, `Fable`) with no way to actually launch them
and silently fall back to Claude Code Agent-tool subagents.

**Verify-then-write rule:** do NOT fabricate CLI shapes. If a tool's real CLI is not observed in the
workspace or officially documented, mark it `UNKNOWN` and file a research follow-up in CORTEX.

### Per-tool dispatch matrix

| Tool | spawn_command | required_params | env_passthrough | boot_script | output/log_location |
|---|---|---|---|---|---|
| `claude-code-agent-tool-subagent` | **WIRED** — in-session `Task` tool call: `subagent_type ∈ {general-purpose, Explore, Plan}`, `prompt`, `run_in_background: true` | `subagent_type`, `prompt`; optional `description` | inherits Claude Code session env (MCP config, `SUPABASE_SERVICE_ROLE_KEY`, `CORTEX_DB`) | `boot/claude-code-agent-tool-subagent.sh` (reference stub — Agent tool is in-session, not a shell fork) | Tool response returned to orchestrator; long-running via `run_in_background: true` reports completion via harness notification |
| `claude-code-background-terminal` | **WIRED (verified 2026-07-07)** — `claude -p "<prompt>" --output-format json [--mcp-config <path>] [--session-id <sid>]`. CLI present at `/Users/dabighomie/.nvm/versions/node/v22.12.0/bin/claude`; `--print/-p` documented in `claude --help` for non-interactive output. | `-p <prompt>`, `--output-format`; optional `--session-id`, `--mcp-config`, `--add-dir`, `--allowedTools` | `SUPABASE_SERVICE_ROLE_KEY`, `CORTEX_DB` inherited from shell; `.mcp-config.json` via `--mcp-config` | not created yet (WIRED CLI but no boot-script wrapper written — safe to add in a follow-up PR) | stdout JSON; session file under `~/.claude/projects/<repo>/` |
| `cursor-bg` | **PARTIALLY VERIFIED (2026-07-07)** — `cursor agent [prompt]` CLI exists at `/Users/dabighomie/.local/bin/cursor` (`cursor agent --help` returns "Start the Cursor Agent"). Full background-orchestration invocation shape (env, output capture, session id) NOT observed in workspace — `UNKNOWN — research required` for the bg-orchestration wrapper specifically. | `cursor agent <prompt>` confirmed; bg-orchestration flags UNKNOWN | UNKNOWN | not created (bg-wrapper shape UNKNOWN; do not fabricate) | UNKNOWN |
| `antigravity` | **VERIFIED GUI-ONLY FOR MODEL TIER (2026-07-07)** — `antigravity` binary NOT on PATH; two apps installed: (a) `Antigravity IDE.app` v1.107.0 (VS Code fork, `Contents/Resources/app/bin/antigravity-ide`) — exposes a `chat [--mode ask\|edit\|agent] [--add-file <path>] [prompt]` subcommand for launching a chat session, but the `--help` output shows **NO `--model` flag** (probing `chat --model` returns `Warning: 'model' is not in the list of known options for subcommand 'chat'`); (b) `Antigravity.app` v2.2.1 (`com.google.antigravity`, newer Google flagship) — `Contents/Resources/bin/` contains only `language_server` + `webm_encoder`, **no CLI helper at all**. Model tier (Opus/Sonnet/Haiku/Gemini) is set in-GUI via the chat panel model picker, backed by user-settings JSON key `github.copilot.chat.chatModels.*.allowedModels` at `~/Library/Application Support/Antigravity/User/settings.json` (Copilot-routed IDs, e.g. `copilot/claude-opus-4.5`, `copilot/claude-sonnet-4.5`, `copilot/claude-haiku-4.5`). **There is no scriptable CLI mechanism to select a model tier from this dispatcher.** See `maximus-ai/docs/research/2026-07-07_antigravity-cli-research.md`. | N/A (model tier is GUI-only) — the `antigravity-ide chat <prompt>` command CAN launch a chat session but cannot pin a specific Anthropic tier | N/A | **not created (blocked by GUI-only model selection; do NOT fabricate a `--model` flag)** | GUI chat panel; no scriptable log location for model-tier-scoped runs |
| `fable` | **WIRED (2026-07-07)** — Fable is a **Claude AI model** (NOT the current session; NOT synonymous with Claude Code). Dispatch pattern: `claude --model claude-fable-5 --print < <prompt-file> [--output-format json] [--session-id <uuid>] [--mcp-config <path>]`. The `claude` CLI at v2.1.146 documents `--model <model>` in `--help`. **Verified model id `claude-fable-5`** per the Anthropic catalog at `platform.claude.com/docs/en/about-claude/models/overview` (2026-07-07); Claude API alias is the same string (dateless pinned snapshot per the 4.6-generation naming convention). GA on Claude Code since 2026-07-01. See `maximus-ai/docs/research/2026-07-07_fable-model-id-research.md` for evidence. The `claude-code-agent-tool-subagent` row remains the in-process fallback for the *current* Claude Code session — that is distinct from routing to a **different** Claude model (Fable). | `--model claude-fable-5`, `--print`; optional `--session-id`, `--mcp-config`, `--output-format`, `--add-dir`, `--allowedTools` | `FABLE_PROMPT`, `MMTA_TASK_ID` required by boot script; `SUPABASE_SERVICE_ROLE_KEY`, `CORTEX_DB` inherited from shell; `.mcp-config.json` via `--mcp-config` | `boot/fable.sh` (WIRED — validates env, pipes prompt via stdin, prints `pid=…` and `log=…` for orchestrator tracking) | stdout / stream-json when `--output-format` set; log file at `${TMPDIR}/mmta-fable/${MMTA_TASK_ID}.log` |
| `claude-mac` | **UNKNOWN — no automation surface** — Claude for Mac is interactive-only per row 98 of the capability matrix (`Manual, no automation`). By design there is no spawn command. | N/A | N/A | not created (by design) | N/A |
| `workflow` | In-session `Workflow` tool call (see Step 3 shapes A/B) — no shell CLI; runs inside the orchestrator's tool-use loop | task envelope, `agentType`, `prompt` | inherits session env | not applicable (in-session) | tool-response stream + loop dedup Set |

### Boot scripts distribution

Boot scripts ship with the skill under `skills/multi-model-task-assignment/boot/`:

- `boot/README.md` — explains what is wired vs UNKNOWN, and why fabricating CLI is forbidden.
- `boot/claude-code-agent-tool-subagent.sh` — reference stub documenting the canonical in-session
  Agent-tool invocation shape.
- `boot/fable.sh` — WIRED (2026-07-07) — dispatches Fable via `claude --model claude-fable-5`;
  see `maximus-ai/docs/research/2026-07-07_fable-model-id-research.md` for the model-id verification.

Additional boot scripts land only when the corresponding tool's real CLI is verified (not
fabricated). Fable capability research is closed by
`maximus-ai/docs/research/2026-07-07_fable-model-id-research.md` (CORTEX task
`task_research_fable_model_id_20260707`).

> [!IMPORTANT]
> **2026-07-07 correction (verify-then-write):** boot scripts `boot/README.md` and
> `boot/claude-code-agent-tool-subagent.sh` **ARE present on `origin/master` @ `567758e`**
> (verified via `git ls-tree -r 567758e skills/multi-model-task-assignment/`) — an earlier
> draft of this correction PR asserted they were missing; that assertion was wrong and has
> been retracted. `boot/fable.sh` landed 2026-07-07 once the model id `claude-fable-5` was
> verified against the Anthropic catalog. Remaining boot-script gaps for `antigravity`,
> `cursor-bg` bg-wrapper, and `claude-code-background-terminal` wrapper stay deferred until
> each spawn shape is deterministically verified — tracked in CORTEX task
> `task_mmta_boot_scripts_missing_20260707` (Fable row now closed).

### honest_note (required)

> **Cluster/Swarm/Agent labels are CORTEX metadata; the actual execution goes to whichever tool has
> a wired spawn command. Labels without wiring do not dispatch.**

If the routing decision picks a tool whose row above says `UNKNOWN`, the orchestrator SHOULD fall
back to `claude-code-agent-tool-subagent` (the only wired option) AND record the routing gap in
`cortex_tasks.output_blob.dispatch_wiring_gap = '<tool>: UNKNOWN'` so the gap is visible.

---

## Output format

```
## TASK ASSIGNMENT — {task description short}

### Blast Radius
- Files: {glob list}
- Repos: {list}
- Tables: {list}
- Risk: {low|medium|high|critical}
- RLS risk: {none|read|write|schema}
- PRIME intake required: yes | no | deferred (pre-launch)

### Forge Routing
- Tool: {cursor-bg|antigravity|claude-code|fable|claude-mac|workflow}
- Rationale: {one line}
- Fallback: {tool}

### Workflow Dispatch (only if Tool = workflow)
- Shape: {A-dynamic-risk-routing-loop | B-static-tiered-pipeline}
- Goals: {G1..Gn, one line each}
- Loop caps: {discovery dry-round cap} / {verify-fix attempt cap}
- Cheap tier: {haiku default; escalation trigger}

### MAXIMUS AI Assignment
- Agent: {id} — {name}
- Cluster: {N} — {name}
- Swarm: {letter} — {mission}
- Model: {model_id}
- Reviewer: {agent_id} — {name} (if applicable)

### MAXIMUS PRIME
- Status: pre-launch | live
- File locks to check: {list or "none"}
- Intake action: {file envelope | document intent | not required}

### Next step
{One sentence: exact command or action to start the work}
```

---

## Env loading — SUPABASE_PROJECT alignment

`SUPABASE_PROJECT=eccpracfbrocmkzuogec` is the CORTEX DB project for ALL MALFIG repos.
This is correct and intentional — it is NOT each repo's own Supabase project.

**Do not confuse:**
| Variable | Value | What it is |
|---|---|---|
| `SUPABASE_PROJECT` / `CORTEX_DB` | `eccpracfbrocmkzuogec` | CORTEX — maximus-ai project — shared MALFIG brain |
| ATB Supabase | separate project ref | atl-table-booking-app app data |
| 143 Supabase | `bgqjgpvzokonkyiljasj` | one4three app data |

**Loading in cloud sessions (no filesystem):**
```
prime_env_locations → prime_env_materialize
```

**Loading locally:**
```bash
# Already has .env.local with SUPABASE_SERVICE_ROLE_KEY
# If missing on new machine:
npx tsx ../.agent-kb/anvil/import-env-from-knowledge.mts
```

**If cortex_boot shows "Invalid API key":**
→ `SUPABASE_SERVICE_ROLE_KEY` is not set for the maximus-ai project
→ Run `seed-env-knowledge.mts --push` on machine that has the key
→ Then `import-env-from-knowledge.mts` on the failing machine
→ Do NOT set `PLAN_SYNC_LEGACY_FILES=1` unless legacy fallback is intentional

---

## Portable path rules (inherits from cortex-mp-boot)

- `MGMT_ROOT = ~/management-git` (symlink to `/Users/dabighomie/Management Git`)
- `AGENT_KB = $MGMT_ROOT/.agent-kb` (symlink to `maximus-ai/.system/handoff/agent-kb`)
- `ROUTING_TABLE = $AGENT_KB/01-AGENT-ROUTING-TABLE.md`
- Never hardcode `/Users/dabighomie/` — use `~/management-git/` or `resolve-workspace.mts`
- `SUPABASE_PROJECT` is a constant — never derive it from env files dynamically

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-07-04 | Initial skill — Forge routing, blast radius, dispatch wiring §Step 8 |
| 1.1.0 | 2026-07-07 (PR #54) | Fable replaces Glasswing; §Step 8 Dispatch Wiring added |
| **1.1.1** | **2026-07-07 (follow-up correction)** | **Corrected Fable framing** — Fable is a **Claude AI model** dispatched via `claude --model <fable-id>`; it is NOT synonymous with "the current Claude Code session." Updated §Step 2 capability matrix row, §Step 5 tool ↔ model pairings, §Step 8 `fable` + `antigravity` dispatch rows, and `boot/README.md` row for `fable`. Corrected an earlier draft claim that `boot/` was missing on `origin/master @ 567758e` — deterministic `git ls-tree` shows those scripts DO exist at that SHA; narrowed CORTEX task `task_mmta_boot_scripts_missing_20260707` to the still-missing per-tool wrappers only. Fable model-id and Antigravity CLI spawn shape remain **UNKNOWN** — filed research tasks; do NOT fabricate. |
| **1.1.2** | **2026-07-07 (Antigravity CLI research closeout, CORTEX `task_research_antigravity_cli_20260707`)** | **Antigravity spawn shape resolved to VERIFIED GUI-ONLY (for model tier).** On-disk inspection of both installed apps — `Antigravity IDE.app` v1.107.0 (VS Code fork) and `Antigravity.app` v2.2.1 (`com.google.antigravity`, Google flagship) — confirmed: (1) the older IDE ships a bash-wrapped Electron CLI at `Contents/Resources/app/bin/antigravity-ide` with a `chat` subcommand but **NO `--model` flag** (verified via `--help` and a positive `--model` probe returning `not in the list of known options`); (2) the newer v2.2.1 app has **no CLI helper at all** (`Contents/Resources/bin/` = `language_server` + `webm_encoder`); (3) model tier (Opus/Sonnet/Haiku/Gemini) is set via GUI chat-panel picker backed by user-settings JSON `github.copilot.chat.chatModels.*.allowedModels`. `antigravity` dispatch row upgraded from `PARTIALLY VERIFIED` to **`VERIFIED GUI-ONLY FOR MODEL TIER`**; boot scripts for `antigravity-opus.sh`/`sonnet.sh`/`haiku.sh` **explicitly NOT created** — they would fabricate a non-existent flag. Full evidence in `maximus-ai/docs/research/2026-07-07_antigravity-cli-research.md`. |
| **1.1.3** | **2026-07-07** | **Fable model id VERIFIED — `claude-fable-5`.** Promoted the §Step 8 `fable` row from `PARTIALLY WIRED` → **WIRED**, promoted the §Step 2 capability-matrix Fable row (removed UNKNOWN, added cost/latency notes), and rewrote §Step 5 pairings to drop the "id UNKNOWN pending verification" caveat. Added new boot script `boot/fable.sh` (validates env, resolves workspace root via `resolve-workspace.mts`, pipes prompt via stdin, prints `pid=…` and `log=…`). Added evidence anchor at `maximus-ai/docs/research/2026-07-07_fable-model-id-research.md` citing the Anthropic catalog at `platform.claude.com/docs/en/about-claude/models/overview` (GA on Claude Code since 2026-07-01) plus first-party launch coverage. Closes CORTEX task `task_research_fable_model_id_20260707` and the Fable row of `task_mmta_boot_scripts_missing_20260707`. `cursor-bg` bg-wrapper and `claude-code-background-terminal` wrapper still deferred (Antigravity closed by v1.1.2). |
| **1.1.4** | **2026-07-07** | **Cross-repo references relocated per PAC §7.4.** The MMTA plan doc and the two 2026-07-07 research docs (Antigravity CLI + Fable model id) were moved from `documentation-standards/docs/{plans,research}/` to `maximus-ai/docs/{plans,research}/` (the owning repo of the MMTA component). Updated 4 in-skill references + `boot/README.md` + `boot/fable.sh` header from `docs/research/...` and `docs/plans/...` to the `maximus-ai/docs/...` prefixed paths so links resolve from the docstd hub context. No behavior change. Authority: `malfig_workflow_diff_map_ba19fb65.plan.md` §7.4 (PAC placement) + §1B.3 (hub relocation). |
