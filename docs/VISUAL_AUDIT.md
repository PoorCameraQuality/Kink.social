# Visual audit (Playwright screenshot pack)

Generate full-page PNG screenshots of public and authenticated routes for page-by-page UI review. This pass adds **tooling only** — no product UI changes.

## Prerequisites

- Node 18+ and repo dependencies installed (`npm install`)
- Playwright Chromium: `npm run test:e2e:install`
- Deployed or local web app reachable at a base URL
- **Alpha test accounts only** — never real admin or production credentials in env files or commits

## Required environment variables

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `VISUAL_AUDIT_BASE_URL` | Yes (for VPS) | App origin, e.g. `https://kink.social` or `http://127.0.0.1:5173` |
| `VISUAL_AUDIT_EMAIL` | Yes* | Login username for default member account |
| `VISUAL_AUDIT_PASSWORD` | Yes* | Password for default member account |

\*Or use `VISUAL_AUDIT_MEMBER_EMAIL` + `VISUAL_AUDIT_MEMBER_PASSWORD` instead.

### Optional role accounts

When set, the audit logs in separately and captures role-specific routes (organizer, vendor, presenter, moderation). If **only one** member account is configured, **member-level routes only** are captured.

| Variable | Role |
| -------- | ---- |
| `VISUAL_AUDIT_ORG_OWNER_EMAIL` / `VISUAL_AUDIT_ORG_OWNER_PASSWORD` | Organization organizer console |
| `VISUAL_AUDIT_VENDOR_EMAIL` / `VISUAL_AUDIT_VENDOR_PASSWORD` | Vendor settings / onboarding |
| `VISUAL_AUDIT_PRESENTER_EMAIL` / `VISUAL_AUDIT_PRESENTER_PASSWORD` | Presenter ecosystem settings |
| `VISUAL_AUDIT_ADMIN_EMAIL` / `VISUAL_AUDIT_ADMIN_PASSWORD` | Moderation / trust admin surfaces |

Admin routes are **optional** — forbidden responses are recorded in `failures.json` and do not stop the run.

### Optional seed overrides

| Variable | Default (local seed) |
| -------- | -------------------- |
| `VISUAL_AUDIT_ORG_SLUG` | `demo-east-collective` |
| `VISUAL_AUDIT_CONV_SLUG` | `preview-c2k-weekend` |
| `VISUAL_AUDIT_VENDOR_SLUG` | `rope-dreamer-supply` |
| `VISUAL_AUDIT_PRESENTER_USERNAME` | `LeatherCraftDemo` |
| `VISUAL_AUDIT_EVENT_ID` | First event from API |
| `VISUAL_AUDIT_GROUP_ID` | First group from `GET /api/v1/me/groups` |
| `VISUAL_AUDIT_MOD_CASE_ID` | First case when admin login works |

### Flags

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `VISUAL_AUDIT_INTERACTIVE` | `false` | Reserved for future multi-step onboarding/modal passes |

Credentials are **never** printed or written to metadata. Do not commit `.env` files containing passwords.

## Run locally

With dev stack up (`npm run dev` or Docker per project docs):

```bash
VISUAL_AUDIT_BASE_URL=http://127.0.0.1:5173 \
VISUAL_AUDIT_EMAIL=RopeDreamer \
VISUAL_AUDIT_PASSWORD=demo \
npm run visual:audit
```

## Run against VPS

After deploy and seed test users:

```bash
VISUAL_AUDIT_BASE_URL=https://kink.social \
VISUAL_AUDIT_EMAIL=your-alpha-member \
VISUAL_AUDIT_PASSWORD='…' \
VISUAL_AUDIT_ORG_OWNER_EMAIL=your-org-owner \
VISUAL_AUDIT_ORG_OWNER_PASSWORD='…' \
VISUAL_AUDIT_ADMIN_EMAIL=your-mod-test \
VISUAL_AUDIT_ADMIN_PASSWORD='…' \
npm run visual:audit
```

Use SSH on the server or run from a machine that can reach the public URL.

## Output layout

```
visual-audit-output/YYYY-MM-DD-HHMM/
  screenshots/{route-id}/{mobile|tablet|desktop}.png
  metadata.json          # per-route metrics + a11y smoke
  failures.json          # per-route errors (audit continues)
  console-errors.json
  network-errors.json
  route-index.html       # local gallery — open in browser
  .auth/                 # Playwright storage states (gitignored parent)
```

A `visual-audit-output/latest` symlink points at the newest run when the OS allows it.

### Viewports

- **mobile:** 390×844  
- **tablet:** 768×1024  
- **desktop:** 1440×1000  

Screenshots are **full-page PNG**, grouped by route id and viewport.

### Per-route metadata includes

- URL, title, viewport, response status (when available)
- Document height, horizontal overflow (`scrollWidth > clientWidth`)
- Heading samples, control counts
- `noindex` meta and `X-Robots-Tag` when present
- Accessibility smoke: missing/multiple `h1`, buttons without accessible text, images without `alt`, inputs without labels
- Console and failed network request counts

## Zip for review

From repo root after a run:

```bash
tar -czf visual-audit-output.tar.gz visual-audit-output/latest
```

Windows (PowerShell):

```powershell
Compress-Archive -Path visual-audit-output\latest\* -DestinationPath visual-audit-output.zip
```

Upload the archive to your design review thread. Use `route-index.html` locally for quick scanning, then attach specific route ids to Cursor redesign prompts.

## Route list

Routes live in [`visual-audit-routes.json`](../visual-audit-routes.json). Notable app aliases:

| Audit path | App note |
| ---------- | -------- |
| `/orgs` | Canonical organizations directory (`/organizations` may 404) |
| `/messaging` | Messages (`/messages` may 404; `/chat` redirects) |
| `/support` | Safety / report hub (no `/safety` route) |
| `/guidelines` | Community guidelines |
| `/onboarding` | Member wizard; also `/profile/edit?onboarding=1` |

Dynamic segments (`{orgSlug}`, `{eventId}`, …) resolve from env or API discovery.

## Security

- Do not screenshot private message threads (`/messaging` without `?c=`).
- Use seeded test data only on VPS.
- Do not commit `visual-audit-output/` or credentials.
- Moderation case detail is captured only when admin test credentials and a case id exist.

## Workflow (recommended)

1. VPS live with seeded alpha accounts  
2. `npm run visual:audit` against production URL  
3. Zip and upload screenshot pack  
4. Human UI audit → specific Cursor implementation prompts  
5. Second screenshot pass → polish pass  

## Related tooling

- [`scripts/capture-alpha-screenshots.mjs`](../scripts/capture-alpha-screenshots.mjs) — smaller legacy alpha set  
- [`e2e/`](../e2e/) — Playwright functional tests (not full visual inventory)
