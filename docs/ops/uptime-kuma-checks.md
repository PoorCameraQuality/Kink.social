# Uptime Kuma monitor checklist

Self-hosted [Uptime Kuma](https://github.com/louislam/uptime-kuma) monitors for kink.social alpha ops. These are **operator-configured** — not auto-provisioned by the app.

Optional local Uptime Kuma: `docker compose -f docker-compose.observability.yml up -d` → http://127.0.0.1:3002

## Recommended monitors

| Name | Type | URL / target | Expect | Notes |
|------|------|--------------|--------|-------|
| Web shell | HTTP(s) | `https://<domain>/` | 200 | Landing / SPA shell |
| Web health | HTTP(s) | `https://<domain>/health.json` | 200, JSON `ok: true` | Static health file |
| API liveness | HTTP(s) | `https://<domain>/api/health/live` | 200, `{ ok: true }` | Process up |
| API readiness | HTTP(s) | `https://<domain>/api/health/ready` | 200, `database: ok` | Use keyword or JSON query |
| Mail config | HTTP(s) | `https://<domain>/api/health/mail` | 200, `"ok":true` when SMTP on | Config only — not delivery proof |
| Storage | HTTP(s) | `https://<domain>/api/health/storage` | 200, `"s3":"ok"` when uploads on | HeadBucket check |
| ECKE bridge | HTTP(s) | `https://<domain>/api/health/ecke` | 200, `"ok":true` when ECKE enabled | Config only |
| Worker heartbeat | HTTP(s) | `https://<domain>/api/health/worker` | 200, `"worker":"ok"` | Requires `WORKER_HEARTBEAT_ENABLED=true` on worker |

## Strict readiness (optional)

If you set `HEALTH_STRICT_READINESS=true` on the API:

- Readiness returns **503** when Redis, S3 TCP, or ClamAV checks fail
- Point Uptime Kuma readiness monitor at status **200** only — alerts will fire on dependency outages

Default (flag off): readiness may return **200** with `ok: false` for degraded deps. Use JSON body keyword `"ready":true` instead of status code alone.

## Intervals

| Monitor | Suggested interval |
|---------|-------------------|
| Liveness / web | 60s |
| Readiness | 120s |
| Mail / storage / ECKE / worker | 300s |

## What these do **not** cover

- SMTP delivery (use `POST /api/v1/me/email/test-send` + Mailpit/mail logs manually)
- ECKE publish success (use `npm run smoke:ecke-bridge -w @c2k/api` locally)
- BullMQ queue depth (check worker logs or add Bull Board later)
- Full upload round-trip (use `scripts/vps/smoke-photo-bucket.mjs`)

See [`docs/ALPHA_OBSERVABILITY.md`](../ALPHA_OBSERVABILITY.md) for endpoint details.
