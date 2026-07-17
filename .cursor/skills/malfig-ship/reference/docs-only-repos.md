<!-- GENERATED FROM maximus-ai/skills/malfig-ship/reference/docs-only-repos.md -- do not edit; run sync-skills.mts -->
# malfig-ship — docs-only repo variant

The main SKILL.md gates (`tsc`, `eslint <files>`, `npm run build`, optional `playwright`)
assume an app repo with a `package.json`. Some repos in this workspace are pure
docs/skills/templates repos with **no `package.json` at all** —
`documentation-standards` is the reference case (found during
`TASK-GITFORENSICS-TOP50-20260705`).

## How to tell which variant applies

```bash
test -f package.json && echo "app repo — use SKILL.md gates as written" \
                      || echo "docs-only repo — use this file's gates instead"
```

## Gates (docs-only repo)

```bash
npx --yes tsx scripts/warden-doc-place.mts docs/ --json > /tmp/warden-result.json
cat /tmp/warden-result.json
node -p "require('/tmp/warden-result.json').blockers ?? 0"   # must print 0
```

`warden-doc-place.mts` needs only Node built-ins (`node:fs`, `node:path`, `node:os` — verified
by reading its imports before relying on it) — `npx tsx` runs it with no `npm install` step,
which is why a docs-only repo with no lockfile can still gate on it in CI.

If the repo's own `.github/workflows/ci.yml` doesn't already run this, that's a real gap, not
a reason to skip the gate locally — flag it. (`documentation-standards`'s own `ci.yml` was
found genuinely truncated — zero check steps, `startup_failure` on every run repo-wide — and
was repaired to run exactly this command; see that repo's `ci.yml` for a working reference.)

## What does NOT apply

- `npx tsc --noEmit` — no TypeScript project to check (no `tsconfig.json` at root either).
- `npx eslint <files>` — no lint config wired to a package manager here.
- `npm run build` — no build step; the repo *is* the artifact.
- `npx playwright test` — no app surface.

## Merge-readiness check

Same as the main skill — `gh pr view <n> --json mergeable,mergeStateStatus` and
`gh pr checks <n>` — but expect `gh pr checks` to report **no checks** if the repo's CI is
broken (see above) rather than treating an empty check list as automatically green. Confirm
via the manual gate above instead of waiting on CI that may never run.
