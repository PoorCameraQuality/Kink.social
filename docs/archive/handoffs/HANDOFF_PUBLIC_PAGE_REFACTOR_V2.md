# Handoff — Public Page Refactor v2

**Date:** 2026-05-23  
**Plan (read-only):** `.cursor/plans/public-page-refactor-v2_025073c3.plan.md` — do not edit the plan file.  
**Status:** Implementation complete; dev verified after fixes below.

---

## What shipped

The public convention page (`/conventions/:slug`) is now a **post-registration attendee hub**, not a generic preview.

| Area | Behavior |
|------|----------|
| **Tabs** | Welcome (if guide JSON) → Documents → Announcements → Chat → ISO → Schedule → Dancecard → More |
| **Gating** | `hubAccessOk` = `hasPaidAccess \|\| isStaff \|\| canManage` (+ organizer preview roles). Welcome + Schedule stay public (schedule respects `publicProgramListing`). Other tabs show `RegisterToUnlockCard`. |
| **Hosted by** | `HostedByCard` under hero; API returns `logoUrl`, `tagline` (org bio), `isMember`. |
| **Chat** | `ChannelComposer` + `ChannelMessageList`, WS live updates, mark-read, reactions. Announcements composer = staff/organizer only. Org channels can lock to convention via `requires_convention_id`. |
| **More** | `VenueMapsList` + `ConventionGalleryGrid`; legacy custom pages under collapsed **More info**. |
| **Pin to feed** | Hero pin toggle; `GET /api/v1/me/convention-pins`; `PinnedConventionsRail` on home (signed-in, API-backed). |
| **Organizer settings** | New panels: **Gallery**, **Chat channels** (`eventSettingsConfig`: `gallery`, `channels`). |

---

## Start dev tomorrow

```bash
# Repo root — needs Postgres (Docker) per .env.development
npm run db:migrate-hub-ext -w @c2k/api   # required after pull; idempotent
npm run dev                               # web :5173, API :3001
```

**Preview URL:** http://localhost:5173/conventions/preview-c2k-weekend  

Useful query params: `?tab=Chat`, `?tab=More`, `?previewRole=attendee` (organizer/staff only).

**Organizer branding / gallery / channels:**

http://localhost:5173/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend?tab=settings&settingsPanel=branding

(Swap org slug if your seed differs; `preview-c2k-weekend` is in `packages/api/src/db/seed.ts`.)

---

## Critical ops notes (read first)

### 1. Hub DB migration — not only `db:push`

`npm run db:push -w @c2k/api` can fail on drizzle-kit expression-index bugs (Zod errors on `convention_locations` / `convention_tags` indexes). **Always run:**

```bash
npm run db:migrate-hub-ext -w @c2k/api
```

This applies (idempotent):

- `org_channels.requires_convention_id`
- `convention_gallery_images`
- `convention_pins`
- `convention_channel_reads`

Script: `packages/api/scripts/apply-hub-ext-migration.ts`

### 2. API must be on port 3001

Vite proxies `/api` → `http://127.0.0.1:3001`. If nothing listens on 3001, the browser shows **HTTP 500** on every API call (convention, slots, session, etc.).

Check:

```bash
netstat -ano | findstr ":3001"
```

Start API only:

```bash
npm run dev:api
```

Or full stack:

```bash
npm run dev
```

### 3. Duplicate route fix (2026-05-23)

**Do not re-add** `GET /api/v1/conventions/:key/maps` in `convention-hub-ext-routes.ts`. It duplicated the organizer route and caused **Fastify `FST_ERR_DUPLICATED_ROUTE`** → API crash on boot.

Attendee map reads use the **existing** organizer `GET …/maps` and `GET …/maps/:mapId/pins`, extended to allow `getConventionWithAccess().canView` or command `scheduler` permission.

---

## API routes added / changed

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/conventions/:key/gallery` | Public read |
| POST | `/api/v1/conventions/:key/gallery/upload` | Organizer (`staff_ops` or org mod) |
| POST/PATCH/DELETE | `/api/v1/conventions/:key/gallery/:imageId` | Organizer |
| POST/DELETE | `/api/v1/conventions/:key/pin` | Registered attendee |
| GET | `/api/v1/me/convention-pins` | Home rail: latest announcement + unread chat |
| POST | `/api/v1/conventions/:key/channels/:channelId/mark-read` | Chat tab |
| GET | `/api/v1/conventions/:key` | + `organizationSummary.logoUrl/tagline/isMember`, `isPinned` |
| GET | `/api/v1/organizations/:orgKey/channels` | `?forConventionId=<uuid>` filters + gates |
| PATCH | `/api/v1/organizations/:orgKey/channels/:channelId` | + `requiresConventionId` |

Hub routes registered in `packages/api/src/server.ts` via `registerConventionHubExtRoutes`.

Channel access helper: `packages/api/src/lib/convention-channel-access.ts` (`viewerCanAccessOrgChannel`).

---

## Key web files

| Component | Path |
|-----------|------|
| Public page (tabs, gating, chat, more) | `packages/web/src/app/conventions/[slug]/page.tsx` |
| Register CTA card | `packages/web/src/components/conventions/RegisterToUnlockCard.tsx` |
| Hosted by card | `packages/web/src/components/conventions/HostedByCard.tsx` |
| Chat composer / list | `ChannelComposer.tsx`, `ChannelMessageList.tsx` |
| More tab | `VenueMapsList.tsx`, `ConventionGalleryGrid.tsx` |
| Hero pin | `ConventionHero.tsx` |
| Home rail | `packages/web/src/components/home/PinnedConventionsRail.tsx` |
| Organizer gallery | `packages/web/src/components/dancecard/organizer/settings/GalleryPanel.tsx` |
| Organizer channel locks | `ChannelsPanel.tsx` |
| Settings panel ids | `eventSettingsConfig.ts` (`gallery`, `channels`) |

---

## Schema (Drizzle)

In `packages/api/src/db/schema.ts`:

- `orgChannels.requiresConventionId` → `conventions.id`
- `conventionGalleryImages`
- `conventionPins` (PK `user_id`, `convention_id`)
- `conventionChannelReads` (after `orgChannels` definition)

---

## Verification done this session

- `npm run db:migrate-hub-ext -w @c2k/api` — OK
- `npm run typecheck -w @c2k/api` and `-w web` — OK
- `GET http://127.0.0.1:3001/api/v1/conventions/preview-c2k-weekend` — **200**
- Same via Vite proxy on **5173** — **200**

---

## Not done / deferred (backlog)

Filed in `docs/BACKLOG_QUEUE.md`:

| ID | Title |
|----|--------|
| C212 | Convention chat sub-channels (separate from `org_channels`) |
| C213 | Attendee-uploaded gallery + moderation |
| C214 | Read receipts + threading UI |
| C215 | Web push for pinned convention activity |
| O75 | Transactional email (see `docs/EMAIL_NOTIFICATIONS_PROPOSAL.md`) |
| O76 | Inline join org from `HostedByCard` |
| O77 | Pinned-conventions digest email |

---

## Suggested manual smoke (15 min)

1. Open preview convention logged out → Schedule/Welcome public; Documents/Chat show register card.
2. Log in as seeded attendee with grant → Chat composer works; post message; second tab sees WS update.
3. Organizer: Settings → **Chat channels** → toggle “Restrict to attendees” on a channel.
4. Settings → **Gallery** → upload image → **More** tab shows gallery.
5. Pin convention on hero → Home shows **From your conventions** rail (if pins API returns data).
6. `?previewRole=attendee` as organizer → gated tabs unlock without real registration.

---

## Known issues

| Issue | Mitigation |
|-------|------------|
| `db:push` fails (drizzle-kit Zod on expression indexes) | Use `db:migrate-hub-ext` for hub tables; full push may need separate fix |
| Port 5173 in use → Vite uses 5174 | Use whichever port Vite prints; API stays 3001 |
| `hubAccessOk` vs `attendeeOk` | Schedule/my-schedule still use `canView`; gating uses `hubAccessOk` |
| Circular import risk | `organizations.ts` and `convention-organizer-routes.ts` import `getConventionWithAccess` from `conventions-routes.ts` — avoid new cross-imports |

---

## If something breaks again

1. Confirm API listening: `netstat -ano | findstr ":3001"`.
2. Read API terminal for `FST_ERR_DUPLICATED_ROUTE` or Postgres `relation does not exist`.
3. Run `npm run db:migrate-hub-ext -w @c2k/api`.
4. Restart `npm run dev:api` or `npm run dev`.

---

*End of handoff.*
