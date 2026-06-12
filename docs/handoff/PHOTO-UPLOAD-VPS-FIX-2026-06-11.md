# Photo upload VPS fix — incident record (2026-06-11)

**Status:** Resolved on production (`https://kink.social`)  
**Reporter:** Brax — uploads hung forever; profile gallery empty after failed attempts  
**Environment:** VPS `2.25.196.84`, 2 CPU cores, Docker stack at `/opt/c2k`  
**Related:** [`PHOTO-UPLOAD-SYSTEM-HANDOFF.md`](./PHOTO-UPLOAD-SYSTEM-HANDOFF.md), [`PROFILE-EDIT-2026-06-11.md`](./PROFILE-EDIT-2026-06-11.md)

---

## Executive summary

Profile photo uploads on production **appeared** to be a client/browser problem (timeouts, spinner forever, empty gallery). Investigation showed the real bottleneck was **server-side image processing** on a small VPS:

1. **`media-sanitize.ts`** re-encoded full-resolution camera photos with **mozjpeg**, which could take **60–180+ seconds** on 2 cores.
2. Browsers and older client timeouts gave up first → `ECONNRESET` / `aborted` in API logs while the server was still working.
3. **`profile-photos.ts`** used **delete-before-insert** when replacing the primary photo (`sortOrder === 0`). If attach failed after upload, the gallery could end up **empty**.
4. Many **`media_assets`** rows existed without matching **`profile_photos`** rows (orphan uploads from successful `POST /api/upload` + failed/timed-out `POST /api/profile/me/photos`).

Fix: downscale before re-encode, disable mozjpeg, insert-then-delete for primary photo, extend client timeouts, deploy API + web together, verify with smoke scripts.

---

## Symptoms (what users saw)

| Symptom | Actual cause |
|---------|----------------|
| Upload spinner runs forever | Server still processing; client timed out or connection dropped |
| Nothing in Network tab “completing” | Request pending until abort; check **Pending** duration on `POST /api/upload` |
| Brax gallery empty | Primary row deleted before new attach succeeded; or attach never completed |
| `POST /api/upload` 200 but no gallery photo | Orphan quarantine upload — attach step missing or failed |
| Public profile unchanged | No `profile_photos` row linked to published `media_assets` |

**Not the root cause:** “Client-side only” — client timeouts were a *symptom* of slow server processing.

---

## Evidence collected

### API logs (before fix)

- `POST /api/upload` requests running **60–292+ seconds**
- Client disconnects: `ECONNRESET`, `aborted`
- Example: one `POST /api/profile/me/photos` took ~292s (inline ClamAV + Sharp on full-res)

### Database (Brax, before fix)

- **13+** `media_assets` with `source_surface = 'profile_gallery'`
- **0–1** `profile_photos` rows — most uploads never attached
- `/api/health/ready` was healthy (Postgres, Redis, ClamAV, S3 all OK)
- 1×1 PNG smoke uploads worked; real phone JPEGs hung

### Infrastructure (healthy throughout)

```
GET /api/health/ready → { ok: true, database, redis, clamav, s3: "ok" }
S3_ENDPOINT=http://minio:9000 (internal)
S3_PUBLIC_BASE_URL=https://kink.social/c2k-uploads
```

---

## Code changes (exact)

### 1. API — image sanitize (`packages/api/src/lib/media-sanitize.ts`)

**Problem:** Full camera resolution (e.g. 4032×3024) passed through Sharp with `mozjpeg: true` on every JPEG upload.

**Fix:**

- `MAX_SANITIZE_EDGE_PX = 2048` — resize longest edge before re-encode (`fit: 'inside'`, `withoutEnlargement: true`)
- `limitInputPixels: 16_777_216` (4096×4096 guard)
- `sequentialRead: true` for lower memory on VPS
- JPEG: `quality: 85`, **`mozjpeg: false`** (plain libjpeg — comment documents why)
- EXIF strip + rotate preserved via `.rotate()` in pipeline

**Result:** 3000×2000 JPEG upload+attach on production dropped from minutes to **~150–400ms**.

### 2. API — primary photo attach order (`packages/api/src/routes/profile-photos.ts`)

**Problem:** When `sortOrder === 0`, old code deleted existing primary **before** inserting the new row. Failed attach → empty gallery.

**Fix:** Insert new `profile_photos` row first, then delete other rows with same `profileId` + `sortOrder === 0` **excluding** the new row (`ne(schema.profilePhotos.id, row.id)`).

**Also:** `syncProfileAvatarUrl(prof.id)` still runs after primary attach.

### 3. API — multipart upload (`packages/api/src/routes/upload.ts`)

**Change:** Parse multipart stream so **`purpose` field can arrive before `file`** (matches client FormData order). Still requires `purpose`; returns `upload_purpose_required` if missing.

### 4. Web — upload client (`packages/web/src/lib/profile-photo-upload.ts`)

- `UPLOAD_TIMEOUT_MS` / `ATTACH_TIMEOUT_MS`: **180_000** (was 90s / 120s)
- FormData order: **`purpose` before `file`**
- Shared by profile edit, gallery (`useProfilePhotos`), finish panel, onboarding

### 5. Web — profile edit UX (`packages/web/src/contexts/ProfileEditContext.tsx`)

- **`photoHydrateLockRef`:** prevents stale `profileMe` hydration from reverting preview immediately after successful upload
- ZIP upload path: auto-select `placeId` when lookup returns exact match
- Removed invalid `setTagHits([])` call (runtime crash risk)

### 6. Web — feed composer (`packages/web/src/components/home/HomeFeedRichComposer.tsx`)

- Uses shared upload helper with explicit `feed_image` / `feed_audio` purpose (alpha may still block feed images server-side)

---

## Production deployment (what we ran)

**Server:** `root@2.25.196.84`  
**Deploy root:** `/opt/c2k` (not a git clone — SFTP changed files + Docker rebuild)  
**Compose:**

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production
```

**Automated script (repo):** `scripts/_deploy-photo-fixes.mjs`

1. SFTP these files to `/opt/c2k/`:
   - `packages/api/src/lib/media-sanitize.ts`
   - `packages/api/src/routes/profile-photos.ts`
   - `packages/api/src/routes/upload.ts`
   - `packages/web/src/lib/profile-photo-upload.ts`
   - `packages/web/src/contexts/ProfileEditContext.tsx`
   - `packages/web/src/components/home/HomeFeedRichComposer.tsx`
2. `docker compose ... build api web`
3. `docker compose ... up -d api web`
4. Wait ~20s for API ready; users **hard-refresh** (`Ctrl+Shift+R`)

**Env for script:** `SSH_PASS` or pass password as argv (do not commit credentials).

**Verified in running containers after deploy:**

```bash
# Web bundle (example from 2026-06-11 deploy)
docker exec c2k-web-1 grep -o 'index-[A-Za-z0-9]*\.js' /usr/share/nginx/html/index.html
# → index-BtQt7hs7.js

# API sanitize constants
docker exec c2k-api-1 grep MAX_SANITIZE /app/packages/api/dist/lib/media-sanitize.js
# → MAX_SANITIZE_EDGE_PX = 2048
```

---

## Verification checklist

Run from dev machine (repo root):

```bash
# 1. Health
curl -s https://kink.social/api/health/ready

# 2. End-to-end photo pipeline (login + upload + attach + public URL HEAD)
node scripts/vps/smoke-photo-bucket.mjs

# 3. Profile edit API smoke (includes minimal PNG upload)
node scripts/vps/smoke-profile-edit.mjs
```

**Manual (browser):**

1. Hard refresh `https://kink.social`
2. Log in → Profile edit or Media tab → upload a **real phone JPEG**
3. DevTools → Network:
   - `POST /api/upload` → **200** in seconds (not minutes)
   - `POST /api/profile/me/photos` → **201**
4. `GET /api/profile/me/photos` → photo in array
5. Public profile `/profile/{username}` → photo visible (if `AUTO_APPROVED` / published lane)

**Large synthetic test (Node, optional):**

```bash
node --input-type=module -e "
import sharp from 'sharp';
// build 3000x2000 JPEG, POST /api/upload + /api/profile/me/photos — expect <5s total
"
```

---

## Diagnostics if it breaks again

### 1. Split upload vs attach

| Request | If it fails |
|---------|-------------|
| `POST /api/upload` | Sanitize, ClamAV, MinIO, body size (10MB limit), mime validation |
| `POST /api/profile/me/photos` | Attestation, inline scan, DB, primary-photo logic |

### 2. API logs

```bash
docker logs c2k-api-1 --since 1h 2>&1 | grep -iE 'upload|profile/me/photos|aborted|ECONNRESET'
```

Long `POST /api/upload` without response → **sanitize or ClamAV** on VPS CPU.

### 3. DB — orphan uploads vs gallery

```bash
node scripts/vps/query-brax-photos.mjs
# Or general SQL via scripts/vps/_ssh.mjs + psql:
# media_assets LEFT JOIN profile_photos — profile_photo_id NULL = orphan
```

### 4. Confirm fix is deployed

- Web: new `index-*.js` hash in `index.html`
- API: `MAX_SANITIZE_EDGE_PX = 2048` and `mozjpeg: false` in compiled `media-sanitize.js`

### 5. Common non-bugs

- **HEIC / HEIF** from iPhone — not in allowed mime list; user must use JPEG/PNG/WebP/GIF
- **Stale JS cache** — old bundle still has 90s timeout; hard refresh
- **`feed_image` disabled in alpha** — feed composer separate from profile photos

---

## End-to-end flow (after fix)

```
Browser picks File
  → POST /api/upload  (purpose=profile_photo, then file)
      → validate mime/size
      → sanitizeImageBuffer (resize ≤2048px, strip EXIF, re-encode)
      → ClamAV scan
      → S3 quarantine/{userId}/{uuid}.ext
      ← { quarantineKey, sha256, mimeType, sizeBytes, width, height }

  → POST /api/profile/me/photos  (JSON: quarantineKey + metadata, sortOrder)
      → createMediaAssetForProfilePhoto
      → autoPublishProfileGalleryPhoto (inline scan if needed)
      → INSERT profile_photos
      → [if sortOrder=0] DELETE other primary rows (not new id)
      → syncProfileAvatarUrl
      ← { photo: { url, uploadStatus, ... } }

  → GET /api/profile/me/photos (gallery UI refresh)
```

---

## Tuning knobs (if VPS still slow)

| Knob | Location | Default | Notes |
|------|----------|---------|-------|
| Max edge px | `media-sanitize.ts` `MAX_SANITIZE_EDGE_PX` | 2048 | Try 1536 if still slow |
| JPEG quality | same file | 85 | Lower = faster/smaller |
| mozjpeg | same file | **false** | Do not re-enable on 2-core VPS without benchmarking |
| Upload body limit | `upload.ts` multipart | 10MB | |
| Client timeout | `profile-photo-upload.ts` | 180s | Safety net, not primary fix |
| Caddy reverse_proxy timeouts | Caddyfile | check if large bodies stall at proxy |

**Do not** move inline ClamAV/scan to “fix uploads” without a worker design — fix sanitize first; scans on downscaled images are much faster.

---

## Files touched (complete list)

| File | Role |
|------|------|
| `packages/api/src/lib/media-sanitize.ts` | **Primary fix** — resize + no mozjpeg |
| `packages/api/src/routes/profile-photos.ts` | Insert-then-delete primary photo |
| `packages/api/src/routes/upload.ts` | Multipart purpose-before-file |
| `packages/web/src/lib/profile-photo-upload.ts` | Timeouts + FormData order |
| `packages/web/src/contexts/ProfileEditContext.tsx` | Preview hydrate lock, ZIP/location fixes |
| `packages/web/src/components/home/HomeFeedRichComposer.tsx` | Feed upload purpose |
| `scripts/_deploy-photo-fixes.mjs` | One-shot VPS deploy helper |
| `scripts/vps/smoke-photo-bucket.mjs` | Production smoke |
| `scripts/vps/query-brax-photos.mjs` | DB diagnostic |

---

## Outcome (2026-06-11)

After full API + web deploy:

- `POST /api/upload` (3000×2000 JPEG): **~149ms**
- `POST /api/profile/me/photos`: **~245ms**
- Brax gallery: **1 photo**, public profile shows URL under `/c2k-uploads/media/...`
- No new `aborted` / `ECONNRESET` in logs for test uploads

Users with orphan `media_assets` from failed sessions need a **fresh upload** after deploy; old quarantine objects are not auto-linked to gallery.

---

## Git / merge note

Changes were developed and deployed to VPS via SFTP + Docker rebuild. **Commit to git** from local repo when ready so future deploys use normal CI/git pull rather than ad-hoc scripts.
