---
name: audit-fix-ship
description: Use this skill when the user has a deadline-driven cycle that involves auditing a real codebase against a meeting transcript or change request, then generating a batch of executable prompts/issues for an agent pipeline (Copilot, UGWTF, Cursor, Claude Code, etc.) to ship in waves. Triggers include phrases like "audit and fix", "client review", "site review prompts", "before deadline", "Jay/Bob/[stakeholder] called out X items", "bulk fix", "feed to my agent pipeline", "wave plan", "presentation ready by [date]". Especially relevant when (a) the user is a freelancer/agency operator managing 5+ repos, (b) the change request comes from a non-technical stakeholder, and (c) there's a tension between speed and accuracy. NOT for greenfield builds or single-issue debugging — those don't need this overhead.
---

# Audit-Fix-Ship Skill

A reusable workflow for converting a stakeholder change request (meeting transcript, voice note, screenshot batch, written punch list) into a typed, validated, agent-ready prompt batch — with reality reconciliation built in.

## When this saves the most time

This skill exists because freelance/agency dev work has a recurring failure mode: **build the doc first, audit later** → discover halfway through that the assumed stack is wrong, the work is already done in another PR, the path aliases differ, the change request references a feature that already shipped. Cycle has to restart.

The fix is to **invert the order** — audit reality first, then write to that reality. This skill makes that the default.

Use it when:
- A non-technical stakeholder (client, founder, PM) walked through the product flagging changes
- The list is 20+ items
- There's a hard deadline (presentation, demo, drop, board meeting)
- The fixes will be executed by an agent pipeline, not all by hand
- The repo has existing conventions (`.github/instructions/`, `.cursor/rules`, `CLAUDE.md`, `AGENTS.md`)

Do **not** use it when:
- It's a single bug fix
- The repo is greenfield with no conventions
- The user wants a conversational answer, not a deliverable
- Token budget is severely constrained — this skill produces files

## The five phases

### Phase 1 — Audit reality (~10 min, ~2k tokens)

Use the **Audit Checklist** in `templates/audit-checklist.md`. Do this **before** writing any prompts. The checklist enumerates the 12 most common drift points: framework version, path aliases, existing automation, naming conventions, prior PRs, redirects, commerce backend, etc.

Output: `RECONCILIATION.md` — a brutally honest doc listing each assumption from the change request vs what's actually in the repo.

### Phase 2 — Stakeholder tracker (~5 min, ~1.5k tokens)

Use `templates/stakeholder-tracker.template.md`. This is the **non-technical** view of the work: status icons, blocker queue, summary table by section. It's what the stakeholder reads.

Naming convention: `{INITIALS}-NN` for the batch (e.g. `JSR-` for Jay Site Review, `MQR-` for Maximus Q1 Review). Avoid generic prefixes like `I-` that collide with GitHub's issue numbering.

### Phase 3 — Handcrafted prompts (~30 min, ~6k tokens)

For the **5–8 most nuanced items**, write the prompts by hand:
- Items that touch >3 files
- Items that need cross-repo template ports
- Items where the fix is non-obvious (e.g. an RLS policy that's correct, but the user's profile role is wrong)
- Items that require investigation before implementation
- Items at the start of dependency chains

Use `templates/handcrafted-prompt.template.md` — 24-section UGWTF gold-standard format.

### Phase 4 — Generated prompts (~15 min, ~3k tokens)

For the remaining 80%+, populate `scripts/issues.ts` (typed data, single source of truth) and run `scripts/generate-prompts.mts`. Outputs ~1000 tokens per prompt, SHA-gated so re-runs are free.

This is where the bulk of the token efficiency comes from. **Never write the boilerplate 30+ times in chat** — write it once in the template, parameterize from typed data, generate.

### Phase 5 — Wave plan + handoff (~10 min, ~2k tokens)

Use `templates/install-runbook.template.md`. The runbook tells the user exactly which commands to run to feed the prompts into their agent pipeline. Wave structure:

- **Wave 0** — Verifications (~20 min, no code)
- **Wave 1** — Fast P0 wins
- **Wave 2** — Content-dependent
- **Wave 3** — Bug fixes + polish
- **Wave 3.5** — Critical bugs + admin CRUD
- **Wave 4** — Post-deadline

## Token efficiency rules

1. **Read the repo conventions once, point to them N times.** Never inline `.github/instructions/typescript.instructions.md` content in 40 prompts. Reference the path in each prompt's "Bootstrap" section. The agent loads it.

2. **Typed data → generated prompts.** One `issues.ts` array of 40 entries renders 40 prompts via one script. Cost: ~5k tokens to author the data + 0 marginal tokens per prompt rendered (it's local TypeScript execution, not Claude rendering each one in chat).

3. **Don't paste large repo files into the chat unless you'll edit them.** Use Desktop Commander / file_reading skill to read into a thinking block, summarize, drop the raw content.

4. **Skill files load once per session.** This SKILL.md is ~200 lines; the templates are loaded only when needed. A future session triggers this skill via the description above and gets the workflow without you re-explaining it.

5. **Prefer `str_replace` over re-writing whole files.** When iterating on a prompt or doc, surgical edits use 5–10% of the tokens of a full rewrite.

6. **Compact handoff packs.** Final outputs are: 1 RECONCILIATION.md, 1 stakeholder tracker, 5 handcrafted prompts, 1 typed data file, 1 generator script, 1 install runbook. ~10 files. Not 50.

## Reality-reconciliation checklist (Phase 1)

When auditing the repo before writing prompts, walk through this. Each item below has a default failure mode; check the actual repo against the assumption.

| # | Check | Default assumption | Verify with |
|---|-------|--------------------|-------------|
| 1 | Framework + version | "Next.js 14" | `cat package.json \| grep next` |
| 2 | Path aliases | `@/*` → `./src/*` | `cat tsconfig.json \| grep -A 10 paths` |
| 3 | Commerce backend | Shopify | `grep -r "shopify\\|stripe\\|printful" src/ \| head` |
| 4 | Existing automation | None | `ls .github/prompts/ .github/instructions/ .github/workflows/ 2>/dev/null \| wc -l` |
| 5 | Naming conventions | `feat: ...` | `cat .github/copilot-instructions.md AGENTS.md CLAUDE.md 2>/dev/null \| head -100` |
| 6 | Prior related PRs | Greenfield | `gh pr list --state merged --limit 10 --json title,number 2>/dev/null` |
| 7 | Redirects in place | None | `cat next.config.* \| grep -A 20 redirect` |
| 8 | Existing email infrastructure | None | `grep -r "resend\\|sendgrid\\|postmark\\|nodemailer" src/` |
| 9 | RLS policies | Default Supabase | `ls supabase/migrations/ \| tail -5 && cat the latest migration` |
| 10 | Component already exists for X | Doesn't exist | `find src -iname "*Story*" -o -iname "*Hero*" \| head` (parameterize per ask) |
| 11 | Domain primary | The one stakeholder mentioned | `cat next.config.* \| grep -A 20 redirect` and Vercel env vars |
| 12 | The stakeholder's profile state | Correct | Query the actual user table — RLS errors are often profile-state not policy errors |

## Optional: 4-swarm scan (when transcript is dense)

After producing the stakeholder tracker, optionally run the 4-swarm scan from `templates/four-swarm-scan.template.md` to find details the tracker compressed out. Especially useful when:

- The change request is a long meeting transcript
- The stakeholder is non-technical and used screenshots/pointing rather than precise language
- You suspect verbatim copy or specific image references got summarized away

## File reference

```
audit-fix-ship/
├── SKILL.md                                  ← this file (entry point)
├── templates/
│   ├── audit-checklist.md                    ← Phase 1
│   ├── reconciliation.template.md            ← Phase 1 output
│   ├── stakeholder-tracker.template.md       ← Phase 2
│   ├── handcrafted-prompt.template.md        ← Phase 3 (24-section)
│   ├── install-runbook.template.md           ← Phase 5
│   └── four-swarm-scan.template.md           ← Optional QA pass
├── scripts/
│   ├── issues.ts                             ← Phase 4 typed data (parameterize)
│   ├── generate-prompts.mts                  ← Phase 4 generator
│   └── tsconfig.json                         ← For tsx execution
└── examples/
    └── README.md                             ← Pointer to the JSR session as worked example
```

## Worked example reference

The first time this skill was used produced these files for a 44-issue stakeholder review on a Next.js 15 e-commerce site. Worth opening if you want to see the templates filled in:

- `RECONCILIATION.md` — drift report (11 corrections logged)
- `143-issues-for-jay-v2.md` — stakeholder tracker
- `INSTALL.md` — runbook
- 5 handcrafted prompts (most useful: the cross-repo email template port, the RLS investigation)
- `jsr-issues.ts` + `generate-jsr-prompts.mts` — generator pair (39 prompts, ~970 tokens each, SHA-gated)
- `transcript-scan-missed-details.md` — 4-swarm scan output

Token cost end-to-end for that session: ~80k tokens of assistant output across the full cycle (audit → reconciliation → tracker → 5 handcrafted → 39 generated → scan). Without the generator, writing 39 prompts inline would have been ~150k tokens minimum.

## How to use this skill in a future session

Open a new Claude conversation. Drop this skill folder into the working directory or upload as a project resource. Then say something like:

> I have a [meeting transcript / change request / punch list] for [project name]. The repo is at [path]. Stakeholder is [name], deadline is [date]. Use the audit-fix-ship skill — go.

Claude will:
1. Read this SKILL.md and the templates
2. Run the reality audit against the repo
3. Produce RECONCILIATION.md
4. Build the stakeholder tracker with `{INITIALS}-NN` IDs
5. Write 5–8 handcrafted prompts for the gnarly items
6. Populate `issues.ts` for the rest
7. Generate the bulk prompts via the script
8. Hand off with the runbook

Aim for a 30–60 minute session for a 30–50 issue batch on a familiar stack. First-time stack discovery adds ~15 min.
