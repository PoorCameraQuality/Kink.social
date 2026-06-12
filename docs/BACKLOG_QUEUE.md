# C2K backlog queue (autonomous agent)

**Last updated:** 2026-06-12 (pass 26 — prod live; doc sync)

**Purpose:** Ordered queue for autonomous loops. **Mix social + organizer** — do not block the loop on one heavy organizer slice.

**Last drained:** 2026-06-06 mobile door + organizer alpha walkthrough. **FetLife-class home** F1–F5 shipped; remaining **`SG-*`** in [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md).

**Active queue:** **Followups only** — `ORG-DOOR-*` rows below. **`PILOT-MAIL`** / **`PILOT-ORG`** **in progress on prod** (VPS alpha live — formal sign-off still open). Discover consolidation **`UI-DISC-*`** **done** — [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md).

---

## Queue

| ID | Status | Source | Title | Notes |
|----|--------|--------|-------|-------|
| ORG-DOOR-1 | pending | mobile-door-walk | Grant-persona door E2E | Playwright: registration-only can door; staff-only denied; owner settings 403 |
| ORG-DOOR-2 | pending | mobile-door-walk | Registrant tag persistence | `PATCH …/registrants/:id` ignores `tagIds`; UI now honest — wire or hide tab |
| ORG-DOOR-3 | pending | mobile-door-walk | Category capacity → waitlist | Capacity field decorative; no auto-waitlist on public register — product decision |
| ORG-DOOR-4 | pending | mobile-door-walk | Hub canManage vs command bridge | `conventions-routes` `canManage` true for any grant — registration-only hub mod bleed |
| LOC-ORG-WALK | done | local-sprint | Organizer tab endpoint walk | `scripts/smoke-organizer-tab-walk.mjs` |
| LOC-C213 | done | local-sprint | Gallery polish | Empty state + pending banner in `ConventionGalleryGrid` |
| LOC-REG-GREEN | done | local-sprint | Greenfield registration smoke | `scripts/smoke-greenfield-registration.mjs` |
| LOC-DOOR-MOBILE | done | local-sprint | Door panel mobile pass | Safe-area + touch targets in `DoorModePanel` |
| LOC-PWA | done | local-sprint | PWA manifest + offline SW | `manifest.json`, `sw-offline.js`, `index.html` |
| LOC-REPORTS-E2E | done | local-sprint | Report path smoke | `GET /api/v1/me/reports` + `scripts/smoke-reports.mjs` |
| LOC-PRES-CREDITS | done | local-sprint | Presenter schedule credits | `loadPresenterScheduleCredits` + upcoming preview on me profile |
| LOC-PRES-VERIFY | done | local-sprint | Presenter teaching history sync | Worker upserts **On program** rows after slot ends; unified `/presenters/:username` teaching history |
| LOC-VEND-EXPERIENCE | done | local-sprint | Vendor community experience | Etsy images, policies/maker story, visibility filters, event credits worker, vending rails, contributor DELETE |
| LOC-EDU-CONTRIBUTIONS | done | local-sprint | Educator Contributions | `education_articles` hub + TipTap write flow; journal unification; org featured articles; no public popularity metrics |
| LOC-NOTIF-ENUM | done | local-sprint | Notification types registry | `@c2k/shared/notification-types.ts` |
| LOC-WORKER-SYNC | done | local-sprint | People directory → worker | `c2k-convention-people-sync` queue |
| LOC-E2E-MAIL | done | local-sprint | Scope-email + registration smokes | `smoke-greenfield-registration.mjs` |
| LOC-STUBS-HEADER | done | local-sprint | `ecosystem-stubs.ts` header | Top-of-file scope doc |
| LOC-NAV-COMINGSOON | done | local-sprint | Trim ComingSoon nav | Removed Places/Education from `navPrimary` |
| PH2-F1 | done | phase-2-social | `feed_activities` write path | `feed-activities.ts`, queue, emit on post/RSVP/connection/presenter |
| PH2-F2 | done | phase-2-social | Following read API | `GET /api/v1/feed/following`, `following-ids.ts` |
| PH2-F3 | done | phase-2-social | Following / Discover home UI | `FollowingFeedTab`, `useApiFeed`, `ActivityFeedCard` |
| PH2-F4 | done | phase-2-social | Following sub-filters + counts | `feed-following-filters.ts`, `/feed/following/counts`, filter UI |
| PH2-F5 | done | phase-2-social | Org/convention activity emits | pin, org_join, org_announcement, group_join verbs |
| G301 | done | groups-events-scope | `GET /api/v1/events?groupId=` filter | `ecosystem-stubs.ts` |
| G302 | done | groups-events-scope | Event organizer panel (replace stub) | `EventOrganizerPanel.tsx` |
| G303 | done | groups-events-scope | Munch create + simplified public detail tabs | `CreateFlowModal`, `EventDetailClient` |
| G304 | done | groups-events-scope | Hide mock group tabs for API UUID groups | Channels/Resources/Photos |
| G305 | done | groups-events-scope | Group events on public page + organizer schedule | `useGroupDetail`, `OrganizerGroupClient` |
| G306 | done | groups-events-scope | Docs sync for groups/events scope | FEATURE_REGISTRY, ORGANIZER_CONSOLE |
| G307 | done | groups-events-post-audit | Group POST events auth + GET ?groupId= visibility | `group-access.ts`, `ecosystem-stubs.ts` |
| G308 | done | groups-events-post-audit | Event organizer `viewerCanManage` + org mod UI | `EventOrganizerPanel`, event GET |
| G309 | done | groups-events-post-audit | `/organizer/groups/:id/events/:eventId` route | router + schedule manage links |
| G310 | done | groups-events-post-audit | CreateFlowModal prefill org from group + munch end default | `CreateFlowModal.tsx` |
| G311 | done | groups-events-post-audit | Group events loading skeleton | `useGroupDetail`, `GroupEventsSection` |
| G312 | done | groups-events-post-audit | E2E smoke: groupId filter + viewerCanManage | `e2e/smoke.spec.ts` |
| C212 | done | public-page-refactor-v2 | Convention hub chat channels | `convention_hub_channels` + `convention-hub-channels-routes.ts`; public hub prefers hub channels over org channels; staff auto-seed `#general` + `#announcements`. |
| C213 | done | public-page-refactor-v2 | Attendee-uploaded gallery photos | Upload + URL submit + moderation UX polish (LOC-C213). |
| C214 | done | public-page-refactor-v2 | Threading + read receipts UI | Replies + thread indent; `mark-read`; **unread badges** on hub channel tabs (pass 6). |
| C215 | done | public-page-refactor-v2 | Push notifications | Subscribe + announcements + **chat** push; `push_hub_announcements` / `push_hub_chat`; `sw-push.js` + Settings channel toggles. |
| O75 | done | public-page-refactor-v2 | Transactional email pipeline | Mailpit/K8s/lists/BCC; test-send; org welcome on join; **double opt-in** (`C2K_SCOPE_EMAIL_DOUBLE_OPTIN`, confirm email + `/email/confirm`). |
| O76 | done | public-page-refactor-v2 | Inline “Join organization” from `HostedByCard` | `POST …/organizations/:orgKey/join` from convention hero card. |
| O77 | done | public-page-refactor-v2 | Pinned-conventions digest email | `pinned-digest-sweep` + worker `pinned-digest-sweep`; `pinnedDigestEmailWeekly` in notification prefs + Settings UI. |
| PILOT-MAIL | in_progress | pilot-readiness | **Prod SMTP sign-off** | **VPS live** — `GET /api/health/mail` green on kink.social; complete [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) A–E + mail log row. Local Mailpit **done** 2026-05-26. |
| PILOT-ORG | in_progress | pilot-readiness | **First real pilot org (prod)** | **VPS live** — invite-only alpha (~7 users); external pilot org onboarding still open per [`PILOT_READINESS.md`](./PILOT_READINESS.md) § First real pilot org. |
| PILOT-1 | done | pilot-readiness | Registration-only **POST /registrants** | 400 on bad `categoryId`; smoke uses real category; 2026-05-26. |
| PILOT-2 | done | pilot-readiness | **Session feedback** | `PATCH /session-feedback` + `/config` alias; parity smoke fixed. |
| PILOT-3 | done | pilot-readiness | Registration categories | API returns `categories`; `npm run db:ensure-preview-categories -w @c2k/api` if DB stale. |
| DC-ATTENDEE | done | dancecard-parity | Attendee dancecard hub (ECKE feature cards) | Hub shell + groups/maps; policies on Documents tab; volunteer claim + shift swaps (attendee API + dancecard panel); compare day grid; parity seed (grant + open shift). |
| PILOT-LOCAL-SIGNOFF | done | pilot-readiness | Local pilot automated gate | `pilot-readiness-smoke.mjs`, `npm run typecheck`, `npm test` green 2026-05-26; manual smoke in `DANCECARD_ORGANIZER_PARITY.md` + `PILOT_READINESS.md` (owner walk). |
| CP-P0-PRES-SELF | done | capability-profiles | Presenter self profile endpoints | Added `GET/PUT /api/v1/me/presenter-profile` + auth smoke coverage |
| CP-P0-PRES-PUBLIC | done | capability-profiles | Presenter organizer lookup | Added `GET /api/v1/conventions/:key/organizer/presenter-lookup` |
| CP-P0-VENDOR-SELF | done | capability-profiles | Vendor capability self profile | Added `GET/PUT /api/v1/me/vendor-profile` and schema fields (`visibility`, `commissionStatus`, `commissionNotes`) |
| CP-P0-VENDOR-PUBLIC | done | capability-profiles | Vendor public history + convention vendors | Added vendor history payload + `GET /api/v1/conventions/:key/vendors`; vendor page renders commission status/history |
| CP-P1-STAFF-SUMMARY | done | capability-profiles | Staff/Volunteer computed summary profile | Added `GET /api/v1/me/staff-profile` + `GET /api/v1/staff/:key` from participation tables (no `staff_profiles` table) |
| LOC-ALPHA-RELIABILITY-2 | done | local-sprint | Alpha reliability pass rerun | `pilot-readiness-smoke`, `smoke-greenfield-registration`, `smoke-reports`, `smoke-organizer-tab-walk` all green after capability rollout |
| LEGAL-ALPHA-1 | done | legal-profile | Alpha compliance slice (policy, DMCA, legal UI, MFA, export/delete) | **Done — pending owner manual smoke** then freeze — [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md) |
| LEGAL-ALPHA-1.5 | done | legal-profile | Policy Hub index, scoped policies, standard section format, route aliases | [`policies/POLICY-HUB-ARCHITECTURE.md`](./policies/POLICY-HUB-ARCHITECTURE.md) · verify `policy-hub` |
| POLICY-COVERAGE-GAP-AUDIT-1 | done | trust-safety | Policy matrix + scoped mod gap audit + DMCA 10–14 business day copy | [`trust-safety/POLICY_COVERAGE_MATRIX.md`](./trust-safety/POLICY_COVERAGE_MATRIX.md) · [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](./trust-safety/SCOPED_MODERATION_GAP_AUDIT.md) |
| SCOPED-MOD-1 | done | scoped-mod | Lower-tier scoped moderation (orgs, groups, events, conventions, scoped UGC) | **Complete 2026-06-06** — T&S-5: `ReportAction` intake, group/event/convention mod, P0 notify, `moderation-scoped.test.ts`, `smoke-moderation-checkpoint.mjs` — [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5 · [`plans/SCOPED-MOD-1-ORCHESTRATION.md`](./plans/SCOPED-MOD-1-ORCHESTRATION.md) |
| MEDIA-MOD-MINIMUM | done | trust-safety | Platform mod: quarantine viewer + remove/keep/restore on `media_asset` cases | **`media-mod-actions.ts`** + **`media-mod-minimum.test.ts`** (7) · `db:seed-moderation-ts-fixtures` · shipped before T&S-5 |

**Not in this queue (tracked elsewhere):**

| Track | Status | Doc |
|-------|--------|-----|
| **Tier 1 pilot readiness** | eng done / **local Docker sprint** | [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) |
| Event Systems identity Phase 6–8 | done | [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) — People hub merge, munch template, registrant `userId` guards |
| FetLife-class home (F1–F5) | **F1–F5 shipped** | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) — SG-* social parity next |
| Social graph FetLife parity (`SG-001`…) | planned | [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) — one ID per PR; not in autonomous loop |
| Discover UI consolidation (`UI-DISC-*`) | **done** 2026-06-06 | [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) · [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) |
| Community Reputation Phase 0 | planned | [`audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md`](./audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md) — new branch after T&S-5 |
| Dancecard manual smoke | done (API+e2e 2026-05-26) | [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) — `smoke-attendee-dancecard.mjs`; organizer walk still open |
| Product backlog | ongoing | [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) |

---

## Completed (reference)

| ID range | Title |
|----------|-------|
| C1–C211 | UX + social polish — [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) done rows |
| O1–O74 | Organizer program/settings/people UX — [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) + [`ORGANIZER_CONSOLE.md`](./ORGANIZER_CONSOLE.md) |
| C74–C100 | Discovery/home fetch retries, connections/profile messaging polish |
| O19–O30 | Program modal busy guards, delete-arm resets, load error retry/dismiss |

Recent completed IDs (2026-05 batch): C101–C211 (error banner patterns, dismiss/retry/persist audits across conventions, ECKE, org settings, people panel, login/create flows); O31–O74 (program import/export guards, settings save feedback, people/ECKE load error handling); **ECKE hookup Phase C** (events pilot `preview-c2k-weekend`, `smoke:ecke-bridge`, ECKE `verify:c2k-bridge` — [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md)).

---

## LEGAL-ALPHA-1 worker prompt

Implement the next legal/compliance alpha readiness slice for Coast to Coast Kink.

**Current status:**

- Legal profile foundation and T&S-4B hardening are complete.
- Alpha posture is `community_only`.
- Explicit media is disabled by default.
- `attested_explicit_beta` is staging-only unless explicitly enabled.
- Production scanners fail closed.
- Explicit + `PUBLIC_PREVIEW` is coerced to `logged_in` at attestation.
- `verify:trust-safety` and `verify:prelaunch` are green.

**Goal:** Close the highest-priority alpha compliance gaps without touching PhotoDNA, UI-2, or paid/enterprise integrations.

**Scope:**

1. Published policy pages
2. DMCA workflow
3. Legal-request intake UI
4. Admin MFA enforcement
5. User export/deletion foundation
6. Vendor registry enforcement

**Do not implement:** PhotoDNA, NCMEC API, StopNCII/Take It Down integration, full UI-2 redesign, explicit media production expansion, explicit video uploads.

**Acceptance criteria:**

- Public policy pages exist and are linked from footer/signup/admin.
- Signup records active policy versions.
- DMCA page exists with takedown/counter-notice/repeat-infringer language.
- DMCA case model exists.
- Admins can disable/restore content from a DMCA case.
- Legal request model/UI exists.
- Legal hold can be created from legal request UI.
- Destructive deletion respects legal hold.
- Admin MFA is required for SITE_ADMIN, TRUST_SAFETY_ADMIN, and LEGAL_ADMIN.
- User export/deletion has a foundation route/UI, even if export is v1 JSON only.
- Vendor registry exists and new vendor integrations require registry documentation.
- All sensitive admin/legal actions require audit logs.
- Existing gates remain green: `verify:trust-safety`, `verify:prelaunch`, `npm test`, `npm run build`.

**Add or update verification scripts as appropriate:**

- `npm run verify:trust-safety:legal-profile`
- `npm run verify:trust-safety:dmca`
- `npm run verify:trust-safety:admin-security`
- `npm run verify:trust-safety:privacy`

---

*Autonomous loop repopulates pending rows from UX audit / NEXT_STEPS when empty.*
