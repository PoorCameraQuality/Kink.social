# Prelaunch audit: backend API, database & data integrity

**Audit ID:** 02-backend-db-api  
**Date:** 2026-06-04  
**Scope:** API route registration, Drizzle schema, migration runners, seed/destructive scripts, convention/org data model (`schedule_slots`, `convention_registrants`, `convention_persons`, command/access grants), ECKE/Dancecard sync, import batches, permission enforcement.  
**Method:** Read-only codebase review + local `tsc --noEmit` on `@c2k/api`. **No fixes applied.**

**Primary references:** [`docs/FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) §4, [`packages/api/src/server.ts`](../../../packages/api/src/server.ts), [`packages/api/src/db/schema.ts`](../../../packages/api/src/db/schema.ts), [`packages/api/src/db/convention-organizer-schema.ts`](../../../packages/api/src/db/convention-organizer-schema.ts), [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) § Migrations delta.

---

## 1. Executive summary

C2K’s backend is a **single Fastify app** (`packages/api`) with **~60 route registrars** mounted from `server.ts`. Core social/calendar APIs live in the misleadingly named but **DB-backed** `ecosystem-stubs.ts`; conventions, organizations, and Command Bridge are split across dedicated modules. **TypeScript typecheck passes** for `@c2k/api` in this environment.

The database uses **Drizzle schema-as-code** (`schema.ts` + `convention-organizer-schema.ts`) applied via **`drizzle-kit push --force`**, supplemented by three **idempotent SQL-in-TypeScript** scripts. There are **no versioned SQL migration files** in the main app and **no `schema_migrations` ledger** — production safety depends on operator runbook discipline.

**Strengths:** Convention tables have sensible CASCADE rules on `convention_id`; `convention_registrants` has a unique `(convention_id, user_id)` index; registration flow calls `syncAccessGrantOnRegistration` + `syncConventionPeopleDirectory`; Command Bridge permissions are centralized in `convention-command-access.ts`; incremental SQL uses `IF NOT EXISTS` patterns; ECKE outbound state is tracked in `ecke_publish_targets`.

**Production risks:** Root `db:prepare` **swallows `db:push` failures** (`|| true`); **deploy workflow runs no migrations**; **`db:seed` wipes all tables by default**; **dual permission models** (org MODERATOR vs `convention_command_grants`) cause inconsistent access; several **soft FK columns** on `schedule_slots` and `schedule_slot_persons` allow orphan references; **pilot/smoke scripts default to seeded slugs** (`preview-c2k-weekend`, `demo-east-collective`) — routes themselves do not hardcode these, but ops tooling assumes seed data exists.

**Readiness:** API compiles and unit tests are wired in CI. A **greenfield production DB** can reach schema parity if operators run the documented sequence **and verify each step** — but automated deploy does not enforce this. Pilot launch requires **real org/convention rows**, platform staff seeding or env UUIDs, and **no reliance on demo seed slugs**.

---

## 2. Blockers

| # | Blocker | Evidence |
|---|---------|----------|
| B1 | **Deploy pipeline does not run DB migrations** | [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) — `git pull` + `docker compose up` only; no `db:push`, `db:migrate-incremental`, `db:migrate-hub-ext`, or `migrate-organizer-parity.ts` |
| B2 | **`db:prepare` masks schema push failures** | Root [`package.json`](../../../package.json): `db:push \|\| true` then incremental + **destructive seed** — incomplete schema can still seed |
| B3 | **Default `db:seed` is fully destructive** | [`packages/api/src/db/seed.ts`](../../../packages/api/src/db/seed.ts) calls `wipeDatabase()` unless `C2K_DB_WIPE=false`; [`wipe-database.ts`](../../../packages/api/src/db/wipe-database.ts) `TRUNCATE … CASCADE` on all `public` tables |
| B4 | **Conventions without `organization_id` cannot use Command Bridge** | [`convention-command-access.ts`](../../../packages/api/src/lib/convention-command-access.ts) returns no access when `!conv.organizationId`; [`conventions-routes.ts`](../../../packages/api/src/routes/conventions-routes.ts) `getConventionWithAccess` returns `forbidden` — schema allows nullable `conventions.organization_id` |
| B5 | **CI `check-db` only runs `db:push`, not incremental/parity scripts** | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) — tables/indexes defined only in `apply-incremental-migration.ts` may be **missing in CI DB** while tests pass on push-only schema |

---

## 3. High-risk issues

| # | Issue | Detail |
|---|-------|--------|
| H1 | **Dual convention permission models** | **Org MODERATOR+** gates legacy routes (`canManageConvention` in `conventions-routes.ts`); **Command Bridge** requires org **OWNER/ADMIN** or row in `convention_command_grants` (`convention-command-access.ts`). A MODERATOR can PATCH slots via legacy routes but get **403** on organizer console; a command-grant user can use Command Bridge but fail legacy `canManage` checks (access grants PUT, custom pages, etc.). |
| H2 | **`drizzle-kit push --force` is not append-only** | [`packages/api/package.json`](../../../packages/api/package.json) `db:push` — declarative diff can drop/rename columns; no rollback ledger. Requires backup before prod push. |
| H3 | **No migration version table** | Ordering is procedural (push → hub-ext → incremental → organizer-parity); no enforcement that incremental ran on a given deploy. |
| H4 | **`migrate-organizer-parity.ts` not in package.json scripts** | Manual `npx tsx packages/api/scripts/migrate-organizer-parity.ts` only — easy to skip; ~45 organizer tables/columns for ECKE 007–059 parity. |
| H5 | **Soft FKs on `schedule_slots`** | `location_id`, `track_id`, `presenter_offering_id` are bare UUIDs in [`schema.ts`](../../../packages/api/src/db/schema.ts) — no Drizzle `.references()`; deleted locations/tracks/offerings leave dangling IDs. |
| H6 | **`schedule_slot_persons.slot_id` has no FK** | [`convention-organizer-schema.ts`](../../../packages/api/src/db/convention-organizer-schema.ts) — `person_id` references `convention_persons`; `slot_id` is **not** constrained to `schedule_slots.id` — orphan slot-person links possible after slot delete. |
| H7 | **`syncConventionPeopleDirectory` does not prune stale rows** | [`convention-people-sync.ts`](../../../packages/api/src/lib/convention-people-sync.ts) upserts by `user_id` but never deletes `convention_persons` removed from registrants/grants/program — stale directory entries after unregister or role removal. |
| H8 | **Registrants without `user_id` excluded from people sync** | `syncConventionPeopleDirectory` skips `!r.userId` — guest/import registrants never appear in `convention_persons` (may be intentional but breaks “full people hub” if import-only rows exist). |
| H9 | **ECKE publish orphan deletes on remote Supabase** | [`ecke-publish-client.ts`](../../../packages/api/src/lib/ecke-publish-client.ts) deletes remote `dancecard_*` slots/staff/locations not in publish set — destructive on ECKE side; mis-publish can wipe attendee selections (vendor import docs warn similarly). |
| H10 | **Auth session fallback + mock login without DB** | [`resolve-viewer.ts`](../../../packages/api/src/auth/resolve-viewer.ts) anonymous `RopeDreamer` when fallback enabled; [`auth.ts`](../../../packages/api/src/routes/auth.ts) mock login from `mock-seeds.ts` when `USE_DATABASE !== 'true'`. |
| H11 | **Share routes always hit DB** | [`share-routes.ts`](../../../packages/api/src/routes/share-routes.ts) — no `USE_DATABASE` gate; OG HTML generation fails hard if DB down. |
| H12 | **Expression-index tables may exist only via incremental SQL** | Hub channels, `feed_activities`, `user_bookmarks`, `post_likes`, scope email tables duplicated/overlap between `apply-incremental-migration.ts` and `apply-hub-ext-migration.ts` — drift if only one script runs. |
| H13 | **Pilot/smoke scripts assume seeded slugs** | [`scripts/pilot-readiness-smoke.mjs`](../../../scripts/pilot-readiness-smoke.mjs), `audit-command-bridge.mjs`, `smoke-greenfield-registration.mjs` default `SMOKE_CONV=preview-c2k-weekend`, `PILOT_ORG_SLUG=demo-east-collective` — **fail on empty prod DB** unless env overridden. |

---

## 4. Medium-risk issues

| # | Issue | Detail |
|---|-------|--------|
| M1 | **`ecosystem-stubs.ts` monolith** | ~3k LOC hosts groups, events, vendors, DMs, notifications, connections — harder to audit permissions per domain; name implies stubs but is production path. |
| M2 | **`GET /api/v1/status` reports all phases `"implemented"`** | [`ecosystem-stubs.ts`](../../../packages/api/src/routes/ecosystem-stubs.ts) — misleading ops signal; not a runtime gate. |
| M3 | **`convention_registrants.user_id` ON DELETE SET NULL** | User deletion leaves registrant row with null `user_id` — breaks unique `(convention_id, user_id)` semantics for re-registration; door/check-in may reference stale email-only rows. |
| M4 | **`convention_registrants.category_id` ON DELETE SET NULL** | Category delete leaves registrants uncategorized — registration reports/filtering may show gaps. |
| M5 | **`organizations.owner_id` no ON DELETE** | [`schema.ts`](../../../packages/api/src/db/schema.ts) — deleting owner user may fail FK or leave inconsistent ownership vs `organization_members`. |
| M6 | **Import batch tables lightly used in routes** | `convention_import_batches`, `convention_import_rows`, `convention_import_mapping_profiles` defined in organizer schema — CSV flows write batches but **no automated orphan cleanup** if import aborted mid-flight. |
| M7 | **`registerConventionPublicRoutes` not awaited** | [`server.ts`](../../../packages/api/src/server.ts) line 196 — sync registration; unlikely race at boot but inconsistent with other `await register*` calls. |
| M8 | **`convention-attendee-routes` `requireDb()` checks `if (!db)`** | `db` export is always instantiated — **never honors `USE_DATABASE=false`** unlike most routes returning 503. |
| M9 | **Category backfill UPDATEs in incremental migration** | [`apply-incremental-migration.ts`](../../../packages/api/src/scripts/apply-incremental-migration.ts) lines 172–188 — idempotent on re-run but **mutates live `groups.category` / `vendor_profiles.category`** on first apply. |
| M10 | **`profiles.sexuality` column type widen** | Incremental migration `ALTER COLUMN sexuality TYPE varchar(128)` — one-way; safe but irreversible without dump/restore. |
| M11 | **Runtime venue migration** | [`venueRoomsMigration.ts`](../../../packages/api/src/lib/convention-organizer/venueRoomsMigration.ts) copies `conventions.settings.venueRooms` → `convention_locations` on first access — prod DB with only JSON settings may **silently migrate** on first organizer load (not in deploy checklist). |
| M12 | **ECKE config in JSON, not tables** | Dancecard host/slug/enabled live in `conventions.settings` jsonb — no DB constraint that `ecke_publish_targets.external_slug` matches settings. |
| M13 | **Public seed asset route** | [`public-seed-assets.ts`](../../../packages/api/src/routes/public-seed-assets.ts) `GET /api/public-seed/paf/:filename` — disk path for dev PAF images; should not be prod dependency. |
| M14 | **`C2K_PEOPLE_SYNC_QUEUE` documented but unused** | [`SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) — code uses `C2K_PEOPLE_SYNC_INLINE` / BullMQ queue name in `convention-people-sync-queue.ts` with different env surface. |

---

## 5. Low-risk issues

| # | Issue | Detail |
|---|-------|--------|
| L1 | **`drizzle/` output directory empty** | No generated snapshots committed — expected for push workflow but limits drift review in PRs. |
| L2 | **Vendor Dancecard SQL is separate stack** | `vendor/dancecard-eastcoast-export/database/*.sql` — ECKE Supabase only; not applied by C2K `db:push`. |
| L3 | **`seed-locations` skips when `places` non-empty** | Safe append; `places-seed.json` required for geo demos. |
| L4 | **Legacy event category strings in stubs** | `ecosystem-stubs.ts` maps `Munch`/`Workshop` — seeded rows only; greenfield uses normalized categories. |
| L5 | **CI does not run `npm run build -w @c2k/api`** | Typecheck only; `db:push` reads `dist/db/schema.js` — build happens inside `db:push` script locally. |
| L6 | **`convention_persons.id` correctly not used as identity** | `user_id` is optional bridge; aligns with strategic guidance — document for integrators. |
| L7 | **`import_key` on `schedule_slots`** | Unique index `(convention_id, import_key)` supports idempotent CSV re-import when keys stable. |

---

## 6. Dead/misleading UI found (backend-adjacent)

| Item | Location | Note |
|------|----------|------|
| Module name `ecosystem-stubs` | `packages/api/src/routes/ecosystem-stubs.ts` | Production DB handlers; name confuses auditors and extend-before-add rule. |
| `GET /api/v1/status` | Same file | All subsystems `"implemented"` regardless of env (ECKE disabled, S3 missing, etc.). |
| Feature registry stub note | `FEATURE_REGISTRY.md` § intro | Says stubs are DB-backed — accurate but filename still says stubs. |
| Smoke script names | `smoke-greenfield-registration.mjs` | Defaults to **seeded** `preview-c2k-weekend`, not truly greenfield. |
| `db:prepare` name | Root `package.json` | Implies safe prep; actually may wipe and seed dev data. |

---

## 7. Permission issues found

### Convention organization ownership

| Check | Implementation | Gap |
|-------|----------------|-----|
| Convention create | `POST /api/v1/conventions` requires `organizationId` + org **ADMIN** | Good for new rows; nullable column allows legacy/orphan conventions. |
| Legacy manage | `canManageConvention` → org **MODERATOR+** | Does not consult `convention_command_grants`. |
| Command Bridge | `requireConventionCommand` → OWNER/ADMIN **or** `convention_command_grants` | Org **MODERATOR** without grant → **denied**. |
| Access grants admin | `PUT .../access/:userId` | Requires `canManage` (MODERATOR+), not command grant. |
| Public registration | `convention-public-routes.ts` | Auth required; no org role — correct for attendee self-serve. |
| Door check-in | `userHasConventionCommandPermission(..., 'registration')` | Command grant `canRegistration` **or** full admin — org MODERATOR alone insufficient. |

### `convention_command_grants` (table)

Columns: `can_registration`, `can_staff_ops`, `can_scheduler`; UNIQUE `(convention_id, user_id)`. Managed via Command Bridge team routes in `convention-organizer-routes.ts`.

### `convention_access_grants` (table)

Attendance/door/program visibility: `role`, `paid_confirmed`, `attending_confirmed`, `staff_pre_access`, `can_assign_staff_schedules`. Synced on registration via `syncAccessGrantOnRegistration` in `convention-participation.ts`. Staff program visibility uses access grants + `programStaffAttendeeRoles` settings — **not** command grants.

### Organizations

`organizations.owner_id` required; `organization_members.role` ranks OWNER > ADMIN > MODERATOR > STAFF > MEMBER. `requireMinRole` in `organizations.ts` gates PATCH, forum, channels, events.

### Platform staff

Seed creates Brax admin and logs `C2K_PLATFORM_ADMIN_EMAILS` / `C2K_PLATFORM_MODERATOR_USER_IDS` — prod needs env or manual `platform_staff` rows ([`seed-legacy.ts`](../../../packages/api/src/db/seed-legacy.ts)).

---

## 8. Missing env/config

| Variable | Backend impact |
|----------|----------------|
| `USE_DATABASE=true` | Required; without it most `/api/v1/*` return **503** |
| `DATABASE_URL`, `DATABASE_SSL` | Connection; managed PG often needs SSL |
| `AUTH_SECRET` | Required in production for sessions |
| `AUTH_ALLOW_FALLBACK=false` | Prevents anonymous `RopeDreamer` viewer |
| `REDIS_URL` | BullMQ workers (notifications, ECKE publish, people sync, moderation) |
| `S3_*` | Upload routes, organizer assets, gallery |
| `ECKE_PUBLISH_ENABLED`, `ECKE_SUPABASE_URL`, `ECKE_SUPABASE_SERVICE_ROLE_KEY` | Outbound publish; without them `ecke_publish_targets` stays `never` |
| `C2K_PLATFORM_ADMIN_EMAILS`, `C2K_PLATFORM_MODERATOR_USER_IDS`, `C2K_SITE_ADMIN_USER_IDS` | Moderation/admin gates |
| `EXTERNAL_STORE_SECRET` | Vendor token encryption |
| `C2K_ECKE_PUBLISH_INLINE` | Dev only — skip Redis for ECKE jobs |
| `C2K_DB_WIPE` | Must be `false` or unset on any non-dev seed run |
| `BRAX_ADMIN_PASSWORD`, `DEMO_LOGIN_PASSWORD` | Seed/smoke only — must not ship to prod |

---

## 9. Recommended fixes

1. **Add migration step to deploy workflow** — at minimum `db:migrate-incremental`; document when to run hub-ext and organizer-parity; fail deploy on non-zero exit.
2. **Remove `|| true` from `db:prepare`** or split `db:prepare-dev` (wipe+seed) from `db:migrate-prod` (push + incremental only).
3. **Guard `db:seed` / `db:wipe`** with `NODE_ENV !== 'production'` or explicit `C2K_ALLOW_DESTRUCTIVE_DB=true`.
4. **Unify convention permissions** — either grant MODERATOR implicit command access or document/UI gate Command Bridge separately from “Manage” tab.
5. **Add FKs** for `schedule_slot_persons.slot_id`, `schedule_slots.location_id`, `schedule_slots.track_id` (with ON DELETE SET NULL).
6. **Prune stale `convention_persons`** in `syncConventionPeopleDirectory` or nightly job.
7. **Register `migrate-organizer-parity` in package.json** as `db:migrate-organizer-parity` and run in CI `check-db` after push.
8. **Extend CI** to run incremental + parity scripts and a smoke that does not depend on demo slugs.
9. **Add `schema_migrations` ledger** or hash log for incremental SQL files applied.
10. **Require `organization_id` NOT NULL** on new conventions via migration + backfill/delete orphan conventions.
11. **Gate `share-routes` and attendee routes** on `USE_DATABASE` consistently.
12. **Rename `ecosystem-stubs.ts`** to `ecosystem-routes.ts` (tracked follow-up PR).

---

## 10. Files likely affected

| Area | Paths |
|------|--------|
| Server / registration | `packages/api/src/server.ts` |
| Route modules | `packages/api/src/routes/*.ts`, `packages/api/src/routes/convention-organizer/*.ts` |
| Permissions | `packages/api/src/lib/convention-command-access.ts`, `packages/api/src/routes/conventions-routes.ts`, `packages/api/src/routes/convention-organizer/shared.ts` |
| Data sync | `packages/api/src/lib/convention-people-sync.ts`, `packages/api/src/lib/convention-participation.ts`, `packages/api/src/lib/ecke-publish-client.ts` |
| Schema | `packages/api/src/db/schema.ts`, `packages/api/src/db/convention-organizer-schema.ts` |
| Migrations | `packages/api/scripts/apply-incremental-migration.ts`, `packages/api/scripts/apply-hub-ext-migration.ts`, `packages/api/scripts/migrate-organizer-parity.ts` |
| Seed / destructive | `packages/api/src/db/seed.ts`, `seed-legacy.ts`, `wipe-database.ts`, `ecke-rich-seed.ts` |
| Config | `package.json`, `packages/api/package.json`, `packages/api/drizzle.config.cjs` |
| CI / deploy | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| Smokes | `scripts/pilot-readiness-smoke.mjs`, `scripts/audit-command-bridge.mjs`, `scripts/smoke-greenfield-registration.mjs` |

---

## 11. Suggested tests

| Test | Purpose |
|------|---------|
| `npm run typecheck -w @c2k/api` | Compile all route modules |
| `npm run test -w @c2k/api` | Unit tests incl. command permissions, ECKE sync, participation |
| CI `check-db` + **incremental + parity** | Schema matches code on fresh Postgres |
| `node scripts/audit-command-bridge.mjs` with `SMOKE_CONV=<pilot-slug>` | Route manifest vs registry |
| `node scripts/smoke-greenfield-registration.mjs` on **non-seed** convention | Registration → `convention_registrants` + `convention_access_grants` |
| Manual: MODERATOR without command grant | Legacy slot PATCH vs organizer GET 403 |
| Manual: command grant without MODERATOR | Organizer GET ok vs legacy access PUT 403 |
| Delete `schedule_slots` row | Verify `schedule_slot_persons` orphan behavior (document until FK added) |
| `syncConventionPeopleDirectory` after unregister | Confirm stale `convention_persons` (documents H7) |
| `npm run smoke:ecke-bridge -w @c2k/api` | ECKE publish path with env set |
| Prod: `GET /api/health/ready` with `database: ok` + spot-check `GET /api/v1/conventions` | Empty vs seeded |

---

## 12. Confidence level

**High (~80%)** for route inventory, table names, permission split, and migration script behavior — verified in source.

**Medium (~65%)** for exact prod DB drift (which incremental statements already applied on a long-lived dev DB) — no migration ledger.

**Medium** for compile status — `tsc --noEmit` passed in audit environment; CI typecheck on `main` is the authoritative gate.

---

## Migration / runbook notes

### Schema source of truth

| Artifact | Role |
|----------|------|
| `packages/api/src/db/schema.ts` | Core ~90+ tables (users, orgs, events, conventions, schedule, ECKE, social, vendors) |
| `packages/api/src/db/convention-organizer-schema.ts` | ~45 organizer tables (import, registration, people, command grants, policies, vetting) |
| `packages/api/drizzle.config.cjs` | Push config; reads **`dist/db/schema.js`** (build required) |

### Supplemental SQL runners (idempotent)

| Script | npm script | Purpose |
|--------|------------|---------|
| `scripts/apply-incremental-migration.ts` | `db:migrate-incremental` | Columns/tables push skips (expression indexes, hub overlap, bookmarks, feed_activities, enum values) |
| `scripts/apply-hub-ext-migration.ts` | `db:migrate-hub-ext` | Hub extension tables if missing |
| `scripts/migrate-organizer-parity.ts` | *(manual only)* | ECKE 007–059 organizer column/table parity |

### Local dev chain

```bash
npm run build -w @c2k/api
npm run db:push -w @c2k/api          # verify exit 0 — do not ignore
npm run db:migrate-hub-ext -w @c2k/api
npm run db:migrate-incremental -w @c2k/api
npx tsx packages/api/scripts/migrate-organizer-parity.ts   # if Command Bridge 500s on save
C2K_DB_WIPE=false npm run db:seed -w @c2k/api   # optional; default wipes
```

**Warning:** `npm run db:prepare` at repo root runs `db:push || true` then incremental then **full wipe+seed** — dev-only.

### Production deploy (per [`SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md))

1. Backup Postgres.
2. `npm run build -w @c2k/api`
3. `npm run db:push -w @c2k/api` — **stop on failure**
4. `npm run db:migrate-incremental -w @c2k/api` — every deploy
5. `npm run db:migrate-hub-ext -w @c2k/api` — if hub tables missing (first deploy or after hub feature)
6. `npx tsx packages/api/scripts/migrate-organizer-parity.ts` — if organizer parity errors
7. **Do not** run `db:seed` on production unless building a controlled demo environment.

---

## Data risk report

### Orphan / integrity risks

| Table / column | Risk | Severity |
|----------------|------|----------|
| `schedule_slot_persons.slot_id` | No FK to `schedule_slots` | High |
| `schedule_slots.location_id`, `track_id`, `presenter_offering_id` | Soft references | Medium |
| `convention_persons` | Not pruned when user unregisters | Medium |
| `convention_registrants` (`user_id` SET NULL on user delete) | Email-only ghost registrants | Medium |
| `convention_registrants` (`category_id` SET NULL) | Uncategorized after category delete | Low |
| `conventions.organization_id` NULL | Command Bridge blocked | High (operational) |
| `ecke_publish_targets` vs remote `dancecard_*` | ECKE orphan delete on publish | High (ECKE side) |
| `convention_import_batches` / `convention_import_rows` | Partial import state | Low |
| `dancecard_entries` / `convention_dancecard_share_links` | Tied to convention + users; CASCADE on convention delete | Low |

### Convention data flow (registration)

```
POST /api/v1/public/conventions/:key/registrations
  → upsert convention_registrants (UNIQUE convention_id + user_id)
  → syncAccessGrantOnRegistration → convention_access_grants
  → syncConventionPeopleDirectory → convention_persons + convention_person_role_assignments
```

**Gaps:** No transaction guarantee documented across all three in route handler (verify in `convention-public-routes.ts` for partial-failure behavior). People sync skips registrants without `user_id`.

### ECKE / Dancecard sync (C2K Postgres)

| Table | Role |
|-------|------|
| `ecke_publish_targets` | Outbound publish state per org/convention/article/vendor/event |
| `dancecard_entries`, `convention_dancecard_prefs`, `convention_dancecard_share_links`, `dancecard_booking_requests` | Attendee dancecard v2 on C2K |

**Remote:** ECKE Supabase `dancecard_events`, `dancecard_program_slots`, `dancecard_staff_shifts`, etc. (vendor SQL). Sync via HTTP in `ecke-dancecard-*-sync.ts` + `ecke-publish-executor.ts`.

### Import batches

| Table | Purpose |
|-------|---------|
| `convention_import_batches` | Batch metadata (`kind`: program \| staff; `status`) |
| `convention_import_rows` | Row-level staging |
| `convention_import_mapping_profiles` | CSV column mapping profiles |
| `schedule_slots.import_key` | Publish idempotency from program import |

### Seed script inventory

| Script | Destructive? | Assumes |
|--------|--------------|---------|
| `seed.ts` | Wipes by default | `USE_DATABASE=true` |
| `seed-legacy.ts` | Upsert | Demo slugs, Brax admin, PA geo |
| `seed-locations.ts` | No (skip if places exist) | `places-seed.json` |
| `ecke-rich-seed.ts` | Upsert | `demo-east-collective`, `preview-c2k-weekend` |
| `seed-moderation-demo.ts` | Upsert | `demo-east-collective` forum |
| `wipe-database.ts` | **TRUNCATE ALL** | `USE_DATABASE=true` |
| `ensure-preview-registration-categories.ts` | Upsert | `preview-c2k-weekend` |
| `ensure-preview-attendee-parity.ts` | Upsert | `preview-c2k-weekend`, `RopeDreamer` |

**Demo slugs (not required by route handlers, required by default smokes):** `demo-east-collective`, `preview-c2k-weekend`, `seed-demo-con-program`, `mid-atlantic-rope-social`.

---

## Backend blockers (summary)

1. **Automated migrations missing from deploy** — schema drift on prod until manual run.
2. **Destructive seed/wipe footguns** — `db:prepare` and default `db:seed`.
3. **Permission model split** — MODERATOR vs command grants breaks organizer workflows (see also audit 06 B-06-1).
4. **Nullable org on conventions** — Event Systems requires org-owned conventions.
5. **CI schema incomplete** — incremental/parity not applied in `check-db`.

---

## Safe migration sequence

**Fresh production database (recommended order):**

| Step | Command | Fail if |
|------|---------|---------|
| 0 | Postgres backup | — |
| 1 | `npm run build -w @c2k/api` | tsc errors |
| 2 | `USE_DATABASE=true DATABASE_URL=… npm run db:push -w @c2k/api` | non-zero exit |
| 3 | `npm run db:migrate-hub-ext -w @c2k/api` | SQL error |
| 4 | `npm run db:migrate-incremental -w @c2k/api` | SQL error |
| 5 | `npx tsx packages/api/scripts/migrate-organizer-parity.ts` | SQL error (if using Command Bridge) |
| 6 | Create pilot org/convention via API (not `db:seed`) | — |
| 7 | Set platform staff env or insert `platform_staff` | moderation/admin 403 |
| 8 | Run smokes with `SMOKE_CONV` / `PILOT_ORG_SLUG` pointing at **pilot** rows | — |

**Existing dev DB (upgrade only):** Steps 1–5 without step 6; never step `db:seed` without `C2K_DB_WIPE=false` on shared data.

**Rollback:** No automated down migrations — restore from backup; do not rely on `drizzle-kit push` to revert.

---

## API route registration summary

**Mount point:** [`packages/api/src/server.ts`](../../../packages/api/src/server.ts) (lines 156–219).

**Convention-related registrars (order matters for readability, not Fastify precedence):**

1. `registerConventionRoutes` — core CRUD, slots, access, program
2. `registerConventionHubExtRoutes` / `registerConventionHubChannelsRoutes`
3. `registerConventionIsoRoutes`
4. `registerConventionDancecardV2Routes`
5. `registerConventionOrganizerRoutes` + `registerConventionOrganizerExtensionRoutes`
6. `registerConventionPublicRoutes` — public registration, vendor apply, trusted roles
7. `registerConventionAttendeeRoutes` — attendee groups, volunteer shifts

**Ecosystem monolith routes in `ecosystem-stubs.ts`:** `GET/POST /api/v1/events`, groups, vendors, profiles, conversations, notifications, connections, activity inbox, conventions list, moderation job enqueue.

**Health:** `GET /api/health`, `GET /api/health/ready` (DB ping when `USE_DATABASE=true`).

**WebSocket:** `GET /api/ws` with `authorizeWebSocketSubscribe` — must stay aligned with scope permission changes per strategic guidance.

---

## Phase 3 Wave 1 fix (2026-06-04)

**Issue:** HTTP smoke `POST /api/auth/session returns 429 after rate limit exceeded` failed in full suite (137/138) because `rate-limit-config.ts` computed preset limits at **module load**; earlier tests loaded the module with default `max=10` before the smoke test set `C2K_RATE_LIMIT_LOGIN_MAX=2`.

**Fix:** `presetConfig()` reads env when each route's `rateLimitRoute()` is called. **Not an API contract change** — behavior matches intended runtime config. File: `packages/api/src/lib/rate-limit-config.ts`.

---

## Phase 3 Wave 2 fixes (2026-06-04)

| Audit finding | Wave 2 resolution |
|---------------|-------------------|
| `db:prepare` uses `db:push \|\| true` | Removed; push failures exit non-zero |
| `db:prepare` wipe+seed footgun | Blocked in production via `guard-not-production.mjs`; dev-only |
| No prod migrate script | `npm run db:migrate-prod` (push + hub-ext + incremental + organizer-parity) |
| Deploy skips migrations | GitHub deploy runs `db:migrate-prod` before compose |
| Seed/wipe unsafe in prod | `assertDestructiveDbAllowed` — requires `C2K_ALLOW_DESTRUCTIVE_DB_RESET=true` |
| `db:migrate-organizer-parity` not in package.json | Added to `packages/api/package.json` |

**Tests added:** `packages/api/src/lib/production-guard.test.ts`.

**Remaining:** FK gaps, permission unification, migration ledger, orphan convention_persons cleanup.

---

*End of audit 02. Cross-reference: deployment env gaps in [01-deployment-server-readiness.md](./01-deployment-server-readiness.md); event create permission mismatch in [06-event-workflows.md](./06-event-workflows.md).*
