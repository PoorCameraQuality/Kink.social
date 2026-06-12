# C2K Reputation & Trust Signal System Audit

**Date:** 2026-06-06  
**Status:** Phase 0 implemented (2026-06-06) — legacy peer-score neutralized; private moderator trust summary added  
**Companion docs:** [`T&S-IMPLEMENTATION.md`](./T&S-IMPLEMENTATION.md), [`T&S-AUDIT.md`](./T&S-AUDIT.md), [`../../FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) § peer trust, [`../../C2K-STRATEGIC-GUIDANCE.md`](../../C2K-STRATEGIC-GUIDANCE.md)

---

## Phase 0 implementation (2026-06-06)

Neutralized the dangerous legacy path **peer downvotes → `trust_score` drops → automatic `identity_bans`** before building new trust-context signals.

| Area | Change |
|------|--------|
| **Peer ±1** | `POST /api/v1/reputation/peers` → **410 Gone**; `applyPeerReputationVote()` no-op; UI controls removed |
| **Auto identity ban** | Disabled in `peer-reputation.ts`; site-admin `POST .../moderation/admin/identity-bans` unchanged |
| **Public numeric score** | Removed from profile/people/feed/bookmark/reference serializers and key web surfaces (`TrustRing`, reputation filter) |
| **Moderator summary** | `GET /api/v1/moderation/users/:userId/trust-summary` (platform staff); panel on `/moderation/cases/:caseId` |
| **Deferred Phase 1** | Messaging health rollups, incident clustering, appeals/timeouts/warnings, public positive badges |

---

## Executive summary

C2K already has **substantial trust-adjacent infrastructure**, but it is **fragmented** and partially **misaligned** with the intended product model (trust context system, not public score / mob rule).

### What exists today (strong foundation)

| Lane | Existing pieces |
|------|-----------------|
| **Enforcement spine** | T&S-1 `moderation_cases` + legacy `reports`; `scope_bans`, `identity_bans`; rule-of-two `moderation_actions`; `profile_review_flags`; blocks/mutes |
| **Positive participation data** | `convention_check_ins`, `convention_registrants`, `convention_access_grants`, staff duties, presenter/vendor credits, `organization_members.joined_at`, accepted `profile_references` |
| **Scoped reputation** | `organization_members.local_reputation`, org/presenter/vendor review tables, `group_reviews` |
| **Identity basics** | `users.created_at`, `age_affirmed_at`, `age_verification_status`, `profiles.verified` (column only) |
| **UI primitives** | `TrustRing`, `BadgeDisplay`, `ProfileTrustPanel`, moderation profile-flags queue |

### Critical misalignments (must not extend blindly)

1. **`profiles.trust_score`** is a single public numeric rollup (−100..100) updated by **peer ±1 votes** (`POST /api/v1/reputation/peers`). This is exactly the pattern the product brief rejects.
2. **Automatic `identity_bans`** when `trust_score < 0` after `C2K_ACCOUNT_GRACE_DAYS` — enforcement from computed score without human review.
3. **Public peer downvotes** on `/profile/:username` with surge → `profile_review_flags` — feedback directly affects score and can trigger bans.
4. **No incident clustering** — multiple reporters create separate cases; dogpiling risk is unmitigated.
5. **No messaging accountability pipeline** — `messages` table exists but no volume/recipient/block-after-contact analytics, no DM rate limits.
6. **`trustSegments` / badge breakdown** — mock-only in web; API does not return segment data.
7. **Appeals, timeouts, warnings** — schema skeleton (`moderation_appeals`) or columns (`scope_bans.expires_at`) exist; **no API implementation**.

### Recommended direction (alpha-safe)

Build a **two-lane trust context system** beside the existing moderation spine:

| Lane | Purpose | Visibility |
|------|---------|------------|
| **Community reputation** | Slow-building positive/factual signals (account age, attendance, verified roles, references) | Public / member-visible badges — **no numeric score** |
| **Safety / accountability** | Pattern detection from objective behavior + confirmed findings | Moderator / site-admin only — **never public shame labels** |

**Do not** extend `profiles.trust_score` or public peer ±1. **Deprecate** those paths in Phase 0 planning before adding new signals.

**Recommended first implementation phase:** Phase 0 — data inventory + non-public admin trust summary (read-only aggregation for moderators, no new public UI).

---

## Current codebase facts

### Architecture constraints (from strategic guidance)

- One `users` row per identity; writes must set `user_id`.
- Permission layers: Platform → Org → Group → Convention attendee → Command bridge → Resource.
- Serious enforcement stays human-reviewed; AI summarizes only.
- No Stripe / guest checkout / second forum stack.
- Following-feed UI deferred (Phase 2); organizer tools are Phase 1.

### Dual moderation stack

| Stack | Tables / routes | Scope |
|-------|-----------------|-------|
| **T&S-1 (platform)** | `moderation_cases`, `moderation_reports`, `moderation_queue_items`, `moderation_events`, `content_snapshots` | Platform-wide cases; intake via `POST /api/v1/moderation/reports` |
| **Legacy scoped** | `reports`, hide/lock, `scope_bans` | Org/group/event mirrors; scoped inboxes `GET .../organizations/:orgKey/reports`, `GET .../groups/:groupId/reports` |

Intake: `packages/api/src/lib/moderation-ts-intake.ts` — 24h same-reporter dedupe only (`DEDUPE_WINDOW_MS`).

### Schema migration pattern

- **Drizzle ORM** — source of truth: `packages/api/src/db/schema.ts` (+ `convention-organizer-schema.ts`).
- **Apply:** `drizzle-kit push` + `packages/api/scripts/apply-incremental-migration.ts` (no versioned migration folder in `packages/api/drizzle/`).
- **Shared types:** `packages/shared/src/moderation-types.ts`, `user-settings.ts`, `age-verification.ts`.

### Existing peer trust implementation (legacy — high risk)

| File | Role |
|------|------|
| `packages/api/src/lib/peer-reputation.ts` | Applies votes, updates `trust_score`, flags surges, auto `identity_bans` |
| `packages/api/src/routes/peer-reputation-routes.ts` | `POST /api/v1/reputation/peers` — **no rate limit** |
| `packages/web/src/app/profile/[username]/page.tsx` | Public ±1 UI when signed in |

Env knobs: `C2K_PEER_CONNECTED_WEIGHT`, `C2K_PEER_UNCONNECTED_WEIGHT`, `C2K_ACCOUNT_GRACE_DAYS`, `C2K_PEER_DOWNVOTE_REVIEW_THRESHOLD`.

---

## Existing identity/account signals

| Signal | Table / model | API route | UI surface | User-visible | Mod-visible | Trust signal? | Privacy / safety concern |
|--------|---------------|-----------|------------|--------------|-------------|---------------|--------------------------|
| Account creation date | `users.created_at` | `GET /api/profile/me`, `GET /api/v1/users/:username/ecosystem` (`memberSince`) | Profile stats, "Member since" potential | Yes (factual) | Yes | **Yes** — account age badge | Low risk if factual only |
| Email | `users.email` | `GET /api/profile/me` (self only) | Settings | Self only | Admin tools (not found dedicated) | No public signal | PII — never public |
| Email verification | — | **not found** | Privacy page mentions transactional email | No | No | **Gap** — no verified-email flag | Cannot use until implemented |
| Profile completion | Client-computed (`packages/web/src/lib/profile-onboarding.ts`) | `GET/PATCH /api/profile/me` | `ProfileFinishPanel`, edit completion card | Self | No | **Yes** (completion badge) | Self-reported; UI-only today |
| Profile photos / avatar | `profile_photos`, `profiles.avatar_url`, `media_assets` | `GET/POST/PATCH/DELETE /api/profile/me/photos*` | Profile hero, people cards | Yes (per visibility) | Via media mod cases | **Yes** — "has photo" | Low; photos go through media pipeline |
| Profile review flags | `profile_review_flags` | Created by peer votes; `GET/PATCH /api/v1/moderation/profile-review-flags` | `/moderation/profile-flags` | **No** | **Yes** | **Cautionary (mod only)** | Must never be public; tied to abusive peer votes today |
| Username / display name | `users.username`, `profiles.display_name` | Profile routes | Everywhere | Yes | Yes | Identity only | Username change history — **not found** |
| Blocked users | `blocks` | `GET/POST/DELETE /api/v1/me/blocks` | `/settings/blocked`, `BlockedMembersPanel` | Self only | No aggregate API | **Input** to messaging health (private) | Block counts must not be public |
| Muted users | `mutes` | `GET/POST/DELETE /api/mutes/me` | `/settings/muted` | Self only | No | **Input** to patterns (private) | Same as blocks |
| Deleted / deactivated / suspended | `user_privacy_requests` (DEACTIVATE/DELETE); `SUSPEND_USER` action type | `legal-alpha-routes.ts`; `POST /api/v1/moderation/admin/users/:userId/suspend` (**audit-only stub**) | — | Self (request status) | Admin | **Enforcement** not signal | `users.suspended_at` — **not found** |
| Identity bans | `identity_bans` | Auth gate `checkIdentityBan()`; `POST /api/v1/moderation/admin/identity-bans` | — | No | Site admin | **Severe (admin only)** | IP-based; legal/safety |
| Legal holds | `legal_holds` | `packages/api/src/lib/legal-hold.ts` | — | No | Legal admin | **Admin only** | Blocks deletion |
| Privacy / export / deletion | `user_privacy_requests` | Legal alpha routes | Settings privacy, `/policies` | Self | Legal admin | Standing gate, not badge | `BLOCKED_LEGAL_HOLD` status |
| 18+ attestation | `users.age_affirmed_at`, `age_verification_status` | Register sets `SELF_ATTESTED` (`auth.ts`) | Signup flow | Self | Mod (user row) | **Yes** — "Age affirmed" (not ID verify) | Do not conflate with ID verification |
| Platform staff roles | `platform_staff` | `GET /api/v1/moderation/me` | Moderation nav gating | No (permission) | Self knows if mod | Not member trust | RBAC, not reputation |
| Org roles | `organization_members.role`, `joined_at`, `local_reputation` | Org member routes | Org roster, `MemberRoleBadge` | Partial (role badges) | Org mods | **Scoped standing** | `local_reputation` manipulable by org mods |
| Group roles | `group_members.role` (varchar) | Group routes | `GroupRoleBadge` | Role only | Group mods | Scoped role | No `joined_at` — tenure **not found** |
| Convention roles | `convention_access_grants.role`, `paid_confirmed`, `attending_confirmed` | Convention/door routes | Door roster, attendee hub | Partial | Staff | **Event trust** | Strong when staff-confirmed |

---

## Existing moderation/enforcement signals

| Artifact | Exists | Scope | Audience | Feed trust? | Exclude from public rep? | Appeal/expiry/decay |
|----------|--------|-------|----------|-------------|--------------------------|---------------------|
| `moderation_cases` | Yes — `schema.ts` ~697 | Platform | Mod | **Yes** (confirmed findings only) | **Yes** — never public | Close statuses include `CLOSED_NO_VIOLATION`, `CLOSED_DUPLICATE` |
| `moderation_reports` | Yes | Platform (per case) | User files; mod via case | Triage input only | **Yes** | 24h reporter dedupe |
| `moderation_queue_items` | Yes | Platform | Mod | Queue priority | **Yes** | N/A |
| `content_snapshots` | Yes | Platform | Mod | Context | **Yes** | Immutable |
| `moderation_events` | Yes | Platform | Mod | Audit timeline | **Yes** | Append-only |
| `reports` (legacy) | Yes | Platform/org/group/event | User + scoped mods | Legacy intake | **Yes** | Status varchar `OPEN` etc. |
| `moderation_actions` | Yes | Platform | Mod | Proposed enforcement | **Yes** | Rule-of-two; `PENDING_APPROVAL` → `EXECUTED` |
| `moderation_action_approvals` | Yes | Platform | Mod | — | — | — |
| `scope_bans` | Yes | Org/group | Scoped mods | **Scoped caution** | **Yes** public | `expires_at` column **unused** in writes |
| `identity_bans` | Yes | Platform (IP) | System + site admin | Severe | **Yes** | Optional `expires_at`; auto-insert from peer trust |
| `profile_review_flags` | Yes | Platform | Mod | Surge detector | **Yes** | Manual close via mod API |
| `user_risk_flags` | Schema only | Platform | — | Planned | **Yes** | **No API** |
| `moderation_appeals` | Schema only | Platform | — | — | — | **No API** (T&S-7 deferred) |
| `hidden_at` (forum posts, channel messages) | Yes | Org/group/event/convention | Mod | Confirmed action | **Yes** | Content-level |
| `locked_at` (forum threads) | Yes | Org/group/event | Mod | Confirmed action | **Yes** | — |
| Media moderation | `media_assets`, cases, hash list | Platform | Mod | Quarantine/promote | **Yes** | `promoted_at` / scan log |
| Convention gallery moderation | `convention_gallery_images.moderation_status` | Convention | Staff + attendee upload | Approved = positive | Rejected = delete | `pending/approved/rejected` |
| Org/group scoped reports | Yes (legacy inbox) | Scoped | Scoped mods | Same as reports | **Yes** | Dual-stack mirror gaps possible |
| Rule-of-two approvals | Yes | Platform | Mod | Gates `IDENTITY_BAN`, `SCOPE_BAN`, etc. | — | `requiredApprovals` default 2 |

### Incident clustering / dogpile detection

| Capability | Status | Location |
|------------|--------|----------|
| Same-reporter 24h dedupe | **Implemented** | `moderation-ts-intake.ts` `findDuplicateReport` |
| Multi-reporter → one case | **not found** | — |
| Reporter relationship analysis | **not found** | — |
| Copy/paste report text detection | **not found** | — |
| Retaliation timing flags | **not found** | — |
| Mod `close_duplicate` action | **Implemented** | `moderation-ts-admin.ts` |

### Warnings / timeouts

| Capability | Status |
|------------|--------|
| Moderator warning primitive | **not found** |
| Timed scope ban (`expires_at`) | Column exists; **never set** in ban routes |
| Platform timeout / cooldown | **not found** |
| DM rate limit | **not found** (only login/register/reports rate limits) |

---

## Existing positive trust signals

| Signal | Data location | API | UI | Reliability | Easy to fake? | Public / scoped / internal | Decay? | Consent? |
|--------|---------------|-----|-----|-------------|---------------|---------------------------|--------|----------|
| Event RSVP ("attended") | `event_rsvps` | `PUT /api/v1/events/:eventId/rsvp` | `ProfileAttendedEventCard`, events library | Low–medium | **Yes** (self-RSVP) | Public (if history visible) | Yes — old events | N/A |
| Convention registration | `convention_registrants` | `POST /api/v1/public/conventions/:key/registrations` | Register flow | Medium | Medium | Member | Yes | Registration consent |
| Door check-in | `convention_check_ins` + `convention_registrants.checked_in_at` | `POST .../registrants/check-in`, `POST .../check-ins` | `DoorModePanel` | **High** (staff path) | Harder | Positive badge candidate | Yes | N/A |
| Paid confirmed | `convention_access_grants.paid_confirmed` | Organizer sets | Door/roster | High (organizer) | Organizer-dependent | Scoped/event | Yes | N/A |
| Volunteer / staff | `convention_staff_duties`, `schedule_slot_staff`, `convention_volunteer_shift_signups` | Organizer + `GET /api/v1/me/staff-profile` | Staff panels, `/staff/:username` | Medium–high | Self-claim shifts easier | Public staff profile optional | Yes | N/A |
| Presenter history | `presenter_teaching_credits` (`verified`), `schedule_slot_presenters` | `GET /api/v1/presenters/:key` | Presenter profile | **High** when worker-synced | Self-reported credits weak | Public | Yes | N/A |
| Vendor history | `vendor_event_credits` (`verified`), `vendor_blind_feedback` | `GET /api/v1/vendors` | Vendor shop | High when verified purchase | Medium | Public commerce rep | Yes | Blind feedback |
| Organizer ownership | `organization_members` (OWNER/ADMIN) | Org routes | `OrgCard`, organizer console | High | Hard | Public role inference | Slow decay | N/A |
| Org membership duration | `organization_members.joined_at` | Member routes | Underused | Real | N/A | Member-visible optional | Yes | N/A |
| Group membership duration | — | — | — | **not found** | — | — | — | — |
| Forum participation | `forum_posts`, reactions | Org/group forum routes | Forum UI | Low as trust metric | **Yes** | Not aggregated on profile | — | — |
| `profiles.verified` | `profiles.verified` | People search filter | `DiscoveryPeopleFilters`, `PersonCard` | **No pipeline** — seed only | N/A | Public filter broken if all false | — | — |
| Connections (mutual) | `connections` | `/api/v1/connections*` | Connections page | Medium | Easy | Social graph | — | Mutual accept |
| Follows | `user_follows` | `/api/v1/users/:username/follow` | Graph status | Low | **Yes** | Counts not trust | — | — |
| Profile references | `profile_references` | `/api/v1/profile/references*` | `ProfileReferencesPanel` | **Medium** | Harder (accept required) | Public references | Yes | **Yes** — subject accepts |
| Peer +1 votes | `profile_reputation_events` | `POST /api/v1/reputation/peers` | Profile ±1 buttons | **Abuse-prone** | **Yes** | **Public score — deprecate** | Partial (score clamp) | No |
| Completed profile sections | Client `profile-onboarding.ts` | Profile API | Edit UI | Low | Self-reported | Badge candidate | — | N/A |
| Media approval | `media_assets.promoted_at`, scan status | Media pipeline | Mod queues | Medium | Pipeline-dependent | Internal timeline | — | Upload attestation |
| Command bridge grants | `convention_command_grants` | `GET/PUT .../command-team` | `CommandTeamPanel` | High (ops) | Organizer-granted | **Internal** — not public badge | — | N/A |
| Co-attendance suggestions | RSVP overlap | `GET /api/v1/connections/suggested?source=co_attendance` | Connections | Low (RSVP only) | Easy | Discovery | — | — |

### Mock-only (do not treat as real)

- `packages/web/src/data/mock-seeds.ts` — `trustScore`, `trustTier`, badges, endorsements
- `packages/api/src/data/mock-seeds.ts` — API-side trust tier mirror
- `trustSegments` breakdown — **API not found**; UI placeholders in `ProfileTrustPanel` / `TrustRing`

---

## Existing negative/cautionary signals

| Signal | Reliable? | Abuse-prone? | Platform-only? | Scoped? | Expiry/decay? | Human review before count? |
|--------|-----------|--------------|----------------|---------|---------------|---------------------------|
| `scope_bans` | High (mod action) | Organizer retaliation risk | No — org/group | **Yes** | Column unused | **Yes** (mod bans) |
| `identity_bans` | High | Low (admin) | **Yes** | — | Optional expiry | **Yes** — except auto peer path |
| Legacy / T&S reports (open) | Medium | **Yes** (dogpile) | + scoped | Both | Unconfirmed should not affect rep | **Yes** for consequences |
| Dismissed / no-violation cases | High | — | Yes | — | No negative impact | Finding-based |
| Hidden posts / locked threads | High | Medium | Scoped | Yes | Mod-visible retention | **Yes** |
| Removed / quarantined media | High | Low | Platform | — | Audit trail | **Yes** |
| Peer −1 votes | Low | **Very yes** | Platform | — | Surge → mod flag | **No today — problem** |
| `profile_review_flags` | Medium | Tied to peer abuse | Platform | — | Manual close | Partial |
| Group negative reviews | Medium | Clique risk | No | **Group** | Not wired to global score | Member-submitted |
| Blocks / mutes (aggregate) | High as pattern | Can be coordinated | **Private analytics** | — | Decay recommended | Pattern only |
| Spam/scam reports | Medium | False reports | Platform T&S | Can be scoped | Unconfirmed ≠ penalty | **Yes** |
| Consent/safety reports | High severity | False reports hurt | Platform T&S | Event/org context | Never public | **Always human** |
| No-shows | **not found** | — | — | — | — | — |
| Chargebacks/refunds | **not found** (no Stripe) | — | — | — | — | — |
| Organizer cancellations | Event status fields | Medium | — | Event | — | — |
| Failed verification | `age_verification_status = REJECTED` | — | Self | — | — | — |
| Blocked-by-many pattern | **not computed** | — | Mod only | — | Rolling window | Pattern detection |

---

## Scoped trust model

### Platform-wide user trust

| Signal | Stay local or escalate? | Notes |
|--------|-------------------------|-------|
| Account age, age affirmed | Platform factual | Safe public badge |
| Email verified | Platform (when built) | Factual |
| Profile completion | Platform | Self-reported |
| Peer `trust_score` | **Deprecate platform-wide** | Replace with category badges |
| Confirmed T&S findings (NCII, minors, etc.) | **Platform T&S only** | Never public label |
| `identity_bans` | Platform | Site-admin |
| Accepted references | Platform | Positive, consent-based |

### Organization-scoped trust

| Signal | Escalation rule |
|--------|-----------------|
| `local_reputation` | **Stays org-scoped** — do not auto-propagate to platform (`ORG_REVIEW_PROPAGATES_GLOBAL_TRUST` default **false**) |
| Org reviews / composite rating | Public org card only |
| Org mod reputation PATCH | **Organizer-only** — audit for retaliation |
| Scoped ban | **Stays scoped** unless escalated via T&S case |

### Group-scoped trust

| Signal | Notes |
|--------|-------|
| `group_reviews` (±1 sentiment) | Group feedback tab — not platform safety |
| Group ban | Scoped |
| Leadership votes | Governance, not personal safety score |

### Convention/event-scoped trust

| Signal | Notes |
|--------|-------|
| Check-in / registration | **Positive attendance** — can be public badge ("Event attendee") |
| Staff duty / command grant | Organizer context; staff profile optional |
| Vetting / trusted roles | Convention-specific standing |
| `convention_safety_incidents` | Organizer safety log — **not** same as T&S cases |
| Gallery moderation | Convention-scoped |

### Role-specific trust lenses

| Lens | Primary signals | Visibility |
|------|-----------------|------------|
| **Organizer reliability** | Org age, event count, org reviews, convention history | Public org/presenter cards |
| **Vendor trust** | Verified event credits, blind feedback, shop policies | Vendor card (commerce rep) |
| **Educator/presenter** | Teaching credits, reviews, education articles | Presenter directory |
| **Media/profile** | Media pipeline promotion, photo count | Profile — positive only |
| **Messaging health** | Volume, blocks-after-contact, reports | **Mod only** + self limit notices |

### Escalation examples (from product brief)

- "Banned from one group" → **scoped**; no platform label.
- "Confirmed CSAM/NCII case" → **platform/legal T&S**; restricted queue.
- "Checked in at three events" → positive attendance signal; optional public badge.
- "Org owner of verified recurring event" → organizer trust, not personal safety score.

---

## UI inventory

| Surface | Component / route | Existing trust UI | Could show | Visibility recommendation | Harassment/privacy risk |
|---------|-------------------|-------------------|------------|---------------------------|-------------------------|
| Profile page | `app/profile/[username]/page.tsx`, `ProfilePublicHero`, `ProfileTrustPanel` | `TrustRing`, numeric score, `BadgeDisplay`, ±1 peer votes | Account age, attendance, references, role badges | Public: **positive/factual only**; remove numeric score & ±1 | **High** — public downvote enables pile-on |
| Profile cards (home) | `PersonCard.tsx` | `TrustRing`, `TrustTierIndicator`, verified ring | Subtle verified / established | Avoid numeric score on cards | Medium |
| People directory | `FindPeopleDiscoverPage`, `FindPeopleProfileCard` | Community role badges; filters: verified, reputation threshold | Established member, event verified | No numeric score (already) | Filter "reputation threshold" uses `trustScore` — **risky** |
| DMs header | `app/messaging/page.tsx` | `TrustRing` (defaults **50** — API missing) | New account / established only | Ring-only, no score | Showing low trust to strangers harmful |
| Group member list | `GroupMembersSection` | `GroupRoleBadge` only | Scoped tenure, event attendance in group | Member-only optional | Low |
| Org member list | `MemberRoster`, `OrganizerOrgPeoplePanel` | Role badges | `joined_at` tenure | Staff view; no safety flags | Organizer retaliation if showing negative |
| Event attendees | `EventDetailClient` | `TrustRing` mock only | Event-verified chip | Member-only | Medium |
| Vendor cards | `VendorCard`, `VendorShopSidebar` | Star ratings, `vendorTrustBullets` | Commerce trust separate from member score | Public commerce | Low |
| Presenter cards | `PresenterCard` | `presenterReputationTier` badges | Teaching history | Public | Low |
| Organizer dashboard | Organizer panels | Operational counts | Attendance reliability | Organizer-only | Low |
| Moderation case detail | `ModerationCaseDetailPage` | Case timeline, snapshots | **Full trust summary panel (missing)** | **Mod only** | Safe internal |
| Platform mod dashboard | `/moderation/*` | Queues, profile-flags | Trust summary, messaging health | **Mod only** | Safe |
| Org/group mod panels | `OrganizerOrgModerationPanel`, `BanList` | Bans, reports | Scoped trust context | **Scoped mod** | Do not leak across scopes |
| Admin user detail | **not found** | Links to public profile | Inspector with full signals | **Site-admin** | — |
| Settings privacy | `SettingsPrivacySections` | Messaging presets, activity history visibility | Trust score hide toggle (**missing**) | Self | — |

### UI inconsistencies to fix in build sequence

1. Two card patterns: `FindPeopleProfileCard` (no score) vs `PersonCard` (ring + tier).
2. `trustSegments` placeholders mislead users (`trust-display.ts` detects synthetic breakdown).
3. "Verified" overload: event verified vs organizer vs presenter vs `profiles.verified`.
4. Messaging `trustScore` hardcoded to 50 when API omits field.

---

## API inventory

### Existing read/write APIs (trust-relevant)

| Endpoint | Auth | Returns / writes | Public / member / mod / admin | Aggregated? |
|----------|------|------------------|--------------------------------|-------------|
| `GET /api/v1/profiles` (people search) | Member+ | `trustScore`, `verified`, roles | Member | Per-user |
| `GET /api/v1/users/:username/ecosystem` | Public/member | `trustScore`, orgs, groups | Public | Partial rollup |
| `POST /api/v1/reputation/peers` | User | Writes `profile_reputation_events`, updates `trust_score` | User | **Deprecate** |
| `GET/POST /api/v1/profile/references*` | User | References | User / public accepted | Per-reference |
| `PATCH /api/v1/organizations/:orgKey/members/:userId/reputation` | Org MODERATOR+ | `local_reputation` delta | Organizer | Org-scoped |
| `GET/POST /api/v1/groups/:groupId/reviews` | Member | Group sentiment reviews | Member | Listed |
| `GET/POST /api/v1/me/blocks`, mutes | User | Blocks/mutes | Self | List only |
| `POST /api/v1/moderation/reports` | User (rate limited) | Creates case + report | User | Dedupe per reporter |
| `GET /api/v1/moderation/cases*` | Platform mod | Case detail + events | Mod | Per-case |
| `GET/PATCH /api/v1/moderation/profile-review-flags` | Platform mod | Peer surge flags | Mod | List |
| `POST /api/v1/conversations`, `POST /api/v1/messages` | User | DMs | User | **No rate limit** |
| `GET /api/v1/conversations` | User | Inbox list — **no trustScore** | User | — |
| `GET /api/v1/me/staff-profile` | User | Staff participation summary | Self/public | Aggregated |
| `GET /api/v1/presenters`, `/vendors`, `/organizations` | Public | Review-derived ratings | Public | Directory sort |

### Recommended future endpoints (do not implement yet)

| Endpoint | Purpose | Auth | Priority |
|----------|---------|------|----------|
| `GET /api/v1/moderation/users/:userId/trust-summary` | Mod-only aggregated signals | Platform mod | **Phase 1** |
| `GET /api/v1/me/trust-standing` | Self: limits, appeals, general standing | User | Phase 1 |
| `GET /api/v1/users/:id/trust-badges` | Public positive badges only | Public | Phase 2 |
| `GET /api/v1/organizations/:orgKey/members/:userId/trust` | Scoped org standing | Org mod+ | Phase 3 |
| `POST /api/v1/trust/feedback` | Abuse-resistant interaction feedback (not public downvote) | User | Phase 4 |
| `POST /api/v1/trust/verification` | Organizer/vendor verification requests | User/organizer | Phase 4 |
| `PATCH /api/v1/moderation/trust-signals/:id` | Mod review/override signal | Mod | Phase 1 |
| `POST /api/v1/moderation/incidents/:id/cluster` | Attach reports to incident | Mod | Phase 1 |
| `GET /api/v1/moderation/users/:userId/messaging-health` | Mod-only messaging pattern summary | Mod | Phase 1 |

---

## Database/schema inventory

### Tables storing trust-relevant facts (existing)

```
users, profiles, profile_references, profile_reputation_events, profile_review_flags,
blocks, mutes, reports, moderation_cases, moderation_reports, moderation_queue_items,
moderation_events, moderation_actions, moderation_action_approvals, moderation_audit_events,
moderation_appeals, user_risk_flags, scope_bans, identity_bans, platform_staff,
organization_members, group_members, group_reviews,
organization_reviews, organization_event_reviews,
presenter_reviews, presenter_teaching_credits, presenter_profiles,
vendor_blind_feedback, vendor_profiles,
events, event_rsvps, conversations, conversation_participants, messages,
conventions, convention_access_grants, convention_check_ins, convention_registrants,
convention_trusted_roles, convention_vetting_applications,
convention_safety_incidents, convention_command_grants,
media_assets, legal_holds, user_privacy_requests
```

### Missing tables (recommended — evaluate, do not create yet)

| Table | Purpose |
|-------|---------|
| `trust_signal_events` | Append-only canonical signal log (replaces abusing `profile_reputation_events` for new work) |
| `trust_signal_rollups` | Materialized per-user/per-scope category state |
| `trust_badges` + `trust_badge_assignments` | Earned positive badges |
| `user_verifications` / `organizer_verifications` | Verification workflow (email, organizer, vendor) |
| `moderation_incidents` + `incident_reports` + `incident_participants` | Incident clustering |
| `incident_findings` | Confirmed finding types (enum below) |
| `trust_signal_appeals` | Appeal of trust-impacting restrictions |
| `trust_signal_audit_log` | Mod/admin overrides |
| `trust_visibility_preferences` | User opt-out of public badges |
| `messaging_health_rollups` | Outbound velocity, block-after-contact rates (private) |

### Recommended `incident_findings` enum (future)

```
NO_VIOLATION, INSUFFICIENT_INFO, CONCERNING_PATTERN, BOUNDARY_WARNING,
CONFIRMED_SPAM, CONFIRMED_HARASSMENT, CONFIRMED_CONSENT_VIOLATION,
CONFIRMED_SEVERE_SAFETY_VIOLATION
```

### Recommended `trust_signal_events` fields (future)

`user_id`, `scope_type`, `scope_id`, `signal_type`, `source_type`, `source_id`, `severity`, `confidence`, `visibility`, `expires_at`, `created_by`, `reviewed_by`, `appeal_status`

### Enum patterns (existing)

- Drizzle `pgEnum` in `schema.ts`; mirrored in `@c2k/shared/moderation-types.ts`.
- Varchar-not-enum: `reports.status`, `profile_review_flags.kind/status`, `group_members.role`.

### Index safety

- Follow existing patterns: `index('name')` on `(target_user_id)`, `(target_user_id, created_at)` — see `profile_reputation_events`.
- Add rollups via background worker (BullMQ) after commit — per strategic guidance.
- Use incremental migration script for new enums/tables when `drizzle-kit push` fails.

### Test factories

- **No dedicated trust factory module.** Use `insertCiUser()` in `packages/api/src/test/ci-db-harness.ts`.
- Peer reputation: **no dedicated tests.**

---

## Existing tests and verification gates

### Test files (trust-adjacent)

| Area | File | Command |
|------|------|---------|
| Moderation intake | `packages/api/src/test/moderation-ts-intake.test.ts` | `npm run test:db` |
| Moderation admin | `packages/api/src/test/moderation-ts-admin.test.ts` | `npm run test:db` |
| Scoped moderation | `packages/api/src/test/moderation-scoped.test.ts` | `npm run test:db` |
| Case context | `packages/api/src/test/moderation-case-context.test.ts` | `npm test` |
| Scope ban enforcement | `packages/api/src/test/wave7-ci-db-smokes.test.ts` | `npm run test:db` |
| DM privacy defaults | `packages/api/src/lib/dm-privacy.test.ts` | `npm test` |
| Profile access / redaction | `packages/api/src/lib/profile-access.test.ts` | `npm test` |
| Wave6 enforcement guards | `packages/api/src/lib/wave6-enforcement-guards.test.ts` | `npm test` |
| Legal alpha | `packages/api/src/test/legal-alpha.test.ts` | `npm run test:db` |
| Media moderation | `packages/api/src/test/media-*.test.ts` | `npm run test:db` |
| E2E moderation | `e2e/moderation-ts.spec.ts` | `npm run test:e2e:trust-safety` |

### Verification commands

```bash
npm test                              # unit tests (includes dm-privacy, profile-access)
npm run test:db                       # DB integration (moderation, scope bans)
npm run verify:trust-safety           # full T&S gate (docker + db:prepare + tests)
npm run verify:trust-safety:unit      # unit only
VERIFY_TS_E2E=1 npm run verify:trust-safety:local  # + Playwright
```

### Gaps for future trust system tests

| Gap | Priority |
|-----|----------|
| Peer reputation / `profile_reputation_events` | High — document deprecation tests |
| Trust summary API (mod) | Phase 1 |
| Incident clustering | Phase 1 |
| Messaging health rollups | Phase 1 |
| Public badges API (no negative fields leak) | Phase 2 |
| Block-after-contact analytics | Phase 1 |
| Appeals workflow | Phase 5 |
| Dogpile detection heuristics | Phase 5 |
| Org `local_reputation` retaliation guards | Phase 3 |

---

## Safety and abuse analysis

### Feedback vs signals vs enforcement

| Layer | Definition | Current C2K examples | Rule |
|-------|------------|---------------------|------|
| **Feedback** | Subjective user input | Peer ±1, group reviews, reports | Never direct enforcement |
| **Signals** | Measured behavior or confirmed events | Check-ins, case findings, block patterns | May trigger review or soft safeguards |
| **Enforcement** | Restrictions / punishment | `scope_bans`, `identity_bans`, hide, suspend | Human review for serious; audit trail |

**Violation today:** Peer −1 → `trust_score` → auto `identity_ban` skips the signals/enforcement separation.

### Safe to show publicly

- Account age / member since
- Age affirmed (not ID verified unless real pipeline exists)
- Profile complete (factual checklist)
- Event attendee / check-in derived badges
- Presenter / vendor / organizer role history (factual)
- Accepted references (with subject consent)
- Org/group role badges
- Commerce ratings (vendor/presenter/org) — separate from safety

### Moderator-only

- Report patterns and counts
- Messaging health (volume, block-after-contact, reply ratio)
- Confirmed / open moderation cases
- `profile_review_flags`
- Scoped ban history
- Peer vote event log
- Dogpile / retaliation flags
- Unconfirmed reports

### Site-admin-only

- `identity_bans`, legal holds
- Restricted queue cases (minor safety, NCII)
- Severe consent violation history
- Cross-platform risk notes
- `user_risk_flags` (when implemented)

### Too dangerous to use as inputs

- Sexual orientation, gender, race, religion, health, politics, kink interests, relationship style
- Raw report volume as public penalty
- "Blocked by N users" public label
- Single public numeric reputation score
- Organizer `local_reputation` as platform safety judgment

### Too easy to game

- Peer ±1 votes (connected weight helps slightly)
- Self-RSVP as attendance
- Group negative reviews without triage
- Follow / connection counts
- Profile completion without verification

### Clique / dogpile / retaliation risks

| Attack | Mitigation (recommended) |
|--------|--------------------------|
| Mass downvote | **Deprecate public peer −1**; incident clustering; independent reporter weighting |
| Coordinated reports | One incident, many witnesses; cap reputation impact per incident |
| Organizer retaliation | Audit `PATCH .../reputation`; scoped signals stay scoped; appeals |
| False consent reports | Protective holds without public label; human finding required |
| Report-after-block | Retaliation timing flag for mod triage |

### Signal decay (recommended)

| Signal | Decay |
|--------|-------|
| Unconfirmed report | No rep impact; internal only |
| Dismissed report | No impact |
| Minor warning | 3–6 months |
| Spam cooldown | 1–3 months |
| Scoped timeout | 6–12 months mod-visible |
| Confirmed consent violation | Long mod retention; no public label |
| Severe safety finding | Permanent mod/admin retention |
| Positive attendance | 2–3 year soft decay for badge eligibility |
| Identity ban | Permanent / admin-controlled |

### Human confirmation required before

- Platform timeout, suspension, ban, identity ban
- Public access restriction based on trust
- Any harassment/consent/NCII/minors finding
- Reputation downgrade affecting broad access
- Escalating scoped ban to platform

### Never automate

- Permanent ban / identity ban (except existing auto peer path — **remove**)
- Public "unsafe" / "predator" labels
- Platform-wide exclusion from feedback alone
- Punishment based on gender/orientation/demographics

---

## Consent/safety accountability model (proposed)

### Pipeline

```
Report → T&S case (+ optional protective hold) → Incident cluster → Mod review → Finding → Signal event → Enforcement (if any)
```

### Step 1: Report intake

- Consent/safety reports → `policy_reason` severe queue; attach org/group/event scope in snapshot.
- Create or link **`moderation_incidents`** (future) for clustering.

### Step 2: Immediate protective measures (not punishment)

- No-contact between parties (future messaging restriction)
- Hide disputed content
- Restrict DM between parties
- Alert event/org safety team if scoped
- Escalate restricted queue if NCII/minors

### Step 3: Moderator finding (never raw votes)

Outcomes: `NO_VIOLATION`, `INSUFFICIENT_INFO`, `CONCERNING_PATTERN`, `BOUNDARY_WARNING`, `CONFIRMED_CONSENT_VIOLATION`, `CONFIRMED_SEVERE_SAFETY_VIOLATION`

### Step 4: Consequence ladder

| Finding | Consequence |
|---------|-------------|
| Unconfirmed | Internal case only; **no reputation hit** |
| Inconclusive pattern | Internal caution signal; monitor |
| Boundary issue | Warning, education, scoped cooldown |
| Confirmed minor violation | Scoped timeout, event restriction; mod-visible signal |
| Confirmed serious | Platform timeout/suspension |
| Repeat/severe | Long suspension, ban via rule-of-two |
| NCII/minors/coercion | Immediate site-admin / T&S path |

**Reputation impact comes from finding, not report count.**

---

## Dogpile prevention model (proposed)

1. **Incident grouping** — 30 reports on same incident = 1 incident, 30 linked reports.
2. **Independent reporter weighting** — graph distance, shared org, burst timing, identical text.
3. **Report caps** — urgency scales; damage does not stack per report.
4. **Reporter trust for triage only** — never reject reports solely due to low standing.
5. **Retaliation detection** — report within N hours of block/rejection/public conflict.

### Existing code that can support this

- `moderation-ts-intake.ts` — dedupe, case creation, snapshots
- `moderation-ts-admin.ts` — `close_duplicate`, status transitions
- `blocks`, `connections`, `organization_members` — relationship graph for independence checks
- `moderation_events` — append-only audit

### Missing before implementation

- `moderation_incidents` tables
- Reporter graph analysis job
- Burst detection worker
- Mod UI for incident cluster view

---

## Messaging health model (proposed)

### Objective signals (from existing + new rollups)

| Signal | Source today | Gap |
|--------|--------------|-----|
| Outbound message velocity | `messages` + `sender_id` | **Compute rollup** |
| Unique recipients / window | `messages` + `conversation_participants` | **Compute** |
| Repeated message similarity | `messages.body` | **Not implemented** |
| Reply ratio | `messages` thread analysis | **Compute** |
| Block-after-contact | `blocks.created_at` vs first message | **Compute** |
| Mute-after-contact | `mutes` | **Compute** |
| Report-after-contact | `moderation_reports` / `reports` | Link by target user |
| Independent negative feedback | Future `trust/feedback` | **Not implemented** |
| Account age | `users.created_at` | Exists |
| Prior warnings/cooldowns | — | **Not implemented** |

### Output states (mod / self)

| State | User sees | Others see |
|-------|-----------|------------|
| Healthy | — | — |
| New / limited history | Optional hint | — |
| High outreach volume | — | — |
| Needs cooldown | "Messaging temporarily limited…" | **Nothing** |
| Moderator review recommended | — | — |
| Restricted | Limit notice + appeal link | **Nothing** |

### Intervention ladder (unwanted/spam messaging)

1. **Internal signal only** — log rollup; no user impact
2. **Soft warning** — in-app notice on compose
3. **DM rate limit** — e.g. N new conversations / day
4. **Temporary DM cooldown** — 24–72h
5. **Require profile completion** before more outbound DMs
6. **Scoped timeout** — org/event messaging ban via `scope_bans` pattern
7. **Platform timeout** — mod action / rule-of-two
8. **Moderator review** — case assignment
9. **Suspension / ban / identity ban** — existing T&S site-admin path only

**Triggers should combine** volume + similarity + independent blocks/reports — never single feedback event.

### Existing anti-spam

- Rate limits: login, register, reports only (`rate-limit-config.ts`)
- DM privacy: `whoCanMessage` default `connections_only` (`dm-privacy.ts`)
- Block check on some social actions (`blocks.ts`)
- **No** message rate limit, **no** copy-paste detection

---

## Visibility matrix (proposed)

| View | Audience | Contents |
|------|----------|----------|
| Public profile badges | Everyone | Positive/factual only |
| Member trust context | Members | Limited positive (shared org/event attendance) |
| Organizer scoped trust | Org/group/event staff | Practical event context; no platform safety labels |
| Moderator trust summary | Platform/org/group mods (per scope) | Patterns, findings, restrictions, appeals |
| Site-admin restricted | SITE_ADMIN / T&S | Legal, severe safety, identity bans |
| Self standing | User | General standing, active limits, appeal path — **no reporter identity** |

**Never public:** report counts, negative feedback text, "unsafe/creep/spammy" labels, dogpile details, block counts.

---

## Recommended trust model

**Do not ship a single public numeric score.** Replace with categories:

### 1. Account standing

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| New account | `users.created_at` < 30d | Public subtle | Auto | No | **Yes** | — |
| Established member | Account age + no recent confirmed enforcement | Public | — | No | Phase 2 | — |
| Age affirmed | `age_affirmed_at` | Public optional | — | No | Phase 2 | ID verify pipeline |

### 2. Community participation

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Profile complete | Onboarding checklist | Public | — | No | Phase 2 | — |
| Accepted references | `profile_references` ACCEPTED | Public | 2y soft | Accept flow | Phase 4 | — |
| Known in org | `organization_members.joined_at` + role | Member | — | No | Phase 3 | — |

### 3. Event participation

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Event attendee | `convention_check_ins` or staff check-in | Public (if history visible) | 2y | No | Phase 2 | Check-in unification |
| Staff / volunteer | Staff duties table | Public staff profile | — | Organizer assign | Phase 3 | — |

### 4. Organizer / vendor / educator verification

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Verified organizer | Org verification workflow | Public org card | — | **Yes** | Phase 4 | — |
| Presenter history | `presenter_teaching_credits.verified` | Public | — | Worker sync | Phase 2 | — |
| Vendor verified credit | `vendor_event_credits.verified` | Public | — | Worker sync | Phase 2 | — |

### 5. Scoped community standing

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Org member standing | `local_reputation` | Org mods only | — | Organizer | Phase 3 | Anti-retaliation audit |
| Group feedback | `group_reviews` | Group members | — | — | Existing | Keep scoped |

### 6. Moderator-only safety context

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Messaging health | Rollups | Mod + self limits | Rolling windows | Pattern | Phase 1 | — |
| Open cases / findings | `moderation_cases` | Mod | Per policy | **Yes** | Phase 1 | Incident cluster |
| Scoped bans | `scope_bans` | Scoped mod | Mod retention | **Yes** | Phase 1 | Expiry support |

### 7. Site-admin-only restricted

| Label | Source | Who sees | Decay | Human review | Alpha | Later |
|-------|--------|----------|-------|--------------|-------|-------|
| Identity ban | `identity_bans` | Site admin | Permanent | **Yes** | Phase 1 read-only | Remove auto peer trigger |
| Legal hold | `legal_holds` | Legal admin | Case-based | **Yes** | Existing | — |

---

## Recommended build sequence

### Phase 0 — Data inventory and non-public admin summary

**Goal:** Read-only mod trust summary; deprecate plan for peer score; no new public UI.

| Item | Detail |
|------|--------|
| **Files** | `packages/api/src/lib/trust-summary.ts` (new), `routes/moderation-trust-summary.ts` (new), `moderation-profile-flags.ts`, `peer-reputation.ts` (document freeze) |
| **APIs** | `GET /api/v1/moderation/users/:userId/trust-summary` |
| **Schema** | Optional read-only views; no new tables required for MVP summary |
| **UI** | `ModerationCaseDetailPage` or new mod user inspector panel |
| **Tests** | Mod auth gate; summary never exposes reporter PII; no negative fields in public routes |
| **Risks** | Accidental exposure via ecosystem endpoint — audit all `trustScore` serializers |
| **Acceptance** | Mod can see account age, cases, bans, flags, blocks count (aggregate), check-in count in one call; public API unchanged |

### Phase 1 — Private trust summary for moderators/admins

**Goal:** Messaging health rollups, incident clustering schema, signal event log; soft DM rate limits.

| Item | Detail |
|------|--------|
| **Files** | `schema.ts`, `apply-incremental-migration.ts`, `lib/messaging-health.ts`, `lib/moderation-incidents.ts`, worker job |
| **APIs** | `GET .../messaging-health`, `POST .../incidents/cluster`, `PATCH .../trust-signals/:id` |
| **Schema** | `trust_signal_events`, `moderation_incidents`, `incident_reports`, `messaging_health_rollups` |
| **UI** | Mod dashboard trust panel; messaging limit banner (self only) |
| **Tests** | Rollup math, rate limit enforcement, incident cluster dedupe |
| **Risks** | Performance on message table scans — index `(sender_id, created_at)` |
| **Acceptance** | Spam pattern creates internal signal + rate limit without public label; mods see cluster |

### Phase 2 — Public positive-only profile trust badges

**Goal:** Replace `TrustRing` numeric score with factual badges; hide peer ±1.

| Item | Detail |
|------|--------|
| **Files** | `ProfileTrustPanel.tsx`, `TrustRing.tsx`, `profile/[username]/page.tsx`, `GET /api/v1/users/:id/trust-badges` |
| **APIs** | Public badges endpoint (positive fields only) |
| **Schema** | `trust_badges`, `trust_badge_assignments` optional |
| **UI** | Badge chips; remove reputation threshold slider or repurpose |
| **Tests** | Public endpoint never returns negative signals |
| **Risks** | User confusion during transition from numeric score |
| **Acceptance** | Profile shows badges not score; peer vote UI removed or disabled |

### Phase 3 — Scoped org/group/event trust context

**Goal:** Organizer-visible standing; unify check-in → attendance badge; org tenure.

| Item | Detail |
|------|--------|
| **Files** | `organizations.ts`, `group-reputation-routes.ts`, attendance gate, door routes |
| **APIs** | `GET /api/v1/organizations/:orgKey/members/:userId/trust` |
| **Schema** | `trust_signal_rollups` per scope |
| **UI** | Org roster contextual chips; event attendee verified chip (live API) |
| **Tests** | Scoped signal does not leak to platform summary without escalation |
| **Risks** | Organizer retaliation via `local_reputation` — add audit events |
| **Acceptance** | Org mod sees member event participation; platform mod sees escalation flag only |

### Phase 4 — Verification / endorsement system

**Goal:** Abuse-resistant references expansion; organizer/vendor verification; optional vouching.

| Item | Detail |
|------|--------|
| **Files** | `profile-references.ts`, verification routes, presenter/vendor workers |
| **APIs** | `POST /api/v1/trust/verification`, enhanced references |
| **Schema** | `user_verifications`, `organizer_verifications` |
| **UI** | Verification badges with tooltips; reference categories |
| **Tests** | Consent flows; duplicate reference prevention |
| **Risks** | Fake verification without human review for organizers |
| **Acceptance** | Verified organizer badge requires staff approval record |

### Phase 5 — Appeal, decay, and abuse hardening

**Goal:** Appeals API, signal expiry, dogpile detection, remove auto identity ban from peer score.

| Item | Detail |
|------|--------|
| **Files** | `moderation_appeals` routes, `peer-reputation.ts` (remove auto ban), decay worker |
| **APIs** | Appeals filing + review |
| **Schema** | `trust_signal_appeals`, `expires_at` on signals |
| **UI** | Self appeal page; mod appeals queue |
| **Tests** | Decay job, dogpile burst fixture, appeal overturn |
| **Risks** | Legal retention vs decay — respect `legal_holds` |
| **Acceptance** | User can appeal serious restriction; peer path no longer auto-bans |

---

## Open questions

1. **Deprecate timeline for `POST /api/v1/reputation/peers` and public `trust_score`?** Recommend freeze in Phase 0, remove UI Phase 2, migrate data to `trust_signal_events` Phase 5.
2. **Email verification priority?** No column today — needed for "verified account" badge?
3. **Unify `convention_check_ins` vs `convention_registrants.checked_in_at`?** Dual paths complicate attendance badges.
4. **Should group negative reviews feed any signal?** Recommend group-scoped feedback only, never platform safety.
5. **`profiles.verified` meaning?** Currently unused — retire or wire to real verification?
6. **Event-level `scope_bans`?** Not in schema — convention enforcement uses access grants + hub permissions.
7. **Negative interaction feedback UX?** Separate from public downvote — per-message "unwanted" vs profile flag?
8. **Cross-scope escalation workflow?** When does org mod escalate to platform T&S?
9. **Retention policy interaction** — which trust signals are deleted on account deletion?
10. **Worker capacity** for messaging rollups at alpha scale?

---

## File index

### API / lib

| Path | Relevance |
|------|-----------|
| `packages/api/src/db/schema.ts` | All trust tables |
| `packages/api/src/db/convention-organizer-schema.ts` | Command grants, vetting, registrants |
| `packages/api/src/lib/peer-reputation.ts` | Legacy peer score — **deprecate** |
| `packages/api/src/routes/peer-reputation-routes.ts` | Peer vote API |
| `packages/api/src/routes/profile-references.ts` | Positive references |
| `packages/api/src/routes/moderation-profile-flags.ts` | Profile review flags |
| `packages/api/src/lib/moderation-ts-intake.ts` | Report intake + dedupe |
| `packages/api/src/lib/moderation-ts-admin.ts` | Case admin |
| `packages/api/src/lib/moderation-action-execute.ts` | Enforcement execution |
| `packages/api/src/lib/dm-privacy.ts` | DM privacy gates |
| `packages/api/src/lib/blocks.ts` | Block enforcement |
| `packages/api/src/lib/org-reputation.ts` | Org composite rating |
| `packages/api/src/lib/attendance-gate.ts` | Review attendance (RSVP only) |
| `packages/api/src/lib/conversations-inbox.ts` | Inbox (no trust fields) |
| `packages/api/src/routes/ecosystem-stubs.ts` | People search, DMs, profiles |
| `packages/api/src/routes/social-graph-routes.ts` | Blocks, follows |
| `packages/api/src/routes/organizations.ts` | Local reputation PATCH |
| `packages/api/src/routes/group-reputation-routes.ts` | Group reviews |
| `packages/api/src/lib/rate-limit-config.ts` | Rate limits (no DM) |
| `packages/api/scripts/apply-incremental-migration.ts` | T&S table DDL |

### Web UI

| Path | Relevance |
|------|-----------|
| `packages/web/src/components/TrustRing.tsx` | Score ring |
| `packages/web/src/components/ProfileTrustPanel.tsx` | Trust panel |
| `packages/web/src/components/BadgeDisplay.tsx` | Badges |
| `packages/web/src/lib/trust-display.ts` | Placeholder detection |
| `packages/web/src/app/profile/[username]/page.tsx` | Public profile + peer votes |
| `packages/web/src/app/messaging/page.tsx` | DM trust ring |
| `packages/web/src/app/moderation/profile-flags/page.tsx` | Mod flags queue |
| `packages/web/src/components/find-people/FindPeopleProfileCard.tsx` | Directory cards |
| `packages/web/src/components/discovery/DiscoveryPeopleFilters.tsx` | Reputation filter |

### Shared / docs

| Path | Relevance |
|------|-----------|
| `packages/shared/src/moderation-types.ts` | Policy taxonomy |
| `packages/shared/src/user-settings.ts` | Privacy / messaging settings |
| `docs/FEATURE_REGISTRY.md` | Peer trust §, routes |
| `docs/audits/trust-and-safety/T&S-IMPLEMENTATION.md` | Moderation waves |
| `docs/architecture/12-moderation-systems.md` | Architecture |
| `docs/architecture/ADR-004-multi-tier-moderation.md` | Scope model |

### Tests

| Path | Relevance |
|------|-----------|
| `packages/api/src/test/moderation-ts-intake.test.ts` | Intake |
| `packages/api/src/test/moderation-ts-admin.test.ts` | Admin |
| `packages/api/src/test/moderation-scoped.test.ts` | Scoped targets |
| `packages/api/src/test/wave7-ci-db-smokes.test.ts` | Scope bans |
| `packages/api/src/lib/dm-privacy.test.ts` | DM defaults |
| `packages/api/src/lib/profile-access.test.ts` | Profile redaction |
| `e2e/moderation-ts.spec.ts` | E2E moderation |

---

## Appendix: search commands used

```bash
rg -n "profileReview|profile_review|review flag|downvote|flag" packages docs
rg -n "scope_bans|identity_bans|blocks|mutes|hidden_at|locked_at" packages docs
rg -n "moderation_cases|moderation_reports|moderation_events|moderation_actions" packages docs
rg -n "attendee|attendance|check.?in|registration|ticket|volunteer|presenter|vendor|organizer" packages docs
rg -n "verified|verification|attestation|age|18|legal hold|export|deletion" packages docs
rg -n "role|OWNER|ADMIN|MODERATOR|STAFF|MEMBER|platform_staff" packages docs
rg -n "endorse|review|rating|trust|reputation|badge|score|standing" packages docs
rg -n "block|mute|report|ban|suspend|freeze" packages docs
rg -n "connections|followers|following|mutual" packages docs
rg -n "privacy|visibility|public|private" packages docs
rg -n "peer-reputation|trust_score|profile_reputation|profile_review_flags" packages
rg -n "rate.?limit|rateLimit|cooldown|timeout|spam" packages/api
rg -n "trustScore|trust_score|assertCanInitiateDm|local_reputation" packages/api/src
```

Additional exploration: parallel codebase audits of schema, moderation APIs, positive signals, and web UI surfaces (2026-06-06).

---

*End of audit — implementation must follow phased plan and strategic guidance. Do not extend `profiles.trust_score` or public peer downvotes without explicit product override.*
