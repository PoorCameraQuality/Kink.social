---
name: Group location & discovery
overview: Enhance group/event location UX, geographic group discovery, and a group-scoped mini event calendar aligned with the global event finder — without duplicating tables or routes.
status: completed
created: 2026-05-24
dependsOn:
  - docs/FEATURE_REGISTRY.md
  - docs/adr/003-irl-event-location-privacy.md
  - docs/EXTEND_BEFORE_ADD.md
todos:
  - id: loc-1-schema
    content: "Add groups.place_id (+ optional service_radius_mi) and PATCH/GET exposure"
    status: completed
  - id: loc-2-picker
    content: "Reuse /api/locations + places picker in group settings and event organizer"
    status: completed
  - id: loc-3-event-organizer
    content: "EventOrganizerPanel — public summary + full address + visibility helper copy"
    status: completed
  - id: disc-1-profile-geo
    content: "GET /api/v1/groups/nearby?lat=&lng=&radius= using profile geo + places"
    status: completed
  - id: disc-2-discovery-ui
    content: "Groups index / onboarding — recommended groups by distance"
    status: completed
  - id: cal-1-group-events
    content: "Group Events tab — ISO calendar, category filters, mod + Event CTA"
    status: completed
  - id: cal-2-group-finder
    content: "Link to /events?groupId= mini finder"
    status: completed
  - id: cal-3-create-anywhere
    content: "CreateFlowModal opens from ?create=event on any route"
    status: completed
isProject: true
---

# Group location, calendar & discovery plan

## Problem (from review)

- **Event organizer** location is a single text field; no place picker, no “public area” vs full address split in the UI (API supports `publicLocationSummary` + `locationVisibility`).
- **Group settings** have no home region — geographic groups cannot be ranked by distance.
- **Group Events tab** calendar did not plot API-backed events (date parser expected mock strings only).
- **`/events?create=event&kind=munch`** felt empty when the modal did not open (pathname guard + landing on list without modal).

## Principles (extend before add)

| Use | Don’t add |
|-----|-----------|
| `places` + `/api/locations/*` | Second geo table |
| `events` + `GET ?groupId=` | Parallel group_events table |
| `profile` geo (`/api/v1/profile/me/geo`) | Duplicate user location store |
| `rankEvents` / event finder filters | Second calendar component |

---

## Wave 1 — Location (groups + events)

### 1.1 Group home region (schema)

```sql
-- groups.place_id → places.id (nullable)
-- optional: service_radius_mi integer (default 50)
```

- **Settings UI** (`OrganizerGroupSettingsPanel`): “Home region” using existing place autocomplete (`/places` patterns).
- **Public hub** (`GroupCommunityShell`): show “Serving {city, ST}” + optional map link when `placeId` set.
- **PATCH** `PATCH /api/v1/groups/:id` accept `placeId` (moderator+).

### 1.2 Event location (organizer + create)

Align with [ADR 003](adr/003-irl-event-location-privacy.md):

| Field | UI label | When shown publicly |
|-------|----------|---------------------|
| `publicLocationSummary` | Area / venue name | Always when `location` redacted |
| `location` | Full address or URL | Per `locationVisibility` |
| `locationVisibility` | Public / RSVP / Approved | Helper text under select |

- **EventOrganizerPanel**: show both fields + 1-line privacy hint (done in code pass).
- **CreateFlowModal**: same pair on in-person step 1; optional “Use group home region” when `prefillGroupId` + group has `placeId`.

### 1.3 Munch defaults

- Default `publicLocationSummary` from group place label when creating with `prefillGroupId`.
- Keep `locationVisibility: rsvp` default for munches.

---

## Wave 2 — Group mini calendar & event finder

### 2.1 Group Events tab (member-facing)

Target UX (mini event finder):

1. **Month grid** — dots on days with events (ISO `startsAt`).
2. **Filters** — All | Munch | Social | Workshop (category chips).
3. **List** — `EventCard` grid sorted by date.
4. **Moderator CTA** — “+ Group event” → `/events?create=event&prefillGroupId=…&kind=munch` (optional).
5. **Footer link** — “Search all events near this group” → `/events?groupId={uuid}` (finder scoped to group).

### 2.2 Global finder integration

- **`/events` page**: read `groupId` query → fetch `GET /api/v1/events?groupId=` instead of global list; banner “Showing events for {group name}”.
- Reuse desktop filters (category, distance) where applicable; distance filter uses viewer profile geo vs event place (future: event `place_id`).

### 2.3 Organizer schedule

- Already lists group events + Manage links.
- Add “Calendar” subview toggle (same `GroupEventCalendar` component) on schedule tab.

---

## Wave 3 — Geographic discovery

### 3.1 API

`GET /api/v1/groups/nearby?lat=&lng=&radiusMi=50&limit=20`

- Join `groups.place_id` → `places.lat/lng`.
- Haversine or PostGIS when `geo_json` enabled.
- Respect `visibility` + membership rules.
- Fallback: state-level match if no lat/lng.

### 3.2 Surfaces

| Surface | Behavior |
|---------|----------|
| `/groups` index | “Near you” carousel when profile geo set |
| Onboarding / profile complete | Prompt for region → improves recommendations |
| Org hub | Subgroups sorted by distance (when org has many groups) |

### 3.3 Privacy

- Never expose exact member addresses.
- Group place is **organizer-chosen** public region, not GPS of members.

---

## Standalone group — features members may appreciate

| Feature | Value | Effort | Notes |
|---------|-------|--------|-------|
| **Home region + distance** | Find local groups | M | Wave 3 |
| **Group event calendar** | See munches at a glance | S | Wave 2 (in progress) |
| **Pinned next event** | Hero on Overview/Forums | S | Next event card in shell header |
| **#events channel / forum** | Async planning | M | Link forum category to Events tab |
| **Newcomer / vetting badge** | Trust | S | Extend group settings flags |
| **Recurring munch series** | Monthly meetups | L | Event series API (deferred) |
| **RSVP headcount on tab** | Social proof | S | Sum from event list |
| **Invite link / QR** | Growth | M | Settings → share URL |
| **Leadership election** | Governance | Done | Already on dormant flow |
| **ECKE listing** | Discovery off-platform | Done | Preview/publish bridge |
| **Photo gallery** | Culture | L | API pending for UUID groups |
| **Resources / links** | Dungeon rules, FetLife | M | Mock today; API later |

---

## Launch readiness — groups (honest snapshot)

| Area | Ready? | ~% | Blockers |
|------|--------|-----|----------|
| **Security** (POST/GET group events) | Yes | 90% | Audit only |
| **Organizer schedule + event manager** | Yes | 85% | Org subgroup create disabled on demo org |
| **Public group hub (API tabs)** | Partial | 65% | Forums yes; Events calendar was broken for API dates (fix shipping); mashed tabs if CSS fails |
| **Group settings persistence** | Partial | 50% | Description/tags TODO in UI |
| **Location / geo discovery** | No | 15% | No `groups.place_id`; no nearby API |
| **Mini event finder** | Partial | 55% | In-tab calendar + cards; no `/events?groupId=` yet |
| **Create munch flow** | Partial | 70% | Modal pathname fix shipping; needs visible “Munch” on step 1 |
| **Channels / photos / resources** | Mock only | 30% | Hidden on API groups intentionally |

**Overall groups v1 (local communities + munches): ~70% launch-ready** for a **closed beta** with moderators who accept settings/description gaps and no distance-based browse yet.

**~85%** after Wave 1–2 (location fields + group calendar + scoped finder).

**~95%** after Wave 3 (nearby groups + recommendations).

---

## Suggested implementation order

1. **Ship fixes** — calendar ISO, create modal anywhere, Events tab CTAs, event organizer location copy.
2. **Wave 2.2** — `/events?groupId=` scoped finder.
3. **Wave 1** — `groups.place_id` + settings picker.
4. **Wave 3** — nearby groups API + discovery UI.

---

## Manual smoke (after Wave 1–2)

1. Set group home region → appears on public hub.
2. Create munch with group prefill → public summary prefilled.
3. Group Events tab → event appears on correct calendar day.
4. `/events?groupId=` → only that group’s events.
5. `/events?create=event&kind=munch` from organizer schedule → modal opens with Munch selected.
