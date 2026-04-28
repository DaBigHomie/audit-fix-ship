# {PROJECT} — Install Runbook

One-page handoff for the human who'll feed these prompts into the agent pipeline.

---

## What's in the delivery

```
outputs/
├── RECONCILIATION.md                            ← read first
├── {tracker-name}.md                            ← stakeholder-facing
├── INSTALL.md                                    ← this file
├── prompts/                                      ← {N} prompt files
│   ├── {PFX}-NN-{slug}.prompt.md                 ← handcrafted (★)
│   └── ...
└── generator/
    ├── issues.ts                                 ← typed source for remaining prompts
    └── generate-prompts.mts                      ← idempotent generator
```

---

## Install — copy-paste runbook

### Step 1: Drop handcrafted prompts into `.github/prompts/`

```bash
cd {repo path}
cp {outputs path}/prompts/{PFX}-*.prompt.md .github/prompts/
ls .github/prompts/{PFX}-*.prompt.md | wc -l
# expect: {handcrafted count}
```

### Step 2: Drop the generator into the repo

```bash
cd {repo path}
mkdir -p handoff
cp {outputs path}/generator/issues.ts handoff/
cp {outputs path}/generator/generate-prompts.mts handoff/
```

Recommended: commit `handoff/` so future stakeholder reviews can fork from this template.

### Step 3: Generate the remaining prompts

```bash
cd {repo path}
npx tsx handoff/generate-prompts.mts

# Output: .github/prompts/{PFX}-{NN}-{slug}.prompt.md
# Handcrafted prompts auto-skipped via SHA check.

ls .github/prompts/{PFX}-*.prompt.md | wc -l
# expect: {total count}
```

Re-runs are safe — unchanged files are skipped (SHA-256 compare).

### Step 4: Pre-execution verifications

Before handing off to the agent pipeline, complete the items in Wave 0:

- [ ] {Wave 0 item 1 — e.g. confirm stakeholder profile.role in DB}
- [ ] {Wave 0 item 2 — e.g. verify env vars on hosting provider}
- [ ] {Wave 0 item 3}

### Step 5: Feed into agent pipeline

```bash
# Replace with the actual pipeline commands for this project
{pipeline command 1}
{pipeline command 2}
```

### Step 6: Monitor

```bash
# Pipeline status
{status command}

# Stakeholder tracker syncs from merged PR "Closes #N" references via {automation}
cat {tracker file} | head -60
```

---

## Execution order (wave-based)

| Wave | Content | Notes |
|------|---------|-------|
| 0 | Verifications | No code |
| 1 | {Fast P0 wins — list IDs} | |
| 2 | {Content-dependent — list IDs} | Blocked on stakeholder content |
| 3 | {Bug fixes + polish — list IDs} | |
| 3.5 | {Critical — admin/data — list IDs} | |
| 4 | {Post-deadline — list IDs} | |

Stakeholder content blockers ({S}-1 through {S}-N) must land before Wave 2.

---

## Sanity checks before running

```bash
# 1. TypeScript clean
cd {repo path}
npx tsc --noEmit handoff/issues.ts handoff/generate-prompts.mts

# 2. Frontmatter valid
for f in .github/prompts/{PFX}-*.prompt.md; do
  head -4 "$f" | grep -q "^agent:" || echo "MISSING frontmatter: $f"
done

# 3. Dry-run generator
npx tsx handoff/generate-prompts.mts --dry-run
```

---

## Adding / updating an issue post-install

Never hand-edit a generated prompt. Flow:

1. Edit `handoff/issues.ts`
2. Re-run `npx tsx handoff/generate-prompts.mts`
3. Generator detects SHA changes and rewrites only affected files
4. Commit both the data edit and regenerated prompt in one PR

To make a prompt "handcrafted" (skip regeneration), add its ID to the `HANDCRAFTED` Set in `generate-prompts.mts`.

---

## Known troubleshooting

- **Generator complains about duplicate IDs or unknown dependencies** — `validate()` in `issues.ts` fails fast with the error list; fix and re-run.
- **A generated prompt has wrong file paths for the repo layout** — update `files[].path` in `issues.ts`. The generator is pure; whatever's in the data is what ships.
- **Prompt file feels too long** — trim `blastRadius`, collapse `acceptance` items, single-line the `approach` section. Aim for ≤1500 tokens.
- **Re-run regenerated everything** — confirm the SHA-gate is comparing correctly; the script writes only when `sha(existing) !== sha(new)`.

---

## Contact

Questions on any item → {tech lead}. Questions on the pipeline itself → {pipeline docs path}.

*End of install guide.*
