# {PROJECT} — Reconciliation Report

**Audited:** {DATE}
**Auditor:** Claude (audit-fix-ship skill)
**Source change request:** {meeting transcript / punch list / change brief}
**Repo:** {path}
**Deadline:** {date}

---

## TL;DR

What the change request assumed → what's actually true. Read this before generating any prompts.

| # | Assumption (from change request) | Reality (from audit) | Impact |
|---|----------------------------------|----------------------|--------|
| 1 | {e.g. "Next.js 14"} | {e.g. "Next.js 15.5.15 + Turbopack"} | {e.g. "Some assumed APIs differ; useGSAP migration already done"} |
| 2 | {e.g. "Shopify backend"} | {e.g. "Stripe + Printful, no Shopify"} | {e.g. "Email templates not in Shopify dashboard — they're in `email-templates/`"} |
| 3 | ... | ... | ... |

---

## What's already done

Items the change request asks for that are **already shipped** in production or in a merged PR. Mark these in the stakeholder tracker as ⏸ Pending Verification or 🟢 Fixed — don't write prompts for them.

- [ ] {Item from request} — already shipped in PR #{N}, {date}, {brief description}
- [ ] {Item from request} — already in `src/{path}`, was added during {prior session/sprint}

---

## What's wrong about the change request

Where the stakeholder described the problem but the actual root cause is different. **These need a quick prompt clarification before implementation, not a code change.**

- **{Item}**: stakeholder said "{quote}", but actually {root cause}. The fix is {what to actually do}, not {what they asked for}.

---

## Naming / convention drift

Anything where the change request used a different naming convention than the repo:

| Topic | Change request used | Repo convention | Action |
|-------|---------------------|-----------------|--------|
| Issue prefix | `I-NN` | `[FI-NN]` (set by automation) | Use batch prefix `{INITIALS}-NN` for prompt files; let automation set FI-NN |
| Branch naming | `feature/...` | `copilot/fi-{nn}-{slug}` | Generated prompts use the repo convention |
| Commit format | `Fixes: I-NN` | `Closes #N` in PR body | ... |

---

## Stack / infrastructure verified

| Aspect | Verified value |
|--------|----------------|
| Framework | |
| Runtime | |
| Path alias root | |
| Commerce backend | |
| Auth provider | |
| Email provider | |
| Database | |
| Existing prompts/instructions/agents count | |
| Existing CI workflows | |

---

## Cross-repo references

If the change request says "port from [other project]" — verify the source actually exists.

- **{Sibling repo name}**: {expected path} — {found / not found}
- **{What to port}**: {actually exists at sibling-repo:src/path} OR {does not exist; needs to be authored from scratch}

---

## Unknown / needs stakeholder confirmation

Items where the audit couldn't resolve the question and you need the stakeholder to clarify before generating a prompt.

- {Question} — ping stakeholder
- {Ambiguity} — needs screenshot / verbatim quote

---

## Decision: kill v1 / pivot / proceed

Based on the above:

- [ ] **Proceed** — change request matches reality; generate prompts as-is
- [ ] **Pivot** — major drift but salvageable; rewrite the assumptions section before generating
- [ ] **Kill v1** — reality so different that the change request needs to be re-conducted with the stakeholder

If pivoting or killing, document why here:

> {explanation}

---

## Next steps

1. {What to do next based on the decision above}
2. ...

---

*Don't skip this doc. It's the difference between shipping the right v1 and re-doing the whole batch.*
