# Navigation & Information Architecture — C2K

**Purpose:** Where features live, how users move between them on mobile vs desktop, and how settings/onboarding are grouped.

**When to use:** New routes, header/footer/bottom nav changes, settings screens, and feature discoverability reviews.

---

## Principles

1. **Five primary destinations max** on mobile bottom navigation — cognitive limit + thumb reach.
2. **Match mental models** — “Home” is the feed; “Explore” is search/discovery; “Profile” is identity and account entry.
3. **Progressive disclosure** — Advanced and rare tasks live in settings or overflow menus.
4. **Stable wayfinding** — Same icon + label pairing everywhere (see a11y doc).

---

## Primary navigation (mobile)

**Bottom bar (canonical):**

| # | Label | Route / behavior |
|---|--------|------------------|
| 1 | Home | `/home` — main feed |
| 2 | Find people | `/discovery` — member search |
| 3 | Create | Opens create flow (post / event / group per product) |
| 4 | Messages | `/messaging` |
| 5 | Profile | `/profile` |

**Rules:**

- **Icon + text label** on each item (not icon-only).
- **Active state:** color + weight change (`text-c2k-accent-primary`, `font-semibold`).
- **Tap current tab:** scroll to top / reset sub-navigation where applicable.
- Reserve **safe area** bottom padding for notched devices (`pb-safe` / env(safe-area-inset-bottom) — implement in `BottomNav`).

---

## Community nav (signed-in, global)

**Component:** `CommunityNavBar` — rendered in `RootLayout` directly under `Header` (sticky).

| Zone | Content |
|------|---------|
| Feed | **Following** · **Near you** (`/home?mode=following` · `?mode=discover&tab=Local`) |
| Browse | Events · Conventions · People · Groups · Vendors · Education · Trending · Find people |

**Rules:**

- One persistent strip — no per-page “back to home tabs” for browse.
- Active browse item from `resolveCommunityNavState()` (`community-nav.ts`): home query `tab=` or routes like `/events`, `/conventions`.
- Discover **content** (grids, feeds) still mounts in `HomePageClient` for `/home?mode=discover&tab=…`; standalone `/events` etc. reuse highlight only until consolidated (see [`PROJECT_ROADMAP.md`](../PROJECT_ROADMAP.md) Track B2).

---

## Header (global)

**Typical elements:**

- Logo → home or landing
- **Search** entry (opens discovery or search overlay)
- **Create** shortcut (duplicate of bottom Create is acceptable on desktop)
- **Notifications** → `/notifications`
- **Messages** quick link (optional duplicate when bottom nav hidden on desktop)
- **Profile** menu (account, settings, log out)

**Desktop:** Bottom nav may be **hidden**; header carries primary links or a compact top tab row for the current section.

---

## Information architecture map

```
C2K (high level)
├── Home (feed)
├── Discovery (people, events, vendors, groups, tags)
├── Events (/events, /events/[id])
├── Groups (/groups, /groups/[id])
├── Vendors (/vendors, /vendors/[id])
├── Education (/education, /education/[slug])
├── Profile (/profile, /profile/edit, /profile/[username])
├── Messaging (/messaging)
├── Notifications (/notifications)
├── Settings (/settings)
├── Onboarding (/onboarding)
├── Places (/places)
├── Tags (/tags/[tag])
└── Static / policy (about, privacy, terms, guidelines, accessibility, support)
```

**Resolved:** `/connections` exists (`app/connections/page.tsx`) and is API-backed when `USE_DATABASE=true`. **`site.config.ts`** `navPublic` / `navPrimary` / `navMore` / `navSecondary` are wired into **`Header`** (mobile hamburger + logged-out explore row) and **`Footer`**; **`bottomNav`** drives **`BottomNav`** ([FEATURE_REGISTRY.md](../FEATURE_REGISTRY.md) §1, §3).

---

## Secondary navigation patterns

### Horizontal tabs (within a page)

- Used for **Home** feed streams, **Group** detail sections, **Profile** tabs.
- **Mobile:** scrollable row; show partial next tab to hint scroll.
- **Keyboard:** roving tabindex or arrow keys when using composite widgets.

### URL-synced tabs

- Prefer `?tab=` (already used) for shareable state — see `useTabFromUrl`.

### Overflow / “More”

- Use for **destructive** or **admin** actions: report, block, leave group, delete post.

---

## Settings IA (recommended)

Group by **task**, not engineering domain:

```
Settings
├── Account (email, password, username, delete)
├── Profile (bio, photos, roles, interests)
├── Privacy & safety (visibility, DMs, blocks, filters, data download)
├── Notifications (push, email, per-feature toggles)
├── Appearance (theme, density, language)
└── Connected apps / integrations (future)
```

---

## Page transitions

- **Default:** short fade or instant (respect reduced motion).
- **Modals:** focus trap + return focus to trigger on close ([07](./07-ACCESSIBILITY_AND_PERFORMANCE.md)).

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Keep primary nav to 3–5 items on mobile | Add a 6th primary tab without removing/replacing |
| Mirror important actions in header on desktop | Hide critical flows only behind hamburger on mobile |
| Link footer legal pages from a single consistent footer | Ship placeholder routes without “coming soon” clarity |

---

## C2K-specific

- **Create flow** lives in `CreateFlowModal` from root layout — new create types should extend this pattern rather than one-off full-page wizards unless complexity demands it.
- **Feed** redirect: `/feed` → `/home?tab=local` — preserve this contract in analytics and deep links.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [02-LAYOUT_AND_RESPONSIVE.md](./02-LAYOUT_AND_RESPONSIVE.md)
- [06-PRIVACY_AND_TRUST.md](./06-PRIVACY_AND_TRUST.md)
- [`src/config/site.config.ts`](../../src/config/site.config.ts)
- [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) — Bottom nav patterns
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
