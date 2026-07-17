---
description: "Generate a 30x image, convert to WebP, deploy to o43, wire into component, verify build, and commit. Use when: new image needed for o43, replacing placeholder, adding hero or empty-state artwork."
agent: "image-gen"
argument-hint: "Job ID to generate (e.g. returns-hero, account-dashboard-hero)"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/image-deploy.prompt.md -- do not edit; run sync-agents.mts -->

# Image Deploy Workflow

You are forked into an **@image-gen** session. Execute the full 30x image pipeline for the given job ID.

## Repo Context

| Repo | Alias | Path |
|------|-------|------|
| `image-gen-30x-cli` | `image-gen` | `~/management-git/image-gen-30x-cli` |
| `one4three-co-next-app` | `043` | `~/management-git/one4three-co-next-app` |

Reference: `~/management-git/image-gen-30x-cli/IMAGE-DEPLOY-WORKFLOW.md`

## Workflow (execute in order)

### 1. Generate

```bash
cd ~/management-git/image-gen-30x-cli
npx tsx src/generate.ts --id $ARGUMENTS
```

Confirm the image was saved. Note the output path from the log.

### 2. Convert JPG → WebP

```bash
mkdir -p ~/management-git/one4three-co-next-app/public/images/{category}
cwebp -q 90 output/images/{path}.jpg \
  -o ~/management-git/one4three-co-next-app/public/images/{path}.webp
```

Verify file size with `ls -lh` — target < 1MB for 2K images.

### 3. Wire into component

Look up the job's `outputPath` in `src/prompts/manifest.ts`. Apply the correct pattern:

- **Hero images** → `HeroBanner` component or inline `<Image>` with gradient overlay
- **Empty states** → `<Image>` inside a centered card with `fill` prop
- **Card backgrounds** → `CollectionHero` or `<Image fill>`

Ask me which component if unclear.

### 4. Verify build

```bash
cd ~/management-git/one4three-co-next-app
npx tsc --noEmit && npm run build
```

Both MUST pass with 0 errors.

### 5. Commit both repos

```bash
cd ~/management-git/one4three-co-next-app
git add -A && git commit -m "feat(images): add 30x {job-id} image — wire into {component}" && git push origin main

cd ~/management-git/image-gen-30x-cli
git add -A && git commit -m "feat(manifest): add {job-id} job" && git push origin main
```

## Critical Rules

1. Always include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer
2. WebP quality: `-q 90` heroes, `-q 85` product, `-q 80` thumbnails
3. FSD folder structure: `public/images/{feature-domain}/` per domain
4. Gemini returns JPEG — ALWAYS convert to WebP before deploying
5. NEVER commit `.jpg` files to o43 — only `.webp`
6. NEVER skip the build verification step
