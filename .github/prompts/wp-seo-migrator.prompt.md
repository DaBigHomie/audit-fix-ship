---
description: "Preserve WordPress SEO equity during Next.js migration: generate 301 redirects, replace Yoast/RankMath with generateMetadata(), produce sitemap.ts, robots.ts, and JSON-LD structured data."
agent: "wp-seo-migrator"
argument-hint: "WordPress site URL and/or path to migration-manifest.json"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/wp-seo-migrator.prompt.md -- do not edit; run sync-agents.mts -->

# WP SEO Migrator

Preserve 100% of your WordPress SEO equity during migration to Next.js. Replaces Yoast/RankMath with native Next.js metadata API, generates complete 301 redirect coverage, and produces sitemap + robots.

## Invoke

```
/wp-seo-migrator {wp-url} [--manifest migration-manifest.json]
```

### Examples

```
/wp-seo-migrator https://example.com

/wp-seo-migrator https://example.com --manifest migration-manifest.json

/wp-seo-migrator https://example.com --generate-redirects-only

/wp-seo-migrator https://example.com --generate-sitemap-only

/wp-seo-migrator https://example.com --validate  (check 0 URLs return 404)
```

## What It Generates

| Output | Replaces |
|--------|---------|
| `next.config.js redirects` | WP permalink structure + all old URLs |
| `app/sitemap.ts` | Yoast SEO sitemap / `sitemap.xml` |
| `app/robots.ts` | WP `robots.txt` |
| `generateMetadata()` per route | Yoast/RankMath meta tags |
| `ArticleJsonLd.tsx` | Yoast JSON-LD structured data |
| `OrganizationJsonLd` | Yoast Local SEO |

## Redirect Patterns Covered

| WP Pattern | Next.js Route |
|-----------|---------------|
| `/{year}/{month}/{day}/{slug}` | `/blog/{slug}` |
| `/{year}/{month}/{slug}` | `/blog/{slug}` |
| `/category/{slug}` | `/blog/category/{slug}` |
| `/tag/{slug}` | `/blog/tag/{slug}` |
| `/author/{slug}` | `/blog?author={slug}` |
| `/?p={id}` | `/blog/{id}` |
| `/wp-admin/*` | `/404` |
| `/feed` | `/rss.xml` |

## Quality Gates

- [ ] 0 indexed URLs return 404
- [ ] `/sitemap.xml` accessible and valid
- [ ] `/robots.txt` accessible
- [ ] All posts have `title` + `description` metadata
- [ ] All posts have OG image
- [ ] JSON-LD validates in Google Rich Results Test
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1

## Rules

- **100% redirect coverage** — every URL in Google's index gets a 301
- **Never 302 permanent content** — permanent moves use 301 only
- **Yoast data is the source** — use `yoast_head_json` from REST API as SEO data baseline
- **OG images must be absolute** — set `metadataBase` in root layout

## Related Agents

- `@wp-migration` — orchestrator; runs this in Phase 5
- `@wp-analyzer` — provides URL structure + indexed URL list
- `@wp-content-pipeline` — provides `modified` dates for sitemap priorities
