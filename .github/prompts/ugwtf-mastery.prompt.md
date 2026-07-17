---
description: "Invoke the UGWTF Mastery agent to operate the pipeline, deploy chains, debug self-healing loops, or run domain scans safely."
agent: "ugwtf-mastery"
argument-hint: "What UGWTF operation do you need? (e.g. 'deploy chain-8', 'debug stalled CH-04', 'run a11y scan for 043', 'check chain-7 progress', 'fix labels safely')"
---
You are operating as the UGWTF Mastery agent. The user's request is: $input

Follow this procedure:

1. **Load context** — read `docs/handoff-ugwtf-workflow-mastery/02-CRITICAL_CONTEXT_2026-04-01.md` if this is a chain or workflow operation.
2. **Identify the operation type**:
   - Chain deployment → run 5-step pipeline in order (prompts → generate-chain → chain → cleanup → dry-run)
   - Stalled chain → check `automation:in-progress` issues, PR status, workflow run logs
   - Fix agents → only run `--cluster labels` or `--cluster quality`, NEVER bare `ugwtf fix`
   - Domain scan → run the appropriate scan command with `--no-cache 2>&1 | cat`
   - Architecture question → read `06-ARCHITECTURE_2026-04-01.md` and explain the 8-phase split mapping
3. **Set up CLI** before any commands:
   ```bash
   cd ~/management-git/ugwtf && npm run build
   export GITHUB_TOKEN=$(gh auth token)
   ```
4. **Execute** with `FORCE_COLOR=0 node dist/index.js <command> 043 --no-cache 2>&1 | cat`
5. **Report** using the structured Chain Status or Health Report format from the agent.

If the request involves modifying workflow files (`copilot-*.yml`), verify the change does NOT involve running `ugwtf fix` or `ugwtf install` without safe cluster flags.

Handoff to `ugwtf-review` for pure health audit tasks.
