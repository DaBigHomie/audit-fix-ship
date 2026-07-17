---
description: "Run a full WordPress to Next.js migration pipeline: analyze, extract content, scaffold routes, generate enhanced components, preserve SEO. Coordinates all 5 specialist wp-* agents."
agent: "wp-migration"
argument-hint: "WordPress site URL or path to WP XML export — e.g. https://example.com or ./export.xml"
---

# WP Migration Orchestrator

Run the full WordPress → Next.js migration pipeline. Coordinates analysis, content extraction, component generation, and SEO preservation in 5 sequential phases.

## Invoke

```
/wp-migration {wp-site-url or path-to-xml}
```

### Examples

```
/wp-migration https://example.com

/wp-migration ./wordpress-export.xml

/wp-migration https://client-site.com --target ./new-nextjs-app

/wp-migration https://example.com --phase 1  (run only analysis)

/wp-migration https://example.com --phase 4  (run only component generation)
```

## Pipeline Phases

| Phase | Agent | What It Does |
|-------|-------|-------------|
| 1 | `@wp-analyzer` | Inventory site → `migration-manifest.json` |
| 2 | `@wp-content-pipeline` | Extract posts/pages/media → MDX + types |
| 3 | `@wp-migration` (routes) | Scaffold App Router structure |
| 4 | `@wp-component-factory` | Generate enhanced Next.js components |
| 5 | `@wp-seo-migrator` | Redirects + sitemap + metadata API |

## What You Get

| Output | Description |
|--------|-------------|
| `migration-manifest.json` | Full inventory of WP site |
| `src/content/posts/*.mdx` | Blog posts as MDX |
| `src/content/pages/*.mdx` | Pages as MDX |
| `src/shared/types/acf-*.ts` | TypeScript interfaces from ACF |
| `src/shared/config/navigation.ts` | Menus as typed NavItem[] |
| `public/images/wp-migrate/` | Downloaded media |
| `app/**` | Full App Router structure |
| `src/shared/ui/Header.tsx` | Enhanced header component |
| `src/shared/ui/Footer.tsx` | Enhanced footer component |
| `src/features/*/` | Feature components per section type |
| `next.config.js redirects` | 301 redirects for all WP URLs |
| `app/sitemap.ts` | Dynamic sitemap |
| `app/robots.ts` | robots.txt |
| `generateMetadata()` | Per-page/post metadata replacing Yoast |

## Rules

- **Analyze first** — Phase 1 must complete before any other phase starts
- **100% redirect coverage** — every indexed URL gets a 301
- **Never 1:1 clone** — every component is enhanced with design-system-god patterns
- **TypeScript strict** — 0 errors before cutover
- **Reduced motion** — all animated components have static fallbacks

## Related Agents

- `@wp-analyzer` — Phase 1: site analysis
- `@wp-content-pipeline` — Phase 2: content extraction
- `@wp-component-factory` — Phase 4: component generation
- `@wp-seo-migrator` — Phase 5: SEO preservation
- `@design-system-god` — enhancement for generated components
