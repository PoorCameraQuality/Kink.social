# Trust & Safety Audit — C2K / ECKE

**Date:** 2026-06-05  
**Status:** Read-only audit — implementation not started  
**Product frame:** Adult UGC allowed; human-in-the-loop moderation; block illegal, non-consensual, underage, coercive, doxxing, trafficking, and spam.

**Authoritative docs:** `docs/architecture/12-moderation-systems.md`, `docs/architecture/ADR-004-multi-tier-moderation.md`, `docs/MODERATION_WIREFRAME.md`, `docs/FEATURE_REGISTRY.md` (moderation §110–117).

---

## Executive summary

C2K has a **working alpha moderation stack**: report intake (`POST /api/v1/reports`), org/group/platform inboxes, rule-of-two actions, audit log, scope bans, identity bans, convention gallery approval, profile review flags.

**Critical gaps for adult-platform T&S:**

| Gap | Risk |
|-----|------|
| Uploads go **directly to public S3** — no MIME magic-byte check, EXIF strip, quarantine, hash registry | CSAM/illegal media exposure, metadata leaks |
| **No unified media lifecycle** on profile photos, feed attachments, org branding | Cannot gate adult imagery before publish |
| **Feed posts** reportable but not hideable by mods (`feed_posts` has no `hidden_at`) | Reported UGC stays live |
| **DMs** — block/mute only; **no report target** | Harassment in private channels unaddressed |
| **Taxonomy drift** (`illegal` in UI vs `safety`/`content` in labels) | Triage inconsistency |
| **Suspend user** is audit-only (no account lock column) | Weak enforcement |
| **Moderation jobs** worker marks COMPLETED without analysis | False automation signal |
| **No appeals**, duplicate-report dedupe, blur/reveal in mod UI | Compliance and mod UX gaps |

**Recommended path:** Extend existing tables/routes (extend-before-add). Add `media_assets` + scan pipeline as spine. Waves T&S-1 → T&S-8 below.

---

## 1. UGC surfaces (inventory)

| Surface | Web route / component | API | DB tables | Media | Report | Mod takedown |
|---------|----------------------|-----|-----------|-------|--------|--------------|
| Profiles | `packages/web/src/app/profile/[username]/page.tsx`, `ProfilePageClient.tsx` | `ecosystem-stubs.ts`, `profile-photos.ts` | `profiles`, `profile_photos` | text, avatar, gallery URLs | `profile` | Partial — ban only |
| Feed posts | `HomePageClient.tsx`, `LocalPostCard.tsx` | `feed-routes.ts` | `feed_posts`, `post_likes` | text, image/audio attachments | `feed_post` | **Gap** — no hide |
| DMs | `/messaging` | `ecosystem-stubs.ts` messages routes | `conversations`, `messages` | text only | **None** | **None** |
| Org/group forums | `OrgHubClient.tsx`, `GroupForumsSection.tsx` | `organizations.ts`, `group-forums` | `forum_*` | text | org/group/event forum targets | Hide post — **Complete** |
| Org chat | Org hub channels | `organizations.ts` | `org_channel_messages` | text | `org_channel_message` | Hide — **Complete** |
| Conventions | `/conventions/:slug` | `convention-hub-ext-routes.ts`, `convention-hub-channels-routes.ts` | `convention_gallery_images`, hub messages, ISO | images | Gallery partial; hub chat **gap** | Gallery approve; ISO moderate |
| Events | `EventDetailPage`, `EventDiscussionPanel` | `ecosystem-stubs.ts` | `events` | text + hero URL | discussion only | Forum hide only |
| Education | `/education/:slug` | education routes | `education_articles` | HTML, hero | `education_article` | **Gap** — no hide |
| Media directory | `/media/:slug` | `media-routes.ts` | `media_shows`, `media_show_episodes` | cover URL + links | show/episode | Editorial approve only |
| Vendors | `/vendors/:id` | vendor routes | `vendor_profiles` | banner, logo | **None** | **None** |
| Presenters | `/presenters/:username` | `presenter-profiles` | `presenter_profiles`, gallery | text, images | education path | Partial |
| Generic upload | `upload-media.ts` | `upload.ts` | URLs on entities | any ≤10MB | indirect | **None** |
| Community places | map UI | `community-places-routes.ts` | `community_places` | text | **None** | pending queue **no UI** |

**Schema source:** `packages/api/src/db/schema.ts`

---

## 2. Existing moderation & admin tools

### Platform (Tier 0–1)

| Capability | Status | Key files |
|------------|--------|-----------|
| Staff roles | Complete | `platform_staff`, `lib/platform-staff.ts` |
| Report inbox | Complete | `moderation-reports.ts`, `web/src/app/moderation/reports/page.tsx` |
| Rule-of-two actions | Complete | `moderation-actions.ts`, `moderation-action-execute.ts` |
| Audit log | Complete | `moderation-audit.ts`, `moderation/audit/page.tsx` |
| Identity ban | Complete | `moderation-admin.ts`, `peer-reputation.ts` |
| User suspend | **Incomplete** — audit verb only | `moderation-admin.ts` |
| Profile review flags | Complete | `moderation-profile-flags.ts` |

**Web shell:** `packages/web/src/components/moderation/ModerationShell.tsx`  
**Shared types:** `packages/shared/src/moderation-types.ts`

### Org/group (Tier 2)

| Capability | Org | Group |
|------------|-----|-------|
| Scoped inbox | ✓ | ✓ |
| Hide forum post | ✓ | ✓ |
| Lock/pin thread | ✓ | gap |
| Hide chat | ✓ | N/A |
| Scope bans | ✓ | partial |
| Audit timeline | ✓ | gap |

**API:** `organization-moderation.ts`, `group-moderation.ts`  
**UI:** `OrganizerOrgModerationPanel.tsx`, `OrganizerGroupModerationPanel.tsx`

### Member report intake

- `ContentReportDialog.tsx` — spam, harassment, illegal, other  
- `PlatformReportForm.tsx` — harassment, spam, impersonation, safety, content, other  
- `POST /api/v1/reports` in `ecosystem-stubs.ts`  
- Scope: `moderation-report-scope.ts`; context: `moderation-report-context.ts`

**Smokes:** `scripts/smoke-reports.mjs`, `scripts/smoke-moderation.mjs`

---

## 3. Upload / media pipeline (observed)

| Check | Present? |
|-------|----------|
| `POST /api/upload` — 10 MB limit | Yes |
| Magic-byte / MIME allowlist | **No** |
| EXIF strip | **No** |
| Quarantine prefix | **No** |
| Hash blocklist | **No** |
| Virus/CSAM scan | **No** |
| Immediate public URL | **Yes** (except convention attendee pending *status* — URL still public) |

**Files:** `packages/api/src/routes/upload.ts`, `lib/s3-upload.ts`, `packages/web/src/lib/upload-media.ts`, `lib/media-display-url.ts`

---

## 4. Adult media lifecycle — recommended

New shared enums in `packages/shared/src/media-safety-types.ts`:

- `MEDIA_ASSET_STATUS`: `QUARANTINED` → `PENDING_REVIEW` → `APPROVED` / `REJECTED` / `REMOVED`
- `MEDIA_CONTENT_RATING`: `GENERAL`, `MATURE`, `EXPLICIT`, `RESTRICTED`
- `MEDIA_SCAN_STATUS`: `NOT_RUN`, `QUEUED`, `CLEAN`, `SUSPECT`, `BLOCKED`
- `MEDIA_VISIBILITY`: `PUBLIC`, `MEMBERS`, `CONNECTIONS`, `MOD_ONLY`, `OWNER_ONLY`

New table `media_assets` (owner, storage_key, sha256, phash, status, rating, scan_status, attestation JSONB, linked_target_type/id).  
Publish rule: public URL only when `APPROVED` and not `RESTRICTED`.

Link FKs from `profile_photos`, feed attachments, `convention_gallery_images`, `user_iso_images`, `presenter_gallery_images`.

---

## 5. Reporting taxonomy (proposed)

| Code | Label | Priority |
|------|-------|----------|
| `csam_suspected` | Suspected CSAM | P0 |
| `non_consensual_intimate` | NCII / leaked intimate imagery | P0 |
| `trafficking_coercion` | Trafficking / coercion | P0 |
| `underage_user` | User appears under 18 | P0 |
| `threats_violence` | Threats / violence | P1 |
| `doxxing_pii` | Doxxing / PII exposure | P1 |
| `harassment` | Harassment | P2 |
| `impersonation` | Impersonation | P2 |
| `spam_scam` | Spam / scam | P3 |
| `explicit_unlabeled` | Adult content without labeling | P3 |
| `consent_dispute` | Consent dispute | P2 |
| `other` | Other (note required) | P3 |

**Fix drift:** Split UI `illegal` into P0 codes; validate enum on `POST /api/v1/reports`.

**New target types:** `dm_message`, `profile_photo`, `feed_attachment`, `vendor_profile`, `convention_hub_message`, `community_place`.

---

## 6. Admin moderation console (extend `/moderation/*`)

**Queues:** P0 Safety, Open reports, Media review (`media_assets PENDING_REVIEW`), Actions pending, Profile flags, Community places.

**Case detail** (`/moderation/cases/:id`): summary, blurred preview with reveal → audit `content.revealed`, history, enforcement panel, internal notes, appeals tab (T&S-7).

**Enforcement matrix:** Forum/chat hide (today); add feed hide, education unpublish, profile photo quarantine, DM metadata-only review.

---

## 7. Implementation waves

| Wave | Scope | Key touch files |
|------|-------|-----------------|
| **T&S-1** | Policy enums, report validation, P0 notify, context excerpts | `moderation-types.ts`, `ContentReportDialog.tsx`, `ecosystem-stubs.ts`, `moderation-report-context.ts` |
| **T&S-2** | Feed + education hide on mod action | `schema.ts`, `moderation-action-execute.ts`, `feed-routes.ts` |
| **T&S-3** | Upload quarantine, MIME, EXIF strip | `upload.ts`, `s3-upload.ts`, `media_assets` migration, `worker.ts` |
| **T&S-4** | Hash blocklist, scan queue, blurred mod UI | `lib/media-scan/`, `moderation/media/page.tsx` |
| **T&S-5** | Surface gaps: vendor, hub chat, profile_photo reports | `convention-hub-channels-routes.ts`, `group-moderation.ts` |
| **T&S-6** | Real user suspend column + auth guard | `schema.ts`, `auth.ts`, `moderation-action-execute.ts` |
| **T&S-7** | Appeals + reporter resolution notifications | `moderation_appeals`, `notification-types.ts` |
| **T&S-8** | DM report metadata + audit CSV export | `ecosystem-stubs.ts`, `moderation-audit.ts` |

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Public S3 for pending gallery | Critical | T&S-3 quarantine |
| No CSAM hash check | Critical | T&S-4 |
| Feed explicit unmoderated | High | T&S-2 + T&S-3 |
| Suspend audit-only | High | T&S-6 |
| Mod burnout (no blur) | Medium | T&S-4 reveal UX |

---

## Acceptance criteria (program-level)

1. No member-visible URL without `media_assets.status = APPROVED` (or audited staff path).  
2. Every UGC surface has report + takedown **or** documented exception (DM = metadata-only).  
3. P0 categories notify platform mods within 60s.  
4. Rule-of-two preserved; all enforcement writes `moderation_audit_events`.  
5. Explicit content requires attestation + `EXPLICIT` rating before approve.  
6. Humans decide — scan queues only; no autonomous identity ban except hash block + admin confirm.

---

## Tests needed

- Extend `scripts/smoke-reports.mjs`, `smoke-moderation.mjs`  
- New: `moderation-report-intake.test.ts`, `upload-validation.test.ts`  
- Extend: `wave7-ci-db-smokes.test.ts` (hide filters), `wave6-enforcement-guards.test.ts`  
- Playwright: report buttons on key surfaces; mod queue smoke (T&S-4+)

---

## File index (implementation checklist)

**API:** `ecosystem-stubs.ts`, `upload.ts`, `feed-routes.ts`, `profile-photos.ts`, `moderation-reports.ts`, `moderation-actions.ts`, `moderation-admin.ts`, `moderation-action-execute.ts`, `organization-moderation.ts`, `group-moderation.ts`, `convention-hub-ext-routes.ts`, `convention-hub-channels-routes.ts`, `community-places-routes.ts`, `media-routes.ts`, `worker.ts`, `db/schema.ts`

**Web:** `ContentReportDialog.tsx`, `PlatformReportForm.tsx`, `app/moderation/**`, `components/organizer/moderation/**`, `lib/upload-media.ts`, `lib/moderation/report-labels.ts`, `hooks/useApiModerationReports.ts`

**Shared:** `moderation-types.ts`, `notification-types.ts` (new types before routes)

---

*Ready for T&S-1 implementation after UI-1 manual alpha sign-off.*
