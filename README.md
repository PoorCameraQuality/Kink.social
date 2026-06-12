# Coast to Coast Kink (C2K)

Local-first monorepo: **Vite + React** (`packages/web`), **Fastify** (`packages/api`), **shared** types/utils (`packages/shared`).

**On this machine:** this repo usually lives at `Desktop/coast-to-coast-kink`, **next to** the `eastcoast` folder (EastCoast-master, swing-club-platform, `docs/`). To open both in one Cursor/VS Code window, use `Desktop/eastcoast-kink-ecosystem.code-workspace`.

## Current feature status (2026-05-28 — month-end pause)

**Development paused** until the next session. **Resume:** [`docs/MASTER_NEXT_STEPS.md`](docs/MASTER_NEXT_STEPS.md) §9 · [`docs/HANDOFF.md`](docs/HANDOFF.md) § 2026-05-28 · registry pass 24 in [`docs/FEATURE_REGISTRY.md`](docs/FEATURE_REGISTRY.md).

**Overall readiness:** ~**80–83%** — [`docs/EXECUTIVE_PLATFORM_READINESS.md`](docs/EXECUTIVE_PLATFORM_READINESS.md). **Roadmap:** [`docs/PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md). **Demo links:** [`docs/LOCALHOST_DEMO_LINKS.md`](docs/LOCALHOST_DEMO_LINKS.md).

| Area | Status |
|------|--------|
| **Organizer console** | Command bridge + People hub + door/registrants. [`docs/ORGANIZER_CONSOLE.md`](docs/ORGANIZER_CONSOLE.md). |
| **Member profile** | Public + edit UX overhaul; `birthDate`/sexuality; verified-host badges **removed** from events. |
| **Home / social** | Following feed **F1–F5** shipped; Near-you feed may **500** locally — open when resuming. |
| **Email / mail** | Mailpit local; prod blocked on server — [`docs/PROD_SMTP_K8S_CHECKLIST.md`](docs/PROD_SMTP_K8S_CHECKLIST.md). |
| **Backlog queue** | **Paused** — [`docs/BACKLOG_QUEUE.md`](docs/BACKLOG_QUEUE.md). |

## How to develop

```bash
cd coast-to-coast-kink
docker compose -f docker-compose.dev.yml up -d   # postgres, redis, minio, mailpit
npm install
npm run db:prepare   # drizzle push + seed demo user (requires USE_DATABASE=true, set in .env.development)
npm run dev   # Vite :5173 + API :3001
```

- **Web:** http://localhost:5173 (proxies `/api` → Fastify on `:3001`)
- **API:** http://localhost:3001/api/health (liveness) and http://localhost:3001/api/health/ready (readiness; DB ping when `USE_DATABASE=true`)
- **Demo user (after seed):** `RopeDreamer` / password from `DEMO_LOGIN_PASSWORD` in `.env.development` (default `demo`)

See `.env.development` for local defaults (`USE_DATABASE=true`, Postgres, Redis, MinIO URLs). Optional: `npm run db:seed:locations -w @c2k/api` for full US place data (see `docs/locations.md`).

`npm run dev` runs the web app and API together via `concurrently`. To run only one side: `npm run dev:web` or `npm run dev:api`.

**End of day:** stop dev (`Ctrl+C`), then `docker compose -f docker-compose.dev.yml down`.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| **`ERR_CONNECTION_REFUSED` on `:5173`** | Dev server not running — start with `npm run dev` (or `npm run dev:web`). Docker alone does not start Vite. |
| **`db:prepare` hangs** | Confirm Postgres is healthy: `docker compose -f docker-compose.dev.yml ps`. See [`docs/technical-reference.md`](docs/technical-reference.md) § “If db:prepare hangs”. |
| **`db:push` module resolution errors** | From repo root, run `npm run build -w @c2k/shared` first, then retry `npm run db:push -w @c2k/api` or `npm run db:prepare`. Schema is TypeScript; drizzle-kit occasionally needs shared packages built. |
| **API works but pages are empty** | Ensure `USE_DATABASE=true` and you ran `npm run db:prepare`. Check http://localhost:3001/api/health/ready. |

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite + Fastify (concurrently) |
| `npm run dev:web` / `npm run dev:api` | Run one side only |
| `npm run build` | `shared` → `api` → `web` production bundles |
| `npm run typecheck` | Typecheck shared + web + api |
| `npm run db:prepare` | Wait for Postgres + `db:push` + `db:seed` for `@c2k/api` |
| `npm run test` | API unit tests (convention policy, ISO, ECKE sync helpers, etc.) |
| `npm run test -w @c2k/api` | Same when invoked from the API workspace |
| `npm run test:e2e` | Playwright smoke (`e2e/smoke.spec.ts`) |

## Package docs

| Package | README |
|---------|--------|
| `@c2k/web` | [`packages/web/README.md`](packages/web/README.md) |
| `@c2k/api` | [`packages/api/README.md`](packages/api/README.md) |
| `@c2k/shared` | [`packages/shared/README.md`](packages/shared/README.md) |

## Docs

- **`docs/C2K-STRATEGIC-GUIDANCE.md`** — **agent constitution**: product phases, binding architecture rules, session checklist (also `.cursor/rules/c2k-strategic-guidance.mdc`)
- **`docs/SERVER_MOUNT_RUNBOOK.md`** — **when you mount prod** (K8s or VPS): deploy order, mail, pilot, agent prompt
- **`docs/README.md`** — documentation index (start here if lost)
- **`docs/PROJECT_ROADMAP.md`** — recommended next work (alpha → home polish → Phase 2 social)
- **`docs/MASTER_NEXT_STEPS.md`** — priorities, read order, backlog pointers, verification commands
- **`docs/HANDOFF.md`** — rolling session handoff (env, recent ships, resume pointers)
- **`docs/PLATFORM_STATUS_AUDIT.md`** — full-project status audit (2026-05-24 baseline)
- `docs/technical-reference.md` — stack, env, commands (incl. `ORG_REVIEW_PROPAGATES_GLOBAL_TRUST`)
- `docs/FEATURE_REGISTRY.md` — routes, API prefixes, feature flags; **§ Ecosystem map**; **§ Unified event calendar**; **§ Org hub community**
- `docs/EXECUTIVE_PLATFORM_READINESS.md` — leadership report: site-wide feature maturity **%** estimates (~68–72% overall)
- `docs/EVENT_SYSTEMS_IDENTITY.md` — identity ADR + phased rollout (Phase 1–2 done)
- `docs/DANCECARD_ORGANIZER_PARITY.md` — Event Systems organizer UI/API parity matrix
- `docs/ORGANIZER_CONSOLE.md` — organizer routes, tabs, smoke paths
- `docs/adr/README.md` — Architecture Decision Records index (ADR 002: org WebSocket auth, LiveKit voice, weekly digest mail — **implemented**)
- `docs/BACKLOG_QUEUE.md` — autonomous agent queue
- `docs/EXTEND_BEFORE_ADD.md` — reuse existing structures before adding parallel code (see also `.cursor/rules/extend-before-add.mdc`)
- `docs/archive/` — historical audits, completed plans, session logs
- `docs/DEPLOY_SMOKE.md` — GitHub Actions + VPS smoke checklist
- `docs/E2E.md` — Playwright setup

## Production

- Build API image from repo root: `docker build -f docker/api.Dockerfile .`
- `docker-compose.prod.yml` + `Caddyfile` + `.env.production.example`
- `.github/workflows/deploy.yml` — SSH deploy template (set GitHub secrets)

## Legacy

The original Next.js config is preserved under `legacy/` for reference only.
