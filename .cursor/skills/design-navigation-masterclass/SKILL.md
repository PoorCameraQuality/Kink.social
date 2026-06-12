---
name: design-navigation-masterclass
description: >-
  Deep-dive navigation for websites: header/nav anatomy, mobile drawer and
  overlay, mega menus, dropdowns, sticky scroll-aware bars, breadcrumbs, sidebars,
  page tabs, pagination, footer nav, command palette, skip links, scroll
  progress, accessibility, and common AI mistakes. Use when building or auditing
  site navigation, menus, or routing UI.
---

# Navigation components masterclass

Read [reference.md](reference.md) for full patterns, semantic HTML, keyboard behavior, responsive rules, animation timing, and anti-patterns.

## Apply first

- **Structure**: brand (home) → primary links (few, clear) → actions (search, CTA, account). Unique `aria-label` on every `<nav>`.
- **Mobile**: hamburger is not enough—provide focus trap, escape to close, visible focus, and a touch alternative to hover-only menus.
- **Keyboard**: predictable Tab order; arrow keys in menus where applicable; Escape closes overlays.
- **Multiple nav regions**: label each (`Primary`, `Footer`, `Breadcrumb`, etc.).

## When detail is needed

Open `reference.md` for section-by-section specs (mega menu, dropdown, command palette, skip link, pagination, footer columns) and the accessibility rules that apply to all navigation.
