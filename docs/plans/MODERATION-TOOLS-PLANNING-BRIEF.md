# C2K Moderation Tools — Planning Brief

**Status:** **Complete (moderation alpha pass, 2026-06-06)** — Phases A–E shipped. Do **not** extend this branch with Community Reputation work; start reputation on a new branch.

**Purpose:** Hand this document to a planning agent (GPT or otherwise) to finish moderation tooling across the website. It describes what exists today, what is wired where, how each tier of moderator works, who can see what, and what gaps remain.

**Last audited:** 2026-06-06 (implementation + verification gate green)

**Product frame:** C2K is an organizer-first community OS. Moderation follows **ADR-004 multi-tier model**: org/group stewards handle ~95% of scoped community issues; **platform trust & safety** handles cross-scope harm, critical policy categories, and media cases. **AI summarizes; humans decide** — no autonomous resolution.

---

## Table of contents

1. [Role hierarchy & who can see what](#1-role-hierarchy--who-can-see-what)
2. [Policy routing — what escalates to site/platform moderators](#2-policy-routing--what-escalates-to-siteplatform-moderators)
3. [Report intake — surfaces wired vs missing](#3-report-intake--surfaces-wired-vs-missing)
4. [Moderator workflows by tier](#4-moderator-workflows-by-tier)
5. [API inventory](#5-api-inventory)
6. [Database schema](#6-database-schema)
7. [UI routes & panels](#7-ui-routes--panels)
8. [Media & photo moderation (separate paths)](#8-media--photo-moderation-separate-paths)
9. [Notifications & async workers](#9-notifications--async-workers)
10. [Known gaps & alpha blockers](#10-known-gaps--alpha-blockers)
11. [Recommended finish-out sequence](#11-recommended-finish-out-sequence)
12. [Key file index](#12-key-file-index)

---

## 1. Role hierarchy & who can see what

### Tier 0 — Site admin (`SITE_ADMIN`)

**Identity:** `platform_staff.role = SITE_ADMIN` or env `C2K_SITE_ADMIN_USER_IDS`.

**Powers (exclusive or override):**
- View **`MINOR_SAFETY_RESTRICTED`** queue (platform mods cannot)
- Rule-of-two **override**: `POST /api/v1/moderation/actions/:id/execute-now`
- Immediate **identity ban**, **org freeze**, **user suspend** (no second approver)
- Propose `IDENTITY_BAN`, `FREEZE_ORG`, `SUSPEND_USER` (platform mods can propose but site admin required to propose these action types)

**UI access:** All `/moderation/*` routes + `/moderation/admin` (break-glass: freeze org, identity ban).

---

### Tier 1 — Platform moderator (`MODERATOR`, `TRUST_SAFETY_ADMIN`)

**Identity:** `platform_staff.role` in `{ MODERATOR, TRUST_SAFETY_ADMIN, SITE_ADMIN }` or env `C2K_PLATFORM_MODERATOR_USER_IDS`.

**Additional roles on same table:**
- `TRUST_SAFETY_ADMIN` — T&S + legal-alpha privileged routes; counts as platform mod for API
- `LEGAL_ADMIN` — legal-alpha routes only; **not** in generic platform mod set unless also MODERATOR

**Powers:**
- Full `/moderation/*` console (except site-admin-only pages and restricted queue)
- T&S case dashboard, queues, case detail, media review viewer
- Legacy report inbox triage
- Rule-of-two enforcement proposals (hide, lock, scope ban, resolve) — **≥2 distinct approvers** before execute
- Profile review flags queue
- DMCA admin (T&S admin or site admin)
- Media show approve (`POST /api/v1/moderation/media/shows/:id/approve`)

**Cannot do without site admin:**
- View `MINOR_SAFETY_RESTRICTED` queue
- Execute-now override
- Direct identity ban / org freeze / suspend

**Gate check:** `GET /api/v1/moderation/me` → `{ moderator, siteAdmin, trustSafetyAdmin, legalAdmin, role }`.

**Important:** Org/group/convention moderator roles **do not** grant `/moderation/*` access unless the user also has `platform_staff`.

---

### Tier 2 — Organization moderator (`OWNER`, `ADMIN`, `MODERATOR`)

**Rank:** `OWNER (5) > ADMIN (4) > MODERATOR (3) > STAFF (2) > MEMBER (1)` — see `ORG_ROLE_RANK` in `packages/api/src/lib/org-moderation-access.ts`.

| Role | Moderation access |
|------|-------------------|
| OWNER, ADMIN, MODERATOR | Reports inbox, hide content, scope bans, thread lock (API), slow mode |
| STAFF | Organizer console entry but **blocked** from moderation tab |
| MEMBER | No mod tools |

**UI:** `/organizer/orgs/:slug?tab=moderation` (`OrganizerOrgModerationPanel`).

**Public hub inline tools:** `/orgs/:slug` — Hide button on forum posts; report on forum/chat; ban message for scope-banned users.

**Audit log:** `GET .../moderation/audit` requires **ADMIN+** (MODERATOR cannot view audit).

---

### Tier 2 — Group moderator

**Identity:** Group `owner`, `admin`, or `moderator`; plus **parent org owner** (even without group membership).

**Powers (API + organizer panel):**
- List group-scoped reports; triage PATCH
- Hide forum posts; lock/pin threads
- Create/list/lift scope bans
- Moderation audit log

**UI:** `/organizer/groups/:id?tab=moderation` — **`OrganizerGroupModerationPanel`** (inbox, bans, audit). Public group hub mod controls deferred (organizer panel is primary).

---

### Tier 2 — Convention / event staff

**Two parallel permission tracks:**

1. **Org role on owning org:** `canManageConvention()` = org MODERATOR+
2. **Command bridge grants:** `convention_command_grants` with `canStaffOps`, `canRegistration`, `canScheduler` — org OWNER/ADMIN get implicit full access; org MODERATOR alone does **not** get hub mutations without grant

**Convention moderation (no `scope_bans` for conventions):**
- Gallery approve/reject (`PATCH .../gallery/:imageId/moderation`) — requires `staff_ops`
- ISO board remove/restore
- ISO comment hide
- Attendee group hide/archive

**No convention member ban table.** Event discussion: host hide/lock API shipped (2026-06-06); convention hub chat message hide via staff_ops.

---

### Permission matrix (quick reference)

| Action | Site admin | Platform mod | Org MOD+ | Group mod | Conv staff_ops |
|--------|:----------:|:------------:|:--------:|:---------:|:--------------:|
| View platform T&S cases/queues | ✓ (restricted queue: admin only) | ✓ | ✗ | ✗ | ✗ |
| View scoped org reports | ✓ | ✓ | ✓ | ✗ | ✗ |
| View scoped group reports | ✓ | ✓ | ✗ | ✓ | ✗ |
| Hide forum/chat content | via case/action | via case/action | ✓ direct | ✓ API only | partial |
| Lock/pin threads | via action | via action | ✓ | ✗ (enforced if locked, no lock API) | ✗ |
| Scope ban (org/group) | via action | via action (2 approvals) | ✓ | ✓ POST only | ✗ |
| Identity ban | ✓ immediate | propose only | ✗ | ✗ | ✗ |
| Freeze org | ✓ immediate | propose only | ✗ | ✗ | ✗ |
| Media quarantine review | ✓ | ✓ | ✗ | ✗ | ✗ |
| Convention gallery approve | ✗ (scoped) | ✗ | ✗ | ✗ | ✓ |
| Moderator timeout | **Not implemented** | — | — | — | — |
| Moderator mute | **Not implemented** (user mutes are personal feed filters) | — | — | — | — |

**Soft hide only:** Moderation uses `hidden_at` columns, not hard delete. T&S can `remove_media` on cases.

---

## 2. Policy routing — what escalates to site/platform moderators

### Canonical policy reasons (`@c2k/shared` → `POLICY_REASONS`)

15 values: `MINOR_SAFETY`, `CSAM_SUSPECTED`, `NCII`, `AI_DEEPFAKE_NCII`, `DOXXING_OUTING`, `HARASSMENT_THREATS`, `IMPERSONATION`, `HIDDEN_CAMERA_LEAKED`, `TRAFFICKING_COERCION`, `COMMERCIAL_SEX_SOLICITATION`, `ILLEGAL_GOODS_SERVICES`, `SPAM_SCAM`, `CONSENT_SAFETY`, `EXPLICIT_VISIBILITY_VIOLATION`, `OTHER`.

Helpers: `severityForPolicyReason()`, `queueForPolicyReason()`, `isP0PolicyReason()`.

### Queue routing (`queueForPolicyReason`)

| Policy reason | Queue |
|---------------|-------|
| CSAM, minor safety | `MINOR_SAFETY_RESTRICTED` (site admin only) |
| NCII, AI deepfake NCII, hidden camera | `NCII_URGENT` |
| Explicit visibility violation | `MEDIA_REVIEW` |
| Spam/scam | `SPAM_ABUSE` |
| Most others | `GENERAL_REVIEW` |

### P0 auto-routing (platform T&S, ≤60s notify — **wired 2026-06-06**)

`P0_POLICY_REASONS`: CSAM, minor safety, NCII, AI deepfake NCII, hidden camera, trafficking.

All member reports via `createReport()` create **platform** `moderation_cases`. Org/group/event scoped intake is **mirrored** to legacy `reports` rows via `mirrorReportToLegacyInbox`.

### Always platform (local mods must not bury)

From `docs/trust-safety/SCOPED_MODERATION_GAP_AUDIT.md` and public policy pages:

- Minor safety / CSAM
- NCII / consent / hidden camera / AI deepfake
- Doxxing / outing
- Credible threats
- Trafficking / coercion
- Commercial sex solicitation
- Illegal goods
- Leadership abuse / staff-mod-organizer impersonation
- Cross-scope harm patterns

### Local mods handle (scoped)

- Spam, off-topic, local rules violations
- Bad-faith behavior within scope
- Scoped hide, lock, ban
- **Unless** category is in critical list above

### Report scope for legacy inbox (`resolveReportScope`)

| Target type | Scope |
|-------------|-------|
| Org forum/chat | `organization` |
| Group forum | `group` |
| Event discussion | `event` |
| Profile, feed, education, media | `platform` |

**Dual-stack (resolved 2026-06-06):** T&S intake writes `moderation_cases` **and** mirrors scoped targets to legacy `reports` for org/group/event inboxes. Platform-only targets remain case-only.

### Photo/media escalation rules

**Not everything goes to site moderators.** Three tiers:

1. **GREEN-lane profile media** — auto-publish; no mod review until reported or scan-flagged
2. **YELLOW-lane** — quarantine + `MEDIA_REVIEW` queue → **platform moderator**
3. **RED / P0** — `MINOR_SAFETY_RESTRICTED` or `NCII_URGENT` → platform T&S; restricted queue → **site admin only**

**Member report on `media_asset` or `profile_photo`** → always platform T&S case (queue by policy reason).

**Convention gallery** → scoped staff approval; does **not** auto-escalate to platform unless member reports.

**Group photos** → not wired (mock only).

**Avatars** → no moderation pipeline (`profiles.avatarUrl` only).

---

## 3. Report intake — canonical path (complete)

### Canonical intake

| Endpoint | UI | Reason picker |
|----------|-----|---------------|
| `POST /api/v1/moderation/reports` | `ReportAction` → `TsReportModal` → `useSubmitReport` | Canonical `PolicyReason` |

Legacy `POST /api/v1/reports` remains an API alias; **`ContentReportDialog` has no web callers** (kept for backward compat).

### Wired surfaces (in-context report)

| Surface | Component | Target types | Endpoint |
|---------|-----------|--------------|----------|
| Profile (other user) | `TsReportModal` | `profile` | T&S |
| Profile photos | `TsReportModal` via `ProfilePhotoGallery` | `media_asset`, `profile_photo` | T&S |
| Group forums | `TsReportModal` | `group_forum_thread`, `group_forum_post` | T&S |
| Home/following feed | `ContentReportDialog` via `LocalPostCard` | `feed_post` → `post` | Legacy |
| Saved posts, share/post, tag pages | `LocalPostCard` | `feed_post` | Legacy |
| Education article detail | `ContentReportDialog` | `education_article` ⚠️ | Legacy |
| Media show detail + directory cards | `ContentReportDialog` | `media_show` ⚠️ | Legacy |
| Event discussion | `ContentReportDialog` | `event_discussion_thread/post` ⚠️ | Legacy |
| Org hub (overview, forums, chat) | Inline modal in `OrgHubClient` | `organization`, `platform_organization`, `org_forum_*`, `org_channel_message` | Legacy |
| Platform support | `PlatformReportForm` | `platform`, `support` | Legacy |

⚠️ = target type used in UI but **not** in canonical `MODERATION_REPORT_TARGET_TYPES` (17 types in API) — may fail validation or need alias mapping.

### Redirect-only (no in-context modal)

| Surface | Behavior |
|---------|----------|
| `/messaging` | "Report" → `/support` |
| Notifications safety footer | → `/support` |
| Connections overflow | → `/support` |

### Missing report buttons (T&S-5+ backlog)

| Surface | Notes |
|---------|-------|
| **Direct messages** | No per-message/conversation report |
| **Group chat channels** | `ChannelPostsSection` — no report |
| **Convention channel chat** | `ChannelMessageList` — no report |
| **`media_episode`** | Label exists; no UI |
| **Event entity** | Discussion only; no "report this event" |
| **Presenter pages** | No report |
| **People directory** | No report |
| **Group photos/resources/events tabs** | No report |
| **Education directory cards** | Detail page only |
| **Mock feed posts** | Flag hidden when `post.source !== 'api'` |

**Registry:** `packages/web/src/lib/moderation/report-labels.ts` documents all target types and wired surfaces.

**Finish-out goal:** ✅ Complete (2026-06-06) — see [`../audits/trust-and-safety/UGC_REPORT_SURFACE_AUDIT.md`](../audits/trust-and-safety/UGC_REPORT_SURFACE_AUDIT.md) and T&S-5.

---

## 4. Moderator workflows by tier

### Platform moderator daily flow

1. **Land on** `/moderation/dashboard` — open case counts by queue/severity; NCII alerts; minor-safety count (site admin only)
2. **Triage inbox** — `/moderation/queues?queue=MEDIA_REVIEW` (or other queue)
3. **Open case** — `/moderation/cases/:caseId`
   - Read member reports, content snapshot (blurred until Reveal)
   - For media: quarantined preview via `/api/v1/moderation/cases/:id/media-content`
   - Add internal notes, assign, change status
   - Take action: `mark_no_violation`, `close_duplicate`, `escalate`, `keep_quarantined`, `remove_media`, `restore_media`
   - `hide_content` exists in API but **no UI button**
4. **Legacy reports** — `/moderation/reports` for older inbox (status: Open → In review / Resolved / Dismissed)
5. **Rule-of-two** — `/moderation/actions` — approve/reject pending proposals; site admin can execute-now
6. **Profile flags** — `/moderation/profile-flags` — peer downvote surge flags
7. **Audit** — `/moderation/audit` — read-only event log

**Reference:** `docs/audits/trust-and-safety/MODERATOR_WORKFLOW.md`

### Org moderator daily flow

1. **Land on** `/organizer/orgs/:slug?tab=moderation`
2. **Inbox tab** — org-scoped reports; triage: In review / Resolve / Dismiss
3. **Bans tab** — add ban, lift ban, optional **escalate to platform** checkbox
4. **Audit tab** — OWNER/ADMIN only
5. **Public hub** — inline Hide on forum posts; report buttons on forum/chat
6. **Communications tab** — forum categories, chat channels, slow mode (not report queue)

**Escalation:** Org ban with `escalateToPlatform: true` → creates platform report + `moderation_report_escalated` notification.

### Group moderator flow (2026-06-06)

1. `/organizer/groups/:id?tab=moderation` — inbox triage, bans, audit via **`OrganizerGroupModerationPanel`**
2. API: hide content, thread lock, scope bans (GET/DELETE), PATCH report status
3. Public group hub — report via `ReportAction` on forums; inline hide/ban on hub deferred (organizer panel primary)

### Convention staff flow

1. Gallery: `ConventionGalleryGrid` — approve/reject pending uploads
2. Organizer integrations: `IsoModerationPanel`, `AttendeeGroupsModerationPanel`
3. No platform T&S console access unless also platform staff

---

## 5. API inventory

### Member-facing

```
POST /api/v1/moderation/reports          # Canonical T&S intake
POST /api/v1/reports                     # Legacy alias → same createReport()
GET  /api/v1/me/moderation/reports       # Reporter history (T&S) — web prefers this; falls back to /me/reports
GET  /api/v1/me/reports                  # Legacy reporter history
```

### Platform T&S admin (require `requirePlatformModerator`)

```
GET  /api/v1/moderation/me
GET  /api/v1/moderation/dashboard
GET  /api/v1/moderation/queues
GET  /api/v1/moderation/cases
GET  /api/v1/moderation/cases/:caseId
GET  /api/v1/moderation/cases/:caseId/media-content
PATCH /api/v1/moderation/cases/:caseId
POST /api/v1/moderation/cases/:caseId/notes
POST /api/v1/moderation/cases/:caseId/actions
GET  /api/v1/moderation/trust-safety/config
GET/POST /api/v1/moderation/media-hash-list
```

### Legacy platform inbox + rule-of-two

```
GET  /api/v1/moderation/summary
GET  /api/v1/moderation/reports
GET  /api/v1/moderation/reports/:reportId
PATCH /api/v1/moderation/reports/:reportId
GET  /api/v1/moderation/actions
POST /api/v1/moderation/actions
POST /api/v1/moderation/reports/:reportId/propose-action
POST /api/v1/moderation/actions/:actionId/approve
POST /api/v1/moderation/actions/:actionId/reject
POST /api/v1/moderation/actions/:actionId/execute-now   # Site admin only
GET  /api/v1/moderation/audit
GET  /api/v1/moderation/profile-review-flags
PATCH /api/v1/moderation/profile-review-flags/:flagId
```

### Site admin only

```
POST /api/v1/moderation/admin/organizations/:orgKey/freeze
POST /api/v1/moderation/admin/identity-bans
POST /api/v1/moderation/admin/users/:userId/suspend
```

### Org-scoped (require org MODERATOR+)

```
GET/PATCH /api/v1/organizations/:orgKey/reports
POST .../forum/posts/:postId/hide
POST .../forum/threads/:threadId/moderate    # lock, pin
POST .../channels/:channelId/messages/:messageId/hide
POST/DELETE/GET .../bans
GET .../moderation/audit                     # ADMIN+
```

### Group-scoped

```
GET  /api/v1/groups/:groupId/reports
POST /api/v1/groups/:groupId/forum/posts/:postId/hide
POST /api/v1/groups/:groupId/bans
```

### Convention-scoped

```
PATCH /api/v1/conventions/:key/gallery/:imageId/moderation
POST  /api/v1/conventions/:key/iso-board/moderate
PATCH /api/v1/conventions/:key/iso/comments/:commentId
GET/PATCH /api/v1/conventions/:key/attendee-groups/moderation
```

### User social (not mod tools)

```
GET/POST/DELETE /api/v1/me/blocks
GET/POST/DELETE /api/mutes/me
```

---

## 6. Database schema

### Two parallel report systems

| Stack | Tables | Used by |
|-------|--------|---------|
| **T&S-1 (new)** | `moderation_cases`, `moderation_reports`, `moderation_queue_items`, `content_snapshots`, `moderation_events` | `POST /moderation/reports`, `/moderation/cases/*` |
| **Legacy** | `reports`, `moderation_actions`, `moderation_action_approvals` | Org/group inboxes, legacy platform reports, rule-of-two |

Cases link via `moderation_cases.legacy_report_id`.

### Enforcement tables

| Table | Scope | Notes |
|-------|-------|-------|
| `scope_bans` | organization, group | `expires_at` column exists but API never sets it (no timeout) |
| `identity_bans` | platform | IP/device ban |
| `blocks` | user-to-user | Self-service |
| `mutes` | user feed filter | Self-service; not mod-imposed |

### Content moderation columns (soft hide)

- `forum_posts.hidden_at`, `forum_threads.locked_at`
- `org_channel_messages.hidden_at`
- `convention_gallery_images.moderation_status`
- `media_assets.*` + `moderation_case_id`

### Not implemented

- `content_flags`, `user_sanctions`, moderator timeout tables
- `SUSPEND_USER` action writes audit only — no user suspension column

**Schema source:** `packages/api/src/db/schema.ts` + `packages/api/scripts/apply-incremental-migration.ts`

---

## 7. UI routes & panels

### Platform (`/moderation/*`) — `ModerationShell` gate

| Route | Purpose |
|-------|---------|
| `/moderation/dashboard` | Case counts, queue breakdown, recent cases |
| `/moderation/queues` | Filterable queue inbox |
| `/moderation/cases` | Case list with filters |
| `/moderation/cases/:caseId` | Case workspace + media panel |
| `/moderation/reports` | Legacy report inbox |
| `/moderation/actions` | Rule-of-two approvals |
| `/moderation/profile-flags` | Peer reputation flags |
| `/moderation/audit` | Platform audit log |
| `/moderation/admin` | Site admin: freeze org, identity ban |
| `/moderation/legal`, `/moderation/dmca` | Legal-alpha admin |

**Hooks:** `useApiModerationTs*`, `useApiModerationReports`, `useApiModerationActions`, `usePlatformModeratorGate`, `useApiPlatformStaff`.

### Entity-scoped (organizer console)

| Route | Panel | Actions available |
|-------|-------|-------------------|
| `/organizer/orgs/:slug?tab=moderation` | `OrganizerOrgModerationPanel` | Inbox triage, bans, audit |
| `/organizer/groups/:id?tab=moderation` | `OrganizerGroupModerationPanel` | Inbox triage, bans, audit |
| Convention organizer | `IsoModerationPanel`, `AttendeeGroupsModerationPanel` | ISO + attendee groups |

---

## 8. Media & photo moderation (separate paths)

### Path A — Platform profile media (`media_assets`)

```
Upload → quarantine/ S3 → attestation → publish lane (GREEN/YELLOW/RED)
→ scanner flags → auto-case OR member report → /moderation/cases/:id
→ mod actions: keep_quarantined, remove_media, restore_media
```

**Implemented:** quarantine viewer, remove/restore (MEDIA-MOD-MINIMUM shipped).

### Path B — Convention gallery (scoped)

```
Upload → moderationStatus: pending → staff approve/reject
```

Separate S3 path (`conventions/{convId}/gallery/`); not linked to `media_assets`.

### Path C — Group photos

**Mock only.** No API. Organizer panel shows stub message.

### Path D — Avatars

No pipeline. URL field on profile only.

---

## 9. Notifications & async workers

### Registered notification types (`@c2k/shared`)

| Type | Wired? | Trigger |
|------|--------|---------|
| `moderation_report_escalated` | ✓ | Platform/org escalation reports |
| `moderation_action_pending` | ✓ | Rule-of-two proposal |
| `org_moderation_needed` | ✓ | Org-scoped intake (non-P0) |
| `report_reviewed` | ✓ | Reporter notified on case resolution |
| `p0_moderation_case_created` | ✓ | P0 BullMQ notify |

**Not wired:** P0 report notify, reporter ack, action-taken to reporter/subject, org-scoped report notify.

**No moderation email, push, or WebSocket events.**

### BullMQ `c2k-moderation`

- Worker marks jobs `COMPLETED` — **placeholder, no AI/analysis**
- Forum post jobs enqueued on create but worker ignores them (no `jobId`)
- Report intake is **inline** after DB commit (not queued)

---

## 10. Known gaps (post alpha pass — deferred only)

**Alpha pass complete 2026-06-06.** Remaining items are **not alpha blockers**:

| Item | Status |
|------|--------|
| Group photo upload moderation | ⏸ mock-only tabs |
| Following-feed activity card reports | ⏸ per-verb wiring |
| Org/presenter review row reports | ⏸ no review target type |
| Public group hub inline mod controls | ⏸ organizer panel primary |
| Moderator timeout/mute | ⏸ `scope_bans.expires_at` unused |
| Convention member bans | ⏸ no scope type for conventions |
| Avatar moderation pipeline | ⏸ avatars via profile photos only |
| GREEN uploads skip mod queue until reported | By design |
| Real ML scanners simulated in dev | By design |
| NSFW blur/reveal on feeds | Post-alpha |
| Moderation email/push/WS | Post-alpha (in-app notify shipped) |

---

## 11. Recommended finish-out sequence

**All phases A–E completed 2026-06-06.** See [`../audits/trust-and-safety/T&S-IMPLEMENTATION.md`](../audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5 and [`../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md).

### Phase A — Report surface completeness ✅

1. ✅ `useSubmitReport` + `ReportAction` + `POST /api/v1/moderation/reports`
2. ✅ Migrated all web surfaces off `ContentReportDialog` / legacy inline modals
3. ✅ Report buttons on DMs, convention chat, presenters, events, media episodes, feed, education, people
4. ✅ Target types + server-side alias normalization
5. ✅ `report-labels.ts` + `UGC_REPORT_SURFACE_AUDIT.md`

### Phase B — Scoped moderator tooling parity ✅

1. ✅ Group: triage, bans, thread lock, organizer panel
2. ✅ Event: host hide/lock
3. ✅ Convention: hub message hide
4. ✅ `notifyOrgModerationNeeded` on org-scoped intake (non-P0)

### Phase C — Platform T&S polish ✅

1. ✅ T&S intake → legacy scoped inbox bridge
2. ✅ P0 `p0_report_notify` BullMQ job
3. ✅ `hide_content` on case detail UI
4. ✅ `report_reviewed` reporter notification
5. ✅ Settings history prefers `/me/moderation/reports`

### Phase D — Media finish-out ⚠️ (alpha scope)

1. ⏸ Group photo API + organizer approval — deferred (mock-only tabs)
2. ✅ Photo reports use `media_asset` where linked
3. ✅ Avatar via `profile_photo` / `media_asset` (no separate avatar stack)

### Phase E — Docs & registry ✅

1. ✅ UGC audit, scoped gap audit, report-labels registry
2. ✅ `verify-trust-safety` gate fix (`--test-force-exit` on unit step)
3. ⚠️ `FEATURE_REGISTRY.md` trust summary — synced 2026-06-06 (ReportAction, canonical intake, group panel)

### Original planning text (archived reference)

---

## 12. Key file index

### Shared types
- `packages/shared/src/moderation-types.ts` — PolicyReason, queues, severities, action types
- `packages/shared/src/notification-types.ts` — moderation notification types
- `packages/web/src/lib/moderation/report-labels.ts` — UI target labels + surface registry

### API routes
- `packages/api/src/routes/moderation-ts-reports.ts` — T&S intake
- `packages/api/src/routes/moderation-ts-admin.ts` — cases, queues, dashboard
- `packages/api/src/routes/moderation-reports.ts` — legacy inbox
- `packages/api/src/routes/moderation-actions.ts` — rule-of-two
- `packages/api/src/routes/moderation-admin.ts` — site admin
- `packages/api/src/routes/organization-moderation.ts` — org scoped
- `packages/api/src/routes/group-moderation.ts` — group scoped

### API libs
- `packages/api/src/lib/moderation-ts-intake.ts` — createReport()
- `packages/api/src/lib/moderation-ts-admin.ts` — case actions
- `packages/api/src/lib/moderation-action-execute.ts` — platform action executor
- `packages/api/src/lib/moderation-notify.ts` — in-app notifications
- `packages/api/src/lib/moderation-route-auth.ts` — requirePlatformModerator, requireSiteAdmin
- `packages/api/src/lib/org-moderation-access.ts` — org role checks, scope ban lookup
- `packages/api/src/lib/media-mod-actions.ts` — remove/restore/quarantine media

### Web UI
- `packages/web/src/components/moderation/TsReportModal.tsx` — canonical report modal
- `packages/web/src/components/support/ContentReportDialog.tsx` — legacy report modal
- `packages/web/src/components/moderation/ModerationShell.tsx` — platform console shell
- `packages/web/src/components/organizer/moderation/OrganizerOrgModerationPanel.tsx`
- `packages/web/src/components/organizer/moderation/OrganizerGroupModerationPanel.tsx`
- `packages/web/src/app/moderation/cases/[caseId]/page.tsx` — case workspace

### Policy & architecture docs
- `docs/architecture/ADR-004-multi-tier-moderation.md` — tier model ADR
- `docs/architecture/12-moderation-systems.md` — runtime map
- `docs/trust-safety/POLICY_COVERAGE_MATRIX.md` — policy → mod tier mapping
- `docs/trust-safety/SCOPED_MODERATION_GAP_AUDIT.md` — per-surface gap scorecard
- `docs/audits/trust-and-safety/POLICY_TAXONOMY.md` — enum source of truth
- `docs/audits/trust-and-safety/MODERATOR_WORKFLOW.md` — daily mod flows
- `docs/audits/trust-and-safety/MEDIA_LIFECYCLE.md` — media publish lanes
- `docs/MODERATION_WIREFRAME.md` — console UX walkthrough

---

## Appendix: Architecture diagram

```mermaid
flowchart TB
  subgraph member [Member report intake]
    R1[TsReportModal]
    R2[ContentReportDialog legacy]
    R3[PlatformReportForm / support]
    R1 --> INTAKE[createReport]
    R2 --> INTAKE
    R3 --> INTAKE
  end

  INTAKE --> CASES[(moderation_cases)]
  INTAKE --> LEGACY[(reports legacy)]

  subgraph platform [Platform T&S - platform_staff]
    DASH[/moderation/dashboard]
    QUEUES[/moderation/queues]
    CASEDETAIL[/moderation/cases/:id]
    ACTIONS[/moderation/actions rule-of-two]
    ADMIN[/moderation/admin site admin]
  end

  CASES --> DASH & QUEUES & CASEDETAIL

  subgraph scoped [Entity moderators]
    ORG[/organizer/orgs/:slug?tab=moderation]
    GRP[/organizer/groups/:id?tab=moderation]
    CONV[Convention gallery / ISO panels]
  end

  LEGACY --> ORG & GRP

  ORG -->|escalateToPlatform| INTAKE
```

---

*End of planning brief. For implementation, read `docs/C2K-STRATEGIC-GUIDANCE.md` session checklist (notification types in shared before routes, BullMQ for new side effects, extend before add).*
