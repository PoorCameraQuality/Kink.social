# ECKE Publish — Group Dashboard

**Status:** Pass 4 — group listing + group event listings live  
**Route pattern:** `/organizer/groups/:id?tab=ecke` (UUID id, matches existing group shell)

---

## Current state

| Item | Location |
|------|----------|
| Group organizer shell | `packages/web/src/app/organizer/groups/[id]/OrganizerGroupClient.tsx` |
| Tabs today | `home`, `schedule`, `people`, `communications`, `moderation`, `settings`, `tools` — `types.ts` L1–9 |
| ECKE UI today | `EckePublishStub` embedded in **Settings** only — `OrganizerGroupSettingsPanel.tsx` L185–190 |
| Group publish API | Unified control plane + legacy `ecke-publish-routes.ts` L1611–1746 |
| Group unpublish | **Pass 3** — unified control plane + listing webhook `action: unpublish` |
| Queue/retry | **Missing** — inline `publishListingToEcke` (legacy + Pass 3 service) |

Home checklist already nudges ECKE listing — `OrganizerGroupClient.tsx` L217–221.

---

## Proposed tab: ECKE

Add `ecke` to `ORGANIZER_TABS` in `packages/web/src/lib/organizer/types.ts`.

New panel: `packages/web/src/app/organizer/groups/[id]/OrganizerGroupEckePanel.tsx`

Permission: same as settings — `canAccessGroupOrganizerSettings` (group owner/admin/mod or parent org owner).

---

## Sub-sections (cards/tabs)

| Section | Content |
|---------|---------|
| **Overview** | Bridge status, last sync, error summary, publish history link |
| **Group Listing** | `group_listing` — preview/publish/sync/unpublish |
| **Events** | Public group-hosted standalone events (via `event_listing`) |
| **Education** | Group-owned public articles (when ownership model allows) |
| **Venues / Dungeons** | Org-linked or group-flagged places (Pass 6) |
| **Vendors / Sponsors** | Group-owned vendors (Pass 5) |
| **Dancecard** | Only when group operates a convention with Dancecard enabled |
| **Publish History** | `ecke_publish_targets` rows for group scope |

---

## Per-card UI (reuse components)

Each card shows:

- Source item name (kink.social)
- ECKE target type + affected pages
- Status badge: never / draft / published / stale / error / unpublished
- Last published time; stale indicator
- ECKE public URL when published
- **Preview** → `EckePublishPreviewDrawer` (plain English + omitted fields)
- **Publish / Sync / Unpublish**
- Eligibility and privacy warnings

---

## API wiring

Phase 1 (registry): unified endpoints with `sourceKind=group_listing&sourceId=<uuid>`.

Phase 2 (compat): existing routes remain:

```
GET    /api/v1/organizer/ecke-publish/groups/:groupId
POST   /api/v1/organizer/ecke-publish/groups/:groupId/preview
POST   /api/v1/organizer/ecke-publish/groups/:groupId/publish
POST   /api/v1/organizer/ecke-publish/groups/:groupId/unpublish  ← add
POST   /api/v1/organizer/ecke-publish/groups/:groupId/sync       ← add (alias publish when stale)
```

Group events (Pass 4):

```
GET    /api/v1/organizer/ecke-publish/groups/:groupId/items
       → registry scan of publishable child entities
```

---

## Preview copy example

```
This will appear on East Coast Kink Events as:
Title: Mid-Atlantic Rope Collective
URL: https://www.eastcoastkinkevents.com/groups/mid-atlantic-rope
Description: [public description excerpt]
Organizer: Parent Org Name
CTA: https://kink.social/groups/[id]

This will not be sent:
- Member list
- Private group description
- Internal moderation notes
- RSVP data
```

Raw JSON in collapsible debug section only.

---

## Acceptance criteria (Pass 3)

1. Group mod can open ECKE tab and see bridge connected/disconnected state.
2. Private group shows eligibility warning; publish disabled.
3. Public group can preview and see exact posted vs omitted fields.
4. Publish stores status in `ecke_publish_targets` and returns ECKE URL when available.
5. Content change marks status `stale`; sync updates ECKE.
6. Unpublish is idempotent and clears public listing.
7. Normal member cannot access ECKE tab (403).
8. Parent org owner can publish subgroup listing.

---

## Pass 2 Implementation Notes

- ECKE tab live at `/organizer/groups/:id?tab=ecke` for group moderators
- `OrganizerGroupEckePanel` shows overview, group listing preview, events (when group-owned), planned sections, read-only history
- Preview drawer uses plain English + omitted fields list; raw JSON in disclosure
- Publish/Sync/Unpublish buttons disabled with “Coming in Pass 3”
- Settings tab still contains legacy `EckePublishStub` write path (unchanged)

---

## Pass 3 Implementation Notes

- Group Listing card: **Publish to ECKE**, **Sync ECKE listing**, **Unpublish from ECKE**, **Preview public listing** enabled when eligible
- Other sections (events, education, vendors, venues, Dancecard) remain read-only/planned from Pass 2
- Transport label shown: `listing_webhook`; warning when ECKE public URL is estimated (webhook did not return URL)
- Stale banner: “This group has changed since it was last published to ECKE. Sync to update the public listing.”
- Confirmation copy before publish/unpublish per privacy contract
- Private/hidden groups: publish disabled with plain-English reason
- API wired via group-scoped POST routes calling shared service logic
- Legacy `EckePublishStub` in Settings tab unchanged for backward compatibility

**Expansion addendum:** Pass 3 ships minimal group listing only. Richer public-safe group data (schedules, map pins, resources, recurring meetups) is tracked in `ECKE_PUBLISH_PARITY_AUDIT.md` expansion candidates; preview will gain a **deferred** category in later passes.

---

## Pass 4 Implementation Notes

- Events section enabled: per public group event card with preview, publish, sync, unpublish
- Location visibility badge and hidden-address warning in preview drawer
- Preview shows deferred fields (schedule blocks, map pins, accessibility, etc.) as “ECKE may not display yet”
- `group_listing` card unchanged
- Legacy organizer event routes and Settings stub unchanged

