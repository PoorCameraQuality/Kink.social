# Typesense search foundation (Pass 2B)

Sitewide search architecture for kink.social. **Only the Education hub index is enabled** in this pass; other indexes are registered but not wired.

## Principles

- Typesense is a **second copy of data** — index only fields safe to store and only documents that pass privacy gates.
- The **API remains the gatekeeper**: hydrate IDs from Postgres and run existing visibility filters (`viewerCanReadEducationArticle`, blocks, etc.).
- **Database search is always the fallback** when Typesense is disabled, unreachable, or returns errors.
- **No client-side Typesense keys** — search runs server-side only.

## Environment

Add to `.env.local` / API worker env (all default safe):

```env
SEARCH_PROVIDER=database          # database | typesense
SEARCH_INDEXING_ENABLED=false
SEARCH_QUERY_ENABLED=false
SEARCH_ADMIN_REINDEX_ENABLED=false
SEARCH_HOST=                      # e.g. http://127.0.0.1:8108
SEARCH_API_KEY=                   # admin — server/worker only
SEARCH_READ_API_KEY=              # search-only — server only (falls back to admin key)
SEARCH_INDEX_PREFIX=c2k
SEARCH_ENVIRONMENT=development
SEARCH_SYNC_BATCH_SIZE=100
C2K_SEARCH_SYNC_INLINE=false      # true = sync without Redis queue (local dev)
```

Enable **Education only**:

```env
SEARCH_PROVIDER=typesense
SEARCH_HOST=http://127.0.0.1:8108
SEARCH_API_KEY=dev-admin-key
SEARCH_READ_API_KEY=dev-search-key
SEARCH_INDEXING_ENABLED=true
SEARCH_QUERY_ENABLED=true
SEARCH_INDEX_PREFIX=c2k_dev
```

## Local Typesense (optional)

Typesense is **not** started by default dev compose. Optional overlay:

```bash
docker compose -f docker-compose.dev.yml -f docker-compose.search.yml --profile search up -d
```

Generate keys in Typesense dashboard or use dev keys from `docker-compose.search.yml` comments.

## Architecture

| Path | Role |
|------|------|
| `packages/api/src/lib/search/config.ts` | Env-gated provider config |
| `packages/api/src/lib/search/index-registry.ts` | Sitewide index definitions |
| `packages/api/src/lib/search/typesense-client.ts` | Admin + read clients |
| `packages/api/src/lib/search/document-schema.ts` | Shared document conventions |
| `packages/api/src/lib/search/education/*` | Education schema, sync, query |
| `packages/api/src/lib/search/search-sync-queue.ts` | BullMQ `c2k-search-sync` |
| `packages/api/src/lib/search/health.ts` | `/api/health/search` diagnostic |

### Index registry (rollout)

| Index key | Phase | Enabled Pass 2B |
|-----------|-------|-----------------|
| `education_articles` | 1 | **Yes** |
| `organizations_public` | 2 | No |
| `vendors_public` | 2 | No |
| `events_public` | 3 | No |
| `groups_public` | 5 | No |
| `people_discoverable` | 6 | No |
| `explore_federated` | 4 | No |

### Education privacy rules

Indexed **only** when all are true:

- `listInEducation = true`
- `publicationStatus = PUBLISHED`
- `visibility = PUBLIC`

**Never indexed:** body HTML, drafts, archived, CONNECTIONS/MEMBERS visibility, non-hub articles.

### Query path

`GET /api/v1/education/articles`:

1. If `SEARCH_QUERY_ENABLED` + Typesense healthy → search IDs → hydrate rows → `filterVisibleArticles`
2. Else → existing Drizzle ILIKE list (unchanged behavior)

### Sync path

After article create/update/archive:

- Enqueue `c2k-search-sync` job (`upsert-education-article` / `delete-education-article`)
- Worker: `npm run start:worker -w @c2k/api`
- Inline fallback: `C2K_SEARCH_SYNC_INLINE=true`

### Reindex

```bash
SEARCH_ADMIN_REINDEX_ENABLED=true SEARCH_INDEXING_ENABLED=true npm run search:reindex-education -w @c2k/api
```

## Health

```bash
curl http://127.0.0.1:3001/api/health/search
```

Returns provider flags, Typesense ping, per-index rollout/query state.

## Deferred (Phase 2+)

- Organizations, vendors, public events indexes
- Explore federated `multi_search`
- Groups and People (highest privacy risk)
- Feed/post search
- Typesense in production compose until operator cutover

## Related docs

- [`docs/DISCOVERY_SEARCH_SPIKE.md`](./DISCOVERY_SEARCH_SPIKE.md) — engine choice and staged rollout
- [`docs/FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) — routes unchanged except education list backend

## Do not

- Expose `SEARCH_*_API_KEY` to the web client
- Index DMs, moderation, RSVP rosters, or member-only content
- Replace Explore / People / Groups / Events search in this pass
- Treat Typesense as the permission system
