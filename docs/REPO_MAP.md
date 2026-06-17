# Repository map

**Last updated:** 2026-06-17  
**Product:** [kink.social](https://kink.social/) — public-facing alpha

This map helps humans and agents find current source-of-truth paths. It does not replace [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) or [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md).

---

## Current application source

| Path | Role |
|------|------|
| [`packages/web`](../packages/web) | Vite + React SPA (member UI, landing, onboarding, Home) |
| [`packages/api`](../packages/api) | Fastify API, Drizzle schema, workers, media pipeline |
| [`packages/shared`](../packages/shared) | Shared types, enums, validation, content policy |

**Not runtime:** top-level [`src/`](../src) (62 files) — pre-Vite Next.js-era copies; **`packages/web` is canonical**. Do not import from top-level `src/` in new work.

---

## Current docs (read first for alpha)

| Doc | Use |
|-----|-----|
| [`PUBLIC_ALPHA_PROMOTION.md`](./PUBLIC_ALPHA_PROMOTION.md) | Controlled alpha promotion, announcement draft, legacy media decision |
| [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) | Structured tester checklist |
| [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md) | Seed personas and demo data |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md) | Alpha readiness gates |
| [`VPS_ALPHA_EXECUTION_LOG.md`](./VPS_ALPHA_EXECUTION_LOG.md) | VPS pass-by-pass operator log |
| [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) | Routes, API prefixes, env |
| [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) | Product phases and agent constraints |

Historical material: [`docs/archive/`](./archive/), [`docs/handoff/`](./handoff/).

---

## Deploy and ops

| Path | Role |
|------|------|
| [`scripts/vps/patch-*-vps.mjs`](../scripts/vps/) | **Preferred:** changed-files-only SFTP + targeted service rebuild |
| [`scripts/vps/upload-files.mjs`](../scripts/vps/upload-files.mjs) | Upload explicit file list |
| [`scripts/vps/promotion-readiness-pass1-smoke.mjs`](../scripts/vps/promotion-readiness-pass1-smoke.mjs) | Live smoke (health, mod, upload) |
| [`scripts/_deploy-full-prod.mjs`](../scripts/_deploy-full-prod.mjs) | Full tarball deploy — **discouraged** except bootstrap |
| [`.deployignore`](../.deployignore) | Tarball exclude list |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | Production stack |
| [`docker-compose.prod.vps.yml`](../docker-compose.prod.vps.yml) | VPS overrides |

### Deploy rules

1. **Changed-files-only** patch scripts are the default for alpha hotfixes.
2. **Full tarball** deploy only when bootstrap or no safe partial path exists.
3. Rebuild **only affected services** (web-only → `c2k-web`; API-only → `api`; etc.).
4. Never ship `.env.production`, logs, tarballs, `node_modules`, or `docs/audits` artifacts.
5. **Do not run** destructive seed/reset/clear DB commands unless explicitly instructed.

### Service rebuild guide

| Change scope | Typical rebuild |
|--------------|-----------------|
| Web UI only | `docker compose … build web && up -d web` |
| API routes/lib only | `build api && up -d api` |
| Worker jobs only | `build worker && up -d worker` |
| `@c2k/shared` types | Rebuild **shared + dependent** (api, web) |
| Docs / inventory only | **No VPS deploy** |
| Operator scripts only | SFTP scripts; rebuild only if script runs on host against live code |

---

## Tests

| Path | Role |
|------|------|
| [`e2e/`](../e2e/) | Playwright smokes (route, auth, feed composer upload, moderation) |
| [`packages/api/src/**/*.test.ts`](../packages/api/src/) | API unit + DB integration tests |
| [`packages/web/src/lib/*.test.ts`](../packages/web/src/lib/) | Web lib tests (run via `@c2k/api` test script) |

**Node 20** is required for the full suite locally and in CI (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

---

## Seed and migration scripts

| Path | Notes |
|------|-------|
| [`packages/api/src/db/`](../packages/api/src/db/) | Migrations, seed, ECKE import — **never bulk-run destructive seeds on prod without explicit instruction** |
| [`packages/api/scripts/`](../packages/api/scripts/) | Operator audits (e.g. restricted public media) |

---

## Caution zones (audit before deletion)

| Path | Status |
|------|--------|
| [`src/`](../src) | Historical Next.js tree — unused by build; see [`CODE_CLEANUP_INVENTORY.md`](./CODE_CLEANUP_INVENTORY.md) |
| [`legacy/`](../legacy) | Original Next config reference only |
| [`vendor/`](../vendor) | ECKE / Dancecard export reference |
| [`docs/audits/`](./audits/) | **Generated locally** (~500 MB); gitignored for deploy; not runtime |
| [`scripts/_deploy-*.mjs`](../scripts/) | Tarball deploy helpers — use patch scripts when possible |

---

## Verification (local)

```bash
npm run typecheck
npm run build
npm run test          # Node 20; fails on Node 24 tsx path resolution
npm run test:e2e:smoke
```
