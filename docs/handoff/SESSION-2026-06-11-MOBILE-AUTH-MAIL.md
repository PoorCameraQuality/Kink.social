# Session handoff — mobile UX, auth wall, landing, signup welcome mail (2026-06-11)

**Status:** Deployed to production (`https://kink.social`) — 2026-06-12 ~01:40 UTC  
**VPS:** `2.25.196.84`, stack at `/opt/c2k`  
**Deploy script:** `scripts/_deploy-eod-session.mjs` (api + web rebuild, append-only env flag)  
**Env backup:** `.env.production.bak-2026-06-12T01-40-33-767Z`  
**Users before/after deploy:** 4 → 4 (unchanged)

---

## Executive summary

This session shipped four product-facing themes:

1. **Mobile UX** — bottom-nav clearance, safe areas, sticky/fixed UI above nav, messaging viewport fill.
2. **Landing / login** — hero copy, mobile login-focus layout, duplicate Join/Log in CTAs removed (auth card only).
3. **Strict auth gate** — unauthenticated users redirected to `/?login=1&redirect=…` except public allowlist.
4. **Account welcome email** — new transactional template + post-register send (env-gated; enabled on prod via append).

Password reset (`/forgot-password`) was already fully wired; no code change required there.

---

## Production deploy record

| Step | Action |
|------|--------|
| Env backup | `.env.production.bak-<timestamp>` on VPS |
| Source | `_deploy-eod.tar.gz` → `packages/web`, `packages/shared`, `packages/api`, Dockerfiles |
| Containers rebuilt | **api**, **web** only |
| Not touched | postgres, redis, minio volumes, migrations, `.env` secrets (except one append) |
| Env append | `C2K_ACCOUNT_WELCOME_EMAIL=true` if missing |
| Safety check | User count before/after must match |

**Verify after deploy:**

```bash
node scripts/_smoke-prod-quick.mjs      # 9/9 passed (2026-06-12 deploy)
node scripts/_verify-hero-copy.mjs      # PASS — hero copy in live bundle
curl -s https://kink.social/api/auth/password-reset/policy
```

---

## What changed (by area)

### Mobile UX (`packages/web`)

| Item | Files / notes |
|------|----------------|
| CSS tokens | `globals.css` — `--c2k-bottom-nav-*`, utilities `c2k-main-mobile-pb`, `c2k-fixed-above-bottom-nav`, etc. |
| Main layout | `RootLayout.tsx` — mobile bottom padding via token |
| Fixed/sticky UI | Save bar, messaging, toast, schedule grid, filter sheets, onboarding footers, settings sticky footer |
| Header | `Header.tsx` — `safe-area-pt` |

### Landing & auth UI

| Item | Detail |
|------|--------|
| Hero body | *"Find Events, Meet new people, Connect with friends, and organize conventions. Your one stop shop."* |
| Mobile `?login=1` | `public-page--login-focus` — auth card first, marketing chrome hidden |
| Duplicate CTAs removed | `page.tsx`, `PublicNav.tsx`, `MobilePublicNav.tsx` — logo only in nav; Join/Log in only in Welcome back card |
| Footer | Legal links only (`LandingPublicFooter`) |

### Auth gate

| File | Role |
|------|------|
| `lib/public-routes.ts` | Allowlist: `/`, `/login`, legal, forgot/reset password, email confirm/unsubscribe |
| `components/auth/AuthGate.tsx` | Redirect unauthenticated → `/?login=1&redirect=<path>` |
| `layouts/RootLayout.tsx` | Wraps app routes with `AuthGate` |

**Exceptions (outside gate):** door page (`/organizer/.../door`), routes not using `RootLayout`.

### Account welcome email (API)

| Piece | Location |
|-------|----------|
| Template | `buildAccountWelcomeEmail` / `sendAccountWelcomeEmail` in `transactional-email.ts` |
| Trigger | `POST /api/auth/register` success → async send in `auth.ts` |
| Flag | `C2K_ACCOUNT_WELCOME_EMAIL=true` |
| Test send | `POST /api/v1/me/email/test-send` body `{ "template": "account_welcome" }` |
| Status | `GET /api/v1/me/email/status` → `accountWelcomeEmailEnabled` |

Subject: `Welcome to Kink Social, {username}`. Links: `/home`, `/guidelines`, `/privacy`.

---

## Transactional mail inventory (production-relevant)

| Email | Env flag | Trigger |
|-------|----------|---------|
| Account welcome | `C2K_ACCOUNT_WELCOME_EMAIL=true` | Register |
| Org join welcome | `C2K_ORG_JOIN_EMAIL=true` | Org join |
| Event RSVP confirm | `C2K_EVENT_RSVP_EMAIL=true` | RSVP PUT |
| Password reset / changed | `C2K_PASSWORD_RESET_ENABLED` (default on) | Forgot password flow |
| Scope confirm | `C2K_SCOPE_EMAIL_DOUBLE_OPTIN` | Newsletter double opt-in |

Mail transport on prod: SMTP via docker-mailserver (`C2K_MAIL_TRANSPORT=smtp`, `C2K_MAIL_FROM`, etc.).

---

## Manual smoke (5 min tomorrow)

1. **Landing** — `https://kink.social/` — no nav Join/Log in; only auth card CTAs.
2. **Login wall** — open `/home` logged out → redirect to `/?login=1&redirect=/home`.
3. **Mobile** — phone or DevTools: bottom nav does not cover primary buttons on messaging, profile edit save bar.
4. **Forgot password** — `/forgot-password` → submit email → generic success (check mailserver logs if no inbox).
5. **New signup welcome** — register test user → welcome email (if SMTP delivers to that domain).
6. **Existing users** — log in as Brax; profile, photos, org join still work.

---

## Known gaps / follow-ups

| Item | Notes |
|------|-------|
| Welcome email deliverability | Confirm SPF/DKIM for `noreply@kink.social`; test with real inbox |
| Auth gate on shared links | Some public share URLs may now require login — product decision |
| Forgot-password styling | Functional but generic `dc-*` shell, not landing card styling |
| Git | Workspace may be SFTP-first; prod source at `/opt/c2k` |
| Rotate SSH password | Was used in deploy session — rotate if concerned |

---

## Deploy commands (reference)

**Create tarball (local):**

```powershell
cd c:\Users\shkin\Desktop\coast-to-coast-kink
tar -czf _deploy-eod.tar.gz packages/web packages/shared packages/api package.json package-lock.json docker/web.Dockerfile docker/api.Dockerfile docker/nginx-spa.conf
```

**Deploy (requires SSH access):**

```powershell
$env:SSH_PASS='***'
node scripts/_deploy-eod-session.mjs
```

**Web-only deploy (no API):**

```powershell
tar -czf _deploy-ui.tar.gz packages/web packages/shared package.json package-lock.json docker/web.Dockerfile docker/nginx-spa.conf
node scripts/_deploy-mobile-ui-vps.mjs
```

---

## Related docs

- [`PHOTO-UPLOAD-VPS-FIX-2026-06-11.md`](./PHOTO-UPLOAD-VPS-FIX-2026-06-11.md) — earlier same-day upload fix
- [`docs/SERVER_CUTOVER_LOG.md`](../SERVER_CUTOVER_LOG.md) — prod delta journal
- [`docs/PROD_SMTP_K8S_CHECKLIST.md`](../PROD_SMTP_K8S_CHECKLIST.md) — mail DNS checklist
- [`docs/PILOT_READINESS.md`](../PILOT_READINESS.md) — alpha checklist

---

## Do not commit / share

- `.env.production` on VPS
- SSH passwords
- Session cookies, user PII
