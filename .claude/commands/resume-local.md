# /resume-local — Resume an ATB cloud session in your local terminal

Generate the exact shell sequence + a seeded continuation prompt to pick up a Claude Code **web/cloud** session on your **local Mac terminal** with full context. Use at the end of a cloud session, or any time you want to hand work off to a local checkout.

**Why:** cloud sessions run in an ephemeral container — only what's committed + pushed survives. This skill produces the deterministic "land on main, start Claude, here's what's open" handoff so nothing is lost in the gap.

---

## Steps

1. **Confirm everything is pushed.** A cloud session's uncommitted work does NOT exist locally. Verify:
   ```bash
   git status --porcelain   # must be empty
   git log --oneline -3      # note the tip that local must reach
   ```
   If anything is unpushed, commit + push first — otherwise the local resume starts from stale state.

2. **Emit the launch sequence** (paste into the local terminal). Paths are resolved portably — the MacBook and iMac checkouts differ (`Management Git` vs `management-git`), so never hardcode `/Users/<name>/...`. Set `ATB_ROOT` once per machine in your shell profile to skip auto-detect:
   ```bash
   # 1. resolve repo root portably (env override → auto-detect under $HOME, case-insensitive)
   ATB_ROOT="${ATB_ROOT:-$(find "$HOME" -maxdepth 5 -type d -iname atl-table-booking-app -ipath '*management*git*' 2>/dev/null | head -1)}"
   [ -d "$ATB_ROOT" ] || { echo "Set ATB_ROOT to your atl-table-booking-app checkout"; }
   cd "$ATB_ROOT" || return 1

   # 2. land on the WORKING branch — NEVER check out / sit on main (branch-discipline rule).
   #    Refresh main as a pointer only; merge it into the branch if you need its commits.
   BR="${ATB_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"   # or export ATB_BRANCH=<open PR branch>
   git fetch origin --prune
   git switch "$BR" 2>/dev/null || git switch -c "$BR" "origin/$BR"
   git pull --ff-only origin "$BR"
   git fetch origin main:main                               # update local main ref WITHOUT switching to it

   # 3. MCP creds (G4 state-sync) — .env.mcp lives in the repo's parent dir on both machines
   source "$(dirname "$ATB_ROOT")/.env.mcp" 2>/dev/null

   pnpm install --frozen-lockfile                      # only if package.json/lockfile moved
   claude                                              # start Claude Code (add --continue to resume the last local thread)
   ```

3. **Emit the continuation prompt** (paste into Claude once it starts). Build it live from repo state — open PRs, open issues, and the pending-follow-ups list — so it is never stale:
   ```bash
   git log --oneline origin/main -5
   # gh pr list --state open ; gh issue list --state open --limit 10   (if gh present)
   ```
   Template:
   > Resuming from a cloud session. `main` is at `<tip-sha>`. Run `/start` to prime CORTEX boot, then continue these open threads: <pending list>. Run `/malfig` before merging anything.

4. **Boot + verify (G4).** First action in the local session should be `/start` (CORTEX boot + state-sync from the PRIMARY checkout), then `/git-surface-align` to confirm no surface drift before new work.

## Guardrails

- Never tell the user to resume from a branch that wasn't pushed — cloud-only commits are unreachable locally. Verify `git status` clean + pushed first (step 1).
- **NEVER `git checkout main` / sit on `main`** — it violates branch discipline (develop on the feature branch only). Land on the working branch; refresh `main` as a pointer with `git fetch origin main:main` and merge it into the branch if you need its commits.
- State-sync (G4) and CORTEX seeding run only from the local PRIMARY checkout — they are the whole reason this handoff exists; surface them in the continuation prompt.
- This skill emits text for the human to run; it does not (and cannot) launch the local terminal or start Claude itself.
