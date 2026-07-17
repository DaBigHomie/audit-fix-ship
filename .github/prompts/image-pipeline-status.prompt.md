---
description: "Report current 30x manifest status — job counts, generated vs deployed, missing images. Use when: checking image pipeline health, auditing assets, planning next generation batch."
agent: "image-gen"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/image-pipeline-status.prompt.md -- do not edit; run sync-agents.mts -->

# Image Pipeline Status

You are forked into an **@image-gen** session. Report the current state of the 30x image manifest.

## Repo Context

| Repo | Path |
|------|------|
| `image-gen-30x-cli` | `~/management-git/image-gen-30x-cli` |
| `one4three-co-next-app` | `~/management-git/one4three-co-next-app` |

## Steps

### 1. Count manifest jobs

```bash
cd ~/management-git/image-gen-30x-cli
npx tsx src/generate.ts --dry 2>&1 | head -25
```

### 2. Count generated images

```bash
find output/images -name "*.jpg" -o -name "*.webp" | wc -l
```

### 3. Count deployed to o43

```bash
find ~/management-git/one4three-co-next-app/public/images -name "*.webp" | wc -l
```

### 4. Find missing (generated but not deployed)

```bash
for f in output/images/**/*.jpg; do
  webp="${f%.jpg}.webp"
  base="${f#output/images/}"
  deployed="$HOME/management-git/one4three-co-next-app/public/images/${base%.jpg}.webp"
  [ ! -f "$deployed" ] && echo "❌ Not deployed: $base"
done
```

## Output Format

```
📊 30x Image Pipeline Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Manifest jobs:    N
Generated:        N  (output/images/)
Deployed to o43:  N  (public/images/)
Missing:          N

By category:
| Category      | Jobs | Generated | Deployed |
|---------------|------|-----------|----------|
| heroes        |    3 | ✅ 3     | ✅ 3    |
| ...           |  ... | ...       | ...      |

❌ Not deployed:
- {list any missing}
```

## Critical Rules

1. Report-only — NEVER modify files or generate images
2. Use `--dry` flag — NEVER call the Gemini API
3. Count `.jpg` in output AND `.webp` in o43 separately
