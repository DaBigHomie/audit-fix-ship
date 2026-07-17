<!-- GENERATED FROM maximus-ai/skills/generate-workspace/README.md -- do not edit; run sync-skills.mts -->
# generate-workspace skill (canonical copy)

This folder is the canonical source for the **`/generate-workspace`** skill —
generates MALFIG-compatible IDE workspaces (Antigravity, Cursor, VS Code) for
any repo under `~/management-git`.

## Install (Cursor)

Cursor loads skills from `~/.cursor/skills/<name>/`. After pulling this repo:

```bash
mkdir -p ~/.cursor/skills/generate-workspace
cp skills/generate-workspace/SKILL.md \
   skills/generate-workspace/reference.md \
   ~/.cursor/skills/generate-workspace/
```

Keep **`reference.md`** beside **`SKILL.md`** so the relative link in SKILL.md
resolves inside Cursor.

## Install (Claude Code)

Claude Code reads project-level skills from `<repo>/.claude/skills/<name>/`
and user-level skills from `~/.claude/skills/<name>/`. To install user-level:

```bash
mkdir -p ~/.claude/skills/generate-workspace
cp skills/generate-workspace/SKILL.md \
   skills/generate-workspace/reference.md \
   ~/.claude/skills/generate-workspace/
```

## Related artifacts

- **Script:** `documentation-standards/scripts/generate-workspace.mts`
- **Template:** `documentation-standards/templates/workspace/workspace.config.json`
- **Agent:** `documentation-standards/.github/agents/workspace-factory.agent.md`
- **Prompt:** `documentation-standards/.github/prompts/generate-workspace.prompt.md`

## Companion skills

- **`/exit`** — session close (`skills/exit/`). Generated workspace onboarding
  should be summarized in the exit manifest.

## Test

After editing the script, dry-run against a known repo:

```bash
cd ~/management-git/documentation-standards
npx tsx scripts/generate-workspace.mts --repo career-corpus --dry-run
```
