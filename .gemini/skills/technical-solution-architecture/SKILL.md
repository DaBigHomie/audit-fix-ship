---
name: technical-solution-architecture
description: Produce a rigorous Technical Solution Architecture (TSA) document for a system, tool, or platform, then VALIDATE it (documentation-standards) and SCRUTINIZE it (adversarial review). Use whenever the user says "architect this", "solution architecture", "TSA", "design doc", "write the architecture", "plan and create <tool>", or asks to design a non-trivial system before building. Bundles the /validate-doc and /scrutinize steps so no architecture ships unchecked. Mirrors the house format in project-polaris/docs/POLARIS-ARCHITECTURE.md.
---

# Technical Solution Architecture (TSA)

Produce a decision-grade architecture document, then prove it holds up. Three phases, always in order:
**1. Author → 2. Validate → 3. Scrutinize.** Never present a TSA that hasn't been through all three.

Subject = whatever the user is designing.

**Naming (house convention — enforced):** write to `<project>/docs/<SYSTEM>-ARCHITECTURE.md`, where
`<SYSTEM>` is the UPPER-HYPHEN system name (e.g. `MACHINE-BRIDGE-ARCHITECTURE.md`, matching
`PRIME-PMO-ITSM-SPEC.md`). **Never** name it `SOLUTION-ARCHITECTURE.md`, `TSA*`, or `*solution-architecture*` —
those violate the `SYSTEM-TYPE.md` standard. Use the `-ARCHITECTURE` type token (or `-SPEC` for a pure spec).

**Doc-SSOT / no-JSON-mirror rule** (`rule:maximus:doc_ssot_cortex_index`): the doc **body** is the SSOT and
lives version-controlled in the repo. CORTEX stores only an **index row** — a pointer + queryable metadata,
**NEVER the full body** (the body in a JSON blob is a non-diffable drift trap). The doc is "landed" only when
BOTH the markdown is committed+pushed AND its CORTEX index row is cloud-verified. Index row shape:
`{ key, title, doc_path, version, status, summary, blocker, github_sha }`. Treat any generated JSON the doc
references as **read-only** (regenerate from source; never hand-edit) to prevent drift.

---

## Phase 1 — Author

Follow the house structure (mirrors `project-polaris/docs/POLARIS-ARCHITECTURE.md`'s sectioning). Every
section is mandatory; if one is genuinely N/A, say
so explicitly and why — do not silently omit.

```
# <SYSTEM> — Architecture
## Abstract                         3–5 sentences: what, for whom, the one-line approach
## 1. Context & problem statement   the problem, who has it, constraints, what's out of scope
## 2. Architecture overview         the shape, a diagram (mermaid/ascii), the layering
###   Key architecture decisions    numbered ADRs: decision · rationale · alternatives rejected
###   Quality attributes (NFRs)     security, reliability, cost, latency, portability — each measurable
## 3. Component / container view     each component: responsibility, inputs/outputs, tech, owner
## 4. <domain sections>              the actual moving parts (data model, pipeline, agents, runtime…)
## N. Security & trust model         authz, secrets, blast radius, abuse cases, least-privilege
## N. Runtime & operational model    deploy, schedule, failure modes & degradation, observability
## N. Integration contracts          APIs/schemas/events crossing boundaries (typed)
## N. Quality, testing & validation  how correctness is proven; quality gates
## N. Roadmap & known gaps           phased plan + an HONEST list of what's NOT solved
## Appendices                        glossary, script index, data keys, references
## Change Log                        embedded, newest-first: version · date · author · change
```

The **Change Log is mandatory and embedded at the bottom** of every architecture doc. Bump the version
there AND in the CORTEX index row on every change.

Rules:
- **Every claim is falsifiable.** No "scalable/robust/secure" without a number or mechanism.
- **Decisions name their rejected alternatives.** An ADR without alternatives is an opinion.
- **NFRs are measurable.** "low latency" → "p95 < 300ms"; "secure" → the specific control.
- **Diagrams**: a mermaid or ASCII diagram in §2 is required.
- **Never hardcode paths or secrets** (house rule). Reference env/config.

## Phase 2 — Validate  (`/validate-doc`)

Mechanical completeness + house-standards check.

1. Run the documentation-standards validator if the doc type is covered:
   `node ~/management-git/documentation-standards/scripts/validate-docs.js` (design-system docs)
   — for an architecture doc the validator is advisory; the authoritative gate is the checklist below.
2. Architecture completeness checklist (ALL must be PASS or an explicit, justified N/A):
   - [ ] Abstract present, ≤5 sentences, states the approach
   - [ ] Problem statement names the user + constraints + explicit out-of-scope
   - [ ] §2 has a diagram
   - [ ] ≥3 ADRs, each with a rejected alternative
   - [ ] NFRs are measurable (numbers or named mechanisms)
   - [ ] Every component lists responsibility + I/O + tech
   - [ ] Security & trust model: authz + secrets + blast radius + ≥1 abuse case
   - [ ] Runtime model: failure modes + degradation behavior
   - [ ] Integration contracts are typed (schema/SQL/TS)
   - [ ] Roadmap has an honest "known gaps / NOT solved" list
   - [ ] No hardcoded secrets or absolute user paths
   - [ ] **Filename follows `SYSTEM-TYPE.md`** — NOT `SOLUTION-ARCHITECTURE.md`, `TSA*`, or `*solution-architecture*`
   - [ ] **Embedded `## Change Log` at the bottom** (version · date · author · change, newest first)
   - [ ] **CORTEX index row** exists with shape `{key,title,doc_path,version,status,summary,blocker,github_sha}` — pointer only, body NOT stored
3. Output a VALIDATION block: each item PASS/FAIL/N-A with a one-line note. Any FAIL → fix before Phase 3.

## Phase 3 — Scrutinize  (`/scrutinize`)

Adversarial review. Argue against the design. Append a `## Scrutiny` section to the doc with findings,
each rated **blocker / major / minor** and carrying a concrete remedy.

Attack along these axes (skip none; write "none found" if clean):
1. **Correctness** — does the data/control flow actually work? race conditions, ordering, idempotency.
2. **Security & blast radius** — autonomous execution? command injection? secret exposure? over-broad
   permissions? What's the worst a compromised component can do?
3. **Failure & recovery** — what happens when each dependency is down? partial failure? poison tasks?
   double-execution? Is there a dead-letter / retry / backoff story?
4. **Cost & scale** — token/$$ per run, growth curve, unbounded loops, polling cost, table bloat.
5. **Unjustified claims** — any NFR or "this handles X" without evidence → flag.
6. **Alternatives not considered** — was a simpler/cheaper design dismissed without reason?
7. **Operability** — can a human see what it's doing, stop it, and recover state?

Then a verdict: **SHIP / SHIP-WITH-FIXES / REWORK**, listing the blockers that must close first.

---

## Output contract
- The doc at `<project>/docs/<SYSTEM>-ARCHITECTURE.md` ends with `## Validation`, `## Scrutiny`, and
  `## Change Log` (in that order).
- Reply to the user with: the doc path, the validation verdict, the scrutiny verdict, and the
  blocker list (if any). Do not claim "done" if any blocker is open.
- Write the CORTEX **index row** (pointer, never the body) keyed `doc:<repo>:architecture` with shape
  `{key,title,doc_path,version,status,summary,blocker,github_sha}`. The doc is "landed" only when the
  markdown is committed+pushed AND the index row is cloud-verified (`rule:maximus:doc_ssot_cortex_index`).
