# Code cleanup inventory

**Last updated:** 2026-06-17  
**Pass:** Deploy Slimming and Repo Hygiene Audit Pass 1  
**Rule:** Unknown items are **inventoried only** — no deletions in this pass except proven generated tracked files.

Related: [`REPO_MAP.md`](./REPO_MAP.md)

---

## Classification legend

| Tag | Meaning |
|-----|---------|
| **active runtime** | Used in production build or API |
| **active test** | Referenced by test runners |
| **active deploy/ops** | VPS/CI/deploy scripts |
| **active docs** | Intentional documentation |
| **generated artifact** | Build/log/output — ignore or remove from Git |
| **historical reference** | Kept for context; not in runtime path |
| **unused candidate** | Likely obsolete; needs follow-up |
| **unknown** | Do not delete yet |

---

## Generated artifacts (ignore / do not commit)

| Path | Why generated | Action |
|------|---------------|--------|
| `docs/audits/` (~500 MB local) | UI/visual audit scripts | **ignore** + `.deployignore` |
| `.deploy-c2k-full.tgz` (~681 MB) | Full deploy tarball | **ignore** |
| `_deploy-*.tar.gz` (root) | Partial deploy tarballs | **ignore** |
| `test-results/`, `playwright-report/` | Playwright | **ignore** (already) |
| `*.log`, `*-out.txt`, `test-out.txt` | Local command output | **ignore** |
| `*.tsbuildinfo` | TypeScript incremental | **removed from Git** (this pass) |
| `build-web.log` | Local build log | **removed from Git** (this pass) |

---

## Tracked generated files removed (safe)

| Path | Evidence safe | Action taken |
|------|---------------|--------------|
| `build-web.log` | No imports; local vite output | Remove from Git |
| `tsconfig.tsbuildinfo` | TS incremental cache | Remove from Git |
| `packages/web/tsconfig.tsbuildinfo` | TS incremental cache | Remove from Git |

---

## Top-level `src/` (unused candidate)

| Field | Value |
|-------|-------|
| **Paths** | 62 tracked files under [`src/`](../src) |
| **Why suspicious** | Pre-Vite Next.js-era components; canonical app is `packages/web` |
| **Searches** | No `package.json` script imports; no `from '../src'` in packages |
| **Docker/deploy** | Included in tarball today but not used by `npm run build` |
| **Risk** | Low for runtime; medium for confusion |
| **Recommendation** | **archive in later pass** — add deprecation README in `src/` first; do not delete until import audit on full tree |

Sample duplicates: `src/components/LoginCard.tsx`, `src/components/BottomNav.tsx` vs `packages/web/src/components/…`

---

## `legacy/` (historical reference)

| Field | Value |
|-------|-------|
| **Paths** | `legacy/next.config.js`, `legacy/README.md` |
| **References** | Root README “Legacy” section only |
| **Recommendation** | **keep** |

---

## `vendor/` (historical reference)

| Field | Value |
|-------|-------|
| **Paths** | `vendor/dancecard-eastcoast-export/` (~0.6 MB) |
| **References** | ECKE import docs; not imported by runtime packages directly |
| **Recommendation** | **keep** — ECKE reference material |

---

## Root clutter (untracked — ignore only)

| Path | Tag | Recommendation |
|------|-----|----------------|
| `.deploy-c2k-full.tgz` | generated artifact | **ignore** |
| `api-build.log`, `ci-fail*.log`, `media-test.log` | generated artifact | **ignore** |
| `packages/api/scripts/tsx-web-paths.mjs` | local Node 24 helper | **ignore** or move to docs as optional tip |
| `push-out.txt`, `seed-out.txt`, `tmp-prod-*.txt`, `_api-logs.txt` | generated artifact | **ignore** |
| `.env.local` | local env (untracked) | **ignore** — never commit |

---

## Deploy scripts

| Path | Tag | Notes |
|------|-----|-------|
| `scripts/vps/patch-*-vps.mjs` | active deploy/ops | **Preferred** changed-files-only |
| `scripts/_deploy-full-prod.mjs` | active deploy/ops | Full tarball — use rarely |
| `scripts/vps/push-and-bootstrap.mjs` | active deploy/ops | Bootstrap only |
| `scripts/_deploy-eod-session.mjs` | active deploy/ops | Expects pre-built `_deploy-eod.tar.gz` |
| `scripts/_deploy-mobile-ui-vps.mjs` | active deploy/ops | Expects `_deploy-ui.tar.gz` |

---

## Stale naming / docs (historical reference)

| Item | Notes | Recommendation |
|------|-------|----------------|
| Package name `coast-to-coast-kink` in `package.json` | Monorepo folder name; product is kink.social | **keep** folder name; README updated |
| `C2K` in doc titles | Legacy internal codename | **keep** in strategic docs; public README uses kink.social |
| `docs/archive/` | Old audits and plans | **keep** |

---

## Secrets check (tracked files)

| File | Status |
|------|--------|
| `.env.development` | Tracked **intentionally** — local dev defaults only (no prod secrets) |
| `.env.example`, `.env.production.example` | Tracked templates — safe |
| `.env.local`, `.env.production` | **Not tracked** — correct |

No production passwords or API keys found in tracked source files during this pass.

---

## Recommended next cleanup pass

1. Add `src/README.md` marking tree deprecated; grep entire repo for any stray imports.
2. Per-row remediation of 26 legacy profile media rows (see [`PUBLIC_ALPHA_PROMOTION.md`](./PUBLIC_ALPHA_PROMOTION.md)).
3. Optionally split `docs/audits/` out of workstation entirely or add `npm run clean:audits`.
4. Consolidate `_deploy-eod` / `_deploy-ui` tarball creation into shared helper using `.deployignore`.
5. Archive or delete top-level `src/` after one release cycle with no references.
