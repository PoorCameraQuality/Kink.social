---
name: design-cards-masterclass
description: >-
  Card UI vocabulary: anatomy, base styles, variants (media, horizontal,
  compact), grids, hover, links vs buttons, and accessibility. Use when building
  or refactoring cards, product grids, blog lists, or any card-based layout.
---

# Card components masterclass

Read [reference.md](reference.md) for card types, CSS, responsive grids, focus/hover rules, and mistakes to avoid.

## Apply first

- **Structure**: optional media → metadata/eyebrow → title (required) → description → actions → optional footer meta.
- **Whole-card links**: one primary link target; avoid nested interactive elements; keyboard and screen reader behavior per reference.
- **Performance**: sensible aspect ratios, lazy media, avoid heavy shadows on long lists.
- **Differentiate**: not every card is “image top + title + button”—use the variant that fits content density and hierarchy.

## When detail is needed

Use `reference.md` for full examples and the card checklist.
