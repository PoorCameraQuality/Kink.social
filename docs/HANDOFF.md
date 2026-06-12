# C2K — rolling handoff

**Last updated:** 2026-06-12 (pass 26 doc sync; profile social rail on prod)

**Tonight’s detail:** [`handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md`](./handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md)

**Prior session:** [`handoff/PROFILE-EDIT-2026-06-11.md`](./handoff/PROFILE-EDIT-2026-06-11.md)

**Brand (2026-06-06):** Public product is **Kink Social** at **kink.social**. **C2K** stays the internal codename (repo, `@c2k/*`, env). Convention attendee product: **Dance Card by Kink Social**. **ECKE** is the legacy SEO bridge only — not identity, registration, or Dance Card runtime. See [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) § Brand & naming.

**Purpose:** End-of-session snapshot for engineers/PM picking up cold. Update the dated section when major slices land; keep prior sections for context.

**Strategic guidance:** [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) (agent constitution; `.cursor/rules/c2k-strategic-guidance.mdc`) · **Priorities:** [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) · **Full audit:** [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md)

**Deployment posture (2026-06-12):** **VPS alpha live** at **https://kink.social** (`/opt/c2k`, Docker Compose). Local Docker remains dev default. Journal: [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted.

**Tier 1 pilot:** Eng complete. **`PILOT-MAIL`** / **`PILOT-ORG`** **in progress on prod** (formal sign-off open). Local + prod smokes: [`PILOT_READINESS.md`](./PILOT_READINESS.md).

**Roadmap:** [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) — Tracks **A/B done** locally; **`UI-DISC-1`–`UI-DISC-6`** shipped 2026-06-06; **feed card cleanup** 2026-06-06; **LEGAL-ALPHA-1 owner smoke** — engineering green, **Brax walkthrough pending**.

## 2026-06-12 — Pass 26 documentation sync

- **Verdict:** Core docs reconciled with code + **kink.social** prod state.
- **Updated:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) (74 API registrars, profile social, §6 fixes), [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md), [`PILOT_READINESS.md`](./PILOT_READINESS.md), [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md), [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md), [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md), [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md), cross-refs in [`UI_UX_DECISIONS.md`](./UI_UX_DECISIONS.md) + [`GPT_UI_DESIGN_CONTEXT.md`](./GPT_UI_DESIGN_CONTEXT.md).
- **Prod verified:** `GET /api/health/ready` + `/api/health/mail` green; 9-stack containers up; **7** users on prod DB.

## 2026-06-11 — Profile social rail (FetLife-style) + prod deploy

- **Verdict:** **Deployed to https://kink.social — automated smokes green.**
- **Shipped:** Network sidebar on profiles (mutual connections, connections, followers, following with counts + avatar grids); profile API social summaries; lightbox centering; Sora/Manrope typography; real avatars in messaging/connections/feed.
- **Deploy:** `_deploy-eod-session.mjs` — api + web only; **7 users unchanged**, 7 profiles / 5 photos preserved.
- **Verify:** [`handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md`](./handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md)
- **Still open:** Visitor follow-list “View all” UI; prod migration path; git commit/push from this machine.
- **Resume with:** Manual profile sidebar smoke → follow-list modals → fix host migrations.

## 2026-06-11 — Profile edit: save, ZIP, photos, public display

- **Verdict:** **Fixes implemented locally — not committed.** Brax smoke-test before merge.
- **Problem:** Edit profile looked broken — saves failed when photo staged; ZIP lookup silent on exact matches; location not in preview/save; public profile missing photo/location.
- **Root cause:** Edit UI used legacy `POST /api/upload` without `purpose` / `quarantineKey`; attestation modal missing on edit path; `formatZipLookupHint` only for nearest ZIP matches; structured location gated on `locationsMode === 'ok'`; `avatar_url` never synced.
- **Shipped:** Shared `profile-photo-upload.ts`; `ProfileEditContext` + `ProfileFinishPanel` + gallery aligned; attestation modal in `ProfileEditLayout`; ZIP blur lookup + manual city picker; `syncProfileAvatarUrl` on primary photo.
- **Verify:** [`handoff/PROFILE-EDIT-2026-06-11.md`](./handoff/PROFILE-EDIT-2026-06-11.md) manual checklist.
- **Still open:** Short bio vs extended about share one field; onboarding uses second upload path; api `profile-field-redaction.test.ts` typecheck debt (pre-existing).
- **Resume with:** Brax manual smoke → commit if green → optional bio split / onboarding upload unify.

## 2026-06-06 — Feed card UI hardening (Wave 5)

- **Reactions locked:** Love / Respect / Sympathize / Helpful (`packages/shared/src/feed-reactions.ts`). Only Love → like API; others honest disabled.
- **Actions:** Discuss (soon), Repost, Share, Report — separated from reactions; Boost/Pass along/Collar/Brilliant/Going removed from generic feed UI.
- **Routing fixes:** Event composer `?create=event`; trending rail → `/home?mode=discover&tab=Trending`; Following feed Repost wired; mobile header shows full browse links; Profile empty settings link fixed.
- **Calmer UI:** Muted discover rail footers; demoted gold on trending kind badges + composer chips.
- **Docs:** [`UI_CLEANUP_REGISTRY.md`](./UI_CLEANUP_REGISTRY.md) Wave 5, [`UI_UX_DECISIONS.md`](./UI_UX_DECISIONS.md) Q28, [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) Feed UI.

## 2026-06-06 — Member hub honesty (Wave 6)

- **Saved:** Per-filter empty CTAs (events / education / media / home).
- **Composer:** Collapsed Photo chip opens composer; disabled when no handler.
- **Mobile home:** `CommunityNavBar` restored via `showHomeMobileFeedNav` (Following / Near you / Trending).
- **Events:** Removed rotating fake FEATURED badges; badge only when `event.featured`.
- **Groups / People:** Honest join copy; Find people **Connect** wired to connection request API.
- **Organizer:** Console link gated to users with organizer scopes.
- **Discuss:** Routes to `/share/post/:id` for API-backed posts.
- **Dead code:** Removed unused `HomeFeedLeftRail`, `HomeTodayRail`.

## 2026-06-06 — UI-DISC-4/5/6 discover wiring + honesty

- **Verdict:** **Shipped** — discover surfaces no longer show fake counts, dead geo controls, or orphaned explore chrome.
- **UI-DISC-4:** People country/city client filter wired (`rankPeople`, `FindPeopleFiltersPanel` honesty); removed dead convention geo state; event/convention fake count backfill removed.
- **UI-DISC-5:** Conventions notifications **Soon** chip; education hub honest when API-backed (`apiBacked` prop — hides mock paths/educators, disabled Follow, honest rails).
- **UI-DISC-6:** Deleted `ExploreDiscoverShell`, `ExploreSubNav`, `DiscoveryPeopleFilters`; removed `showExploreSubNav()`.
- **Verification:** `npm run typecheck -w web` green.
- **Followups:** Near you → `GET /connections/suggested?source=nearby`; group invitations/posts/saved APIs; convention demo badge enrichment maps.
- **Next recommended slice:** **LEGAL-ALPHA-1** owner smoke → pilot org setup (`PILOT-ORG`) when hosting lands.

## 2026-06-06 — Mobile door + organizer alpha walkthrough

- **Verdict:** **PASS WITH FOLLOWUPS** — flagship organizer door flow is usable on mobile; no blockers for local pilot dry run.
- **Hardening shipped:** unified `resolveCheckInUpdate` blocks waitlisted/cancelled on signups PATCH + door POST; door empty-search copy; waitlisted/cancelled pre-flag in door UI; payment/tags honesty in Signups detail.
- **Automated:** `pilot-readiness-smoke.mjs` **11/11** · `smoke-organizer-tab-walk.mjs` **7/7** · `audit-command-bridge.mjs` RBAC green · Playwright `door.spec.ts` **1/1** (iPhone 13) · `npm run typecheck` green · unit **252/253** (1 pre-existing `adult-content-preference` flake unrelated).
- **Manual mobile (390×844):** Door mode loads with safe-area layout, search/QR inputs, event title; Signups panel shows 3 registrants, filters, **Open door mode** CTA; permission denied panels wired on door page for unauthenticated users.
- **Open followups:** grant-persona E2E (registration-only vs staff-only door denial); registrant tag persistence; category capacity auto-waitlist; hub `canManage` bleed for registration-only grants — see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) `ORG-DOOR-*`.
- **Next recommended slice:** **LEGAL-ALPHA-1** owner smoke → pilot org setup when hosting lands.

## 2026-06-06 — LEGAL-ALPHA-1 operator script + engineering pre-check

- **Checklist:** [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md) rewritten as runnable owner script (Sections 1–8, pass/fail/severity, operator Q&A).
- **Automated pre-check (all green):** `smoke-legal-alpha-manual.mjs` 22/22 · Playwright `legal-alpha-smoke.spec.ts` 4/4 · `verify:trust-safety:*` legal slices · `verify:prelaunch` · `db:ensure-brax-site-admin`.
- **Verdict:** **PASS WITH P1 FOLLOWUPS — pilot may continue after Brax owner sign-off.** **Not frozen.**
- **Owner still needed:** Support form UI submit, step-up click-through, admin legal request/hold visual, in-product Report → case triage, signup/footer spot-check.
- **Next after freeze:** Mobile door walkthrough → UI-DISC-4–6 → prod cutover → first pilot org.

## 2026-06-06 — UI-DISC-2/3 discover consolidation + feed hardening

- **UI-DISC-2:** Header owns **+ Create**; removed duplicate Create CTAs from Groups/Events discover rails; header search is **people-only** (`discover-nav-policy.ts` hides header search on scoped-search routes); page search owns Events/Groups/Conventions/Education/People lists.
- **UI-DISC-3:** Home `?tab=Events|Groups|…` redirects to standalone directories (`home-directory-tabs.ts`); home left rail + feed scope tabs link to `/events`, `/groups`, etc.
- **Feed 500:** `post_likes` enrichment fail-soft; feed routes return **503 + migrate hint** for missing incremental tables instead of opaque 500.
- **Docs:** `MASTER_NEXT_STEPS`, `UX_REFACTOR_BACKLOG`, `UI_DISCOVER_REFRESH_PROGRESS` synced.
- **Still open:** **`LEGAL-ALPHA-1`** owner manual smoke; **`UI-DISC-4`–`UI-DISC-6`**; prod cutover blocked on hosting.
- **Resume with:** LEGAL-ALPHA-1 owner pass, then `UI-DISC-4` wiring or prod prep per [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md).

## 2026-06-06 — Docs cleanup + doc sync

- **Session:** Docs-only — aligned handoff, backlog, decisions to code truth after **moderation alpha pass (T&S-5)**.
- **Shipped (prior code, now reflected in docs):** **`SCOPED-MOD-1`** — unified `ReportAction` intake, scoped mod parity (group/event/convention), platform polish; **`MEDIA-MOD-MINIMUM`** — quarantine viewer + asset actions (`media-mod-minimum.test.ts`).
- **Queue:** [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) — **`ORG-DOOR-*`** followups; **`PILOT-MAIL`** / **`PILOT-ORG`** **in progress** on prod. **`UI-DISC-1`–`UI-DISC-6`** **done**.
- **Docs synced:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) (moderation alpha pass), [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md), [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md), [`T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5.
- **Still open:** **LEGAL-ALPHA-1** Brax owner walkthrough → freeze ([`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md)); **`UI-DISC-4`–`UI-DISC-6`** wiring/honesty.
- **Resume with:** Brax completes LEGAL-ALPHA-1 owner script, then mobile door walkthrough or `UI-DISC-4` per [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md).
- **Doc sync (2026-06-06):** Critical docs updated in **batches of 5** vs codebase (complete — strategy, engineering, deploy, organizer, design, T&S, QA). See [`README.md`](./README.md).

## 2026-06-01 — Discover UI refresh (visual shells; consolidation backlog)

- **Shipped (UI-only sprint):** Mockup-driven discover layouts — home 3-col feed shell, **`/events`**, **`/groups`**, **`/conventions`**, **`/discovery`** (Find people), **`/education`** overview; feed reaction labels; expanded appearance themes; stories row removed from home.
- **Pattern:** `*-page-layout.ts` hides **`CommunityNavBar`**; **`ExploreSubNav`** replaces it on **`/discovery`** and **`/education`** only (Events/Groups/Conventions do not — inconsistent).
- **Honest status:** Lots of **duplicate Create buttons**, **header vs page search**, and **two ways to browse** (home `?tab=` sections vs standalone routes). Stub left-rail links (My Groups, invitations, convention tickets, education paths) and demo badge/count enrichment.
- **Docs:** [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) (authoritative for this sprint); **`UX_REFACTOR_BACKLOG.md`** IDs **`UI-DISC-1`–`UI-DISC-6`**; registry **pass 26** (2026-06-12).
- **Resume with:** `UI-DISC-1` (unify browse chrome) before more new surfaces (Vendors, Media, Presenters discover).

## 2026-05-28 — Month-end pause + profile / events doc sync

- **Posture:** No new autonomous backlog drain; local Docker + Mailpit only; **`PILOT-MAIL`** / **`PILOT-ORG`** still blocked on hosting.
- **Shipped (session):**
  - **Profile:** Public **`/profile/:username`** layout (hero, tabs, trust sidebar); **`/profile/edit`** — live preview, completion card, ecosystem links panel, section nav, single save for profile + kinks; **`ensureProfileForUserId`** fixes “Profile not found” on kinks when session exists without `profiles` row.
  - **Identity fields:** **`birthDate`** on `PATCH /api/profile/me` (computes **`age`**); expanded **sexuality** options in `@c2k/shared/profile-identity-options`; migration via **`db:migrate-incremental`** (`birth_date`, `sexuality` varchar 128) — **`db:push`** still fails on convention expression indexes.
  - **Events UX:** Removed **Verified Host** badge on **`EventCard`** and event detail; removed **Verified host only** filter on **`/events`**; dropped **`verifiedHost`** query param on **`GET /api/v1/events`** (API may still return `hostVerified` — unused in UI).
- **Open when resuming:**
  - Home **Near you** feed **HTTP 500** — debug following/local feed API.
  - Next **`SG-*`** slice or organizer polish per [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md).
- **Docs:** pass 24 — [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md), [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md), audits below.

## 2026-05-27 — Educator follow-ups (post-sprint)

- **Shipped:** **`/presenters/onboarding`** wizard (profile → optional offering → write); Education hub **empty-state CTAs**; **`/saved`** lists **`education_article`** bookmarks alongside feed posts.
- **Docs:** registry pass 21; **`MASTER_NEXT_STEPS`**, **`NEXT_STEPS`**, **`PROJECT_ROADMAP`**, **`EXECUTIVE_PLATFORM_READINESS`** synced for passes 17–21.

## 2026-05-27 — Educator Contributions sprint

- **Shipped:** Unified long-form in **`education_articles`** — TipTap **`/education/write`** composer; API-backed **`/education`** hub + **`/education/:slug`** reader; profile **Journal** + **Education Contributions**; presenter **Writing** section; org **`featured_articles`** community module; private author save stats (`GET /api/v1/me/education-articles/stats`).
- **API:** `education-articles-routes.ts` — hub list/detail, me CRUD, journal redirect, presenter writing; **`sanitize-education-body.ts`** (YouTube/Vimeo iframe allowlist); bookmarks **`education_article`**; feed **`POST`** rejects new **`kind=article`**; **`GET/PUT …/organizations/:orgKey/featured-articles`**.
- **Web:** **`EducatorArticleEditor`**, **`EducationArticleCard`**, **`useApiEducationArticles`**; feed composer status-only + link to **`/education/write`**; **`PresenterCatalogSection`** write CTA.
- **Product rules:** Self-serve hub listing (`listInEducation` + content warnings + categories); **no public popularity metrics** on hub; **`eckePublish`** on articles/vendors → ECKE Supabase when bridge enabled (see [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md)); legacy feed article rows still readable during transition.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 20.

## 2026-05-27 — Vendor community experience sprint

- **Shipped:** BullMQ **`vendor-event-credit-sync`** — after an event ends, upserts **`vendor_event_credits`** from organizer **`event_contributors`** (vendor kind); idempotent unique index on `(vendor_profile_id, event_id)`.
- **API:** Etsy sync maps **`primaryImageUrl`**; **`GET /api/v1/vendors`** / spotlight / in-person-upcoming use **`filterVendorVisibility`**; **`shop_policies`** JSONB + **`makerStory`** on **`PUT /api/v1/me/vendor-profile`**; **`GET /api/v1/vendors/:id`** returns **`upcoming`**, **`eventCredits`**, **`feedbackSummary`**; **`DELETE /api/v1/events/:eventId/contributors/:contributorId`** (org MODERATOR+).
- **Web:** Shop page — **Policies**, **Community feedback**, **Community appearances**, catalog freshness; directory **Vending soon** rail; settings **`makerStory`** + policies; **`EventContributorsPanel`** remove; onboarding maker-story prompt.
- **Product rules:** No C2K checkout; credits are organizer-sourced, not platform endorsement; no Star Seller / verified-seller badges.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 19.

## 2026-05-27 — Presenter teaching history sprint

- **Shipped:** BullMQ `presenter-teaching-credit-sync` — after a schedule slot **ends**, upserts `presenter_teaching_credits` with `verified: true` + `scheduleSlotId` (idempotent partial unique index).
- **API:** Unified history on `GET /api/v1/presenters/:key` (`teachingCredits` with `conventionSlug` on program rows); `GET /api/v1/me/presenter-profile` returns `upcomingScheduleCredits` (future slots only).
- **Web:** Single **Teaching history** section on `/presenters/:username` — **On program** vs **Self-reported** labels (no bare "Verified"); settings **`PresenterCatalogSection`** copy updated.
- **Product rules:** History stays on presenter catalog, not member profile badges; no feed activity; self-reported log retained for online/small venues.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 18.

## 2026-05-27 — Vendor onboarding sprint

- **Shipped:** `/vendors/onboarding` wizard (**`VendorOnboardingWizard`**) — shop basics → external inventory (Etsy/Shopify/Woo/link via **`VendorExternalStorePanel`**) → appearance → publish + **`VendorIntegrationGuide`**; **`VendorShopSection`** in settings; **`EventContributorsPanel`** on **`EventOrganizerPanel`** with `GET /api/v1/vendors?q=` search; **`vendor_shop_live`** Following feed verb when public shop has synced listings.
- **API:** `GET /api/v1/vendors?q=` (organizer vendor picker); **`emitVendorShopLiveIfEligible`** on `PUT /api/v1/me/vendor-profile` (PUBLIC) and after external sync; feed deep link `/vendors/:slug`.
- **Web:** `/vendors/new` redirects to onboarding; profile/vendors CTAs → `/vendors/onboarding`; general onboarding step 6 **Set up your shop** when vendor purpose selected.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 17.
- **Out of scope (unchanged):** C2K checkout, native product CRUD, vendor self-apply to events, `PILOT-MAIL` / `PILOT-ORG`.

## 2026-05-27 — Wave 3 Local meantime sprint

- **Shipped (3 items):** SG-093 **event story cards** with inline RSVP in **`ActivityFeedCard`**; **G304** UUID group mock tab gating (hide **Channels/Resources/Photos** for API-backed groups); **Wave 3C** (registry pass 14) — **`/community`** redirect → **`/groups`**, **ComingSoonLayout** live-links strip on placeholder pages.
- **Web:** **`EventFeedStoryCard`** — hero image, datetime, location/virtual badge, **Going** / **Interested** RSVP buttons without leaving Following feed; **`GroupCommunityShell`** / **`groupCommunityTabs`** splits mock slug vs API UUID tab sets.
- **API:** Inline RSVP reuses **`PUT /api/v1/events/:eventId/rsvp`**; event detail fetch for live **`rsvpOpen`** / **`viewerRsvpStatus`** on story cards.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 16; [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` — not marked done.
- **Next:** Pick next `SG-*` from backlog (W1 graph inbox or remaining W3 feed/media); server mount when ready.

## 2026-05-27 — Wave 2 Local meantime sprint

- **Shipped (3 items):** SG-130 **`post_likes`** + **connection liker preview** on feed cards + **`LocalPostCard`** Love API; SG-084 **muted tags** in Settings + Following/Near you feed filter; **profile photos API-first** (`profile-photos` routes, **`useProfilePhotos`** `apiBacked` on own profile).
- **API:** `post_likes`; `POST` / `DELETE /api/v1/feed/posts/:postId/like` (returns `likeCount`, `likedByViewer`); feed list/detail enrich **`connectionLikerPreview`**; **`GET/POST/DELETE /api/mutes/me`** (`kind=TAG`); **`GET/POST/PATCH/DELETE /api/profile/me/photos`**; public **`GET /api/profile/:username`** includes `photos`.
- **Web:** Settings → **Hidden interest tags** (`useApiMutedTags`); **`LocalPostCard`** Love + liker avatars; own profile Media tab persists via API when DB-backed.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 15; [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` — not marked done.
- **Next:** Pick next `SG-*` from backlog (W1 graph inbox or W3 feed/media); server mount when ready.

## 2026-05-27 — Wave 1 Local meantime sprint

- **Shipped (4 items):** SG-120 **Interested** RSVP label (`RSVP_LABEL_INTERESTED` in `@c2k/shared` — DB/API stays `maybe`); SG-138 follow-up — `PATCH /api/v1/groups/:groupId` for `category`/`description` + **`GroupSettingsPanel`** on organizer group settings; UX **B2** org hub staff hint for non-staff (`OrgHubClient` tab footer); UX **N1** messaging explainer in [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) § N1 (E1/M1 were already done).
- **API:** `PATCH /api/v1/groups/:groupId` — moderator+ may update `category`, `description`, visibility, place, branding fields.
- **Shared:** `packages/shared/src/rsvp-labels.ts` — single source for attendee-facing **Interested** copy.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 12; [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` — not marked done.
- **Next:** Pick next `SG-*` from backlog (W1 graph inbox or W3 feed/media); server mount when ready.

## 2026-05-27 — Pre-launch Wave 2 (social + organizer polish)

- **Shipped (4 items):** SG-105 events discovery filters (category chips, in-person/virtual, geo/date, My agenda sidebar); SG-085 bookmarks (`user_bookmarks`, `/saved`, feed overflow Bookmark); **Create Group** enabled on `/groups` (`CreateGroupModal` + `POST /api/v1/groups`); organizer shell spacing pass on `OrganizerAppShell`.
- **API:** `GET /api/v1/events?format=&category=`; `GET/POST/DELETE /api/v1/me/bookmarks`; group create no longer stub-only.
- **E2E:** Playwright coverage for events filters, create group, mail double opt-in — **34** total; alpha gate **`npm run verify:alpha`**.
- **Docs:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 11; [`E2E.md`](./E2E.md) spec inventory.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` — not marked done.
- **Next:** Pick next `SG-*` from backlog (W1 graph inbox or W3 feed/media); server mount when ready.

## 2026-05-27 — Pre-launch Wave 1 (social graph slices)

- **Shipped (6 SG IDs):** SG-033 member since on public profile; SG-031 copy-link overflow menus (posts, events, groups, feed); SG-137 connection RSVP avatars on EventCard; SG-082 community event calendar (Google / webcal / `GET …/calendar.ics`); SG-138 group discovery grid enrichment; SG-015 `rsvpOpen` close/reopen for hosts + closed attendee state.
- **API fields:** `memberSince` on profile read; `connectionRsvpPreview` + `rsvpOpen` on events list/detail; group list enrichment (`descriptionSnippet`, `coverImageUrl`, `memberAvatars`).
- **Docs:** [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped; [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 10.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` — not marked done.
- **Next:** Pick next `SG-*` from backlog (W1 graph inbox or W2 event social); server mount when ready.

## 2026-05-27 — Four-phase execution plan (Phases 1–4)

- **Phase 1 (Track A):** Alpha signed — pilot-readiness **11/11**, attendee **7/7**, audit RBAC green, typecheck + **92** tests + e2e **26** pass. Fixes: `EckeVendorRow` import, smoke scripts (Brax password for RBAC audit, attendee smoke via `SMOKE_BASE`), `C2K_RATE_LIMIT_DISABLE=true` in `.env.development`.
- **Phase 2 (Track B):** Profile `#profile-location` + discovery empty CTA; `browseHref`/`isBrowseTabActive`; convention hubs row gated on unread; Playwright convention Schedule tab.
- **Phase 3 prep:** Onboarding packet + [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Phase 3 prep — **prod cutover blocked until hosting**.
- **Phase 4 (Track C slices, local override):** SG-080 event categories, SG-081/087 forum badges + thread lines, SG-096 join rules modal, SG-134–136 geo browse + featured events, SG-121 feed filter tabs. **`npm run db:migrate-incremental -w @c2k/api`** required after pull.
- **Next:** Server mount → PILOT-MAIL/ORG → next `SG-*` one PR at a time.

## 2026-05-27 — Phase 3 prep (docs only; no server)

- **Cutover prep complete (repo):** [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § **Phase 3 prep** — ready vs blocked checklist (runbooks, K8s/compose, env delta, local smokes, onboarding packet).
- **Pilot onboarding packet:** [`PILOT_READINESS.md`](./PILOT_READINESS.md) § **Pilot org onboarding packet** — owner training script (org create → convention → register → door → hub comms).
- **Prod cutover:** **Blocked until hosting purchase** — deploy, DNS/TLS, prod SMTP A–E, live-domain smokes, real pilot org.
- **Still deferred:** `PILOT-MAIL`, `PILOT-ORG` in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) — not marked done.
- **Next when server exists:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) → § On mount in cutover log → Tier 1 rows **A** + **F**.

## 2026-05-27 — Home IA + documentation

- **UI:** Persistent `CommunityNavBar` (`RootLayout`); `ConventionCard` aligned with `EventCard`; `LocalHomeFeed` (composer, pins, skeletons, max 3 events); removed duplicate home tab/browse chrome for signed-in users.
- **API/seed:** Trending strips HTML titles, excludes `e2e-%`; `cleanupE2eFeedPosts()` on seed; `ensureDemoProfileStateIds()` (run `db:seed:locations` if PA missing).
- **Docs:** [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) (next steps outline); [`UX_REFACTOR_V2_PROGRESS.md`](./UX_REFACTOR_V2_PROGRESS.md) V2-6; registry + FetLife home §2 updated.
- **Verify:** `npm run db:seed -w @c2k/api` → `npm run dev` → `/home?mode=discover&tab=Local`, `/home?mode=following` (demo: RopeDreamer / demo).
- **Next:** Track A in roadmap (pilot smokes, door PWA); Track B (profile state for People, Playwright nav labels).

## 2026-05-26 — Local Docker sprint (v3 + LOC-*)

- **Strategy:** [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) v3 synced; [`.cursor/rules/c2k-strategic-guidance.mdc`](../.cursor/rules/c2k-strategic-guidance.mdc) updated.
- **Cutover journal:** [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md).
- **Alpha:** PWA (`manifest.json`, `sw-offline.js`), door mobile safe-area, gallery empty state, presenter `scheduleCredits`, people-sync worker queue, notification type registry, report list API + smokes.
- **Smokes:** `smoke-greenfield-registration.mjs`, `smoke-reports.mjs`, `smoke-organizer-tab-walk.mjs`.
- **Backlog:** [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) LOC-* rows marked done.

## 2026-05-26 — Attendee dancecard parity

- **Hub:** `/conventions/:slug` → **Dancecard** tab uses `ConventionAttendeeHubShell` (ECKE-style feature cards: program, my availability, compare, reservations, groups, maps, policies). No attendee link-out banners to ECKE on Schedule/Dancecard.
- **API:** `convention-attendee-routes.ts` — attendee groups, published policies + sign, maps reuse organizer GET.
- **Panels:** `ConventionAttendeeGroupsPanel`, `ConventionPublishedPoliciesPanel`, `ConventionAttendeeMapsPanel`; personal block editor in `ConventionDancecardPanel`.
- **Fixes:** `HostedByCard` strips HTML taglines; preview map seed script `npm run db:ensure-preview-attendee-parity -w @c2k/api`.
- **Docs:** [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) § Attendee; `FEATURE_REGISTRY`, `BACKLOG_QUEUE` DC-ATTENDEE.
- **E2E:** Playwright smoke for preview convention Dancecard tab cards.

**Session end 2026-05-24:** Dev stack and `npm run dev` stopped. Resume: `docker compose -f docker-compose.dev.yml up -d` → `npm run db:migrate-incremental -w @c2k/api` → `npm run dev`. Demo links: [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md).

---

## 2026-05-24 (j) — Pass 8 (end of day: FetLife plan, C215, Identity 6–8, mail checklist)

- **Product doc:** [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) — Following/Discover IA, `feed_activities`, phases F1–F5 (**not implemented**; scalability: pull feed OK to ~100k MAU; fan-out/Redis before celebrity-scale).
- **C215 done:** Hub **chat** push to pinned users; `push_hub_announcements` / `push_hub_chat` prefs; Settings channel toggles; env `C2K_PUSH_CHAT`.
- **Identity 6–8 done:** `participation` on `GET …/people`; `directoryPersonId` on registrants; Signups ↔ Roster links; `peopleHubTemplate` `munch`|`full`.
- **Ops:** [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md); `k8s/base/secret.example.yaml` + `.env.production.example` mail/VAPID placeholders.
- **DB:** Incremental migration applied (`push_hub_*` columns).
- **Verification:** typecheck ✅, **70/70** tests ✅.
- **Next sprint:** FetLife **F1** (home IA toggle) or **C213** gallery QA; prod mail sign-off via checklist.

---

## 2026-05-24 (i) — Pass 7 (double opt-in + dev env)

- **O75 done:** `C2K_SCOPE_EMAIL_DOUBLE_OPTIN` — pending subscribers, confirm email, `GET /api/v1/email-list/confirm`, web `/email/confirm`.
- **Dev env:** `.env.development` enables org join email, RSVP email, double opt-in; VAPID placeholders + [`PUSH_VAPID_DEV.md`](./PUSH_VAPID_DEV.md).
- **DB:** `confirm_token_hash`, `confirm_expires_at` on `scope_email_subscribers` (incremental migration).
- Verification: typecheck ✅, **70/70** tests ✅.

---

## 2026-05-24 (h) — Pass 6 (verify + P0 polish)

- **Verification:** typecheck ✅, **68/68** unit tests ✅, Playwright **19/19** E2E ✅, command-bridge **52/53** ✅.
- **C214:** Hub channel unread badges on convention Chat/Announcements tabs (`unread-count` API).
- **C215:** `web-push` send on hub **announcements** to pinned users; `sw-push.js`; Settings **Browser push** enable UI; `VAPID_*` on status endpoint.
- **O75:** `sendOrgWelcomeEmail` on org join when `C2K_ORG_JOIN_EMAIL=true` + mail transport enabled.
- **Still open:** scope-email double opt-in; chat push for non-announcement; Identity Phase 6–8 People hub merge.

---

## 2026-05-24 (g) — Audit pass 5 (backlog drain)

- **C212:** `convention_hub_channels` + routes; public convention Chat/Announcements prefer hub channels; staff auto-seed `#general` / `#announcements`.
- **C213 (partial):** `POST …/gallery/attendee-upload` (multipart → S3, pending moderation).
- **C214 (partial):** Hub message replies + thread indent in UI; `mark-read` / `unread-count` API (badge UI open).
- **C215 (partial):** `push_subscriptions` + `GET/POST/DELETE /api/v1/me/push/*` (VAPID send + SW open).
- **O76:** Inline org join on `HostedByCard` (`POST …/organizations/:slug/join`).
- **O77:** `pinned-digest-sweep` worker job; `pinnedDigestEmailWeekly` prefs + Settings **Email digests**.
- **O75 (partial):** Real `POST …/message-templates/test-send` via `sendEmail`.
- Verification: typecheck ✅, **67/67** tests ✅, command-bridge **52/53** ✅; E2E not re-run (baseline 19/19).
- **Backlog queue:** autonomous slice **empty** — see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md).

---

## 2026-05-24 (f) — Audit pass 4 (doc refresh)

- Refreshed: `MASTER_NEXT_STEPS`, `PLATFORM_STATUS_AUDIT`, `BACKLOG_QUEUE`, `FEATURE_REGISTRY`, `EXECUTIVE_PLATFORM_READINESS`, `NEXT_STEPS`, `README`.
- Verification: typecheck ✅, **67/67** tests ✅, command-bridge **52/53** ✅; E2E not re-run (baseline 19/19).
- Maturity rollup: **~76–79%** overall.

---

## 2026-05-24 (e) — Mail + org/group email lists + K8s

- **SMTP dev:** Mailpit in `docker-compose.dev.yml`; `.env.development` defaults to `smtp://127.0.0.1:1025`.
- **K8s:** `k8s/base/*` templates + [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md).
- **Platform BCC:** `C2K_PLATFORM_MAIL_BCC` on all outbound mail; captures in `platform_email_captures`; export `GET /api/v1/platform/email-captures?format=csv` for `C2K_PLATFORM_ADMIN_EMAILS`.
- **Org/group lists:** subscribe, unsubscribe, broadcast APIs; public signup UI; organizer panels.

---

## 2026-05-24 (d) — Automation pass 3

- **O75 (partial):** `transactional-email.ts`, `GET/POST /api/v1/me/email/*`, RSVP confirm on `PUT …/rsvp` when `C2K_EVENT_RSVP_EMAIL=true` + mail transport enabled.
- **C213 (partial):** `convention_gallery_images.moderation_status`, `POST …/gallery/submit`, `PATCH …/gallery/:id/moderation`, web submit + approve UI.
- **Identity Phase 6 (partial):** `ConventionParticipationStrip`, `PeopleHubParticipationStrip` (reads `me/participation`).
- **Home:** nearby groups merged into join rail via `/groups/nearby`.
- **Tests:** 66 unit + `http-smoke.test.ts`; typecheck green.
- **Next:** C212 chat sub-channels; O75 org-invite + prod mail; attendee S3 gallery upload; full People hub merge.

---

## 2026-05-24 (c) — Automation pass 2

- **Identity Phase 5:** `GET /api/v1/conventions/:key/me/participation` + `loadMyConventionParticipation()`.
- **Discovery:** `/discovery` Groups + **Near you** uses `/api/v1/groups/nearby` (disc-2 complete; location plan closed).
- **E2E:** **19/19** green (fixed convention 404 copy, Schedule tab, flexible schedule link + cost from API).
- **Next:** O75 email or C212/C213; Phase 6 People hub wiring.

---

## 2026-05-24 (b) — Automation sprint (MASTER_NEXT_STEPS §9)

**Shipped:** `groups.place_id` + `service_radius_mi`; `GET /api/v1/groups/nearby`; `PlaceRegionPicker` in `GroupSettingsPanel`; `/groups` **Near you** uses API; `npm run db:migrate-incremental`; `packages/web/public/og-default.png`; `geo-distance.test.ts` (62 unit tests pass).

**Smoke:** `npm run typecheck` OK; `audit-command-bridge` 52/53 OK; Playwright **14/17** (3 pre-existing convention/event UI copy failures).

**Still open:** `disc-2` recommended groups on discovery home; C212–C215; O75–O77; Identity Phase 5.

---

## 2026-05-24 — Platform status audit + doc refresh

Parallel audits of API, web, and docs. **New:** [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md), [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md). Updated executive readiness (~**68–72%** overall), handoff, registry, backlog pointers. **Groups at ~72%** after G301–G312; **14** web routes still ComingSoon.

**Shipped this period (code, prior sessions):** G301–G312 groups/events scope; scope branding (`ScopeBrandingPanel`, `/share/*` OG routes).

**Next sprint (from master doc):** `db:push` playbook, group location plan (`loc-1`–`disc-1`), Dancecard manual smoke, then C212–C215 or O75.

---

## 2026-05-23 — Public Page Refactor v2

**Full detail:** [`HANDOFF_PUBLIC_PAGE_REFACTOR_V2.md`](./HANDOFF_PUBLIC_PAGE_REFACTOR_V2.md)

### Summary

Public `/conventions/:slug` is now an attendee hub: tab reorder + registration gating, working chat (composer + WS), convention gallery, venue maps on **More**, pin-to-feed + home rail, hosted-by card, organizer **Gallery** / **Chat channels** settings.

### Resume in 30 seconds

```bash
npm run db:migrate-hub-ext -w @c2k/api
npm run dev
```

Open: http://localhost:5173/conventions/preview-c2k-weekend

### Blockers fixed tonight

- Missing DB tables → `db:migrate-hub-ext` (not `db:push` alone).
- API not on **3001** → all proxied `/api` calls returned 500.
- Duplicate `GET …/maps` route crashed Fastify on startup — removed from hub-ext; attendee reads use organizer maps GET with hub access.

### Backlog filed

C212–C215, O75–O77 in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md); email stub in [`EMAIL_NOTIFICATIONS_PROPOSAL.md`](./EMAIL_NOTIFICATIONS_PROPOSAL.md).

---

## 2026-05-22

### Tonight's completed work

- **Dancecard organizer full parity** — schema (`convention_*` tables), ~60 API routes under `/api/v1/conventions/:key/…`, kit UI shell (`ConventionDancecardOrganizerClient` + `packages/web/src/components/dancecard/organizer/`), ECKE location sync (`locationId` on slots/shifts in publish payload). Legacy `ConventionProgramOrganizer` deprecated.
- **Identity Phase 1–2** — ADR accepted ([`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md)):
  - **Phase 1:** `POST /registrants` requires `userId`; CSV import resolves email → C2K user; staff shifts require `personId` (C2K user UUID); registration write syncs `convention_access_grants`.
  - **Phase 2:** Unique index `convention_registrants_conv_user_idx` on `(convention_id, user_id)`; organizer UI user pickers on registrants + staff shifts.
- **Verification:** `npm run typecheck` (web + api); API unit tests for ECKE publish, location/slot/staff sync, convention-participation.

### Current architecture (one paragraph)

One C2K user (`users` + `profiles`) is the only durable identity — vendor, organizer, attendee, etc. are capabilities under that profile, not separate account types. **Registration** is participation state on the same user (`convention_registrants` + `convention_access_grants`), not a second person record; display defaults come from profiles with optional event-only overrides. **ECKE** is a marketing/SEO surface (listings, articles); register/attend/staff/organize always happens on C2K. Kit-mode organizer tables (`convention_registrants`, kit ISO, etc.) run in parallel with C2K-native paths during transition — do not fork identity.

### How to resume tomorrow

1. **Start dev** (repo root): `npm run dev` → web `http://localhost:5173`, API default port from `.env.development`.
2. **DB + seed** (if fresh or behind): `npm run db:prepare` (Postgres up first).
3. **Organizer smoke URL** (mod+ on `demo-east-collective`):
   `http://localhost:5173/organizer/orgs/demo-east-collective/conventions/seed-demo-con-program?tab=program`
   Full checklist: [`ORGANIZER_CONSOLE.md`](./ORGANIZER_CONSOLE.md) § Manual smoke.
4. **Apply unique index** if DB predates tonight:
   ```bash
   npm run db:push -w @c2k/api
   ```
   Schema lives in TypeScript (`packages/api/src/db/schema.ts` re-exports organizer schema). If `drizzle-kit push` fails on schema resolution, run `npm run build -w @c2k/api` first, then retry push.
5. **Manual smoke still open** ([`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md)):
   - [ ] Venues grid + locations API
   - [ ] Program conflicts
   - [ ] People / registrants (userId pickers)
   - [ ] Schedule import
   - [x] ECKE publish events (local pilot `preview-c2k-weekend` — `npm run smoke:ecke-bridge -w @c2k/api`)

### Next recommended tasks (ordered)

| # | Task | Doc / entry point |
|---|------|-------------------|
| 1 | **Phase 3:** "my participation at this event" read API (profile + attendance + roles in one payload) | [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) § Phased implementation |
| 2 | **Phase 4:** Organizer People hub unification (roster = users with grants; registration = attendance state) | Same ADR; `PeopleHubPanel` |
| 3 | **Manual organizer smoke** | [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) § Verification |
| 4 | **`venueRooms` → `convention_locations` bootstrap migration** on first organizer load | Deprecate `settings.venueRooms[]`; see parity plan |

### Key file paths

| Area | Path |
|------|------|
| Identity ADR | `docs/EVENT_SYSTEMS_IDENTITY.md` |
| Organizer parity status | `docs/DANCECARD_ORGANIZER_PARITY.md` |
| Feature registry (routes, APIs) | `docs/FEATURE_REGISTRY.md` |
| Organizer console + smoke | `docs/ORGANIZER_CONSOLE.md` |
| Backlog queue | `docs/BACKLOG_QUEUE.md` (autonomous loop queue empty — all C/O items done) |
| Organizer schema | `packages/api/src/db/convention-organizer-schema.ts` |
| Organizer routes | `packages/api/src/routes/convention-organizer-routes.ts` |
| Participation lib | `packages/api/src/lib/convention-participation.ts` |
| ECKE location sync | `packages/api/src/lib/ecke-dancecard-location-sync.ts` |
| ECKE publish payload | `packages/api/src/lib/ecke-publish-payload.ts` |
| Organizer web shell | `packages/web/src/components/organizer/convention/ConventionDancecardOrganizerClient.tsx` |
| Kit UI panels | `packages/web/src/components/dancecard/organizer/` |
| Organizer API client | `packages/web/src/lib/organizer/organizerApi.ts` |
| Demo seed | `packages/api/src/db/seed.ts` (`demo-east-collective`, `seed-demo-con-program`) |

### Known issues / blockers

| Issue | Notes |
|-------|-------|
| **Parallel identity stores** | C2K-native (`convention_check_ins`, C2K ISO, `dancecard_entries`) vs kit tables coexist; unification is phased — don't delete either path without ADR. |
| **`venueRooms` legacy** | Venues grid still reads/writes `settings.venueRooms[]` alongside `convention_locations`; bootstrap migration not shipped. |
| **Manual smoke unchecked** | Typecheck + unit tests pass; no human pass on venues/conflicts/people/import/ECKE publish with locations. |
| **`convention_persons` orphans** | Legacy roster rows without `user_id` may still exist; new writes should always resolve to `users.id`. |
| **ECKE publish** | **Phase C events verified locally** — conventions → ECKE `events`; vendors/articles/dungeons not yet published. Runbook: [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md). |
| **Realtime bus** | In-process only; multi-API replica needs Redis pub/sub (see [`REALTIME_SCALING.md`](./REALTIME_SCALING.md)). |

### Canonical references (older work)

- [`HANDOFF.md`](./HANDOFF.md) — ADR 002 (org WS, LiveKit, digests), convention calendar core, env caveats.
- [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) — demo URLs, login (`RopeDreamer` / `demo`).

---

*Prior dated sections archived below when superseded.*
