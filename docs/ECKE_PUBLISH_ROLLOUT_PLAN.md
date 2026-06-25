# ECKE Publish Rollout Plan

**Status:** Pass 4 complete locally — commit/push before prod; Pass 5 next  
**Principle:** Wire one entity at a time; keep legacy paths until pilot passes.

**Addendum:** ECKE should grow to match public-safe kink.social features (opt-in, never leak private data). See `ECKE_PUBLISH_PARITY_AUDIT.md` — *ECKE Capability Expansion Candidates* and *ECKE Expansion Rule*.

---

## Phases

| Pass | Work | Code? |
|------|------|-------|
| **1** | Audit + docs (this package) | Docs only |
| **2** | Registry + preview/status endpoints (no ECKE writes) | kink.social API + UI read-only |
| **3** | Group listing publish + group ECKE tab + unpublish + tests | kink.social (listing webhook; ECKE ingest deferred) |
| **4** | Group/public event listings + location redaction + deferred preview | kink.social (Supabase REST); ECKE calendar documented |
| **5** | Education + vendors in group/org context | Both repos |
| **6** | Dungeons / venues after ECKE table mapping confirmed | Both repos |
| **7** | Dancecard parity in group/org dashboards | kink.social UI |
| **8** | Ingest consolidation; deprecate direct Supabase | Both repos + feature flag |

---

## Pass 2 checklist

- [x] Create `ecke-publish-registry.ts`
- [x] Create `ecke-redaction.ts`
- [x] Create `ecke-publish-service.ts`
- [x] Add unified GET registry/status/preview routes
- [x] Build `EckePublishPanel` + preview drawer components
- [x] Add `ecke` tab to group organizer (read-only preview)
- [ ] Fix schema duplicate `event` enum value (deferred)
- [ ] Add migration columns: `ecke_public_url`, `unpublished_at`, etc. (Pass 3)

---

## Pass 3 checklist (group listing)

- [ ] ECKE: add `group_listing` to `SUPPORTED_ENTITY_TYPES` — **deferred**; using listing webhook
- [ ] ECKE: Zod schema + upsert handler for group listing payload — **deferred**
- [x] kink.social: registry entry for `group_listing` using `buildGroupListingPayload`
- [x] kink.social: group unpublish route (unified control plane)
- [x] kink.social: `OrganizerGroupEckePanel` with Group Listing card (write actions)
- [x] Tests: private group blocked, public group publish context, mod-only auth, stale/sync/unpublish helpers
- [ ] Pilot: one real public group org

---

## Pass 4–8 summary

**Pass 4:** Standalone/group events — UI on group schedule + event detail; ingest `event_listing`; fix ECKE calendar merge.

**Pass 5:** Group/org-owned education and vendors — extend ownership checks; do not break user-owned flows.

**Pass 6:** `dungeon_profile` / `venue_profile` ingest after confirming ECKE `dungeon_venues` vs `dungeons` tables.

**Pass 7:** Dancecard tab on group dashboard when convention operated by group; show slots/locations/staff counts; no staff PII.

**Pass 8:** Set `ECKE_PUBLISH_USE_LEGACY_SUPABASE=false` after smoke tests; remove duplicate Supabase paths only post-pilot.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ECKE_PUBLISH_ENABLED` | Master gate |
| `ECKE_PUBLISH_ENDPOINT` / `ECKE_PUBLISH_SECRET` | Ingest API |
| `ECKE_SUPABASE_URL` / `ECKE_SUPABASE_SERVICE_ROLE_KEY` | Legacy REST |
| `ECKE_PUBLISH_LISTING_WEBHOOK_URL` | Legacy listing webhook |
| `ECKE_PUBLISH_USE_LEGACY_SUPABASE` | Migration fallback |
| `C2K_ECKE_PUBLISH_INLINE` | Dev inline vs queue |

---

## Test plan (smoke)

1. Create public group → preview group listing → confirm omitted fields
2. Publish → verify ECKE response URL/status
3. Edit description → status stale → sync
4. Unpublish → confirm idempotent
5. Create public group event, `locationVisibility: approved` → preview omits exact address
6. Publish event → ECKE payload public-safe location only

---

## Documentation index

| Doc | Purpose |
|-----|---------|
| `ECKE_PUBLISH_PARITY_AUDIT.md` | Entity + surface matrices, gaps, risks, **ECKE expansion candidates** |
| `ECKE_PUBLISH_CONTROL_PLANE.md` | Registry, API, service layer |
| `ECKE_PUBLISH_PRIVACY_CONTRACT.md` | Redaction and eligibility rules; preview categories |
| `ECKE_PUBLISH_GROUP_DASHBOARD.md` | Group tab UX spec |
| `ECKE_PUBLISH_ROLLOUT_PLAN.md` | This file |

Existing companions: `ECKE_PUBLIC_PUBLISHING_CONTRACT.md`, `ECKE_C2K_ENTITY_MAP.md`, `ECKE_PUBLISH_EXECUTOR_ARCHITECTURE.md`.

---

## Pass 2 Implementation Notes

- **Pass 2 complete** — registry, preview/status endpoints, group ECKE tab
- Publish/sync/unpublish intentionally disabled
- No ECKE writes occur in Pass 2
- **Next pass (Pass 3):** `group_listing` write path, group unpublish, ECKE ingest for group listing (or webhook with stored URL)

---

## Pass 3 Implementation Notes

- **Pass 3 complete** — `group_listing` publish/sync/unpublish enabled
- Only `group_listing` write actions enabled in unified control plane; other source kinds remain preview/planned
- Current transport: **listing_webhook** unless `ECKE_PUBLISH_LISTING_WEBHOOK_URL` unset (local status still recorded)
- ECKE ingest expansion deferred; listing webhook consumer still not found in EastCoast repo
- Private/hidden groups blocked; unpublish is idempotent
- Legacy org/convention/article/vendor/event publish paths untouched
- **Next pass (Pass 4):** group/public standalone `event_listing` UI + location redaction

---

## Pass 4 Implementation Notes

- **Pass 4 complete locally** — `event_listing` for group-owned public events
- Location redaction enforced; preview distinguishes will publish / deferred / privacy
- Group dashboard Events section write-enabled
- `group_listing` lifecycle preserved
- ECKE calendar uses static events only — documented, not patched in Pass 4
- ECKE capability expansion candidates table updated with Priority column
- **Next pass (Pass 5):** education + vendors in group/org context

---

## Pass 5 Slice 1 Implementation Notes

- `education_article` wired into unified ECKE control plane
- Uses existing ECKE ingest API transport (not a second path)
- Preview / status / publish / sync / unpublish supported via `/api/v1/ecke-publish/*`
- Private / member-only / connection-only / draft restrictions enforced server-side
- Author-only management; org manager path deferred unless ownership rules expand
- Writer page `EducationArticleEckePanel` with preview drawer and action buttons
- Group/org dashboard education cards deferred to **Pass 5 Slice 2**
- Vendor parity, dungeons, presenters, Dancecard, maps unchanged (out of scope)

