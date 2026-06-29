---
name: multi-model-task-assignment
description: >
  Assign tasks to the right model and MAXIMUS AI agent using Forge routing, cluster affinity,
  swarm membership, blast radius analysis, and CORTEX DB lookup. Use whenever assigning work
  across Cursor, Antigravity, Claude Code, Claude for Mac, or Glasswing — or when a task needs
  to be routed to a specific MAXIMUS AI agent (1–580), cluster (1–34), or swarm (A/B/C/D/E/GOV).
  Triggers: "who should do this", "assign to the right model", "route this task", "blast radius",
  "which agent handles", "forge routing", "which swarm", "model assignment", "custom agent research",
  "40x assignment", or any task that mentions multiple repos/agents working in parallel.
  Always run this before dispatching work that touches more than one file, repo, or agent surface.
---

# multi-model-task-assignment

Route any task to the correct model + MAXIMUS AI agent using the real cluster/swarm/Forge data
from CORTEX. Compute blast radius before dispatch. Save all assignments to CORTEX.

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
high_context_cross_segment → Glasswing    → GOV   → 147+ files, architecture
pr_review / security   → Claude Code       → A     → Agent 84 reviewer
ugwtf / cross_swarm    → Glasswing         → GOV   → Cross-swarm orchestration
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
| Glasswing | High-context cross-repo, FSD migration | Slower, expensive | 100+ file operations |
| Claude for Mac | Interactive, architecture decisions | Manual, no automation | Planning, research |

---

## Step 3 — MAXIMUS AI agent lookup

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

## Step 4 — Model assignment per agent

**Current state (from DB, 2026-06-01):** All 544 agents have `model = 'gpt-4o'` as baseline.
The `agents.model` field is the override column — use it to assign per-agent models.

### 40x model assignment logic

From the 40x Code Review Agent system and Forge routing:

```
ASSIGNMENT MATRIX:
Task complexity    → Model          → When
─────────────────────────────────────────────────────────
P0 critical / GOV  → claude-opus-4-8 (or GPT-5.5 High)  → RLS audit, arch decisions, incident
P1 deep reasoning  → claude-sonnet-4-6 (or GPT-5.5 Med) → Feature impl, PR review, schema
P2 implementation  → claude-haiku-4-5 (or GPT-5.5 Low)  → Repetitive, cataloging, docs
P3 sweep / scan    → gpt-4o-mini                         → Lint, format, bulk scan
```

**Tool ↔ model pairings (from 40x-agents master spec):**
- Cursor BG: GPT-5.5 Medium (default), GPT-5.5 High for bug-hunter
- Antigravity: Gemini 3 (native), or route via Forge to claude-opus-4-8 for GOV tasks
- Claude Code: Claude Sonnet 4.6 (default), Opus 4.8 for sentry-incident-responder
- Glasswing: claude-opus-4-8 (high-context cross-repo requires full reasoning)

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

## Step 5 — MAXIMUS PRIME integration check

Before finalizing any assignment, check MAXIMUS PRIME gate status:

```sql
-- Is PRIME live? (branch merged = live, else pre-launch)
-- Check via: Supabase:list_branches on eccpracfbrocmkzuogec
-- If maximus-prime-init branch still exists → pre-launch → document intent only
-- If merged → file IntentEnvelope at /agents/intake before dispatch

-- Active file locks (once PRIME is live)
SELECT file_path, tool_run_id, expires_at
FROM maximus_prime.file_locks
WHERE repo = '{REPO_SLUG}' AND released_at IS NULL;
```

If PRIME is live and blast radius touches locked files → wait for lock release or narrow scope.

---

## Step 6 — Save assignment to CORTEX + update cortex_tasks

```sql
-- Record model/agent assignment on the task
UPDATE cortex_tasks
SET
  assignee_agent = {agent_id},
  output_blob = jsonb_build_object(
    'forge_tool', '{cursor-bg|antigravity|claude-code|glasswing}',
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
- Tool: {cursor-bg|antigravity|claude-code|glasswing|claude-mac}
- Rationale: {one line}
- Fallback: {tool}

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
