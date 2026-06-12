# Sprint 2 CP4 — DetailTemplate Audit

**Status:** Complete (plan only — no implementation)  
**Branch:** `desktop-ui-sprint-2-template-migration`  
**Baseline:** `desktop-ui-sprint-2-cp3-baseline` (`b7d1c7e`)

## Purpose

Audit member-facing **detail** routes before any `DetailTemplate` migration. CP4 is documentation only; CP5/CP6 are implementation checkpoints.

## DetailTemplate reference

**File:** `packages/web/src/components/templates/DetailTemplate.tsx`

| Slot | Use |
|------|-----|
| `hero` | Cover/banner, title block, primary identity |
| `tabs` | Section navigation below hero |
| `sidebar` | Desktop right rail (`280px`, sticky `top-24`) |
| `children` | Main tab body / article / list content |
| `primaryAction` / `secondaryAction` | `MobileActionBar` (fixed bottom on mobile) |
| `actionStatus` | Status line above mobile bar |
| `className` | Width/padding overrides |

**Default shell:** `max-w-[1280px]`, gutters `px-4 sm:px-6 lg:px-8`, `lg:py-10`.

**Current usage:** Exported but **not used by any page** yet.

## Cross-cutting findings

| Finding | Impact |
|---------|--------|
| No detail route uses `DetailTemplate` today | CP5 is greenfield mapping, not refactor |
| Width mismatch | Most pages use `max-w-3xl` / `max-w-4xl` / `max-w-7xl` / `shellWideClass` (1920); template defaults to 1280px |
| `MobileActionBar` | Only `/events/:id` uses it today; media/education are good CP5 pilots |
| Community hubs | Groups/orgs use `CommunityHubShell`, not 2-col detail layout |
| Profile | `ProfilePageShell` is **3-column** — does not fit 2-col `DetailTemplate` |
| Convention hub | Custom shell + WS + gated tabs — poor `DetailTemplate` fit |
| Vendor hero | Full-bleed breakout outside container — needs template extension or hero-outside pattern |

---

## Route audits (audit order)

### 1. `/vendors/:id` (slug or UUID)

| Field | Detail |
|-------|--------|
| **Route param** | `vendors/:id` — accepts **slug or UUID** (`GET /api/v1/vendors/:vendorId`) |
| **Page path** | `packages/web/src/app/vendors/[id]/page.tsx` |
| **Shell** | Full-bleed hero (`w-screen` breakout); body `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` |
| **DetailTemplate?** | No |
| **Hero** | `VendorShopHeader` — banner OVERLAY/BELOW, logo SVG fallback, gradient when no banner |
| **Media fallbacks** | Banner gradient; logo icon; product grid “No image”; demo listings for demo shop |
| **Tabs** | None — `<details>` accordions (Policies, Blind feedback) |
| **Right rail** | `VendorShopSidebar` **dual mount**: mobile inline (`lg:hidden`) + desktop sticky (`lg:w-80`) |
| **Primary CTAs** | Visit store (outbound), Message on Kink Social, per-product Buy |
| **Secondary CTAs** | Breadcrumbs; convention vending links; owner Shop appearance / External store panels |
| **Safety** | No `ReportAction`. Blind feedback (purchase proof, owner verify). Trust disclaimers. Aggregate reviews only |
| **Data** | Inline `fetch` (no domain hook); `useAuth`; mock via `getMockVendorById` |
| **Loading / error** | Full-bleed pulse skeleton; “Vendor Not Found” inline; API errors fall back to mock |
| **Mobile** | No `MobileActionBar`; sidebar duplicated above main; hash scroll `#vending-soon` |
| **Desktop width** | `max-w-7xl` + full-bleed hero |
| **Duplicated patterns** | Dual sidebar mount (like `/media` directory); owner panels gated by `canManageShop` |
| **Risk** | **High** |
| **Strategy** | **Partial shell alignment** or **direct migration after extension**: optional full-bleed `hero` slot outside template width; map sidebar once (template owns responsive). Do **not** fold blind-feedback/owner tooling into template slots |
| **Must not change** | Slug/UUID resolution; blind feedback privacy; purchase-proof upload; external-store sync; demo listing fallback; `shopHeaderLayout`; checkout disclaimer; `#vending-soon` scroll |

---

### 2. `/presenters/:username`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/presenters/[username]/page.tsx` |
| **Shell** | `mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8` |
| **DetailTemplate?** | No |
| **Hero** | Inline header: avatar/`PlaceholderAvatar`, name, pronouns, headline, badges, expertise tags |
| **Media fallbacks** | `PlaceholderAvatar`; gallery lazy-load without placeholder tiles |
| **Tabs** | None — stacked sections |
| **Sidebar** | None |
| **Primary CTAs** | Social profile link; convention program links; external offering links |
| **Secondary CTAs** | Back to directory; series/education/article links; attendee review (`?eventId=` required) |
| **Safety** | `ReportAction`; `ScopePageMeta` + `noIndex` when UNLISTED; runner-material visibility + staff banner |
| **Data** | Inline fetch presenters/media/reviews; `useApiEducationSeriesByAuthor`; `useAuth` |
| **Loading / error** | Text “Loading…”; error heading + back link |
| **Mobile** | Single column; no `MobileActionBar`, sheets, or sticky actions |
| **Desktop width** | `max-w-3xl` (intentional reading width) |
| **Duplicated patterns** | Section headers; reused `MediaChannelCard`, `EducationArticleCard` |
| **Risk** | **Medium** |
| **Strategy** | **Direct migration** with `className` width override (`max-w-3xl` on template or children). `hero` = header block. Optional `MobileActionBar`: Social profile + Report |
| **Must not change** | UNLISTED SEO; runner-material gates; teaching credit verified vs self-reported; review `?eventId=` requirement; AUTHOR section ordering |

---

### 3. `/education/:slug`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/education/[slug]/page.tsx` |
| **Shell** | `mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8` |
| **DetailTemplate?** | No |
| **Hero** | Title block (category chips, h1, read time); optional hero image below CTAs |
| **Media fallbacks** | Hero omitted when null; `PlaceholderAvatar` for author |
| **Tabs** | None; `EducationSeriesNav` when series context |
| **Sidebar** | None; author block inline at bottom |
| **Primary CTAs** | Save bookmark (`useApiBookmarks`) or sign-in prompt |
| **Secondary CTAs** | Report; back to Education; presenter + member profile links |
| **Safety** | Content warnings (`role="alert"`); `ReportAction`; legal disclaimer footer |
| **Data** | `useApiEducationArticleBySlug`; `useApiBookmarks`; `useAuth` |
| **Loading / error** | Pulse skeleton; `EmptyState` + retry; missing slug → `Navigate` to `/education` |
| **Mobile** | Save/Report row (`min-h-11`); no `MobileActionBar` |
| **Desktop width** | `max-w-4xl` |
| **Duplicated patterns** | Save + Report row (same as media show) |
| **Risk** | **Medium** |
| **Strategy** | **Direct migration** — good CP5 pilot. `hero` = title block; prose/disclaimer in `children`. Optional `MobileActionBar`: Save + Report. Override width via `className` |
| **Must not change** | Sanitized HTML body; content warnings; legal footer; redirect on missing slug; bookmark toggle; series prev/next |

---

### 4. `/media/:slug`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/media/[slug]/page.tsx` |
| **Shell** | `mx-auto max-w-3xl px-4 py-6 sm:px-8` |
| **DetailTemplate?** | No |
| **Hero** | Cover tile + title row (no full-bleed) |
| **Media fallbacks** | Empty muted box when no cover; episode empty copy |
| **Tabs** | None |
| **Sidebar** | None on detail |
| **Primary CTAs** | Save channel; outbound platform links (`MediaOutboundBar`) |
| **Secondary CTAs** | Back to Media; owner presenter link; per-episode Watch/Listen |
| **Safety** | `StatusBanner` content warnings; owner draft/unlisted banner; `ReportAction` on show + episodes |
| **Data** | `useApiMediaShow`; `useApiBookmarks`; `useAuth` |
| **Loading / error** | `DancecardPanelSkeleton`; `LoadErrorBanner` + retry |
| **Mobile** | Header stacks `flex-col sm:flex-row`; no `MobileActionBar` |
| **Desktop width** | `max-w-3xl` |
| **Duplicated patterns** | Save + Report header (education pattern); external-only playback disclaimer |
| **Risk** | **Low–medium** |
| **Strategy** | **Direct migration** — **best CP5 pilot**. `hero` = cover + title + save/report; `children` = warnings, outbound, episodes. Optional `MobileActionBar` |
| **Must not change** | External-only playback model; episode link priority; owner status banner; report targets; bookmark type |

---

### 5. `/events/:id`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/events/[id]/page.tsx` → `EventDetailClient.tsx` |
| **Shell** | Manual `max-w-7xl`; no community shell |
| **DetailTemplate?** | No |
| **Hero** | 16:9 banner in main column, badges, title, when/location, org/group chips |
| **Tabs** | URL-synced (`useTabFromUrl`); dynamic set (Overview, Attendees, Vendors, Discussion, Safety, Schedule, Matchmaker); munch variant trims tabs |
| **Sidebar** | Desktop sticky RSVP card (`lg:w-80`) — going/interested/can't go, screening, calendar |
| **Primary CTAs** | RSVP (sidebar + **`MobileActionBar`**); save; copy link; host edit; convention link; ticket embed |
| **Safety** | Safety Info tab; `ReportAction`; location redaction until RSVP/approval |
| **Data** | Inline fetch; `useTabFromUrl`; `useAuth` |
| **Loading / error** | Skeleton; mock for non-UUID; `DEFAULT_EVENT` fallback |
| **Mobile** | Full-bleed hero `-mx-4`; horizontal tab scroll; **`MobileActionBar`**; `pb-24 lg:pb-6` |
| **Desktop width** | `max-w-7xl`; reading column `max-w-[768px]`; sidebar 320px |
| **Duplicated patterns** | Hero-in-main + sticky RSVP; only route using `MobileActionBar` as template intends |
| **Risk** | **Medium–high** |
| **Strategy** | **Defer to CP6** — closest semantic fit but RSVP/tab variance is high. If migrated: map hero/tabs/sidebar/MobileActionBar; align outer shell to `shellWideClass` not 1280px island |
| **Must not change** | RSVP flow; screening/waitlist; location redaction; munch tab sets; host tools; convention schedule embed; ticket embed |

---

### 6. `/groups/:id`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/groups/[id]/page.tsx` |
| **Shell** | `GroupCommunityShell` → `CommunityHubShell` (`max-w-7xl`) |
| **DetailTemplate?** | No |
| **Hero** | Cover + logo card: name, category, members, place, tags, join/leave, organizer link |
| **Tabs** | Mock vs API **different tab sets**; URL `?tab=`; Settings → organizer redirect |
| **Sidebar** | Tab-dependent page-level rails (channels left `lg:w-56`; right `xl` calendar/photos) |
| **Primary CTAs** | Join (`GroupJoinRulesModal`); leave; organizer dashboard |
| **Safety** | Join rules; vetted channel lock; membership-gated forums/feedback |
| **Data** | `useGroupDetail`; `GroupDetailProvider`; `useTabFromUrl` |
| **Loading / error** | Skeleton; `EmptyState` not-found |
| **Mobile** | Sticky tab bar (`CommunityHubShell`); channel pills; join in hero |
| **Desktop width** | `max-w-7xl`; tab-local grids |
| **Duplicated patterns** | Shared `CommunityHubShell` with orgs |
| **Risk** | **High** |
| **Strategy** | **Partial shell alignment only** — do not replace `GroupCommunityShell`. Treat `CommunityHubShell` as community detail primitive |
| **Must not change** | Mock/API tab divergence; join/rules; organizer redirect; leadership election; `GroupDetailProvider`; per-tab sidebars |

---

### 7. `/orgs/:slug`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/orgs/[slug]/page.tsx` → `OrgHubClient.tsx` |
| **Shell** | `OrgCommunityShell` → `CommunityHubShell` |
| **DetailTemplate?** | No |
| **Hero** | 21:9 banner, logo, metadata pills, join/leave, guidelines |
| **Tabs** | Feature-flag + content filtered: Overview, Calendar, Forums, Chat, About, FAQ, Subgroups, Documents; members-only preview gate |
| **Sidebar** | Overview-only `lg:grid-cols-12` aside; other tabs own layouts (forums 2-pane, chat, etc.) |
| **Primary CTAs** | Join/leave; review modal; organizer dashboard; RSVP; forum/chat compose |
| **Safety** | Chat disclaimer; scope ban; `ReportAction`; members-only preview hides tabs |
| **Data** | Inline `reloadOrg` + tab-scoped fetches; `useTabFromUrl` |
| **Loading / error** | Skeleton; `MembersJoinCommunityGate`; per-tab errors |
| **Mobile** | Sticky tabs; forum category `<select>` on small screens |
| **Desktop width** | `max-w-7xl`; tab-local max widths |
| **Duplicated patterns** | Richest community hub (~2700 LOC client) |
| **Risk** | **High** |
| **Strategy** | **Partial shell alignment only** — gutter/width via `shellWideClass`; never flatten to 2-col `DetailTemplate` |
| **Must not change** | `visibleTabs` logic; members preview; feature flags; chat/forum WS; report targets |

---

### 8. `/conventions/:slug`

| Field | Detail |
|-------|--------|
| **Page path** | `packages/web/src/app/conventions/[slug]/page.tsx` (~2420 LOC) |
| **Shell** | Custom `convention-public-shell` + theme CSS vars |
| **DetailTemplate?** | No |
| **Hero** | `ConventionHero` full-width: banner, register/manage, participate, preview-role exit |
| **Tabs** | Dynamic labels; **mobile primary 4 + More overflow**; `?tab=`; `previewRole`; Manage → organizer |
| **Sidebar** | `ConventionParticipationStrip` sticky (`lg+`, auth-only) |
| **Primary CTAs** | Register; pin; dancecard; ISO; channel compose; staff forms |
| **Safety** | `RegisterToUnlockCard`; preview-role gating; ISO moderation; logistics/CoC cards |
| **Data** | `useConventionHub`; WS schedule/channels; 45s schedule poll |
| **Loading / error** | Hub-level err/loading; per-tab states |
| **Mobile** | Split tab bar; `c2k-mobile-scroll-pad`; horizontal scroll + gradient |
| **Desktop width** | `max-w-7xl`; grid `lg:[1fr_17rem]`; main `max-w-4xl` |
| **Duplicated patterns** | Attendee OS: schedule WS, dancecard, dual channel backends |
| **Risk** | **Critical** |
| **Strategy** | **Leave for Sprint 3** or **outer chrome only** at CP6. Do not wrap in `DetailTemplate` without convention-specific adapter |
| **Must not change** | `useConventionHub`; WS scopes; schedule polling; mobile More tabs; access gates; preview roles; dancecard; channel hub/org mode |

---

### 9. `/profile/:username` and `/profile`

| Field | Detail |
|-------|--------|
| **Page paths** | `profile/[username]/page.tsx` (public); `profile/page.tsx` → `ProfilePageClient.tsx` (self) |
| **Shell** | `ProfilePageShell` (`shellWideClass`) — **3-column** desktop |
| **DetailTemplate?** | No |
| **Hero** | Desktop: `ProfileCoverHeader`. Mobile: `ProfileStoryView` stack |
| **Tabs** | Visibility-driven public tabs; URL `?tab=` |
| **Sidebar** | **Left** `ProfileStorySidebar`; **Right** `ProfileSocialRail` |
| **Primary CTAs** | Connect, follow (`ProfileViewerActions`); gallery |
| **Safety** | Adult content blur; ISO visibility; photo report (`TsReportModal`); connections visibility |
| **Data** | Inline fetches; `useGraphStatus`; `useAdultContentPreference`; `useApiProfileMe` (self) |
| **Loading / error** | Skeleton; `EmptyState` 404; owner offline warning |
| **Mobile** | `ProfileStoryView` then tabs; cover hidden on mobile inverse breakpoint |
| **Desktop width** | `shellWideClass`; grid `260–280px \| 1fr \| 240–260px` |
| **Risk** | **Critical (privacy)** |
| **Strategy** | **Leave for CP6 audit-last / Sprint 3** — document `ProfilePageShell` as profile primitive; needs 3-col template variant, not 2-col swap |
| **Must not change** | Tab visibility; adult blur; graph actions; ISO rules; photo manager (self); report modals; owner vs public paths |

---

## Mobile behavior summary

| Route | Special mobile patterns |
|-------|-------------------------|
| Vendor | Dual sidebar inline; no bottom bar |
| Presenter | Single column stack |
| Education | Save/Report row |
| Media | Stacked cover/header |
| **Event** | **MobileActionBar** RSVP; full-bleed hero; tab scroll |
| Group | Sticky hub tabs; join in hero |
| Org | Sticky hub tabs; forum mobile select |
| **Convention** | **Primary 4 tabs + More**; participation strip desktop-only |
| **Profile** | **Story view** replaces desktop cover; 3-col → 1-col |

DetailTemplate `MobileActionBar` must not be added without explicit CP5/CP6 scope per route.

---

## Risk summary

| Route | Risk | CP5/CP6 batch |
|-------|------|---------------|
| `/media/:slug` | Low–medium | **CP5** (pilot) |
| `/education/:slug` | Medium | **CP5** |
| `/presenters/:username` | Medium | **CP5** |
| `/vendors/:id` | High | **CP5** (partial or last in batch) |
| `/events/:id` | Medium–high | **Defer CP6** |
| `/groups/:id` | High | **Defer CP6** (shell only) |
| `/orgs/:slug` | High | **Defer CP6** (shell only) |
| `/conventions/:slug` | Critical | **Defer Sprint 3** |
| `/profile/*` | Critical | **Defer CP6** (audit-last) |

---

## DetailTemplate API gaps

| Gap | Routes affected | Recommendation |
|-----|-----------------|----------------|
| Default `max-w-[1280px]` vs reading widths | Presenter, education, media | Use `className` override; do not widen reading pages |
| Full-bleed hero outside shell | Vendor, event (mobile hero) | Optional `heroBleed` wrapper or hero rendered **above** template root |
| 3-column layout | Profile | Extend template or keep `ProfilePageShell` as separate primitive |
| Community hub tabs + tab-scoped sidebars | Group, org | Document `CommunityHubShell` as hub detail primitive — not `DetailTemplate` |
| Convention theme + gated tab matrix | Convention | No template change in Sprint 2 |
| Sidebar width `280px` vs `w-80` (320px) | Vendor | Align to one width when migrating |
| `MobileActionBar` unused on most routes | Media, education, presenter | Pilot on CP5 low-risk routes first |

**No new API required for CP5 pilot batch** if migrations use `className` width overrides and keep hero bleed outside template for vendor.

---

## Recommended CP5 implementation batch

**Implement (low-risk detail migrations):**

1. `/media/:slug` — pilot `DetailTemplate` + optional `MobileActionBar`
2. `/education/:slug` — article reading layout
3. `/presenters/:username` — sidebar-less, width override
4. `/vendors/:id` — **only after** full-bleed hero strategy decided; otherwise partial shell alignment only

**Defer:**

- `/events/:id` → CP6
- `/groups/:id`, `/orgs/:slug` → CP6 shell alignment only (no `DetailTemplate` swap)
- `/conventions/:slug` → Sprint 3
- `/profile/:username`, `/profile` → CP6 last (or Sprint 3)

---

## CP4 verification

| Check | Result |
|-------|--------|
| Code migrations | **None** |
| Page implementation changed | **No** |
| `npm run typecheck` / `build` | Not run (docs-only) |
