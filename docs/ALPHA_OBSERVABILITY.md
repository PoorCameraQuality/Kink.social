# Alpha ops observability (Pass 1)

Production-grade visibility into app health, crashes, workers, and uptime. This is **ops safety** — not product analytics. Error tracking captures crashes and failures only; it must never become another channel for private community data.

## Health endpoints

| Route | Purpose |
|-------|---------|
| `GET /api/health` | Liveness — process up |
| `GET /api/health/live` | Liveness alias (orchestrator-friendly) |
| `GET /api/health/ready` | Readiness — DB + prod dependency TCP checks |
| `GET /api/health/mail` | Mail **config** diagnostic (no send, no SMTP probe) |
| `GET /api/health/storage` | S3 **HeadBucket** (non-destructive) |
| `GET /api/health/ecke` | ECKE bridge **config only** (no publish/ingest) |
| `GET /api/health/worker` | Worker Redis heartbeat freshness |
| `GET /health.json` (web) | Static web shell health |

### Readiness semantics

- DB failure → **503** with `code: db_ping_failed`
- Redis / ClamAV / S3 TCP failures → **200** with `ok: false` by default
- Set `HEALTH_STRICT_READINESS=true` to return **503** when any dependency is `error`

### Worker heartbeat

When `WORKER_HEARTBEAT_ENABLED=true`, the worker writes `c2k:worker:heartbeat` to Redis every 30s (90s TTL). Value: `{ ts, pid }` only.

`GET /api/health/worker` returns:

- `worker: skipped` when heartbeat disabled (default)
- `worker: ok` when heartbeat is fresh
- `worker: stale` / `missing` when enabled but worker is down

## Error tracking (GlitchTip / Sentry-compatible)

Uses `@sentry/node` (API + worker) and `@sentry/react` (web). GlitchTip accepts standard Sentry DSNs.

**Disabled by default.** Enable only when a DSN is configured.

| Variable | Surface | Default |
|----------|---------|---------|
| `ERROR_TRACKING_ENABLED` | API, worker | `false` |
| `ERROR_TRACKING_DSN` or `SENTRY_DSN` | API, worker | unset |
| `ERROR_TRACKING_ENVIRONMENT` | API, worker | `NODE_ENV` |
| `RELEASE_VERSION` | API, worker | unset |
| `ERROR_TRACKING_TRACES_SAMPLE_RATE` | API, worker | `0` |
| `VITE_ERROR_TRACKING_ENABLED` | Web build | `false` |
| `VITE_ERROR_TRACKING_DSN` or `VITE_SENTRY_DSN` | Web build | unset |
| `VITE_ERROR_TRACKING_ENVIRONMENT` | Web build | Vite mode |
| `VITE_RELEASE_VERSION` | Web build | unset |
| `VITE_ERROR_TRACKING_TRACES_SAMPLE_RATE` | Web build | `0` |

### Privacy scrubber

Before events leave the app:

- Request bodies are **never** sent
- Cookies stripped; auth headers redacted
- Sensitive URL prefixes (DMs, profile, moderation, upload, auth) get extra scrubbing
- Extra/context fields run through the same redaction patterns as API Pino logs
- **No session replay**
- **No performance tracing** unless `*_TRACES_SAMPLE_RATE` is explicitly raised

### Test error route

`GET /api/health/error-test` throws a scrubbed test error for GlitchTip verification.

**Protected:** requires `ERROR_TRACKING_TEST_ENABLED=true` **and**:

- non-production `NODE_ENV`, **or**
- `X-Error-Tracking-Test-Secret` header matching `ERROR_TRACKING_TEST_SECRET` in production

Otherwise returns **404**.

## Uptime Kuma monitors

See [`docs/ops/uptime-kuma-checks.md`](./ops/uptime-kuma-checks.md).

## Self-hosted GlitchTip

See [`docs/ops/glitchtip-self-host.md`](./ops/glitchtip-self-host.md).

Optional local overlay: `docker compose -f docker-compose.observability.yml up -d` (not wired into production compose).

## Validation

```bash
# Observability off (default)
npm run typecheck
npm run build
npm run test -w @c2k/api

# Health (local API)
curl -s http://127.0.0.1:3001/api/health/live
curl -s http://127.0.0.1:3001/api/health/ready
curl -s http://127.0.0.1:3001/api/health/mail
curl -s http://127.0.0.1:3001/api/health/storage
curl -s http://127.0.0.1:3001/api/health/ecke
curl -s http://127.0.0.1:3001/api/health/worker
curl -s http://127.0.0.1:5173/health.json

# E2E smoke
npm run test:e2e:smoke

Health endpoint coverage lives in `e2e/smoke.spec.ts` (not the default smoke script). Those API tests require the local Fastify API on **:3001** — either via `npm run dev` / Playwright `webServer`, or an already-running stack. Web-only checks such as `GET /health.json` work through Vite alone.
```

## Rollback

1. Set `ERROR_TRACKING_ENABLED=false` and omit `VITE_ERROR_TRACKING_ENABLED` at web build
2. Set `WORKER_HEARTBEAT_ENABLED=false`
3. Remove Uptime Kuma monitors for new endpoints if needed
4. Revert the Pass 1 commit if SDK causes boot issues

## Follow-ups (not Pass 1)

- SMTP TCP reachability probe
- Deploy workflow post-cutover health gate
- Authenticated S3 health in readiness (not just TCP)
- Bull Board or queue metrics dashboard
- Full APM (Grafana/Prometheus) — Tier 3 per strategic guidance
