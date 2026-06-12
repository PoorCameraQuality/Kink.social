---
name: design-web-masterclass
description: >-
  Produces non-template, mobile-first web UI (layout, color, typography, motion,
  accessibility). Use when building or reviewing marketing sites, web apps,
  responsive CSS, landing pages, or when the user wants polished web design that
  avoids generic AI aesthetics.
---

# Web design masterclass (desktop + mobile-first)

Read [reference.md](reference.md) for the full guide: breakpoints, bento/editorial layouts, 60-30-10 color, type pairing, spacing scale, animation tokens, shadows, reduced motion, and ship checklist.

## Apply first

- **Mobile-first**: design at ~360px, then add complexity at content-driven breakpoints (not device names).
- **Avoid template tropes**: three equal cards, centered-everything heroes, purple gradients on white, stock-photo heroes.
- **Touch**: minimum 44×44px targets; body text ≥16px on mobile (iOS zoom).
- **Motion**: keep UI transitions under 300ms; animate only `transform` and `opacity`; honor `prefers-reduced-motion`.
- **A11y**: WCAG AA contrast; never color-only meaning; focus visible.

## When detail is needed

Open `reference.md` before large layout or palette decisions—sections on layout vocabulary, palette recipes, typography scale, micro-interactions, and modern CSS (`clamp`, container queries) are authoritative for this repo.
