# Production mail — kink.social

Operator guide for outbound transactional mail, docker-mailserver, Roundcube webmail, admin mail intake, and optional web push.

## What exists in the repo


| Area                         | Location                                                        | Notes                                                                |
| ---------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Outbound mailer              | `packages/api/src/lib/mailer.ts`                                | `disabled` (default), `smtp`, `resend`                               |
| Mail config / startup guards | `packages/api/src/lib/mail-config.ts`                           | API + worker refuse prod boot if password reset enabled without mail |
| Password reset               | `packages/api/src/lib/password-reset.ts`, `routes/auth.ts`      | Hashed tokens, generic responses, no enumeration                     |
| Logged-in password change    | `POST /api/auth/password/change`                                | Requires session + current password; invalidates sessions            |
| Transactional templates      | `packages/api/src/lib/transactional-email.ts`                   | RSVP, welcome, org join, digests                                     |
| Worker mail jobs             | `packages/api/src/worker.ts`                                    | Org/pinned digests, participation offers, **mail intake IMAP sweep** |
| Contact forms                | `POST /api/v1/contact/intake`                                   | DB record + outbound email to correct mailbox                        |
| Mail intake (IMAP)           | `packages/api/src/lib/mail-intake-*.ts`                         | Disabled by default; imports to `mail_intake_items`                  |
| Admin mail UI                | `/moderation/mail-intake`                                       | Role-gated tabs: Support, Legal, Business, Abuse, Security           |
| Web push                     | `packages/api/src/lib/web-push-send.ts`, `public/sw-push.js`    | Off by default; generic payloads only                                |
| Local dev                    | `docker-compose.dev.yml` → Mailpit `127.0.0.1:1025`, UI `:8025` |                                                                      |
| Production VPS               | `docker-compose.prod.vps.yml` → docker-mailserver + Roundcube   |                                                                      |


## Local development (Mailpit)

```bash
docker compose -f docker-compose.dev.yml up -d mailpit
```

In `.env.development`:

```env
C2K_MAIL_TRANSPORT=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
C2K_MAIL_FROM="Kink.Social <noreply@localhost>"
C2K_PUBLIC_WEB_URL=http://127.0.0.1:5173
C2K_PASSWORD_RESET_ENABLED=true
```

Open Mailpit UI: [http://127.0.0.1:8025](http://127.0.0.1:8025)

Check config: `npm run mail:config-check -w @c2k/api`

## Production stack (VPS)

Compose overlay: `docker-compose.prod.yml` + `docker-compose.prod.vps.yml`

Services:

- **mailserver** — docker-mailserver (`mail.kink.social`), ports 25/587/465/993
- **roundcube** — webmail at `https://webmail.kink.social` (Caddy TLS)
- **api / worker** — SMTP to `mailserver:587` on Docker network

Persistent data (bind mounts, not in git):

```text
docker/mailserver/data    → mailboxes
docker/mailserver/state   → server state
docker/mailserver/logs    → logs
docker/mailserver/config  → dms config + DKIM keys
```

Volume: `c2k_roundcube_prod` for Roundcube data.

### Required DNS records


| Type | Name                          | Value                                                                                   |
| ---- | ----------------------------- | --------------------------------------------------------------------------------------- |
| A    | `mail.kink.social`            | VPS public IPv4                                                                         |
| A    | `webmail.kink.social`         | VPS public IPv4                                                                         |
| MX   | `kink.social`                 | `mail.kink.social` (priority 10)                                                        |
| TXT  | `kink.social`                 | `v=spf1 mx a:mail.kink.social -all` (tune after deliverability testing)                 |
| TXT  | `_dmarc.kink.social`          | `v=DMARC1; p=none; rua=mailto:postmaster@kink.social` (start monitoring; tighten later) |
| TXT  | `mail._domainkey.kink.social` | From DKIM setup (see below)                                                             |


**PTR / reverse DNS:** VPS provider panel → set rDNS for your IP to `mail.kink.social`.

### Firewall and provider

On VPS (bootstrap opens UFW 25/587/465; add 993 if needed):

```bash
ufw allow 25/tcp
ufw allow 587/tcp
ufw allow 465/tcp
ufw allow 993/tcp
```

**Port 25:** Many providers block outbound/inbound 25 until you request unblock. Verify with:

```bash
nc -vz mail.kink.social 25
# or from outside: https://www.check-host.net/check-smtp
```

### Mailbox creation

On the VPS from deploy root (`/opt/c2k`):

```bash
export DOMAIN=kink.social
export MAILBOX_PASSWORD="$(openssl rand -base64 24)"
# optional per-role passwords: SUPPORT_MAILBOX_PASSWORD, LEGAL_MAILBOX_PASSWORD, ...
bash scripts/mail/create-mailboxes.sh
```

Creates:

- `noreply@kink.social` — app SMTP relay
- `support@`, `legal@`, `business@`, `security@`, `admin@`, `abuse@`, `postmaster@`
- Alias: `postmaster@` → `admin@`
- Optional: `STAFF_MAILBOXES=alice@kink.social,mod@kink.social`

**Never commit real mailbox passwords.**

### DKIM

After mailserver is up:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml -f docker-compose.prod.vps.yml \
  exec mailserver setup config dkim domain kink.social
docker compose ... exec mailserver cat /tmp/docker-mailserver/opendkim/keys/kink.social/mail.txt
```

Add the TXT record at `mail._domainkey.kink.social`.

### App outbound SMTP (`.env.production`)

```env
C2K_MAIL_TRANSPORT=smtp
C2K_MAIL_FROM="Kink.Social <noreply@kink.social>"
C2K_MAIL_REPLY_TO=support@kink.social
SMTP_HOST=mailserver
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@kink.social
SMTP_PASS=<noreply mailbox password — server secret only>
C2K_PUBLIC_WEB_URL=https://kink.social
C2K_PASSWORD_RESET_ENABLED=true
```

External DNS name `mail.kink.social` is for MX/reputation; **inside Docker use `mailserver`**.

Default behavior:

- **From:** `Kink.Social <noreply@kink.social>` — set `C2K_MAIL_FROM` (display name before `<` is what recipients see in the inbox)
- **Reply-To:** `support@kink.social` (override per message)
- **Password recovery email:** subject `Kink.Social password recovery` (or `C2K_MAIL_PRODUCT_NAME` + `password recovery`); override with `C2K_PASSWORD_RESET_EMAIL_SUBJECT`
- Contact/legal/security forms route to the correct mailbox with validated submitter Reply-To

Optional copy overrides (API `.env.production`):

| Variable | Default |
|----------|---------|
| `C2K_MAIL_PRODUCT_NAME` | `Kink Social` (`APP_NAME`) — used in email body and default subjects |
| `C2K_PASSWORD_RESET_EMAIL_SUBJECT` | `{product} password recovery` |
| `C2K_PASSWORD_CHANGED_EMAIL_SUBJECT` | `{product} password changed` |

### Platform BCC (dangerous)

`C2K_PLATFORM_MAIL_BCC` copies every non-sensitive outbound message. **Sensitive categories never get BCC:**

password reset, password changed, verification, legal, security, abuse, moderation, DMs, privacy exports.

Leave `C2K_PLATFORM_MAIL_BCC` unset in production unless you understand the privacy risk.

## Roundcube webmail

URL: **[https://webmail.kink.social](https://webmail.kink.social)**

Log in with full email address and mailbox password, e.g.:

- `support@kink.social`
- `legal@kink.social`
- `admin@kink.social`

No public registration — only mailboxes created via `create-mailboxes.sh`.

Rotate password:

```bash
docker compose ... exec mailserver setup email update support@kink.social 'NEW_SECRET'
```

## Admin mail intake (dashboard)

Architecture:

1. Email arrives at docker-mailserver
2. Readable in Roundcube
3. Worker polls IMAP (optional) → `mail_intake_items` + dashboard notification
4. Staff triage at **Moderation → Mail intake**

Enable intake (off by default):

```env
C2K_MAIL_INTAKE_ENABLED=true
C2K_MAIL_INTAKE_IMAP_HOST=mailserver
C2K_MAIL_INTAKE_IMAP_PORT=993
C2K_MAIL_INTAKE_IMAP_SECURE=true
C2K_MAIL_INTAKE_SUPPORT_USER=support@kink.social
C2K_MAIL_INTAKE_SUPPORT_PASS=<secret>
# repeat for LEGAL, BUSINESS, ABUSE, SECURITY
```

Worker polls every 5 minutes (`C2K_MAIL_INTAKE_REPEAT_MS`, default 300000). Messages are marked `\Seen` but **never deleted**.

Visibility:


| Tab            | Default access        |
| -------------- | --------------------- |
| Support        | Owner, site admins    |
| Business       | Owner, site admins    |
| Abuse / Safety | Owner, trust & safety |
| Legal          | **Owner only**        |
| Security       | **Owner only**        |


Staff **kink.social accounts** and **email mailboxes** are separate — dashboard access is role-gated; Roundcube uses mailbox credentials.

## Password reset / change verification

1. Ensure mail env + `C2K_PASSWORD_RESET_ENABLED=true`
2. Request: `POST /api/auth/password-reset/request` `{ "identifier": "user@example.com" }` → always generic success
3. Check Mailpit (dev) or noreply delivery (prod)
4. Confirm: `POST /api/auth/password-reset/confirm` with token + new password
5. Password-changed email sent; old sessions invalidated (`sessionVersion`)
6. Logged-in change: `POST /api/auth/password/change` `{ "currentPassword", "newPassword" }`

## Inbound / outbound mail tests

**Outbound (VPS):**

```bash
bash scripts/vps/smoke-mail.sh
curl -s https://kink.social/api/health/mail
```

**Inbound:** Send test mail to `support@kink.social` from an external account; confirm Roundcube inbox + (if intake enabled) dashboard item.

**Transactional smoke (local):** `node scripts/smoke-transactional-mail.mjs`

## Web push (optional)

Requires VAPID keys on API/worker:

```env
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@kink.social
```

Users opt in at **Settings → Notifications** (account preference + browser permission). Payloads are generic only, e.g. “You have a new notification on kink.social.”

## Logs and restart

```bash
cd /opt/c2k
docker compose --env-file .env.production -f docker-compose.prod.yml -f docker-compose.prod.vps.yml logs -f mailserver
docker compose ... restart mailserver roundcube
docker compose ... restart api worker
```

## Staff mailboxes vs site accounts


| Concept                          | Controls                         |
| -------------------------------- | -------------------------------- |
| kink.social user + platform role | Dashboard mail intake visibility |
| docker-mailserver mailbox        | Roundcube login, IMAP intake     |
| `noreply@`                       | App-generated outbound only      |


Alpha: create mailboxes with `scripts/mail/create-mailboxes.sh` only — no public mailbox admin UI.

## Gaps / operator checklist

- [ ] DNS A/MX/SPF/DKIM/DMARC/PTR verified
- [ ] Port 25 unblocked with provider
- [ ] Mailbox passwords stored in `.env.production` only
- [ ] `GET /api/health/mail` returns `ok: true`
- [ ] Password reset end-to-end tested
- [ ] Roundcube login tested for each role mailbox
- [ ] Mail intake IMAP credentials set before enabling `C2K_MAIL_INTAKE_ENABLED`
- [ ] VAPID keys generated if push desired (`docs/PUSH_VAPID_DEV.md`)