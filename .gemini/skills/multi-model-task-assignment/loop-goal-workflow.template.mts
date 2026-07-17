// Template — Shape A: dynamic risk-routing loop, cheap background agents (loops + goals).
// See multi-model-task-assignment/SKILL.md Step 3 for when to use this vs Shape B (static tiered pipeline).
//
// Copy into <repo>/.claude/workflows/<name>.mts, then:
//   1. Rename `meta.name` and fill `meta.phases` to match the phase() calls below.
//   2. Fill in FINDERS with the repo's own discovery lenses (grep sweep, doc-forensic, RLS scan, etc).
//   3. Adapt `routeToModel()` gate thresholds to the repo's own risk rubric (Step 1 of the skill).
//   4. Fill in the FIX and VERIFY agent prompts for the domain this workflow targets.
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
