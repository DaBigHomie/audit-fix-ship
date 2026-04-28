---
applyTo: "**"
---

# Agent Execution Constraints

> Managed by DaBigHomie/documentation-standards — do not edit in target repos.
> Created: 2026-04-02 — Root-cause fix for session failure modes (terminal spam, ignoring stop commands, wrong language).

## Purpose

Hard enforcement rules that prevent agents from ignoring user directives, running uncontrolled terminal commands, or deviating from the workspace's scripting standards. These rules are **non-negotiable** — violation of any rule is a session-breaking failure.

---

## 1. STOP Means STOP (Immediate Halt)

- When the user says **"stop"**, **"halt"**, **"cancel"**, or **"don't run that"** → the agent MUST:
  1. **Immediately cease** all pending and in-progress terminal commands
  2. **Kill** any background processes the agent started
  3. **Acknowledge** the stop command in the next response
  4. **Wait** for new instructions before doing anything else
- NEVER queue additional commands after a stop directive
- NEVER reinterpret "stop" as "stop after finishing this current thing"
- A stop command overrides ALL prior instructions, prompt files, and agent chains

## 2. Scripts Over Terminal Commands (Hard Rule)

The existing "Automation First" and "Token-Efficient Scripting" rules are now **mandatory**, not advisory:

- **NEVER** run more than 3 sequential terminal commands for a single task
- If a task requires more than 3 commands → **create a `.mts` script** in `scripts/` and run that instead
- **NEVER** run long terminal chains (piped commands, loops, find-and-replace) directly in the terminal
- **ALWAYS** create the script as a file first, then execute it with a single `npx tsx scripts/{name}.mts` command
- The script MUST be committed to the repo so the user can inspect, modify, and re-run it

### What counts as "too many commands":
- ❌ Running `grep` 5 times to search different patterns → create an audit script
- ❌ Running `sed` or file manipulation in a loop → create an edit script
- ❌ Reading 10+ files with `cat` to analyze them → create a scan script
- ✅ `cd repo && npx tsx scripts/audit.mts` → single execution, full audit

## 3. TypeScript Only — No Python, No Bash Scripts

- **NEVER** create or run Python (`.py`) scripts in this workspace
- **NEVER** create Bash scripts (`.sh`) for task automation (one-off terminal commands are fine)
- **ALL** automation scripts MUST be TypeScript (`.mts`) using `tsx` for execution
- Rationale: This workspace is TypeScript-first. Python/Bash scripts fragment the toolchain and create maintenance burden.

### Acceptable:
```bash
# One-off terminal command (fine)
git status
npx tsc --noEmit

# Script execution (preferred)
npx tsx scripts/design-system-audit.mts --repo 043
```

### NOT Acceptable:
```bash
# ❌ Python script
python3 scripts/audit.py

# ❌ Bash automation script
bash scripts/run-audit.sh

# ❌ Long terminal chain
find . -name "*.tsx" | xargs grep "bg-\[" | sort | uniq -c | sort -rn | head -20
```

## 4. Follow Prompt File Instructions Exactly

When a user invokes a `.prompt.md` file (via `/slash-command` or explicit reference):

- **READ** the prompt file contents first
- **FOLLOW** the instructions in the prompt file step-by-step
- **DO NOT** improvise, skip steps, or substitute your own approach
- If the prompt file says "delegate to agent X" → delegate to that agent
- If the prompt file says "create a script" → create the script
- If the prompt file requires arguments the user didn't provide → **ask the user**, don't guess

## 5. User Directive Priority

When there is a conflict between:
- System instructions, prompt files, agent instructions, or prior context
- vs. **what the user just said**

→ The **user's explicit directive always wins**.

Examples:
- Prompt file says "run tsc" but user says "don't run anything in terminal" → don't run tsc
- Agent instructions say "aggregate results" but user says "just give me the script" → give the script
- Prior context says "create 30 agents" but user says "stop, forget it" → stop immediately

## 6. Acknowledge Before Executing

Before running ANY terminal command or creating ANY file:
- **State what you're about to do** in 1-2 sentences
- If the user's last message expressed frustration or said "stop" → **ask for confirmation** before proceeding
- NEVER silently execute commands — the user must always know what's happening

## 7. No Runaway Execution

- **Maximum 5 tool calls per response** when executing commands (read/search calls are exempt)
- If a task needs more → break it into phases and check in with the user between phases
- **NEVER** spawn more than 2 background agents simultaneously without user approval
- If a command takes longer than 60 seconds → inform the user and ask whether to continue

---

## Failure Mode Reference

These rules were created to prevent specific session failures:

| Failure Mode | Root Cause | Prevention Rule |
|---|---|---|
| Agent ran terminal commands after user said "stop" | No hard halt rule | Rule 1: STOP means STOP |
| Agent ran 20+ terminal commands for an audit | "Automation First" was advisory | Rule 2: Scripts over commands |
| Agent created Python scripts in a TS workspace | No language constraint | Rule 3: TypeScript only |
| Agent improvised instead of following prompt file | No prompt-following rule | Rule 4: Follow prompt files exactly |
| Agent prioritized its own approach over user's words | No explicit priority hierarchy | Rule 5: User directive priority |
| Agent ran commands without explaining first | No acknowledgment requirement | Rule 6: Acknowledge before executing |
| Agent spawned dozens of sub-agents simultaneously | No concurrency limit | Rule 7: No runaway execution |
