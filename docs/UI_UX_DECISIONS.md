# UI/UX owner decisions (Wave 0 gate)

**Status:** Alpha defaults recorded **2026-05-30** to unblock [UI_UX_AUDIT.md](./UI_UX_AUDIT.md) execution. Revise any answer in place; implementation waves reference this file.

**Source questions:** [Owner decision queue](./UI_UX_AUDIT.md#owner-decision-queue)

---

## Navigation & information architecture (Q1–8)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 1 | Following feed + URL | **Yes** for signed-in users with connections/settings preference. When Following is active, **`replace` URL** with `?mode=following` (and preserve `tab` if needed). | P0-3, A6, UX-A |
| 2 | Browse model | **Keep hybrid:** standalone `/events`, `/groups`, etc. + home tabs. **`/conventions`** list route shipped (2026-06-01 closure). | UX-D |
| 3 | CommunityNavBar scope | Show on **feed, directories, org/group/convention attendee hubs**. **Hide** on messaging, settings, profile edit, register, moderation, organizer door. | P1-5, B1, UX-B |
| 4 | Mobile primary nav | **Keep bottom nav** as primary; reduce height by **hiding community browse row** on focused routes (Q3) and **footer on mobile** app routes. | P2-4, B1, UX-B |
| 5 | People vs Find people | **`/people`** canonical directory; **`/discovery`** redirects. One **Find people** entry in browse row. | P1-6, A8, UX-A — **done (2026-06-06):** **UI-DISC-1/3** shipped — [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) |
| 6 | Media placement | **Home browse tab `Media`** + `/media` standalone. Nav highlights **Media** on `/media` (not Education). Footer link retained. | P0-4, D2, UX-A |
| 7 | Places | **Directory only** (not home tab). **Hide/disable** geo distance/city/country until API supports them; category + search remain. | P0-6, A4, UX-A |
| 8 | Dungeons | Nav/footer label **“Dungeons & clubs”** → `/places?category=dungeon_club` (keep redirect route). | D7, UX-D |

---

## Tabs & deep linking (Q9–12)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 9 | Convention default tab | **Welcome** when guide exists; else **Schedule**. **No** tab collapse in this pass (defer More bucket). | UX-D |
| 10 | Convention `?tab=` | **Sync URL on every tab click** (`setSearchParams`). | P1-2, A7, UX-A |
| 11 | Schedule source of truth | **Schedule tab** = canonical program; **Dance Card by Kink Social** tab = personal bookings + link to program. Add cross-links; no removal of either in alpha. | P1-11, D4, UX-D |
| 12 | Org/group `?tab=` | **Sync URL on click** for org + group hubs. **Group forums:** adopt org-style mobile master–detail. | P1-2, A7, D5, UX-A / UX-D |

---

## Social & inbox (Q13–15)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 13 | Messaging shell | **Focused shell:** hide community nav + footer on `/messaging`; use **`100dvh`** minus header + bottom nav; thread loading skeleton. | P1-4, B2, UX-B |
| 14 | Inbox hub | **Unified Activity inbox** at `/activity` + `GET /api/v1/activity/inbox` (aggregates notifications, DMs, connection requests). | UX-D |
| 15 | Saved | **Chronological mix** for alpha. **Render `media_episode`**. Add **Saved** under header account menu + link from empty states. | P0-5, P1-9, A3, UX-A |

---

## Settings & onboarding (Q16–21)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 16 | Profile entry | **Settings → Profile hub** links to `/profile/edit`; Account “nickname” links to same edit routes. | UX-D |
| 17 | Roles & tools | **Keep one tab** for alpha; add **in-page section nav** (anchors) only—no new routes. | P1-10, D1, UX-D |
| 18 | Muted + blocked | **Keep separate tabs** (clearer support docs). | UX-D |
| 19 | Payment history label | Rename nav to **“Event access”** (organizer-confirmed, not Stripe). | D1, UX-D |
| 20 | Onboarding | **Canonical:** `/profile/edit?onboarding=1` (`ProfileFinishPanel`). **Remove** unreachable wizard from router path or document orphan. **Do not** hard-block `/home` if incomplete. | P1-14, B5, UX-B / UX-D |
| 21 | Authenticated `/` | **Redirect** signed-in users from `/` to **`/home`** (preserve `homeMode` resolution). | B5, UX-B |

---

## Feed card vocabulary (Q28 — locked 2026-06-06)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 28 | Feed reactions vs actions | **Reactions (soft pills):** Love, Respect, Sympathize, Helpful — `PUT/DELETE /api/v1/feed/posts/:id/reactions` (one per viewer; `post_likes.kind`). **Actions (separate row):** Discuss → `/share/post/:id#discuss` with `feed_post_comments` thread; Repost, Share, Report. **Public share:** post readable logged-out; react/comment require auth. Source: `@c2k/shared` `feed-reactions.ts`. | UI-CLEAN-5/7, [`UI_CLEANUP_REGISTRY.md`](./UI_CLEANUP_REGISTRY.md) |

---

## Presenter / education / media (Q22–24)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 22 | Home Education filters | **Video / Presentations** chips on home → navigate to **`/media`** with format filter when API-backed. | D2, UX-D |
| 23 | Presenter section order | **About** (bio) before **Media** and **Writing** when `profileKind` is AUTHOR or BOTH; else keep Media before Writing. | P2-9, D2, UX-D |
| 24 | Cross-links | **Yes:** media show owner → presenter profile; `/education` ↔ `/media` footer links; footer includes Media. | D2, UX-D |

---

## Organizer / door (Q25–26)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 25 | Door QR | **Camera** (`@zxing/browser`) + wedge/paste. Early check-in uses `ConfirmDialog`. Exit controls remain. | P2-10, E5, UX-E |
| 26 | Post-register landing | Return to convention hub **`?tab=Welcome`** if welcome content exists, else **`?tab=Schedule`**. | B6, UX-B |

---

## Design system (Q27–30)

| # | Question | Decision | Backlog / wave |
|---|----------|----------|----------------|
| 27 | Loading standard | **Shimmer (`dc-skeleton-bone`)** on primary journeys (feed, hubs, settings shell); pulse OK on secondary lists. | P1-7, P2-1, UX-C |
| 28 | Route motion | **View Transitions** (`v7_viewTransition`) + CSS tab fades + route pending bar. | P2-5, UX-C |
| 29 | Modal primitive | **`Dialog`/`Sheet`** + **`ConfirmDialog`**; migrated report/join modals; **no `window.confirm`** in web; organizer deletes use `useConfirm`. | P2-3, E1, UX-E |
| 30 | PWA | **Door/program SW** priority; add **192 + 512** icons to manifest; defer install prompt. | P2-6, E3, UX-E |

---

## Decision → implementation matrix

| UX wave | Unlocked by decisions |
|---------|------------------------|
| **UX-A** | Q1, Q5–7, Q10, Q12, Q15 |
| **UX-B** | Q3–4, Q13, Q20–21, Q26 |
| **UX-C** | Q27 |
| **UX-D** | Q2, Q9, Q11–12, Q16–19, Q22–24, Q8 |
| **UX-E** | Q25, Q28–30 |

---

## Revision log

| Date | Note |
|------|------|
| 2026-05-30 | Initial alpha defaults for parallel execution |
| 2026-06-01 | Literal 100% closure — overrides Q2/Q6/Q14/Q25/Q28/Q29; see [UI_UX_COMPLETION.md](./UI_UX_COMPLETION.md) |
