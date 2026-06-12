# Kink Social — controlled alpha deployment

Use this checklist when bringing up the **invite-only VPS alpha** at kink.social (or a staging domain).

See also: [DATA_INVENTORY_AND_RETENTION.md](./DATA_INVENTORY_AND_RETENTION.md), [VPS_SECURITY_HARDENING.md](./VPS_SECURITY_HARDENING.md), [LEGAL_REQUEST_AND_DATA_MINIMIZATION.md](./LEGAL_REQUEST_AND_DATA_MINIMIZATION.md).

## Required before inviting testers

| Item | Action |
|------|--------|
| Invite-only registration | Set `C2K_REGISTRATION_INVITE_CODE` to one shared code you distribute |
| SMTP + password reset | `C2K_MAIL_TRANSPORT=smtp`, valid `SMTP_*`, `C2K_MAIL_FROM`, `C2K_PUBLIC_WEB_URL`; verify `GET /api/health/mail` returns `ok: true` |
| Secrets | Strong `AUTH_SECRET`, `COOKIE_SECRET`, `C2K_FIELD_ENCRYPTION_KEY`, `EMAIL_LOOKUP_PEPPER`, `POSTGRES_PASSWORD`, `S3_*` — never commit `.env.production` |
| Email encryption | After migrate: `npm run db:migrate-user-emails -w @c2k/api` until batch returns 0 |
| Admin | After first account registers with invite, set `C2K_SITE_ADMIN_USER_IDS=<uuid>` for moderation; set **`C2K_SITE_OWNER_USER_IDS=<your-uuid>`** for owner-only sensitive reveal |
| Upload disables | Set all `C2K_ALPHA_DISABLE_*` flags listed in `.env.production.example` to `true` except profile photos |
| DNS + TLS | Point domain to VPS; Caddy terminates HTTPS (`DOMAIN=` in compose) |
| API exposure | **Do not** publish port 3001 publicly — only Caddy 80/443 |
| Backups | Encrypted off-server dumps: `scripts/backup-postgres.sh` — see `docs/VPS_SECURITY_HARDENING.md` |
| Abuse contact | Monitor `abuse@` / support inbox configured in legal pages |
| SEO | Add `noindex` on test host (web build meta or Caddy header) — no public marketing yet |

## Deploy sequence

```bash
cp .env.production.example .env.production
# edit secrets + alpha flags + invite code + SMTP

export NODE_ENV=production
set -a && source .env.production && set +a
npm ci
npm run db:migrate-prod

docker compose -f docker-compose.prod.yml up -d --build
curl -sf https://YOUR_DOMAIN/api/health/ready
curl -sf https://YOUR_DOMAIN/api/health/mail
```

## Verification (must pass before testers)

```bash
npm run verify:prelaunch
docker compose -f docker-compose.dev.yml up -d   # local gate host
npm run verify:alpha
npm run verify:trust-safety
npm run test:db -w @c2k/api
```

## Database wipe (test server only)

```bash
docker compose -f docker-compose.prod.yml down
docker volume rm c2k_pgdata_prod   # destroys all users/data
npm run db:migrate-prod
docker compose -f docker-compose.prod.yml up -d --build
# Re-create admin + redistribute invite code
```

## What testers CAN use

- Account signup (with invite code), login, logout, password reset
- Profiles, profile photo upload (quarantine → attestation → scan → promote)
- Messaging, connections, groups, orgs (text/content without disabled uploads)
- Events, conventions, organizer door tools (if seeded)
- Reporting and platform moderation (staff)

## What testers should NOT use (disabled server-side)

- Org/group banners and logos
- Feed inline images and rich-post image uploads
- Event cover photos
- Education hero / inline images
- Convention gallery, maps, hero, badge logo uploads
- Any upload expecting immediate public `url` from `/api/upload`

UI may still show disabled controls in places; API returns `403` with `code: alpha_upload_disabled`.

## SMTP DNS (production mail)

Configure SPF, DKIM, and DMARC for the domain used in `C2K_MAIL_FROM`. See `docs/PROD_SMTP_K8S_CHECKLIST.md`.

## Rollback

```bash
git checkout <previous-tag>
npm ci && npm run db:migrate-prod
docker compose -f docker-compose.prod.yml up -d --build
```
