# Historical source tree (not canonical)

**Status:** Deprecated reference — do **not** add new feature work here.

## Current source of truth

| Layer | Path |
|-------|------|
| Web app | [`packages/web`](../packages/web) |
| API | [`packages/api`](../packages/api) |
| Shared | [`packages/shared`](../packages/shared) |

This top-level `src/` directory holds **pre-Vite / Next.js-era** copies of components and libs (~62 files). The production build uses **`packages/web`** only. Nothing in `npm run build` or Docker web images should import from here.

## Rules

- **Do not** add new features, routes, or components under `src/`.
- **Do not** delete this tree in ad-hoc cleanup — schedule an archive/removal pass after a full import audit.
- **Do** use [`docs/REPO_MAP.md`](../docs/REPO_MAP.md) and [`docs/CODE_CLEANUP_INVENTORY.md`](../docs/CODE_CLEANUP_INVENTORY.md) for repo navigation and cleanup planning.

If you find duplicate files here and under `packages/web`, treat **`packages/web` as authoritative**.
