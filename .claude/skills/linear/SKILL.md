---
name: linear
description: >
  Create Linear issues from a jobs/linear-issues.md spec file (parent + sub-issues).
  Triggers: "/linear", "create linear issues", "push this spec to Linear",
  "file these as Linear issues".
---

# /linear — Create Linear issues from a spec file

Read a `jobs/linear-issues.md` spec from the current or specified repo and create all issues (parent + sub-issues) in Linear.

## Usage
```
/linear [path/to/linear-issues.md]
```
Default path: `{cwd}/jobs/linear-issues.md`

## What this skill does
1. Reads the spec file
2. Authenticates Linear (calls `mcp__plugin_design_linear__authenticate` if needed)
3. Parses: PARENT issue + any number of SUB-n issues
4. Creates parent first, then each sub with `parentId` set
5. Logs issue IDs back to `jobs/linear-issues.log`
6. Reports the created issue URLs

## Spec file format
```markdown
## PARENT — {title}
**priority:** urgent|high|medium|low
**labels:** label1, label2

{description}

---

## SUB-1 — {title}
**parent:** (above)
**priority:** high
**labels:** feature

{description}
```

## Implementation

```bash
<execute>
SPEC="${1:-$(pwd)/jobs/linear-issues.md}"
if [ ! -f "$SPEC" ]; then
  echo "ERROR: spec file not found: $SPEC"
  exit 1
fi
echo "Reading: $SPEC"
cat "$SPEC"
</execute>
```

After reading the spec file, use `mcp__plugin_design_linear__save_issue` to create each issue.
Map priority words: urgent=1, high=2, medium=3, low=4.
Team defaults to `Management-git` unless overridden in spec frontmatter.
Log results to `$(dirname $SPEC)/linear-issues.log`.
