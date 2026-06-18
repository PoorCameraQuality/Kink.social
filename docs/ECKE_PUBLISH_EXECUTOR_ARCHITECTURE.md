# kink.social ECKE publish executor architecture (Pass 2 notes)

**Status:** Planning only — not implemented in Pass 2  
**Contract:** [`ECKE_PUBLIC_PUBLISHING_CONTRACT.md`](./ECKE_PUBLIC_PUBLISHING_CONTRACT.md)

---

## Current state

| Component | Path |
|-----------|------|
| Queue | `packages/api/src/lib/ecke-publish-queue.ts` — `c2k-ecke-publish` |
| Worker | `packages/api/src/worker.ts` |
| Executors | `packages/api/src/lib/ecke-publish-executor.ts` |
| Row builders | `packages/api/src/lib/ecke-directory-sync.ts` |
| Transport (interim) | `packages/api/src/lib/ecke-publish-client.ts` — Supabase REST Option B |
| Eligibility | `packages/shared/src/seo-policy.ts` — `isEckePublishEligible` |
| Sanitization | `sanitizeEckePublicText`, `eckePayloadContainsPrivateAppUrls` |
| Status rows | `ecke_publish_targets` |
| Owner UI | `EckeEntityPublishStatus.tsx` (articles, vendors, org integrations tab) |

### Jobs today

| Job name | Entity | Opt-in |
|----------|--------|--------|
| `publish-article` | education_article | `education_articles.ecke_publish` |
| `publish-vendor` | vendor | `vendor_profiles.ecke_publish` |
| `publish-convention-event` | convention | organizer Publish |
| (inline) | place/dungeon | org publish + dungeon flag |
| webhook | org/group listing | publish UI |

---

## Target architecture (Pass 3+)

### Single generic job

```ts
// ecke-publish-queue.ts
enqueueOrInline('publish-entity', { entityType, sourceId, userId }, `ecke:${entityType}:${sourceId}`)
```

### Shared module: `ecke-public-publish.ts` (planned)

```ts
export function isEntityEckePublishEligible(
  entityType: EckePublicEntityType,
  entity: unknown,
): boolean

export function redactForEcke(
  entityType: EckePublicEntityType,
  entity: unknown,
): unknown

export function buildEckePublicEnvelope(
  entityType: EckePublicEntityType,
  entity: unknown,
): KinkSocialPublicIngestEnvelope

export async function executeEckePublishEntity(
  entityType: EckePublicEntityType,
  sourceId: string,
  userId?: string,
): Promise<EckePublishResult>
```

`executeEckePublishEntity` flow:

1. Load entity + related public-safe joins
2. `isEntityEckePublishEligible` — **must read real visibility fields**
3. `redactForEcke` — strip deny-list fields per entity type
4. `buildEckePublicEnvelope` — map to contract payload
5. Upsert `ecke_publish_targets` (stale/published tracking)
6. **Option A:** POST envelope to `ECKE_PUBLISH_ENDPOINT`
7. **Option B (legacy):** `publish*RowToEcke` until entity migrated
8. `markEntityOutcome` — store `external_url` when API returns `eckePublicUrl`

### Opt-in fields needed (gaps)

| Entity | Has `ecke_publish`? | Visibility field |
|--------|---------------------|------------------|
| education_article | ✓ | `visibility`, `publication_status` |
| vendor | ✓ | `visibility` |
| convention | explicit publish | listing visibility in settings |
| place (org) | via org publish | `organizations.visibility` |
| event (standalone) | **needs field or convention-only** | `events.visibility` |
| presenter | **needs `ecke_publish`** | `directory_visibility` |
| organization | publish UI | `visibility` |
| education_path | **needs `ecke_publish`** | series visibility TBD |

### `ecke_publish_targets` extensions (planned migration)

- `external_url` — ECKE public URL returned from ingest API
- `entity_type` — mirror envelope (optional; infer from `target_kind` today)

---

## Entity → handler registry (planned)

```ts
const ENTITY_PUBLISH_REGISTRY: Record<EckePublicEntityType, {
  load: (id: string) => Promise<unknown>
  eligible: (e: unknown) => boolean
  redact: (e: unknown) => unknown
  envelope: (e: unknown) => KinkSocialPublicIngestEnvelope
  targetKind: EckePublishTargetKind
  scopeType: EckePublishScopeType
  phase: number
}> = { ... }
```

Skip entities where `phase > CURRENT_ECKE_PUBLISH_PHASE` env.

---

## Retry policy (planned)

| HTTP / error | Action |
|--------------|--------|
| 400, 403, 409 | Mark `error`, no retry |
| 401 | Mark `error`, alert ops (secret mismatch) |
| 429, 5xx | BullMQ retry, max 5, exponential backoff |
| Ineligible after success | Send `unpublish` action |

---

## Pass 3 implementation order

1. Fix education article visibility bug
2. Add `ecke-public-publish.ts` with article handler only
3. ECKE `POST /api/kink-social/ingest` + article branch
4. Switch article transport Option B → A
5. Add `KinkSocialSourceCta` on ECKE education pages
6. Phase 2: event handler + CTA on event pages
7. Continue per rollout table in main contract §11
