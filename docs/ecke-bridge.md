# ECKE photo bridge runbook (Kink.social)

Operator guide for the **additive photo manifest bridge**: C2K persists publishable media on `ecke_publish_targets` / `ecke_publish_target_media`, and outbound ingest payloads may include an optional `photos` block when enabled.

Related: [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md), [`apply-ecke-photo-bridge-c2k.mjs`](../scripts/apply-ecke-photo-bridge-c2k.mjs), [`verify-ecke-ingest-with-media.mjs`](../scripts/verify-ecke-ingest-with-media.mjs).

---

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ECKE_PUBLISH_PHOTOS_ENABLED` | API + worker | `true` = build and send optional `photos` manifest on publish; `false`/unset = legacy `imageUrl` / `heroImageUrl` only |
| `ECKE_PUBLISH_ENABLED` | API + worker | Master gate for outbound ECKE writes |
| `ECKE_PUBLISH_ENDPOINT` | API + worker | EastCoast ingest HTTP endpoint (education article envelope POST) |
| `ECKE_PUBLISH_SECRET` | API + worker | Bearer token for ingest endpoint — **never commit** |
| `ECKE_PUBLISH_LISTING_WEBHOOK_URL` | API | Legacy listing webhook for group/convention/presenter thin listings |
| `ECKE_PUBLISH_WEBHOOK_SECRET` | API | Bearer for listing webhook (if configured) |
| `ECKE_SUPABASE_URL` | API + worker | EastCoast Supabase project URL (events/vendors/dungeons REST upsert path) |
| `ECKE_SUPABASE_SERVICE_ROLE_KEY` | API + worker | Service role for REST upserts — **never commit** |
| `DATABASE_URL` | backfill / migrations | C2K Postgres connection for schema apply and media backfill |

Photo bridge is **additive**: when `ECKE_PUBLISH_PHOTOS_ENABLED` is off, publish flows behave as before and consumers fall back to legacy hero fields via `resolveEckePayloadHeroUrl`.

---

## Photo eligibility (C2K publisher side)

Summarized from `packages/api/src/lib/ecke-photo-manifest.ts` and `media-pipeline.ts`:

1. **Flag gate** — `ECKE_PUBLISH_PHOTOS_ENABLED` must be true or manifests are empty.
2. **Media asset rows** — asset must pass `canExposePublicUrl`:
   - storage state is public-ready and has a resolvable public URL
   - visibility allows anonymous direct URL (not members-only / connections-only)
   - explicit content rating + visibility must allow public URL
3. **Hero resolution order** — explicit hero from `fallbackImageUrl` (parsed media asset id or external CDN URL), else first eligible gallery asset, else legacy external URL row (`ECKE_LEGACY_HERO_MEDIA_ASSET_ID`).
4. **Proxy URLs rejected** — heroes whose resolved URL starts with `/api/v1/media/` are dropped unless a gallery asset can substitute.
5. **Persisted rows** — only non-legacy assets with real `media_assets.id` are written to `ecke_publish_target_media`; legacy external-only heroes update `media_hash` but do not create FK rows.

Education articles use `heroImageUrl`; listings/events/vendors use `imageUrl` / `logoUrl` / avatar URLs mapped in the backfill resolver.

---

## Apply order (staging → production)

1. **C2K SQL** — apply publisher-side schema:
   ```bash
   npm run apply:ecke-photo-bridge-c2k
   # or: DATABASE_URL=... npm run apply:ecke-photo-bridge-c2k
   ```
   Source: `packages/api/sql-drafts/ecke_publish_target_media.sql` (`media_hash`, `media_manifest_version`, `ecke_publish_target_media` table).

2. **EastCoast Supabase migrations** — apply ECKE-side ingest columns / photo storage (EastCoast repo; see `ECKE_C2K_HOOKUP_MASTER.md` §4 / §7).

3. **Enable flag** — on API + worker after both sides ready:
   ```bash
   ECKE_PUBLISH_PHOTOS_ENABLED=true
   ```
   Restart API and worker.

4. **Smoke scripts**
   ```bash
   npm run verify:ecke-photo-bridge-contract
   npm run verify:ecke-ingest-with-media
   # VPS: ECKE_SMOKE_VIA=vps npm run verify:ecke-ingest-with-media
   ```

5. **Backfill existing published targets** (dry-run first):
   ```bash
   npm run backfill:ecke-publish-media
   ECKE_PUBLISH_PHOTOS_ENABLED=true DATABASE_URL=... npm run backfill:ecke-publish-media -- --apply
   ```

New publishes sync media automatically via `syncEckePublishTargetMedia` in the publish executor.

---

## Backfill command

| Command | Effect |
|---------|--------|
| `npm run backfill:ecke-publish-media` | Dry-run: scans `ecke_publish_targets` with `status IN ('published','stale')` and `last_published_at` set; reports targets missing media rows or stale `media_hash` |
| `npm run backfill:ecke-publish-media -- --apply` | Mutates: rebuilds manifest via `loadPublishableTargetMediaManifest` and calls `syncEckePublishTargetMedia` |

Implementation: `scripts/backfill-ecke-publish-target-media.ts` → `packages/api/src/lib/ecke-publish-target-media-backfill.ts`.

Requires `ECKE_PUBLISH_PHOTOS_ENABLED=true` for non-empty manifests. Supports `DATABASE_URL` (defaults to local dev pool when unset).

Summary fields: `scanned`, `updated`, `skipped`, `errors`.

---

## Rollback

1. Set `ECKE_PUBLISH_PHOTOS_ENABLED=false` on API + worker and restart.
2. Outbound payloads omit `photos`; EastCoast dual-read falls back to legacy `imageUrl` / `heroImageUrl` via `resolveEckePayloadHeroUrl`.
3. C2K `ecke_publish_target_media` rows remain but are unused while the flag is off — safe to leave in place.
4. To stop all outbound writes: `ECKE_PUBLISH_ENABLED=false` (see [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md)).

Do **not** drop `ecke_publish_target_media` in production unless reversing the entire photo bridge migration.
