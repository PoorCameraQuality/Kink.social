# Coast to Coast Kink – Routing & Pages Audit

**Audit date:** March 14, 2026  
**Scope:** All routes in `src/app/`, layouts, redirects, and nav links.

> **March 2026 — superseded for current routing:** This file describes the **legacy Next.js** app layout (see `legacy/`). The **live** SPA uses **`packages/web/src/router.tsx`** (Vite + React Router). For org hub, conventions, presenters, and API-backed routes, use **[FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)** first.

---

## 1. Full Route List (from file structure)

| Route Path | File | Implementation Status |
|------------|------|------------------------|
| `/` | `src/app/page.tsx` | Full |
| `/feed` | `src/app/feed/page.tsx` | Redirect only |
| `/home` | `src/app/home/page.tsx` | Full |
| `/discovery` | `src/app/discovery/page.tsx` | Full |
| `/events` | `src/app/events/page.tsx` | Full |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Partial |
| `/groups` | `src/app/groups/page.tsx` | Full |
| `/groups/[id]` | `src/app/groups/[id]/page.tsx` | Full |
| `/places` | `src/app/places/page.tsx` | Partial |
| `/vendors` | `src/app/vendors/page.tsx` | Full |
| `/vendors/[id]` | `src/app/vendors/[id]/page.tsx` | Partial |
| `/education` | `src/app/education/page.tsx` | Full |
| `/education/[slug]` | `src/app/education/[slug]/page.tsx` | Partial |
| `/messaging` | `src/app/messaging/page.tsx` | Partial |
| `/profile` | `src/app/profile/page.tsx` | Full |
| `/profile/edit` | `src/app/profile/edit/page.tsx` | Full |
| `/profile/[username]` | `src/app/profile/[username]/page.tsx` | Partial |
| `/profile/complete` | `src/app/profile/complete/page.tsx` | Partial |
| `/onboarding` | `src/app/onboarding/page.tsx` | Full |
| `/settings` | `src/app/settings/page.tsx` | Partial |
| `/notifications` | `src/app/notifications/page.tsx` | Placeholder |
| `/chat` | `src/app/chat/page.tsx` | Placeholder |
| `/tags/[tag]` | `src/app/tags/[tag]/page.tsx` | Full |
| `/about` | `src/app/about/page.tsx` | Placeholder |
| `/contact` | `src/app/contact/page.tsx` | Placeholder |
| `/support` | `src/app/support/page.tsx` | Placeholder |
| `/privacy` | `src/app/privacy/page.tsx` | Placeholder |
| `/terms` | `src/app/terms/page.tsx` | Placeholder |
| `/guidelines` | `src/app/guidelines/page.tsx` | Placeholder |
| `/accessibility` | `src/app/accessibility/page.tsx` | Placeholder |
| `/community` | `src/app/community/page.tsx` | Placeholder |
| `/dungeons` | `src/app/dungeons/page.tsx` | Placeholder |
| `/calendar` | `src/app/calendar/page.tsx` | Placeholder |
| `/forums` | `src/app/forums/page.tsx` | Placeholder |
| `/online` | `src/app/online/page.tsx` | Placeholder |
| `/rendezvous` | `src/app/rendezvous/page.tsx` | Placeholder |
| `/states` | `src/app/states/page.tsx` | Placeholder |

**`/connections`:** Implemented at `src/app/connections/page.tsx` (keep nav + docs aligned).

---

## 2. Per-Route Details

### Fully Implemented

| Route | Description | Notes |
|-------|-------------|-------|
| `/` | Landing page | Hero, trust strip, how it works, featured events/vendors, LoginCard. Links to onboarding, events, about, support, guidelines, contact. |
| `/home` | Main feed | 7 tabs: Local, Events, People, Groups, Vendors, Education, Trending. Post composer, LocalPostCard feed, event/people cards, sidebar. Mock data. |
| `/discovery` | Advanced Search | Search, filters (distance, gender for people, roles, experience, verified, reputation), result types (People/Events/Vendors/Groups), tag browse. Uses `useDiscoveryFilters`. |
| `/events` | Events list | Filters (date, distance, format, category), search, RSVP sidebar. No verified-host filter (removed 2026-05-28). Create Event button. |
| `/groups` | Groups list | Search, stream tabs (All/Near you/New/Popular), visibility filter. Create Group disabled. |
| `/groups/[id]` | Group detail | Tabs: Channels, Events, Members, Resources, Photos, Settings. Full channel posts, photo approval, resources CRUD. |
| `/vendors` | Vendors list | Category, ships-to, min rating filters. Search. VendorCard grid. |
| `/education` | Education hub | Category tabs, search. EducationCard grid. |
| `/profile` | Own profile | Tabs: About, Events Attended, Groups, Reviews, Media, Education Contributions. Trust ring, badges, photo upload. |
| `/profile/edit` | Edit profile | Live preview, section nav, birth date, grouped sexuality, roles, location, photos; API + optional localStorage demo mirror. |
| `/onboarding` | Signup flow | 6 steps: location, purpose, interests, experience, trust options, local events/people. Links to /home. |
| `/tags/[tag]` | Tag browse | Sections: Photos, Events, Groups, Articles, Discussions, Writings. Uses `getMockContentByTag`. |

### Partially Implemented

| Route | Description | Gaps |
|-------|-------------|------|
| `/events/[id]` | Event detail | Overview tab full. Attendees, Vendors, Discussion, Safety Info tabs show "coming soon". RSVP/Save/Share UI present but mock. Eventbrite embed TODO. |
| `/places` | Location picker | US states + Canada provinces grid. Selecting location updates display only; no map, no events/groups by location. |
| `/vendors/[id]` | Vendor detail | Banner, about, Visit Shop. Products and Reviews sections show "coming soon". Upcoming events sidebar works. |
| `/education/[slug]` | Article detail | Content from `getMockArticleBySlug`; unknown slugs 404. |
| `/messaging` | Messages | Conversation list, chat panel, per-thread messages. Send appends locally; attach not wired; convo search filters list. |
| `/profile/[username]` | Other user profile | Trust ring, endorsements, photos. "Profile content for {username}. Backend integration coming soon." |
| `/profile/complete` | Complete signup | Location, age, photo upload. "Complete Signup!" → `/home` when location + photo set. |
| `/settings` | Account settings | Sections: Account (email placeholder, password disabled), Notifications (toggles disabled), Privacy (dropdowns disabled). Link to profile/edit. |

### Placeholder (Coming Soon)

| Route | Description |
|-------|-------------|
| `/feed` | **Redirects** to `/home?tab=local` |
| `/notifications` | Title + "Your notifications will appear here. Coming soon." |
| `/chat` | Title + "Real-time chat rooms for the kink community. Coming soon." |
| `/about` | `ComingSoonLayout` + CTAs (marketing copy TBD). |
| `/contact` | `ComingSoonLayout` + CTAs. |
| `/support` | `ComingSoonLayout` + demo **FeedbackForm** block. |
| `/privacy` | `ComingSoonLayout` + CTAs. |
| `/terms` | `ComingSoonLayout` + CTAs. |
| `/guidelines` | `ComingSoonLayout` + CTAs. |
| `/accessibility` | `ComingSoonLayout` + CTAs. |
| `/community` | Title + "Forums, groups, and discussions... Coming soon." + link to /groups |
| `/dungeons` | Title + "Explore dungeons and play spaces... Coming soon." |
| `/calendar` | Title + "Browse events by date. Coming soon." |
| `/forums` | Title + "Community forums and discussions. Coming soon." |
| `/online` | Title + "Members currently online. Coming soon." |
| `/rendezvous` | Title + "Members looking to meet up. Coming soon." |
| `/states` | Title + "Find events, dungeons, and community by location. Coming soon." |

---

## 3. Redirects

| From | To | Location |
|------|----|----------|
| `/feed` | `/home?tab=local` | `src/app/feed/page.tsx` — `redirect('/home?tab=local')` |

No middleware redirects. Root `/` does not redirect when logged in; Header logo links to `/home` when `IS_LOGGED_IN` is true.

---

## 4. Layout Wrappers

| Layout | Path | Behavior |
|--------|------|----------|
| Root | `src/app/layout.tsx` | Header, main (min-h-screen, pb-20 on mobile), Footer, BottomNav, CreateFlowModal. Applies to all routes. |
| Discovery | `src/app/discovery/layout.tsx` | Pass-through (`<>{children}</>`). Metadata only. |
| Feed | `src/app/feed/layout.tsx` | Pass-through. Metadata only. |
| Groups | `src/app/groups/layout.tsx` | Pass-through. Metadata only. |
| Places | `src/app/places/layout.tsx` | Pass-through. Metadata only. |
| Events | `src/app/events/layout.tsx` | Pass-through. Metadata only. |
| Messaging | `src/app/messaging/layout.tsx` | Pass-through. Metadata only. |
| Profile Complete | `src/app/profile/complete/layout.tsx` | Pass-through. Metadata only. |

All nested layouts are thin; no route-specific wrappers or conditional layouts.

---

## 5. Nav Links vs Routes

### Header (logged-in)

- Logo → `/home`
- Search icon (mobile) → `/discovery`
- Notifications → `/notifications`
- Messages → `/messaging`
- Profile dropdown: profile, events, profile/edit, settings (no “who viewed me” / `discovery?view=me`)

### Header (logged-out)

- Login / Sign Up → `/` (both)

### Mobile menu (hamburger)

- Home, Explore, Events, Groups, Vendors, Education → `/home`, `/discovery`, `/events`, `/groups`, `/vendors`, `/education`

### BottomNav (mobile)

- Home, Explore, Create (#create), Messages, Profile → `/home`, `/discovery`, `/messaging`, `/profile`

### Footer

- Directory: events, dungeons, education, vendors
- Community: contact, about, support
- Legal: privacy, terms, guidelines
- Sitemap → `/sitemap.xml`
- Accessibility → `/accessibility`

### site.config.ts

- **navPublic:** /community, /places, /chat
- **navPrimary:** /home, /discovery, /events, /groups, /places, /vendors, /education, /messaging
- **navMore:** /dungeons, /vendors, /education, /about, /contact
- **navSecondary:** /home, /messaging, /notifications, /connections, /events, /online (no profile-view discovery link)

---

## 6. Routes Not Linked from Nav

These routes exist but are **not** in Header, BottomNav, Footer, or site.config nav arrays:

| Route | How to reach |
|-------|--------------|
| `/feed` | Direct URL or legacy links; redirects to /home |
| `/tags/[tag]` | TagLink component (e.g. on cards, discovery) |
| `/profile/complete` | Linked from onboarding flow (not in current onboarding) |
| `/calendar` | No nav link |
| `/forums` | No nav link |
| `/rendezvous` | No nav link |
| `/states` | No nav link |

**`/connections`:** Linked from nav; verify UX copy vs product (friends/suggestions).

---

## 7. Summary

| Category | Count |
|----------|-------|
| Fully implemented | 12 |
| Partially implemented | 8 |
| Placeholder | 17 |
| Redirect only | 1 |
| **Total routes** | **38** |
| Missing (linked) | 0 |

**Recommendations:**

1. ~~Add `/connections` page~~ — done; polish content.
2. Wire `/profile/complete` into onboarding flow (optional; button already navigates when valid).
3. ~~`/education/[slug]` dynamic~~ — uses slug lookup.
4. Add nav links for `/calendar`, `/forums`, `/rendezvous`, `/states` if those features are planned.
