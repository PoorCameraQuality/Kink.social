# Component Library — C2K

**Purpose:** How we structure, name, and quality-check UI building blocks from primitives through feature modules.

**When to use:** Adding a new component, refactoring `src/components`, or reviewing PRs for consistency and accessibility.

---

## Principles

1. **Composable** — Prefer small pieces that combine; avoid monolithic “god components”.
2. **Accessible by default** — Labels, focus, keyboard support are part of the component, not an afterthought.
3. **State-complete** — Every data-driven component handles loading, empty, error, success, and partial states.
4. **Token-driven** — Colors, radii, and spacing come from the design tokens doc.

---

## Folder hierarchy (target architecture)

```
src/components/
├── primitives/     # Button, Input, Badge, Avatar, IconButton
├── composites/     # PostCard, UserChip, TagPill, MediaGrid
├── features/       # FeedView, GroupChannelPosts, EventRsvp
├── layouts/        # AppShell, FeedLayout, SettingsLayout
├── ui/             # Existing shared UI (Card, TabButton, …)
├── cards/          # Existing cards — migrate toward composites/ over time
└── group/          # Group feature — migrate toward features/group/
```

**Rule:** New work follows the target; legacy folders are acceptable until refactored.

---

## Component tiers

| Tier | Responsibility | Examples |
|------|----------------|----------|
| **Primitives** | No domain knowledge; styling + a11y | Button, TextInput |
| **Composites** | Reusable patterns with light domain props | `PersonCard`, `LocalPostCard` |
| **Features** | Data hooks, mutations, route awareness | `GroupPhotosSection` |
| **Layouts** | Grid/slots for pages | Two-column feed shell |

---

## Compound components

For multi-part UI (dialogs, menus, tables), use a single import namespace and subcomponents:

```tsx
<DataTable.Root>
  <DataTable.Toolbar />
  <DataTable.Content />
</DataTable.Root>
```

**When:** 3+ related sub-regions, optional sections, or shared internal state.

**Alternative:** Headless primitives (Radix) + thin styled wrappers — recommended for menus, dialogs, tabs when we adopt a library.

---

## The five UI states

Every component that fetches or lists data **must** account for:

| State | User need | Pattern |
|-------|-----------|---------|
| **Loading** | Know the app received the action | Skeleton matching layout |
| **Empty** | Know it’s not broken; what to do next | Illustration/icon + copy + CTA |
| **Error** | Recover | Message + retry; preserve context |
| **Success** | Complete the task | Default content |
| **Partial** | “More is coming” | Inline spinner / “Load more” |

### Skeleton guidelines

- Mirror final layout (avatar circle, text bars, media rectangle).
- Shimmer or `animate-pulse`; respect `prefers-reduced-motion`.
- If loading &gt; ~3s, switch to explicit progress or status text.

### Empty state template

```tsx
<section aria-labelledby="empty-title">
  <h2 id="empty-title">No posts yet</h2>
  <p>When your groups and friends post, they’ll show up here.</p>
  <Button>Explore groups</Button>
</section>
```

---

## Forms (component-level rules)

- Every input has a visible `<label>` linked with `htmlFor` / `id`.
- Errors: `aria-invalid`, `aria-describedby`, `role="alert"` on error text.
- Validate on blur first; revalidate on change after first error.

See [DESIGN_SYSTEM_RESEARCH.md](../DESIGN_SYSTEM_RESEARCH.md) for extended patterns.

---

## Component quality checklist

Use in PR description or design review:

- [ ] **States:** loading / empty / error / success / partial covered
- [ ] **A11y:** focus visible, keyboard operable, semantic HTML
- [ ] **Tokens:** no stray hex (except token definitions)
- [ ] **Responsive:** works at 375px and desktop; container query if reused in sidebar
- [ ] **Motion:** respects reduced motion
- [ ] **Content safety:** NSFW media behind warning components when applicable ([05](./05-CONTENT_AND_SAFETY.md))

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Pass `className` for layout-only tweaks at page level | Fork a card for one page with copy-paste |
| Use `children` for flexible regions | Encode every layout variant as a boolean prop |
| Co-locate stories/tests when we add Storybook/Playwright | Leave components without usage docs |

---

## C2K-specific

- Existing cards: `EventCard`, `GroupCard`, `PersonCard`, `LocalPostCard`, `VendorCard`, `EducationCard` — align padding to **16px** and typography to token scale.
- **Trust** visuals (`TrustRing`, `BadgeDisplay`) are composites — don’t embed business logic in primitive icons.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [08-DESIGN_TOKENS.md](./08-DESIGN_TOKENS.md)
- [05-CONTENT_AND_SAFETY.md](./05-CONTENT_AND_SAFETY.md)
- [07-ACCESSIBILITY_AND_PERFORMANCE.md](./07-ACCESSIBILITY_AND_PERFORMANCE.md)
- [DESIGN_SYSTEM_RESEARCH.md](../DESIGN_SYSTEM_RESEARCH.md)
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
