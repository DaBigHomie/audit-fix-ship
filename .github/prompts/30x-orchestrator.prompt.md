---
description: "Create a cohesive agent + prompt + skill bundle. Combines /create-agent, /prompt-creator, and skill scaffolding into one orchestrated workflow."
agent: "30x-orchestrator"
argument-hint: "Describe the agent/prompt/skill you want to create"
---

# 30x Orchestrator

Create a complete agent + prompt + skill bundle as an atomic unit. All three files are interdependent — the prompt invokes the agent, the agent references the skill, and the skill bundles reusable procedures.

## Invoke

```
/30x-orchestrator {description of what the new agent should do}
```

## What It Creates

| # | File | Purpose |
|---|------|---------|
| 1 | `.github/agents/{name}.agent.md` | Agent persona, tools, workflow |
| 2 | `.github/prompts/{name}.prompt.md` | `/` slash command shortcut |
| 3 | `.github/skills/{name}/SKILL.md` | Bundled procedures and templates |

## Workflow

### 1. Load Context

Reads workspace and repo instructions automatically:

```bash
cat .github/instructions/agent-authoring.instructions.md
cat .github/copilot-instructions.md
cat AGENTS.md
ls .github/agents/*.agent.md    # Check for collisions
ls .github/prompts/*.prompt.md
```

### 2. Requirements Gathering

- What job should this agent do?
- When should it be invoked over the default agent?
- Which tools does it need? (minimal set)
- Does it need a skill? (multi-step workflow with templates → yes)

### 3. Scaffold All Files

Creates agent, prompt, and skill (if needed) in one atomic operation:
- Agent: persona, workflow phases, output format, critical rules
- Prompt: description, agent link, argument hint, usage examples
- Skill: procedures, scripts, references

### 4. Validate

- YAML frontmatter correct
- Descriptions are keyword-rich with "Use when:" triggers
- Name consistency: agent filename = prompt `agent:` = skill folder name
- No collisions with existing agents/prompts
- Tools are minimal

### 5. Report

Outputs a summary table of created files, cross-references, and usage instructions.

## Rules

- **Atomic bundles** — all files created together; partial bundles are broken
- **Name consistency** — all three files share the same kebab-case name
- **Minimal tools** — fewer tools = more focused agent
- **TypeScript only** — skill scripts use `.mts`
- **Check collisions** — always verify against existing agents before creating

## Related Agents

- `@30x-orchestrator` — this workflow's primary agent
- `@agent-creator` — standalone agent creation
- `@prompt-creator` — standalone prompt creation (UGWTF gold-standard)
- `@prompt-validator` — validate prompt quality scoring
- `@30x-troubleshoot` — fix issues in created customization files
