# Discovery search spike (Pass 2)

**Status:** Architecture spike — no search engine integrated, no production indexes, no behavior changes.  
**Date:** 2026-06-23  
**Scope:** Evaluate Typesense vs Meilisearch for kink.social discovery; propose safe index design and staged rollout.

This document is **ops/product architecture**, not analytics. Search must respect visibility rules — a result must never reveal content the viewer cannot access.

---

## 1. Executive recommendation

### Alpha recommendation: **Typesense** (defer integration until Pass 2B)

Use **Typesense** as the preferred discovery search engine for kink.social, but **keep database search for alpha** until Pass 2B implements a single low-risk surface behind env flags.

### Long-term recommendation: **Typesense** (same)

Typesense and Meilisearch both handle typo tolerance, filtering, and self-hosted Docker deployment. For this repo, **Typesense wins** because:

1. **Geo / coarse location** — Groups already use haversine nearby (`GET /api/v1/groups/nearby`); events and people use city/state/region filters client-side and in SQL. Typesense’s native geo filters (`geopoint`, radius, sort-by-distance) map directly to product needs. Meilisearch added geo search later; Typesense is the stronger default for location-heavy discovery.
2. **Faceted directory UX** — Explore, events, groups, vendors, and people already expose multi-facet filter panels. Typesense facet counts and multi-filter queries are a proven fit for directory pages.
3. **Federated Explore search** — `/explore` pools events, groups, people, vendors, orgs, articles, trending, and media with one `q` param. Typesense **multi_search** across collections is a natural match. Meilisearch federated search exists but multi-index operational patterns are less central in typical Meilisearch deployments.
4. **Explicit filter syntax** — Privacy requires hard filters (`visibility:public`, block lists, org membership). Typesense’s filter-by model is straightforward for “index public slice + post-filter sensitive collections.”

**Meilisearch** remains a valid alternative if the team prioritizes minimal ops surface or already runs Meilisearch elsewhere — but it does not beat Typesense on **geo + multi-surface federated discovery**, which are core to kink.social.

**Defer** full search replacement until index schemas are reviewed for privacy. Global events list visibility hardening shipped in Pass 2A.1.

---

## 2. Current state

There is **no PostgreSQL full-text search** (`tsvector`, `plainto_tsquery`) in the API. All text discovery uses **`ILIKE %term%`** (substring match), in-memory filtering, or client-side ranking. There is **no `/api/v1/explore/search`** — Explore composes multiple list endpoints and filters in the browser (`packages/web/src/lib/explore-hub.ts`).

| Surface | Current implementation | Current limitations | Privacy constraints | Search priority |
|---------|------------------------|---------------------|---------------------|-----------------|
| **Explore** (`/explore`) | Client filter on home-surface pools + org `q` API; URL-driven chips (`q`, `types`, geo flags) | No unified backend search; typo-intolerant; caps from upstream list limits (100 rows); org search debounced then re-filtered client-side | Public-only preview cards; verified/beginner/public-space chips; no private DMs or hidden fields in UI | **High** (product hub) — but **last** to integrate (needs federated index + strict privacy) |
| **Events** (`/events`) | `GET /api/v1/events` — SQL facets: category, format, city/country ILIKE on location fields; **global list SQL-filters `visibility = public`** (Pass 2A.1); **`GET /api/v1/events/:id` permission-gated** (Pass 2A.2); title search **client-only** (`rankEvents`) | Title/description not searchable on API; date/distance/scope sorted client-side | Location/join link redaction post-query; RSVP/attendee lists gated elsewhere | **High** — title search still client-only |
| **Groups** (`/groups`) | `GET /api/v1/groups` — category/org SQL; tag filter **in JS** after fetch; nearby via `GET /groups/nearby` haversine; name search **client-only** | No text `q` on API; 100-row cap; tag not in SQL | Post-query: public groups OR viewer is member; hidden member lists on detail via `filterGroupMembersForViewer` | **Medium** — Stage 4 (membership visibility complexity) |
| **People** (`/people`) | `GET /api/v1/profiles?q=&gender=` — ILIKE username/displayName; batch limit 100; extra facets **client-side** on returned set | Most filters client-only on 100 profiles; weak relevance; no typo tolerance | Blocks bidirectional; `discoverableInPeopleSearch`; profile visibility PUBLIC/MEMBERS; field redaction via `viewerMaySeeProfileField`; 1-year activity gate | **High** user need — **Stage 4** (highest privacy risk) |
| **Vendors** (`/vendors`) | `GET /api/v1/vendors?q=` (≥2 chars ILIKE name/slug); SQL: category, shipsTo, minRating; tag in JS | Description not in API `q`; demo mode all-client | `filterVendorVisibility`: PUBLIC in directory; MEMBERS/HIDDEN excluded | **Medium** — good **Stage 2** candidate |
| **Organizations** (`/orgs`) | `GET /api/v1/organizations?q=` — ILIKE displayName/slug; sort popular/name | “Nearby” chip is client heuristic, not geo API | SQL: PUBLIC orgs; logged-in also sees member orgs | **Medium** — good **Stage 2** candidate |
| **Education** (`/education`) | `GET /api/v1/education/articles?q=` — ILIKE title/excerpt; category/difficulty SQL; presenters/media have separate `q` routes | Body not searched; series without text search; hub strips unfiltered | `filterVisibleArticles` → PUBLIC / MEMBERS / CONNECTIONS tiers | **Medium** — safest **Stage 2** first surface |
| **Profiles** | No global profile search beyond People directory; `@mention` suggest prefix ILIKE connections-only | N/A | Connection-gated autocomplete | Low for global index |
| **Presenters** | `GET /api/v1/presenters?q=` — ILIKE on username, displayName, headline, bios; `directoryVisibility = PUBLIC` SQL | No block filter on directory | PUBLIC directory only | Medium — can share `people`-like index slice later |
| **Trending / ECKE** | `GET /api/v1/trending` — score-ranked pool, no text search; ECKE is outbound publish, not inbound search | Not a search surface today | SQL public visibility on pooled entities; posts filtered for muted tags | Low until Explore federates |
| **Community places** | `GET /api/v1/community-places?q=` — ILIKE name + geo radius | Published-only | Published status gate | Low (optional `place` collection) |
| **Conventions** | Per-slug routes only; organizer `q` on registrants/people (staff auth) | No public convention directory search | Organizer/door scopes only — **never public index** | N/A for public search |

### Urgency ranking (product + engineering)

1. **Events** — high traffic, weak API text search (title still client-only)  
2. **Explore global `q`** — differentiator, blocked on federated + privacy design  
3. **People** — high value, highest privacy risk  
4. **Groups** — nearby + text search gap, membership visibility  
5. **Vendors / Orgs / Education** — already partially server-side; lower risk to enhance first  

---

## 3. Product needs

| Requirement | kink.social need | Current gap |
|-------------|------------------|-------------|
| Global search | Explore `q` across entity types | Client-only, no backend |
| Directory search | Per-surface search bars | Mixed client/API; ILIKE only |
| Typo tolerance | Usernames, city names, event titles | None |
| Facets | Category, format, tags, gender, shipsTo, rating, visibility | Partial; many client-side |
| Sorts | Upcoming, popular, relevance, distance | Mostly client-side |
| Geo / coarse location | Groups nearby, event/people geo filters | Haversine for groups; ILIKE city/country for events |
| Date filtering (events) | Weekend, next 7 days, past | Client-side on fetched list |
| Role/category filters | People roles, org roles, vendor category | People mostly client |
| Privacy-safe filtering | Blocks, visibility tiers, hidden membership | Post-query in API; inconsistent |
| Incremental indexing | New events, profile updates | N/A — no index |
| Reindex jobs | Alpha seed, bulk rebuild | N/A |
| Local dev | Docker alongside Postgres/Redis | Not present |
| Docker deployment | Self-hosted VPS | Both engines support |
| Operational complexity | Small team, alpha | Typesense: single process + optional HA; Meilisearch: simpler single-node |
| Resource footprint | VPS alpha | Typesense ~256MB–1GB; Meilisearch similar |
| Failure behavior | Must not break directories | Need DB fallback (proposed below) |
| Admin reindex | Operator-triggered rebuild | Not built |

---

## 4. Typesense evaluation

### Strengths

- Typo tolerance and prefix search built-in  
- Strong **faceting** and facet counts for directory UIs  
- Native **geopoint** search (groups nearby, regional events)  
- **multi_search** for Explore federated queries  
- Mature self-hosted Docker image; Sentry-compatible ops patterns  
- Filter expressions map well to `visibility`, `category`, `starts_at`, `ships_to`  
- Separate **search-only API keys** for read path  

### Weaknesses

- Another service to run (Pass 1 observability helps)  
- Schema migration discipline required per collection  
- No built-in row-level security — **app must enforce access**  
- Synonyms/stemming need explicit curation for kink/community vocabulary  

### Docker / self-hosting

- Single container + volume; fits optional compose overlay (like GlitchTip)  
- Does not belong in `docker-compose.prod.yml` until Pass 2B+  

### Facet / filter fit

**Excellent** — matches Events/Groups/Vendors filter panels.

### Geo fit

**Excellent** — replace haversine + city ILIKE patterns for groups/events/places.

### Multi-index / global search fit

**Excellent** — `multi_search` with per-collection filters.

### Indexing complexity

**Medium** — one collection per entity; BullMQ sync jobs after commit (aligns with C2K worker pattern).

### Privacy risks

- Over-indexing visibility fields or private geo  
- Serving search-only key to browser (must stay server-side)  
- Federated search returning snippet from restricted doc if filters wrong  

### Operational risks

- Index drift from Postgres; needs reindex tooling  
- Stale docs after failed sync job  

### Alpha suitability

**Good** for Stage 2 single-collection pilot behind flags; **not** required for alpha ship if DB search remains.

---

## 5. Meilisearch evaluation

### Strengths

- Excellent typo tolerance and fast prefix search  
- Simple developer experience; good dashboard  
- Filtering and faceting supported  
- Self-hosted Docker; active open-source community  
- Lower conceptual overhead for single-index use cases  

### Weaknesses

- **Geo search** less central than Typesense for this product’s location-heavy surfaces  
- Federated multi-index search is possible but not as idiomatic for Explore’s “one search box, eight entity types”  
- Filter syntax differs — privacy filter migration must be carefully tested  
- Ranking customization differs from Typesense’s explicit sort fields  

### Docker / self-hosting

Comparable — single container, persistent volume.

### Facet / filter fit

**Good** — sufficient for vendors/orgs/education.

### Geo fit

**Adequate** — Meilisearch supports geo, but groups/events/people regional discovery is a stronger Typesense story in this repo.

### Multi-index / global search fit

**Moderate** — federated search available; Explore would need more glue code.

### Indexing complexity

**Medium-low** for one index; **higher** for many entity types with unified Explore.

### Privacy risks

Same class as Typesense: index leakage, client-side keys, missing post-filters.

### Operational risks

Index settings changes can require reindex; version upgrades need care.

### Alpha suitability

**Good** for a single-directory pilot; **weaker** fit for full Explore + geo roadmap without proving geo/federation requirements are met.

---

## 6. Safe index design

**Principles:**

- Index **only fields safe to store** in a search cluster (treat index as semi-public infrastructure).  
- Prefer **public-only collections** for alpha (`visibility:public` or equivalent at index time).  
- Use **filterable** visibility/access fields; never rely on snippet text to hide secrets.  
- **Server-side search only** — API holds read key; web calls existing API routes.  
- **Post-filter** viewer-specific rules (blocks, connections-only education, group membership) in API after Typesense returns IDs.  

### `event` document

| Aspect | Fields |
|--------|--------|
| **id** | `event:{uuid}` |
| **Searchable** | `title`, `public_location_summary`, `tags`, `category`, `host_display_name` (if public) |
| **Filterable** | `visibility`, `event_format`, `category`, `organization_id`, `group_id`, `starts_at`, `ends_at`, `newcomer_friendly`, `featured`, `country_code`, `state_id` |
| **Sortable** | `starts_at`, `created_at`, `rsvp_count` (optional) |
| **Display** | `title`, `public_location_summary`, `image_url`, `href`, `starts_at`, `category` |
| **Access** | `visibility`, `group_id`, `organization_id` — filter `visibility:public` for public index; member-scoped index later |
| **Geo** | `location_geopoint` from public/coarse coords only when `location_visibility` allows |
| **Excluded** | `description` (if long/private), exact address, `virtual_join_link`, RSVP rosters, screening answers, private notes, draft fields |

### `group` document

| Aspect | Fields |
|--------|--------|
| **id** | `group:{uuid}` |
| **Searchable** | `name`, `description` (public summary only), `tags` |
| **Filterable** | `visibility`, `category`, `organization_id`, `member_count`, `created_at` |
| **Sortable** | `member_count`, `created_at`, `name` |
| **Display** | `name`, `description_excerpt`, `location_label` (coarse), `access_label`, `href` |
| **Access** | `visibility` — public index: `public` only; private/invite-only excluded or separate secured collection |
| **Geo** | `geopoint` from group place when public |
| **Excluded** | member lists, hidden membership flags, invite codes, mod notes |

### `person` document

| Aspect | Fields |
|--------|--------|
| **id** | `person:{user_id}` |
| **Searchable** | `username`, `display_name` (if visible), `roles` (public labels), coarse `location_label` |
| **Filterable** | `visibility`, `discoverable`, `gender`, `verified`, `state_id`, `country_code` |
| **Sortable** | `last_active_at`, `username` |
| **Display** | card fields mirroring `toDiscoveryProfileCard` — only pre-redacted values |
| **Access** | Index only when `discoverable_in_people_search=true` AND `visibility=public` (alpha); MEMBERS tier needs authenticated search path |
| **Excluded** | email, exact address, kink tags (unless explicitly public profile fields), DMs, hidden fields, block graph |

### `organization` document

| Aspect | Fields |
|--------|--------|
| **id** | `org:{uuid}` |
| **Searchable** | `display_name`, `slug`, `bio` (public excerpt) |
| **Filterable** | `visibility`, `verified`, `region_label`, `created_at` |
| **Sortable** | `review_count`, `display_name`, `created_at` |
| **Display** | name, slug, badges, href |
| **Access** | `visibility:public` for anonymous index |
| **Excluded** | member roster, billing, internal mod settings |

### `vendor` document

| Aspect | Fields |
|--------|--------|
| **id** | `vendor:{uuid}` |
| **Searchable** | `display_name`, `slug`, `tags`, `category` |
| **Filterable** | `visibility`, `category`, `ships_to`, `min_rating`, `verified_feedback_count` |
| **Sortable** | `created_at`, `display_name`, `rating` |
| **Display** | card fields (no prices in directory policy) |
| **Access** | `visibility:public` only in directory index |
| **Excluded** | Stripe/external tokens, private shop notes, order data |

### `education_article` document

| Aspect | Fields |
|--------|--------|
| **id** | `education:{uuid}` |
| **Searchable** | `title`, `excerpt` |
| **Filterable** | `visibility`, `categories[]`, `difficulty`, `publication_status`, `author_id` |
| **Sortable** | `published_at`, `title` |
| **Display** | title, excerpt, href, category chips |
| **Access** | Index `list_in_education=true` + `published`; filter PUBLIC for anon; MEMBERS/CONNECTIONS via post-filter |
| **Excluded** | full body (until sanitization proven), draft content, mod notes |

### `place` / `venue` (optional)

| Aspect | Fields |
|--------|--------|
| **id** | `place:{uuid}` |
| **Searchable** | `name`, `category` |
| **Filterable** | `status=published`, `category` |
| **Geo** | `geopoint` |
| **Excluded** | private contact notes, un published pins |

### `convention` (public program only — later stage)

Only if a public convention directory is added. Index slug, title, dates, org link — **never** registrant or staff data.

---

## 7. Never index list

The following must **never** appear in a search index or search log payload:

- DMs and private messages; thread metadata beyond owner’s own inbox needs  
- Hidden profile fields (`@c2k/shared` field visibility, kink/consent/legal form values)  
- Exact private user location (street, lat/lng when user chose hidden/coarse-only)  
- Hidden group membership rosters; private member lists  
- Private RSVP data; attendee lists when `attendee_list_visibility` restricts  
- Private event attendee lists; waitlist identities  
- Blocked-user relationships (either direction)  
- Moderation notes, reports, quarantine reasons, owner investigations  
- Legal/security notes, admin-only reveals  
- Quarantined media metadata or URLs  
- Private upload URLs, presigned tokens, raw S3 keys  
- Auth/session/token/cookie data  
- Presenter private materials, organizer application payloads  
- Convention registrant PII (email, vetting notes, door lookup fields)  
- ECKE publish secrets, Supabase service payloads  
- Private org/group/event content scoped to members unless using a **designed, authenticated, post-filtered** index path  

---

## 8. Access control model

Search must **not** become a privacy bypass.

### Recommended alpha approach: **public-only index + API post-filter**

1. **Index time:** Only documents passing strict public gates (`visibility=public`, `discoverable`, `published`, etc.).  
2. **Query time:** API builds Typesense filter string from safe facets (date, category, geo).  
3. **Post-filter:** API re-checks each hit against Postgres-backed rules: blocks, connections-only articles, group membership for member-only docs, field redaction before DTO mapping.  
4. **Anonymous vs authenticated:** Same public index initially; authenticated users get additional **post-filter** passes, not a broader index, until schemas are audited per tier.  

### Why not viewer-specific indexes?

Per-viewer indexes do not scale and leak graph structure. Avoid unless legally required.

### Scoped indexes (later)

Optional separate collections: `events_public`, `events_org_member` — still require API auth before querying member collections.

### Pre-filter vs post-filter

| Mechanism | Use for |
|-----------|---------|
| **Pre-filter (index time)** | Exclude non-public entities entirely |
| **Typesense filter_by** | Category, date range, geo radius, `visibility:public` |
| **Post-filter (API)** | Blocks, CONNECTIONS education, group-scoped events, field redaction |

---

## 9. Proposed rollout plan

### Stage 0 — Now (Pass 2)

- This document  
- Env var contract (not wired)  
- Index schema privacy review before Pass 2B  

### Stage 1 — Index public entities (Pass 2B)

- `SEARCH_INDEXING_ENABLED=false` default  
- BullMQ job: sync education articles + organizations + vendors (PUBLIC only)  
- No query path change  

### Stage 2 — First directory surface

- **Education articles** recommended first (clearest publish gate)  
- Alternates: organizations, vendors  
- `SEARCH_QUERY_ENABLED=true` only for that route; DB ILIKE fallback  

### Stage 3 — Global Explore

- `multi_search` across public collections  
- Client `explore-hub.ts` calls new API federated endpoint  
- Hard cap on result counts; no private collections  

### Stage 4 — People and Groups

- Only after block graph + hidden membership + discoverability rules have index review sign-off  
- Requires authenticated post-filter suite in CI  

### Stage 5 — Admin reindex + monitoring

- `SEARCH_ADMIN_REINDEX_ENABLED` + staff auth  
- Uptime Kuma TCP/health on Typesense; GlitchTip on sync failures (scrubbed)  

---

## 10. Environment flags (proposed — not wired in Pass 2)

```env
SEARCH_PROVIDER=database          # database | typesense | meilisearch
SEARCH_INDEXING_ENABLED=false
SEARCH_QUERY_ENABLED=false
SEARCH_ADMIN_REINDEX_ENABLED=false
SEARCH_HOST=                      # e.g. http://127.0.0.1:8108
SEARCH_API_KEY=                   # admin key — server/worker only
SEARCH_READ_API_KEY=              # search-only key — server only
SEARCH_INDEX_PREFIX=c2k           # collection prefix per env
SEARCH_ENVIRONMENT=development
SEARCH_SYNC_BATCH_SIZE=100
```

---

## 11. Failure behavior

When search is unavailable or `SEARCH_QUERY_ENABLED=false`:

1. API routes **fall back to existing Drizzle ILIKE / list queries** (current behavior).  
2. User sees same data as today — possibly slower, no typo tolerance; optional soft banner “Search temporarily limited.”  
3. Errors to GlitchTip **without** query strings containing user `q` if possible (hash or truncate in scrubber).  
4. Index sync failures log queue name + entity id — **not** document body.  
5. Uptime Kuma monitors Typesense `/health` when deployed.  

---

## 12. Recommendation summary

| Question | Answer |
|----------|--------|
| **Preferred engine** | **Typesense** |
| **Why** | Geo, faceting, federated Explore, fits VPS self-hosting and worker sync pattern |
| **Why not Meilisearch** | Weaker fit for location-heavy multi-surface discovery; federated Explore is second-class vs Typesense for this repo |
| **First surface to integrate** | **Education articles** (safest publish/visibility gates); then orgs or vendors |
| **Do not integrate yet** | People, groups, global Explore, conventions/registrants, ECKE inbound |
| **Risks** | Index leakage; events visibility bug; block graph omitted; treating search as analytics |
| **Estimated phases** | Stage 0 doc (now) → Stage 1 sync (1–2 PRs) → Stage 2 one surface (1 PR) → Stage 3 Explore (2–3 PRs) → Stage 4 people/groups (3+ PRs with privacy tests) |

---

## Appendix A — Key files audited

### Web

- `packages/web/src/lib/explore-hub.ts` — Explore client search/filter  
- `packages/web/src/hooks/useApiPeopleSearch.ts` — People hybrid search  
- `packages/web/src/hooks/useApiVendors.ts`, `useApiOrganizations.ts`, `useApiEvents.ts`, `useApiGroups.ts`  
- `packages/web/src/app/explore/ExploreDashboardPage.tsx`  
- `packages/web/src/app/events/EventsDiscoverPage.tsx`  
- `packages/web/src/app/groups/GroupsDiscoverPage.tsx`  
- `packages/web/src/app/people/` → `FindPeopleDiscoverPage`  
- `packages/web/src/app/vendors/page.tsx`  
- `packages/web/src/app/orgs/page.tsx`  
- `packages/web/src/app/education/EducationDiscoverPage.tsx`  
- `packages/web/src/lib/discovery-utils.ts`, `vendor-filters.ts`, `org-directory-utils.ts`  

### API

- `packages/api/src/routes/ecosystem-stubs.ts` — profiles, events, groups, vendors  
- `packages/api/src/routes/organizations.ts`  
- `packages/api/src/routes/education-articles-routes.ts`  
- `packages/api/src/routes/presenter-profiles.ts`  
- `packages/api/src/routes/trending-routes.ts`, `lib/trending-rank.ts`  
- `packages/api/src/routes/community-places-routes.ts`, `media-routes.ts`  
- `packages/api/src/lib/people-discovery.ts`, `vendor-visibility.ts`, `group-access.ts`, `education-article-visibility.ts`, `profile-field-redaction.ts`  

### Inventory

- `visual-audit-routes.json` — route surface inventory for QA (not search logic)  

---

### Global event discovery (Pass 2A.1)

Unscoped `GET /api/v1/events` (no `groupId`, `organizationId`, or `hostId`) returns **`visibility = public` events only** at the SQL layer. This matches `trending-rank.ts` and `venue-events.ts`.

Scoped routes are unchanged:

- `?groupId=` — group calendar; `canViewerSeeGroupEvent` post-filter for members/staff
- `?hostId=me` — host's own events including private
- `GET /api/v1/organizations/:orgKey/events` — org calendar with org-member visibility rules

Future Typesense indexing must follow the same rule: **public-only in the global index**; member/private events only in scoped indexes with API post-filter.

---

### Event detail authorization (Pass 2A.2)

`GET /api/v1/events/:eventId` is **permission-gated** via `canViewerSeeEventDetail` (`packages/api/src/lib/event-access.ts`). **UUID possession is not authorization** — unauthorized viewers receive **404 Not found** (no existence leak).

Access is granted when at least one applies:

- Event `visibility = public` (group-scoped events still pass `canViewerSeeGroupEvent`)
- Viewer is the event host
- Viewer is a group member (private group-scoped events) or org member (private org-scoped events)
- Viewer has org moderator+ staff access (`viewerCanPatchEvent`)
- Viewer has any RSVP row on the event (preserves saved/agenda flows)
- Blocked-host pair denies access even for public events

Future Typesense (or any external index) result links **must still pass** this API detail gate — indexed IDs alone are not sufficient.

Tracked follow-ups (not alpha-blocking): blocked-host filtering on global lists; `?organizationId=` cleanup on global events route.

---

## Appendix B — Pass 2B implementation (Education first)

**Status:** Implemented — see [`docs/SEARCH_TYPESENSE.md`](./SEARCH_TYPESENSE.md).

1. ~~Fix `GET /api/v1/events` global list to SQL-filter `visibility = public`~~ **Done (Pass 2A.1).**
1b. ~~Harden `GET /api/v1/events/:eventId` — UUID is not authorization~~ **Done (Pass 2A.2).**
2. ~~Add `packages/api/src/lib/search/` with Typesense client factory~~ **Done.**
3. ~~BullMQ queue `c2k-search-sync` — education upsert/delete~~ **Done.**
4. ~~`GET /api/v1/education/articles` Typesense → hydrate → visibility filter; DB fallback~~ **Done.**
5. ~~`docker-compose.search.yml` optional profile~~ **Done.**
6. Privacy rules + unit tests for education index gates — **Done** (CONNECTIONS/MEMBERS excluded from index).
7. Docs: `SEARCH_TYPESENSE.md`, `.env.example` — **Done.**

**Not in Pass 2B:** Explore/People/Groups/Events search; non-education indexes.
