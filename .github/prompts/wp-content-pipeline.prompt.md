---
description: "Extract WordPress content to Next.js formats: posts to MDX, pages to routes, media to public/, ACF to TypeScript types, menus to nav config, taxonomies to JSON."
agent: "wp-content-pipeline"
argument-hint: "Source (URL, local WP path, or XML) and output directory — e.g. https://example.com --output src/content"
---

# WP Content Pipeline

Extract all WordPress content and transform it into Next.js-ready formats: MDX files, TypeScript types, media assets, and navigation config.

## Invoke

```
/wp-content-pipeline {source} --output {directory}
```

### Examples

```
/wp-content-pipeline https://example.com --output src/content

/wp-content-pipeline ./export.xml --output src/content

/wp-content-pipeline https://example.com --type posts --output src/content/posts

/wp-content-pipeline https://example.com --type media --output public/images/wp-migrate
```

## What It Produces

| Output | Description |
|--------|-------------|
| `src/content/posts/{slug}.mdx` | Posts with frontmatter |
| `src/content/pages/{slug}.mdx` | Pages with frontmatter |
| `src/content/cpt/{type}/{slug}.mdx` | Custom post type content |
| `src/shared/types/acf-{group}.ts` | TypeScript interfaces from ACF |
| `src/shared/config/navigation.ts` | Menus as NavItem[] |
| `src/shared/config/taxonomies.ts` | Categories + tags |
| `public/images/wp-migrate/` | Downloaded media |
| `media-inventory.json` | Full media manifest |

## Rules

- **Sanitize HTML** — all WP content HTML goes through DOMPurify before MDX
- **Preserve alt text** — every image retains its WP alt attribute
- **Flag shortcodes** — unknown `[shortcodes]` get `<!-- TODO -->` comments
- **Page builders** — Elementor/Divi content flagged for manual conversion

## Related Agents

- `@wp-migration` — orchestrator; runs this in Phase 2
- `@wp-analyzer` — must run first to produce the manifest this reads
- `@wp-component-factory` — consumes MDX to determine component structure
