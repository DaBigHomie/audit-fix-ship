---
name: audit-fix-plan
description: Run doc-forensic-inventory, forecast-scrutiny, forensic-auditing, and supabase-postgres-best-practices against a provided file path. Create a plan using 50x reasoning logic and Fix all findings and risks without exception.
---

# audit-fix-plan

Use this skill when tasked with auditing an implementation plan or arbitrary document using the core 50x logic tools (`doc-forensic-inventory`, `forecast-scrutiny`, `forensic-auditing`, `supabase-postgres-best-practices`).

## Procedure

1. **Read Target File**: View the file provided by the user to understand its full contents.
2. **Apply 50x Auditing Skills**:
   - `forensic-auditing`: Check if the plan relies on crude regex, filename assumptions, ignores Git HEAD, or violates DAG dependencies.
   - `forecast-scrutiny`: Forecast blast radius (git ops, file writes, DB ops) and adversarially scrutinize for wrong targets, hidden defaults, name != behavior, and partial state risks.
   - `doc-forensic-inventory`: Identify any downstream documentation, manifests, or instructions that will suffer semantic drift because of the proposed changes.
   - `supabase-postgres-best-practices`: Evaluate any Postgres DB operations or queries in the plan for performance and best practice alignment.
3. **Generate Inline Feedback**: Add `> [!WARNING]` or `> [!IMPORTANT]` alerts directly into the target file to highlight the specific risks you identified, referencing the appropriate skill.
4. **Create Remediation Plan**: Use 50x reasoning to craft a remediation plan that fixes every single finding and risk identified.
5. **Fix All Findings**: Execute the remediation plan on the target file or environment without exception. Do not leave any identified risks unresolved.

## Skill resolution note (global install, 2026-07-01)

Ported from `atl-table-booking-app/.agents/skills/audit-fix-plan` (commit 37369ac) to the
global skills dir so `/audit-fix-plan` is available in any repo. Dependency resolution:
- `forecast-scrutiny`, `forensic-auditing` — global user skills (available).
- `supabase-postgres-best-practices` — available via the `supabase` plugin.
- `doc-forensic-inventory` — installed alongside this skill in the global skills dir.
If any dependency is unavailable in a given session, apply its documented logic inline rather than skipping the step.
