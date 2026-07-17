---
description: "Generate elite UI components: cursor-reactive surfaces, magnetic buttons, mesh gradients, text splits, parallax depth, glow borders, 3D WebGL, video backgrounds, scroll-linked effects. Builds on motion-system.ts + KineticText + TactileCard foundation."
agent: "design-system-god"
argument-hint: "Describe the component or effect you want (e.g. 'magnetic CTA button', 'animated mesh gradient hero', 'char-split scroll reveal heading')"
---

# Design System God

Generate elite-tier UI components that demolish Stripe, Linear, Vercel, Raycast, and Craft. Builds on the existing `motion-system.ts`, `KineticText`, `TactileCard`, and `PageEnter` foundation and extends it with advanced physics, WebGL, and animation patterns.

## Invoke

```
/design-system-god {component description}
```

### Examples

```
/design-system-god cursor-reactive 3D card with parallax depth layers

/design-system-god magnetic CTA button with spring snap-back physics

/design-system-god animated mesh gradient hero background — WebGL version

/design-system-god char-split text reveal triggered by ScrollTrigger

/design-system-god glow-border feature card with rotating conic-gradient

/design-system-god Lenis + GSAP scroll provider with ScrollTrigger sync

/design-system-god video background hero with Intersection Observer lazy load

/design-system-god parallax depth section — 3 layers at 0.1x, 0.4x, 0.8x scroll speed
```

## What It Generates

| Request Type | Primary Stack | Output |
|---|---|---|
| Cursor reactive | Framer Motion useMotionValue + useSpring | `CursorReactiveSurface.tsx` |
| Magnetic physics | @use-gesture/react + @react-spring/web | `MagneticButton.tsx` |
| Mesh gradient (CSS) | CSS @property + conic-gradient | `MeshGradientBackground.tsx` |
| Mesh gradient (WebGL) | react-three-fiber + ShaderMaterial | `WebGLMeshGradient.tsx` |
| Text split reveal | GSAP SplitText or Framer stagger | `SplitTextReveal.tsx` |
| Parallax depth | Lenis + GSAP ScrollTrigger scrub | `ParallaxDepth.tsx` |
| Glow border card | CSS @property + conic-gradient | `GlowBorderCard.tsx` |
| Scroll section reveal | GSAP ScrollTrigger.batch | `ScrollRevealSection.tsx` |
| 3D interactive scene | R3F + Drei + React Spring Three | `InteractiveScene.tsx` |
| Video background | `<video>` + IntersectionObserver | `VideoHero.tsx` |
| Smooth scroll provider | Lenis + GSAP ticker sync | `SmoothScrollProvider.tsx` |

## Workflow

### 1. Load Foundation
Reads existing `motion-system.ts`, `KineticText`, `TactileCard`, `PageEnter`, and installed packages.

### 2. Identify Pattern
Maps request to Component Catalog (cursor, magnetic, gradient, text-split, parallax, glow, 3D, video, scroll).

### 3. Generate Component
Produces TypeScript-strict `'use client'` component with:
- `useReducedMotion()` check with static fallback
- GPU-safe properties only (transform + opacity)
- Mobile degradation (`hover: none` media query detection)
- Proper aria attributes

### 4. Extend motion-system.ts
Appends reusable animation constants to `src/shared/lib/motion-system.ts`.

### 5. Output Summary
Returns component code, usage example, performance notes, a11y notes, and motion-system.ts additions.

## Rules

- **Reduced motion always** — every component has a static fallback
- **GPU compositing** — transform + opacity only; use CSS @property for gradient animations
- **TypeScript strict** — no `any`, explicit return types, proper Three.js types
- **Mobile-first** — cursor effects disabled on `(hover: none)` devices
- **Extend foundation** — import from motion-system.ts, don't inline duplicate constants
- **Lenis + GSAP** — always sync Lenis to GSAP ticker when both are used

## Related Agents

- `@ds-animation` — audit motion constants and reduced motion compliance
- `@ds-orchestrator` — run full design system audit across repos
- `@ds-perf` — performance check for new heavy components
- `@ds-a11y` — accessibility audit for generated components
- `@ds-component-patterns` — verify FSD architecture compliance
