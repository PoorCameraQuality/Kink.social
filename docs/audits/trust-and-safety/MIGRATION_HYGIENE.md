# T&S migration hygiene — preflight (T&S-1.1)

**Date:** 2026-06-05  
**Scope:** How T&S-1 schema lands locally/CI when `drizzle-kit push` is unreliable  
**Related:** [`T&S-IMPLEMENTATION.md`](./T&S-IMPLEMENTATION.md), [`docs/technical-reference.md`](../../technical-reference.md) § db:push Zod errors

---

## Pre-existing blocker: drizzle-kit push + expression indexes

Convention organizer tables in `packages/api/src/db/convention-organizer-schema.ts` define **SQL expression unique indexes** on `lower(name)`:

| Table | Index |
|-------|-------|
| `convention_locations` | `convention_locations_conv_lower_name_idx` |
| `convention_tracks` | `convention_tracks_conv_lower_name_idx` |
| `convention_tags` | `convention_tags_conv_scope_lower_name_idx` |

Current `drizzle-kit push` can throw a **Zod parse error on `index.expression`** while introspecting or applying these indexes — even when Postgres is healthy and the indexes already exist. This is **pre-existing** (organizer parity / Dancecard work), not introduced by T&S-1.

**Symptom:** `npm run db:push -w @c2k/api` exits non-zero with a Zod validation failure referencing expression indexes on the tables above.

**Do not** treat a green Postgres as proof that push succeeded; verify the tables/columns you care about exist, or run the incremental script.

---

## Authoritative local path: `npm run db:prepare`

Root `package.json` chains (all steps joined with `&&` — **fail-fast**):

```
guard-not-production
  → wait-for-postgres
  → db:push -w @c2k/api
  → db:migrate-incremental -w @c2k/api
  → db:seed -w @c2k/api
  → db:ensure-preview-attendee-parity -w @c2k/api
```

| Step | Script | Role |
|------|--------|------|
| Wait | `scripts/wait-for-postgres.mjs` | Docker Postgres ready |
| Push | `drizzle-kit push --force` (via `@c2k/api`) | Applies most of `schema.ts` + organizer schema when push succeeds |
| Incremental | `packages/api/scripts/apply-incremental-migration.ts` | Idempotent SQL for columns/tables push may skip |
| Seed | `@c2k/api` seed | Dev data (destructive wipe by default — see prelaunch audit) |

### Does the chain continue after a Zod error?

**No — not automatically.** Root `db:prepare` uses `&&` without `|| true` (the old swallow was removed in prelaunch Wave 2). If `db:push` exits non-zero on the expression-index Zod failure, **`db:migrate-incremental` and `db:seed` do not run**.

**Recovery when push fails:**

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api   # applies T&S-1 + other skipped DDL
npm run db:seed -w @c2k/api                  # if fresh or empty DB
```

On setups where push completes (indexes already present, or drizzle-kit version behaves), the full `db:prepare` chain is sufficient and incremental is a no-op for already-applied objects.

---

## T&S-1 tables: applied via incremental migration

T&S-1 moderation foundation DDL lives in `packages/api/scripts/apply-incremental-migration.ts` under the `-- T&S-1: moderation foundation` block (cases, reports, queues, events, snapshots, risk flags, appeals, `moderation_actions.case_id`).

The file header states the contract:

> Idempotent SQL for columns/tables that `drizzle-kit push` may skip when expression-index Zod fails.  
> Extend this file when adding nullable columns or safe defaults — do not duplicate hub-ext tables here.

**Enums/tables (incremental, idempotent):**

- `policy_reason`, `policy_severity`, `moderation_queue`, `moderation_case_status`, `moderation_queue_item_status`, `preservation_status`, `external_escalation_status`, `moderation_appeal_status`
- `moderation_cases`, `moderation_reports`, `moderation_queue_items`, `moderation_events`, `content_snapshots`, `user_risk_flags`, `moderation_appeals`
- `moderation_actions.case_id` + index

**npm entry:** `npm run db:migrate-incremental -w @c2k/api` → `tsx scripts/apply-incremental-migration.ts`

Schema definitions remain in `packages/api/src/db/schema.ts` for Drizzle types and queries; **runtime apply** for T&S-1 is authoritative through incremental SQL during `db:prepare` (or manual incremental after a failed push).

---

## Recommendation for T&S-2

| Topic | Guidance |
|-------|----------|
| **`media_assets` table** | Add DDL to `apply-incremental-migration.ts` (same pattern as T&S-1). T&S-3 owns scan pipeline; T&S-2 is feed/education hide — but `media_assets` spine is planned in [`T&S-AUDIT.md`](./T&S-AUDIT.md) §4. |
| **drizzle-kit expression-index fix** | **Do not block T&S-2** on upstream drizzle-kit unless the fix is trivial (e.g. one-line config or pin bump). Incremental migration is the established C2K pattern (`docs/MASTER_NEXT_STEPS.md`, `docs/technical-reference.md`). |
| **Hub / organizer overlap** | Keep hub tables in `apply-hub-ext-migration.ts`; organizer parity in `migrate-organizer-parity.ts` — do not duplicate in incremental per file header. |

---

## CI / local verification gate

**Authoritative command pair:**

```bash
npm run db:prepare
npm run verify:trust-safety
```

| Script | What it runs |
|--------|----------------|
| `verify:trust-safety` | `scripts/verify-trust-safety-local.mjs` — Docker up → **`db:prepare`** → `scripts/verify-trust-safety.mjs` (unit + DB integration tests) |
| `verify:trust-safety:unit` | Tests only, no Docker / no `db:prepare` |
| `VERIFY_TS_E2E=1 npm run verify:trust-safety` | Above + Playwright `e2e/moderation-ts.spec.ts` |

Log directory: `docs/audits/trust-and-safety/verify-trust-safety.log`

**Production path (reference):** `npm run db:migrate-prod` — push → hub-ext → incremental → organizer-parity (not used by T&S local gate).

---

## Decision summary (T&S-1.1 preflight)

1. **Expression-index Zod on `convention_locations` / `convention_tracks` / `convention_tags` is pre-existing** — it can fail `db:push`; incremental SQL is the reliable apply path for T&S-1.
2. **`db:prepare` is authoritative** (wait → push → migrate-incremental → seed), but push failure **stops** the chain; run `db:migrate-incremental` manually if push exits non-zero.
3. **T&S-2 should extend `apply-incremental-migration.ts` for `media_assets`** (and related enums) rather than waiting on a drizzle-kit fix unless that fix is quick.
