<!-- GENERATED FROM maximus-ai/skills/multi-model-task-assignment/boot/README.md -- do not edit; run sync-skills.mts -->
# multi-model-task-assignment — boot scripts

These are **wired spawn commands** for tools the multi-model-task-assignment skill's Step 8
"Dispatch Wiring" section routes to. Every script here corresponds to a tool whose CLI shape is
verified from the workspace or official documentation.

## Verify-then-write rule

If a tool's real CLI is not observed in this workspace or officially documented, **do NOT create
a boot script for it**. Instead, leave its row in Step 8 marked `UNKNOWN — research required` and
open a CORTEX research task. Fabricating a CLI is a forensic-auditing Rule 5 violation.

## What's here today (2026-07-07)

| Script | Tool | Status |
|---|---|---|
| `claude-code-agent-tool-subagent.sh` | Claude Code Agent tool subagent (in-session) | **WIRED** — reference stub; the Agent tool is an in-session tool call, not a shell fork |
| `fable.sh` | Fable (Claude AI model — `claude-fable-5`) | **WIRED (2026-07-07)** — dispatches `claude --model claude-fable-5 --print` with a stdin-piped task envelope. Model id verified against the Anthropic catalog at `platform.claude.com/docs/en/about-claude/models/overview`; see `maximus-ai/docs/research/2026-07-07_fable-model-id-research.md`. |

## What's intentionally missing

| Tool | Why no script |
|---|---|
| `cursor-bg` | No `cursor` CLI or bg-invocation script observed in workspace. Cursor BG is IDE-launched today. `UNKNOWN — research required`. |
| `antigravity` | No `antigravity` CLI or MCP endpoint observed in workspace. IDE / cloud surface only today. `UNKNOWN — research required`. |
| `claude-mac` | Interactive-only by design (`Manual, no automation` per capability matrix). |
| `claude-code-background-terminal` | Official CLI shape (`claude -p ... --output-format json`) documented, but NOT verified on this workstation. `VERIFY` before wiring — do not ship a stub that pretends it works. |
| `workflow` | In-session tool call — no shell CLI to script. |

## When adding a new boot script

1. Verify the CLI actually works from a plain shell on the target workstation.
2. Boot script must:
   - Validate required env (return non-zero with a clear message on missing keys).
   - Resolve workspace root via `resolve-workspace.mts` (no hardcoded `/Users/...`).
   - Write the task envelope to a tmp file (do not inline giant prompts on the command line).
   - Launch the tool with the correct flags.
   - Print `pid=<n>` and `log=<path>` to stdout so the orchestrator can track it.
3. Update Step 8 of `SKILL.md`: change the `spawn_command` cell from `UNKNOWN` to the real shape,
   and set the `boot_script` cell to the new file path.
4. Update the "What's here today" table above.
5. Run `sync-skills.mts` (dry-run first) to distribute.

## Distribution

These scripts are copied along with `SKILL.md` when
`documentation-standards/scripts/sync-skills.mts` runs. Do NOT hand-`cp` per the `audit-script`
skill's rules.
