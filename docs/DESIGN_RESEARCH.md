# Social Media & Web Application Design Research

> **Archive / evidence only.** Normative C2K specs → [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md) + [design/01–08](./design/01-BRAND_AND_IDENTITY.md). Do not copy token tables from this file into components.

**Research date:** March 20, 2026
**Scope:** Best practices for social media platform design (2025-2026)
**Sources:** Industry research, platform analysis (Instagram, Twitter/X, TikTok, Discord, Reddit, Threads), W3C standards, design system literature

---

## Table of Contents

1. [Mobile-First Design Principles](#1-mobile-first-design-principles)
2. [Responsive Design Systems](#2-responsive-design-systems)
3. [Social Media UX Patterns](#3-social-media-ux-patterns)
4. [Design System Architecture](#4-design-system-architecture)
5. [Typography for Social Platforms](#5-typography-for-social-platforms)
6. [Color Systems](#6-color-systems)
7. [Navigation Patterns](#7-navigation-patterns)
8. [Performance-Driven Design](#8-performance-driven-design)
9. [Accessibility (a11y)](#9-accessibility-a11y)
10. [Animation & Micro-interactions](#10-animation--micro-interactions)

---

## 1. Mobile-First Design Principles

### The Mobile Reality

Mobile devices account for over 60% of global web traffic in 2026, with over 2.97 billion people accessing social media exclusively on mobile. Designing for mobile first is not a progressive enhancement strategy—it is the baseline.

### Thumb Zone Ergonomics

Nearly half of users (49%) hold their phones one-handed, creating a physiological "thumb zone" that dictates reachability:

```
┌─────────────────────┐
│  Hard to reach  ███ │  ← Top corners: avoid primary actions
│  ░░░░░░░░░░░░░░░░░░ │
│  ░░░ OK zone ░░░░░░ │  ← Middle: secondary actions
│  ░░░░░░░░░░░░░░░░░░ │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  ▓▓ Natural zone ▓▓ │  ← Bottom center: primary actions
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────┘
```

**Key principle:** Place primary actions (compose, like, navigate) in the bottom-center natural zone. Reserve the top of the screen for passive information (titles, timestamps).

### Touch Target Specifications

| Element | Minimum Size | Recommended Size | Spacing |
|---------|-------------|-----------------|---------|
| Primary actions (CTA buttons) | 44×44px | 56×56px | 8px margin minimum |
| Secondary actions | 44×44px | 48×48px | 8px margin minimum |
| WCAG 2.2 minimum (2.5.8) | 24×24px | 44×44px | — |
| Icon-only buttons | 44×44px | 48×48px | 12px margin |

### Platform Examples

- **Instagram:** Bottom tab bar places Home, Reels, Create, DMs, Profile within thumb reach. The create button was recently moved to the top-left (2026 redesign), sparking debate about reachability.
- **TikTok:** Full-screen vertical swipe interaction requires only upward thumb flicks—the most natural one-handed gesture.
- **Discord:** Servers sidebar on the left edge is swipe-accessible; primary chat input is bottom-anchored.

### Content Format Optimization

- **4:5 portrait** takes 25% more screen real estate than 1:1 square in feed contexts
- **9:16 vertical video** is the standard for Reels, TikTok, and Stories
- Design content within a "safe zone" (central 1080×1080px area for Instagram) to survive cropping across contexts

### Performance Mandates

- First Meaningful Paint under 3 seconds on 3G connections
- Maintain good Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) on real mobile devices
- Minimize layout shifts that pull attention from primary calls-to-action

---

## 2. Responsive Design Systems

### Breakpoint Strategy (2026)

The modern approach uses **content-first breakpoints** rather than device-specific widths. Set breakpoints where your layout actually breaks, not at arbitrary device sizes.

#### Common Breakpoint Ranges

| Range | Category | Notes |
|-------|----------|-------|
| 320–480px | Compact mobile | Small phones, SE-class |
| 481–768px | Comfortable mobile / small tablet | Most modern phones (390–430px common) |
| 769–1024px | Tablet / small desktop | iPads, small laptops |
| 1025–1280px | Desktop | Standard monitors |
| 1281–1440px | Large desktop | Pro displays |
| 1441px+ | Ultra-wide / 4K | Multi-column layouts |
| 600–720px | Foldables / mini-tablets | Emerging category |

**Best practice:** Most designs need only 3–4 breakpoints, each triggering meaningful layout changes. Test at each breakpoint ±20px to catch edge cases.

#### Mobile-First Media Queries

```css
/* Base styles: mobile (no query needed) */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 24px; max-width: 720px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: 32px; max-width: 960px; }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container { max-width: 1200px; }
}
```

### Container Queries (Production-Ready in 2026)

Container queries allow components to respond to their **parent container size** rather than the viewport—enabling truly reusable components.

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}

@container card (max-width: 399px) {
  .card { flex-direction: column; }
}
```

**Browser support:** Chrome 105+, Firefox 110+, Safari 16+, Edge 105+ — safe for production with 72% adoption in React/Vue apps.

**Three types available:**
1. **Size Queries** — style based on container dimensions (most common)
2. **Style Queries** — conditional styling based on CSS custom properties
3. **Scroll-State Queries** — pure CSS response to scroll state (newest, 2026)

**Performance:** Container Queries render ~35% faster than ResizeObserver-based JavaScript approaches with zero layout shift.

### Fluid Typography

Replace rigid breakpoint-based font sizes with CSS `clamp()`:

```css
/* Body text: 16px minimum, scales with viewport, 20px maximum */
body { font-size: clamp(1rem, 0.5vw + 0.875rem, 1.25rem); }

/* Headings: smooth scaling from 24px to 48px */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }
```

For component-scoped text, use container query units (`cqw`) instead of viewport units.

### Two-Tier Architecture

| Layer | Technique | Responsibility |
|-------|-----------|---------------|
| Macro layout | Media queries | Page-level layout decisions (sidebar vs. stacked, grid columns) |
| Micro components | Container queries | Component-level adaptation (card layout, typography scale) |

---

## 3. Social Media UX Patterns

### Feed Design Principles

Effective newsfeeds follow five foundational principles:

1. **Clarity** — Users instantly understand what each piece of content is
2. **Consistency** — Similar structural patterns across all post types
3. **Hierarchy** — Important content visually prioritized
4. **Efficiency** — Optimized for rapid scrolling and scanning
5. **Delight** — Subtle animations and personalized touches

#### Anatomy of a Feed Post

```
┌────────────────────────────────────┐
│ [Avatar] Username · Timestamp  ··· │  ← Header: identity + context + overflow menu
│                                    │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │         Content Area           │ │  ← Media (image/video) or text content
│ │     (image, video, text)       │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                                    │
│ ♡ 1.2K   💬 234   ↗ Share   ⊕    │  ← Engagement bar: like, comment, share, save
│                                    │
│ View all 234 comments              │  ← Comment preview / expansion
│ user1: Great post!                 │
│                                    │
│ Add a comment...                   │  ← Comment input
└────────────────────────────────────┘
```

### Platform-Specific Feed Patterns

#### Instagram (2026 Redesign)
- Bottom bar: Home → Reels → DMs → Search → Profile
- Create button moved to top-left corner
- "Tune Your Algorithm" feature for manual topic customization
- Emphasis on DMs and Reels as primary engagement drivers
- Grid display: 3:4 crop from 4:5 uploads (1080×1350px → 810×1080px display)

#### TikTok — Immersive Full-Screen Feed
- Full-screen vertical video with overlay UI
- Vertical swipe pagination (one video per screen)
- Auto-play within milliseconds of scrolling
- Engagement buttons stacked vertically on the right edge
- Creator info + caption anchored to bottom-left
- Player pooling and video precaching for smooth transitions

#### Twitter/X — Text-First Feed
- Algorithm prioritizes engagement velocity (likes/replies within 30 minutes)
- Author credibility and relationship strength weighted over total counts
- Mixed media cards: text, images (1600×900px / 16:9), links, polls
- Quote tweets and thread indicators for conversation threading

#### Reddit (2026 UI Overhaul)
- Enlarged cards showing less information per screen
- Persistent search bar with glowing orange accent
- AI-powered Smart Communities for content discovery
- Notification pipeline: budgeting → retrieval → ranking → reranking
- Deep learning scoring predicts viral content with 92% accuracy

#### Discord — Channel-Based Messaging
- Server list (left rail) → Channel list → Message area → Member list
- Components V2: up to 40 components per message
- Real-time typing indicators, presence status, voice channel visualization
- Threads for focused sub-conversations within channels

### Profile Layout Patterns

Common profile structures across platforms:

```
┌─────────────────────────────────┐
│ ┌──────────────────────────────┐│
│ │       Cover / Banner         ││  ← Full-width banner image
│ └──────────────────────────────┘│
│ ┌───┐                          │
│ │ ○ │  Display Name             │  ← Avatar overlapping banner
│ └───┘  @handle                  │
│                                 │
│ Bio text / description          │  ← Brief personal description
│ 📍 Location · 🔗 website       │
│                                 │
│ 1.2K Following · 45K Followers  │  ← Social proof metrics
│                                 │
│ [Follow] [Message] [···]        │  ← Action buttons
│                                 │
│ ┌─────┬───────┬────────┐       │
│ │Posts │Replies│ Media  │       │  ← Content tabs
│ └─────┴───────┴────────┘       │
│                                 │
│ ┌─ Feed of user's content ────┐│
│ │                              ││
│ └──────────────────────────────┘│
└─────────────────────────────────┘
```

### Content Card Design

Cards should be self-contained units with:
- Clear visual boundaries (subtle borders, shadows, or background differentiation)
- Consistent internal padding (16px is the most common)
- Predictable element placement across card types
- Truncation with "show more" for long content
- Lazy-loaded media with aspect ratio preservation to prevent layout shift

### Notification System Patterns

| Pattern | Use Case | Platform Example |
|---------|----------|-----------------|
| Badge count | Unread count on nav icons | Instagram, Discord |
| Toast / snackbar | Transient confirmations | "Post published", "Saved" |
| Push notification | Re-engagement, real-time alerts | All platforms |
| In-app notification center | Activity feed, mentions, follows | Twitter, Reddit |
| Grouped notifications | "3 people liked your post" | Instagram, Facebook |
| Smart budgeting | Daily notification caps per user | Reddit (ML-powered) |

### Messaging UI Patterns

- Conversation list: avatar + name + preview + timestamp + unread indicator
- Chat bubbles: sender-colored alignment (left for others, right for self)
- Typing indicators: animated dots or "User is typing..."
- Read receipts: checkmarks or "Seen" indicator
- Reply threading: swipe-to-reply or long-press context menu
- Rich media: inline image/video/link previews within the conversation

---

## 4. Design System Architecture

**Moved to normative docs** — three-tier tokens, spacing scale, and component hierarchy are defined in:

- [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md) — `--dc-*` contract
- [design/08-DESIGN_TOKENS.md](./design/08-DESIGN_TOKENS.md) — tables and Tailwind mapping
- [design/03-COMPONENT_LIBRARY.md](./design/03-COMPONENT_LIBRARY.md) — component states and checklist

This section intentionally omits duplicate C2K token tables. Industry background remains in [DESIGN_SYSTEM_RESEARCH.md](./DESIGN_SYSTEM_RESEARCH.md) §1–2.

---

## 5. Typography for Social Platforms

### Font Selection Principles

Social platforms prioritize readability at small sizes, fast rendering, and cross-platform consistency.

#### Platform Font Choices (Reference)

| Platform | Primary Font | Characteristics |
|----------|-------------|----------------|
| Instagram | Instagram Sans (custom) | Geometric sans-serif, optimized for mobile |
| Twitter/X | Chirp (custom) | Left-aligned, sharp, designed for scanning |
| TikTok | TikTok Sans (custom) | Rounded, friendly, high readability |
| Discord | gg sans (custom) | Humanist sans-serif, legible at small sizes |
| Reddit | Reddit Sans (custom) | Clean, neutral, high density |
| Threads | Instagram Sans (shared) | Consistent with Meta ecosystem |

#### Recommended Pairings for New Projects

| Display / Headings | Body / UI Text | Style |
|-------------------|----------------|-------|
| Montserrat | Inter | Clean, modern, professional |
| Playfair Display | Lato | Elegant contrast |
| Oswald | Roboto | Condensed + neutral |
| Poppins | Inter | Rounded, approachable |
| Bebas Neue | Source Sans Pro | Bold headlines + readable body |

**Rule:** Most projects need only two fonts—one display and one body—using weight variations for hierarchy.

### Type Scale System

Use a mathematical ratio (1.25 – 1.5) for consistent hierarchy:

| Token | Size | Line Height | Weight | Use |
|-------|------|------------|--------|-----|
| `--text-xs` | 12px | 1.5 (18px) | 400 | Captions, timestamps |
| `--text-sm` | 14px | 1.5 (21px) | 400 | Secondary text, metadata |
| `--text-base` | 16px | 1.5 (24px) | 400 | Body text (minimum for readability) |
| `--text-lg` | 18px | 1.5 (27px) | 500 | Emphasized body, subheadings |
| `--text-xl` | 20px | 1.4 (28px) | 600 | Section headings |
| `--text-2xl` | 24px | 1.3 (31px) | 600 | Page headings |
| `--text-3xl` | 30px | 1.2 (36px) | 700 | Major headings |
| `--text-4xl` | 36px | 1.2 (43px) | 700 | Display / hero text |

### Mobile Readability Rules

- **Minimum body text:** 16px (prevents iOS zoom on input focus below this)
- **Line height:** 1.4–1.7 for body copy
- **Line length:** 45–75 characters per line for optimal readability
- **Weight contrast:** 400–500 for paragraphs, 600–700 for headings; never use ultra-light (<300) for small text
- **Letter spacing:** Slightly increased for all-caps text and very small sizes

### Fluid Typography Implementation

```css
:root {
  --text-base: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);        /* 16px → 18px */
  --text-lg:   clamp(1.125rem, 0.75vw + 0.9rem, 1.375rem);     /* 18px → 22px */
  --text-xl:   clamp(1.25rem, 1vw + 0.9rem, 1.75rem);          /* 20px → 28px */
  --text-2xl:  clamp(1.5rem, 2vw + 0.75rem, 2.5rem);           /* 24px → 40px */
  --text-3xl:  clamp(1.875rem, 3vw + 0.5rem, 3.5rem);          /* 30px → 56px */
}
```

---

## 6. Color Systems

### Dual-Mode Architecture (Light + Dark)

Modern social platforms must support both light and dark modes as first-class citizens. Never simply invert the light palette—build a separate color architecture for each mode.

#### Light Mode Foundations

```css
:root {
  --color-bg-primary:     #FFFFFF;
  --color-bg-secondary:   #F5F5F5;
  --color-bg-tertiary:    #E8E8E8;
  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary:  #9CA3AF;
  --color-border:         #E5E7EB;
  --color-border-strong:  #D1D5DB;
}
```

#### Dark Mode Foundations

```css
[data-theme="dark"] {
  --color-bg-primary:     #0D1117;    /* Deep gray, NOT pure black */
  --color-bg-secondary:   #161B22;    /* Elevated surface */
  --color-bg-tertiary:    #21262D;    /* Higher elevation */
  --color-text-primary:   #E6EDF3;    /* Softened white, NOT #FFF */
  --color-text-secondary: #8B949E;
  --color-text-tertiary:  #6E7681;
  --color-border:         #30363D;
  --color-border-strong:  #484F58;
}
```

### Dark Mode Principles

1. **Use deep grays, not pure black** — Pure `#000000` causes halation (visual bleeding) and eye strain. Use `#0D1117`, `#0A0A0F`, or `#0F172A`.
2. **Soften whites** — Use `#E6EDF3` or `#F1F5F9` instead of `#FFFFFF` to prevent harsh vibration.
3. **Desaturate accent colors** — Lighten accent colors to 60–70% lightness in OKLCH for dark backgrounds.
4. **Elevation through lightness** — Create depth via surface lightness stepping (lighter = higher), not shadows which disappear on dark backgrounds.
5. **Respect OS preferences** — Honor `prefers-color-scheme` and support `prefers-contrast` for high-contrast users.

### WCAG 2.2 Contrast Requirements

| Element | AA Minimum | AAA Enhanced |
|---------|-----------|-------------|
| Normal text (<24px) | 4.5:1 | 7:1 |
| Large text (≥24px or ≥19px bold) | 3:1 | 4.5:1 |
| UI components (borders, icons, focus rings) | 3:1 | — |
| Focus indicators | 3:1 against adjacent colors | — |

### Semantic Color Tokens

```css
:root {
  /* Intent colors */
  --color-success:     #10B981;
  --color-warning:     #F59E0B;
  --color-error:       #EF4444;
  --color-info:        #3B82F6;

  /* Interactive states */
  --color-primary:          #6366F1;
  --color-primary-hover:    #4F46E5;
  --color-primary-active:   #4338CA;
  --color-primary-disabled: #A5B4FC;

  /* Surface hierarchy */
  --color-surface-0:  var(--color-bg-primary);    /* Base */
  --color-surface-1:  var(--color-bg-secondary);  /* Cards */
  --color-surface-2:  var(--color-bg-tertiary);   /* Modals, dropdowns */
  --color-overlay:    rgba(0, 0, 0, 0.5);         /* Backdrop */
}
```

### Color Accessibility Rules

- **Never use color alone** to convey meaning — always layer with icons, text, underlines, or shapes
- **Test in both modes** — Track a "mode parity score" (percentage of templates passing contrast in both themes)
- **Measure readability complaints** per 1,000 sessions by theme
- **Support `forced-colors` mode** for Windows High Contrast users

---

## 7. Navigation Patterns

### Bottom Navigation Bar (Mobile Standard)

The dominant pattern for 3–5 primary sections in social media apps. Places navigation in the thumb zone where 60% of users naturally reach.

#### Implementation Rules

| Rule | Specification |
|------|--------------|
| Max items | 3–5 destinations |
| Touch target | 44×44px minimum, 48×48px recommended |
| Labels | Always include text labels with icons |
| Active indicator | Visually distinct (color, weight, or background) |
| Current tab tap | Scroll to top or reset navigation stack |
| Engagement impact | +25% vs. hamburger menus |

#### Platform Bottom Nav Comparison

| Platform | Items | Layout |
|----------|-------|--------|
| Instagram | 5 | Home, Reels, DMs, Search, Profile |
| TikTok | 5 | Home, Friends, + (Create), Inbox, Profile |
| Twitter/X | 5 | Home, Search, Grok, Notifications, Messages |
| Reddit | 5 | Home, Communities, Create, Chat, Inbox |
| Discord | 4 | Servers, Messages, Notifications, You |
| Threads | 5 | Home, Search, Create, Activity, Profile |

### Navigation Pattern Taxonomy

#### 1. Bottom Tab Bar
- **When:** 3–5 primary sections, consumer-facing apps
- **Strengths:** Thumb-reachable, always visible, high discoverability
- **Weaknesses:** Limited to 5 items max, uses screen real estate

#### 2. Top Tab Bar (Scrollable)
- **When:** Sub-sections within a main section
- **Example:** Twitter timeline tabs (For You, Following, Lists)
- **Strengths:** Good for content categories, horizontally scrollable
- **Weaknesses:** Requires two hands on larger phones

#### 3. Hamburger Menu
- **When:** 6+ secondary items, settings, less-frequent features
- **Strengths:** Space-efficient, can hold many items
- **Weaknesses:** Low discoverability — items get used less when hidden

#### 4. Contextual Floating Action Button (FAB)
- **When:** One dominant action per screen (compose, create)
- **Example:** Twitter's compose tweet button (bottom-right floating)
- **Strengths:** Always visible, clear primary action
- **Weaknesses:** Can obstruct content, only for one action

#### 5. Gesture-Based Navigation
- **When:** Full-screen immersive content
- **Example:** TikTok vertical swipe, Instagram Stories horizontal swipe
- **Strengths:** Maximizes content area, natural feel
- **Weaknesses:** No visible affordance, steep learning curve

### 2026 Trends

- **Smart hiding on scroll:** Navigation bar auto-hides on scroll down, reappears on scroll up — balances screen real estate with accessibility
- **Navigation accounts for 30–40% of mobile usability problems** — users abandon within 10–15 seconds if they can't find what they need
- **Icon + label always beats icon alone** for clarity and accessibility

---

## 8. Performance-Driven Design

### Skeleton Screens

Skeleton screens replace traditional loading spinners by displaying a layout that mirrors the final UI structure before content arrives.

#### Why They Work (Psychology)

- **Occupied vs. unoccupied time** — Users feel time passes faster when processing visual information
- **Goal-gradient effect** — Seeing where content will appear makes users feel closer to their goal
- **Reduced cognitive load** — Layout context reduces anxiety about what's loading
- **Impact:** Skeleton screens reduce perceived loading time by up to 67%

#### Implementation Pattern

```
Loading State:                    Loaded State:
┌────────────────────────┐       ┌────────────────────────┐
│ [░░░] ░░░░░░░ · ░░░░  │       │ [IMG] Username · 2h    │
│ ┌──────────────────┐   │       │ ┌──────────────────┐   │
│ │                  │   │       │ │                  │   │
│ │   ░░░░░░░░░░░░   │   │  →   │ │   Actual Image   │   │
│ │                  │   │       │ │                  │   │
│ └──────────────────┘   │       │ └──────────────────┘   │
│ ░░░ ░░░ ░░░ ░░░       │       │ ♡ 💬 ↗ ⊕              │
│ ░░░░░░░░░░░░░░░░░     │       │ Caption text here...   │
└────────────────────────┘       └────────────────────────┘
```

**Platform examples:** YouTube, LinkedIn, Facebook, Slack all use skeleton screens as their primary loading state.

### Lazy Loading

Three layers of lazy loading in modern frameworks:

1. **Code splitting (build-time)** — Break bundles into smaller chunks
2. **Fetch timing (run-time)** — Download chunks on-demand when routes are accessed
3. **Rendering strategy** — Server-render critical content, client-render deferred content

**Priority rule:** Eagerly load headers, above-the-fold content, and CTAs. Defer modals, tooltips, below-fold images, and advanced filters.

### Infinite Scroll

Critical for feed-based social platforms. Implementation requires managing three simultaneous flows:

1. **UI state** — Loading indicators, preventing double-fetches, error states
2. **Data pipeline** — Requesting, appending, deduplicating, maintaining order
3. **Viewport detection** — Use `IntersectionObserver` (not scroll events) for reliable trigger detection

**Gotchas:**
- Always provide a "back to top" mechanism
- Preserve scroll position on back-navigation
- Include pagination landmarks for accessibility (screen readers can't "scroll")
- Provide an alternative paginated view for SEO and accessibility

### Optimistic UI

Update the UI immediately on user action, assuming server success. Roll back on failure.

| Action | Optimistic Behavior | Rollback |
|--------|-------------------|----------|
| Like / heart | Instant color change + count increment | Revert color + count |
| Follow | Button switches to "Following" immediately | Revert to "Follow" |
| Post comment | Comment appears in thread immediately | Remove + show error |
| Delete | Item disappears immediately | Restore + show error |
| Save / bookmark | Icon fills immediately | Revert icon |

**When to use:** Fast, reliable endpoints (completing < 2 seconds) with low failure rates.
**When NOT to use:** Unreliable APIs, slow endpoints, operations requiring server-side validation the client can't replicate.

### Perceived Performance Techniques Summary

| Technique | Perceived Speed Improvement | Real-World Use |
|-----------|---------------------------|----------------|
| Skeleton screens | Up to 67% | YouTube, LinkedIn, Facebook |
| Optimistic updates | Near-instant feel | Instagram likes, Twitter retweets |
| Progressive image loading | Smooth content reveal | Medium (blur-up), Instagram |
| Prefetching | Instant navigation | Next.js link prefetch, TikTok video preload |
| Content prioritization | Faster LCP | Above-fold SSR, deferred below-fold |

---

## 9. Accessibility (a11y)

### WCAG 2.2 Compliance (Current Standard)

WCAG 2.2 (released October 5, 2023) is the recommended legal baseline for ADA, Section 508, and the European Accessibility Act. It adds 9 new success criteria with full backward compatibility to WCAG 2.1.

### Critical New Criteria for Social Platforms

#### Focus Management (Most Impactful)

**2.4.11 Focus Not Obscured (Minimum) — Level AA:**
When a keyboard-focusable element receives focus, at least part of it must remain visible and not hidden by sticky headers, footers, or modals.

```css
/* Prevent sticky header from hiding focused elements */
html { scroll-padding-top: 80px; }

/* Add margin to focused elements near sticky areas */
:focus { scroll-margin-top: 80px; }
```

**2.4.13 Focus Appearance — Level AAA:**
Focus indicators must have:
- At least 3:1 contrast against adjacent colors
- At least 2 CSS pixels thick
- Visible outline or equivalent indicator

#### Target Size

**2.5.8 Target Size (Minimum) — Level AA:**
Interactive targets must be at least **24×24 CSS pixels**. The recommended target is 44×44px for comfortable interaction.

#### Dragging Alternatives

**2.5.7 Dragging Movements — Level AA:**
Any drag-and-drop functionality must have non-dragging alternatives (buttons, input fields, click-to-place).

#### Consistent Help

**3.2.6 Consistent Help — Level A:**
Help mechanisms (chat, FAQ, contact info) must appear in consistent locations across pages.

### Keyboard Navigation Checklist

| Requirement | Implementation |
|-------------|---------------|
| All interactive elements focusable | Semantic HTML (`<button>`, `<a>`, `<input>`) |
| Logical tab order | Match visual order, use `tabindex="0"` sparingly |
| Skip navigation link | "Skip to content" as first focusable element |
| Focus trapping in modals | `Tab` cycles within modal, `Esc` closes |
| No keyboard traps | Every element reachable and escapable |
| Visible focus indicators | 3px solid outline with offset, 3:1 contrast |
| Escape key behavior | Closes modals, menus, overlays |
| Arrow key navigation | Within menus, tabs, and composite widgets |

### Screen Reader Support

| Element | Requirement |
|---------|-------------|
| Images | Descriptive `alt` text; decorative images get `alt=""` |
| Icons | `aria-label` or visually hidden text for icon-only buttons |
| Dynamic content | `aria-live` regions for feed updates, notifications |
| Forms | Associated `<label>` elements, error announcements |
| Landmarks | Use semantic HTML5: `<nav>`, `<main>`, `<header>`, `<aside>` |
| Page titles | Unique `<title>` per page/view |
| Headings | Logical heading hierarchy (h1 → h2 → h3, no skipping) |

### Social Platform Accessibility Patterns

| Feature | Accessible Implementation |
|---------|--------------------------|
| Infinite scroll | Alternative paginated view, "Load more" button |
| Image posts | User-authored alt text (Instagram, Twitter support this) |
| Video content | Captions, audio descriptions, transcript links |
| Emoji/reactions | Screen reader text equivalents |
| @mentions | Autocomplete accessible via arrow keys |
| Drag-to-reorder | Up/down button alternatives |
| Color-coded status | Icon + text in addition to color |

### Motion Accessibility

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

**Important:** Don't remove all motion—reduce, slow, or replace it. Animation aids cognitive accessibility by communicating relationships and state changes. Replace parallax and scaling with fades and opacity transitions.

---

## 10. Animation & Micro-interactions

### Purpose-Driven Motion

Every animation must serve one of four functional jobs:

1. **Confirm actions** — "Your action worked" (like heart burst, send confirmation)
2. **Guide behavior** — "Look here next" (attention-directing motion)
3. **Explain cause-and-effect** — "This happened because of that" (state transitions)
4. **Smooth state changes** — "This element is transforming" (layout transitions)

### Micro-interaction Anatomy

Each micro-interaction has four parts:
1. **Trigger** — What initiates it (tap, scroll, hover, system event)
2. **Rules** — The logic determining behavior
3. **Feedback** — The visible/audible response
4. **Loops/Modes** — How it behaves over time or on repeat

### Timing Guidelines

| Interaction Type | Duration | Easing |
|-----------------|----------|--------|
| Button press / toggle | 100–150ms | ease-out |
| Menu open / close | 150–250ms | ease-out (enter), ease-in (exit) |
| Page transitions | 200–300ms | ease-in-out |
| Complex state changes | 250–400ms | ease-in-out or spring |
| Loading indicators | Continuous | linear or ease-in-out loop |
| Notification entrance | 200–300ms | ease-out with slight overshoot |

**Rule of thumb:** Fast motion (100–150ms) feels snappy and responsive. Slow motion (300–500ms) feels elegant and deliberate. Anything over 500ms feels sluggish.

### Easing Functions

```css
:root {
  --ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1);    /* Elements entering */
  --ease-in:       cubic-bezier(0.4, 0.0, 1, 1);       /* Elements exiting */
  --ease-in-out:   cubic-bezier(0.4, 0.0, 0.2, 1);     /* Elements moving */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);   /* Playful overshoot */
}
```

### Platform Animation Examples

| Platform | Animation | Purpose |
|----------|-----------|---------|
| Instagram | Heart burst on double-tap | Confirmation + delight |
| Twitter/X | Minimal fade on like | Crisp state change |
| TikTok | Smooth vertical page snap | Content transition |
| Discord | Subtle message slide-in | New content arrival |
| Slack | Branded loading dots | Calm wait experience |
| Airbnb | Heart color fill with burst | Instant confirmation |
| Material Design | Ripple effect on tap | Touch feedback |

### Loading State Hierarchy

1. **Immediate feedback (<100ms)** — Visual press state (scale, color shift). Without this, users perceive the interface as broken and double-tap.
2. **Short operations (100ms–1s)** — No additional indicator needed if optimistic UI applies.
3. **Medium operations (1–3s)** — Swap button label to spinner + "Submitting..." text.
4. **Long operations (3s+)** — Skeleton screen or progress indicator with status text.

### Common Mistakes to Avoid

| Mistake | Impact | Fix |
|---------|--------|-----|
| Overly flashy animations | Users feel taxed on repeated use | Subtle, purposeful motion only |
| Inconsistent motion language | Unpredictable interface feel | Define a motion system with consistent timing/easing |
| Motion-only feedback | Excludes vestibular/motion-sensitive users | Always pair with text, icons, or haptic cues |
| Decorative animation | Adds load time with no UX benefit | Motion must serve a functional purpose |
| Ignoring `prefers-reduced-motion` | Accessibility violation, causes physical discomfort | Provide reduced-motion alternatives |
| Animations over 500ms | Interface feels slow | Keep under 300ms for UI, 500ms absolute max |

### Implementation Tools

| Tool | Best For | Notes |
|------|----------|-------|
| CSS transitions/transforms | Simple state changes | Best performance (GPU-accelerated) |
| Framer Motion (React) | Component animations, gestures | Declarative, spring physics |
| GSAP | Timeline-based, complex sequences | Framework-agnostic |
| Lottie | Complex vector animations | After Effects → JSON → web |
| CSS `@keyframes` | Looping animations, loading states | No JS dependency |
| View Transitions API | Page/route transitions | Native browser API (2025+) |

---

## Quick Reference

**See normative docs** — [design/07-ACCESSIBILITY_AND_PERFORMANCE.md](./design/07-ACCESSIBILITY_AND_PERFORMANCE.md) and [design/08-DESIGN_TOKENS.md](./design/08-DESIGN_TOKENS.md) for C2K touch targets, contrast, spacing, and motion. This research file no longer duplicates measurement tables.
