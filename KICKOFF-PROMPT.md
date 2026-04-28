# Kickoff Prompt — paste this into a new Claude session

Copy everything below the `---` line, fill in the bracketed values, and paste into a new Claude conversation. The skill folder must be accessible to the session (uploaded as project resource, dropped in `.claude/skills/`, or contents pasted alongside).

---

I'm starting an audit-fix-ship cycle. Use the workflow defined in `audit-fix-ship/SKILL.md`.

**Project:** [Project name]
**Repo path:** [/absolute/path/to/repo]
**Stack:** [Next.js 15, React, TypeScript, Supabase, etc. — best guess; the audit will verify]
**Stakeholder:** [Name + their role — client, founder, PM]
**Source material:** [Pasted transcript / uploaded recording / written punch list / screenshots]
**Deadline:** [Specific date + what "done" looks like — demo, presentation, drop, board meeting]
**Batch prefix:** [3-letter initials for the prompt batch, e.g. "JSR" for Jay Site Review]

**Sibling repos to reference (if any):**
- [path/to/sibling-1] — [what to look at: e.g. "email templates", "FSD structure"]
- [path/to/sibling-2] — [what to look at]

**Agent pipeline this feeds into:** [UGWTF / Copilot / Claude Code / Cursor / custom — including any specific commands the install runbook should reference]

**Existing repo conventions to respect:**
- Branch pattern: [e.g. "copilot/fi-{nn}-{slug}"]
- Commit format: [e.g. "Conventional Commits with Closes #N in PR body"]
- Workflows that auto-run: [e.g. "ci.yml, copilot-pr-promote.yml, copilot-chain-advance.yml"]
- Existing automation: [e.g. ".github/prompts/, .github/instructions/, .github/agents/"]

**Optional flags:**
- Run 4-swarm scan after the tracker: [yes / no — default no, skip unless source is a dense transcript]
- Skip handcrafted prompts entirely: [yes / no — default no, write 5–8 by hand]
- Wave 0 verifications: [list anything that must be confirmed before any code work — e.g. "verify stakeholder's profile.role in DB"]

---

Run all five phases in sequence:
1. **Phase 1 — Audit** using `templates/audit-checklist.md`. Output: `RECONCILIATION.md`. Stop and show me before proceeding if you find major drift (kill v1 / pivot decision).
2. **Phase 2 — Stakeholder tracker** using `templates/stakeholder-tracker.template.md`. Output: `[prefix]-issues-for-[stakeholder].md`.
3. **Phase 3 — Handcrafted prompts** using `templates/handcrafted-prompt.template.md`. Pick the 5–8 most nuanced items.
4. **Phase 4 — Generated prompts** by populating `scripts/issues.ts` and running `scripts/generate-prompts.mts`. SHA-gated, idempotent.
5. **Phase 5 — Install runbook** using `templates/install-runbook.template.md`. Output: `INSTALL.md`.

If I requested the 4-swarm scan: run it after Phase 5, output `transcript-scan-missed-details.md`.

Use Desktop Commander or your filesystem tools to actually inspect the repo — don't assume what's in it.

When you finish, present all output files via `present_files` so I can review and copy them into the project.
