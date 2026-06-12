# UI/UX audit completion matrix

**Sign-off target:** Every P0–P2 row is `done` or `done-waived` with evidence.  
**Source audit:** [UI_UX_AUDIT.md](./UI_UX_AUDIT.md) · **Decisions:** [UI_UX_DECISIONS.md](./UI_UX_DECISIONS.md)

| ID | Status | Evidence | Manual test |
|----|--------|----------|-------------|
| P0-1 | done-waived | API-backed groups hide Channels tab; mock groups have mobile picker in `groups/[id]/page.tsx` | Open mock group → Channels → horizontal tabs on phone |
| P0-2 | done | `discovery/page.tsx` tablet filter sheet | 768–1023px: open filters |
| P0-3 | done | `community-nav.ts` `?mode=following` | Following mode updates URL |
| P0-4 | done | `community-nav.ts` path→tab map incl. `/media` | `/media` does not highlight Education |
| P0-5 | done | `saved/page.tsx` `media_episode` | Save episode → appears on Saved |
| P0-6 | done | `CommunityPlacesBrowse.tsx` geo hidden | Places: no dead geo filters |
| P0-7 | done | `globals.css` `--c2k-sticky-*`, hub shell | Org/convention tabs clear community bar |
| P0-8 | done | `ProfileEditLayout.tsx` skeleton | Profile edit: skeleton before fields |
| P1-1 | done | `RouteNavigationPending.tsx` | Navigate routes: top bar animates |
| P1-2 | done | `useTabFromUrl` on hubs | Convention tab click updates `?tab=` |
| P1-3 | done | `OrgHubClient.tsx` shell skeleton | Org hub: bone skeleton on load |
| P1-4 | done | `messaging/page.tsx` `100dvh` calc | Messaging fills viewport |
| P1-5 | done | `showCommunityNav()` | Messaging hides community nav |
| P1-6 | done | `CommunityNavBar.tsx` | Single Find people entry |
| P1-7 | done | `C2kSkeleton.tsx` FeedCardSkeleton action row | Feed skeleton matches card height |
| P1-8 | done | `useFollowingFeed.ts` clears on filter change | Change Following filter: no stale posts |
| P1-9 | done | Header account menu Saved | Account menu → Saved |
| P1-10 | done | `settings/ecosystem/page.tsx` anchors | Ecosystem: section jump links |
| P1-11 | done | Schedule↔Dancecard cross-links | Convention hub cross-links |
| P1-12 | done | `EventDetailClient.tsx` `order-first` RSVP | Mobile event: RSVP visible early |
| P1-13 | done | `education/write/page.tsx` `buildLoginHref` | Logged out write → login return |
| P1-14 | done | `router.tsx` `/` → `/home` | Signed-in `/` redirects home |
| P1-15 | done | `support/page.tsx` → ecosystem#support | Support copy matches location |
| P2-1 | done | Primary routes use `dc-skeleton-bone` | Home/discovery load: shimmer not pulse |
| P2-2 | done | TabContentTransition on settings, connections, profile edit | Tab switch: fade |
| P2-3 | done | `Dialog.tsx` + migrations; no `window.confirm` in web | Delete flow uses Dialog |
| P2-4 | done | `RootLayout.tsx` footer hide mobile | Mobile messaging: no footer |
| P2-5 | done | `router.tsx` `v7_viewTransition` | Route change: cross-fade |
| P2-6 | done | `public/manifest.json` 192 icon | Manifest valid icons |
| P2-7 | done | `SettingsTabNav.tsx` touch min heights | Settings nav tappable |
| P2-8 | done | `media/page.tsx` filtered empty | Filter media: specific empty message |
| P2-9 | done | `presenters/[username]/page.tsx` `profileKind` | Author: About before Media |
| P2-10 | done | `DoorModePanel.tsx` camera + Dialog confirm | Door: camera scan on HTTPS |
| P2-11 | done | Nav/footer dedup in `community-nav.ts` | No duplicate directory links |
| P2-12 | done | Guest home TabShell labels aligned | Guest home tabs match browse names |
| P2-13 | done | `connections/page.tsx` Message CTA | Connection row → Message |
| P2-14 | done | `CopyLinkOverflowMenu.tsx` toast | Copy link shows feedback |
| P2-15 | done | `LoginCard.tsx` DEV-only demo hint | Prod build: no demo password text |

## Deferred overrides (literal 100% closure)

| Item | Status | Evidence |
|------|--------|----------|
| Q2 `/conventions` | done | `app/conventions/page.tsx` |
| Q6 Home Media tab | done | `HOME_TABS` Media + `HomePageClient` |
| Q14 Unified Activity inbox | done | `GET /api/v1/activity/inbox` + `activity/page.tsx` |
| Q25 Door camera QR | done | `DoorModePanel.tsx` + `@zxing/browser` |
| Q28 View Transitions | done | `router.tsx` |
| Q29 Full Dialog migration | done | See P2-3 |

## Wave UI-1 (2026-06-05) — Alpha blockers + onboarding clarity

| ID | Status | Evidence |
|----|--------|----------|
| UI1-1 | done | Signed-in users no longer silently fall back to mock on API failure — `useHomeSurface.ts`, `ProfilePageClient.tsx`, `useProfilePhotos.ts`, `LocalHomeFeed.tsx` |
| UI1-2 | done | Group admin TODOs removed; roles/settings PATCH wired; comms alpha placeholders — `GroupMemberRolePanel.tsx`, `GroupSettingsPanel.tsx`, `GroupCommunicationsAdminPanel.tsx` |
| UI1-3 | done | Single onboarding path — `ProfileFinishPanel` + `profile-onboarding.ts`; orphan wizard archived; `ProfileOnboardingRedirect` |
| UI1-4 | done | Soft incomplete-profile nudge on `/home` — `HomeWelcomePanel.tsx`, `WelcomeBanner.tsx` (`ProfileIncompleteBanner`) |
| UI1-5 | done | Door permission-denied — `PermissionDeniedPanel.tsx`, `door/page.tsx`, `DoorModePanel.tsx` user-facing errors |
| UI1-6 | done | Conventions in `appHomeMainNav` — `site.config.ts`, `nav-link-active.ts` |

## Changelog

| Date | Note |
|------|------|
| 2026-06-05 | Wave UI-1 — mock bleed fix, onboarding collapse, group admin, door permission UX, conventions nav |
| 2026-06-01 | 100% closure pass — matrix + implementation |
