# Manual smoke checklist (C2K prototype)

**Last updated:** 2026-06-06 (Playwright inventory, alpha gate steps)

Use before demos or when changing shell/navigation. **Not a substitute for automated tests** — see [`E2E.md`](./E2E.md) and [`audits/ui/README.md`](./audits/ui/README.md).

## Build & lint (optional for doc-only passes)

- [ ] `npm run build` — compiles clean
- [ ] `npm run lint` — no errors (warnings documented if any)

## Automated smoke (Playwright)

- [ ] `npm run test:e2e:install` (first time / new machine)
- [ ] `npm run test:e2e:smoke` — route smokes (desktop + mobile) + auth (~61 cases)
- [ ] `npm run test:e2e` — full matrix (~142 cases across 21 spec files; see [`E2E.md`](./E2E.md))

**Optional alpha gate** (Docker + seeded DB + Mailpit):

- [ ] `npm run verify:alpha` — prelaunch, alpha-gate E2E, screenshots, pilot smokes ([`PILOT_READINESS.md`](./PILOT_READINESS.md))

**Static route inventory** (after adding app routes):

- [ ] `npm run audit:ui-inventory` — refreshes [`audits/ui/generated/ROUTES_TABLE.md`](./audits/ui/generated/ROUTES_TABLE.md)

## Prerequisites (DB-backed checks)

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:prepare
npm run dev
```

Demo user: **`RopeDreamer`** / password **`demo`** (override with `E2E_DEMO_PASSWORD`).

| Seed | Default slug |
|------|----------------|
| Demo org | `demo-east-collective` |
| Preview convention (door, register, dancecard) | `preview-c2k-weekend` |
| Program convention (anchored schedule) | `seed-demo-con-program` |

## Unified calendar (requires `USE_DATABASE=true` + seed)

After **`npm run db:prepare`**:

| Step | Action | Expect |
|------|--------|--------|
| C1 | Open `/conventions/seed-demo-con-program` | **Schedule** heading; seed slot titles (e.g. Welcome circle) |
| C2 | Open `/orgs/demo-east-collective?tab=Calendar` | At least one row with **Program** badge |
| C3 | Open an org-linked event with program from seed | **Expected cost** / **View full schedule** when seeded |

## Core routes (signed in as `RopeDreamer`, DB seeded)

| Step | Action | Expect |
|------|--------|--------|
| 1 | Open `/home` | Feed loads; scope tabs; following / near-you when API returns data |
| 2 | Open `/events` | Events list; category/format filters when DB seeded |
| 3 | Open `/conventions/preview-c2k-weekend` | Convention hub; **Schedule** tab renders |
| 4 | Open `/messaging` | Messages heading; safety copy; inbox folders (not org Chat) |
| 5 | Open `/profile/edit` (or follow redirect from `/onboarding`) | Profile edit form; onboarding query preserved |
| 6 | Open `/connections` | Connections page after demo login |
| 7 | Open `/groups` → **Create Group** | Modal opens; new group appears when API accepts POST |
| 8 | Open `/notifications` | List loads when signed in |
| 9 | Open `/settings/privacy` | Privacy section loads |
| 10 | Open `/organizer/orgs/demo-east-collective` | Organizer console tabs (home, schedule, people, communications, …) |

## Organizer / door (mobile-friendly)

| Step | Action | Expect |
|------|--------|--------|
| D1 | Open `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend/door` @ 390px | Door search visible; check-in when registrant seeded |
| D2 | Open `/conventions/preview-c2k-weekend/register` (logged out OK) | Category → form → policies path |
| D3 | Convention hub **Dancecard** / volunteer shifts | Feature cards; open shifts when seed present |

## Public / legal (no sign-in)

| Step | Action | Expect |
|------|--------|--------|
| P1 | Open `/` | Hero heading |
| P2 | Open `/privacy`, `/terms`, `/guidelines` | Policy copy; back/home link |
| P3 | Open `/policies`, `/dmca` | Legal policy pages render |

## Dev-only

- [ ] Yellow **Mock prototype** / **Local development** banners visible under header in `npm run dev` only; absent in production build.
- [ ] Guest + `VITE_HOME_DEMO_FALLBACK=true` may show sample catalogs — signed-in users should still see API-backed data ([`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) G4).

---

*CI: run `npm run build` then `npm run test:e2e` with Playwright `webServer` (`npm run dev`) per `docs/E2E.md`, or `verify:alpha:auto` when Docker/DB/Mailpit are up.*
