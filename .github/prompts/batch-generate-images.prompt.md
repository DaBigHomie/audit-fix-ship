---
description: "Generate all images in a manifest category, convert to WebP, and deploy to o43. Use when: batch generating a category, refreshing all images in a group, deploying new category."
agent: "image-gen"
argument-hint: "Category name (heroes, products, story, bigmen, categories, accessories, social, collections, gallery)"
---

# Batch Generate Category

You are forked into an **@image-gen** session. Generate all images for a manifest category and deploy to o43.

## Repo Context

| Repo | Alias | Path |
|------|-------|------|
| `image-gen-30x-cli` | `image-gen` | `~/management-git/image-gen-30x-cli` |
| `one4three-co-next-app` | `043` | `~/management-git/one4three-co-next-app` |

## Workflow

### 1. Dry run preview

```bash
cd ~/management-git/image-gen-30x-cli
npx tsx src/generate.ts --category $ARGUMENTS --dry
```

Show job list and ask for confirmation before calling the API.

### 2. Generate

```bash
npx tsx src/generate.ts --category $ARGUMENTS
```

Resume-safe — files > 1KB are auto-skipped. Safe to re-run after interruption.

### 3. Convert all to WebP

```bash
DEST="$HOME/management-git/one4three-co-next-app/public/images"
for f in output/images/$ARGUMENTS/*.jpg; do
  base="${f%.jpg}"
  mkdir -p "$DEST/$(dirname "$base" | sed 's|output/images/||')"
  cwebp -q 90 "$f" -o "${DEST}/${base#output/images/}.webp"
done
```

### 4. Report summary

```
| Job ID | Size (JPG) | Size (WebP) | Deployed To |
|--------|------------|-------------|-------------|
```

### 5. Verify o43 build

```bash
cd ~/management-git/one4three-co-next-app
npx tsc --noEmit && npm run build
```

### 6. Commit both repos

Include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer.

## Critical Rules

1. ALWAYS dry-run first — confirm with user before API calls
2. Gemini rate limit: 6s between jobs (built into CLI)
3. NEVER commit `.jpg` to o43 — only `.webp`
4. If any job fails after 3 retries, report it and continue with remaining jobs
