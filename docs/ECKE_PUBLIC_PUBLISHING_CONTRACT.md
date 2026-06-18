# ECKE public SEO publishing contract (Pass 2)

**Status:** Architecture + contract — multi-entity public SEO layer  
**Pass:** 2 (generalizes Pass 1 education-only contract)  
**Source system:** kink.social (`coast-to-coast-kink`)  
**Target system:** EastCoastKinkEvents.com (`EastCoast-master`)  
**ECKE companion:** [`KINK_SOCIAL_PUBLIC_INGEST_CONTRACT.md`](../../eastcoast/EastCoast-master/docs/KINK_SOCIAL_PUBLIC_INGEST_CONTRACT.md)  
**Type draft:** `packages/shared/src/ecke-public-ingest-envelope.ts` (not wired to runtime)

---

## 1. Product purpose

### kink.social (premium logged-in platform)

Owns:

- User identity, sessions, relationships, messaging, discussions
- Privacy controls, visibility, moderation, credibility history
- RSVPs, applications, member-only content, organizer tools
- Authoring and opt-in: “publish public-safe copy to ECKE”

kink.social is **not** the primary Google SEO surface for community UGC (robots policy: private app unless public launch mode).

### EastCoastKinkEvents.com (public SEO layer)

Owns:

- Public discovery, search indexing, directory listings
- Canonical public URLs, sitemap, JSON-LD, Open Graph
- Privacy-safe rendering of opted-in public content
- Funnel CTAs back to kink.social for full experience

ECKE must **never** become a leak of kink.social private data.

---

## 2. Supported entity types

| `entityType` | kink.social source | ECKE table / route (today) | Rollout phase |
|--------------|-------------------|----------------------------|---------------|
| `education_article` | `education_articles` | `articles` → `/education/[slug]` | **1** |
| `education_path` | `education_article_series` | TBD → `/education/paths/[slug]` | 1b (future) |
| `event` | `events` (standalone public) | `events` → `/events/[slug]` | **2** |
| `convention` | `conventions` | `events` (listing row) → `/events/[slug]` | **4** |
| `place` | org dungeon listing | `dungeon_venues` → `/dungeons/[slug]` | **3** |
| `organization` | `organizations` | listing webhook / future org route | **3** |
| `presenter` | `presenter_profiles` | **No route yet** → `/presenters/[slug]` | **4** |
| `vendor` | `vendor_profiles` | `vendors` → `/vendors/[slug]` | **5** |
| `class_sample` | education class samples | `/education/[slug]` or dedicated | 5+ |
| `media_reference` | public media shows/episodes | TBD | 5+ |
| `group` | `groups` | **Deferred** — privacy review required | — |

**Not in scope without explicit ADR:** private groups, connection-only profiles, member graphs, forums, DMs, RSVP rosters, applicant PII, moderation cases.

---

## 3. Shared ingest envelope

All entity publishes use one envelope (see `KinkSocialPublicIngestEnvelope` in shared types draft).

```ts
type KinkSocialPublicIngestEnvelope = {
  sourceSystem: 'kink.social'
  entityType: EckePublicEntityType
  sourceId: string              // stable UUID on kink.social
  sourceUpdatedAt: string       // ISO-8601
  action: 'upsert' | 'unpublish'
  visibility: 'PUBLIC'          // only value accepted for upsert
  publishToEcke: true             // only true accepted for upsert
  publicSafe: true                // sender asserts redaction complete
  idempotencyKey: string          // kink.social:{entityType}:{sourceId}
  canonicalKinkSocialUrl?: string // public deep link for CTA
  preferredSlug?: string
  payload: EntityPayload            // entity-specific (§4)
}
```

### Universal rules (fail closed)

| Rule | Enforced on |
|------|-------------|
| `visibility === 'PUBLIC'` | kink.social eligibility + ECKE ingest |
| `publishToEcke === true` | kink.social eligibility + ECKE ingest |
| `publicSafe === true` | kink.social before send; ECKE rejects if validation fails |
| `action === 'unpublish'` | No visibility/publicSafe required; idempotent by `sourceId` |
| Restricted visibility never accepted | Both sides |
| Draft / archived / deleted → unpublish, not upsert | kink.social |
| Moderation not `approved` → not eligible | kink.social |
| `directoryVisibility === 'UNLISTED'` → not eligible | kink.social (presenters, etc.) |
| No kink.social private URLs in public body | `sanitizeEckePublicText` + ECKE scan |

### Idempotency

- **Upsert key:** `(c2k_source_type, c2k_source_id)` on ECKE public tables
- **Slug:** public URL key; collisions handled per §8
- **Replay:** same `sourceId` updates same row

---

## 4. Entity payloads and redaction

### 4.1 Redaction matrix (summary)

| Never on ECKE | Applies to |
|---------------|------------|
| Private / hidden addresses | event, convention, place |
| RSVP lists, attendee names, counts (when scoped private) | event, convention |
| Member-only pricing, invite-only details | event, convention |
| Private event discussion, organizer notes | event, convention |
| Unpublished schedule slots | convention |
| Applicant / acceptance data | convention, presenter |
| Member lists, staff rosters (private) | organization, place |
| Moderation history, safety reports | all |
| Private contact (email, phone) unless explicitly public | all |
| Connection-only / members-only body text | education_article |
| Organizer-only presenter materials | presenter |
| Private references, application answers | presenter |
| Sales / customer data | vendor |
| kink.social session tokens, internal IDs beyond `sourceId` | all |

### 4.2 `education_article`

**Allowed:** title, slug, excerpt, sanitized `body_html`, author display name, public profile URLs, presenter profile URL (if public), content warnings, categories, difficulty, reading minutes, published/updated timestamps, hero image (public URL).

**kink.social table:** `education_articles.ecke_publish`  
**ECKE:** `public.articles`  
**C2K executor today:** `executeEckePublishArticle` (Option B Supabase REST)  
**Known gap:** executor hardcodes `visibility: 'PUBLIC'` without reading row — **must fix before Phase 1 pilot**

### 4.3 `education_path`

**Allowed:** series title, slug, description, ordered public article slugs/ids, author display name, public URLs.  
**Never:** private series notes, unpublished articles in path.  
**ECKE route:** `/education/paths/[slug]` — **not built**

### 4.4 `event`

**Allowed:** public title, summary, dates, public city/region, public venue name (if public-safe), exact address only if `publicLocationSummary` / visibility allows, organizer public name, public image, public ticket/info URL, tags, accessibility notes, canonical kink.social event URL.

**Never:** private address, hidden location, RSVP data, attendee identities, private discussions, member-only pricing.

**kink.social:** standalone `events` with `visibility=PUBLIC`; convention anchor events use convention publish path.  
**ECKE:** `public.events`, `/events/[slug]` — JSON-LD `Event`, sitemap, OG **already exist** for static/DB merge.

### 4.5 `convention`

**Allowed:** public name, dates, city/region, public venue (if allowed), description, public organizer, public application **links** (to kink.social), canonical convention URL.

**Never:** applicant data, private hotel/venue details, internal staff notes, unpublished program, acceptance/rejection state.

**kink.social:** organizer explicit Publish; `executeEckePublishConventionEvent` → ECKE `events` row (`c2k_source_type=convention`).  
**ECKE route:** `/events/[slug]` (conventions are event listings today, not `/conventions/`)

### 4.6 `place` (dungeon / venue listing)

**Allowed:** public name, region, public website, public description, venue type, public policies, kink.social org URL.

**Never:** non-public address, private contact, staff/member lists, safety reports, member-only access instructions.

**kink.social:** org with `feature_flags.listingKind=dungeon`; inline `ecke_dungeon` on org publish.  
**ECKE:** `dungeon_venues` → `/dungeons/[slug]` or `/dungeons/[state]/[slug]`

### 4.7 `organization` (non-dungeon public org)

**Allowed:** public name, mission/description, region, public website, links to public events on kink.social.

**Never:** member list, internal notes, private admin contact.

**Today:** `ecke_listing` webhook payload only — no direct table mapping for generic org pages.

### 4.8 `presenter`

**Allowed:** public name, bio, focus areas, teaching topics, links to public articles/classes, public credits.

**Never:** organizer-only fields, private references, application answers, hidden identity.

**kink.social:** `presenter_profiles.directory_visibility` must be `PUBLIC`; **no `ecke_publish` column yet** — needs opt-in field + executor (Phase 4).

### 4.9 `vendor`

**Allowed:** shop name, public description, public website, categories, kink.social vendor URL.

**Never:** private sales/customer data, non-public contact.

**kink.social:** `vendor_profiles.ecke_publish` + `visibility=PUBLIC`  
**ECKE:** `vendors` → `/vendors/[slug]`

### 4.10 Future: `class_sample`, `media_reference`, `group`

Documented for contract completeness; **no publish implementation** until privacy ADR per type. Groups require explicit “public group page” product decision.

---

## 5. ECKE public rendering requirements

For each supported entity, ECKE must provide (when phase is live):

| Capability | Education | Events | Dungeons | Vendors | Presenter (future) |
|------------|-----------|--------|----------|---------|-------------------|
| Detail page | ✓ | ✓ | ✓ | ✓ | — |
| Listing/directory | ✓ `/education` | ✓ `/events` | ✓ `/dungeons` | ✓ `/vendors` | — |
| Sitemap | ✓ | ✓ | ✓ | ✓ | — |
| Canonical | ✓ | ✓ | ✓ | ✓ | — |
| Open Graph | ✓ | ✓ | ✓ | ✓ | — |
| JSON-LD | Article | Event | LocalBusiness/etc. | Organization | Person |
| IndexNow hook | On ingest (planned) | On ingest (planned) | On ingest | On ingest | — |
| Source attribution | Planned | Planned | Planned | Planned | — |
| kink.social CTA | Planned | Planned | Planned | Planned | — |

### Actual route map (ECKE today)

| Entity | Public URL | Notes |
|--------|------------|-------|
| Education article | `/education/[slug]` | Supabase or static fallback |
| Education path | — | Use series slug under `/education` later |
| Event / convention listing | `/events/[slug]` | Conventions share events table |
| Place / dungeon | `/dungeons/[...slug]` | State + slug catch-all |
| Vendor | `/vendors/[...slug]` | |
| Organization | — | No dedicated public org page |
| Presenter | — | No presenter directory page |
| Convention (dedicated) | — | No `/conventions/[slug]` on ECKE |

**Recommendation:** Keep convention → `/events/[slug]` for SEO continuity; add `/presenters/[slug]` in Phase 4; defer `/organizations/[slug]` until product needs it.

---

## 6. CTA / funnel requirements

Every kink.social-sourced ECKE page includes a **single contextual CTA block** (component: `KinkSocialSourceCta` — planned), not an ad wall.

| Entity | Example copy |
|--------|----------------|
| All | “Published from kink.social.” |
| Event / convention | “Join kink.social to RSVP, save this event, and follow updates.” |
| Education | “View the full community profile and discussion on kink.social.” |
| Presenter | “Log in on kink.social to apply as a presenter or book a class.” |
| Place / org | “Manage this public listing from kink.social.” |
| Vendor | “Visit the full shop experience on kink.social.” |

**Rules:**

- Link uses `canonicalKinkSocialUrl` or env `NEXT_PUBLIC_C2K_PUBLIC_URL` + known path
- Never imply ECKE authored member content
- Never expose login tokens or pre-filled credentials
- CTA is supplementary; primary content remains the public SEO copy

---

## 7. Ingest API (target architecture)

**Transport:** Option A — authenticated ECKE API (preferred for all entity types long-term).

```
POST /api/kink-social/ingest
POST /api/kink-social/unpublish
```

Single auth + validation layer; internal handlers branch on `entityType`.

| Requirement | Detail |
|-------------|--------|
| Auth | `Authorization: Bearer {KINK_SOCIAL_INGEST_SECRET}` or HMAC (`X-Kink-Social-Signature`, `X-Kink-Social-Timestamp`) |
| Validation | Zod envelope + per-entity payload schemas |
| Reject | Non-public, unsupported type, `publicSafe !== true` on upsert |
| Upsert | By `(c2k_source_type, c2k_source_id)` |
| Response | `{ status, eckePublicUrl, eckeSlug, eckeRecordId?, errorCode? }` |
| Logging | Request id + entityType + sourceId + outcome — **no body dumps** |
| Rate limit | ECKE `withRateLimit` ingest bucket |
| Post-success | IndexNow + optional sitemap ping |

**Interim (shipped):** Option B — kink.social worker writes ECKE Supabase REST with service role for articles, vendors, events, dungeons. Migrate entity-by-entity to Option A.

---

## 8. Slug and unpublish behavior

### Slug collision

1. Match on `(c2k_source_type, c2k_source_id)` → update row (slug may change).
2. New source, slug taken by legacy static → `409 slug_collision` (owner resolves).
3. New source, slug taken by another kink.social source → `409`.
4. Optional suffix `{slug}-{shortId}` only when `allowSlugSuffix: true` in payload.

### Unpublish

- Sets ECKE `status` to non-public (`draft` or equivalent)
- Removes from sitemap anon queries
- Idempotent by `sourceId`
- Triggers: opt-out, visibility change, archive, delete, ineligibility

---

## 9. Sitemap, JSON-LD, IndexNow

| Entity | Sitemap query | JSON-LD type | IndexNow |
|--------|---------------|--------------|----------|
| education_article | `articles` status=published | Article | `/education/{slug}` |
| event / convention | `events` via unified merge | Event (`EventStructuredData`) | `/events/{slug}` |
| place | `dungeon_venues` via unified merge | LocalBusiness (existing) | `/dungeons/...` |
| vendor | `vendors` via unified merge | Organization/Vendor | `/vendors/{slug}` |

Ingest handler should call `submitContentToIndexNow([eckePublicUrl])` after successful upsert (Pass 3 implementation).

---

## 10. kink.social executor architecture (target)

### Today (implemented)

| Entity | Opt-in field | Eligibility | Queue job | Executor |
|--------|--------------|-------------|-----------|----------|
| education_article | `ecke_publish` | `isEckePublishEligible` (visibility bug) | `publish-article` | `executeEckePublishArticle` |
| vendor | `ecke_publish` | visibility PUBLIC | `publish-vendor` | `executeEckePublishVendor` |
| convention | organizer Publish | listing visibility | `publish-convention-event` | `executeEckePublishConventionEvent` |
| place (dungeon) | org publish inline | org PUBLIC + dungeon flag | org publish path | `publishDungeonRowToEcke` |
| org/group listing | publish UI | webhook | — | `publishListingToEcke` |

**Queue:** single BullMQ `c2k-ecke-publish` — extend with `publish-entity` generic job in Pass 3.

### Target shared helpers (Pass 3+)

```ts
isEntityEckePublishEligible(entityType, entity): boolean
redactForEcke(entityType, entity): RedactedEntity
buildEckePublicPayload(entityType, entity): KinkSocialPublicIngestEnvelope
executeEckePublishEntity(entityType, sourceId, userId?): Promise<EckePublishResult>
```

**Status tracking:** `ecke_publish_targets` — add `external_url`, generalize FK pattern per `scopeType`.

---

## 11. Phased rollout

| Phase | Entities | Deliverables |
|-------|----------|--------------|
| **1** | education_article | Fix visibility bug; ECKE ingest API; content warnings UI; CTA component; article migration (staging) |
| **1b** | education_path | Series table/route on ECKE; path payload |
| **2** | event (standalone) | Event eligibility; redaction; ingest; CTA on event pages |
| **3** | place, organization | Dungeon ingest API; org listing table or route decision |
| **4** | convention, presenter | Convention CTA; presenter opt-in + `/presenters/[slug]` |
| **5** | vendor, class_sample, media_reference | Vendor Option A migration; samples/media ADR |

Each phase: eligibility → redaction → ingest → render → sitemap → JSON-LD → IndexNow → kink.social status UI → unpublish tests.

---

## 12. Environment variables

### kink.social

```
ECKE_PUBLISH_ENABLED
ECKE_PUBLISH_ENDPOINT          # https://host/api/kink-social/ingest
ECKE_PUBLISH_SECRET            # or ECKE_PUBLISH_HMAC_SECRET
ECKE_PUBLIC_BASE_URL
ECKE_SUPABASE_URL              # interim Option B — retire per entity
ECKE_SUPABASE_SERVICE_ROLE_KEY # interim Option B — retire per entity
C2K_ECKE_PUBLISH_INLINE
REDIS_URL
```

### ECKE

```
KINK_SOCIAL_INGEST_SECRET
KINK_SOCIAL_INGEST_HMAC_SECRET  # optional
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_C2K_PUBLIC_URL      # CTA join links
```

---

## 13. Staging and production rollout

1. Apply ECKE migrations on **staging** Supabase only (`c2k_ingest_external_ids` + per-entity columns).
2. Deploy ECKE ingest API to **preview** Vercel; point kink.social staging worker at preview endpoint.
3. Pilot one public education article end-to-end.
4. Phase 2+ entities only after phase test checklist green.
5. Production: operator enables `ECKE_PUBLISH_ENABLED` on kink.social API **and** worker after ECKE prod migration + API deploy.
6. Never enable service-role Option B and Option A simultaneously for the same entity type.

---

## 14. Universal test checklist

- [ ] Rejects non-public visibility
- [ ] Rejects missing `sourceId` / auth
- [ ] Rejects unsupported `entityType`
- [ ] Upsert idempotent by source ID
- [ ] Unpublish idempotent
- [ ] Slug collision safe
- [ ] Sitemap includes published / excludes unpublished
- [ ] JSON-LD validates
- [ ] CTA visible with correct kink.social link
- [ ] Restricted fields absent from rendered HTML (grep audit)

Entity-specific privacy tests: see ECKE companion doc §12.

---

## 15. What ECKE must never expose or imply

**Never expose:** emails, phones, private addresses, RSVP rosters, member lists, DMs, moderation notes, application answers, internal UUIDs except public slugs, session tokens.

**Never imply:** “Written by East Coast Kink Events” for member UGC; that ECKE hosts registration/accounts for kink.social features; that viewing ECKE grants kink.social membership.

---

## 16. References

- [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md)
- [`ECKE_C2K_ENTITY_MAP.md`](./ECKE_C2K_ENTITY_MAP.md)
- [`adr/ECKE_SUPABASE_INGEST.md`](./adr/ECKE_SUPABASE_INGEST.md) — amend for Option A per entity
- `packages/api/src/lib/ecke-publish-executor.ts`
- `packages/shared/src/seo-policy.ts`
