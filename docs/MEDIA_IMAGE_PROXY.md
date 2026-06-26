# imgproxy image delivery (Pass 3A)

Optional image transformation layer for C2K. **Disabled by default.** When off, the API returns the same URLs as before.

## What imgproxy does

imgproxy fetches a **source image from an allowlisted storage host**, resizes/crops it server-side, and serves a signed WebP variant. The API signs URLs; the browser never sees `IMGPROXY_KEY` or `IMGPROXY_SALT`.

This pass does **not** change uploads, S3 keys, moderation, quarantine, or the auth-gated media proxy (`GET /api/v1/media/assets/:id/content`).

## Architecture

| Layer | Responsibility |
|-------|----------------|
| `packages/api/src/lib/imgproxy.ts` | Config, host allowlist, HMAC signing |
| `packages/api/src/lib/image-delivery.ts` | Named variant registry + `deliverImageUrl()` |
| API route serializers | Apply delivery helpers **at read time** only |
| Web | Consumes URLs from API unchanged (`mediaDisplayUrl` still prefixes relative paths) |

**Rule:** The API decides which source URL is safe to transform. The browser must not build signed imgproxy URLs from private paths.

### Allowed sources

- Public object URLs on configured storage hosts (`S3_PUBLIC_BASE_URL`, `S3_ENDPOINT`)
- Root-relative public seed paths (`/api/public-seed/…`) resolved via `IMGPROXY_SOURCE_BASE_URL` / `API_PUBLIC_URL`

### Never proxied through imgproxy

- `/api/v1/media/assets/:id/content` (auth-gated; imgproxy cannot impersonate viewers)
- Arbitrary external URLs (Etsy, Dicebear, user-supplied https)
- Quarantined or invisible media (no URL is issued before delivery helpers run)

## Environment variables

All disabled by default:

```env
IMGPROXY_ENABLED=false
IMGPROXY_BASE_URL=
IMGPROXY_KEY=
IMGPROXY_SALT=
IMGPROXY_USE_HTTPS=true
IMGPROXY_DEFAULT_QUALITY=82
IMGPROXY_MAX_WIDTH=2400
IMGPROXY_ALLOW_UNSIGNED=false
IMGPROXY_SOURCE_BASE_URL=
IMGPROXY_FALLBACK_TO_ORIGINAL=true
```

| Variable | Notes |
|----------|-------|
| `IMGPROXY_ENABLED` | Master switch |
| `IMGPROXY_BASE_URL` | Public base of imgproxy (e.g. `http://127.0.0.1:8080`) |
| `IMGPROXY_KEY` / `IMGPROXY_SALT` | Hex strings for HMAC signing |
| `IMGPROXY_ALLOW_UNSIGNED` | Local dev only (`/insecure/…` paths). **Never in production.** |
| `IMGPROXY_SOURCE_BASE_URL` | Absolute base for resolving `/api/public-seed/…` sources |
| `IMGPROXY_FALLBACK_TO_ORIGINAL` | When true (default), ineligible sources keep the original URL |

If `IMGPROXY_ENABLED=true` but key/salt are missing and unsigned mode is off, imgproxy is treated as **off** and the API logs a startup warning.

## Variant registry

Defined in `image-delivery.ts` — do not scatter processing strings in components.

| Variant | Use |
|---------|-----|
| `avatar_sm` | 64×64 crop — stacks, feed author |
| `avatar_md` | 128×128 crop |
| `avatar_lg` | 256×256 crop — logos |
| `card_sm` | 320w |
| `card_md` | 640w — list cards |
| `card_lg` | 960w — banners |
| `feed_image` | 1200w max — feed attachments |
| `profile_hero` | 1440w max — profile photos |
| `gallery_thumb` | 320×320 crop |
| `media_preview` | 720w |
| `blur_preview` | 32w + blur — blurred media previews (public sources only) |

## Surfaces wired (Pass 3A)

- Profile photos (`profile-photos.ts`) — `profile_hero`
- Feed media attachments (`media-social-service`, `feed-media-attachments`) — `feed_image` / `blur_preview`
- Feed following author avatars — `avatar_sm`
- Vendor list/detail DTOs — logo/banner variants
- Organization map — logo/banner/share
- Group list — cover + member avatar stacks
- Event list/detail — `card_md` on `imageUrl`
- Trending rank cards — `card_md`
- Vendor spotlight listings — logo + listing image
- Connection RSVP preview avatars — `avatar_sm`

Not wired yet: full media library grid variants, education article heroes, convention heroes, denormalized `profiles.avatarUrl` on every profile read (stored URL unchanged; targeted serializers apply variants).

## Local Docker (optional)

```bash
docker compose -f docker-compose.dev.yml -f docker-compose.media.yml up -d imgproxy
```

Generate local key/salt:

```bash
# key and salt must be hex
openssl rand -hex 32   # IMGPROXY_KEY
openssl rand -hex 32   # IMGPROXY_SALT
```

Example API env (with MinIO from `docker-compose.dev.yml`):

```env
IMGPROXY_ENABLED=true
IMGPROXY_BASE_URL=http://127.0.0.1:8080
IMGPROXY_KEY=<hex>
IMGPROXY_SALT=<hex>
S3_PUBLIC_BASE_URL=http://127.0.0.1:9000/c2k-uploads
IMGPROXY_SOURCE_BASE_URL=http://127.0.0.1:3001
```

imgproxy must reach your public object URLs (MinIO on loopback is fine for local dev).

## Production deployment

1. Run imgproxy behind HTTPS on an internal or CDN edge URL.
2. Set `IMGPROXY_KEY` and `IMGPROXY_SALT` to match the imgproxy container.
3. Keep `IMGPROXY_ALLOW_UNSIGNED=false`.
4. Ensure imgproxy can fetch `S3_PUBLIC_BASE_URL` (VPC endpoint or public bucket policy as designed).
5. Do **not** expose imgproxy as an open `/image?url=` proxy — only signed paths from the API.

## Privacy rules

1. Visibility gates run **before** `deliverImageUrl()` — quarantined/private media never gets a variant URL.
2. Auth proxy paths are never passed to imgproxy (prevents SSRF and auth bypass).
3. Only allowlisted storage hosts — no arbitrary user-supplied URLs.
4. Blur behavior preserved: blurred items still use proxy paths when imgproxy cannot transform; `blur_preview` applies only to eligible public sources.
5. Secrets stay server-side only.

## Rollback

Set `IMGPROXY_ENABLED=false` (or unset). No migration required. Upload and storage behavior unchanged.

## Follow-up

| Pass | Scope |
|------|-------|
| **3B tusd** | Resumable uploads; no imgproxy change required |
| **3C FFmpeg** | Video transcoding; poster frames may use `media_preview` variant |
| **3A+** | Media library thumbs, education/convention heroes, centralized `resolveAvatarUrl()` on profile reads |

See also: `docs/DISCOVERY_SEARCH_SPIKE.md` (search indexing is separate from image delivery).
