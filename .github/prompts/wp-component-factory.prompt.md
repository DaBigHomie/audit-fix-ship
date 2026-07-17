---
description: "Generate Next.js components from WordPress templates with design-system-god enhancements: Header, Footer, Hero, PostCard, ACF section router, Gutenberg block components."
agent: "wp-component-factory"
argument-hint: "Component type to generate — e.g. 'header', 'hero', 'post-card', 'acf-flexible', 'gutenberg-blocks' or 'all'"
---
<!-- GENERATED FROM maximus-ai/.github/prompts/wp-component-factory.prompt.md -- do not edit; run sync-agents.mts -->

# WP Component Factory

Convert WordPress theme templates, Gutenberg blocks, and page builder sections into production-ready Next.js components — enhanced with design-system-god patterns.

## Invoke

```
/wp-component-factory {component-type} [--enhance]
```

### Examples

```
/wp-component-factory header

/wp-component-factory hero --enhance mesh-gradient cursor-reactive

/wp-component-factory post-card --enhance glow-border scroll-reveal

/wp-component-factory acf-flexible --layouts hero,features,testimonials,cta

/wp-component-factory all --enhance

/wp-component-factory design-tokens  (extract WP theme colors/fonts → Tailwind tokens)
```

## Component Catalog

| Type | Source | Enhancement |
|------|--------|-------------|
| `header` | `header.php` | Glassmorphism scroll trigger |
| `footer` | `footer.php` | Fade-in scroll reveal |
| `hero` | `front-page.php` or Elementor | Mesh gradient + magnetic CTA |
| `post-card` | WP loop | TactileCard + glow border |
| `post-grid` | `archive.php` | Stagger scroll reveal |
| `blog-post` | `single.php` | KineticText title + parallax hero |
| `acf-flexible` | ACF Flexible Content | Per-layout section router |
| `page-builder` | Elementor/Divi | Manual conversion with enhancements |
| `design-tokens` | `theme.json` / `style.css` | Tailwind config additions |

## Rules

- **Never 1:1 clone** — every component gets at least one enhancement
- **Design tokens first** — WP colors/fonts → Tailwind tokens before any component
- **TypeScript strict** — PHP template variables → typed React props
- **Reduced motion** — every animated component has a static fallback
- **Images** — all `<img>` → `next/image` with proper `width`, `height`, `alt`

## Related Agents

- `@wp-migration` — orchestrator; runs this in Phase 4
- `@design-system-god` — for advanced animation effects
- `@wp-analyzer` — provides template list + ACF field groups
- `@ds-a11y` — audit generated components
