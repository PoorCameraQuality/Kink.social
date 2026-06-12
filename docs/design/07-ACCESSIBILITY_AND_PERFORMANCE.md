# Accessibility & Performance — C2K

**Purpose:** Ensure everyone can use C2K with keyboard, screen readers, and assistive tech — and that the app *feels* fast on real networks and devices.

**When to use:** Every feature PR; modals; feeds; forms; animations; image loading; and mobile safe areas.

---

## Principles

1. **WCAG 2.2 AA** is the baseline for new work (AAA where cheap).
2. **Keyboard parity** — If you can click it, you can reach it with Tab/Arrow and operate it with Enter/Space.
3. **Performance is UX** — Skeletons, lazy loading, and stable layouts prevent frustration.
4. **Respect user preferences** — `prefers-reduced-motion`, contrast, font size.

---

## Accessibility specifications

### Touch targets

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Interactive target | 24×24px (WCAG 2.2 min) | **44×44px** (Apple/Material comfort) |
| Spacing between targets | 8px | 8–12px |

### Focus

- Global focus style is defined in `globals.css` (`outline-c2k-accent-primary`).
- **Modals/menus:** trap focus; **Escape** closes; return focus to opener.
- **Sticky headers:** ensure focused items aren’t obscured — `scroll-margin-top` / `scroll-padding-top` ([DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md)).

### Forms

- Visible labels; `aria-invalid`, `aria-describedby` for errors; announce errors with `role="alert"` where appropriate.

### Images

- Meaningful `alt` text; decorative images `alt=""`.
- **Sensitive images:** don’t expose graphic alt before reveal ([05](./05-CONTENT_AND_SAFETY.md)).

### Dynamic updates

- Toasts: `aria-live="polite"` for non-critical, `assertive` sparingly.
- Feed updates: prefer banner (“New posts”) over silent DOM injection.

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Don’t** remove all feedback — replace with opacity/color changes.

### Safe area (mobile)

- Bottom navigation must include padding for `env(safe-area-inset-bottom)`.
- Define utility (e.g. `pb-[max(1rem,env(safe-area-inset-bottom))]`) — `safe-area-pb` was referenced in audit as undefined; **implement** alongside BottomNav.

---

## WCAG 2.2 checklist (short)

- [ ] **1.3.1** Info and relationships — semantic headings/landmarks
- [ ] **2.4.7** Focus visible
- [ ] **2.4.11** Focus not obscured (minimum)
- [ ] **2.5.8** Target size (minimum)
- [ ] **3.3.1** Error identification
- [ ] **3.3.2** Labels or instructions
- [ ] **4.1.2** Name, role, value for custom components

Use automated checks (axe, Lighthouse) + manual keyboard pass.

---

## Performance specifications

### Core Web Vitals (targets)

| Metric | Target |
|--------|--------|
| LCP | &lt; 2.5s |
| INP | &lt; 200ms (good) |
| CLS | &lt; 0.1 |

### Patterns

- **Images:** `next/image` where possible; explicit `width`/`height` or aspect box.
- **Code splitting:** route-level dynamic import for heavy modals/admin.
- **Lists:** virtualize very long feeds (e.g. `react-virtuoso`) when profiling shows jank.
- **Data fetching:** skeleton UI; avoid layout shift when content arrives.
- **Prefetch:** Next.js `Link` prefetch for likely navigations.

### Optimistic UI

Use when API is reliable and fast; always handle rollback + user-visible error.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Provide “Load more” as alternative to infinite scroll | Rely on hover-only affordances on touch devices |
| Log actionable a11y issues in QA | Silently `catch` errors without user feedback |
| Test with keyboard only for 5 minutes per feature | Add animation &gt; 500ms for routine transitions |

---

## C2K-specific

- **Audit gaps:** modal focus trap, form labels, `no-img-element` warnings — close these as we touch files.
- **Notifications / messaging** placeholders should still use semantic structure (lists, headings) to avoid rework.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [05-CONTENT_AND_SAFETY.md](./05-CONTENT_AND_SAFETY.md)
- [03-COMPONENT_LIBRARY.md](./03-COMPONENT_LIBRARY.md)
- [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md) — Motion tokens
- [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md)
- [HANDOFF-UI-UX-STYLING-AUDIT.md](../HANDOFF-UI-UX-STYLING-AUDIT.md)
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
