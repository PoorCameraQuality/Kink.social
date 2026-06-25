# ECKE Publish Parity Audit

**Status:** Pass 4 complete locally — Pass 3+4 **not yet on GitHub `main`** (uncommitted working tree as of 2026-06-25)  
**Repos:** kink.social (`coast-to-coast-kink`), ECKE (`PoorCameraQuality/EastCoast` on GitHub)  
**Date:** 2026-06-25

> **Git checkpoint:** Before deploying Pass 3/4, commit and push ECKE publish files from a feature branch. `origin/main` does not yet include `ecke-publish-service.ts`, control routes, group ECKE tab, or Pass 3 migration columns.

---

## Executive summary

| Layer | Today | Gap |
|-------|-------|-----|
| **Transport** | Split: Ingest API (articles only) + Supabase REST + listing webhook | One ingest/unpublish contract not yet generalized |
| **Group control plane** | Group listing API + `EckePublishStub` buried in Settings tab | No dedicated ECKE tab, no unpublish, no sub-entity publish, no plain-English preview drawer |
| **Standalone events** | Full API + BullMQ worker | **Zero web UI** |
| **Presenter / group-owned sub-entities** | Not implemented | High-priority parity gaps |
| **Status tracking** | `ecke_publish_targets` table exists | Missing ECKE public URL, unpublish timestamp, preview payload storage |

**Smallest safe first pass:** Build registry + preview/status endpoints + group dashboard ECKE tab; wire `group_listing` through generalized ingest when ECKE schema is ready; keep existing webhook/Supabase paths as fallback.

---

## Product rule: ECKE grows to match public-safe kink.social features

**Addendum (applies to all passes after Pass 1).**

### Core principle

kink.social is the **private/community/workflow source of truth**. ECKE is the **public SEO/discovery surface**.

If kink.social has richer **public-safe** features than ECKE currently displays, we should **not** permanently flatten or discard that data. Instead, we should consider expanding ECKE public pages so leaders can **intentionally publish** those richer modules.

This must always be **opt-in** and **public-safe**.

### Examples of public-safe richer data

When an organization, group, convention, or event in kink.social has any of the following **and** it is marked public-safe, the publish preview should surface it and ECKE should eventually gain display modules where appropriate:

- public schedule blocks
- public map pins
- public venue/location summaries
- public vendor lists
- public presenter/class schedules
- public dungeon/place information
- public sponsor listings
- public media/hero images
- public organizer notes
- public accessibility information
- public parking/transit info
- public rules/code of conduct
- public ticket/registration links
- public social links
- public recurring meetup information

### Do not leak private data

This addendum **does not** change the privacy contract. See `ECKE_PUBLISH_PRIVACY_CONTRACT.md`.

Never publish: private maps, private pins, hidden venue addresses, member-only schedules, attendee lists, RSVP lists, staff-only schedules, staff notes, volunteer/private shift data, internal organizer notes, group member lists, hidden membership settings, private messages, moderation data, application answers, private files, private contact info.

---

## ECKE Capability Expansion Candidates

For each kink.social entity type, public-safe features that ECKE does not fully display today. Use this table to track gaps; do not silently drop public-safe payload fields without documenting them here.

| kink.social entity | Rich public-safe data in kink.social | Does ECKE display it today? | Should ECKE support it? | Privacy risk | Proposed ECKE module | Priority |
| ------------------ | ------------------------------------ | --------------------------- | ----------------------- | ------------ | -------------------- | -------- |
| organization | public map pins, schedules, public events, contact/CTA, venue relationships, recurring meetups, organizer policies | partial/unknown | yes | medium | Public org profile modules | P2 |
| group | public listing, public events, schedule, resources, region summary, rules | limited (listing only via webhook) | yes | medium | Public group listing + hub modules | P1 (listing done Pass 3) |
| convention | public schedule, locations, vendors, presenters, maps, sponsors, code of conduct, registration CTA | partial | yes | high | Public convention hub modules | P2 |
| event | title, description, date/time, location summary, host attribution, image, CTA, rules, accessibility, parking/transit, schedule blocks, map pins | partial (core row on `/events`; not calendar) | yes | medium | Enhanced event detail modules | **P1 (publish Pass 4)** |
| dungeon/place | name, region, amenities, rules, access notes, images, recurring events | partial | yes | high | Enhanced venue profile | P3 |
| vendor | profile, products/services, shop links, event appearances | partial | yes | low/medium | Vendor profile modules | P3 |
| education | article, author/presenter link, related articles, learning paths, related classes | partial (ingest articles) | yes | low/medium | Education relationship modules | P3 |

**Pass 3 note:** `group_listing` currently publishes a **minimal** listing payload (name, slug, public description, region summary, tags, hero image, CTA). Richer group modules (public schedule, map pins, resources, recurring meetups) are **expansion candidates** — preview should label them when present in kink.social but not yet sent or not yet displayed on ECKE.

---

## ECKE Expansion Rule

When a kink.social publish payload contains public-safe data that ECKE cannot currently display, **do not silently drop it** without documenting the gap.

Instead:

1. Show it in the kink.social preview as one of:
   - **Will publish now** — included in outbound payload and ECKE can display (or will via current ingest/webhook)
   - **Public-safe but ECKE does not display this yet** — eligible data held back or stored for a future ECKE module; logged in expansion candidates table
   - **Not sent for privacy** — omitted per redaction contract (`ECKE_PUBLISH_PRIVACY_CONTRACT.md`)
2. Add the missing display support to the **ECKE Capability Expansion Candidates** table above.
3. Consider an ECKE page/module update in a later pass (kink.social and/or EastCoast repo).
4. Keep each implementation pass scoped (e.g. Pass 3 = `group_listing` lifecycle only).

**Registry/service shape:** Leave room for future payload sections (`schedules`, `mapPins`, `vendors`, `presenters`, `publicResources`, etc.) without breaking existing listing envelopes.

---

## Pass 3 scope reminder (unchanged by addendum)

Pass 3 remains:

- `group_listing` publish, sync, unpublish
- status tracking and stale detection
- public-safe preview with omitted-fields list
- **No** group events, maps/pins, schedules, vendors, or broad ECKE page redesign in Pass 3

Future passes may extend ECKE display modules per the expansion rule above.

---

## Architecture today

```
kink.social (control plane)
├── Option A: POST /api/kink-social/ingest|unpublish  → education_article only
├── Option B: Supabase service-role REST              → events, vendors, dungeon_venues, dancecard_*
└── Option C: ECKE_PUBLISH_LISTING_WEBHOOK_URL        → ecke_listing (org/convention/group)

ECKE (runtime)
├── Public pages merge static + Supabase rows (unifiedEvents, educationArticles, …)
├── Sitemap + IndexNow on article ingest
└── Dancecard: separate Supabase-synced program tables
```

**Gate:** `ECKE_PUBLISH_ENABLED=true` (`packages/api/src/lib/ecke-publish-client.ts` L67–95).  
**Route registration:** `packages/api/src/server.ts` L83–84, L295–296.  
**Worker queue:** `c2k-ecke-publish` — jobs: `publish-article`, `publish-vendor`, `publish-convention-event`, `publish-standalone-event` only (`packages/api/src/lib/ecke-publish-queue.ts` L45–88).  
**Status table:** `ecke_publish_targets` (`packages/api/src/db/schema.ts` L3768–3830).

---

## Table 1 — kink.social source entities

| Source entity in kink.social | Current publish support | Current route/API | Current executor/queue | Current ECKE target | Current UI surface | Missing UI/control | Security/privacy notes | Proposed parity fix |
| ---------------------------- | ----------------------- | ----------------- | ---------------------- | ------------------- | ------------------ | ------------------ | ---------------------- | ------------------- |
| **Education article** | **Shipped** (Ingest API Pass 3B) | `GET/POST /api/v1/me/education-articles/:id/ecke-publish`, `POST …/sync` (`ecke-publish-entity-routes.ts` L71–109) | `publish-article` job → `executeEckePublishArticle` (`ecke-publish-queue.ts` L45–47, `ecke-publish-executor.ts` L36–73) | ECKE `/education/[slug]` via ingest → `articles` table | `packages/web/src/app/education/write/page.tsx` L520–537 (`EckeEntityPublishStatus`) | Unpublish UI; group/org-scoped education publish; plain-English preview drawer | Author-only L36–43; redaction in `ecke-public-publish.ts` L67–172; visibility gates | Extend ingest; add registry entry `education_article`; optional group dashboard card when article is group-owned |
| **Vendor profile** | **Shipped** (Supabase REST) | `GET/POST /api/v1/vendors/me/ecke-publish` (`ecke-publish-entity-routes.ts` L111–154) | `publish-vendor` job (`ecke-publish-queue.ts` L49–51) | Supabase `vendors` → `/vendors/[slug]` | `VendorShopSection.tsx` L462–479 | Preview route; group/org operator path; unpublish UI | Vendor owner only; `visibility === PUBLIC` required | Registry + ingest schema for `vendor_profile`; group dashboard Vendors tab |
| **Organization profile/listing** | **Partial** — webhook listing + optional dungeon | Org GET/preview/publish/unpublish L1097–1430 (`ecke-publish-routes.ts`) | **None** — synchronous in route handler | `ecke_listing` webhook + optional `dungeon_venues` Supabase | `SettingsPublishTab.tsx` L52–59; `ExternalPublishingSection.tsx`; `OrganizerOrgHomePanel.tsx` | Fails without webhook URL; no ECKE public URL stored; listing unpublish incomplete | Org mod+ L138–168; hidden when `visibility !== PUBLIC'` (`buildOrgListingPayload` L117–126) | Generalized ingest for `organization_listing`; store returned slug/URL in `ecke_publish_targets` |
| **Group profile/listing** | **Partial** — webhook only, inline | Group GET/preview/publish L1611–1746 (`ecke-publish-routes.ts`); **no unpublish route** | **None** — inline `publishListingToEcke` L1722 | `ecke_listing` webhook (consumer TBD on ECKE) | `OrganizerGroupSettingsPanel.tsx` L185–190 (`EckePublishStub`, settings tab only) | **No dedicated ECKE tab**; no unpublish; no BullMQ retry; no sub-entities; contract marks group “deferred” (`ECKE_PUBLIC_PUBLISHING_CONTRACT.md` L52) | Group mod or parent-org owner L315–378; hidden when `visibility !== 'public'` (`buildGroupListingPayload` L137) | **Pass 3 priority:** registry + group dashboard ECKE page; ingest `group_listing`; unpublish endpoint |
| **Standalone public event** | **API shipped**, **UI missing** | `GET/POST …/organizer/ecke-publish/events/:eventIdOrSlug` (+ preview/publish/unpublish) L1484–1609 | `publish-standalone-event` (`ecke-publish-queue.ts` L61–63) | Supabase `public.events` | **None** in `packages/web` | Entire organizer UI for group/org event pages | Host or org mod L918–945; location redaction L327–336, L338–373; convention anchors blocked L314–320 | Group Events tab + event detail ECKE panel; ingest `event_listing` |
| **Convention** | **Shipped** (multi-target) | Convention GET/preview/publish/unpublish L1192–1482 | `ecke_event` queued L717–736; listing + Dancecard inline | `ecke_listing` webhook + `ecke_event` + `dancecard_event` + children | `IntegrationsPanel.tsx` L292; `ConventionPublishActions.tsx` | Unpublish only clears `ecke_event` L1451–1482; Dancecard/listing not torn down | Convention **full admin** only L206–210 | Registry entries per target kind; unified unpublish |
| **Convention public ECKE listing** | **Shipped** (webhook) | Part of convention routes; `buildConventionListingPayload` L148–200 | Inline with convention publish | Listing webhook → ECKE directory | `ConventionListingDetailsEditor.tsx`; `EckePublishStub` | Webhook dependency; no ingest path | Public location summary only L174; member action URL L195 | Move to ingest `convention_listing` |
| **Convention Dancecard event** | **Shipped** | Bundled in convention publish L739–784 | Inline `publishDancecardEventToEcke` (`ecke-publish-client.ts` L262–393) | `dancecard_events` + children | Shown in `EckePublishStub` target list | Gated by `dancecardEnabled` L106–108 | Access codes published L264–265; staff = display names only | Group dashboard Dancecard tab when group operates convention |
| **Dancecard locations** | **Shipped** (child sync) | N/A — bundled in `publishDancecardEventToEcke` | Inline; orphan delete on republish L300–307 | `dancecard_locations` | Slot/location counts in publish status | — | No C2K user IDs | Registry entry `dancecard_location` |
| **Dancecard program slots** | **Shipped** | `filterSlotsForPublicProgram(..., 'anonymous')` in routes | `ecke-dancecard-slot-sync.ts` | `dancecard_program_slots` | Convention integrations panel | Presenters on slots **not** synced (`ECKE_C2K_ENTITY_MAP.md` L209–216) | Anonymous program filter | Registry + optional presenter line later |
| **Dancecard staff shifts** | **Shipped** | `ecke-dancecard-staff-sync.ts` L5–17 | Inline in Dancecard publish | `dancecard_staff_shifts` | Count in status | — | Parsed display names only; no `user_id` | Registry entry `dancecard_staff_shift` |
| **Presenter profile** | **Not implemented** | Contract: “No route yet” L48 | None | TBD `/presenters/[slug]` | None | Full publish path | Only indirect link in article payload `ecke-public-publish.ts` L67–75 | Add after ECKE presenter pages exist |
| **Place / dungeon / venue** | **Partial** — org-scoped only | Inline on org publish L578–607; `buildEckeDungeonRowFromOrg` | Inline Supabase `dungeon_venues` L489–491 | `/dungeons/[slug]` | Org `listingKind` in `SettingsGeneralTab.tsx` L51–241 | No standalone place entity; no group-scoped dungeon | `isOrgDungeonListing` L75–83; geo from org venue flags | Ingest `dungeon_profile` / `venue_profile` after ECKE table mapping confirmed |
| **Group-owned event** | **No dedicated path** | Would use standalone event API if public + host permission | `publish-standalone-event` if invoked | Supabase `events` | Group schedule tab only — no ECKE controls | **Group Events ECKE tab** | Same as standalone event redaction | Wire group event list to ECKE publish API + UI |
| **Group-owned education** | **None** | Author-scoped article routes only | Article queue | Ingest API | Education writer (user) | Group operator cannot publish group education | Author-only today | Extend ownership rules + group dashboard Education tab |
| **Group-owned vendor/sponsor** | **None** | Vendor me routes only | Vendor queue | Supabase `vendors` | Vendor shop (user) | Group Vendors tab | Owner-only | Org/group vendor ownership rules + ingest |
| **Group-owned dungeon/venue** | **None** | Org-flagged dungeon only | Inline on org publish | `dungeon_venues` | Org settings only | Group Venues tab | Private venue → no exact location | Pass 6 after ECKE mapping |
| **Public media/hero image** | **Embedded only** | `sanitizeEckeHeroImageUrl` in payloads L367 | N/A | In listing/event/article rows | — | No standalone media publish | URL sanitization; private URL scan in client L402–404 | Shared `ecke-redaction.ts` helpers |
| **Tags/categories** | **Partial** | Standalone events: category/tags in directory sync L156–164 | N/A | ECKE event/discovery pages | — | No tag landing page publish | Public-safe strings only | Document in registry redaction rules |
| **State/location pages** | **None in bridge** | City/state parsed in `ecke-directory-sync.ts` L85–91 | N/A | `/states/[state]` aggregates published rows | Acquisition cards on ECKE | C2K cannot control state page content directly | Indirect via published event geo | No direct publish — document as derived ECKE surfaces |

---

## Table 2 — ECKE public/API surfaces

| ECKE public/API surface | ECKE route/page/API | Backing table/model | Currently accepts kink.social sourced data? | Current entity type | Needed kink.social control surface | Missing ingest/update/unpublish behavior |
| ----------------------- | ------------------- | ------------------- | ------------------------------------------- | ------------------- | ---------------------------------- | ---------------------------------------- |
| **Events index** | `/events` → `EventsPageClient.tsx` | Static + Supabase `events` via `unifiedEvents.ts` L164–166 | Yes — rows with `c2k_source_id` override static | `event`, `convention` (via Supabase REST) | Group/org event dashboard; convention publish | Ingest API for `event_listing`, `convention_listing`; unpublish via ingest |
| **Event detail** | `/events/[slug]` → `EventDetailView.tsx` | `resolveEventForPage()` prefers C2K row L331–339 | Yes when `c2kSourceId` set | `event`, `convention` | Event management ECKE panel | Ingest unpublish; wire `KinkSocialEventSourceCta` (built but unused) |
| **Calendar** | `/calendar/page.tsx` L52–53 | **Static `getAllEvents()` only** | **Gap** — may miss C2K DB events | — | Group/org event publish status | Merge unified events like `/events` page |
| **State pages** | `/states`, `/states/[state]` | Aggregates events/dungeons | Indirect via published rows | Derived | Group dashboard “affected pages” in preview | None — derived surface |
| **BDSM events hub** | `/bdsm-events`, `/bdsm-events/[...slug]` | Static SEO paths | No direct ingest | — | Not kink.social controlled | — |
| **Dungeon directory/detail** | `/dungeons`, `/dungeons/[...slug]` | Static + Supabase `dungeon_venues` | Via C2K Supabase REST | `place` / org dungeon | Org/group Venues tab | Ingest `dungeon_profile`; unpublish |
| **Education index/detail** | `/education`, `/education/[slug]` | Supabase `articles` | **Yes** — ingest API only | `education_article` | Article editor; group Education tab | Extend ingest entity types |
| **Vendor directory/detail** | `/vendors`, `/vendors/[...slug]` | Supabase `vendors` | Via C2K Supabase REST | `vendor` | Vendor shop; group Vendors tab | Ingest `vendor_profile`; unpublish |
| **Blog/static articles** | Various static content | Static / CMS | No | — | Not kink.social controlled | — |
| **Dancecard event** | `/dancecard/[eventSlug]/*` | `dancecard_events` + children | C2K Supabase sync | `dancecard_event` + children | Convention/group Dancecard tab | Ingest optional; keep Supabase sync during migration |
| **Dancecard embed** | `/embed/dancecard/[eventSlug]/…` | Token-gated embeds | C2K-published program | Dancecard sync | Convention integrations | — |
| **Dancecard external API** | `/api/external/dancecard/[eventSlug]/*` | API-key scoped | C2K sync | Dancecard | Convention tools | — |
| **Organizer Dancecard API** | `/api/organizer/dancecard/[eventSlug]/*` | Organizer tables | ECKE-native + C2K sync | — | Convention dashboard | — |
| **kink.social ingest** | `POST /api/kink-social/ingest` | `articles` | **Yes — `education_article` only** | `education_article` | All entity dashboards | All other entity types → `unsupported_entity_type` (`kinkSocialIngestValidation.ts` L4, L246–251) |
| **kink.social unpublish** | `POST /api/kink-social/unpublish` | `articles` (draft flip) | **Yes — articles only** | `education_article` | Unpublish buttons | Events/vendors/dungeons/listings |
| **Manual education submit** | `/api/education/submit` | `submissions` table | No — human review pipeline | — | Not kink.social controlled | — |
| **Manual dungeon submit** | `/api/dungeons/submit` | `submissions` | No | — | Not kink.social controlled | — |
| **Sitemap** | `/sitemap.xml` → `sitemapUrls.ts` | Merged URLs | C2K events L343–366; articles L77–88 | Published rows | Preview “pages affected” | — |
| **IndexNow** | `kinkSocialIngest.ts` L85–111 | — | After article upsert/unpublish | `education_article` | All publish actions | Extend to all entity types on ingest |
| **Contact/report/support** | Static/legal pages | Static | No | — | Not kink.social controlled | — |
| **Newsletter** | Marketing | — | No direct C2K control | — | Not kink.social controlled | — |
| **Listing webhook consumer** | `ECKE_PUBLISH_LISTING_WEBHOOK_URL` (C2K env) | TBD / webhook handler | Partial — org/convention/group payloads | `ecke_listing` | Group/org listing publish | No ECKE route handler found in repo; may be external |

---

## Gap list (priority order)

### P0 — Control plane
1. **No unified registry** — logic scattered across routes, payload builders, executor, client.
2. **Group ECKE buried in Settings** — route `/organizer/groups/:id?tab=settings` only; no overview, events, education, vendors tabs.
3. **No group unpublish** — org/convention have unpublish; groups do not (`grep`: zero `groups/:groupId/unpublish`).
4. **Standalone event UI missing** — API at L1484–1609, zero web references.
5. **Split transport** — articles via ingest; everything else Supabase REST + webhook.

### P1 — Parity
6. **Presenter profiles** — not implemented on either side.
7. **Group-owned sub-entities** — education, vendors, events, venues have no group-scoped publish.
8. **Convention unpublish incomplete** — only `ecke_event` draft flip L1451–1482.
9. **ECKE calendar gap** — static-only may omit C2K-published events.
10. **Dead attribution UI** — `KinkSocialSourceCta` / `KinkSocialEventSourceCta` built but unused.

### P2 — Schema / contract
11. **`ecke_publish_scope` duplicate `'event'`** — schema L3774, L3777.
12. **Missing status columns** — no `eckePublicUrl`, `unpublishedAt`, `lastPreviewPayload`, `ownerKind`.
13. **Shared envelope drift** — `ecke-public-ingest-envelope.ts` L3 says “Not wired”; ECKE accepts one type.
14. **Group contract deferred** — `ECKE_PUBLIC_PUBLISHING_CONTRACT.md` L52.

---

## Proposed architecture

### Single registry (kink.social)

New file: `packages/api/src/lib/ecke-publish-registry.ts`

Each entry defines: `sourceKind`, owning entity, permission, eligibility, preview builder, ECKE target, ingest entity type, allowed actions, redaction rules, dashboard visibility flags, status `targetKind`.

Shared service: `packages/api/src/lib/ecke-publish-service.ts` — status, preview, publish, sync, unpublish (no duplicated route logic).

Shared redaction: `packages/api/src/lib/ecke-redaction.ts`.

### Preferred API (additive to existing organizer routes)

```
GET    /api/v1/ecke-publish/registry
GET    /api/v1/ecke-publish/status?sourceKind=&sourceId=
GET    /api/v1/ecke-publish/preview?sourceKind=&sourceId=
POST   /api/v1/ecke-publish/publish
POST   /api/v1/ecke-publish/sync
POST   /api/v1/ecke-publish/unpublish
```

Existing scoped routes remain during migration:
- `/api/v1/organizer/ecke-publish/groups/:groupId/*`
- `/api/v1/organizer/ecke-publish/organizations/:slug/*`
- etc.

### End-state transport

1. kink.social sends public-safe envelope to ECKE ingest/unpublish.
2. ECKE validates, upserts, handles slugs, sitemap, IndexNow.
3. kink.social stores returned ECKE URL, slug, record ID, content hash in `ecke_publish_targets`.
4. Direct Supabase REST behind `ECKE_PUBLISH_USE_LEGACY_SUPABASE=true` until parity verified.

### Group dashboard ECKE surface

Add tab `ecke` to organizer group shell (`OrganizerGroupClient.tsx` L1–9 tabs today):

Route: `/organizer/groups/:id?tab=ecke` (extends existing `?tab=` pattern L66–74).

Sub-sections: Overview, Group Listing, Events, Education, Venues, Vendors, Dancecard (conditional), Publish History.

---

## Proposed files

| Action | Path |
|--------|------|
| **Create** | `packages/api/src/lib/ecke-publish-registry.ts` |
| **Create** | `packages/api/src/lib/ecke-publish-service.ts` |
| **Create** | `packages/api/src/lib/ecke-redaction.ts` |
| **Create** | `packages/api/src/routes/ecke-publish-unified-routes.ts` (or extend `ecke-publish-routes.ts`) |
| **Create** | `packages/web/src/components/ecke/EckePublishPanel.tsx` (+ badge, drawer, payload table, etc.) |
| **Create** | `packages/web/src/app/organizer/groups/[id]/OrganizerGroupEckePanel.tsx` |
| **Edit** | `packages/web/src/lib/organizer/types.ts` — add `ecke` tab |
| **Edit** | `packages/web/src/app/organizer/groups/[id]/OrganizerGroupClient.tsx` |
| **Edit** | `packages/api/src/db/schema.ts` — fix duplicate enum; add URL/unpublish columns |
| **Edit** | `packages/shared/src/ecke-public-ingest-envelope.ts` — align entity types with registry |
| **Edit (ECKE)** | `src/lib/kinkSocialIngestValidation.ts` — expand `SUPPORTED_ENTITY_TYPES` |
| **Edit (ECKE)** | `src/lib/kinkSocialIngest.ts` — per-entity upsert handlers |
| **Edit (ECKE)** | `src/app/calendar/page.tsx` — merge unified events |

---

## Proposed database changes (minimal migration)

Extend `ecke_publish_targets` (`schema.ts` L3797–3830):

```sql
-- Fix duplicate enum value 'event' in ecke_publish_scope
ALTER TYPE ecke_publish_scope RENAME VALUE ... -- or new migration recreating enum

ALTER TABLE ecke_publish_targets ADD COLUMN IF NOT EXISTS
  ecke_public_url text,
  ecke_record_id uuid,
  unpublished_at timestamptz,
  last_preview_payload jsonb,
  last_published_payload_summary jsonb,
  source_kind varchar(64);  -- maps to EckeSourceKind
```

Keep existing unique indexes per scope; add index on `(source_kind, event_id)` etc. as needed.

---

## Proposed tests

**kink.social:** payload builders (existing `ecke-publish-payload.test.ts`), redaction, group eligibility, private group blocked, hidden location omitted, content hash stale, unpublish idempotent, queue vs ingest flag, registry coverage.

**ECKE:** ingest per entity type, reject unsupported/private/non-PUBLIC, unpublish idempotent, slug collision, IndexNow.

**Smoke:** public group preview → publish → update → stale → sync → unpublish; group event with private location confirms omission.

---

## Risk list

| Risk | Mitigation |
|------|------------|
| Listing webhook is undeclared on ECKE | Confirm webhook consumer or migrate listings to ingest first |
| Group privacy leak via listing | Eligibility gate + redaction contract; private groups → `visibility: hidden` + reject publish |
| Breaking convention publish during migration | Feature flag `ECKE_PUBLISH_USE_LEGACY_SUPABASE`; wire one entity at a time |
| Calendar/static merge drift | Fix ECKE calendar in parallel with event ingest |
| Schema enum duplicate `'event'` | Migration before relying on scope enum for registry |
| Staff access codes in Dancecard payload | Preview drawer must show codes explicitly; document in privacy contract |

---

## Recommended first implementation pass (Pass 2–3)

**Pass 2:** Registry + preview/status endpoints only (no ECKE writes). UI shows eligibility and omitted fields.

**Pass 3:** `group_listing` — wire `buildGroupListingPayload` (L129–146) through registry; add `/organizer/groups/:id?tab=ecke`; add group unpublish; expand ECKE ingest for `group_listing` OR keep webhook with stored ECKE URL.

Do **not** remove Supabase REST or webhook paths until pilot verification.

---

## Pass 3 — Verified existing group listing write path

| Question | Answer |
|----------|--------|
| Where does group listing publish happen today? | Legacy: `POST /api/v1/organizer/ecke-publish/groups/:groupId/publish` in `ecke-publish-routes.ts` L1690–1746. **Pass 3:** unified `POST /api/v1/groups/:groupId/ecke-publish/publish` (and `/api/v1/ecke-publish/publish`) via `ecke-publish-service.ts`. |
| Uses `publishListingToEcke`? | Yes — both legacy and Pass 3 service call `publishListingToEcke` in `ecke-publish-client.ts`. |
| Webhook returns public URL/slug/ID? | Optional JSON fields (`slug`, `publicUrl`, `recordId`); often `{ ok: true }` only. Pass 3 parses response when present; falls back to `resolveEckePublicGroupListingUrl(slug)` with `eckePublicUrlKnown: false`. |
| Writes to `ecke_publish_targets`? | Yes — legacy via inline upsert; Pass 3 via `ecke-publish-target-store.ts`. |
| Unpublish route before Pass 3? | **No** — added in Pass 3 unified control plane only. |
| Permission checks? | Group owner/admin/mod (`canManageGroupEckePublish`); private/hidden groups rejected. |
| Uses `buildGroupListingPayload`? | Yes — server-side only; client payload ignored. |
| `EckePublishStub` group write in Settings? | **Still present** — legacy path unchanged; ECKE tab is the new primary surface. |

**Transport decision:** `group_listing` currently publishes through configured **listing webhook**, not EastCoast ingest. Future pass should migrate or formalize ECKE ingest support.

---

## Pass 3 Implementation Notes

- `group_listing` publish/sync/unpublish enabled end-to-end from `/organizer/groups/:id?tab=ecke`
- Only `group_listing` write actions enabled in unified control plane; other source kinds remain preview/planned
- Current transport: `listing_webhook`; ECKE repo **not touched**
- Private/hidden groups blocked; member lists and private fields omitted from payload
- Unpublish idempotent; local status set even when webhook 404 or webhook URL unset
- Schema migration: `ecke_public_url`, `ecke_record_id`, `unpublished_at`, status enum `unpublished`
- Duplicate `'event'` in `ecke_publish_scope` enum left for later cleanup

---

## Remaining Pass 5+ work

- Education, vendors, venues, Dancecard parity in group dashboard
- EastCoast ingest generalization for listings
- ECKE calendar merge with unified events (EastCoast repo — see Pass 4G)
- Migrate legacy `EckePublishStub` group path to unified control plane
- Full DB integration tests for publish/sync/unpublish with mocked webhook/Supabase
- Pilot verification with real public group + events on production bridge

---

## Pass 4 — Verified existing event publish path (Phase 4A)

| Question | Answer |
|----------|--------|
| Where does standalone event ECKE publish happen? | Legacy: `POST /api/v1/organizer/ecke-publish/events/:eventIdOrSlug/publish` in `ecke-publish-routes.ts` L1559+. **Pass 4:** unified control plane `publishEckeSource` → `executeEventListingPublish` → `executeEckePublishStandaloneEvent` in `ecke-publish-executor.ts`. |
| Transport? | **Supabase REST** — `publishEventRowToEcke` upserts ECKE `events` table (`ecke-publish-client.ts`). Optional BullMQ queue `publish-standalone-event` unless `C2K_ECKE_PUBLISH_INLINE=true`. |
| Is `buildStandaloneEventListingPayload` complete enough? | **Yes for Pass 4** — builds public-safe listing; mapped to `EckeEventRow` via `buildEckeEventRowFromStandaloneEvent`. Gaps: accessibility, dress code, ticket URLs, map pins — tracked as **deferred** in preview, not sent yet. |
| Where is `locationVisibility` stored? | `events.location_visibility` enum: `public` \| `rsvp` \| `approved` (`schema.ts` L1836, L1886). |
| Group ownership? | `events.group_id` FK. Pass 4 unified path requires group-owned events + group mod permission. Legacy path also allows host/org-mod without `groupId`. |
| Org-owned vs group-owned? | Both have `organizationId` / `groupId`. Pass 4 group dashboard: **group-owned only**. |
| Writes `ecke_publish_targets`? | Yes — `scopeType: 'event'`, `targetKind: 'ecke_event'`, unique on `(event_id, target_kind)`. |
| Unpublish before Pass 4 unified? | Legacy route only; sets status `stale` (not `unpublished`). **Pass 4** unified unpublish uses `markEckeUnpublishSuccess` + idempotent behavior. |
| Convention anchor events? | Rejected by `isStandaloneEventEckeEligible` — must use convention publish routes. |

---

## Pass 4G — ECKE calendar audit

**Finding (confirmed on GitHub `main`):** `src/app/calendar/page.tsx` calls `getAllEvents()` from static `@/data/events` only. It does **not** merge Supabase/C2K-published rows like `/events` does via `unifiedEvents.ts`.

**Impact:** C2K-published events appear on ECKE `/events` index and event detail when Supabase row exists, but may be **missing from `/calendar`**.

**Pass 4 decision:** Document as follow-up blocker; **no EastCoast patch in Pass 4** (requires small safe change: calendar page uses same unified source as events index). Recommended Pass 4.1 patch in EastCoast repo.

---

## Pass 4 Implementation Notes

- `event_listing` publish/sync/unpublish enabled for **group-owned public events** via unified control plane
- Transport: **supabase_rest** to ECKE `events` table
- Location redaction: `public` → exact address allowed; `rsvp`/`approved` → `publicLocationSummary` only
- Preview adds **three categories**: `wouldPublish`, `wouldPublishDeferred`, `wouldNotPublish`
- Group dashboard Events section: per-event cards with publish/sync/unpublish
- `group_listing` lifecycle preserved unchanged
- Legacy organizer event routes unchanged
- ECKE repo **not touched**; calendar gap documented
- **29** ECKE publish unit tests passing (was 22 after Pass 3)

---

## Pass 5 Slice 1: Education Article Existing Path

**Audit date:** 2026-06-25

| Question | Finding |
|----------|---------|
| Where does education publish happen today? | Legacy entity routes (`/api/v1/me/education-articles/:id/ecke-publish`) + BullMQ queue + `executeEckePublishArticle` in `ecke-publish-executor.ts` |
| Transport | **ECKE ingest API** (`loadEckeIngestApiConfig`, `publishEducationArticleEnvelopeToEcke`) — not Supabase REST |
| Unpublish backend | Yes — `executeEckeUnpublishEducationArticle` + `executeEckeUnpublishEducationArticleWithTargetUpdate`; legacy HTTP only (no unified control plane before Pass 5) |
| Writes `ecke_publish_targets`? | Yes — `educationArticleId`, `targetKind: ecke_article`, `scopeType: education_article` |
| Article fields published | title, slug, excerpt, sanitized bodyHtml, author display name, public author/presenter profile URLs, categories, content warnings, difficulty, reading minutes, hero image, published/updated timestamps, SEO title/meta |
| Visibility/status fields | `publicationStatus` (DRAFT/PUBLISHED/ARCHIVED), `visibility` (PUBLIC/MEMBERS/CONNECTIONS), `eckePublish` opt-in boolean |
| Ownership model | **Author-only** (`authorUserId`); optional `organizationId` on row but no org-mod ECKE path yet; no `groupId` on articles |
| ECKE URL returned | Ingest API returns `eckePublicUrl` (e.g. `https://www.eastcoastkinkevents.com/education/{slug}`); Pass 5 fixes persistence to `ecke_publish_targets.ecke_public_url` |
| Stale detection | Hash of sanitized ingest payload vs `publishedContentHash`; unified preview uses `deriveTargetDisplayStatus` |
| Writer UI before Pass 5 | `EckeEntityPublishStatus` on `/education/write` calling legacy me-routes only — no preview drawer |

**Pass 5 Slice 1 fixes:** unified preview/status/publish/sync/unpublish via `/api/v1/ecke-publish/*`; unpublish status `unpublished` (was incorrectly `stale`); `EckePublishPanel` on writer page.

---

## Pass 5 Slice 3: Vendor Profile Existing Path

**Audit date:** 2026-06-25

| Question | Finding |
|----------|---------|
| Where does vendor publish happen today? | Legacy entity routes (`GET/POST /api/v1/vendors/me/ecke-publish`) in `ecke-publish-entity-routes.ts` + BullMQ `publish-vendor` + `executeEckePublishVendor` |
| Transport | **Supabase REST** → ECKE `vendors` table via `publishVendorRowToEcke` |
| Unpublish backend | **No** before Slice 3 — unified control plane adds `unpublishVendorRowToEcke` (draft flip) + `executeEckeUnpublishVendorWithTargetUpdate` |
| Writes `ecke_publish_targets`? | Yes — `vendorProfileId`, `targetKind: ecke_vendor`, `scopeType: vendor_profile` |
| Vendor fields published | slug, name, description (bio/maker story), HTTPS website URL, online_only flag, city/state (null today), c2k source attribution |
| Visibility/status fields | `visibility` (PUBLIC required), `eckePublish` opt-in boolean |
| Ownership model | Primary owner (`vendor_profiles.user_id`); `vendor_co_owners` grant shop management (co-owner publish in Slice 3); `organization_featured_vendors` is display link only — org moderators preview only |
| ECKE URL returned | `resolveEckePublicVendorUrl` → `https://www.eastcoastkinkevents.com/vendors/{slug}`; persisted on successful publish |
| Stale detection | Hash of `buildEckeVendorRow` payload vs `publishedContentHash` |
| UI before Slice 3 | `EckeEntityPublishStatus` on vendor shop settings — no preview drawer |

**Pass 5 Slice 3 fixes:** unified preview/status/publish/sync/unpublish via `/api/v1/ecke-publish/*`; `VendorEckePanel` on vendor shop settings; org ECKE tab lists featured vendors (read-only unless owner/co-owner); owner/co-owner write enforcement; private payment/shop secret data excluded.

---

## Pass 5 Slice 3 Implementation Notes

- `vendor_profile` wired into unified control plane
- Transport: **supabase_rest** via existing `executeEckePublishVendor` / `executeEckeUnpublishVendorWithTargetUpdate`
- Vendor owner/co-owner write restrictions enforced; org moderator preview-only for featured vendors
- Org dashboard vendor cards are read-only unless viewer owns/co-owns vendor
- Private owner/payment/shop secret data excluded from payload and preview omitted lists
- **66** ECKE publish unit tests passing (vendor control + education + registry + target-store + directory-sync)

---

## Final ECKE Publish Parity Status

**Audit date:** 2026-06-25  
**Branch:** `ecke-publish-final-parity` (kink.social)  
**EastCoast repo:** not modified in this pass (no local clone; display gaps documented below)

### Master parity matrix

| Source kind | kink.social model | Transport | Unified preview | Unified publish/sync/unpublish | ECKE target | Permission | Status |
|---|---|---|---|---|---|---|---|
| group_listing | `groups` | listing_webhook | Yes | Yes | `ecke_listing` | group/org mod | **Complete** |
| event_listing | `events` (group-owned in unified plane) | supabase_rest | Yes | Yes | `ecke_event` | group mod | **Complete** (group scope) |
| education_article | `education_articles` | ingest_api | Yes | Yes | `ecke_article` | author publish; mod preview | **Complete** |
| vendor_profile | `vendor_profiles` | supabase_rest | Yes | Yes | `ecke_vendor` | owner/co-owner | **Complete** |
| organization_listing | `organizations` | listing_webhook | Yes | Yes | `ecke_listing` | org mod | **Complete** (final pass) |
| dungeon_profile | `organizations` + dungeon flags | supabase_rest | Yes | Yes | `ecke_dungeon` | org mod | **Complete** (final pass) |
| convention_listing | `conventions` | listing_webhook | Yes | Yes | `ecke_listing` | convention full admin | **Complete** (final pass) |
| dancecard_event | `conventions` + program data | supabase_rest | Yes | Yes (bundle) | `dancecard_event` | convention full admin | **Complete** (final pass) |
| dancecard_location | bundled in dancecard | supabase_rest | Preview via dancecard bundle | Same bundle write | `dancecard_event` | convention full admin | **Bundled** |
| dancecard_program_slot | bundled in dancecard | supabase_rest | Preview via dancecard bundle | Same bundle write | `dancecard_event` | convention full admin | **Bundled** |
| dancecard_staff_shift | bundled in dancecard | supabase_rest | Preview via dancecard bundle | Same bundle write | `dancecard_event` | convention full admin | **Bundled** |
| presenter_profile | `presenter_profiles` | none | No | No | none | n/a | **Blocked** — no ECKE public presenter surface wired |
| venue_profile | `community_places` | none | No | No | none | n/a | **Blocked** — no standalone venue FK/target; org dungeon flag covers org-flagged venues only |

### Blocked / deferred (explicit)

- **presenter_profile:** No ECKE ingest/table/page confirmed for presenter listings; registry remains `planned`.
- **venue_profile (standalone):** `community_places` not mapped to `ecke_publish_targets`; group dashboard stays info-only.
- **EastCoast org listing consumer:** kink.social publishes via listing webhook; verify ECKE displays org directory pages before claiming full parity in prod smoke.
- **Convention `ecke_event` row:** Legacy bundled publish still handles convention anchor event row; unified plane covers listing + dancecard in final pass (event row remains legacy path).

### Pilot-ready unified surfaces

- Group ECKE tab: group listing, group events, org-linked education
- Org ECKE tab: org listing, dungeon (when flagged), education, featured vendors
- Vendor shop settings: vendor ECKE panel
- Education writer: article ECKE panel
- Convention: unified API via `/api/v1/ecke-publish/*` with `convention_listing` / `dancecard_event` source IDs (convention UUID)

### Operator smoke checklist (remaining)

1. Public org → preview org listing → publish → verify ECKE directory/webhook consumer
2. Dungeon-flagged org → preview dungeon → publish → verify `/dungeons/{slug}`
3. Convention admin → preview convention listing + dancecard → publish → verify listing + dancecard
4. Dancecard access codes show as “configured” in preview, not raw values
5. Vendor/education/group regressions unchanged

---
