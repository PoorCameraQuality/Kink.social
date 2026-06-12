# Organizer integration — review log

**For:** Human review between loops (not user-facing)  
**Workflow:** audit → implement → test → log here → next loop  
**Architecture:** [`PLATFORM_VISION.md`](./PLATFORM_VISION.md) · [`ECKE_C2K_ENTITY_MAP.md`](./ECKE_C2K_ENTITY_MAP.md)

---

## How the loop works

Each loop: **audit** (code + privacy) → **plan** (minimal diff) → **implement** → **test** (typecheck + unit) → **log** (this file) → **next**.

You review this document when convenient; work continues unless you redirect.

---

## Loop 1 ✓ — Organizer shell (2026-05-21)

**Shipped:** `/organizer` hub, org/group tab IA, `GET /api/v1/organizer/scopes`, ECKE/payments placeholders, DancecardOpsCard reframe.

**Review:**
- [ ] Tab IA matches how your org owners think (home / schedule / people / comms / settings / tools)
- [ ] Mod+ gate is correct (not too loose for settings)
- [ ] Convention redirect to Manage tab is acceptable interim

**Docs:** [`ORGANIZER_CONSOLE.md`](./ORGANIZER_CONSOLE.md)

---

## Loop 2 ✓ — Publish bridge foundation (2026-05-21)

**Shipped:**
- [`ECKE_C2K_ENTITY_MAP.md`](./ECKE_C2K_ENTITY_MAP.md) — row-level mapping contract
- `ecke_publish_targets` table — preview/publish sync state + content hashes
- Payload builder (`ecke-publish-payload.ts`) — org listing, convention listing, Dancecard program
- `GET/POST .../ecke-publish/{organizations|conventions}/:slug[/preview]`
- Settings tab: live status + **Build publish preview**

**Review:**
- [ ] Entity map: correct C2K columns → ECKE targets? Missing fields?
- [ ] Slug defaults (`convention.slug` vs `settings.dancecardSlug` / `eckeListingSlug`) match your ops workflow
- [ ] Privacy: hidden orgs → `visibility: hidden` on listing payload — sufficient?
- [ ] `schedule_slots.id` as Dancecard `externalKey` — OK for upsert in Loop 3?

**Env (Loop 2):** none required for preview-only mode.

---

## Loop 3 ✓ — Outbound publish + People hub (2026-05-21)

**Shipped:**
- `ecke-publish-client.ts` — Dancecard write to ECKE Supabase; listing via optional webhook
- `POST .../ecke-publish/{organizations|conventions}/:slug/publish`
- People hub: `GET /api/v1/organizer/people/organizations/:slug` (+ conventions variant)
- `OrganizerPeoplePanel` — presenters, staff, directory with ECKE-publishable badge
- Schedule tab: per-convention **ECKE preview / Publish** buttons
- Settings tab: **Publish to ECKE** when bridge connected

**Review:**
- [ ] OK to write ECKE Supabase directly from C2K API (service role in C2K env)?
- [ ] Dancecard program replace-all — document attendee selection wipe until slot upsert (Loop 5+)
- [ ] Listing webhook only — need ECKE-side receiver built?
- [ ] People hub: sufficient for presenter/staff workflow before full bind UI?

**Env:** see table above in Loop 3 section.

---

## Loop 4 ✓ — Settings migration (2026-05-21)

**Shipped:** `OrganizerOrgSettingsPanel` + `useOrgAdminSettings` on organizer Settings tab (replaces interim Admin link). Convention Manage in context was already shipped (Feature A).

**Queued:** Group-level ECKE listing publish — blocked until group `ecke-publish` API exists (see BACKLOG C7 skipped).

---

## Loop 6 ✓ — Staff publish + slot edit (2026-05-21)

**Shipped (O5):**
- `convention_volunteer_shifts` sync to ECKE `dancecard_staff_shifts` on Dancecard publish (orphan delete + UUID upsert)
- Preview/publish API returns `staffShiftCount`

**Shipped (O6):**
- Program grid **Edit existing** → modal PATCH for title, room, track, times, description

**Deferred:** Presenter / per-slot staff assignment UI in grid modal (API exists: `PUT .../slots/:id/presenters`, `PUT .../slots/:id/staff`) — **presenters shipped O7**; slot-staff still deferred.

---

## Loop 7 ✓ — Social profile + presenters (2026-05-21)

**Shipped (C29–C30):** Profile localStorage banner + API-backed stats row (connections, trust, orgs/groups)

**Shipped (O7–O8):** Presenter multi-select + session staff multi-select in program slot edit modal

**Shipped (O9):** Two-step program slot delete in edit modal + list (replaces `window.confirm`)

**Shipped (O10–O11):** Empty program grid hint; create modal title validation + disabled Save

**Shipped (O12):** Edit modal end-before-start inline validation + disabled Save

**Shipped (O13–O14):** Title autofocus on slot modal; Escape to dismiss

**Shipped (O15–O16):** Backdrop click dismiss; busy guard on Escape/backdrop during save

**Shipped (O17–O18):** Delete guarded while busy; Cancel disabled during save/delete

**Shipped (O19):** List Edit disabled / blocked while slot save or delete in flight

**Shipped (O20):** Create session blocked while busy — `openCreateModal` guard + disabled selection button

**Shipped (O21):** Clear grid selection disabled during slot save/delete

**Shipped (O22):** Grid drag-to-select ignored while slot modal save/delete in flight

**Shipped (O23):** List Delete blocked while edit modal open or save/delete in flight

**Shipped (O24):** List Edit blocked while any slot modal is open

**Shipped (O25):** `dismissModal()` clears delete armed state on modal dismiss

**Shipped (O26):** List delete Confirm cleared when create/edit modal opens

**Shipped (O27):** Grid selection cleared when create modal opens

**Shipped (O29):** Modal delete confirm Cancel clears armed delete state

**Shipped (O30):** Escape disarms list delete Confirm when edit modal is closed

**Shipped (O31):** Armed list delete shows Confirm delete label + Escape hint

**Shipped (O33):** Program organizer load error red banner with Retry

**Shipped (O34):** CSV import success/error banner with Dismiss; success auto-clears after 8s

**Shipped (O35):** Convention settings load error red banner with Retry

**Shipped (O36):** Settings save emerald/red banner; Saved. auto-clears after 5s

**Shipped (O37):** Staff shifts error red alert banner with Dismiss

**Shipped (O38):** Program grid operational errors use dismissible red alert banner

**Shipped (C110):** ECKE preview/publish success/error banner with Dismiss; success auto-clears after 8s

**Shipped (O39):** Organizer people panel load error red banner with Retry

**Shipped (O40):** Settings save error banner includes Dismiss button

**Shipped (O41):** Verified CSV import errors persist until manual Dismiss

**Shipped (O42):** CSV import disabled with Importing… label while import + refresh in flight

**Shipped (O43):** Export CSV disabled while CSV import in flight

**Shipped (O44):** CSV export failure shows red alert banner with Dismiss

**Shipped (O45):** Export busy guard with Exporting… label; import/export mutually exclusive

**Shipped (O46):** Verified export errors persist until manual Dismiss

**Shipped (O47):** Verified import/export mutual busy lock

**Shipped (O48):** Verified CSV export success is silent (download only)

**Shipped (O49):** Verified slot validation errors stay inline; ops errors use banner

**Shipped (O50):** Verified program grid operational err does not auto-clear

**Shipped (O51):** Verified settings Saved. auto-clears after 5s

**Shipped (O52):** Verified staff shift errors do not auto-clear

**Shipped (O53):** Verified import success auto-clears; errors persist

**Shipped (O54):** Verified import error does not auto-clear

**Shipped (O55):** Verified settings save errors do not auto-clear

**Shipped (O56):** Verified organizer people load error does not auto-clear

**Shipped (O57):** Verified program organizer loadErr does not auto-clear

**Shipped (O58):** Added Dismiss on program loadErr banner

**Shipped (O59):** Verified event settings loadErr does not auto-clear

**Shipped (O60):** Added Dismiss on event settings loadErr banner

**Shipped (O61):** Verified org settings loadError does not auto-clear

**Shipped (O62):** Event settings dismiss loadErr shows unavailable panel; `loadAttempted` prevents infinite Loading

**Shipped (O63):** Verified unavailable panel persists after dismiss loadErr

**Shipped (O64):** Event host edit Saved. auto-clears after 5s; errors persist

**Shipped (O65):** Program dismiss loadErr shows unavailable panel via programLoadAttempted

**Shipped (O66):** Org settings dismiss loadError shows unavailable panel via loadAttempted

**Shipped (O67):** Dismiss added to organizer people LoadErrorBanner

**Shipped (O68):** Verified org settings unavailable panel persists after dismiss

**Shipped (O69):** Verified people loadError does not auto-clear

**Shipped (O70):** People panel dismiss loadError shows unavailable; empty roster uses neutral copy

**Shipped (O73):** ECKE publish dismiss loadError shows unavailable panel via loadAttempted/loadOk

---

## Loop 5+ — queued

- Real payments/ticketing
- ECKE Dancecard attendee runtime sync validation on ECKE repo
- Presenter directory sync to ECKE public pages
- Slot upsert preserving attendee selections

---

## Open decisions (need your call eventually)

1. **ECKE listing ingest** — Supabase `public.events` vs static `events.js` vs new webhook on ECKE Next.js?
2. **Organizer auth on ECKE** — retire HMAC handoff once publish bridge is live?
3. **Group ECKE listings** — separate slug namespace or inherit parent org?

---

*Agent appends a Loop N section when each loop completes.*
