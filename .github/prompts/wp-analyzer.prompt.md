---
description: "Analyze a WordPress site and produce a migration manifest: content types, templates, plugins, ACF fields, menus, URL structure."
agent: "wp-analyzer"
argument-hint: "WordPress site URL, local WP path, or path to WXR XML export"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/wp-analyzer.prompt.md -- do not edit; run sync-agents.mts -->

# WP Analyzer

Deep-analyze a WordPress site and produce `migration-manifest.json` — the blueprint for the entire Next.js migration.

## Invoke

```
/wp-analyzer {source}
```

### Examples

```
/wp-analyzer https://example.com

/wp-analyzer /var/www/wordpress

/wp-analyzer ./wordpress-export.xml

/wp-analyzer https://example.com --output ./migration-manifest.json
```

## What It Produces

| Output | Description |
|--------|-------------|
| `migration-manifest.json` | Full site inventory |
| Console report | Risks + plugin dependency map |

### Manifest Includes

- Content counts: posts, pages, CPTs, media
- Template hierarchy map → App Router equivalents
- Plugin → Next.js migration notes
- ACF field group list
- Menu structure
- URL permalink structure
- Risk flags (page builders, WooCommerce, WPML, etc.)

## Rules

- **Run before any other phase** — all downstream agents depend on this manifest
- **Flag all page builders** — Elementor, Divi, WPBakery, Beaver Builder require manual conversion notes
- **Map every URL pattern** — feeds into SEO migrator's redirect generation

## Related Agents

- `@wp-migration` — orchestrator that runs this first
- `@wp-content-pipeline` — consumes the manifest
- `@wp-seo-migrator` — uses URL patterns from manifest
