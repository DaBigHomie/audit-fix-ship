---
description: "Scaffold a new VS Code custom agent with naming convention and quality scoring"
argument-hint: "What kind of agent to create (e.g., 'database migration agent')"
---

# Scaffold Agent

Invoke the Agent Instructions agent to create a new `.agent.md` file:

```
@agent-instructions Scaffold a new agent for: $input
```

The agent will:
1. Assign a 3-letter domain code and ID
2. Create `.github/agents/{name}.agent.md` with proper frontmatter
3. Create `.github/prompts/{name}.prompt.md` shortcut
4. Score against the 18-point rubric
5. Report quality gaps
