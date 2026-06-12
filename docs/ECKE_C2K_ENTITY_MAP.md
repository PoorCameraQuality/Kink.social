# ECKE ↔ C2K entity map

**Status (2026-06-06):** Outbound publish shipped in `packages/api` — **Phase C verified for conventions → `public.events` only** (`preview-c2k-weekend`). Vendor (`publish-vendor`), article (`publish-article`), and dungeon (`ecke_dungeon` inline on org publish) paths are implemented but not yet operator-piloted. Runbook: [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md)  
**Vision:** [`PLATFORM_VISION.md`](./PLATFORM_VISION.md) · **Organizer:** [`ORGANIZER_CONSOLE.md`](./ORGANIZER_CONSOLE.md) · **Identity ADR:** [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md)

This document is the row-level contract for the **publish bridge**: C2K Organizer (control plane) → ECKE public listings + Dancecard attendee runtime.

**Publish is not registration.** The bridge copies public program/listing copy outward. Attendees register, staff, and organizers authenticate on **C2K** only. Legacy ECKE `dancecard_accounts` are not migrated and are not part of new identity work. See [ECKE (advertising only)](./EVENT_SYSTEMS_IDENTITY.md#ecke-advertising-only).

**Public attendee registration is on C2K**, served by `convention-public-routes.ts` (`/api/v1/public/conventions/:key/register-info`, `/registrations`, `/trusted-roles/:applySlug/apply`). The UI is `/conventions/:slug/register` (`RegisterFlow`) and `/conventions/:slug/apply/:applySlug`. Both require a signed-in C2K user; access codes and `grantsStaffAccess` categories (per ECKE migration 033) are validated server-side, never round-tripped to the client.

---

## Identity boundary (read first)

| Concern | Authority | ECKE role |
|---------|-----------|-----------|
| Login / account | **C2K** (`users` + `profiles`) | None for new work |
| Event registration | **C2K** (`convention_registrants`, access grants) | Listings link out to C2K; no guest checkout |
| Organizer edits | **C2K** organizer console | Receive published copy only |
| Public discovery / SEO | ECKE listings + Dancecard runtime | Marketing surface |
| Legacy ECKE attendees | ECKE `dancecard_accounts` (historical) | **No migration**; not extended |

Event Systems identity Phases 1–2 (API guards, unique `(convention_id, user_id)`) do **not** change this publish contract.

---

## Systems at a glance

| System | Database | Auth | Public URLs |
|--------|----------|------|-------------|
| **C2K** | Drizzle / Postgres (`packages/api`) | HMAC session cookie | `/orgs/:slug`, `/conventions/:slug`, `/events/:uuid` |
| **ECKE listings** | Supabase `public.events` + static `events.js` hybrid (prefer DB after migration) | None (public) | `/events`, `/events/:slug` |
| **ECKE Dancecard** | Supabase `dancecard_*` (74 tables in vendor export) | Legacy per-event `dancecard_accounts` + cookie (not identity path) | `/dancecard/:slug` |

**No FK links.** Integration is string slugs in `conventions.settings` (`dancecardSlug`, `eckeListingSlug`) plus the publish bridge.

---

## Identity keys (routing)

**Registration and roster:** C2K `users.id` is the only durable identity for new registrants and staff assignments ([`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md)). ECKE `dancecard_accounts` are legacy attendee runtime only — not the identity path for new C2K work.

| Concept | C2K key | ECKE listing key | ECKE Dancecard key |
|---------|---------|------------------|-------------------|
| Organization | `organizations.slug` | `organizations.slug` (listing slug) | — |
| Group | `groups.id` (UUID) | Group slug for listing | — |
| Convention / festival | `conventions.slug` | `conventions.slug` or `settings.eckeListingSlug` | `settings.dancecardSlug` or `conventions.slug` |
| Calendar anchor | `events.id` (UUID) | Mapped into listing dates/copy | — |
| Program slot | `schedule_slots.id` (UUID) | N/A (listing has no slot grid) | `externalKey` = C2K slot id (upserted as ECKE row `id`) |
| Location | `convention_locations.id` (UUID) | N/A | `externalKey` = C2K location id (upserted as ECKE row `id`) |
| Staff shift | `convention_volunteer_shifts.id` (UUID) | N/A | `externalKey` = C2K shift id |
| Presenter | `users.username` | Public name on listing (future) | Not in Dancecard v1 program rows |

---

## Organization → ECKE public listing

**C2K source:** `organizations` + optional gallery.

| C2K column / field | ECKE target | Publish rule |
|--------------------|-------------|--------------|
| `slug` | Listing slug | Stable; lowercase on write |
| `display_name` | Listing title | Only when `visibility = PUBLIC` |
| `bio` (+ `bio_format`) | Listing description | Strip/limit for SEO; never include member-only data |
| `logo_url`, `banner_url` | Hero / card image | Public URLs only |
| `visibility` | Listing visibility | `MEMBERS` / `PRIVATE` → hidden or draft on ECKE |
| `external_site_url` | Optional outbound link | Not auto-synced unless organizer enables |
| `community` JSON | — | **C2K-only**; never publish wholesale |
| Member graph, forums, chat | — | **Never publish** |

**Dungeon org (`feature_flags.listingKind === 'dungeon'` or `eckeDungeonListing`):** on org **Publish**, C2K also upserts `dungeon_venues` inline (`publishDungeonRowToEcke`) and tracks `ecke_dungeon` in `ecke_publish_targets`. City/state on dungeon rows are not parsed from org bio today (nullable unless extended).

**Gap:** `ecke_listing` for orgs is webhook-only (`ECKE_PUBLISH_LISTING_WEBHOOK_URL`); generic org pages may still be manual/static. GET org publish status does not preview `ecke_dungeon` — query `ecke_publish_targets` after publish.

---

## Group → ECKE public listing

**C2K source:** `groups` + parent org context.

| C2K field | ECKE target | Publish rule |
|-----------|-------------|--------------|
| `slug` or derived slug | Listing slug | Lowercase |
| `name` | Listing title | Hidden when group visibility ≠ public |
| `description` | Listing description | Public copy only |
| Parent org slug/name | `orgSlug` / `orgDisplayName` on payload | Optional context line |

Routes: `GET/POST .../ecke-publish/groups/:groupId` (preview + publish).

---

## Convention → ECKE listing + Dancecard event

**C2K sources:** `conventions`, linked `events` (anchor), `schedule_slots`, `convention_locations`, `convention_volunteer_shifts`, `schedule_slot_presenters`, org row.

### Convention shell → `dancecard_events`

| C2K | ECKE `dancecard_events` | Notes |
|-----|-------------------------|-------|
| `settings.dancecardSlug` or `conventions.slug` | `slug` | Lowercase, unique |
| `name` | `event_title` | |
| `description` (first line) | `subtitle` | Optional |
| `timezone` | `timezone` | IANA |
| `starts_at`, `ends_at` | `window_starts_at`, `window_ends_at` | Must cover all slots |
| `organizations.display_name` | `shared_by_label` | e.g. org name |
| Org slug / URL | `shared_by_detail` | Optional |
| Org `logo_url` | `logo_url` | Optional |
| Publish action / `settings.dancecardPublishStatus` | `status` | `'published'` for public attendee API |
| `settings.staffAccessCode` | `staff_access_code` | Gate codes only; not C2K identity |
| `settings.registrationAccessCode` | `registration_access_code` | Gate codes only |
| — | `product_title` | Constant: `"East Coast Kink Events — Dancecard"` |

**Settings (C2K JSON, not mirrored as columns):**

| C2K `conventions.settings` | Effect on publish |
|----------------------------|-------------------|
| `dancecardEnabled === false` | Skip Dancecard target; listing may still publish |
| `dancecardHost` | Outbound URL host only (not stored on ECKE row) |
| `publicProgramListing === false` | C2K API hides slots; publish bridge still sends program to ECKE if organizer confirms |
| `dancecardEmbedTokenHint` | ECKE embed config; not part of dancecard_events row |

### Anchor event → ECKE listing card (`ecke_listing` webhook payload)

| C2K `events` (via `conventions.anchor_event_id`) | ECKE listing payload |
|--------------------------------------------------|---------------------|
| `title` | Listing title (fallback: convention name) |
| `description` | Long description |
| `starts_at`, `ends_at` | Event window |
| `location`, `public_location_summary` | Location line |
| `image_url` | Card image |
| `visibility` | Must be `public` for discoverable listing |
| `dress_code`, `expected_cost_text` | Optional public copy |
| Ticketing fields | Placeholder; real sync later |

### Convention shell → `public.events` (`ecke_event` worker job)

Built in `ecke-directory-sync.ts` (`buildEckeEventRowFromListing`) from the same listing payload as `ecke_listing`. Queued by `POST .../conventions/:slug/publish` → `publish-convention-event`.

| C2K / listing field | ECKE `public.events` column |
|---------------------|----------------------------|
| Convention slug / `settings.eckeListingSlug` | `slug` |
| Listing title | `title`, `seo_title`, `meta_title` |
| `starts_at`, `ends_at` (ISO → date) | `start_date`, `end_date`, `display_date` |
| Parsed listing `location` | `city`, `state` |
| Listing description | `short_description` (≤500), `long_description`, `meta_description` (≤320) |
| Listing `imageUrl` | `logo` |
| Org `display_name` | `organizer_name` |
| Listing `visibility` | `status` (`published` / `draft` when hidden) |
| — | `category` = `'Convention'`; `website` = `''`; `tags` = `['convention']` |
| `conventions.id` | `c2k_source_id` with `c2k_source_type` = `'convention'` |

### Locations → `dancecard_locations` (**done**)

| C2K `convention_locations` | Payload field | ECKE `dancecard_locations` |
|----------------------------|---------------|----------------------------|
| `id` | `externalKey` | `id` (stable C2K UUID upsert) |
| `name` | `name` | `name` |
| `short_name` | `shortName` | `short_name` |
| `capacity` | `capacity` | `capacity` |
| `sort_order` | `sortOrder` | `sort_order` |
| `parent_id` | `parentId` | `parent_id` |

**Implementation:** `ecke-dancecard-location-sync.ts` — upsert by C2K id; orphan delete for locations removed from program.

### Program → `dancecard_program_slots` (**done**)

| C2K `schedule_slots` | Payload field | ECKE `dancecard_program_slots` |
|----------------------|---------------|--------------------------------|
| `id` | `externalKey` | `id` (stable C2K UUID upsert) |
| `starts_at`, `ends_at` | `startsAt`, `endsAt` | `starts_at`, `ends_at` |
| `title` | `title` | `title` |
| `track_label` | `track` | `track` |
| `room_label` or `location` | `room` | `room` (fallback when no location row) |
| `location_id` | `locationId` | `location_id` (FK to upserted location) |
| `description` | `description` | `description` |
| `sort_order` | `sortOrder` | `sort_order` |

**Publish order:** `dancecard_events` → delete orphan locations → upsert locations → delete orphan slots → upsert slots → delete orphan staff → upsert staff.

**Import semantics:** upsert by C2K UUID as ECKE row `id`; delete only orphan rows removed from the published payload.

### Staff shifts → `dancecard_staff_shifts` (**done**)

| C2K `convention_volunteer_shifts` | Payload field | ECKE `dancecard_staff_shifts` |
|-----------------------------------|---------------|-------------------------------|
| `id` | `externalKey` | `id` |
| `title` (parsed `Name — Role`) | `personName`, `role` | `person_name`, `role` |
| `starts_at`, `ends_at` | `startsAt`, `endsAt` | `starts_at`, `ends_at` |
| `location_id` | `locationId` | `location_id` |
| `sort_order` | `sortOrder` | `sort_order` |

**Implementation:** `ecke-dancecard-staff-sync.ts`. Display names only — **not** C2K `user_id` or registrant identity.

### Presenters (payload only; directory sync later)

| C2K | Publish use |
|-----|-------------|
| `schedule_slot_presenters` → `users.username` | Future: presenter line on slot / ECKE directory |
| `presenter_profiles.directory_visibility` | Only `PUBLIC` profiles included in outward payload |
| `presenter_profiles.bio_short`, `headline` | Public copy only |
| `profiles.field_visibility` | Respect hidden fields — never leak |

---

## C2K-native Dancecard (do not confuse)

C2K tables `dancecard_entries`, `convention_dancecard_prefs`, `convention_dancecard_share_links`, `dancecard_booking_requests` power **in-C2K personal calendars**. They are **not** ECKE Dancecard and are **not** published to ECKE.

---

## Publish targets (C2K tracking table)

`ecke_publish_targets` (`packages/api/src/db/schema.ts`):

| Column | Purpose |
|--------|---------|
| `scope_type` | `organization` \| `convention` \| `group` \| `education_article` \| `vendor_profile` (`event` reserved, unused) |
| Scope FK | Exactly one of `organization_id`, `convention_id`, `group_id`, `education_article_id`, `vendor_profile_id` |
| `target_kind` | `ecke_listing` \| `dancecard_event` \| `ecke_event` \| `ecke_vendor` \| `ecke_article` \| `ecke_dungeon` |
| `external_slug` | Slug used on ECKE |
| `status` | `never` \| `draft` \| `published` \| `error` \| `stale` |
| `content_hash` | SHA-256 of last preview/build |
| `published_content_hash` | SHA-256 of last successful outbound publish |
| `last_published_at`, `last_preview_at`, `last_attempt_at`, `last_error`, `published_by_user_id` | Audit |

**Stale:** `content_hash !== published_content_hash` after a successful publish (`derivePublishStatus` on organizer scopes; entity executor sets `stale` when hash changes after prior publish).

---

## Draft vs published semantics

| Layer | Draft | Published |
|-------|-------|-----------|
| **C2K** | Live rows in Postgres; organizer edits immediately | N/A — C2K is always live for authorized users |
| **Bridge** | Preview payload + hash stored; no ECKE write | Outbound write when `ECKE_PUBLISH_ENABLED=true` and Supabase/webhook configured |
| **ECKE Dancecard** | `dancecard_events.status = 'draft'` | `status = 'published'` — required for public attendee API |
| **ECKE listing** | Hidden or noindex | Visible in `/events` discovery |

Organizers edit in C2K → preview shows diff → publish pushes to ECKE. Attendees on ECKE never see C2K-private fields. **Registration always happens on C2K**, not via publish.

---

## Privacy checklist (every publish)

- [ ] Org/convention `visibility` / `publicProgramListing` respected in payload
- [ ] No C2K member emails, DMs, or connection graph
- [ ] Presenter fields filtered by `directory_visibility` and `field_visibility`
- [ ] Location fields respect `events.location_visibility`
- [ ] ISO boards, internal forums, chat — excluded
- [ ] No registrant PII or `user_id` rows pushed to ECKE

---

## API surface

**Organizer routes** (`ecke-publish-routes.ts`) — require `USE_DATABASE=true`:

| Method | Path | Auth | Outbound |
|--------|------|------|----------|
| `GET` | `/api/v1/organizer/ecke-publish/organizations/:slug` | Org moderator+ | Preview `ecke_listing` |
| `POST` | `.../organizations/:slug/preview` | Org moderator+ | Stage `ecke_listing` hash |
| `POST` | `.../organizations/:slug/publish` | Org moderator+ | Listing webhook + inline `ecke_dungeon` when dungeon org |
| `GET` | `/api/v1/organizer/ecke-publish/conventions/:slug` | Convention **full admin** | Preview `ecke_listing` + optional `dancecard_event` |
| `POST` | `.../conventions/:slug/preview` | Convention full admin | Stage listing + Dancecard hashes |
| `POST` | `.../conventions/:slug/publish` | Convention full admin | Listing webhook + queue `ecke_event` + inline Dancecard |
| `GET` | `/api/v1/organizer/ecke-publish/groups/:groupId` | Group or parent-org moderator+ | Preview group `ecke_listing` |
| `POST` | `.../groups/:groupId/preview` | Group or parent-org moderator+ | Stage group listing hash |
| `POST` | `.../groups/:groupId/publish` | Group or parent-org moderator+ | Listing webhook only |

**Entity routes** (`ecke-publish-entity-routes.ts`):

| Method | Path | Auth | Outbound |
|--------|------|------|----------|
| `GET` | `/api/v1/me/education-articles/:id/ecke-publish` | Article author | Status + `bridgeConnected` |
| `POST` | `.../education-articles/:id/ecke-publish` | Article author | Queue `publish-article` |
| `POST` | `.../education-articles/:id/ecke-publish/sync` | Article author | Inline `executeEckePublishArticle` |
| `GET` | `/api/v1/vendors/me/ecke-publish` | Vendor owner | `eckePublish` + target row |
| `POST` | `/api/v1/vendors/me/ecke-publish` | Vendor owner | Queue `publish-vendor` |

**Auto-enqueue on save:** `education-articles-routes.ts` (`maybeEnqueueEckeArticlePublish`); `PUT /api/v1/me/vendor-profile` (`maybeEnqueueEckeVendorPublish`).

Outbound Supabase writes require `ECKE_PUBLISH_ENABLED=true`, `ECKE_SUPABASE_URL`, `ECKE_SUPABASE_SERVICE_ROLE_KEY`. `ecke_listing` additionally requires `ECKE_PUBLISH_LISTING_WEBHOOK_URL` (otherwise target records `error` while `ecke_event` / Dancecard / entity jobs may still succeed).

---

## Implementation files

| File | Role |
|------|------|
| `packages/api/src/routes/ecke-publish-routes.ts` | Org/convention/group preview + publish |
| `packages/api/src/routes/ecke-publish-entity-routes.ts` | Article/vendor publish + auto-enqueue helpers |
| `packages/api/src/lib/ecke-publish-payload.ts` | Listing + Dancecard payload builders + `hashEckePayload` |
| `packages/api/src/lib/ecke-directory-sync.ts` | `public.events` / `vendors` / `articles` / `dungeon_venues` row builders |
| `packages/api/src/lib/ecke-publish-client.ts` | Supabase upsert, listing webhook, Dancecard orphan delete |
| `packages/api/src/lib/ecke-publish-queue.ts` | BullMQ enqueue + inline fallback |
| `packages/api/src/lib/ecke-publish-executor.ts` | Worker job bodies (`publish-article`, `publish-vendor`, `publish-convention-event`) |
| `packages/api/src/lib/ecke-dancecard-location-sync.ts` | Location row mapping |
| `packages/api/src/lib/ecke-dancecard-slot-sync.ts` | Program slot row mapping |
| `packages/api/src/lib/ecke-dancecard-staff-sync.ts` | Staff shift row mapping |
| `packages/api/src/worker.ts` | Registers `c2k-ecke-publish` worker |

---

## Convention schema parity additions (ECKE 007–059)

The C2K organizer schema (`convention-organizer-schema.ts`) now matches ECKE migrations 007–059 for every column the organizer console touches:

| ECKE migration | C2K addition |
|----------------|--------------|
| 011 | `convention_persons.legal_name`, `phone`, `internal_notes`, `photo_url`, `show_legal_name_on_public` |
| 012, 044 | `convention_registration_questions.options_json`, `visibility_rules_json`, `required_for_category_ids`, `updated_at`; `convention_registration_forms.status`, `intro_text`, `confirmation_text` |
| 012, 024, 031 | `convention_registrants.legal_name`, `phone`, `external_source`, `last_synced_at`, `consent_waiver_ack_at`, `consent_photo_ack_at`, `rabbitsign_folder_id`, `rabbitsign_status` |
| 018, 031 | `convention_policy_documents.kind`, `version`, `body_markdown`, `published_at`; `convention_registrant_policy_acceptances.signer_name`, `signer_email`, `signature_method`, `provider_ref`, `ip_hash` |
| 021 | `convention_calendar_feed_tokens.scope`, `filter_track_id`, `filter_location_id`, `filter_person_id` |
| 022 | `convention_message_templates.body_text`; `convention_message_campaigns.status`, `created_by_user_id`, `send_error`; `convention_message_deliveries.idempotency_key`, `provider_message_id`, `sent_at` |
| 026 | `convention_webhook_deliveries`, `convention_audit_log` |
| 033, 034, 036, 044 | `convention_registration_categories.access_code`, `grants_staff_access`, `role_kind`, `check_in_valid_from`, `check_in_valid_through`, `external_source_ref`, `imported_payment_status` |
| 038 | `convention_trusted_roles.apply_slug`, `status`, `intro_text`, `confirmation_text`; new `convention_trusted_role_questions`; `convention_vetting_applications.applicant_user_id`, `trusted_role_id`, `organizer_notes` |
| 050 | `convention_session_feedback_responses` |
| 054 | `convention_attendee_group_members`, `join_requests`, `announcements`, `chores`, `bring_items`, `reports`; `convention_attendee_groups.visibility`, `status`, `capacity` |
| 058 | `convention_meal_signups.meal_choice`, `dietary_notes`, `status` |
| 059 | `convention_exhibitors.hours`, `logo_path`, `tags`, `specials`, `view_count`, `is_published` |
| 007 | `convention_schedule_change_notifications` |

Migrations are applied with `npx tsx packages/api/scripts/migrate-organizer-parity.ts` (idempotent — `ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS`).

---

## Related legacy integration

| Mechanism | Direction | Status |
|-----------|-----------|--------|
| `POST .../dancecard/organizer-handoff` | C2K → ECKE organizer UI | Legacy; replaced by publish bridge |
| Schedule iframe embed | ECKE → C2K read | Unchanged |
| `conventions.settings.dancecardSlug` | Manual link | Default input + output of publish |

---

## Supabase ingest

**ADR:** [`adr/ECKE_SUPABASE_INGEST.md`](./adr/ECKE_SUPABASE_INGEST.md)

| C2K source | ECKE table | `c2k_source_type` | Publish mode | Pilot status |
|------------|------------|-------------------|--------------|--------------|
| `conventions` | `public.events` | `convention` | `POST .../conventions/:slug/publish` → queue `publish-convention-event` | **Verified** (`preview-c2k-weekend`) |
| `organizations` (dungeon) | `dungeon_venues` | `organization` | Inline on `POST .../organizations/:slug/publish` when dungeon listing | Not piloted |
| `vendor_profiles` | `vendors` | `vendor_profile` | Queue `publish-vendor` (toggle + `PUT /api/v1/me/vendor-profile` auto-enqueue) | Not piloted |
| `education_articles` | `articles` | `education_article` | Queue `publish-article` (toggle + article save auto-enqueue); `/sync` for inline | Not piloted |

### Vendor → `public.vendors` (`buildEckeVendorRow`)

| C2K `vendor_profiles` | ECKE column |
|-----------------------|-------------|
| `slug` (lowercase) | `slug` |
| `display_name` | `name` |
| `maker_story` or `bio` (≤12000) | `description` |
| `website` | `website_url` |
| — | `city`, `state` = null |
| Heuristic (no website / no `, ST` in bio) | `online_only` |
| `id` | `c2k_source_id` (`vendor_profile`) |

Requires `ecke_publish=true` and `visibility=PUBLIC`.

### Education article → `public.articles` (`buildEckeArticleRow`)

| C2K `education_articles` | ECKE column |
|--------------------------|-------------|
| `title` | `title`, `seo_title` |
| `slug` (lowercase) | `slug` |
| `excerpt` or title (≤500) | `excerpt` |
| `body_html` | `content` |
| Author `profiles.display_name` or `users.username` | `author_name` |
| First `categories[]` or `'Education'` | `category` |
| `publication_status` | `status` (`published` / `draft`) |
| `published_at` (date) | `publish_date` |
| `reading_minutes` | `read_time` (`"N min read"`) |
| `excerpt` (≤320) | `meta_description` |
| `hero_image_url` | `og_image` |
| `id` | `c2k_source_id` (`education_article`) |

Requires `ecke_publish=true` and `publication_status=PUBLISHED`.

### Dungeon org → `dungeon_venues` (`buildEckeDungeonRowFromOrg`)

| C2K `organizations` | ECKE column |
|-----------------------|-------------|
| `slug` (lowercase) | `slug` |
| `display_name` | `name`, `meta_title` |
| `bio` (≤12000) | `description`, `meta_description` (≤320) |
| `external_site_url` | `website_url` |
| Optional `city` / `state` args (not set from org row today) | `city`, `state` |
| — | `private_address` = false |
| `id` | `c2k_source_id` (`organization`) |

**ECKE prerequisite:** Apply `database/c2k_ingest_external_ids.sql`. **`UNIFIED_*_PREFER_DB` optional** — §12 merge prefers DB when `c2k_source_id` is set.

**C2K worker:** BullMQ `c2k-ecke-publish` — jobs `publish-article`, `publish-vendor`, `publish-convention-event` only. Dev smoke: `npm run smoke:ecke-bridge -w @c2k/api` (runs `executeEckePublishConventionEvent` inline). Env: `ECKE_PUBLISH_ENABLED`, `ECKE_SUPABASE_URL`, `ECKE_SUPABASE_SERVICE_ROLE_KEY`, optional `C2K_ECKE_PUBLISH_INLINE`.

---

## Related docs

- [**ECKE ↔ C2K hookup master handoff**](./ECKE_C2K_HOOKUP_MASTER.md) — take to ECKE repo; preserve existing search listings
- [EVENT_SYSTEMS_IDENTITY.md](./EVENT_SYSTEMS_IDENTITY.md) — C2K identity authority; ECKE marketing-only role
- [PLATFORM_VISION.md](./PLATFORM_VISION.md) — dual-surface architecture
- [DANCECARD_ORGANIZER_PARITY.md](./DANCECARD_ORGANIZER_PARITY.md) — organizer UI parity + sync status
- [ORGANIZER_CONSOLE.md](./ORGANIZER_CONSOLE.md) — routes and publish UX

---

*Update when ECKE ingest API changes, slot upsert strategy changes, or identity ADR adds new publish exclusions.*

| Date | Note |
|------|------|
| 2026-06-06 | Reconciled publish targets, API routes, worker jobs, and vendor/article/dungeon entity tables with `packages/api` |
