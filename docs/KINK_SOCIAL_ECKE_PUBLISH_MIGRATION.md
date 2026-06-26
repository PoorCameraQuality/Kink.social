# kink.social → ECKE publish migration

**Status:** Phase 0 complete. Phase 1 event/convention ingest dual-write wired (flag-gated). Enable on staging when ECKE `event`/`convention` handlers are live.

**Source of truth:** kink.social is the workflow source of truth; ECKE is the public discovery and SEO output. ECKE does **not** publish organization profile pages — orgs publish what they produce: events, conventions, places, vendors, and education.

---

## Locked product rules

1. **Organizations** are not an ECKE public surface. No ECKE org directory pages.
2. **Place ≠ org.** A place listing (`community_place`) is a public ECKE venue page. A dungeon/community org is kink.social ops only. Place publish must not flow from org profile publish.
3. **Conventions and standalone events** both publish to **ECKE Events** at `/events/{slug}`. Conventions are a richer subtype (`c2k_source_type: convention`), not a separate primary surface.
4. **Places** publish to ECKE Places (nav: Places, route: `/dungeons`, detail: `/dungeons/{slug}`). Ingest `entityType: place` with `placeKind` and `privacyMode`.
5. **Vendors** publish 1:1 to `/vendors/{slug}`.
6. **Education** publishes 1:1 to `/education/{slug}` (ingest live today).
7. **Dancecard** program data is **not** synced to ECKE. ECKE event pages may **link** to `/dancecard/{eventSlug}` on kink.social.
8. **Groups and presenters** are low priority — thin listing webhook only when explicitly public-safe and opted in.

---

## Surface map

| kink.social entity | ECKE public surface | Primary URL |
| --- | --- | --- |
| Convention | Events (Convention badge) | `/events/{slug}` |
| Standalone event | Events | `/events/{slug}` |
| Place / venue | Places | `/dungeons/{slug}` |
| Vendor profile | Vendors | `/vendors/{slug}` |
| Education article | Education | `/education/{slug}` |
| Group | Thin listing (legacy) | Low priority |
| Presenter | Thin listing (legacy) | Low priority |
| Organization profile | **Not published** | — |
| Dancecard program | **Not synced** | Link only |

---

## Owner-facing publish surfaces (Phase 0 UI)

Users see four primary surfaces:

- **Events**
- **Places**
- **Vendors**
- **Education**

Hidden or deprecated in owner UI (legacy transport may remain):

- `organization_listing`
- `dungeon_profile` (org-scoped)
- `convention_listing` as primary outcome
- `dancecard_event`, `dancecard_location`, `dancecard_program_slot`, `dancecard_staff_shift`

---

## Transport

| Handler | Endpoint env | Status |
| --- | --- | --- |
| Education ingest | `ECKE_PUBLISH_ENDPOINT` → `/api/kink-social/ingest` | **Live** |
| Event / place / vendor ingest | Same ingest endpoint | **Stubbed** — gated by per-entity flags |
| Listing webhook | `ECKE_LISTING_ENDPOINT` or `ECKE_PUBLISH_LISTING_WEBHOOK_URL` → `/api/kink-social/listing` | Legacy thin listings |
| Supabase REST | `ECKE_SUPABASE_*` | Legacy interim for events/vendors/dungeon rows |

### Feature flags (Phase 1+ cutover)

| Env | Purpose |
| --- | --- |
| `ECKE_EVENT_INGEST_ENABLED` | Send event/convention ingest envelopes |
| `ECKE_PLACE_INGEST_ENABLED` | Send place ingest envelopes |
| `ECKE_VENDOR_INGEST_ENABLED` | Send vendor ingest envelopes |

Phase 0: flags default **off** — builders compile and test but do not send unless enabled.

---

## Registry

File: `packages/api/src/lib/ecke-publish-registry.ts`

Each entry includes:

- `ownerFacingSurface` — `events` \| `places` \| `vendors` \| `education` \| null
- `deprecated` — legacy transport, hidden from owner dashboards
- `ownerDashboardVisible` — show publish controls when true

Helpers:

- `listOwnerFacingRegistryEntries()`
- `listRegistryForOrgDashboard()` / `listRegistryForConventionDashboard()` — filter deprecated/hidden
- `listDeprecatedRegistryEntries()`

---

## Ingest envelope builders (stubbed)

File: `packages/api/src/lib/ecke-ingest-envelope-builders.ts`

- `buildEckeEventIngestEnvelope` — `entityType` `event` or `convention`, includes `c2k_source_type`
- `buildEckePlaceIngestEnvelope` — `entityType` `place`, `placeKind`, `privacyMode`; strips `publicAddress` when `public_summary_only`
- `buildEckeVendorIngestEnvelope` — `entityType` `vendor`

Gated send helpers: `buildEcke*IngestEnvelopeIfEnabled()` (see `ecke-publish-config.ts`).

Envelope discipline (when fields available):

- `entityType`, `sourceId`, `preferredSlug`, `canonicalKinkSocialUrl`
- `seoTitle`, `metaDescription`, `publicImageUrl` / hero
- `tags`, `categories`, public-safe `city`/`state`
- `sourceUpdatedAt`, source attribution

---

## Place vs org model (target)

```txt
community_place
  optional owner_org_id
  optional claimed_by_user_id
  optional managed_by_org_id
  optional linked_events[]
```

Example: **The Mark by CPI** → ECKE place listing. **CPI** → kink.social org only (no ECKE org page). CPI may manage the place.

---

## Convention on ECKE

- Primary public URL: `/events/{slug}`
- User-facing action: **Publish event to ECKE**
- Legacy `convention_listing` webhook may dual-write during migration; not shown as primary outcome
- Optional Dancecard link on ECKE event page when enabled on kink.social

---

## Phase plan

| Phase | Scope |
| --- | --- |
| **0** | Registry, UI copy, docs, stub builders, hide invalid targets — **done** |
| **1** | Events/conventions ingest dual-write — **wired**; set `ECKE_EVENT_INGEST_ENABLED=true` on staging |
| **2** | Places ingest (`community_places`) |
| **3** | Vendor ingest |
| **4** | Education envelope polish |
| **5** | Groups/presenters thin listings |

After Phase 0: update ECKE “Publish is online” testing article to four-surface model. ECKE footer: remove Organizations directory or link off-site to kink.social org creation.

---

### Phase 1 dual-write behavior

When `ECKE_EVENT_INGEST_ENABLED=true` and ingest API is configured:

1. Build ingest envelope from `EckeEventRow` via `buildEckeEventIngestEnvelopeFromRow`.
2. POST to `ECKE_PUBLISH_ENDPOINT` (`publishEventIngestEnvelopeToEcke`).
3. Unless `ECKE_PUBLISH_USE_LEGACY_SUPABASE=false`, also upsert via Supabase REST (legacy).
4. Success prefers ingest response URL (`/events/{slug}`); legacy failure is non-fatal when ingest succeeds.
5. If ingest returns `unsupported_entity_type`, legacy Supabase still succeeds during cutover.

Module: `packages/api/src/lib/ecke-event-ingest-publish.ts`

---

## Cutover checklist (future)

1. Enable ingest flag on staging for one entity type.
2. Dual-write ingest + legacy transport; verify `eckePublicUrl` in response.
3. Disable Supabase REST for that entity when ingest returns 200 consistently.
4. Remove `ECKE_SUPABASE_*` from that entity’s publish path.
5. Repeat per entity: event → place → vendor.

---

## Related docs

- `docs/ECKE_C2K_ENTITY_MAP.md` — entity mapping (update as ingest goes live)
- `docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md` — ingest contract
- `docs/ECKE_PUBLISH_CONTROL_PLANE.md` — API and service layer
- `docs/adr/ECKE_SUPABASE_INGEST.md` — ADR for Supabase vs ingest
