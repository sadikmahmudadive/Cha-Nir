# Cha Nir Design System: Master

> Source of truth for the implemented UI. Tokens live in `src/app/globals.css`; motion in `src/lib/motion.ts`.
> The live reference is the `/design-system` route.

**Note on provenance.** The ui-ux-pro-max search suggested a "Liquid Glass / dark + gold / Cormorant + Montserrat" direction for generic luxury e-commerce. The Cha Nir brief and logo take precedence, so that output was **not** used. Retained from the skill: accessibility minimums (4.5:1 contrast, 44px targets, visible focus), SVG icons only, reduced-motion support, one-time scroll reveals, server components by default, `next/image`, lazy 3D, dispose-friendly Three.js setup.

## Direction
Organic minimalism with editorial typography. Forest green + fresh lime on warm cream. Large imagery, restrained shadows, generous whitespace, no decorative clutter. Glass effects are not used; only small overlays (toast, 3D controls) use a translucent cream.

## Colour
| Token | Hex | Use |
|---|---|---|
| `--color-tea-600` | `#536D3B` | Primary actions, links (5.7:1 on white) |
| `--color-tea-700/800/900/950` | `#435830 / #344524 / #232F19 / #182011` | Hover, headlines, dark sections |
| `--color-tea-100` | `#E9EEDB` | Muted sage surfaces, chips |
| `--color-lime-500` | `#A5BE16` | Accent and highlights. **Never body text on light** |
| `--color-cream` | `#F7F4E9` | Page background |
| `--color-paper` | `#FFFDF7` | Cards, inputs |
| `--color-ink` | `#302A23` | Body text |
| `--color-ink-soft / -mute` | `#564D43 / #6B6054` | Secondary text (>= 5:1 on cream) |
| `--color-danger / warn / success / info` | `#B3261E / #8A5A00 / #2F6B3A / #285B7A` | Status, each with a `-bg` tint |

Lime buttons use `--color-tea-950` text (7.4:1). On dark green sections use cream text and lime-300 accents.

## Typography
- Headlines: **DM Serif Display** (normal + italic), fluid `clamp()` scale: `.t-display .t-h1 .t-h2 .t-h3`
- Body / UI / forms: **Manrope**, 16px base, 1.6 line height
- Eyebrow labels: 12px, 700, +0.16em tracking, uppercase

## Spacing, radius, shadow
- Spacing on a 4px grid; section padding `clamp(3.5rem, 7vw, 7rem)`; page gutter 16 / 32 / 48px
- Radius: 6 / 10 / 14 / **20 (cards)** / 28 (large panels); buttons and chips are pill-shaped
- Shadows: `shadow-soft` (resting), `shadow-lift` (overlays), `shadow-drawer`

## Motion
- Easing `cubic-bezier(.22, 1, .36, 1)`; durations 150 / 300 / 600 ms; exits faster than enters
- Only transform + opacity (height for accordions)
- Reveals use `whileInView` with `once`; stagger 70 ms
- `MotionConfig reducedMotion="user"` + CSS `prefers-reduced-motion` guard
- 3D: only the hero tin sway, a few drifting leaves and the scroll-driven journey camera; all pause off-screen

## Components
Button (primary / accent / secondary / ghost / light / danger, loading + disabled), Field (Input, Textarea, Select, Checkbox, RadioCard with label / hint / error), Sheet (dialog + drawers with focus trap), Accordion, Badge / StatusBadge, Price, Rating (verified only), QuantityStepper, Alert, EmptyState, Skeleton, Breadcrumbs, SectionHeading, ProductCard, Cart drawer.

## Rules of thumb
1. Product imagery and shopping controls outrank decoration.
2. Never invent certifications, reviews, prices or delivery promises; use labelled placeholders.
3. Every interactive element >= 44px, visible focus ring (3px lime), labelled.
4. 3D is an enhancement: static fallback always present, no layout shift, never blocks commerce.
