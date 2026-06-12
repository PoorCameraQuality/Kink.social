# Agent handoff — current product & implementation status

**Purpose:** Snapshot for future sessions (and humans) of what shipped recently and where the codebase stands. **Not** a user-facing doc; update when major slices land.

**Last meaningful work:** **2026-05-28 month-end** — Profile public/edit UX overhaul; `birthDate` + sexuality options; verified-host UI removed; **`ensureProfileForUserId`**. Prior: **2026-05-28 pass 23** organizer/safety (`GET /api/profile/me`, reports, staff invites). **Paused:** autonomous loop until next session — see [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) month-end banner.

---

## Next session — start here

1. **Canonical facts:** [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) → [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) §9 (resume after pause) → [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) **pass 24** → [`HANDOFF.md`](./HANDOFF.md) § 2026-05-28.
2. **Leadership %:** [`EXECUTIVE_PLATFORM_READINESS.md`](./EXECUTIVE_PLATFORM_READINESS.md) (~80–83% per master snapshot; refresh when resuming).
3. **Operational gaps (product / infra):**
   - **`realtime-bus`** is **in-process only** — multiple API replicas need **Redis pub/sub** before org/convention WS events fan out cluster-wide ([`REALTIME_SCALING.md`](./REALTIME_SCALING.md)).
   - **LiveKit** requires `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`; without them voice token returns **503**.
   - **Org digest email** uses `C2K_MAIL_TRANSPORT`; worker job `org-digest-sweep`.
   - **`db:push`** may fail on `lower(name)` expression indexes — use manual SQL + `npm run db:migrate-hub-ext -w @c2k/api` for hub tables.
4. **Quick verify locally:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   npm run db:prepare
   npm run dev
   ```
   - `/organizer` → org or group scope
   - `/groups/:uuid` → Forums, Events, Members (API)
   - `/support/branding` — staff guide
   - Demo: `RopeDreamer` / `demo`
5. **Still deferred / open:** Home feed **HTTP 500** on some local Near-you setups; friend/group schedule overlays beyond dancecard; payments native checkout. **Verified Host** product surface removed 2026-05-28 (profile **Event Verified** badge on members is separate).

---

## 1. Groups & events scope (G301–G312)

| Item | Location |
|------|----------|
| `GET /api/v1/events?groupId=` | `ecosystem-stubs.ts` |
| Group POST/PATCH event auth | `lib/group-access.ts` |
| `viewerCanManage` on event GET | `ecosystem-stubs.ts` |
| Group event organizer route | `/organizer/groups/:id/events/:eventId` → `EventOrganizerPanel` |
| CreateFlow munch + `prefillGroupId` | `CreateFlowModal.tsx` |
| E2E smoke | `e2e/smoke.spec.ts` |

---

## 2. Scope branding & social sharing

| Item | Location |
|------|----------|
| Schema columns | `groups.logo_url`, `banner_url`, `share_image_url`; `organizations.share_image_url`; convention `settings.shareImageUrl` |
| OG HTML for crawlers | `share-routes.ts` — `/share/groups|orgs|conventions/:key` |
| Organizer UI | `ScopeBrandingPanel.tsx`; `/support/branding` |
| Client meta | `ScopePageMeta` on public group/org/convention/event pages |
| Doc | [`BRANDING_AND_SOCIAL_SHARING.md`](./BRANDING_AND_SOCIAL_SHARING.md) |

**Note:** If `db:push` fails, apply branding columns via documented manual `ALTER TABLE` (see audit § Ops).

---

## 3. ADR 002 — org realtime, voice, digests (implemented)

### WebSocket (`GET /api/ws`)

- `packages/api/src/lib/ws-subscribe-auth.ts` authorizes `subscribe` for convention schedule, org channels, announcements.
- `packages/api/src/server.ts` — async check before `subscribeToScope`.

### Org hub Chat tab

- `OrgHubClient.tsx` — WS refetch on `org_channel_*` events.
- `OrgVoicePanel.tsx` + LiveKit token route when env set.

### Mail + digest

- `mailer.ts` + `org-digest-sweep.ts` when `C2K_MAIL_TRANSPORT` configured.

---

## 4. Conventions & organizer console

- One **`events`** row; optional **`conventions`** with `anchor_event_id` → **`schedule_slots`**.
- **Dancecard parity** done — ~147 organizer routes; web at `/organizer/orgs/:slug/conventions/:convSlug`.
- **Event Systems identity** Phase 1–2 done; Phase 3+ pending ([`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md)).
- Public hub v2: gallery, pins, channel read — hub-ext migration required.

---

## 5. Backlog queue (pending)

**C212–C215**, **O75–O77** — see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md).  
**Not in queue:** Identity Phase 5+, group location plan (`docs/plans/group-location-discovery.plan.md`).

---

## 6. Group location (nearby discovery)

- Schema: `groups.place_id`, `groups.service_radius_mi` (default 50).
- API: `GET /api/v1/groups/nearby?lat=&lng=&radius=` (or signed-in profile geo / `placeId`).
- Web: `GroupSettingsPanel` home region; `/groups` **Near you** tab; public hub “Serving {placeLabel}”.
- Migrate: `npm run db:migrate-incremental -w @c2k/api` when `db:push` fails.

## 7. Operational commands

```bash
npm run build -w @c2k/shared    # if db:push module resolution fails
npm run db:push -w @c2k/api     # or db:prepare
npm run db:migrate-incremental -w @c2k/api
npm run db:migrate-hub-ext -w @c2k/api
npm run typecheck
npm test
npm run test:e2e
npm run start:worker -w @c2k/api
```

---

## 8. Risks / follow-ups

- **`publicProgramListing`:** Omitted → treated as public; vetting-heavy orgs should turn **off** in Manage.
- **WS + horizontal scale:** Bus is single-node until Redis bridge exists.
- **Group settings:** Description/tags PATCH may still lag GET shape in UI copy.
- **`og-default.png`:** Added under `packages/web/public/` (minimal fallback; replace with 1200×630 brand asset later).

---

*End of handoff note.*
