# C2K — Master next steps

**Public brand:** **Kink Social** (kink.social) — C2K is the internal codename in repo/env/packages.

**Last updated:** 2026-06-12 (pass 26 — prod doc sync; VPS alpha live at kink.social)  
**Maintainer rule:** Update this file after any vertical ship or backlog drain. Route/API tables live only in [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) (pass 26).

**Next-steps outline:** [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) — recommended work order (alpha → home polish → Phase 2 social).

### Feed card UI hardening (June 2026 — shipped)

**Wave 5:** Reactions locked to Love / Respect / Sympathize / Helpful; actions Discuss / Repost / Share / Report; Collar / Brilliant / Boost / Pass along / Going removed from generic feed UI. Routing fixes on composer, discover rail, mobile nav, Following repost. See [`UI_CLEANUP_REGISTRY.md`](./UI_CLEANUP_REGISTRY.md) Wave 5, [`HANDOFF.md`](./HANDOFF.md) § 2026-06-06 feed card.

### Discover UI refresh (June 2026 — shipped)

**Visual shells + consolidation shipped** for home feed, Events, Groups, Conventions, Find people, Education overview — see **[`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md)**. **`UI-DISC-1`–`UI-DISC-6`** done 2026-06-06. **Followups:** Near-you server API; group invitations/posts/saved APIs.

### Production alpha (2026-06-11 — live)

**VPS alpha** at **https://kink.social** — Docker Compose at `/opt/c2k`; health/ready + mail green; invite-only registration. **Shipped on prod:** profile social rail, photo upload fix, mobile UX + auth gate, account welcome email — [`HANDOFF.md`](./HANDOFF.md) § **2026-06-11**, [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted.

### Active dev (local + prod)

**Shipped (2026-06-06):** mobile door walkthrough, **UI-DISC-1–6**, **feed card UI hardening (Wave 5)**. **Next:** **LEGAL-ALPHA-1** owner smoke → **PILOT-ORG** external org on prod. **Boot:** §9 below + [`HANDOFF.md`](./HANDOFF.md).

**Known open:** **LEGAL-ALPHA-1 owner manual smoke** → freeze ([`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md)) — engineering pre-check green; owner walkthrough pending. **PILOT-MAIL** formal checklist A–E. Feed schema-drift returns **503 + migrate hint** when incremental tables missing.

---

## 1. Read order (~10 minutes)

| Order | Document | Why |
|-------|----------|-----|
| **0** | [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) | **Product strategy + binding agent rules** — phases, identity, worker/WS/ECKE, what not to build |
| 1 | [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) | Routes, API prefixes, env flags — **authoritative** |
| 1b | [`architecture/README.md`](./architecture/README.md) | Runtime domains, workflows, WS, workers — **onboarding** |
| 2 | [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) | **What to do next** — tracks A–D (alpha, home, social, UX debt) |
| 2b | **This file** | Priorities, queue pointers, verification |
| 3 | [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md) | Full-project audit snapshot |
| 4 | [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) | SMTP, Mailpit, BCC, K8s secrets |
| 4a | [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) | Prod deploy — **VPS live** at kink.social; K8s path optional |
| 4b | [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) | Operator sign-off before prod mail |
| 4c | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) | Following feed / home IA — **F1–F5 shipped**; polish in [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) Track B |
| 4d | [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) | Phase 2 social backlog (`SG-###`) — **batches 3–7:** browse/discovery IA, follow approval, feed filters, places directory, mod tools |
| 4e | [`C2K-DESIGN-SYSTEM.md`](./C2K-DESIGN-SYSTEM.md) | Cross-team visual guardrails for phased UX refactor |
| 4f | [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](./LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md) | **Legal profile + open-source T&S** — phases 0–15, alpha posture, build order |
| 4g | [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) | **Living decisions** — do-not-change list + **anti-fiddling rule** |
| 4g2 | [`PILOT_CRITICAL_GAP_AUDIT.md`](./PILOT_CRITICAL_GAP_AUDIT.md) | **Pilot stop-check** — UGC surface minimums before scoped mod build |
| 4h | [`handoff/`](./handoff/) | **GPT handoff bundle** — `npm run handoff:context`; refresh on milestones only — see `handoff/README.md` |
| 4i | [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) | 12-agent UX refactor ownership matrix + debt queue |
| 4j | [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) | **Discover refresh** — shipped surfaces, preview URLs, nav/search debt (`UI-DISC-*`) |
| 5 | [`HANDOFF.md`](./HANDOFF.md) | Env caveats, multi-replica WS, mail/LiveKit, session resume |
| 6 | [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) | Autonomous agent queue |
| — | [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md) | ECKE outbound bridge — **Phase C events done**; resume §15 for prod + other entities |
| — | [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) | Prod-only delta journal (env, migrations, sign-off) |
| — | [`plans/TIER_1_PILOT_READINESS.md`](./plans/TIER_1_PILOT_READINESS.md) | Tier 1 eng complete; **VPS invite alpha** live |

---

## 2. Current product snapshot

- **Stack:** Vite/React + Fastify + Postgres/Redis/MinIO/Mailpit (dev); `USE_DATABASE=true` in `.env.development`.
- **Hybrid product:** API-backed core for signed-in users; mock for guests, legacy IDs, `VITE_HOME_DEMO_FALLBACK`, 14 ComingSoon routes.
- **Flagship:** Org hub + Event Systems organizer + public convention hub.
- **Groups & location:** Shipped — nearby API on `/groups`, `/discovery`, and signed-in **home** join rail.
- **Home IA (2026-05-27):** Global **`CommunityNavBar`** (Following / Near you + browse links); **`ConventionCard`** matches **`EventCard`**; Near-you feed simplified (`LocalHomeFeed`); seed cleans `e2e-%` posts from trending.
- **Discover UI refresh (2026-06-01, shipped):** Mockup layouts on **`/events`**, **`/groups`**, **`/conventions`**, **`/discovery`**, **`/education`**, home 3-col feed — **`UI-DISC-1`–`UI-DISC-6`** consolidation **shipped** 2026-06-06 per [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) Track D.
- **Identity:** Phases 5–8 **done** for organizer People hub (participation API, merged copy/links, munch template). **Staff/volunteer:** `GET /api/v1/me/staff-profile` from participation tables (no `staff_profiles` table). See [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md).
- **Trust & Safety (2026-06):** LEGAL-ALPHA-1 compliance slice (policies, DMCA, MFA, export/delete); LEGAL-ALPHA-1.5 Policy Hub; MEDIA-MOD-MINIMUM platform mod on `media_asset` cases; **SCOPED-MOD-1 / T&S-5** — unified **`ReportAction`** intake, scoped mod parity (group/event/convention), P0 notify, platform hide/reporter notify — [`T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5.
- **Mail (O75):** Mailpit/K8s/lists/BCC; org welcome on join; scope-list **double opt-in** when `C2K_SCOPE_EMAIL_DOUBLE_OPTIN=true`.
- **Convention hub chat (C212):** `convention_hub_channels` — public `/conventions/:slug` Chat/Announcements prefer hub API; org channels fallback.
- **Gallery (C213):** Attendee multipart `…/gallery/attendee-upload` + URL submit + moderation UX polish (LOC-C213).
- **Digests (O77):** Weekly pinned-convention email via worker; opt-out in Settings → Email digests.
- **Push (C215):** Subscribe API; announcement + **chat** push to pinned users; per-channel prefs (`pushHubAnnouncements`, `pushHubChat`); Settings UI + `sw-push.js`.
- **Chat UX (C214):** Unread count badges on hub channel tabs.
- **Prod (kink.social):** `GET /api/health/ready` + `/api/health/mail` green; `node scripts/_smoke-prod-quick.mjs` **9/9** (2026-06-12).
- **Tests (local):** **`npm test`** green (**~87** test files in `@c2k/api` — re-run for exact count); Playwright **161 passed / 8 skipped** full suite (**21** spec files, ~85 unique cases × desktop + mobile); **`npm run verify:alpha:auto:local`** **11/11**; **`npm run verify:trust-safety`** green; pilot-readiness **11/11**; attendee dancecard **7/7**; command-bridge audit green (RBAC matrix).
- **Overall maturity:** **~82–85%** — see [`EXECUTIVE_PLATFORM_READINESS.md`](./EXECUTIVE_PLATFORM_READINESS.md).

---

## 3. Active backlog (single table)

| Priority | ID / track | Status | Next action |
|----------|------------|--------|-------------|
| **P1** | **Mobile door / organizer walkthrough** | **done (PASS WITH FOLLOWUPS)** | Door e2e + smokes green; grant-persona E2E + tag/capacity followups — [`HANDOFF.md`](./HANDOFF.md) § 2026-06-06 mobile door |
| **P0** | **LEGAL-ALPHA-1 owner smoke** | **engineering green — owner gate** | Automated + Playwright **PASS 2026-06-06** — **Brax owner walkthrough pending** — [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md) |
| **P1** | **UI-DISC-* discover consolidation** | **done** | **`UI-DISC-1`–`UI-DISC-6`** shipped 2026-06-06 — followups: Near-you API, group personal-library APIs — [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) |
| **P1** | **Community Reputation Phase 0** | **next branch** | Trust signals foundation — [`audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md`](./audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md) |
| **P2** | **SG-* (next slice)** | backlog | After UI-DISC + feed 500 check — W1 graph inbox (SG-001–004) or remaining W3 feed/media; one ID per PR |
| **P1** | **SCOPED-MOD-1 / T&S-5** | **done** | Moderation alpha pass 2026-06-06 — [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5 |
| **P1** | **MEDIA-MOD-MINIMUM** | **done** | Platform mod quarantine viewer + remove/keep/restore on `media_asset` cases |
| **P1** | **LEGAL-ALPHA-1 + 1.5** | **done (code)** | Compliance slice + Policy Hub — owner smoke row above |
| **P1** | **CP-P1-STAFF-SUMMARY** | **done** | `GET /api/v1/me/staff-profile` + public `GET /api/v1/staff/:key` |
| **P1** | **Local sprint (LOC-*)** | **done** | Queue drained — see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) |
| **P1** | **Alpha pilot (local)** | **done** | Track A signed 2026-05-27 — [`PILOT_READINESS.md`](./PILOT_READINESS.md) § Pilot dry run |
| **P1** | **FetLife-class home** | **F1–F5 + Track B done** | Pre-launch Waves 1–2 + Local meantime Waves 1–3 — [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped |
| **P1** | **Identity Phase 6–8** | **done** | People hub merge + munch template — [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) |
| **P1** | **O75 / C212–C215** | **done** | Mail, hub chat, gallery, unread badges, push — prod mail: [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) |
| **P1** | **ECKE ↔ C2K hookup** | **events done** | Vendors/articles/dungeons publish when ready — [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md) §15 |
| **P1** | **Phase 3 prod cutover** | **VPS live** | Mounted 2026-06-11 — [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted; pilot org + formal mail sign-off open |
| **P2** | **Engineering hardening** | ongoing | Feed schema-drift 503 + fail-soft likes; prod cutover per [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) |
| **P2** | **ComingSoon routes** | reduced nav | Places/Education demoted from primary nav; routes remain |
| **P1** | **PILOT-MAIL / PILOT-ORG** | **in progress** | VPS alpha live — formal SMTP checklist + external pilot org — [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) |

---

## 4. Recently shipped (rolling 30 days)

| Date | Ship |
|------|------|
| **2026-06-06 Moderation alpha pass (T&S-5)** | Unified `ReportAction` intake, scoped mod parity (group/event/convention), platform polish (P0 notify, hide_content UI, reporter notify) — [`T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5 |
| **2026-05-28 Profile UX + events polish (pass 24)** | Public profile tabs/hero; **`/profile/edit`** live preview, completion card, section nav, unified save (profile + kinks); **`birthDate`** + grouped **sexuality** (`@c2k/shared/profile-identity-options`); **`ensureProfileForUserId`** on profile routes; **removed Verified Host** badge + **`verifiedHost`** list filter (UI + API query) |
| **2026-05-28 Organizer + safety + profile (B/C/D)** | `GET /api/profile/me`; `StaffInviteLinksPanel`; door link on signups; org home pilot checklist; `ContentReportDialog` on group/event forums; settings read-only email — registry **pass 23** |
| **2026-05-28 Registry pass 22** | API module index, missing §2 routes, §7 env, deferred index — docs only |
| **2026-05-27 ECKE hookup Phase C** | C2K → ECKE Supabase events pilot (`preview-c2k-weekend`); `smoke:ecke-bridge`, `load-dev-env`, `.env.local`; ECKE §12 merge + `verify:c2k-bridge`; local public/sitemap verified — [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md) |
| **2026-05-27 Educator follow-ups** | **`/presenters/onboarding`** wizard; Education hub empty-state CTAs; **`/saved`** renders **`education_article`** bookmarks; doc sync (passes 18–21) |
| **2026-05-27 Educator Contributions** | **`education_articles`** hub + TipTap **`/education/write`**; profile Journal + Education Contributions; presenter **Writing**; org **`featured_articles`**; feed rejects new **`kind=article`** — registry pass 20 |
| **2026-05-27 Vendor community experience** | Etsy images, policies/maker story, visibility filters, **`vendor_event_credits`** worker, vending rails, contributor DELETE — registry pass 19 |
| **2026-05-27 Presenter teaching history** | **`presenter_teaching_credits`** worker sync; unified teaching history on **`/presenters/:username`** — registry pass 18 |
| **2026-05-27 Vendor onboarding** | **`/vendors/onboarding`** wizard, settings **`VendorShopSection`**, **`vendor_shop_live`** feed verb — registry pass 17 |
| **2026-05-27 Wave 3 Local meantime** | SG-093 **event story cards** + inline RSVP in **`ActivityFeedCard`**; **G304** UUID group mock tab gating; Wave 3C — `/community` → `/groups`, **ComingSoonLayout** live links (registry pass 14) |
| **2026-05-27 Wave 2 Local meantime** | SG-130 **`post_likes`** + **connection liker preview** on feed + **`LocalPostCard`** Love API; SG-084 **muted tags** in Settings + Following/Near you feed filter; **profile photos API-first** (`/api/profile/me/photos`, `useProfilePhotos` `apiBacked`) — registry pass 15 |
| **2026-05-27 Wave 1 Local meantime** | SG-120 **Interested** RSVP label (`RSVP_LABEL_INTERESTED` in `@c2k/shared`); SG-138 follow-up — `PATCH /api/v1/groups/:groupId` category/description + `GroupSettingsPanel`; UX B2 org hub staff hint; UX N1 messaging explainer in [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) § N1 |
| **2026-05-27 pre-launch Wave 2** | SG-105 events type/format filters + My agenda sidebar; SG-085 bookmarks + `/saved` page; **Create Group** on `/groups` (`POST /api/v1/groups` + modal); organizer shell spacing (`OrganizerAppShell` gap/padding pass) |
| **2026-05-27 pre-launch Wave 1** | SG-033 member since; SG-031 copy link; SG-137 connection RSVP avatars; SG-082 calendar export; SG-138 group discovery grid; SG-015 rsvp close/reopen |
| **2026-05-27 four-phase plan** | Track A alpha signed; Track B (profile location, browse nav, convention hubs gating, e2e); Phase 3 prep docs; Phase 4 slices — SG-080/081/087/096, geo browse + featured events, feed filter tabs |
| **2026-05-27 home + docs** | Persistent `CommunityNavBar`; `ConventionCard`; `LocalHomeFeed` simplification; `community-nav.ts`; seed e2e cleanup + demo `stateId`; [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) |
| **2026-05-26 ECKE V2** | Member `dc-*` chrome V2-0–V2-5; `check:dc-classes` CI — [`UX_REFACTOR_V2_PROGRESS.md`](./UX_REFACTOR_V2_PROGRESS.md) |
| **2026-05-26 capability P0** | Presenter + Vendor capability rollout: `/api/v1/me/presenter-profile`, `/api/v1/me/vendor-profile`, organizer presenter lookup, convention vendor listing + vendor history/commission fields |
| **2026-05-26 phase 2 F4–F5** | Following sub-filters + counts; convention_pin / org_join / org_announcement / group_join emits |
| **2026-05-26 phase 2 F1–F3** | `feed_activities`, `GET /api/v1/feed/following`, Following/Discover home UI |
| **2026-05-24 pass 8** | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md); C215 chat push + prefs; Identity People hub + munch; [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) |
| **2026-05-24 pass 7** | Scope-email double opt-in; `/email/confirm`; dev mail/push env |
| **2026-05-24 pass 6** | E2E 19/19; unread badges; web-push announcements; org welcome email; Settings push UI |
| **2026-05-24 pass 5** | Hub channels (C212); gallery attendee upload; push subscribe API; O76/O77; real test-send; settings email digests |
| **2026-05-24 pass 4** | Mailpit dev; org/group email lists + broadcast; platform BCC + CSV export; `k8s/base/`; [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) |
| **2026-05-24 pass 3** | Transactional email test-send + RSVP; gallery moderation; home nearby groups; HTTP smoke |
| **2026-05-24 pass 2** | `GET …/me/participation`; discovery Near you; **E2E 19/19** |
| **2026-05-24 pass 1** | Group `place_id`, nearby API, `db:migrate-incremental`, `og-default.png` |
| **2026-05-22** | G301–G312 groups/events; Dancecard parity |

---

## 5. Verification commands

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml up -d mailpit   # optional: local SMTP UI :8025
npm run db:migrate-incremental -w @c2k/api
npm run dev
npm run verify:alpha        # official local alpha gate (typecheck + test + e2e + smokes)
# or piecemeal:
npm run typecheck
npm test
npm run test:e2e            # 21 spec files; full suite ~161 passed / 8 skipped (DB + Mailpit)
node scripts/audit-command-bridge.mjs
npm run smoke:ecke-bridge -w @c2k/api   # ECKE events bridge (needs .env.local + DB)
```

**Mail smoke:** Set `C2K_PLATFORM_MAIL_BCC` + enable org email list in organizer settings → subscribe on public org page → send broadcast → check Mailpit (http://127.0.0.1:8025) and BCC inbox.

---

## 6. Launch blockers

| Blocker | Mitigation |
|---------|------------|
| `db:push` Zod on expression indexes | `db:migrate-incremental` |
| No native payments / push | Out of scope; O76/O77/C215 backlog |
| Production mail deliverability | Configure real SMTP in K8s secret or `.env.production`; SPF/DKIM at DNS |
| Legal/compliance for marketing BCC | Privacy policy + list consent copy on signup forms |

---

## 7. Suggested next sprint (see roadmap)

**Full outline:** [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) — Tracks **A** (alpha), **B** (home polish), **C** (Phase 2 social), **D** (UX debt).

**Posture:** **No paid server yet** — local Docker + Mailpit. Prod: [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md).

| Priority | Track | Action |
|----------|-------|--------|
| **P0** | **LEGAL-ALPHA-1** | Manual smoke → freeze — [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md) |
| **P1** | **Community Reputation Phase 0** | Next on new branch — [`audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md`](./audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md) |
| **Later** | **Phase 3 (ops)** | When server exists: [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) → SMTP checklist → first pilot org |
| **Later** | **Phase 4+ social** | Pick next `SG-*` only if anti-fiddling rule allows — [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) |
| **Deferred** | **Server** | `PILOT-MAIL`, `PILOT-ORG` in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) |

**Worker:** `npm run start:worker -w @c2k/api` (people sync, feed activities, digests, moderation).

---

## 8. Overall execution plan (next 2 weeks)

| Window | Focus | Execution items | Exit criteria |
|---|---|---|---|
| **Days 1–3** | Capability completion + API hardening | Ship P1 Staff/Volunteer computed profile summary, lock auth/contract tests for all capability profile endpoints, verify migration + route registry docs in sync | `typecheck` + `test` green, smoke auth checks passing, FEATURE_REGISTRY updated |
| **Days 4–6** | Alpha reliability pass | Full local sprint gate (`pilot-readiness-smoke`, registration/reports/organizer walk), manual door mobile pass, PWA sanity pass | Local alpha checklists complete without blockers |
| **Days 7–10** | Pilot cutover prep | Finalize server mount runbook deltas, SMTP checklist dry run, define first pilot org onboarding script and owner handoff artifacts | Cutover checklist runnable end-to-end; pilot org onboarding packet ready |
| **Days 11–14** | Social + post-pilot queue | Resume SG-* backlog in smallest safe slices while preserving organizer stability budget | At least one SG vertical merged without regression in organizer flows |

### Current execution status

- Capability P0 rollout is complete (presenter + vendor).
- P1 staff/volunteer computed profile API **done** (`CP-P1-STAFF-SUMMARY`).
- Reliability gate (2026-06-06 local): **`npm test` 251/251**; Playwright full suite **161 passed / 8 skipped**; **`npm run verify:alpha`** / trust-safety scripts green when DB + Mailpit up.

## 9. Resume dev

1. Read [`HANDOFF.md`](./HANDOFF.md) § **2026-06-06** and [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) (2026-06-06 sync).
2. Boot stack and apply incremental migrations (profile columns if missing):

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api
npm run dev
```

3. Smoke: signed-in **`/profile`**, **`/profile/edit`**, **`/events`** (no Verified Host badge/filter), **`/home?mode=discover`** (feed 500 if still broken).
4. Pick next work from [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) Track C (`SG-*`) or fix feed 500 before new social slices.

Demo URLs: [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) · Mailpit http://127.0.0.1:8025

---

*Audit: [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md). Narrative: [`NEXT_STEPS.md`](./NEXT_STEPS.md). Handoff: [`HANDOFF.md`](./HANDOFF.md). Mail ops: [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md).*
