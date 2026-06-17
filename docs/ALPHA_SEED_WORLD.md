# Alpha social seed world

Fictional, append-only database content for testing the kink.social social loop **without** client-side demo padding and **without** wiping East Coast Kink Events (ECKE) listings.

**Context:** On the **public-facing alpha** server, this seed creates **fictional `alpha_*` personas and posts** for structured QA. They are **not real community members** — do not present seed content as organic community proof.

**QA walkthrough:** After seeding, use [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) for step-by-step tester checklists. **VPS operator prep:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md).

## What it creates

| Area | Content |
|------|---------|
| Users | 15 `alpha_*` accounts with varied profiles and privacy |
| Social graph | Connections (accepted, pending, declined, ignored), follows, one block |
| Feed | ~20 posts, comments, reactions, one repost |
| Groups | 4 namespaced groups (public, private, invite-only) with forum threads |
| Events | Reuses existing upcoming events for RSVPs; adds alpha-only events for attendee visibility |
| Messaging | Accepted DM thread, pending message requests |
| Notifications | Connection, DM, and message samples (idempotent by `seedKey`) |
| Org/vendor/presenter | Minimal fictional org, vendor shop, presenter profile |

All new rows are tracked in `alpha_seed_batches` / `alpha_seed_items` under batch key **`alpha-social-seed`**.

## What it does **not** do

- No `db:wipe`, truncate, or delete of existing data
- No overwrite of ECKE-imported events, orgs, venues, education, or vendors
- No S3 uploads (placeholder image URLs only where needed)
- No production run unless explicitly forced (see below)

## How to run locally

```bash
# Docker Postgres + API env as usual
ALLOW_ALPHA_SOCIAL_SEED=true USE_DATABASE=true npm run seed:alpha-social
```

Equivalent from the API package:

```bash
ALLOW_ALPHA_SOCIAL_SEED=true USE_DATABASE=true npm run db:seed:alpha:social -w @c2k/api
```

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ALLOW_ALPHA_SOCIAL_SEED` | **Yes** (`true`) | Explicit opt-in |
| `USE_DATABASE` | **Yes** (`true`) | Use real Postgres |
| `ALPHA_SOCIAL_SEED_PASSWORD` | No | Login password for all `alpha_*` users (default: `AlphaSocial!23`) |
| `FORCE_ALPHA_SOCIAL_SEED_ON_PROD` | Only on prod | Extra gate if `NODE_ENV=production` |

## Staging

Use the same command on a staging database with `ALLOW_ALPHA_SOCIAL_SEED=true`. The script prints a warning when `DATABASE_URL` looks non-local.

**Do not** run on production without deliberate review and `FORCE_ALPHA_SOCIAL_SEED_ON_PROD=true`.

## Login

Default password: **`AlphaSocial!23`** (override with `ALPHA_SOCIAL_SEED_PASSWORD`).

Suggested accounts:

| Username | Scenario |
|----------|----------|
| `alpha_social` | Primary Home / Following walkthrough |
| `alpha_organizer` | Events, org-linked munch, connections hub |
| `alpha_newbie` | Sparse profile, pending connection + DM request |
| `alpha_connected` | Connections-only feed posts |
| `alpha_private` | Only-me feed posts |
| `alpha_quiet` | Undiscoverable, private profile, pending DM to them |
| `alpha_open_dm` | Open messaging preset |
| `alpha_connections_dm` | Connections-only messaging + pending request inbox |
| `alpha_blocker` / `alpha_blocked` | Block relationship |
| `alpha_hidden_member` | Hidden membership in private group (`alpha-social-private-circle`) |
| `alpha_mod` | Group moderator, forum threads |
| `alpha_educator` | Presenter profile, education guild |
| `alpha_vendor` | Vendor demo shop |

**Private group QA path (fictional seed):** slug `alpha-social-private-circle` — not listed on public `/api/v1/groups`; members reach it via **`GET /api/v1/me/groups`** as `alpha_hidden_member`. Non-members (`alpha_newbie`) should receive access denied / not found on group detail and forum APIs.

Emails: `alpha+<username>@example.test`

## Privacy scenarios covered

- Discoverable vs undiscoverable profiles (`alpha_quiet`)
- Blocked users (`alpha_blocker` → `alpha_blocked`)
- Accepted / pending / declined / ignored connections
- Open vs connections-only messaging
- Hidden group membership + private group forum (non-member Following exclusion)
- Connections-only and only-me feed posts
- Event attendee list `public` vs `count_only`
- RSVPs: going, maybe, waitlist on alpha and reused ECKE events
- Group join feed announcement on vs off

## Inventory before insert

The script prints existing table counts, ECKE batch sizes, and sample upcoming event titles, then summarizes what will be reused vs added.

## Cleanup

There is **no** destructive cleanup command for this batch yet (unlike `db:clear:alpha:ecke` for ECKE imports). To ignore seeded rows in manual testing, filter by `alpha_*` usernames or batch key `alpha-social-seed`. A future reversible clear script may mirror `clear-alpha-seed.ts` for this batch only.

## Related commands

| Command | Purpose |
|---------|---------|
| `npm run db:seed` | **Destructive** full legacy seed — do not confuse with alpha social |
| `npm run db:seed:alpha:ecke` | ECKE public listings import (separate batch) |
| `npm run db:clear:alpha:ecke` | Removes ECKE batch only |
