# Design System Architecture & Component Best Practices — Research Summary

> **Archive / evidence only.** C2K normative specs → [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md) + [design/03](./design/03-COMPONENT_LIBRARY.md) + [design/08](./design/08-DESIGN_TOKENS.md).

**Date:** March 2026  
**Scope:** Modern design system patterns for web applications, with emphasis on social media platforms  
**Sources:** Material Design 3, Apple HIG, Spectrum (Adobe), Polaris (Shopify), Carbon (IBM), Radix UI / shadcn/ui, Tailwind CSS v4, industry publications (2025–2026)

---

## Table of Contents

1. [Component Design Patterns](#1-component-design-patterns)
2. [Design Tokens](#2-design-tokens)
3. [Layout Systems](#3-layout-systems)
4. [Form Design](#4-form-design)
5. [Content Display Patterns](#5-content-display-patterns)
6. [State Management in UI](#6-state-management-in-ui)
7. [Information Architecture](#7-information-architecture)
8. [Iconography & Visual Assets](#8-iconography--visual-assets)
9. [Data-Dense Interfaces](#9-data-dense-interfaces)
10. [Real-Time UI Patterns](#10-real-time-ui-patterns)
11. [Actionable Guidelines for C2K](#11-actionable-guidelines-for-c2k)

---

## 1. Component Design Patterns

### 1.1 Evolved Atomic Design (2025–2026)

Brad Frost's original five-layer model (atoms → molecules → organisms → templates → pages) has evolved into a more flexible **intent-based architecture**. The rigid classification debates ("is this a molecule or organism?") have been replaced by three pragmatic questions:

| Question | Categories |
|----------|-----------|
| **What does it DO?** | Layout, Feedback, Navigation, Display, Action |
| **How much logic does it contain?** | Self-contained, Controlled, Pure-presentational |
| **Where does it live in the dependency tree?** | Feature, Composite, Domain-specific |

**Recommended layer structure for C2K:**

```
primitives/       → Button, Input, Badge, Avatar, Icon (zero business logic)
composites/       → PostCard, UserChip, TagList, MediaGallery (combine primitives)
features/         → FeedView, ProfileEditor, EventCreator (domain + state)
layouts/          → FeedLayout, SettingsLayout, DashboardLayout (page shells)
pages/            → Assembled routes (Next.js page.tsx files)
```

### 1.2 Compound Components

The pattern central to Radix UI and shadcn/ui. Instead of a monolithic `<DataTable rows={...} sortable onSort={...} filterable />`, responsibility is distributed across cooperating sub-components sharing state via React Context:

```tsx
<DataTable.Root data={rows}>
  <DataTable.Toolbar>
    <DataTable.Search />
    <DataTable.Filter />
  </DataTable.Toolbar>
  <DataTable.Content>
    <DataTable.Header />
    <DataTable.Body />
  </DataTable.Content>
  <DataTable.Pagination />
</DataTable.Root>
```

**Benefits:**
- Zero prop-drilling — each sub-component manages its own slice
- Cleaner APIs — intuitive, readable JSX trees
- Independent styling — style each part without override wars
- Composability — mix, match, and omit pieces freely

### 1.3 Slot Pattern & `asChild`

Radix UI's `Slot` component + `asChild` prop allows rendering a custom element while preserving all parent behavior (styles, event handlers, ARIA attributes):

```tsx
// Without asChild: renders default <button>
<Button>Click me</Button>

// With asChild: renders your <a> with Button's styles + behavior
<Button asChild>
  <a href="/events">Browse Events</a>
</Button>
```

This avoids invalid HTML nesting, provides semantic control, and maintains accessibility.

### 1.4 Composition Patterns Summary

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Compound** | Complex multi-part components | Dialog, DropdownMenu, Accordion |
| **Slot / asChild** | Polymorphic rendering | Button-as-link, Trigger-as-custom-element |
| **Render Props** | Dynamic child behavior | Virtualized lists, animation wrappers |
| **Higher-Order** | Cross-cutting concerns | withAuth, withErrorBoundary |
| **Hooks** | Shared stateful logic | useMediaQuery, useIntersection |

---

## 2. Design Tokens

### 2.1 Three-Tier Token Architecture

All major design systems (Material, Polaris, Carbon, Spectrum) converge on a **three-tier hierarchy**:

```
┌─────────────────────────────────────────────────┐
│ Layer 1: PRIMITIVES (Global/Core)               │
│ Raw values with no semantic meaning             │
│ e.g. blue-500 = #0066cc, space-4 = 16px        │
├─────────────────────────────────────────────────┤
│ Layer 2: SEMANTIC (Aliases)                     │
│ Purpose-driven mappings                         │
│ e.g. color-primary = blue-500                   │
│      color-error = red-500                      │
│      spacing-card-padding = space-4             │
├─────────────────────────────────────────────────┤
│ Layer 3: COMPONENT (Scoped)                     │
│ Context-specific values per component           │
│ e.g. button-bg = color-primary                  │
│      input-border-color = color-border          │
└─────────────────────────────────────────────────┘
```

### 2.2 Token Categories

| Category | Tokens | Notes |
|----------|--------|-------|
| **Color** | Brand, UI surfaces, semantic (success/warning/error/info), interactive states | Use OKLCH for perceptual uniformity (Tailwind v4 default) |
| **Spacing** | 4px base scale: 0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px), 16(64px) | Polaris uses space-100=4px through space-3200=128px |
| **Typography** | Font family, size scale, weight, line-height, letter-spacing | Carbon: 12/14/16/20/24/28/32/42/54/76px |
| **Border** | Width (1px, 2px), style, radius scale (none/sm/md/lg/full) | Spectrum: 0/4/8/12/16px radius scale |
| **Shadow/Elevation** | 3–5 levels from subtle to dramatic | Material: 0–5 elevation levels |
| **Motion** | Duration (instant/fast/normal/slow), easing curves | fast=100ms, normal=200ms, slow=300ms, ease-out for enters |
| **Z-index** | Layered scale: base(0), dropdown(100), sticky(200), modal(300), popover(400), toast(500) | Prevents arbitrary z-index wars |
| **Opacity** | disabled(0.5), hover-overlay(0.08), pressed-overlay(0.12) | Used for interactive state layers |

### 2.3 Naming Conventions

**Best practice format:** `--{category}-{property}-{variant}-{state}`

```css
/* Primitives */
--color-gray-50: oklch(97% 0 0);
--color-gray-900: oklch(15% 0 0);
--color-teal-500: oklch(65% 0.15 180);

/* Semantic */
--color-bg-primary: var(--color-gray-900);
--color-bg-card: var(--color-gray-800);
--color-bg-elevated: var(--color-gray-700);
--color-text-primary: var(--color-gray-50);
--color-text-muted: var(--color-gray-400);
--color-accent: var(--color-teal-500);
--color-error: var(--color-red-500);
--color-success: var(--color-green-500);

/* Component */
--button-bg: var(--color-accent);
--button-bg-hover: var(--color-teal-400);
--input-border: var(--color-gray-600);
--input-border-focus: var(--color-accent);
--card-bg: var(--color-bg-card);
--card-border: var(--color-gray-700);
```

### 2.4 Multi-Theme Support

Themes work by **remapping semantic tokens** without changing components:

```css
/* Dark theme (C2K default) */
:root {
  --color-bg-primary: oklch(10% 0 0);
  --color-text-primary: oklch(95% 0 0);
  --color-accent: oklch(65% 0.15 180);
}

/* Light theme (future) */
[data-theme="light"] {
  --color-bg-primary: oklch(98% 0 0);
  --color-text-primary: oklch(15% 0 0);
  --color-accent: oklch(50% 0.18 180);
}

/* High-contrast accessibility */
[data-theme="high-contrast"] {
  --color-bg-primary: oklch(0% 0 0);
  --color-text-primary: oklch(100% 0 0);
  --color-accent: oklch(75% 0.2 180);
}
```

### 2.5 Tailwind CSS v4 Integration

Tailwind v4 uses a CSS-first `@theme` directive — the single source of truth:

```css
@theme {
  --color-c2k-bg: oklch(10% 0 0);
  --color-c2k-card: oklch(15% 0 0);
  --color-c2k-accent: oklch(65% 0.15 180);
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --font-display: 'Inter', sans-serif;
}
```

---

## 3. Layout Systems

### 3.1 Spacing Scale

The **4px base unit** is the industry standard (Material, Polaris, Spectrum, Carbon all use it):

| Token | Value | Common Use |
|-------|-------|-----------|
| `space-0` | 0px | Reset |
| `space-0.5` | 2px | Hairline gaps, icon-to-text |
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Default inline spacing, icon gaps |
| `space-3` | 12px | Compact padding |
| `space-4` | 16px | Standard padding, card insets |
| `space-5` | 20px | Comfortable padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Page section margins |
| `space-12` | 48px | Major section dividers |
| `space-16` | 64px | Page top/bottom margins |
| `space-20` | 80px | Hero spacing |
| `space-24` | 96px | Landmark spacing |

### 3.2 Container & Content Width Strategy

For a social platform like C2K, content areas need distinct max-widths:

| Context | Max Width | Rationale |
|---------|-----------|-----------|
| **Feed / Timeline** | 640px (sm) | Optimal reading width for text-heavy content |
| **Profile Page** | 768px (md) | Room for banner + info + tabs |
| **Event Detail** | 768px (md) | Image + details + sidebar info |
| **Settings** | 640px (sm) | Form-centric, narrow for scannability |
| **Admin / Dashboard** | 1280px (xl) | Data tables need horizontal space |
| **Gallery / Grid** | 1024px (lg) | Multi-column image grid |
| **Full-bleed** | 100% | Landing pages, hero sections |

**Implementation pattern:**

```tsx
<div className="mx-auto w-full max-w-[640px] px-4">
  {/* Feed content */}
</div>
```

### 3.3 Container Queries

Container queries allow components to adapt to their container's width rather than the viewport — essential for components that appear in both main content and sidebars:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 450px) {
  .post-card {
    flex-direction: row;  /* horizontal layout when space allows */
  }
}

@container (max-width: 449px) {
  .post-card {
    flex-direction: column;  /* stacked layout in narrow containers */
  }
}
```

**Browser support:** Chrome 105+, Safari 16+, Firefox 110+, Edge 105+ — safe for production.

### 3.4 Grid Patterns

| Pattern | Implementation | Use Case |
|---------|---------------|----------|
| **Single column** | `max-w-2xl mx-auto` | Feed, settings |
| **Sidebar + Main** | `grid grid-cols-[240px_1fr]` | Dashboard, admin |
| **Three-column** | `grid grid-cols-[240px_1fr_300px]` | Social feed with sidebar panels |
| **Responsive grid** | `grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` | Card grids (events, groups) |
| **Masonry** | CSS `columns` or JS masonry lib | Photo galleries |

### 3.5 Reference: IBM Carbon 2x Grid

Carbon's 16-column grid with 5 breakpoints is a strong reference for complex layouts:

| Breakpoint | Width | Columns | Margin | Gutter |
|-----------|-------|---------|--------|--------|
| sm | 320px | 4 | 16px | 16px |
| md | 672px | 8 | 16px | 16px |
| lg | 1056px | 16 | 16px | 16px |
| xl | 1312px | 16 | 16px | 16px |
| 2xl | 1584px | 16 | 24px | 16px |

---

## 4. Form Design

### 4.1 Input Patterns

**Anatomy of a well-designed input:**

```
[Label]                          [Optional badge]
┌──────────────────────────────────────────────┐
│ [Icon]  Placeholder text                     │
└──────────────────────────────────────────────┘
[Helper text / character count]
[Error message when invalid]
```

**Key rules:**
- Always use visible `<label>` elements (never placeholder-only)
- Use `for` attribute on labels matched to input `id`
- Group related fields with `<fieldset>` + `<legend>`
- Use semantic input types (`email`, `tel`, `url`, `date`) for mobile UX + native validation
- Add `autocomplete` attributes for autofill support
- Provide visible focus indicators (min 3:1 contrast ratio per WCAG 2.2)

### 4.2 Validation & Error States

**Timing strategy:**
1. **On blur** — Validate when user leaves a field (first pass)
2. **On change** — Re-validate in real-time after an error has been shown
3. **On submit** — Final validation for the entire form; scroll to first error

**Error display rules:**
- Position errors directly below the relevant field
- Use `aria-invalid="true"` on the input
- Link error text via `aria-describedby`
- Use `aria-live="polite"` for dynamic error announcements
- Write specific, actionable messages: "Password must be at least 8 characters" not "Invalid input"
- Use color + icon (not color alone) for error indication

```tsx
<div className="space-y-1.5">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : "email-hint"}
    className={cn(
      "rounded-md border px-3 py-2",
      error ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-teal-500"
    )}
  />
  {error ? (
    <p id="email-error" role="alert" className="text-sm text-red-400">
      {error}
    </p>
  ) : (
    <p id="email-hint" className="text-sm text-gray-500">
      We'll never share your email
    </p>
  )}
</div>
```

### 4.3 Multi-Step Forms (Wizard/Stepper)

**When to use:** 5+ fields, logical groupings, onboarding flows, checkout processes.

**Key components:**
1. **Step indicator** — Shows current position + remaining steps (numbered dots or progress bar)
2. **Step panel** — Contains fields for the active step
3. **Navigation** — Back/Next buttons; "Back" never destroys data
4. **Review step** — Summary of all inputs before final submission
5. **Save & resume** — For long flows, persist draft state

**Best practices:**
- Keep each step focused (3–5 fields max)
- Allow jumping back to visited steps
- Use action-oriented step titles ("Your Profile", "Privacy Settings", "Interests")
- Show validation errors per-step, not at the end
- Persist partial progress (localStorage or server draft)

### 4.4 Accessibility Checklist

- [ ] All inputs have associated `<label>` elements
- [ ] Required fields marked with `aria-required` and visual indicator
- [ ] Error messages linked via `aria-describedby`
- [ ] Logical tab order through all fields
- [ ] No keyboard traps
- [ ] Focus moved to first error on submit failure
- [ ] Color is not the only means of conveying state
- [ ] Touch targets minimum 44×44px (WCAG 2.2 Level AA)

---

## 5. Content Display Patterns

### 5.1 Card Design for Social Feeds

**Standard post card anatomy:**

```
┌─────────────────────────────────────────────────┐
│ [Avatar] Username · @handle · 2h ago       [⋮]  │
├─────────────────────────────────────────────────┤
│                                                  │
│ Post body text that can be multiple lines...     │
│                                                  │
│ ┌─────────────────────────────────────────┐     │
│ │         Media (image/video)              │     │
│ └─────────────────────────────────────────┘     │
│                                                  │
│ [Tags: #rope #shibari #workshop]                 │
├─────────────────────────────────────────────────┤
│ ♡ 24    💬 8    ↗ Share    ⊕ Save               │
└─────────────────────────────────────────────────┘
```

**Implementation rules:**
- Consistent structure across all post types (builds user mental models)
- Lazy-load images, use `loading="lazy"` + blur placeholders
- Optimistic updates for engagement actions (like/save respond instantly)
- Virtualize long lists (react-window / react-virtuoso) for 60fps scrolling

### 5.2 Text Truncation & Expansion

**Three-tier approach:**
1. **Short posts** (< 280 chars): Show in full
2. **Medium posts** (280–1000 chars): Truncate at ~4 lines + "Show more" button
3. **Long posts** (> 1000 chars): Truncate at ~4 lines with "Read more" expanding inline

```tsx
const TRUNCATION_LINES = 4;
const TRUNCATION_CHARS = 280;

function PostBody({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > TRUNCATION_CHARS;

  return (
    <div>
      <p className={cn(!expanded && needsTruncation && "line-clamp-4")}>
        {text}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-teal-400 text-sm mt-1"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
```

### 5.3 Content Warnings / Filters

Critical for a kink-positive platform. Learned from Mastodon's mature implementation:

**Pattern:**
1. Post is visually collapsed behind an opaque barrier
2. Warning label displays the CW category (e.g., "Content warning: explicit imagery")
3. "Show content" button reveals the post
4. User settings control default CW behavior per category

**Implementation:**

```tsx
function ContentWarning({ label, children }: { label: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <button
        onClick={() => setRevealed(true)}
        className="text-sm text-teal-400 hover:text-teal-300"
      >
        Show content
      </button>
    </div>
  );
}
```

**User-level settings should include:**
- Per-category CW preferences (hide/blur/show)
- Global "always show CW content" toggle
- Per-user mute/filter overrides

### 5.4 Media Galleries

| Layout | Use Case | Implementation |
|--------|----------|---------------|
| **Single image** | One photo | Full-width, aspect-ratio preserved |
| **Two images** | Side-by-side | `grid-cols-2`, equal height |
| **Three images** | 1 large + 2 small | `grid-cols-2 grid-rows-2`, first spans 2 rows |
| **Four+ images** | 2×2 grid + "+N more" | `grid-cols-2 grid-rows-2`, overflow indicator |
| **Lightbox** | Expanded view | Modal overlay with navigation arrows |

---

## 6. State Management in UI

### 6.1 The Five UI States

Every data-fetching component should handle all five states:

| State | Visual Treatment | Implementation |
|-------|-----------------|----------------|
| **Loading** | Skeleton screens matching content shape | Shimmer/pulse animation |
| **Empty** | Illustration + explanation + CTA | "No events yet. Create your first event" |
| **Error** | Error message + retry button | "Failed to load. Try again" |
| **Success** | Actual content | The normal view |
| **Partial** | Content + inline loading for more | Infinite scroll with bottom loader |

### 6.2 Skeleton Screens

**Best practices (reduces perceived load time by up to 67%):**

- Match content structure exactly (avatar = circle, text = rectangles, image = rectangle)
- Use shimmer animation (linear gradient sweep) as default
- Respect `prefers-reduced-motion` — fall back to static gray blocks
- Never show skeletons for > 3 seconds — switch to a progress indicator
- Vary skeleton line widths (100%, 80%, 60%) for realistic text appearance

```tsx
function PostCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded bg-gray-700" />
          <div className="h-2.5 w-16 rounded bg-gray-700" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-700" />
        <div className="h-3 w-4/5 rounded bg-gray-700" />
        <div className="h-3 w-3/5 rounded bg-gray-700" />
      </div>
      <div className="h-48 w-full rounded-lg bg-gray-700" />
    </div>
  );
}
```

### 6.3 Empty States

**Effective empty states serve four functions:**
1. **Confirm** the system works (it's not broken, there's just no data)
2. **Explain** why nothing appears
3. **Preview** what eventual content will look like
4. **Guide** users to populate the space

```tsx
function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <IllustrationEmpty className="h-32 w-32 text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300">Your feed is empty</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        Follow people and join groups to see posts here
      </p>
      <Button className="mt-4" variant="outline">
        Discover people
      </Button>
    </div>
  );
}
```

### 6.4 Error States

- Always provide a retry mechanism
- Show specific, human-readable error messages
- Log technical details but don't expose them to users
- For critical errors, provide alternative paths (e.g., "Go to homepage")
- Use error boundaries in React for graceful component-level failure

---

## 7. Information Architecture

### 7.1 Social Platform Feature Organization

**Primary navigation (tab bar / sidebar):**

| Item | Contains |
|------|----------|
| **Home / Feed** | Timeline, post creation, feed filters |
| **Discover / Explore** | Search, trending, recommendations, categories |
| **Events** | Browse, create, RSVP, calendar view |
| **Messages** | Conversations, requests, group chats |
| **Profile** | Your profile, posts, photos, connections |

**Secondary navigation (accessible from profile or hamburger):**
- Groups
- Vendors
- Education / Resources
- Notifications
- Settings

### 7.2 Settings Hierarchy

Group by **task domain**, not technical implementation:

```
Settings
├── Account
│   ├── Email & Password
│   ├── Username & Display Name
│   ├── Verify Identity
│   └── Delete Account
├── Profile
│   ├── About Me
│   ├── Photos & Media
│   ├── Kinks & Interests
│   └── Experience Level
├── Privacy & Safety
│   ├── Profile Visibility (public / community / private)
│   ├── Who Can Message Me
│   ├── Blocked Users
│   ├── Content Filters / CW Preferences
│   └── Data & Download
├── Notifications
│   ├── Push Notifications
│   ├── Email Notifications
│   └── Notification Filters
├── Appearance
│   ├── Theme (dark / light / system)
│   ├── Content Display Density
│   └── Language
└── Connected Apps
    ├── Linked Accounts
    └── API Keys
```

**Key principle:** Progressive disclosure — hide advanced options behind "Advanced" expandable sections. Prioritize settings by frequency of use and impact.

### 7.3 Onboarding Flow

**Recommended multi-step onboarding (wizard pattern):**

```
Step 1: Welcome + Email/Password ──→
Step 2: Profile Basics (name, avatar, bio) ──→
Step 3: Interests & Kinks (tag picker) ──→
Step 4: Privacy Defaults (visibility, CW prefs) ──→
Step 5: Discovery (suggested people/groups/events) ──→
  → Home Feed
```

**Rules:**
- Allow skipping non-essential steps
- Show progress indicator (dots or numbered bar)
- Persist partial progress
- Make it completable in < 3 minutes
- Each step: 2–4 fields maximum

---

## 8. Iconography & Visual Assets

### 8.1 Icon Systems

**Recommended: Lucide Icons**
- 1,685+ icons, consistent 24×24 grid
- Tree-shakable (only bundled icons ship to client)
- Customizable size, color, stroke width
- Official React package: `lucide-react`
- MIT license, actively maintained

**Usage pattern:**

```tsx
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

<Heart className="h-5 w-5" />
```

**Icon sizing scale:**

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 12px | Inline with small text |
| `sm` | 16px | Inline with body text, badges |
| `md` | 20px | Default for buttons, nav items |
| `lg` | 24px | Standalone actions, prominent UI |
| `xl` | 32px | Empty states, feature highlights |
| `2xl` | 48px | Hero illustrations |

### 8.2 Avatar System

**Component requirements:**

```
┌─────────────┐
│             │  Image → Initials → Generic fallback
│   Avatar    │  Sizes: xs(24) sm(32) md(40) lg(48) xl(64) 2xl(96)
│             │  Shapes: circle (default), rounded
│  [status]   │  Status badge: online/offline/busy/away (positioned bottom-right)
└─────────────┘
```

**Fallback hierarchy:**
1. User-uploaded image (try loading via `<img>`)
2. On load error → initials extracted from display name (max 2 chars)
3. No name available → generic silhouette/icon

**Implementation notes:**
- Use deterministic background colors for initials (hash username to pick from palette)
- Status indicator positioned absolutely, bottom-right, with a ring matching the parent background
- Support `AvatarGroup` for stacked overlapping avatars (e.g., "3 members attending")

### 8.3 Badge System

| Type | Visual | Use Case |
|------|--------|----------|
| **Status** | Colored dot (green/yellow/red/gray) | Online status, account verification |
| **Count** | Number in colored circle | Unread notifications, messages |
| **Label** | Text in rounded pill | Tags, roles (Admin, Moderator, Organizer) |
| **Icon** | Small icon overlay | Verified checkmark, premium features |

---

## 9. Data-Dense Interfaces

### 9.1 Dashboard Design Principles

**Task-centric over entity-based architecture:**
- Organize around operator workflows ("Review flagged content", "Approve pending events")
- Not database tables ("Users table", "Posts table")

**Key patterns:**

| Pattern | Implementation |
|---------|---------------|
| **Metric cards** | KPI at top: total users, active events, reported content |
| **Data tables** | TanStack Table v8 — headless, sortable, filterable, paginated |
| **Charts** | Recharts for clean data visualization |
| **Action queues** | Prioritized lists with bulk actions |
| **Filters** | Sidebar or top-bar with faceted search |

### 9.2 Moderation Tools

**Three essential components:**
1. **Fast action access** — Direct buttons (Approve / Reject / Escalate) without dropdowns
2. **Batch selection** — Checkbox + "Select all" for bulk operations
3. **Visual overview** — Card/gallery view for media moderation, table view for text content

**Status visibility:**
- Color-coded badges (pending=yellow, approved=green, rejected=red, escalated=orange)
- Time-since-submission indicator
- SLA alerts when items exceed response time targets

### 9.3 Admin Panel Stack (2026)

| Layer | Recommended |
|-------|------------|
| Framework | Next.js (App Router) |
| Components | shadcn/ui + Radix primitives |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
| DnD | @dnd-kit |

**Desktop-first design** — operators work primarily on desktop; mobile views reserved for monitoring and alerts.

---

## 10. Real-Time UI Patterns

### 10.1 Presence Indicators

**Status types:**
- 🟢 Online (active in last 5 min)
- 🟡 Idle (active in last 15 min)
- 🔴 Do Not Disturb
- ⚫ Offline

**Implementation:**
- WebSocket heartbeats every 30s
- BroadcastChannel API to deduplicate across browser tabs
- Idle detection via `requestIdleCallback` + visibility API
- Respect privacy settings (users can hide their status)

### 10.2 Typing Indicators

**Pattern:**
1. Listen for keydown events in message input
2. Send "typing" event to server (debounced, max 1 per 3s)
3. Send "stop typing" after 3s of inactivity
4. Server broadcasts to conversation participants
5. Client shows "{Name} is typing..." with animated dots
6. Auto-clear if no "typing" signal received for 5s

**UI treatment:** Subtle animation below the last message, same width as message bubble area. Show max 2 names, then "3 people are typing..."

### 10.3 Notification Badges

**Implementation:**
- `position: absolute; top: -4px; right: -4px;` on parent icon
- Circular badge with count (min-width to prevent squishing on "99+")
- Animate entry with scale-up + fade-in
- Red/accent color for urgency, gray for informational
- Cap display at "99+" for large counts

```tsx
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
```

### 10.4 Live Feed Updates

**"New posts" banner pattern (preferred over auto-injection):**
1. WebSocket delivers new post notification
2. Banner appears at top of feed: "3 new posts"
3. User taps banner → new posts are prepended to feed
4. This avoids content shifting while the user is reading

**Optimistic updates for engagement:**
- Like/unlike → immediate UI change, server sync in background
- If server rejects → revert UI + show brief error toast
- Saves/bookmarks follow same pattern

---

## 11. Actionable Guidelines for C2K

**Removed** — content duplicated [design/03-COMPONENT_LIBRARY.md](./design/03-COMPONENT_LIBRARY.md), [design/05-CONTENT_AND_SAFETY.md](./design/05-CONTENT_AND_SAFETY.md), [design/08-DESIGN_TOKENS.md](./design/08-DESIGN_TOKENS.md), and [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md). Prior §11 referenced stale Next.js paths; use `packages/web/` for all code locations.

---

*Living industry reference only — update normative docs when C2K patterns change.*
