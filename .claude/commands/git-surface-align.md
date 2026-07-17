# /git-surface-align — Git Surface Alignment Audit (40X, multi-repo)

Reconcile **every git surface** of one or more repos against a named target, classifying each as **ALIGN**, **REGRESS**, or **NEUTRAL**, so cleanup (prune / branch-delete / submodule-sync) never destroys live work and never leaves stale state behind.

**Model:** claude-opus (auditor) + multi-angle fan-out
**Surfaces:** branches · worktrees · stashes · remotes · tags · submodules · index/working-tree · IDE surfaces (`.claude/`, `.cursor/`, `.agents/`)
**Repos:** the current repo by default; with `--workspace`, fans out across sibling repos (`../.agent-kb`, `../documentation-standards`, `maximus-ai`, …).
**Related:** `pnpm worktrees:prune` (`scripts/prune-claude-worktrees.mts`), issue #216 (IDE parity), `/malfig` G6/G9.

---

## Inputs

```
/git-surface-align [<target>] [--workspace] [--repo=<path>] [--surfaces=branches,worktrees,...]
```
- `<target>` — work to align against: a branch, PR number, or short description (default: current `HEAD`).
- `--workspace` — audit all sibling repos in the parent dir, not just this one.
- `--surfaces` — restrict to a subset (default: all).

## 40X logic (how this skill reasons)

Inherits the MALFIG **40X** discipline — breadth of angles, source-grounded facts, P0 gating:

1. **G6 — multi-angle fan-out (≥5 angles).** Every candidate, on every surface, is judged from all of: *(a)* ancestry vs `origin/<default>`, *(b)* working-tree/index cleanliness, *(c)* open-PR / upstream linkage, *(d)* lock / protection status, *(e)* surface & repo ownership. One green angle never promotes REGRESS→ALIGN.
2. **G9 — source over panel.** Every asserted fact MUST be proven against the **source of truth** — live `git`, the filesystem, the GitHub API — never a cached dashboard, stale `.cortex-boot.json`, or doc. Quote the proving command output.
3. **P0 gate.** Anything a cleanup pass *could* destroy that carries unmerged/unpushed/uncommitted work is a **P0 REGRESS** — reported first; no `--apply`/destructive step is recommended while a P0 is open.

## Surfaces & per-surface checks (source of truth)

| Surface | Enumerate | Disposability test | Auto-REGRESS (never touch) |
|---|---|---|---|
| **branches** | `git branch -vv` · `git branch -r` | merged to `origin/<default>` **and** upstream gone/identical | unique commits; protected branch; open PR head |
| **worktrees** | `git worktree list --porcelain` | clean tree **and** 0 commits vs `origin/<default>` | `locked`; `agent-*`/`wf_*`; any `.cursor/worktrees/*` path |
| **stashes** | `git stash list` | **never auto-cleared** — report-only | ALL — stash is global across worktrees; only the human pops |
| **remotes** | `git remote -v` · `git rev-list --left-right --count @{u}...HEAD` | n/a (report divergence/ahead-behind) | any remote with unpushed local commits |
| **tags** | `git tag` · `git ls-remote --tags origin` | local tag already on remote | unpushed tag (may be a release marker) |
| **submodules** | `git submodule status` | pointer == committed & clean | detached/dirty/diverged submodule |
| **index/worktree** | `git status --porcelain` | empty | any staged/unstaged/untracked/conflicted path |
| **IDE surfaces** | inspect `.claude/`, `.cursor/`, `.agents/` | committed & parity-consistent (issue #216) | uncommitted local-only surface artifact |

## Steps

1. **Resolve scope.** Determine target, default branch (`git symbolic-ref refs/remotes/origin/HEAD`), and repo set (this repo, or all siblings under `--workspace`). `git fetch --all --prune --tags --quiet` per repo (source refresh, G9).
2. **Enumerate every in-scope surface** with the commands above.
3. **Per-item 40X fan-out (G6).** Apply the 5 angles; for branches/worktrees also run `git log --oneline origin/<default>..<ref>` and `git -C <wt> status --porcelain`; for PR-linkage use `mcp__github__list_pull_requests` / `search_pull_requests` by head ref.
4. **Cross-surface & cross-repo reconciliation.** Note where the same branch is checked out in multiple worktrees/repos, or owned by different IDE surfaces. IDE **conversation** logs are local IDE state — not in the repo — so reconcile by repo-visible footprint (worktree path → branch → committed `SKILL.md`/`.mdc`/workflow) and **explicitly mark any surface whose conversation log is not inspectable from the current checkout** rather than guessing.
5. **Classify + P0 gate (G9).** Assign ALIGN / REGRESS / NEUTRAL with proving output; surface P0 REGRESS first.
6. **Report** the matrix, then recommend cleanup **only if zero P0 REGRESS remain** — per surface (`pnpm worktrees:prune --apply`, `git branch -d`, `git push --tags`, `git submodule update`, …).

## Output format

```
SCOPE: <repo(s)> · TARGET: <branch/PR/desc> · DEFAULT: origin/<default>

P0 REGRESS (protect — do NOT clean):
  [<repo>/<surface>] <ref>  — <reason + proof>

Matrix:
  REPO   SURFACE     REF                         VERDICT   PROOF
  atb    worktree    .claude/worktrees/foo       ALIGN     clean, 0 commits vs main
  atb    branch      feat/caro-ai-chatbot        REGRESS   .cursor-owned + 12 commits
  atb    stash       stash@{0}                    REGRESS   global; report-only
  ...

Recommendation (per surface): <commands  OR  "blocked: N P0 regressions open">
```

## Guardrails

- **Never** propose a destructive step while a P0 REGRESS is open.
- **Never** clear, pop, or drop a **stash** — it is global across worktrees; report-only, always REGRESS.
- **Never** classify from a dashboard/doc — only live `git` / filesystem / GitHub API (G9).
- **Never** touch `.cursor/worktrees/*`, `locked`, `agent-*`, `wf_*`, or any ref with unpushed/unmerged work — auto-REGRESS regardless of other angles.
- Read-only: this skill audits and recommends; it never removes worktrees, deletes branches, or mutates submodules itself.
