---
name: plan-audit-fix
description: >-
  Two-phase doc remediation — (1) 50x reconciliation PLAN against git SSOT and
  peer handoffs, then (2) audit-fix-plan inline fixes. Use when the user says
  "create plan then audit-fix", "plan and audit-fix", or when a doc may drift
  from origin/main or conflict with another agent's closeout.
disable-model-invocation: true
---

# plan-audit-fix

Compose **`plan-audit-fix`** before **`audit-fix-plan`**. Planning prevents fixing the wrong HEAD or fighting another agent's SSOT.

## Phase 1 — PLAN (50x reasoning)

Run **read-only** unless the user explicitly assigns writes.

### 1.1 Ground truth (mandatory)

```bash
git fetch origin
git log origin/main -1 --oneline
git worktree list
git status -sb
```

| Check | Rule |
|-------|------|
| SSOT | **`origin/main` SHA** — never assume primary tree `main` is current |
| Worktrees | One lane per agent; **no** `checkout` / `reset` on shared trees |
| Locked lanes | Respect hook-locked paths (e.g. `atb-v4-mockup-impl`) |

### 1.2 Conflict scan (forensic-auditing)

| Source | Action |
|--------|--------|
| Target doc claims | List version, dates, counts, routes, palette |
| `origin/main` code | `git show origin/main:<path>` for SSOT |
| Peer handoffs | `docs/session-artifacts/*/AGENT-HANDOFF-PLAN.md`, merged PR bodies |
| Delegation plans | `ATB-DELEGATION-PLAN.md`, CORTEX tasks |

Flag: name ≠ behavior, filename assumptions, stale counts, ignored git HEAD.

### 1.3 Blast radius (forecast-scrutiny)

| Dimension | Question |
|-----------|------------|
| Git | Which worktree/branch owns the fix PR? |
| Downstream docs | What links/manifests will drift? (doc-forensic-inventory) |
| Code vs doc | Is this docs-only or does code need a separate lane? |
| Owner locks | Palette, booking UX, tenant — Fork-A / Phase-A authority |

### 1.4 PLAN output (required before Phase 2)

Emit a short plan block (chat or temp note):

```markdown
## PLAN — {target}

**SSOT:** origin/main @ `{sha}`
**Conflicts:** {list or NONE}
**Remediation scope:** {sections to edit}
**Out of scope:** {code fixes deferred}
**Publish lane:** {worktree branch for PR}
**DAG:** {blockers — e.g. R5 before F-00}
```

Wait for user go-ahead only if they asked for plan-only; otherwise proceed to Phase 2.

---

## Phase 2 — audit-fix-plan

Read and follow **`audit-fix-plan`** skill (`~/.claude/skills/audit-fix-plan/SKILL.md`):

1. Read target file completely
2. Apply: `forensic-auditing`, `forecast-scrutiny`, `doc-forensic-inventory`, `supabase-postgres-best-practices` (inline if unavailable)
3. Add `> [!WARNING]` / `> [!IMPORTANT]` at each risk
4. Execute remediation on target — **no unresolved findings**
5. Bump doc version + **Change Log** row
6. Add appendix row if audit was substantial (e.g. Appendix D)

### Post-fix verify

```bash
# doc-place (if ATB)
cd ~/management-git/documentation-standards
npx tsx scripts/warden.mts --repo atl-table-booking-app --domain doc-place
```

---

## Dependency chain

```
plan-audit-fix (this skill)
  → audit-fix-plan
      → doc-forensic-inventory (drift)
      → forecast-scrutiny (blast radius)
      → forensic-auditing (git SSOT)
      → supabase-postgres-best-practices (SQL sections only)
```

---

## Anti-patterns

| Do not | Do instead |
|--------|------------|
| audit-fix before checking `origin/main` | Phase 1 PLAN first |
| Fix tabs/routes from memory | `git show origin/main:...` |
| Commit from dirty primary tree | Worktree PR per handoff rules |
| Run F-00 palette swap when Fork-A locked | Option 3 — supersede in V5-MASTER (T08) |

---

## Example invocation

User: "Reconcile CARO-TECH with handoff #314, then audit-fix"

1. PLAN: fetch, read `AGENT-HANDOFF-PLAN.md`, diff tab bar vs TSA §4
2. audit-fix-plan: edit `docs/CARO-TECHNICAL-SOLUTION-ARCHITECTURE.md` → v1.5
3. Cross-link handoff path; WARDEN doc-place spot-check
