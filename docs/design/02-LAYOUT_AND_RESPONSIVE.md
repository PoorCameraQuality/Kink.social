# Layout & Responsive — C2K

**Purpose:** Rules for breakpoints, page width, grids, and spacing rhythm so feeds, profiles, and dashboards stay readable on phones first.

**When to use:** New routes, refactors of `layout.tsx`, feed sidebars, card grids, and any “should this stack?” decision.

---

## Principles

1. **Mobile first** — Default CSS is narrow; add complexity at `md` / `lg` / `xl`.
2. **Content-defined width** — Main reading columns use max-widths that match line-length targets (~45–75 characters for text-heavy areas).
3. **Macro vs micro** — Viewport media queries for page shell; container queries for components that appear in main column *and* sidebar.
4. **Touch-friendly gutters** — Keep horizontal padding ≥ 16px on small screens.

---

## Specifications

### Breakpoints (Tailwind defaults + usage)

| Name | Min width | Role |
|------|-----------|------|
| (default) | 0 | Single column, bottom nav |
| `sm` | 640px | Optional wider phone / large phone |
| `md` | 768px | Tablet — start secondary columns |
| `lg` | 1024px | Desktop — persistent sidebars |
| `xl` | 1280px | Wide dashboards, three-column shells |
| `2xl` | 1536px | Optional extra breathing room |

**C2K standard for new work:** Design primarily at **375px**, **768px**, and **1280px**, then verify `sm` (640px) and `lg` (1024px).

### Content max-widths

| Context | Max width | Notes |
|---------|-----------|--------|
| Feed / timeline | 640px | Primary reading column |
| Profile | 768px | Banner + tabs |
| Event detail | 768px | Media + meta |
| Settings / forms | 640px | Scan-friendly |
| Admin / moderation | 1280px | Tables + filters |
| Card discovery grids | `minmax(280px, 1fr)` | Responsive auto-fill grid |

**Implementation pattern:**

```tsx
<main className="mx-auto w-full max-w-2xl px-4 md:px-6">
  {/* feed: max-w-2xl = 672px — acceptable if close to 640px doc; prefer max-w-[640px] for strict match */}
</main>
```

Use `max-w-[640px]` when the design doc requires exact alignment with the research spec.

### Page gutters

| Viewport | Horizontal padding |
|----------|-------------------|
| Mobile | `px-4` (16px) |
| Tablet+ | `px-6` (24px) |
| Large desktop | `px-8` (32px) optional |

### Vertical rhythm

- Between major sections: `space-y-6` to `space-y-8` (24–32px).
- Inside cards: `p-4` default; `p-6` for hero cards.

Spacing tokens: [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md).

---

## Patterns

### Two-column shell (home / discovery)

```
Mobile                    Desktop (lg+)
┌──────────────┐         ┌─────────────┬──────────┐
│   Header     │         │   Header (span full) │
├──────────────┤         ├─────────────┼──────────┤
│   Main       │         │ Main 640–768│ Sidebar │
│   max-w      │         │             │ 300px   │
├──────────────┤         └─────────────┴──────────┘
│ Bottom nav   │
└──────────────┘
```

- **Main** scrolls; **sidebar** can be hidden below `lg` or collapsed behind “More in this area”.
- **Bottom nav** reserves vertical space — add safe-area padding (see accessibility doc).

### Responsive grid (events, groups, vendors)

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
```

### Container queries (when to use)

Use when the same card appears in **narrow rail** and **wide main**:

```css
.card-wrap {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}
```

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Test long usernames and wrapping in headers | Assume single-line titles |
| Use `min-h-0` in flex children for scroll areas | Let flex children overflow the viewport blindly |
| Preserve aspect ratio for media (`aspect-video`, fixed ratio) | Cause CLS when images load |

---

## C2K-specific

- **Home** combines feed + sidebar widgets — on mobile, sidebar content becomes stacked sections or tabs, not a second column.
- **Group detail** has many tabs — keep horizontal tab rows scrollable with visible overflow affordance.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md)
- [04-NAVIGATION_AND_IA.md](./04-NAVIGATION_AND_IA.md)
- [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) — Breakpoints, container queries, fluid type
- [DESIGN_SYSTEM_RESEARCH.md](../DESIGN_SYSTEM_RESEARCH.md) — Grids, Carbon reference
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
