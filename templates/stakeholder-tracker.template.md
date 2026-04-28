# {PROJECT} — Issue Tracker

**Site/Product:** {url}
**Last updated:** {date}
**Deadline:** {date}

---

## Status Legend

| Icon | Meaning |
|------|---------|
| 🔴 | Open — not started |
| 🟡 | In progress |
| 🟢 | Fixed — live |
| ⏸ | Pending verification (may already be done) |
| 🔒 | Blocked — waiting on stakeholder |

---

## 🔒 What {STAKEHOLDER} Owes (Blockers)

Items the stakeholder must deliver before specific issues can ship. The sooner these come back, the faster the rest unlocks.

| # | What's needed | For issue | Status |
|---|---------------|-----------|--------|
| {S}-1 | {description} | {ID} | 🔒 |
| {S}-2 | {description} | {ID} | 🔒 |

---

## 🔝 Priority: Must Ship Before {DEADLINE}

### {Section 1 — e.g. Homepage}

| ID | Issue | Status |
|----|-------|--------|
| {PFX}-01 | {one-line imperative} | 🔴 |
| {PFX}-02 | {one-line imperative} | 🔴 |

### {Section 2 — e.g. Navigation}

| ID | Issue | Status |
|----|-------|--------|
| {PFX}-09 | {one-line imperative} | 🔴 |

### {Section 3 — e.g. ...}

| ID | Issue | Status |
|----|-------|--------|

---

## 🐛 {Critical Bug Section — e.g. Admin Dashboard Bugs}

These block the stakeholder from self-service / using the product.

| ID | Issue | Status |
|----|-------|--------|

---

## 🔧 Polish & Nice-to-Haves

| ID | Issue | Status |
|----|-------|--------|

---

## ⏳ Deferred (Post-{DEADLINE})

| ID | Issue | Status |
|----|-------|--------|

---

## 🏝️ {Sibling Project} (separate codebase — tracked here for context)

| ID | Issue | Status |
|----|-------|--------|

---

## Cross-references to existing automation

If the repo already has prompts/issues from prior work that overlap with this batch:

| {PFX} ID | Existing prompt/issue | Relationship |
|----------|------------------------|--------------|
| {PFX}-NN | {existing path or #NN} | extends / supersedes / depends-on |

---

## Summary

| Category | Open | In Progress | Fixed | Pending | Blocked |
|----------|------|-------------|-------|---------|---------|
| Section 1 | | | | | |
| Section 2 | | | | | |
| **Total** | | | | | |

---

## Notes for the stakeholder

- IDs prefixed `{PFX}-` map to prompt files in `.github/prompts/{PFX}-*.prompt.md`
- Status syncs from git activity via the `{automation}` workflow
- Questions on any item → ping {tech lead}

---

*This tracker is the single source of truth for what ships before {deadline}.*
