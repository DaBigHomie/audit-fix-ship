# Exit skill (canonical copy)

This folder mirrors the Cursor skill used at session close (`/exit`). Cursor loads skills from `~/.cursor/skills/exit/` on your machine.

To sync locally after pulling this repo:

```bash
mkdir -p ~/.cursor/skills/exit
cp skills/exit/SKILL.md skills/exit/reference.md ~/.cursor/skills/exit/
```

Keep **`reference.md`** beside **`SKILL.md`** so relative links in the skill resolve.
