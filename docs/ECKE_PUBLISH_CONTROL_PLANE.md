# ECKE Publish Control Plane

**Status:** Pass 4 — `group_listing` + `event_listing` write actions enabled  
**Purpose:** Single source of truth for “can publish?”, “who?”, “what payload?”, “what ECKE pages?”

**Product rule:** kink.social is the workflow source of truth; ECKE is the public discovery surface. Do not permanently flatten richer **public-safe** kink.social data — expand ECKE display modules opt-in over time. See `ECKE_PUBLISH_PARITY_AUDIT.md` § *Product rule* and *ECKE Expansion Rule*. Privacy contract unchanged.

---

## Registry design

File: `packages/api/src/lib/ecke-publish-registry.ts`

```ts
type EckeSourceKind =
  | 'education_article'
  | 'vendor_profile'
  | 'organization_listing'
  | 'group_listing'
  | 'event_listing'
  | 'convention_listing'
  | 'dancecard_event'
  | 'dancecard_location'
  | 'dancecard_program_slot'
  | 'dancecard_staff_shift'
  | 'presenter_profile'
  | 'dungeon_profile'
  | 'venue_profile'
```

Each registry entry:

| Field | Purpose |
|-------|---------|
| `sourceKind` | Stable key for API query params |
| `owningEntityType` | `user` \| `group` \| `organization` \| `convention` |
| `requiredPermission` | e.g. `group.moderator`, `convention.full_admin`, `article.author` |
| `publicEligibility` | `(entity) => { eligible, reason?, warnings[] }` |
| `buildPreviewPayload` | Returns `{ posted, omitted, affectedPages }` |
| `eckeTargetPath` | e.g. `/education/[slug]`, `/events/[slug]` |
| `eckeIngestEntityType` | Envelope `entityType` for ingest API |
| `allowedActions` | `preview` \| `publish` \| `sync` \| `unpublish` |
| `redactionRules` | Field list + location visibility handling |
| `statusTargetKind` | Maps to `ecke_publish_targets.target_kind` |
| Dashboard flags | `group` \| `org` \| `user` \| `convention` visibility |

---

## Service layer

File: `packages/api/src/lib/ecke-publish-service.ts`

Responsibilities:

1. Resolve registry entry by `sourceKind` + `sourceId`.
2. Load source entity; verify ownership (group/org/user/convention).
3. Run eligibility + redaction (`ecke-redaction.ts`).
4. Build preview envelope (plain-English labels + raw JSON debug).
5. Route publish to ingest API or legacy Supabase/webhook based on config.
6. Upsert `ecke_publish_targets` with hash, URL, status, errors.

**Do not duplicate** logic from `ecke-publish-routes.ts` — refactor routes to call service.

---

## API routes (preferred)

Unified (new):

```
GET    /api/v1/ecke-publish/registry
GET    /api/v1/ecke-publish/status?sourceKind=&sourceId=
GET    /api/v1/ecke-publish/preview?sourceKind=&sourceId=
POST   /api/v1/ecke-publish/publish   { sourceKind, sourceId }
POST   /api/v1/ecke-publish/sync      { sourceKind, sourceId }
POST   /api/v1/ecke-publish/unpublish { sourceKind, sourceId }
```

Scoped (keep during migration):

```
GET/POST /api/v1/organizer/ecke-publish/groups/:groupId[/preview|/publish|/unpublish]
GET/POST /api/v1/organizer/ecke-publish/organizations/:slug/...
GET/POST /api/v1/organizer/ecke-publish/conventions/:slug/...
GET/POST /api/v1/organizer/ecke-publish/events/:eventIdOrSlug/...
GET/POST /api/v1/me/education-articles/:id/ecke-publish
GET/POST /api/v1/vendors/me/ecke-publish
```

---

## Server-side checks (every action)

- Authenticated user
- Source entity exists and not archived/deleted/banned
- User has publish permission for owner scope
- Source belongs to claimed group/org/user/convention
- `visibility` public-safe; group not private/hidden
- Location visibility respected (`resolveStandaloneEventPublicLocation` pattern L327–336)
- Media/hero URLs sanitized (`sanitizeEckeHeroImageUrl`)
- No private app URLs in payload (`eckePayloadContainsPrivateAppUrls`)
- ECKE bridge configured (`ECKE_PUBLISH_ENABLED`)
- Target maps to supported ingest type OR legacy fallback enabled

---

## Transport selection

| sourceKind | Preferred (end-state) | Legacy fallback |
|------------|----------------------|-----------------|
| `education_article` | Ingest API | — |
| `group_listing` | Ingest API | Listing webhook |
| `organization_listing` | Ingest API | Listing webhook |
| `convention_listing` | Ingest API | Listing webhook |
| `event_listing` | Ingest API | Supabase `events` |
| `vendor_profile` | Ingest API | Supabase `vendors` |
| `dungeon_profile` | Ingest API | Supabase `dungeon_venues` |
| `dancecard_*` | Ingest or keep Supabase sync | Supabase REST (current) |

Config: `ECKE_PUBLISH_USE_LEGACY_SUPABASE=true` during migration.

---

## Status model

Uses `ecke_publish_targets.status`: `never` \| `draft` \| `published` \| `stale` \| `error` \| `unpublished` (add enum value).

Stale detection: `derivePublishStatus` (`ecke-publish-payload.ts` L375–383) — compare `contentHash` vs `publishedContentHash`.

---

## Frontend components (Pass 2+)

```
packages/web/src/components/ecke/
  EckePublishPanel.tsx
  EckePublishStatusBadge.tsx
  EckePublishPreviewDrawer.tsx
  EckePublishPayloadTable.tsx
  EckePublishEligibilityNotice.tsx
  EckePublishOmittedFieldsList.tsx
  EckePublishActionButtons.tsx
  EckePublishHistoryList.tsx
```

Preview copy structure:

```
This will appear on East Coast Kink Events as:
[Title, URL, Description, Date, Location, Attribution, CTA]

This will not be sent:
- [omitted fields — privacy]

Public-safe but ECKE does not display this yet:  (Pass 4+ / deferred[])
- [expansion candidates — document in audit table]

[Expandable raw JSON]
```

Registry entries may declare optional `expansionModules[]` (e.g. `schedule`, `mapPins`, `vendors`) for future payload sections without changing Pass 3 `group_listing` envelope.

---

## Pass 2 Implementation Notes

- Registry created: `packages/api/src/lib/ecke-publish-registry.ts`
- Service created: `packages/api/src/lib/ecke-publish-service.ts`
- Redaction helpers: `packages/api/src/lib/ecke-redaction.ts`
- Read-only routes: `packages/api/src/routes/ecke-publish-control-routes.ts`
- Preview/status endpoints added (`GET /api/v1/ecke-publish/*`, `GET /api/v1/groups/:groupId/ecke-publish`)
- Group dashboard ECKE tab added (`?tab=ecke`)
- Publish/sync/unpublish intentionally disabled in UI and API (Pass 2)
- No ECKE writes occur in Pass 2 — service and control routes do not call publish client functions
- Next pass: `group_listing` write path + group unpublish

---

## Pass 3 Implementation Notes

- `group_listing` publish/sync/unpublish enabled in unified control plane
- Only `group_listing` write actions are enabled; other source kinds return `unsupported_in_pass_3` (HTTP 501)
- POST routes: `/api/v1/ecke-publish/publish|sync|unpublish` and `/api/v1/groups/:groupId/ecke-publish/publish|sync|unpublish`
- Service methods: `publishEckeSource`, `syncEckeSource`, `unpublishEckeSource` in `ecke-publish-service.ts`
- Target store: `ecke-publish-target-store.ts` — status, content hash, stale detection, unpublish idempotency
- Current transport: **listing_webhook** via `publishListingToEcke` / `unpublishListingToEcke` (`ecke-publish-client.ts`)
- ECKE ingest expansion for `group_listing` deferred; webhook body extended with `action`, `sourceSystem`, `sourceId` metadata
- Schema: `ecke_public_url`, `ecke_record_id`, `unpublished_at`, enum value `unpublished` on `ecke_publish_targets`
- Private/hidden/non-public groups blocked server-side; payload built from `buildGroupListingPayload` only
- Preview/status paths remain read-only; static test confirms write transport only in action methods
- Legacy routes in `ecke-publish-routes.ts` and `EckePublishStub` in Settings unchanged

---

## Pass 4 Implementation Notes

- `event_listing` publish/sync/unpublish enabled for group-owned public events
- Unified service routes `group_listing` and `event_listing`; other kinds return `unsupported_in_pass_4`
- Event transport: **supabase_rest** via `executeEckePublishStandaloneEvent`
- Group-scoped POST routes accept `{ sourceKind, sourceId }` body for event actions
- Preview response includes `wouldPublishDeferred[]` for ECKE capability gaps
- Location redaction enforced server-side via `resolveStandaloneEventPublicLocation`
- Preview/status remain read-only; writes go through action methods only

