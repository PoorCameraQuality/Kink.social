# C2K — Page-by-Page UI Design Audit Report (Design-Docs Aligned)

**Audit date:** March 21, 2026  
**Report refresh:** March 21, 2026 — reconciled with current app code (shell, cards, routes, legal). See §8 remediation log.  
**Normative references:** [DESIGN_BIBLE.md](./DESIGN_BIBLE.md), [design/01](./design/01-BRAND_AND_IDENTITY.md)–[08](./design/08-DESIGN_TOKENS.md)  
**Evidence / rationale:** [DESIGN_RESEARCH.md](./DESIGN_RESEARCH.md), [DESIGN_SYSTEM_RESEARCH.md](./DESIGN_SYSTEM_RESEARCH.md), [ADULT_PLATFORM_DESIGN_RESEARCH.md](./ADULT_PLATFORM_DESIGN_RESEARCH.md)  
**Project status context:** [PROJECT_AUDIT.md](./PROJECT_AUDIT.md), [NEXT_STEPS.md](./NEXT_STEPS.md)

---

## 1. How to read this report

### 1.1 Audit rubric (frozen)

Each finding is checked against these dimensions:

| Dimension | Doc |
|-----------|-----|
| Layout & responsive | [02-LAYOUT](./design/02-LAYOUT_AND_RESPONSIVE.md) |
| Navigation & IA | [04-NAVIGATION](./design/04-NAVIGATION_AND_IA.md) |
| Tokens & visual consistency | [08-TOKENS](./design/08-DESIGN_TOKENS.md) |
| Components & states | [03-COMPONENTS](./design/03-COMPONENT_LIBRARY.md) |
| Content & safety | [05-CONTENT](./design/05-CONTENT_AND_SAFETY.md) |
| Privacy & trust | [06-PRIVACY](./design/06-PRIVACY_AND_TRUST.md) |
| Brand & copy | [01-BRAND](./design/01-BRAND_AND_IDENTITY.md) |
| Accessibility & performance | [07-A11Y](./design/07-ACCESSIBILITY_AND_PERFORMANCE.md) |

### 1.2 Severity labels

| Severity | Meaning |
|----------|---------|
| **P0** | Broken UX, incorrect data for route, invalid HTML, or legal/trust risk when content is real — fix before public beta. |
| **P1** | Clear spec violation vs Design Bible / topic docs, or major a11y/IA gap — fix in next UI pass. |
| **P2** | Polish, consistency, future-proofing (skeletons for mock-only), or doc exceptions to document. |

---

## 2. Executive summary

### 2.1 Headline outcomes (March 2026 codebase)

- **Shell & navigation** match **04** (five-item bottom nav, `c2k-*` tokens, `main#main-content`, skip link). **`safe-area-pb`** is defined in `globals.css` and applied on **BottomNav**; root layout uses `pb-[calc(4rem+env(safe-area-inset-bottom))]` on mobile.
- **CreateFlowModal** implements Escape, initial focus, Tab wrap (focus containment), and focus restore on close.
- **Layout:** `/home` Local column uses **`max-w-[640px]`**; event detail and profiles still use wider shells in places — **02** tightening may remain **P1/P2**.
- **Education:** **`/education/[slug]`** resolves content via **`getMockArticleBySlug`** with **`notFound()`** for unknown slugs — prior **P0** data issue **addressed**.
- **Cards:** **EventCard** / **EducationCard** split **Link** vs bookmark **button** (sibling layout, not nested) — prior **P0** HTML issue **addressed**.
- **Content safety (05):** Shared **CW / blur-reveal** for feeds and galleries is still **not** implemented — remains the main **pre-launch** gap when media is real.
- **Privacy & trust (06):** Consent-first DM/media flows and full report/block surfaces are still partial (messaging has safety copy + Support link; profile/report gaps remain **P1**).

### 2.2 Approximate finding counts

| Severity | Count (approx.) |
|----------|-----------------|
| P0 (blocking HTML/data bugs) | **0** — slug, nested interactives, and safe-area items addressed in code |
| P0-class (product risk when real media ships) | **1 theme** — **05** CW / sensitive media (see §3.4) |
| P1 | 35+ (reduced after waves; many shell/feed/vendor/education items closed) |
| P2 | 50+ |

*Counts are approximate; use §3–4 tables as source of truth.*

### 2.3 Top 10 prioritized actions (next)

1. **05 / P0-class** — Introduce **`SensitiveMedia`** (CW + blur/reveal) and apply to feeds, cards, and group photos before NSFW media goes live.
2. **P1** — **Endorse** on `/profile/[username]` — optimistic UI + mock mutation ([NEXT_STEPS.md](./NEXT_STEPS.md) Phase B).
3. **P1** — **Event detail** tabs — replace “coming soon” panes with mock content or collapsible sections.
4. **P1** — **Group Join** / **GroupHeader** — mock membership state.
5. **P1** — **Notifications** — list UI backed by mock data (no push).
6. **P1** — **Profile / discovery** — report/block entry points, Connect/Message semantics (**06**).
7. **P1** — **CreateFlowModal** event wizard — visible `<label>`/ids for event fields (trap/Escape done).
8. **P2** — **Tag browse** (`/tags/[tag]`) — optional URL state for section tabs; **LocalPostCard** full **05** anatomy (overflow, tags, comment preview).
9. **P2** — Remaining **`next/image`** + lint hygiene on gallery/cards; list virtualization for long feeds.
10. **P2** — Legal/static pages — replace placeholder copy in **ComingSoonLayout** bodies when counsel approves (structure/CTAs already present).

---

## 3. Global cross-cutting themes

### 3.1 Shell & navigation consistency

| Issue | Doc | Sev | Status / suggested fix | Files |
|-------|-----|-----|------------------------|--------|
| `safe-area-pb` on BottomNav | 04, 07, 08 | — | **Addressed:** `.safe-area-pb` in `globals.css`; BottomNav uses class | `BottomNav.tsx`, `globals.css` |
| Main bottom padding + safe area | 02, 07 | — | **Addressed:** `pb-[calc(4rem+env(safe-area-inset-bottom))]` on mobile | `layout.tsx` |
| Create modal: focus trap, Escape, focus return | 04, 07 | P2 | **Addressed** (custom Tab cycle + Escape + restore); optional Radix later | `CreateFlowModal.tsx` |
| Event wizard fields: placeholder-only, no `<label>` | 03, 07 | P1 | Labels + `htmlFor` / `id` | `CreateFlowModal.tsx` |
| `/connections` in `site.config` `navSecondary` | 04 | — | **Addressed:** `src/app/connections/page.tsx` exists | `connections/page.tsx` |
| Skip link to `#main-content` | 07 | — | **Addressed:** first focusable link in `layout.tsx` | `layout.tsx` |
| Bottom nav active: color only; doc asks weight too | 04 | P2 | `font-semibold` when active | `BottomNav.tsx` |
| Header badges use raw `bg-red-500` vs semantic token | 08 | P2 | `--c2k-danger` / theme | `Header.tsx` |
| Mobile menu duplicates bottom nav destinations | 04 | P2 | Reduce redundancy per breakpoint | `Header.tsx`, `BottomNav.tsx` |
| BottomNav home active logic may mishandle `/` vs `/home` | 04 | P2 | Verify pathname checks | `BottomNav.tsx` |
| `html { scroll-behavior: smooth }` without reduced-motion guard | 07 | P2 | `@media (prefers-reduced-motion)` | `globals.css` |
| Modal z-index vs token scale | 08 | P2 | Align or document | `CreateFlowModal.tsx` |

**Matches:** Five bottom tabs with labels; `c2k-*` shell; `main id="main-content"`; global `focus-visible` in `globals.css`; Create trigger pattern via `data-create-trigger`.

### 3.2 Token & theming debt

- Raw Tailwind **red/amber/green** for status/destructive across cards and group UI vs **08** semantic intent colors.
- **`text-[10px]`** bottom labels — review readability vs **08** scale (acceptable for chrome if a11y names exist).

### 3.3 Accessibility & performance hotspots

- **Forms:** missing labels / `aria-label` on discovery, events, groups, vendors, education search; role toggles without **`aria-pressed`** / **fieldset** (profile/edit roles, TagSelector).
- **Touch targets:** tab chips, filter close — improved in waves; **LocalPostCard** primary row uses **min-h-11**; Comment/Share/Bookmark **disabled** (honest demo) with tooltips (**07**).
- **Images:** widespread **`<img>`** vs **`next/image`** (lint warnings); LCP/CLS risk.
- **Settings** page: disabled controls — document as intentional until API (**03** partial state).

### 3.4 Content safety readiness (05)

- Feeds, tag pages, group photos, vendor/event cards: **no CW/blur/reveal** component; plan shared **`SensitiveMedia`** wrapper before NSFW media goes live.
- **LocalPostCard:** missing overflow menu, tags row, media shell, comment preview (**05** anatomy).

### 3.5 Shared components (cards / ui / group)

| Issue | Doc | Sev | Suggested fix | Example files |
|-------|-----|-----|---------------|----------------|
| Button inside Link on cards | 07, HTML | — | **Addressed:** Link + button as siblings (`EventCard`, `EducationCard`) | `EducationCard.tsx`, `EventCard.tsx` |
| No CW on `<img>` in cards/galleries | 05 | P1 | Shared CW shell | `EventCard`, `VendorCard`, `GroupPhotosSection` |
| TabButton without tab semantics | 07 | P1 | `role="tablist"` / `aria-selected` or rename pattern | `TabButton.tsx` + consumers |
| TagSelector toggles without `aria-pressed` | 07 | P1 | `aria-pressed` + labels | `TagSelector.tsx` |
| Semantic status colors | 08 | P2 | Token mapping | Multiple `cards/`, `group/` |
| `href="#"` / emoji pin in channel posts | 03 | P2 | Real hrefs + Lucide | `ChannelPostsSection.tsx` |
| Delete confirm inconsistency | 05 | P2 | Align LocalPost vs channel posts | `LocalPostCard.tsx`, `ChannelPostsSection.tsx` |

---

## 4. Route-by-route findings

### 4.1 Global shell & landing

| Route / file | Status | Notes |
|--------------|--------|--------|
| `layout.tsx` | Shell | `pb-[calc(4rem+env(...))] md:pb-0`; skip link to `#main-content`; review redundant `role="main"` if any. |
| `page.tsx` (landing) | Full | Strong **01**/**08** token use; responsive hero. |
| `globals.css` | Shell | `:root` tokens; smooth scroll needs reduced-motion. |
| `Header.tsx` | Shell | Mock logged-in; search desktop + mobile link to discovery; badge colors. |
| `Footer.tsx` | Shell | `aria-label` on nav; focus ring pattern differs from globals. |
| `BottomNav.tsx` | Shell | Matches **04** five destinations; `safe-area-pb` applied; active style P2. |
| `CreateFlowModal.tsx` | Shell | `role="dialog"`; trap/Escape/restore implemented; event labels still P1. |
| `site.config.ts` | Config | `/connections` route present. |

*(Detail tables: see §3.1.)*

---

### 4.2 `/home`, `/discovery`, `/tags/[tag]`, `/feed`

| Route | Status (audit) | What matches | Key gaps (doc → sev) |
|-------|----------------|--------------|----------------------|
| `/home` | Partial | Gutters; **~640px** main column; horizontal **TabButton** list; **`?tab=`** sync; composer **Post** adds mock local post; `c2k-*` tokens; sidebar `xl+`. | Skeleton/empty **P2**; sidebar mobile stacking **P2**; `/feed` redirect vs tab casing verify **P2**. |
| `/discovery` | Partial | Gutters; Load more; filters; empty states and search improvements from prior waves. | URL state for filters optional **P2**; further a11y polish **P2**. |
| `/tags/[tag]` | Partial | Gutters; per-section empty copy; writings `max-w-2xl`. | Section tabs not URL-synced **P2**; CW future **P1**; custom tab buttons vs TabButton **P2**. |
| `/feed` | Full (redirect) | Redirect to `?tab=local`. | Mismatch with home tab id **P1** unless normalized. |

**LocalPostCard** (cross-cutting): Love wired (local increment); secondary actions disabled + tooltips; full **05** anatomy (overflow, tags, media) still **P2**.

---

### 4.3 Profile, onboarding, messaging, notifications, chat

| Route | Status | Key gaps |
|-------|--------|----------|
| `/profile` | Full / partial tabs | Own profile shows Connect/Message **P1** (06); wide `max-w-7xl` vs 768 profile column **P2** (02); placeholder tabs vs **03** empty template **P1**; media alt **P1** (07); overflow/report **P1** (05/06). |
| `/profile/edit` | Partial | Roles a11y group/pressed **P1**; photo as div not file input **P1**; privacy helper copy **P1** (06). |
| `/profile/[username]` | Partial | Unknown user not distinct **P1**; no report/block **P1**; consent messaging **P1** (06). |
| `/profile/complete` | Partial | Inclusive age hint + label **addressed**; **Complete Signup!** → `/home` when valid; photo keyboard/drag **P1** polish. |
| `/onboarding` | Partial | Step 1 location label **P1**; privacy labels human-readable **P1** (06); trust toggles expectations **P2** (01). |
| `/messaging` | Partial | Safety strip + Support link; **Send** appends to active thread (mock); per-conversation messages. Consent-first / guarded media **P1** (05/06); further a11y **P2**. |
| `/notifications` | Placeholder | Thin structure vs **03** empty + **07** lists **P2**. |
| `/chat` | Placeholder | **04** IA doesn’t list `/chat` vs `/messaging` **P2**; empty state CTA **P2**. |

---

### 4.4 Groups, events, places, community cluster

| Route | Status | Key gaps |
|-------|--------|----------|
| `/groups` | Full | Grid vs `minmax(280px,1fr)` **P2** (02); search label **P2**; empty filtered **P2**; disabled Create **P2**. |
| `/groups/[id]` | Full | Many tabs — keyboard composite **P2** (04/07); photos need CW **P1** (05); small mod buttons **P2** (07). |
| `/events` | Full | In-person/virtual filter unwired **P1** (product+UI); search label **P2**; mobile filter parity **P2**. |
| `/events/[id]` | Partial | Main column not ~768px **P1** (02); tab URL sync **P2** (04); placeholder tabs **P2** (03); RSVP bar hardcoded **P2**. |
| `/places` | Partial | IA expectation vs state grid **P2** (04); long button grid ergonomics **P2** (07). |
| `/calendar`, `/states`, `/rendezvous`, `/online`, `/community`, `/dungeons`, `/forums` | Placeholder | Uniform “coming soon” — richer template + CTA **P2** (01/03/04). |

---

### 4.5 Vendors & education

| Route | Key gaps |
|-------|----------|
| `/vendors` | Filters + search wired; empty states; labels improved — residual grid/touch **P2**. |
| `/vendors/[id]` | Banner may use `next/image` in places; Products/Reviews placeholders **P2** (03). |
| `/education` | Search + filters wired; empty states — residual **P2**. |
| `/education/[slug]` | **Slug lookup + `notFound()`** — **addressed**; TOC/anchor edge cases **P2** (07). |

---

### 4.6 Static / legal / support

| Routes | Key gaps |
|--------|----------|
| `about`, `contact`, `support`, `privacy`, `terms`, `guidelines`, `accessibility` | **ComingSoonLayout** + primary/secondary CTAs; copy notes WCAG/accessibility intent on `/accessibility`. **Support** includes demo **FeedbackForm**. Final legal copy still **P2** (counsel). |

**Note:** `settings` — controls disabled; align future layout with **04** settings IA when wired.

---

## 5. Appendix A — Route inventory (38 `page.tsx` files)

| # | Route | File | Audit bucket |
|---|-------|------|----------------|
| 1 | `/` | `src/app/page.tsx` | Shell / landing |
| 2 | `/home` | `src/app/home/page.tsx` | Feed |
| 3 | `/feed` | `src/app/feed/page.tsx` | Redirect |
| 4 | `/discovery` | `src/app/discovery/page.tsx` | Feed / explore |
| 5 | `/connections` | `src/app/connections/page.tsx` | Social / suggestions |
| 6 | `/tags/[tag]` | `src/app/tags/[tag]/page.tsx` | Feed / explore |
| 7 | `/events` | `src/app/events/page.tsx` | Events |
| 8 | `/events/[id]` | `src/app/events/[id]/page.tsx` | Events |
| 9 | `/groups` | `src/app/groups/page.tsx` | Groups |
| 10 | `/groups/[id]` | `src/app/groups/[id]/page.tsx` | Groups |
| 11 | `/places` | `src/app/places/page.tsx` | Places |
| 12 | `/vendors` | `src/app/vendors/page.tsx` | Vendors |
| 13 | `/vendors/[id]` | `src/app/vendors/[id]/page.tsx` | Vendors |
| 14 | `/education` | `src/app/education/page.tsx` | Education |
| 15 | `/education/[slug]` | `src/app/education/[slug]/page.tsx` | Education |
| 16 | `/profile` | `src/app/profile/page.tsx` | Profile |
| 17 | `/profile/edit` | `src/app/profile/edit/page.tsx` | Profile |
| 18 | `/profile/[username]` | `src/app/profile/[username]/page.tsx` | Profile |
| 19 | `/profile/complete` | `src/app/profile/complete/page.tsx` | Profile |
| 20 | `/onboarding` | `src/app/onboarding/page.tsx` | Onboarding |
| 21 | `/messaging` | `src/app/messaging/page.tsx` | Messaging |
| 22 | `/notifications` | `src/app/notifications/page.tsx` | Messaging |
| 23 | `/chat` | `src/app/chat/page.tsx` | Messaging |
| 24 | `/settings` | `src/app/settings/page.tsx` | Settings |
| 25 | `/about` | `src/app/about/page.tsx` | Static |
| 26 | `/contact` | `src/app/contact/page.tsx` | Static |
| 27 | `/support` | `src/app/support/page.tsx` | Static |
| 28 | `/privacy` | `src/app/privacy/page.tsx` | Legal |
| 29 | `/terms` | `src/app/terms/page.tsx` | Legal |
| 30 | `/guidelines` | `src/app/guidelines/page.tsx` | Legal |
| 31 | `/accessibility` | `src/app/accessibility/page.tsx` | Legal |
| 32 | `/calendar` | `src/app/calendar/page.tsx` | Placeholder |
| 33 | `/community` | `src/app/community/page.tsx` | Placeholder |
| 34 | `/dungeons` | `src/app/dungeons/page.tsx` | Placeholder |
| 35 | `/forums` | `src/app/forums/page.tsx` | Placeholder |
| 36 | `/online` | `src/app/online/page.tsx` | Placeholder |
| 37 | `/rendezvous` | `src/app/rendezvous/page.tsx` | Placeholder |
| 38 | `/states` | `src/app/states/page.tsx` | Placeholder |

*Global shell components are not separate routes but are audited in §3.1 and §4.1.*

---

## 6. Appendix B — Follow-on work (not in this document)

- Prioritize **05** sensitive-media wrapper before public beta with real uploads.
- Phase **B** mock flows: endorse, event detail content, group join, notifications list — see [NEXT_STEPS.md](./NEXT_STEPS.md).
- Re-run this rubric after each major UI milestone.
- Optional: add **Storybook** or visual regression later for card/grid consistency.

---

## 7. Methodology

- Parallel **read-only** codebase audits grouped by route area + shared components.
- Findings merged and severities normalized to **P0 / P1 / P2** by the coordinator.
- **March 2026:** This report document was **updated** to match the codebase; earlier “no source changes” referred to the original audit pass only.

---

---

## 8. Remediation log (post-audit)

**March 2026** — Parallel UI waves implemented in app code (shell, home/discovery, vendors/education, profile/messaging, events, primitives, tokens, stub routes). Key items from this report addressed include: education slug routing, card link/button split, safe-area + bottom nav, `?tab=` sync (home/profile), feed column width, discovery/vendor/education filters + empty states, event detail width + tab URL + event filters, `TabButton`/`TagSelector`/`LocalPostCard` a11y, semantic danger/success/warning tokens, reduced-motion for smooth scroll, `next/image` on EventCard + VendorCard, **`ComingSoonLayout`** on thin placeholder routes (calendar, chat, forums, dungeons, states, online, community, rendezvous, notifications). Outstanding: CW/blur media (**05**), full keyboard tab composites, remaining legal-page copy, and any features still mock-only.

**March 21, 2026 (doc + UX honesty pass)** — This report text refreshed to remove stale **P0** claims (slug, nested interactives, missing safe-area/skip link). Documented: **`/connections`** route; legal/static **`ComingSoonLayout`**; **Support** demo **FeedbackForm**; **PersonCard** **TrustTierIndicator**; home **Post** (`addMockLocalPost`), messaging **Send**, **profile/complete** navigation, **LocalPostCard** honest disabled actions. Landing: **`WelcomeBanner`** wired on `/` (dismissible). Outstanding unchanged: **05** CW layer, counsel-ready legal copy, Phase B mock features.

*End of report.*
