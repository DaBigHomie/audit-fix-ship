<!-- GENERATED FROM maximus-ai/skills/malfig-ship/reference/repo-sync-guard.md -- do not edit; run sync-skills.mts -->
# malfig-ship — repo-sync-guard guidance (no local script found)

If the active repo has no `scripts/repo-sync-guard.mts` (most repos don't — the real copy
lives in `maximus-ai/.system/scripts/repo-sync-guard.mts`), run it from there against the
target repo instead of skipping the check:

```bash
npx tsx ~/management-git/maximus-ai/.system/scripts/repo-sync-guard.mts <path-to-target-repo>
```

It's read-only (dirty tree, branch drift, stashes, unlinked migrations) — safe to point at
any repo. A HOLD verdict driven by *other* worktrees/branches in the same repo (unpushed
feature work, stale stashes) does not block shipping your own clean branch — read the
specific reasons before treating HOLD as a stop.

See `documentation-standards/.github/instructions/git-hygiene.instructions.md` for the full
spec this script implements against, and the sibling `git-forensics-audit.mts`
(`maximus-ai/scripts/`) for the commit-*history* equivalent (state, not history, is this
script's job).

**Known bug (found 2026-07-05):** passing exactly one positional `<repoDir>` arg with no
`--root` flag silently drops it (`argv.filter((a, i) => !a.startsWith('--') && i !== rootIdx + 1)`
excludes index 0 whenever `rootIdx` is `-1`, i.e. `--root` absent) — the script falls back to
auditing `process.cwd()` instead. Workaround: `cd` into the target repo first, then run with
no positional arg, rather than passing the path. Not fixed here (found during a ship, not the
right moment to also patch the tool being used).
