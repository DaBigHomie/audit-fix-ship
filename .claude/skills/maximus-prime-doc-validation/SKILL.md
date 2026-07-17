---
name: maximus-prime-doc-validation
description: >
  Validate Maximus Prime / management-git documentation against the house standard by chaining the
  EXISTING validators into one PASS / FIX gate — it does not reimplement validation. Use whenever
  the user says "validate this doc", "maximus prime doc validation", "check the frontmatter", "does
  this doc pass MALFIG G11", "validate the plan/handoff", "doc-standards check", or before shipping
  any doc_type: plan / handoff / solution-architecture / memory / problem-record. It runs the
  forge-knowledge-base frontmatter validator (per file), plan-completeness (MALFIG G11), the
  handoffs validator, the prime-doc-lattice validator, and the documentation-standards validator,
  then returns a single PASS or FIX verdict with the failing tails. Always run this before a doc
  is committed or ingested so a malformed doc never reaches CORTEX or the MALFIG gate.
---

# maximus-prime-doc-validation

One gate over the validators that already exist in the maximus-ai repo (and
documentation-standards). The value is orchestration + a single verdict, not new rules — so it
stays in lockstep with whatever those validators enforce.

## Why a wrapper, not new logic

Maximus Prime already ships five doc validators, each enforcing one slice (frontmatter schema,
plan completeness for MALFIG G11, handoff shape, the prime doc lattice, and the design/quality
standard). Reimplementing any of them would drift from the source of truth. This skill locates and
runs them, aggregates exit codes, and gives you PASS / FIX so you don't have to remember five
commands or which applies when.

## The validators it chains

| Validator | Scope | Applies to |
|---|---|---|
| `validate_frontmatter.mts` (problem-record-creation skill) | per file | every doc — checks forge-knowledge-base frontmatter keys |
| `scripts/validate-plan-completeness.mts` | repo-wide | `doc_type: plan` (MALFIG G11) |
| `scripts/validate-handoffs.mts` | repo-wide | handoffs |
| `scripts/validate-prime-doc-lattice.mts` | repo-wide | prime doc lattice / cross-links |
| `documentation-standards/scripts/validate-docs.js` | repo-wide | design/format standard |

## Workflow

### 1. Run the gate
```bash
npx tsx <this-skill>/scripts/validate-all.mts --target=<doc.md> [--repo=<maximus-ai root>] [--frontmatter-only]
```
- `--target` is the doc under review; the script auto-locates the maximus-ai repo root by walking
  up from it (or pass `--repo`).
- `--frontmatter-only` runs just the fast per-file frontmatter check — use it for a quick
  authoring loop; drop it for the full gate before commit/ingest.

### 2. Read the verdict
Each validator prints `[PASS] / [FAIL] / [SKIP]` with a short tail. Overall verdict is **PASS**
(all green) or **FIX (N failed)**; the script exits non-zero on FIX so it can gate a commit hook
or a workflow stage.

### 3. Fix and re-run
Frontmatter failures are usually missing required keys (`title, doc_type, repo, session_id,
created, status, tags`). Plan-completeness failures mean a `doc_type: plan` is missing a required
section (honor `plan_tier: tactical` for the minimal set). Fix, re-run, ship only on PASS.

## Notes
- Scan-style validators (plan-completeness / handoffs / lattice / doc-standards) validate the whole
  repo set, so a FAIL may point at a *different* doc than `--target`; read the tail. For a strict
  per-file check use `--frontmatter-only`.
- If a validator is absent (older repo checkout), it is reported `SKIP`, not a failure — the gate
  degrades gracefully rather than blocking on a missing tool.

## Files
```
maximus-prime-doc-validation/
  SKILL.md
  scripts/validate-all.mts   # locate repo, chain the 5 validators, aggregate PASS/FIX
```
