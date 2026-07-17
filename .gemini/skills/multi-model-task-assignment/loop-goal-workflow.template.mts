// GENERATED FROM maximus-ai/skills/multi-model-task-assignment/loop-goal-workflow.template.mts -- do not edit; run sync-skills.mts
// Template — Shape A: dynamic risk-routing loop, cheap background agents (loops + goals).
// Version: 1.1.0 (2026-07-07) — augmented with wave-orchestration Patterns A-I.
// See multi-model-task-assignment/SKILL.md Step 3 for when to use this vs Shape B (static tiered pipeline).
// See multi-model-task-assignment/RUNBOOK.md for lifecycle, gate stack, and pattern catalog usage.
//
// Copy into <repo>/.claude/workflows/<name>.mts, then:
//   1. Rename `meta.name` and fill `meta.phases` to match the phase() calls below.
//   2. Fill in FINDERS with the repo's own discovery lenses (grep sweep, doc-forensic, RLS scan, etc).
//   3. Adapt `routeToModel()` gate thresholds to the repo's own risk rubric (Step 1 of the skill).
//   4. Fill in the FIX and VERIFY agent prompts for the domain this workflow targets.
//   5. If chaining program waves (T0..Tn), use the WAVE_PLAN scaffold + PATTERNS catalog below.
//
// Portable path rules (inherits SKILL.md §Portable path rules):
//   - Use `$MGMT_ROOT`, `$HOME`, `$SUPABASE_SERVICE_ROLE_KEY` env vars — never hardcode
//     `/Users/…` paths. Callers pass absolute `args.repo` resolved from those env vars.
//
// Do not run this as-is — it is a scaffold, not a finished workflow.

export const meta = {
  name: 'loop-goal-workflow-template',
  description: 'TEMPLATE — replace with a one-line description of the concrete sweep this instance runs',
  phases: [
    { title: 'Ground', detail: 'establish SSOT / scope before any agent spawns' },
    { title: 'Find', detail: 'loop-until-dry: N independent finders each round; dedup vs seen' },
    { title: 'Route', detail: 'blast-radius -> risk -> model/agentType/gate per finding' },
    { title: 'Fix', detail: 'cheap-tier fix inline when gated open; otherwise flag to a separate lane' },
    { title: 'Verify', detail: 'independent attempt cap; re-fix on failure, never silently give up' },
    { title: 'Report', detail: 'synthesize: fixed / flagged / unresolved + routing ledger' },
  ],
}

// ---------------------------------------------------------------------------
// GOALS (explicit — every loop below exists only to satisfy these; state them
// before writing any loop so the caps and gates below have something to serve)
//   G1  Every confirmed finding is either fixed+verified OR flagged to a lane.
//   G2  Discovery is exhausted: MAX_DRY consecutive rounds surface nothing new.
//   G3  No fix is applied above the caller's lane authority — code/schema/critical
//       findings are routed + flagged, never auto-fixed from a cheap/docs lane.
//   G4  Spend stays under budget.total when a token target was set.
// ---------------------------------------------------------------------------

const TARGET = args && args.target
const REPO = args && args.repo
if (!TARGET) throw new Error('args.target is required (repo-relative path or scope description)')
if (!REPO) throw new Error('args.repo is required (absolute repo root) — portable paths only')

const MAX_DRY = (args && args.maxDryRounds) || 2
const MAX_FIX_ATTEMPTS = (args && args.maxFixAttempts) || 2

const key = (f) => `${f.lens}::${f.location}::${(f.claim || '').slice(0, 60)}`

// Replace with this workflow's own discovery lenses — 2-5 independent, non-overlapping angles.
const FINDERS = [
  { id: 'lens-a', focus: 'TEMPLATE: describe what this lens looks for and how it grounds a finding in evidence' },
  { id: 'lens-b', focus: 'TEMPLATE: a second, genuinely different angle — redundant lenses waste rounds' },
]

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          domain: { type: 'string', enum: ['docs', 'code', 'schema', 'config'] },
          location: { type: 'string' },
          claim: { type: 'string' },
          evidence: { type: 'string' },
          fixHint: { type: 'string' },
        },
        required: ['severity', 'domain', 'location', 'claim', 'evidence', 'fixHint'],
      },
    },
  },
  required: ['findings'],
}

// multi-model-task-assignment Step 1 (blast radius -> risk) drives this gate.
// Cheap-tier default: haiku/low unless risk or domain forces an escalation — see SKILL.md Step 3.
function routeToModel(risk, finding) {
  const codey = finding.domain === 'code' || finding.domain === 'schema'
  if (risk.risk === 'critical' || risk.rlsRisk === 'schema') {
    return { model: 'opus', effort: 'high', gate: 'IntentEnvelope required', autoFix: false }
  }
  if (risk.rlsRisk === 'write' || (codey && risk.risk === 'high')) {
    return { model: 'opus', effort: 'high', gate: 'separate-lane worktree', autoFix: false }
  }
  if (codey) {
    return { model: 'sonnet', effort: 'medium', gate: 'separate-lane worktree', autoFix: false }
  }
  if (finding.severity === 'P0' || finding.severity === 'P1') {
    return { model: 'sonnet', effort: 'medium', gate: null, autoFix: true }
  }
  return { model: 'haiku', effort: 'low', gate: null, autoFix: true }
}

// ---------------------------------------------------------------------------
// GROUND — replace with whatever this workflow needs to establish before spawning finders
// ---------------------------------------------------------------------------
phase('Ground')
log(`Grounding ${REPO}/${TARGET} — fill in the actual ground check for this workflow`)

// ---------------------------------------------------------------------------
// FIND — loop-until-dry [GOAL G2]. Gotcha: check budget BEFORE each round, not only at the end.
// ---------------------------------------------------------------------------
phase('Find')

const seen = new Set()
const findings = []
let dry = 0
let round = 0

while (dry < MAX_DRY) {
  if (budget.total && budget.remaining() < 60_000) {
    log(`FIND halted early — budget floor reached (${Math.round(budget.remaining() / 1000)}k left)`)
    break
  }
  round++
  const batches = await parallel(
    FINDERS.map((lens) => () =>
      agent(
        `Lens "${lens.id}" over ${REPO}/${TARGET}. Round ${round} — surface NEW findings only. Focus: ${lens.focus}
Ground every finding in concrete evidence (a file, a command output, a live query) — never from memory. Return findings[] (may be empty).`,
        { label: `find:${lens.id}#${round}`, phase: 'Find', schema: FINDINGS_SCHEMA, effort: 'high' }
      )
    )
  )
  const fresh = batches
    .filter(Boolean)
    .flatMap((b, i) => (b.findings || []).map((f) => ({ ...f, lens: FINDERS[i].id })))
    .filter((f) => !seen.has(key(f)))

  if (fresh.length === 0) {
    dry++
    log(`round ${round}: dry (${dry}/${MAX_DRY})`)
    continue
  }
  dry = 0
  fresh.forEach((f) => seen.add(key(f)))
  findings.push(...fresh)
  log(`round ${round}: +${fresh.length} new (total ${findings.length})`)
}

if (findings.length === 0) {
  log('FIND clean — nothing surfaced.')
  return { findings: [], verdict: 'CLEAN' }
}

// ---------------------------------------------------------------------------
// ROUTE + FIX — pipeline, no barrier: cheap findings resolve while gated ones flag out [G1, G3]
// ---------------------------------------------------------------------------
phase('Route')

const ROUTE_SCHEMA = {
  type: 'object',
  properties: {
    risk: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    rlsRisk: { type: 'string', enum: ['none', 'read', 'write', 'schema'] },
    rationale: { type: 'string' },
  },
  required: ['risk', 'rlsRisk', 'rationale'],
}

const processed = await pipeline(
  findings,
  (f) =>
    agent(
      `multi-model-task-assignment Step 1 — score blast radius for this finding.
Finding: severity=${f.severity} domain=${f.domain} @ ${f.location}
Claim: ${f.claim}
Score risk (low=1 file/no DB/no auth; high=cross-repo|migration|RLS|Stripe|public API; critical=P0 prod|destructive schema) and rlsRisk.`,
      { label: `route:${f.severity}`.slice(0, 40), phase: 'Route', schema: ROUTE_SCHEMA, model: 'haiku', effort: 'low' }
    ).then((r) => ({ finding: f, risk: r, plan: routeToModel(r, f) })),

  async (routed) => {
    const { finding: f, risk: r, plan } = routed
    if (!plan.autoFix) {
      log(`FLAG (${r.risk}) ${f.location} -> ${plan.model} · ${plan.gate}`)
      return { ...routed, outcome: 'flagged', resolved: false }
    }
    let attempt = 0
    let verdict = { resolved: false, note: 'not attempted' }
    while (attempt < MAX_FIX_ATTEMPTS && !verdict.resolved) {
      attempt++
      await agent(
        `Fix this finding IN PLACE at ${f.location}. Claim: ${f.claim}. Evidence: ${f.evidence}. Fix hint: ${f.fixHint}. Do not touch unrelated files.`,
        { label: `fix:${f.location}`.slice(0, 40), phase: 'Fix', model: plan.model, effort: plan.effort }
      )
      verdict = await agent(
        `Verify the fix at ${f.location}. Original claim: "${f.claim}". Re-read the current state and adversarially try to prove it is STILL wrong. Return resolved=true only if it genuinely reconciles.`,
        { label: `verify:${f.location}`.slice(0, 40), phase: 'Verify', schema: { type: 'object', properties: { resolved: { type: 'boolean' }, note: { type: 'string' } }, required: ['resolved', 'note'] }, effort: 'high' }
      )
      log(`${verdict.resolved ? 'RESOLVED' : 'RETRY'} ${f.location} (attempt ${attempt}/${MAX_FIX_ATTEMPTS})`)
    }
    return { ...routed, outcome: verdict.resolved ? 'fixed' : 'unresolved', resolved: verdict.resolved, note: verdict.note }
  }
)

const done = processed.filter(Boolean)
const fixed = done.filter((d) => d.outcome === 'fixed')
const flagged = done.filter((d) => d.outcome === 'flagged')
const unresolved = done.filter((d) => d.outcome === 'unresolved')

// ---------------------------------------------------------------------------
// REPORT
// ---------------------------------------------------------------------------
phase('Report')
log(`Fixed ${fixed.length} · Flagged ${flagged.length} · Unresolved ${unresolved.length}`)

return {
  verdict: unresolved.length ? 'PARTIAL' : flagged.length ? 'PARTIAL-FLAGGED' : 'SHIPPED',
  counts: { total: findings.length, fixed: fixed.length, flagged: flagged.length, unresolved: unresolved.length },
  fixed: fixed.map((d) => d.finding.location),
  flagged: flagged.map((d) => ({ location: d.finding.location, model: d.plan.model, gate: d.plan.gate })),
  unresolved: unresolved.map((d) => ({ location: d.finding.location, note: d.note })),
}

// ===========================================================================
// SCAFFOLDS — inert exports for CALLERS orchestrating waves + gate stacks.
// Nothing below runs when this template's find-fix loop executes; these are
// portable shapes an orchestrator imports (or copy-adapts) alongside the loop.
// See RUNBOOK.md §Patterns catalog for the prior-art PRs / task_ids that
// motivated each shape.
// ===========================================================================

/**
 * @typedef {object} GatePlan
 * @property {'forecast-scrutiny'|'malfig'|'forensic-auditing'|'doc-forensic-inventory'} id
 *   Gate identifier — must match an installed skill path (see resolve below).
 * @property {string} skill_path
 *   Portable resolution: `documentation-standards/skills/<id>/SKILL.md` (Tier 1 hub SSOT)
 *   or `~/.claude/skills/<id>/SKILL.md` (user install). Caller invokes via the Skill tool
 *   — this template does NOT invent an invocation API.
 * @property {string[]} focus
 *   MALFIG gate ids (G3/G6/G8/G11/G13/G14) or forensic-auditing rule ids (1/4/5) etc.
 * @property {number} maxFixIterations
 *   Bounded fix loop — session prior-art used 1 iter per gate.
 */

/**
 * @typedef {object} WavePlan
 * @property {string} id
 *   Wave id — `T0`, `T1`, `T2`, `wave_2_retirement`, etc. Used in commit trailers.
 * @property {string} goal
 *   One-line stated outcome. Prior-art: charter §4/§7 lines.
 * @property {string[]} blocked_on
 *   Wave ids that MUST reach `merged` before this wave dispatches.
 * @property {GatePlan[]} gate_stack
 *   Ordered — forecast-scrutiny → MALFIG → forensic-auditing → doc-forensic-inventory
 *   is the session-verified default order (Pattern H).
 * @property {string[]} acceptance_criteria
 *   Deterministic checks. Prior-art examples: `test -f docs/plans/PRIME-…md`,
 *   `gh pr view <N> --json state → MERGED`.
 * @property {string=} cortex_task_id
 *   Follows `task_<scope>_<YYYYMMDD>` naming.
 * @property {string=} follow_up_task_id
 *   Chained next-wave / post-merge follow-up (Pattern A files this at each merge).
 */

/**
 * @typedef {object} BgDispatchConfig
 * @property {string} scope
 *   The BG agent's single-purpose deliverable — narrow enough to fit one credit window.
 * @property {string[]} hard_rails
 *   Non-negotiables baked inline. Session prior-art includes: portable paths only,
 *   verify-then-write, no `git reset`/`git rm`/`git worktree remove`/force-push,
 *   no self-approval (G13), STOP+report on UNKNOWN over fabrication (Pattern G).
 * @property {'plan-audit-fix'|'audit-fix-plan'|'audit-fix-ship'|'malfig-ship'|null} report_shape
 *   Which downstream skill format the BG must emit (drives return-message parsing).
 * @property {string=} human_authorization
 *   Cited authorization string (e.g. "orchestrator brief 2026-07-07: merge on all-gates-PASS").
 *   Required to overcome G13-self-review concerns (Pattern F).
 */

/**
 * @typedef {'A_wave_dispatch'|'B_cross_repo_relocation'|'C_session_retirement'|'D_skill_authoring'|'E_verify_then_write'|'F_g13_separation_of_duties'|'G_honest_unknown'|'H_four_gate_stack'|'I_baseline_tool_loading'} PatternRef
 */

/**
 * PATTERNS — the 2026-07-07 session's codified orchestration knowledge.
 * Each entry links a pattern to prior-art PRs / task_ids so callers can trace
 * the shape back to a real, verified run. Do NOT invent additional patterns
 * without a landed prior-art PR to cite.
 *
 * @see multi-model-task-assignment/RUNBOOK.md — narrative, failure modes, hard rails.
 */
export const PATTERNS = {
  A_wave_dispatch: {
    purpose:
      'Chain plan-audit-fix + 4-gate + merge across T0..Tn program waves — one BG per wave, one PLAN block per wave, one merge SHA per wave, chained follow-up task at each merge.',
    prior_art: [
      { wave: 'T0', task_id: 'task_prime_routing_t0_seed_20260707 (rolled into task_prime_model_selection_routing_20260707)', repo: 'maximus-ai', pr: 196, sha: 'f785ac5' },
      { wave: 'T1', task_id: 'task_prime_routing_t1_validator_20260707', repo: 'maximus-ai', pr: 197, sha: '44a2047' },
      { wave: 'T2', task_id: 'task_prime_routing_t2_blocking_gate_20260707', repo: 'maximus-ai', pr: 198, sha: '71ada41' },
      { wave: 'T2 (federated framing)', task_id: null, repo: 'project-polaris', pr: 14, sha: 'eb8b34f' },
    ],
  },
  B_cross_repo_relocation: {
    purpose:
      'ADD-first-then-DELETE with 2 PRs and strict merge order — guarantees zero-window where docs are missing across repos.',
    prior_art: [
      { role: 'ADD', repo: 'maximus-ai', pr: 195, sha: 'c202f5c', note: 'merged FIRST' },
      { role: 'DELETE', repo: 'documentation-standards', pr: 59, sha: '123d6d2', note: 'merged SECOND' },
    ],
  },
  C_session_retirement: {
    purpose:
      'Dual-gate (forecast-scrutiny + forensic-auditing) retirement — verify expected HEAD + PR MERGED + status clean before writing retirement rows; only `--force` on explicit human authorization + evidence.',
    prior_art: [
      { batch: 'wave_3_retirement', row_count: 12, note: 'dual-gated' },
      { batch: 'wave_2_retirement', row_count: 2, note: 'dual-gated' },
      { batch: 'row_1_retirement', row_count: 1, note: '1 gated + forced with auth' },
      { batch: 'session_retirement', row_count: 5, note: 'baseline' },
    ],
  },
  D_skill_authoring: {
    purpose:
      'Author + gate + merge a new skill in one plan-audit-fix + 4-gate + merge lifecycle. Peer skills below all landed via this pattern.',
    prior_art: [
      { skill: 'session-chapter-index', repo: 'documentation-standards', pr: 60, sha: '27de59b' },
      { skill: 'claude-board', repo: 'documentation-standards', pr: 61, sha: '3821468' },
      { skill: 'plan-by-surface-repo-layer-signal', repo: 'documentation-standards', pr: 62, sha: '2a1f0c2' },
    ],
  },
  E_verify_then_write: {
    purpose:
      'Every SHA / PR / task_id / skill path / CLI shape MUST be deterministically verified (test -f, git ls-tree, gh pr view) BEFORE it lands in a doc, template, CORTEX row, or downstream prompt. Subagent claims are claims, not evidence.',
    memory_ref:
      '~/.claude/projects/-Users-dabighomie-Management-Git-project-polaris/memory/verify-bg-agent-claims-before-cortex-write.md',
    prior_art_corrections: [
      'BG-Y desync output caught its own drift',
      'boot script E10 falsified — retracted via git ls-tree verification',
      'Fable framing corrected twice against Anthropic catalog',
      'Antigravity CLI probe verified GUI-only (no --model flag)',
    ],
  },
  F_g13_separation_of_duties: {
    purpose:
      'Author ≠ reviewer ≠ fixer across cycles. Human authorization (cited orchestrator brief) satisfies G13 for merge-on-all-gates-PASS. BG refusal under G13-self-review concern is overcome by re-dispatch with explicit human-authorization citation.',
    skill_ref: 'human-approval-gate (installed at ~/.claude/skills/human-approval-gate/SKILL.md)',
  },
  G_honest_unknown: {
    purpose:
      'STOP + report UNKNOWN over fabrication. Never invent invocation APIs, CLI flags, function signatures, or model ids. File a research follow-up in CORTEX instead.',
    prior_art: [
      'Antigravity boot scripts NOT created — would fabricate non-existent --model flag',
      'Fable model-id research disclosed billing-exhaustion CLI probe caveat',
      'T0 seeds refused to invent dame-luthas anvil_path — filed as follow-up',
    ],
  },
  H_four_gate_stack: {
    purpose:
      'Order matters. forecast-scrutiny → MALFIG (G3/G6/G8/G11/G13 + G14 where applicable) → forensic-auditing (Rules 1-5) → doc-forensic-inventory. Bounded fix loop 1 iter per gate. Merge only on all-gates-PASS.',
    skill_paths: {
      'forecast-scrutiny': 'documentation-standards/skills/forecast-scrutiny/SKILL.md',
      malfig: 'documentation-standards/skills/malfig/SKILL.md',
      'forensic-auditing': '~/.claude/skills/forensic-auditing/SKILL.md',
      'doc-forensic-inventory': 'documentation-standards/skills/doc-forensic-inventory/SKILL.md',
    },
  },
  I_baseline_tool_loading: {
    purpose:
      'Default BG tool set is sufficient for author + gate + merge cycles: Bash, Edit, Read, Skill, ToolSearch, Write. Load Supabase MCP via ToolSearch("select:mcp__claude_ai_Supabase__execute_sql"). Git worktree + gh via Bash.',
    prior_art_bgs: ['BG-X', 'BG-V0', 'BG-V1', 'BG-A93', 'BG-AA2', 'BG-Z', 'BG-Y', 'BG-BB'],
  },
}

/**
 * WAVE_PLAN — scaffold for a single wave in an A-pattern chain.
 * Callers copy + fill; every field must be verifiable before dispatch.
 *
 * @type {WavePlan}
 */
export const WAVE_PLAN_TEMPLATE = {
  id: 'TEMPLATE_WAVE_ID',
  goal: 'TEMPLATE — one-line stated outcome for this wave',
  blocked_on: [],
  gate_stack: [
    {
      id: 'forecast-scrutiny',
      skill_path: 'documentation-standards/skills/forecast-scrutiny/SKILL.md',
      focus: ['blast_radius', 'ownership_locks'],
      maxFixIterations: 1,
    },
    {
      id: 'malfig',
      skill_path: 'documentation-standards/skills/malfig/SKILL.md',
      focus: ['G3', 'G6', 'G8', 'G11', 'G13'],
      maxFixIterations: 1,
    },
    {
      id: 'forensic-auditing',
      skill_path: '~/.claude/skills/forensic-auditing/SKILL.md',
      focus: ['1', '4', '5'],
      maxFixIterations: 1,
    },
    {
      id: 'doc-forensic-inventory',
      skill_path: 'documentation-standards/skills/doc-forensic-inventory/SKILL.md',
      focus: ['drift_sweep', 'cross_ref_rewrite'],
      maxFixIterations: 1,
    },
  ],
  acceptance_criteria: [
    'TEMPLATE: gh pr view <N> --json state → MERGED',
    'TEMPLATE: git ls-tree origin/master <path> resolves',
    'TEMPLATE: CORTEX task_id updated status=complete + output_blob populated',
  ],
  cortex_task_id: undefined,
  follow_up_task_id: undefined,
}

/**
 * runGateStack — scaffold reference; callers implement via the Skill tool.
 * This template does NOT invent an invocation API. The caller is expected to
 * iterate `plan.gate_stack` and dispatch each entry through their own harness
 * (e.g. the Claude Code Skill tool, or a shell-forked `claude --model …` per
 * SKILL.md §Step 8 Dispatch Wiring for the `fable` row).
 *
 * @param {WavePlan} plan
 * @returns {Promise<{verdicts: Array<{gate: string, pass: boolean, notes: string}>}>}
 */
export async function runGateStack(plan) {
  // Intentionally unimplemented — callers wire this to their invocation surface.
  // See RUNBOOK.md §The 4-gate stack for the required order and pass criteria.
  throw new Error(
    `runGateStack is a scaffold — plan.gate_stack has ${plan.gate_stack.length} gates; ` +
      `invoke each via the Skill tool (or shell dispatch per SKILL.md §Step 8) in order, ` +
      `applying bounded fix loops per gate.maxFixIterations. See RUNBOOK.md.`
  )
}

/**
 * updateCortexTask — scaffold reference for writing a wave's outcome back to
 * CORTEX. Callers load the Supabase MCP surface via ToolSearch
 * (`select:mcp__claude_ai_Supabase__execute_sql`) and pass the loaded fn in.
 * We do NOT hardcode credentials or fabricate an SDK shape here.
 *
 * @param {object} params
 * @param {string} params.task_id                    — `task_<scope>_<YYYYMMDD>`
 * @param {'pending'|'in_progress'|'complete'|'blocked'} params.status
 * @param {object} params.output_blob                — gate verdicts, PRs, merge SHAs, follow-ups
 * @param {(sql: string) => Promise<unknown>} params.executeSql
 *   Caller-provided; wraps `mcp__claude_ai_Supabase__execute_sql` with the CORTEX project id.
 */
export async function updateCortexTask({ task_id, status, output_blob, executeSql }) {
  const sql = `
    UPDATE cortex_tasks
    SET status = '${status}',
        output_blob = '${JSON.stringify(output_blob).replace(/'/g, "''")}'::jsonb,
        updated_at = now()
    WHERE id = '${task_id}';
  `
  return executeSql(sql)
}
