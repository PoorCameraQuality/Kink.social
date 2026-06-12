# Content & Safety — C2K

**Purpose:** Patterns for feeds, cards, media, and **sensitive content** so users control what they see and the platform stays trustworthy.

**When to use:** Posts, photos, messages attachments, thumbnails in search, group galleries, and any NSFW or trauma-adjacent material.

---

## Principles

1. **Opt-in to see** — Sensitive media is collapsed, blurred, or labeled until the user chooses.
2. **Consistent anatomy** — Posts share the same structure so scanning is effortless.
3. **Creator responsibility** — Uploaders tag sensitivity; the system enforces minimum policy.
4. **No surprises in notifications** — Previews obey safety mode and blur rules.

---

## Safety modes (user preference)

| Mode | Behavior |
|------|----------|
| **Open** | Show media per creator tags and standard policy (18+ verified). |
| **Cautious** | Blur NSFW-tagged media in feed/search; tap to reveal per item. |
| **Safe** | Blur **all** media by default; text-first browsing. |

**Quick toggle:** header or account menu — persistent setting with optional “session only” override (future).

**Reload behavior:** Reveal state should **not** persist across full page reloads for high-risk content (user must tap again) — reduces shoulder-surfing risk.

---

## Content warning (CW) & blur/reveal

### Anatomy

```
┌──────────────────────────────┐
│ ⚠ Content warning: [label]   │
│ Brief reason (optional)      │
│ [ Show content ]             │
└──────────────────────────────┘
```

### Implementation notes

- Use **overlay + blur** (`backdrop-filter` / CSS blur) on thumbnail; keep text description visible.
- **Screen readers:** blurred asset `aria-hidden="true"`; button has clear `aria-label` (“Show sensitive image: rope marks”).
- **Keyboard:** reveal control is focusable and returns focus to a sensible place after reveal.

### Categories (examples)

- Explicit nudity / sexual content
- Intense kink / edge play
- Blood / marks / aftermath
- Drug references
- Discussion of trauma / abuse (non-graphic)

Users can set **default** handling per category in Privacy & safety settings ([06](./06-PRIVACY_AND_TRUST.md)).

---

## Feed post anatomy

```
┌────────────────────────────────────┐
│ [Avatar] Name · @handle · time  ⋮  │
│ Body text (truncation rules)       │
│ [Media / CW shell]                 │
│ #tags                              │
│ ♡ · 💬 · ↗ · Save                  │
│ [Comment preview / input]          │
└────────────────────────────────────┘
```

**Requirements:**

- **Header:** identity, timestamp, overflow menu (report, mute, block).
- **Media:** fixed aspect ratio placeholder to prevent CLS.
- **Actions:** minimum 44×44px hit targets (see [07](./07-ACCESSIBILITY_AND_PERFORMANCE.md)).

---

## Text truncation

| Length | Treatment |
|--------|-----------|
| Short (e.g. ≤ 280 chars) | Show full |
| Medium | `line-clamp-4` + “Show more” |
| Long | Clamp + inline expand; consider dedicated “reader” view for articles |

**“Show more”** must be a `<button>`, not a bare link, for a11y.

---

## Media galleries

| Count | Pattern |
|-------|---------|
| 1 | Full width, preserve aspect ratio |
| 2 | Two-column grid, equal height crop |
| 3 | 1 large + 2 stacked, or 1 + 2 side-by-side |
| 4+ | 2×2 with “+N” overlay; open lightbox |

**Lazy load** below the fold; **priority** only for hero/LCP image.

---

## Feed behaviors

- **New content:** prefer **“New posts”** banner vs auto-injecting items (avoids scroll jank).
- **Infinite scroll:** `IntersectionObserver` sentinel; provide **Load more** alternative for accessibility.
- **Engagement:** optimistic UI for like/save when backend is fast & reliable; otherwise show pending state.

---

## Search & discovery

- Thumbnails in results **respect safety mode** even if result is clickable.
- Tag pages (`/tags/[tag]`) mix media types — apply the same CW component everywhere.

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| Default new uploads to “needs review” if policy requires | Auto-play explicit media in feed |
| Use neutral language in system warnings | Shame users for enabling Safe mode |
| Offer per-post CW labels | Rely on color alone for severity |

---

## C2K-specific

- **Group photo approval** already models moderation workflow — align UI with “pending / approved / denied” badges and moderator tools.
- **Education** content may stay SFW — still use CW for embedded community photos.

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md)
- [06-PRIVACY_AND_TRUST.md](./06-PRIVACY_AND_TRUST.md)
- [03-COMPONENT_LIBRARY.md](./03-COMPONENT_LIBRARY.md)
- [ADULT_PLATFORM_DESIGN_RESEARCH.md](../ADULT_PLATFORM_DESIGN_RESEARCH.md)
- [DESIGN_SYSTEM_RESEARCH.md](../DESIGN_SYSTEM_RESEARCH.md)
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md)
