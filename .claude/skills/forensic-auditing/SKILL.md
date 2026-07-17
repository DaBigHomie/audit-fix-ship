---
name: forensic-auditing
description: >
  50x deep-dive auditing rules to evaluate codebase alignment,
  forecast execution safety, and prevent temporal or semantic drift.
  Use when asked to audit pending prompts, verify design alignment,
  or evaluate execution plans. Trigger on "audit codebase", 
  "verify alignment", "forensic forecast", or "evaluate pending tasks".
---

# Forensic Auditing (50x Logic)

When tasked with auditing codebase alignment, verifying design manifests, or forecasting the safety of pending instructions, you must apply the following deterministic rules. Never rely on heuristics, names, or assumptions.

## 1. Evaluate Functional Payload, Not Filenames (Name != Behavior)
Do not forecast blast radius based on file names, document titles, or shallow keyword scans. 
- **Actionable Rule:** You must evaluate the actual functional payload of a document or script. 
- **Example:** Recommending execution on a document simply because it passes a UI keyword check is a dangerous hallucination if that document contains a 24-point backend infrastructure upgrade. Read the instructions end-to-end.

## 2. Diff Pending Actions Against Git HEAD (Prevent Temporal Drift)
Codebases are living systems. Attempting to execute old code review patches or outdated prompts guarantees catastrophic merge conflicts and silent overwrites of newer features.
- **Actionable Rule:** Before authorizing execution of any pending plan, dynamically check the live state of the target system.
- **Example:** Check `package.json` to see if a dependency is already upgraded. Scan `supabase/migrations/` to see if a schema change is already applied. Never execute a task timestamped older than the current sprint without a physical diff.

## 3. Trace Component Abstractions (Avoid Crude Regex)
Modern React/Next.js codebases use dependency abstraction. If a route file doesn't use a raw token (e.g., `#00F0FF`), it is highly likely importing a wrapper component (like `<GlassCard>` or `<BookingScreenHeader>`) that does.
- **Actionable Rule:** Forensic auditing requires stripping code comments and analyzing component-level abstractions. Do not rely on literal string matching or crude `.includes()` checks. 
- **Example:** A file importing `<Header>` is compliant with the brand payload even if the explicit `BRAND_TOKENS` import is absent from that specific file.

## 4. Execute Deterministic Disk Checks (Manifests != Reality)
A design manifest or deployment JSON is a statement of intent, not physical reality. 
- **Actionable Rule:** Use deterministic file-system validation (e.g., using `fs.statSync().isFile()`). 
- **Example:** Do not falsely validate a route just because a directory matches the regex. Verify the existence of `index.tsx`. If a target path from a manifest fails, run a fuzzy-match across the directory tree to account for human drift or renamed folders. Trust the live file system over static documentation.

## 5. Enforce Pipeline DAGs (No Concurrent Chaos)
You cannot run an offline queue implementation, a Fastify upgrade, a DB migration, and a UI polish concurrently. 
- **Actionable Rule:** A forensic forecast recognizes that operations have strict dependencies. Operations must be quarantined, sequenced chronologically, and injected individually into a task orchestrator. 
- **Example:** If multiple pending prompts affect the same architecture, flag them as `HOLD` until a Directed Acyclic Graph (DAG) sequence is established.
