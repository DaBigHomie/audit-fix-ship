---
description: "Run UGWTF CLI — labels, deploy, validate, issues, prs, audit, fix, status, or generate-chain against a repo"
agent: "agent"
argument-hint: "e.g. audit damieus --verbose"
---

# Run UGWTF

You are executing a **UGWTF** command from `~/management-git/ugwtf/`.

## Step 1: Ask for Target

**Before running anything**, ask me:

> Which **file or folder** should I target?

Present the registered repos for quick selection:

| Alias | Repo |
|-------|------|
| `damieus` | DaBigHomie/damieus-com-migration |
| `043` | DaBigHomie/one4three-co-next-app |
| `ffs` | DaBigHomie/flipflops-sundays-reboot |
| `cae` | DaBigHomie/cae-luxury-hair |
| `maximus` | DaBigHomie/maximus-ai |
| `ugwtf` | DaBigHomie/ugwtf |

I can also provide a **folder path** (used with `--path` for `generate-chain`).

**Wait for my answer before proceeding.**

## Step 2: Ask for Command

Once the target is known, ask:

> Which command? (`labels`, `deploy`, `validate`, `issues`, `prs`, `audit`, `fix`, `status`, `generate-chain`)

If I already provided the command in my initial message, skip this step.

## Step 3: Ask for Flags

Ask if I want any flags:

- `--dry-run` — preview only
- `--verbose` / `-v` — debug output
- `--path <folder>` — scope prompt scanning (generate-chain)
- `--output json|markdown|summary` — report format

If I said "just run it" or provided flags already, skip this step.

## Step 4: Execute

Run the command from the ugwtf directory:

```bash
cd ~/management-git/ugwtf
npx tsx src/index.ts <command> <repo> [flags]
```

Read **ALL** terminal output. Report the result — do not summarize or truncate.
