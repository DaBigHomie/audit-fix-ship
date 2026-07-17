---
description: "Add a new ImageJob to the 30x manifest with proper scene composition, validate, and optionally generate. Use when: planning new images, defining visual assets, expanding the manifest."
agent: "image-gen"
argument-hint: "Describe the image (e.g. 'hero for FAQ page, 16:9, navy tee flat-lay on marble')"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/add-image-job.prompt.md -- do not edit; run sync-agents.mts -->

# Add Image Job

You are forked into an **@image-gen** session. Create a new `ImageJob` entry from the user's description.

## Repo Context

| Repo | Path |
|------|------|
| `image-gen-30x-cli` | `~/management-git/image-gen-30x-cli` |

Reference: `~/management-git/image-gen-30x-cli/docs/AGENT_DOCS.md`

## Workflow

### 1. Determine job parameters

Map the description to `ImageJob` fields:

| Field | How to determine |
|-------|-----------------|
| `id` | kebab-case slug from description |
| `category` | `heroes`/`products`/`story`/`bigmen`/`categories`/`accessories`/`social`/`collections`/`gallery` |
| `outputPath` | `{fsd-folder}/{filename}.webp` — match o43 target |
| `aspectRatio` | `16:9` heroes, `4:3` cards, `1:1` social, `9:16` mobile, `3:4` PDP |
| `imageSize` | `2K` default, `1K` small, `4K` premium |
| `scene` | `{ subject, pose, setting, lighting, cameraAngle }` — photographic specificity |
| `logoPlacement` | `{ logo, position, colorway, technique }` — where 143 appears |
| `negativePrompt` | Minimum 3 job-specific negatives |

### 2. Add to manifest

Insert into the correct category array in `src/prompts/manifest.ts`.

### 3. Validate

```bash
cd ~/management-git/image-gen-30x-cli
npx tsc --noEmit
npm run validate
```

All jobs must score ≥ 80.

### 4. Ask to generate

Report: "Job added and validated (score: N). Generate now or later?"

If now → `npx tsx src/generate.ts --id {job-id}`

## Scene Writing Rules

- **subject**: Specific demographics matching ONE4THREE brand (African American lifestyle, Atlanta aesthetic)
- **lighting**: Direction + quality + color temperature (e.g. "Warm golden-hour key from camera-left, soft fill bounce")
- **cameraAngle**: Lens + angle + DOF (e.g. "85mm at eye-level, f/2.8 shallow depth")
- **negativePrompt**: Always include `text`, `watermark`, `blurry`, `distorted hands`, plus 3+ job-specific
- **mood**: 3–5 keywords matching brand tone (warm, aspirational, intimate, editorial)

## Critical Rules

1. Check existing IDs in manifest — NEVER duplicate
2. Priority: Heroes = 1, Products = 2, Social = 3, everything else = 4–5
3. Logo `colorway` must be fabric-appropriate contrast — never assume defaults
4. Use the exact `ImageJob` type from `src/config/types.ts`
