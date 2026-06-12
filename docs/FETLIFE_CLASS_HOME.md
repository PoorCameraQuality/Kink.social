# FetLife-class home — product & engineering plan

**Last updated:** 2026-06-06 (F1–F5 shipped; Near-you 500 open per [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md))

**Status:** **F1–F5 shipped** (2026-05-26); **home IA V2-6** (2026-05-27) — polish Track B in [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md)  
**Purpose:** Single reference for turning C2K `/home` into a connection-aware activity home (FetLife “Following” parity axis), without duplicating org/convention/event systems already shipped elsewhere.

**Do not implement from this doc in the same PR as unrelated work.** Ship in phases below; track in [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md). **Product phase:** Following feed is **Phase 2** — organizer pilot is Phase 1 ([`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) §2, §9). **Build order:** F1 write path → F2 API → F3 UI (align §9 there with phases below). **Scale notes:** pull feed + indexes to ~100k MAU; fan-out/Redis before celebrity-scale (see §10).

**Broader social parity (non-home):** FetLife release features captured for Phase 2 — co-hosts, follow/ignore, rich editors, public events, grouped notifications, etc. — live in [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) (`SG-###` IDs). De-Fetlife in UX/copy; match capability.

---

## 1. What “FetLife-class” means here

| FetLife pattern | C2K today | Target |
|-----------------|-----------|--------|
| **Following** feed (people you follow) | `GET /api/v1/feed` is **global chronological** `feed_posts`; connections API exists but is **not** the feed engine | Primary home mode: **Following** scoped to accepted `connections` |
| **Activity cards** (loved X, commented, followed, posted) | Kinds: `status`, `article`, `repost`, `connection_like` — author posts, not aggregated activity | `feed_activities` stream with typed cards + actor + target |
| **Filter by activity type** | Home tabs are **discovery rails** (Local, Events, Conventions, …) | Following rail + filters: Posts, Pictures, Events, Groups, … |
| **Write on home** | `HomeFeedRichComposer` on Local tab | Keep composer; default visibility = followers when Following is default |
| **Pinned / groups / events** | Strong on org hub & convention hub | **Surface in Following** via activity emission, not separate silos |

C2K is **ahead** on orgs, conventions, Event Systems, and hub chat. This plan closes the **social graph home** gap (~35–45% → ~80% on that axis) without a third calendar or forum stack.

---

## 2. Page information architecture (titles & nav)

### 2.1 Route & document title

| Item | Value |
|------|--------|
| Path | `/home` (unchanged) |
| `<title>` | `Home · Coast to Coast Kink` |
| `h1` (visually hidden or compact) | `Home` |

### 2.2 Primary modes (shipped)

| Mode ID | Label | URL | UI location |
|---------|-------|-----|-------------|
| `following` | **Following** | `/home?mode=following` | `CommunityNavBar` feed pill → `HomePageClient` Following column |
| `discover` | **Near you** (Local tab) | `/home?mode=discover&tab=Local` | Same nav + `LocalHomeFeed` |

**Default for signed-in users with ≥1 accepted connection:** `following`.  
**Default otherwise:** `discover`.

**Global chrome (2026-05-27):** `CommunityNavBar` in `RootLayout` — not duplicated inside home. Browse links (Events, Conventions, …) set `?mode=discover&tab=…` or highlight when pathname matches (`/events`, `/groups`, etc.). Implementation: `packages/web/src/lib/community-nav.ts`, `packages/web/src/components/CommunityNavBar.tsx`.

### 2.3 Discover sub-tabs (browse sections — same data sources)

| Current tab | Discover label | Notes |
|-------------|----------------|-------|
| Local | **Near you** | Posts + location |
| Events | **Events** | `useApiEvents` |
| Conventions | **Conventions** | Pinned rail + list |
| People | **People** | Discovery rank |
| Groups | **Groups** | Nearby join rail |
| Vendors | **Vendors** | |
| Education | **Education** | |
| Trending | **Trending** | |

### 2.4 Following sub-filters (new)

| Filter | Activity types included |
|--------|-------------------------|
| All | Everything below |
| Posts | `status`, `article`, `repost` |
| Reactions | `connection_like`, future `post_love`, `post_comment` |
| Events & conventions | `event_rsvp`, `convention_pin`, `schedule_publish` (emitted) |
| Groups & orgs | `group_join`, `org_announcement` (emitted) |

Persist last mode + filter in `user_settings` (extend existing feed settings row).

---

## 3. Feed overhaul — data model

### 3.1 Keep `feed_posts` (author-centric)

No migration away from `feed_posts` for **original content**. Following mode **includes** posts where `author_id IN (following_ids ∪ self)`.

### 3.2 Add `feed_activities` (activity-centric)

```sql
CREATE TABLE feed_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verb varchar(32) NOT NULL,  -- post | love | comment | follow | rsvp | repost | ...
  object_type varchar(32) NOT NULL,
  object_id uuid NOT NULL,
  target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX feed_activities_created_idx ON feed_activities (created_at DESC);
CREATE INDEX feed_activities_actor_idx ON feed_activities (actor_id, created_at DESC);
```

**Verbs (v1):** `post`, `repost`, `connection_accepted`, `connection_like`, `event_rsvp`, `convention_pin`.  
**Verbs (v2):** `post_love`, `post_comment`, `group_join`, `org_announcement`, `gallery_upload`.

Emit activities in **existing write paths** (do not add parallel post tables):

| Write path | Verb |
|------------|------|
| `POST /api/v1/feed` (create post) | `post` |
| `POST /api/v1/connections/:id/accept` | `connection_accepted` |
| `feed_posts` kind `connection_like` | `connection_like` |
| `PUT /api/v1/events/:id/rsvp` | `event_rsvp` |
| `POST /api/v1/conventions/:slug/pin` | `convention_pin` |

### 3.3 Following graph

Use existing `connections` (`status = ACCEPTED`). Define:

```typescript
followingIds(viewerId) = accepted partners ∪ { viewerId }
```

Optional v2: org/group **watch** edges — separate table; not required for v1.

---

## 4. API surface

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/v1/feed/following` | Cursor paginated; merges activities + posts from `followingIds`; respects user feed settings (hide connection likes, etc.) |
| GET | `/api/v1/feed/following/counts` | Optional unread/new counts per filter |
| PATCH | `/api/v1/me/feed-preferences` | Extend: `homeMode`, `followingFilter`, existing hide flags |

**Query params:** `cursor`, `limit`, `filter=all|posts|reactions|events|groups`.

**Response card shape (unified):**

```json
{
  "items": [{
    "id": "…",
    "kind": "activity",
    "verb": "event_rsvp",
    "actor": { "id", "username", "displayName", "avatarUrl" },
    "summary": "RSVP'd to …",
    "object": { "type": "event", "id", "slug", "title" },
    "createdAt": "…",
    "deepLink": "/events/…"
  }]
}
```

Keep `GET /api/v1/feed` for **global/discover** Local composer timeline during transition; deprecate as default once Following is stable.

---

## 5. Web implementation map

| File / area | Change |
|-------------|--------|
| `packages/web/src/app/home/HomePageClient.tsx` | Mode switch Following / Discover; move tabs under Discover |
| `packages/web/src/lib/feed-types.ts` | `FollowingFeedItem`, mapper from API |
| `packages/web/src/components/home/FollowingFeed.tsx` | **New** — card list + filters + empty states |
| `packages/web/src/components/home/ActivityFeedCard.tsx` | **New** — verb-specific layout (reuse card masterclass) |
| `packages/web/src/components/cards/LocalPostCard.tsx` | Use from Following for `verb=post`; **Wave 5 (2026-06-06):** reactions Love/Respect/Sympathize/Helpful; actions Discuss/Repost/Share/Report — `@c2k/shared/feed-reactions.ts` |
| `packages/api/src/routes/feed-routes.ts` | Register following routes; activity emit helpers in `lib/feed-activities.ts` |

**Empty states (copy):**

- No connections: “Follow people to see their activity here” + CTA → People discover
- Connections but empty feed: “Nothing yet — check Discover for events near you”

---

## 6. Phased delivery

| Phase | Scope | Est. |
|-------|--------|------|
| **F1 — IA** | Mode toggle, titles, Discover tab rename only; no API change | 1–2 days |
| **F2 — Following posts** | `/feed/following` posts-only from `connections`; composer default audience | 2–3 days |
| **F3 — Activities table** | Migration + emit on 4–5 write paths + activity cards | 3–5 days |
| **F4 — Filters & prefs** | Sub-filters, settings persistence, hide rules | 2 days |
| **F5 — Org/convention emit** | RSVP, pin, org announcement activities | 2–3 days |

**Total:** ~2–3 weeks focused; can run F1 immediately without schema.

---

## 7. Non-goals (this initiative)

- Replacing org hub, convention hub, or Event Systems organizer
- Guest / email-only identities
- Second forum or chat stack
- Full FetLife “pictures” album model (use gallery + post attachments first)
- Real-time WebSocket home feed (polling / cursor is fine for v1)

---

## 8. Success metrics

- Signed-in user with connections sees **only** following-scoped items in Following mode (manual + E2E).
- Posting from home appears in a follower's Following within one refresh.
- Discover mode parity: no regression on existing 19 E2E smoke paths.
- `FEATURE_REGISTRY.md` updated when routes ship.

---

## 9. Related docs

- [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) — route registry
- [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) — one user per person (feed actors)
- [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) — priority queue
- [`adr/002-org-realtime-chat-and-digests.md`](./adr/002-org-realtime-chat-and-digests.md) — org activity emit candidate

---

## 10. Scalability (1M+ users)

| Tier | Approach |
|------|----------|
| **v1 (F2–F3)** | Pull feed: `followingIds` capped (e.g. 2k); keyset cursor on `feed_activities` + `feed_posts`; index `(actor_id, created_at DESC)`; async activity insert via worker |
| **~100k MAU** | Usually sufficient for kink-community graph density |
| **500k+ / hot home** | Fan-out on write → per-user timeline (Redis ZSET or `user_feed_items`) |
| **Celebrities** | Never pull-merge 100k actors; dedicated fan-out + notification caps |

Do not ship global chronological home as default at scale.

---

## 11. Decision log

| Question | Decision |
|----------|----------|
| Extend `feed_posts` vs only activities? | **Both** — posts stay; activities aggregate everything else |
| Global feed default? | **No** for signed-in users with connections |
| Third calendar model? | **No** — emit from existing events/conventions |
