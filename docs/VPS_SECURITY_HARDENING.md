# VPS security hardening (kink.social alpha)

Operator checklist for a single VPS running Docker Compose + Caddy. Adjust for your provider.

## 1. OS baseline

- Ubuntu 22.04/24.04 LTS (or equivalent)
- Enable unattended security updates: `apt install unattended-upgrades`
- Set timezone UTC; configure NTP
- Create non-root deploy user with sudo (no daily root login)

## 2. SSH

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

- Deploy only SSH public keys; disable password auth
- Optional: change SSH port (update UFW accordingly)
- Install fail2ban or CrowdSec for sshd

## 3. Firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # or your SSH port
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Do not expose publicly:**

- Postgres (5432)
- Redis (6379)
- API (3001)
- MinIO (9000) — dev only; production uses external S3

Verify: `ss -tlnp` shows only 22/80/443 on public interface.

## 4. Docker Compose network

- API, worker, Postgres, Redis on internal bridge network
- Only **Caddy** publishes 80/443
- Secrets in `.env.production` on host — mode `600`, owner deploy user
- Never commit `.env.production` or zip it into backups unencrypted

## 5. TLS / Caddy

- Automatic Let's Encrypt for `DOMAIN`
- Force HTTPS redirect
- HSTS header (see repo `Caddyfile`)
- `C2K_TRUST_PROXY=true` so API rate limits use real client IP from Caddy

## 6. Application secrets

Generate unique random values for:

- `AUTH_SECRET`, `COOKIE_SECRET`
- `C2K_FIELD_ENCRYPTION_KEY`, `EMAIL_LOOKUP_PEPPER`
- `EXTERNAL_STORE_SECRET`
- `SMTP_PASS`, `S3_SECRET_KEY`
- `C2K_REGISTRATION_INVITE_CODE`

Rotate any secret that appeared in chat logs, tickets, or git history.

## 7. Database

- Strong unique Postgres password
- App connects as non-superuser role
- No public `5432` bind
- Run migrations before traffic: `npm run db:migrate-incremental -w @c2k/api`

## 8. Backups

```bash
# On VPS or CI with DATABASE_URL + age public key
BACKUP_ENCRYPTION_PUBLIC_KEY=age1... DATABASE_URL=... ./scripts/backup-postgres.sh
```

- Store encrypted dumps **off-server** (separate bucket/account)
- Backup encryption key **not** on same VPS as data if avoidable
- Retention: 7–30 days for alpha (`BACKUP_SNAPSHOT_RETENTION_DAYS`)
- **Quarterly restore test** to empty database

## 9. Monitoring and incident response

- Disk, CPU, RAM alerts (provider or Uptime Kuma)
- Log rotation on host (`logrotate`)
- Document abuse contact inbox and on-call
- Incident checklist: isolate (block traffic), preserve logs, rotate leaked secrets, notify users if breach

## 10. Alpha-specific

- `C2K_REGISTRATION_INVITE_CODE` set; no open registration
- Upload disable flags enabled (see `docs/ALPHA_DEPLOYMENT.md`)
- `noindex` on test domain until public launch
- SMTP SPF/DKIM/DMARC configured for mail domain

## Verify after deploy

```bash
curl -sS https://yourdomain.com/api/health/ready
curl -sS https://yourdomain.com/api/health/mail
# API port must NOT be reachable from internet:
nc -zv yourdomain.com 3001   # expect failure/timeout
```
