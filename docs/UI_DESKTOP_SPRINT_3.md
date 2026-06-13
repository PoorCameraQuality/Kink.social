# Desktop UI Sprint 3 — Visual Experience Polish

**Status:** Checkpoint 1 complete (visual audit, no implementation)  
**Branch:** `desktop-ui-sprint-3-visual-polish` (recommended; may start from `desktop-ui-sprint-2-visual-baseline`)  
**Baseline tag:** `desktop-ui-sprint-2-visual-baseline`  
**Sprint 2 handoff:** Directory/detail template foundation complete enough — **do not continue CP6 migration unless regression found**

## Goal

Make the logged-in desktop app feel visually premium, modern, exciting, adult, trustworthy, and coherent on desktop — **without** breaking functionality or mobile.

This is the “make it pretty” sprint. Stop organizing the toolbox; start making the product feel good.

## Hard rules (all checkpoints)

- No route, auth, API, schema, permission, onboarding, upload, payment, or moderation logic changes
- No event registration or RSVP logic changes
- No group/org/vendor/presenter membership or application logic changes
- No new sensitive profile fields
- No mobile redesign (`lg+` only; protect 768–1023 handoff)
- No explicit imagery; no stock sexual imagery
- No em dashes in user-facing copy

## Design direction

Keep existing kink.social dark/gold brand. Add atmosphere through:

- Subtle gradients and surface layering
- Restrained glow
- Richer cards and section rhythm
- Stronger hero/header composition

**Do not:** new color theme, neon, childish UI, crypto-dashboard aesthetic, generic Tailwind SaaS look.

**Target feel:** warmer, darker, richer, more dimensional, less empty, less generic SaaS, less internal/admin, more social, more alive, more polished, more human.

## Checkpoint progress

| CP | Scope | Status |
|----|-------|--------|
| 1 | Visual audit from screenshots → ranked polish plan | **Complete** (this doc §CP1) |
| 2 | Global atmosphere and surface polish | Pending |
| 3 | Page header and hero polish | Pending |
| 4 | Card composition polish | Pending |
| 5 | Right rail and dashboard-adjacent polish | Pending |
| 6 | Desktop polish pass by priority route | Pending |
| 7 | Verification + screenshot matrix | Pending |

---

## Checkpoint 1 — Visual audit (screenshots)

**Source:** Sprint 1 audit packet — 186 captures at 1280–1920 in [`docs/audits/ui/screenshots/ui-desktop-audit/`](audits/ui/screenshots/ui-desktop-audit/). Manifest: [`desktop-screenshot-manifest.json`](audits/ui/generated/desktop-screenshot-manifest.json). Heuristics: [`UI_DESKTOP_REDESIGN_RISK_REPORT.md`](audits/ui/screenshots/UI_DESKTOP_REDESIGN_RISK_REPORT.md).

**Viewports reviewed:** 1440, 1600, 1920 (plus 1280 where noted). Wider viewports amplify empty whitespace; polish should scale rails/content proportionally.

**Gaps:** `/groups` discover and `/orgs` directory list were not in the screenshot packet (audit captured group detail and org hub only). Classifications for those routes infer from Sprint 2 migrations + sibling directory patterns. Regenerate in CP7.

### Classification legend

| Tag | Meaning |
|-----|---------|
| **Strong** | Coherent layout; polish is refinement not rescue |
| **Acceptable** | Functional; needs atmosphere/cards/rails |
| **Weak** | Empty, flat, or visually underwhelming |
| **Too dense** | Cluttered above fold; needs hierarchy not more chrome |
| **Too admin** | Settings/console density on member surfaces |
| **Too generic** | Flat SaaS cards, no brand warmth |
| **Hero/header** | Title block, description, or CTA placement weak |
| **Cards** | Card surfaces, media fallbacks, hover hierarchy |
| **Rails** | Left/right rail surfaces feel utilitarian or empty |
| **CTA** | Primary/secondary action competition |
| **Spacing** | Section rhythm, vertical breathing, wide-viewport void |
| **Media** | Empty aspect boxes, broken/placeholder imagery |

### Per-route audit

| Route | Overall | Tags | Notes (1440–1920) |
|-------|---------|------|-------------------|
| `/home` | Acceptable | weak pockets, too generic, hero/header, cards, rails, spacing, media | Richest member surface but still dashboard-flat. Welcome block + feed tabs compete; 6–9 empty media regions; broken avatars at 1280. Right rail widgets (upcoming, PYMK, trending) are plain list cards. Strongest candidate for “alive” polish after global surfaces. |
| `/explore` | **Strong** (relative) | cards, rails, spacing, media | Best hero composition in packet (featured beach card + upcoming rail). Still flat card borders; 8 empty media slots in heuristics. Right rail date blocks are good pattern to extend. |
| `/people` | Acceptable | too generic, cards, rails, spacing | DirectoryTemplate reference. PersonCard grid is readable but uniform grey boxes; recommended gold border is only accent. Left filter panel is dense/form-like. Right rail safety + suggestions need surface warmth. |
| `/events` | Acceptable | too dense, cards, rails, spacing, media | Most complete directory UX. 14 empty media regions (highlights + list). Three-col works; left agenda rail and right host CTA feel utilitarian. EventCard list rows are strong structure, weak atmosphere. |
| `/groups` | Acceptable *(inferred)* | hero/header, cards, rails, spacing | **No discover screenshot** — packet has group hub only. Post-CP2 DirectoryTemplate: scope tabs + list cards. Expect plain list rows, sparse right rail duplication, filter drawer not matching Events polish. |
| `/orgs` | Acceptable *(inferred)* | hero/header, cards, rails, spacing | **No `/orgs` list screenshot** — packet has org hub detail. OrganizationsHero is marketing-forward; directory grid + right rail need same card/rail treatment as vendors/events. |
| `/vendors` | Acceptable | weak pockets, too generic, hero/header, cards, rails, media | CP2 migration solid. Hero trust note + List shop CTA good. 11 empty media regions on vendor cards; grey placeholder initials feel admin. Right rail (vending soon, featured, safety) is text-heavy. |
| `/presenters` | Acceptable | acceptable but plain, hero/header, cards, spacing | Single-column hero card works; narrow max-width leaves wide void at 1600–1920. PresenterCard gradients on avatars are best card color in packet — extend pattern. |
| `/education` | **Strong** (relative) | too dense, cards, rails, media, CTA | Richest hub: hero glow, carousels, topic chips. “SOON” / not-wired copy reads admin. Empty article media slots. Left nav + right progress cards need surface harmony with center hero. |
| `/media` | Weak | weak/empty, hero/header, cards, rails, spacing | Empty-state dominates packet (seed has no channels). Page feels hollow despite good copy. Aside explainer cards are strongest element — main column needs atmosphere even when empty. |
| `/conventions` | Acceptable | cards, spacing, hero/header | Sidebar-main layout clean. Single featured card + wide void at 1920. Convention row card is good candidate for CP4 media/treatment polish. |
| `/places` | Weak | weak/empty, too generic, cards, hero/header, spacing | Sidebar-less directory; simple text cards, no imagery. “Location filters coming soon” bar is dead weight. Lowest visual energy in packet. |
| `/messaging` | Acceptable | spacing, rails, CTA | Split inbox layout correct. Duplicate empty CTAs (sidebar + main). Large dead zone in conversation pane; safety rail is minimal. Functional, not premium. |
| `/notifications` | Acceptable | spacing, rails, cards | Left app nav + single notification reads sparse at 1920. Notification row styling is fine; page needs density balance not more nav. Trust profile card in left rail duplicates home. |
| `/profile` | Acceptable | too dense, hero/header, cards, spacing, media | Hero gradient is best profile atmosphere in packet. Tabbed studio layout feels admin (form sections, upload dropzone). Multiple H1 heuristic. High polish payoff but **defer functional areas** — visual only. |
| `/settings/account` | Weak | too admin, too generic, spacing, cards | Form-forward settings shell. Flat bordered cards, staff moderation block visible to mod user. Lowest “social” energy — polish via surfaces/typography only. |

### Cross-cutting findings (all routes)

1. **Global atmosphere is the highest leverage fix** — background is near-flat black; subtle gold radial exists on some heroes but not unified. CP2 before per-page whack-a-mole.
2. **Card surfaces are uniform grey boxes** — `card-surface` from Sprint 1 helped; still need depth, border rhythm, hover lift, media fallback treatment.
3. **Right rails are utilitarian** — repeated SectionCard pattern, weak visual hierarchy, empty widgets (“No trending”, “No vending soon”) feel broken not intentional.
4. **1920 whitespace** — content islands float; rails drift outward. Address via shell max-width rhythm in CP2/CP6, not new layouts.
5. **Mobile chrome on desktop** — bottom nav visible in heuristics at desktop widths; hide/refine in CP2 (visual only).
6. **Hero/header inconsistency** — Explore + Education lead; Places + Media + Settings trail. Standardize title block, description, and action row in CP3.
7. **Do not migrate more templates** — Sprint 2 foundation is enough; remaining gaps are visual quality.

---

## Ranked polish plan (CP2–CP7 execution order)

Priority score = member traffic × visual gap × fix leverage. **Implement in this order.**

### Tier 0 — Foundation (CP2)

| # | Work | Routes/components | Why first |
|---|------|-------------------|-----------|
| 1 | App/page background atmosphere | `RootLayout`, shell wrappers, `dc` page tokens | One diff lifts every route |
| 2 | Card + section surface system | `card-surface`, `SectionCard`, rail panels | Shared by 16 audited routes |
| 3 | Border, shadow, hover/focus rhythm | Global `dc` utilities | Premium feel without new colors |
| 4 | Header depth (top nav + subnav) | `AppHeader`, subnav bar | Every route shares it |
| 5 | Rail surface treatment | `*RightRail`, `*LeftRail` wrappers | 20+ rails, one visual pass |
| 6 | Empty state harmony | `EmptyState`, domain empty panels | Stop “broken” empty widgets |
| 7 | Desktop bottom-nav suppression | `lg+` visibility | Heuristic flag across packet |

### Tier 1 — Headers & heroes (CP3)

| # | Route | Focus |
|---|-------|-------|
| 1 | `/home` | Welcome block composition, feed tab band, reduce dashboard tone |
| 2 | `/explore` | Preserve featured hero; strengthen filter chip band |
| 3 | `/events` | Title + chip row + highlights carousel header |
| 4 | `/groups` | Discover header + scope tabs (infer; verify with new screenshots) |
| 5 | `/orgs` | `OrganizationsHero` depth + toolbar band |
| 6 | `/vendors` | Trust note + List shop hierarchy |
| 7 | `/education` | Hub hero glow consistency, reduce “SOON” admin tone visually |
| 8 | `/media` | Header + empty-state hero (make empty feel intentional) |
| 9 | `/profile` | Cover gradient, action row, tab strip polish (no field changes) |

### Tier 2 — Cards (CP4)

| # | Component | Priority |
|---|-----------|----------|
| 1 | `EventCard` | Highest traffic directory |
| 2 | Feed cards (home) | Social “alive” feel |
| 3 | `PersonCard` | People directory |
| 4 | `GroupCard` / discover list row | Groups |
| 5 | `OrgCard` / `OrgDirectoryCard` | Orgs |
| 6 | `VendorCard` | Media fallbacks + CTA |
| 7 | `PresenterCard` | Extend avatar gradient language |
| 8 | `EducationCard` | Carousel + grid variants |
| 9 | `MediaCard` | For when content exists |

### Tier 3 — Right rails (CP5)

| # | Rail | Route |
|---|------|-------|
| 1 | Upcoming events | `/home`, `/explore`, `/events` |
| 2 | Suggested groups / PYMK | `/home`, `/people` |
| 3 | Profile completion | `/home`, left nav |
| 4 | Education/media suggestions | `/education`, `/media` |
| 5 | Vendor/org suggestions | `/vendors`, `/orgs` |
| 6 | Trust/safety reminders | Messaging, notifications, people |

### Tier 4 — Route pass (CP6)

Execute in user-specified order after Tiers 0–3:

1. `/home` → 2. `/explore` → 3. `/events` → 4. `/groups` → 5. `/orgs` → 6. `/vendors` → 7. `/education` → 8. `/media` → 9. `/people` → 10. `/profile` → 11. `/messaging` → 12. `/notifications`

**Also polish when touching nearby surfaces:** `/conventions`, `/places`, `/settings/account` (lower traffic).

**Stop rule:** If a change requires API, routing, or behavior — stop; log for product backlog.

### Tier 5 — Verification (CP7)

- `npm run typecheck -w web`
- `npm run build -w web`
- `npm run test:e2e:smoke`
- `npm run audit:ui-desktop` (dev server required)
- Full screenshot matrix (375–1920) per Sprint 3 spec
- Mobile safety report update

---

## Recommended next sprint (after Sprint 3)

| Option | When |
|--------|------|
| **Sprint 4: Detail page atmosphere** | If CP6 leaves event/group/org/convention/profile hubs visually behind |
| **Sprint 4: Organizer visual fork** | Only if organizer surfaces must match member polish (separate token stack today) |
| **Resume CP6 template migration** | Only if verification finds layout regression — not for polish |

---

## Rollback

```powershell
git reset --hard desktop-ui-sprint-2-visual-baseline   # undo all Sprint 3 visual work
```
