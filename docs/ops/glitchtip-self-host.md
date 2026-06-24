# GlitchTip self-hosting (optional)

GlitchTip is open-source and accepts Sentry-compatible DSNs. Use it for **crash and failure tracking only** — not analytics, session replay, or private community data collection.

## Quick start (local / staging)

Optional compose overlay (not used in production compose):

```bash
docker compose -f docker-compose.observability.yml up -d
```

Default UI: http://127.0.0.1:8080 (first-run setup wizard).

## Projects

Create separate GlitchTip projects (or environments) for:

| Project | DSN used by |
|---------|-------------|
| `c2k-api` | `packages/api` (`ERROR_TRACKING_DSN`) |
| `c2k-worker` | `packages/api` worker process (same DSN or separate) |
| `c2k-web` | `packages/web` (`VITE_ERROR_TRACKING_DSN` at build time) |

Using one DSN for API + worker is fine for alpha; split later if you want queue-tagged worker noise isolated.

## Environment wiring

**API + worker** (`.env.production` on VPS):

```env
ERROR_TRACKING_ENABLED=true
ERROR_TRACKING_DSN=https://<key>@glitchtip.example.com/<project-id>
ERROR_TRACKING_ENVIRONMENT=production
RELEASE_VERSION=2026-06-23
ERROR_TRACKING_TRACES_SAMPLE_RATE=0
WORKER_HEARTBEAT_ENABLED=true
```

**Web build** (Docker build args or CI):

```env
VITE_ERROR_TRACKING_ENABLED=true
VITE_ERROR_TRACKING_DSN=https://<key>@glitchtip.example.com/<web-project-id>
VITE_ERROR_TRACKING_ENVIRONMENT=production
VITE_RELEASE_VERSION=2026-06-23
VITE_ERROR_TRACKING_TRACES_SAMPLE_RATE=0
```

## Verify capture

1. Enable tracking + DSN on a **staging** stack
2. Set `ERROR_TRACKING_TEST_ENABLED=true`
3. In non-production: `curl -s http://127.0.0.1:3001/api/health/error-test` (expect 500, event in GlitchTip)
4. In production: also set `ERROR_TRACKING_TEST_SECRET` and pass header `X-Error-Tracking-Test-Secret`
5. Confirm the GlitchTip event has **no** cookies, tokens, DMs, or request bodies

## Privacy checklist

- [ ] DSN stored in secrets / env — not committed
- [ ] Session replay disabled (default in our SDK init)
- [ ] Traces sample rate `0` unless explicitly needed
- [ ] GlitchTip listed in legal vendor registry when enabled in prod
- [ ] Scrubber unit tests pass (`src/lib/observability.test.ts`)

## Rollback

Set `ERROR_TRACKING_ENABLED=false`, rebuild web without `VITE_ERROR_TRACKING_ENABLED`, restart API/worker. No DB migration required.
