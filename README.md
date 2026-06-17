# kink.social

Public-facing **alpha** monorepo for [kink.social](https://kink.social): **Vite + React** (`packages/web`), **Fastify** API (`packages/api`), shared types (`packages/shared`).

This is a **controlled public alpha**, not a full launch. Registration is open; bugs and demo content are expected.

## Stack

| Layer | Path | Notes |
|-------|------|-------|
| Web | `packages/web` | Vite SPA, proxied `/api` in dev |
| API | `packages/api` | Fastify, Drizzle, BullMQ worker |
| Shared | `packages/shared` | Types, validation, policy helpers |
| Prod | `docker-compose.prod.yml` + `docker-compose.prod.vps.yml` | VPS uses Caddy fronting `c2k-web` / `c2k-api` |

Repo map and cleanup inventory: [`docs/REPO_MAP.md`](docs/REPO_MAP.md) · [`docs/CODE_CLEANUP_INVENTORY.md`](docs/CODE_CLEANUP_INVENTORY.md)

## Local development

**Requires Node 20** for the full test suite (CI uses Node 20; Node 24 may fail tsx path resolution).

```bash
docker compose -f docker-compose.dev.yml up -d   # postgres, redis, minio, mailpit
npm install
npm run db:prepare   # drizzle push + seed (USE_DATABASE=true in .env.development)
npm run dev          # Vite :5173 + API :3001
```

- **Web:** http://localhost:5173
- **API health:** http://localhost:3001/api/health/ready
- **Demo user (after seed):** `RopeDreamer` / password from `DEMO_LOGIN_PASSWORD` in `.env.development` (default `demo`)

See `.env.development` for local defaults. Optional: `npm run db:seed:locations -w @c2k/api`.

## Verification

```bash
npm run typecheck
npm run build
npm run test              # @c2k/api unit tests (Node 20)
npm run test:e2e:smoke    # Playwright route smokes
```

## Alpha docs (start here)

| Doc | Purpose |
|-----|---------|
| [`docs/PUBLIC_ALPHA_PROMOTION.md`](docs/PUBLIC_ALPHA_PROMOTION.md) | Promotion guide, tester expectations, announcement draft |
| [`docs/ALPHA_QA_JOURNEY.md`](docs/ALPHA_QA_JOURNEY.md) | Structured QA checklist |
| [`docs/C2K-STRATEGIC-GUIDANCE.md`](docs/C2K-STRATEGIC-GUIDANCE.md) | Product phases and agent constraints |
| [`docs/FEATURE_REGISTRY.md`](docs/FEATURE_REGISTRY.md) | Routes, API prefixes, env |
| [`docs/VPS_ALPHA_EXECUTION_LOG.md`](docs/VPS_ALPHA_EXECUTION_LOG.md) | VPS operator pass log |

Full index: [`docs/README.md`](docs/README.md)

## Production / VPS deploy

- **Preferred:** changed-files-only — `scripts/vps/patch-*-vps.mjs` or `scripts/vps/upload-files.mjs`; rebuild only affected services.
- **Discouraged:** full tarball — `scripts/_deploy-full-prod.mjs` (bootstrap / last resort). Exclusions: [`.deployignore`](.deployignore).
- **Never ship** in deploy packages: `.env.production`, logs, tarballs, `node_modules`, `docs/audits` artifacts, database dumps.
- **Never run** destructive seed/reset/clear DB on production unless explicitly instructed.

Build API image: `docker build -f docker/api.Dockerfile .`  
GitHub deploy template: `.github/workflows/deploy.yml`

## Legacy / caution

- **`legacy/`** — original Next.js config (reference only)
- **Top-level `src/`** — pre-Vite copies; **`packages/web` is canonical** (see cleanup inventory)
- **`vendor/`** — ECKE/Dancecard export reference

## Package READMEs

| Package | README |
|---------|--------|
| Web | [`packages/web/README.md`](packages/web/README.md) |
| API | [`packages/api/README.md`](packages/api/README.md) |
| Shared | [`packages/shared/README.md`](packages/shared/README.md) |
