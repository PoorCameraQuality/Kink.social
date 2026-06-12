# Coast to Coast Kink — Legal Profile + Open Source Trust & Safety Master Plan

**Status:** Active master implementation plan  
**Last updated:** 2026-06-06  
**Assumes:** T&S-1 through T&S-5 green; legal-profile foundation + T&S-4B hardening landed  
**Related:** [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md), [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](./trust-safety/SCOPED_MODERATION_GAP_AUDIT.md), [`trust-safety/POLICY_COVERAGE_MATRIX.md`](./trust-safety/POLICY_COVERAGE_MATRIX.md), [`privacy/LEGAL-RISK-PRINCIPLE.md`](./privacy/LEGAL-RISK-PRINCIPLE.md), [`privacy/data-inventory.md`](./privacy/data-inventory.md), [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md)

---

## Alpha posture (current checkpoint)

| Setting | Value |
|---------|--------|
| **Ship mode** | `community_only` |
| **Explicit media** | Off by default (`C2K_ALLOW_EXPLICIT_MEDIA=false`) |
| **Staging exception** | `attested_explicit_beta` only when deliberately enabled |
| **Production scanners** | Fail closed (`MEDIA_SCANNER_STRICT_MODE=true`) |
| **Public exposure** | Explicit + `PUBLIC_PREVIEW` → **coerced to `logged_in`**, not rejected |

### Intentional policy: explicit visibility coercion

When a user attests `EXPLICIT_ADULT` with `PUBLIC_PREVIEW`, the API **coerces visibility to `logged_in`** (HTTP 200) rather than rejecting or allowing public preview. This is **deliberate product policy** — it prevents accidental public leakage without surprising users with a hard rejection.

**Regression test (do not “fix” into public leakage or inconsistent rejection):**

- `packages/api/src/test/media-assets.test.ts` — `EXPLICIT_ADULT + PUBLIC_PREVIEW coerced to logged-in at attestation`
- Covered by `npm run verify:trust-safety:media-policy` and full `verify:trust-safety`

---

## Phase status (2026-06-06)

| Phase | Title | Status | Notes |
|-------|-------|--------|-------|
| **0** | Product policy lockdown | **Partial** | `MEDIA_POLICY_MODE`, signup attestation, API gates — **done**; policy hub + draft pages — **done** (LEGAL-ALPHA-1.5); counsel-published (`VITE_LEGAL_PUBLISHED`) — **not done** |
| **1** | Data minimization + small legal profile | **Partial** | Inventory, retention config, sweep job, vendor scaffold — **done**; full privacy defaults overhaul — **partial** |
| **2** | Legal request + preservation hold | **Stub** | Tables + `isUnderLegalHold()` — **done**; admin UI, scoped export, purge integration — **not done** |
| **3** | Open-source scanner runtime | **Partial** | Adapters + strictness (T&S-4A/4B) — **done**; NudeNet/Tesseract OSS runtime, scanner worker — **not done** |
| **4** | Explicit media privacy hardening | **Partial** | Coercion, discovery/OG guards — **done**; sitemap/search/feed exhaustive tests — **partial** |
| **5** | Hash governance + perceptual hashing | **Partial** | SHA-256 governance API — **done**; pHash/dHash/ImageHash — **not done** |
| **6** | Minor safety + manual NCMEC | **Partial** | Playbooks, case dedupe metadata, P0 routing to `MINOR_SAFETY_RESTRICTED` — **done**; full case fields, dedicated critical queue UI — **partial** |
| **7** | NCII takedown + re-upload prevention | **Partial** | 15 canonical reasons + `NCII_URGENT` queue + P0 notify — **done**; emergency restrict workflow, hash re-upload block — **not done** |
| **8** | Cheap video scan | **Not started** | Video uploads disabled |
| **9** | DMCA + copyright workflow | **Partial** | Public `/dmca` page + intake API + admin `/moderation/dmca` — **done**; repeat-infringer enforcement — **partial** |
| **10** | Trust & Safety operator UI-2 | **Partial** | T&S-3.5 console + T&S-5 scoped mod parity + case actions — **done**; scanner health panel, hash-list UI, re-scan UI, full UI-2 polish — **not done** |
| **11** | Admin access, audit, least privilege | **Partial** | Platform mod roles, rule-of-two actions, audit timeline — **done**; reason-gated reveals, MFA — **not done** |
| **12** | Infrastructure + vendor surface reduction | **Partial** | Vendor registry scaffold — **done**; enforcement, MFA — **not done** |
| **13** | User export, delete, privacy dashboard | **Not started** | |
| **14** | Re-scan and policy change jobs | **Not started** | Case dedupe exists; batch re-scan deferred |
| **15** | Final alpha readiness gates | **Partial** | Core gates green (`verify:trust-safety`, `verify:prelaunch`); phase-specific verify scripts partially missing |

### Closed (do not re-implement)

- v1 explicit media disabled by default
- 18+ signup attestation (`age_affirmed_at`, `terms_accepted_at`, `policy_version_accepted`)
- Retention/inventory docs + retention sweep job
- Legal-hold stub (`legal_requests`, `legal_holds`, `isUnderLegalHold()`)
- Production scanner fail-closed behavior
- `MEDIA_POLICY_MODE` + admin read-only config
- Explicit media privacy coercion
- Hash-list governance (reason code, source, admin API)
- Scanner case dedupe
- `verify:trust-safety` + `verify:prelaunch` green
- T&S-5 canonical report intake (`POST /api/v1/moderation/reports`) on API-backed UGC surfaces
- Scoped legacy bridge (org/group/event `reports` rows + `org_moderation_needed`)
- Group/org/event/convention scoped mod APIs (hide, lock, ban, audit)
- P0 report notify job (`p0_report_notify` → `notifyP0ModerationCaseCreated`)
- Reporter history (`GET /api/v1/me/moderation/reports`) + `report_reviewed` notification

---

## Project context

Coast to Coast Kink is an adults-only community, events, groups, education, vendors, organizers, and social platform for consenting adults. It may support adult/kink identity and carefully controlled adult media, but the platform must not become an “anything goes” porn marketplace, escort marketplace, or illegal-content host.

### Current state (T&S stack)

**T&S-1:** Reports/cases/queues/audit exist.

**T&S-2:** Adult media metadata, attestation, and visibility controls exist.

**T&S-3:** Quarantine, validation, hash, and promote flow exist.

**T&S-3.5:** Admin console access exists.

**T&S-4A:** Scanner adapters exist.

- `media_scanner_results` exists.
- `media_hash_list_entries` exists.
- Malware / exact hash / adult classifier stub / OCR risk shell exist.
- `CompositeMediaScanner` persists scanner results and aggregates worst result to `media_assets.scan_status`.
- FLAGGED/BLOCKED/ERROR quarantines.
- GREEN + PASSED can currently promote normal attested solo explicit content (when policy mode allows).
- Admin case detail shows scanner summaries.

**T&S-4B:** Legal-profile hardening — scanner strictness, `MEDIA_POLICY_MODE`, hash governance API, playbooks.

**T&S-5:** Moderation alpha pass — unified report intake, scoped mod parity, platform polish.

- Canonical taxonomy in `@c2k/shared` `moderation-types.ts` — 15 `PolicyReason` values, 6 queues, P0 routing helpers.
- `ReportAction` / `TsReportModal` → `POST /api/v1/moderation/reports` on all live API-backed UGC surfaces.
- Scoped mod: org/group hide/lock/ban/audit; event host hide/lock; convention staff chat hide.
- Platform: dashboard, queues, cases, case actions (`hide_content`, `escalate`, media remove/restore), rule-of-two `moderation_actions`.
- Legacy `POST /api/v1/reports` delegates to same intake path.

**Moderation API inventory (source of truth: `packages/api/src/routes/moderation-*.ts`):**

| Area | Key routes |
|------|------------|
| **Intake** | `POST /api/v1/moderation/reports`, `GET /api/v1/me/moderation/reports` |
| **Platform admin** | `GET /api/v1/moderation/dashboard`, `/queues`, `/cases`, `/cases/:id`, `PATCH`, `/notes`, `/actions`, `/cases/:id/media-content` |
| **T&S config** | `GET /api/v1/moderation/trust-safety/config`, `/media-hash-list`, `POST /media-hash-list` |
| **Rule of two** | `GET/POST /api/v1/moderation/actions`, approve/reject/execute-now |
| **Legacy reports** | `GET /api/v1/moderation/reports`, `/summary`, `PATCH /reports/:id` |
| **Trust signals** | `GET /api/v1/moderation/users/:userId/trust-summary`, `/incidents` |
| **Scoped org** | `GET/PATCH /api/v1/organizations/:orgKey/reports`, hide/lock/ban/audit |
| **Scoped group** | `GET/PATCH /api/v1/groups/:groupId/reports`, hide/lock/ban/audit |
| **Scoped event** | `POST /api/v1/events/:eventId/forum/posts/:postId/hide`, thread moderate |
| **Scoped convention** | `POST .../hub-channels/.../messages/:messageId/hide` |
| **Site admin** | `POST /api/v1/moderation/admin/identity-bans`, `/users/:id/suspend`, org freeze |

**Current gates (green):**

- `npm run verify:trust-safety`
- `npm run verify:trust-safety:scanners`
- `npm test`
- `npm run build`
- `npm run verify:prelaunch`
- `npm run verify:alpha:auto:local`

### Important strategic correction

Because GREEN + PASSED can promote attested solo explicit content, the platform is now adult-media capable. That changes the risk posture. We need to shrink legal exposure before wider alpha.

**This project is NOT about evading lawful process.**

**This project IS about:**

- collecting less sensitive data,
- retaining less unnecessary data,
- keeping adult content private by default,
- blocking minors and illegal content,
- routing risky content to moderation,
- preserving evidence when legally/safety required,
- using open-source tooling wherever possible,
- building manual workflows for NCMEC/NCII before expensive or official integrations,
- avoiding enterprise tooling we cannot afford.

### Core safety principles

1. Adults only.
2. No minors, ever.
3. No CSAM, ever.
4. No non-consensual intimate imagery.
5. No trafficking or commercial sex solicitation.
6. No doxxing, blackmail, threats, or harassment.
7. No copyrighted/stolen adult media.
8. No public explicit media by default.
9. No explicit media in unauthenticated feeds, public search, OG previews, sitemaps, or public profile previews.
10. Automated scanners are signals, not final legal conclusions.
11. Severe scanner results quarantine first and create moderation cases.
12. Human review decides external escalation.
13. Do not implement fake NCMEC, StopNCII, Take It Down, or PhotoDNA integrations.
14. Internal SHA-256/perceptual hash lists are abuse prevention tools, not CSAM databases.
15. Production scanners must fail closed.

---

## PHASE 0 — PRODUCT POLICY LOCKDOWN

**Goal:** Define the safe product boundary before building more features.

Implement central policy config:

**`MEDIA_POLICY_MODE` enum:**

- `community_only`
- `attested_explicit_beta`
- `explicit_enabled`

**Defaults:**

- production: `community_only` unless explicitly configured
- staging: `attested_explicit_beta` allowed
- local/test: configurable

**Mode behavior:**

**`community_only`:**

- Explicit media upload blocked.
- Allow event flyers, profile images, vendor logos, educational images, and non-explicit community media.
- If user marks content explicit, reject with clear message.
- Message: “Explicit sexual media uploads are not supported on this platform at this time.”

**`attested_explicit_beta`:**

- Allow limited solo explicit media only if:
  - user has accepted adult media policy,
  - user attests they are 18+,
  - user attests they own the content or have rights to upload,
  - user attests all depicted persons are adults,
  - user attests consent exists,
  - media is not public by default,
  - scanners pass,
  - no mismatch flags exist.

**`explicit_enabled`:**

- Reserved for future.
- Do not enable by default.
- Requires legal/compliance review before production.

**Add policy pages:**

- Terms of Service
- Privacy Policy
- Community Guidelines
- Adult Content and Consent Policy
- Law Enforcement Guidelines
- DMCA Policy
- Vendor/Event Organizer Terms
- Minor Safety Policy
- NCII Takedown Policy

**Add policy versioning:**

- users accept active policy version at signup
- major updates force re-acceptance
- store: `terms_accepted_at`, `privacy_accepted_at`, `adult_policy_accepted_at`, `policy_version_accepted`, `age_affirmed_at`

**Acceptance criteria:**

- Explicit media cannot bypass `community_only` mode.
- Production does not accidentally allow explicit uploads.
- Active media policy mode is visible in admin settings.
- Signup requires 18+ affirmation and current policy acceptance.
- Tests cover API and UI upload bypass attempts.

**Verification:**

- `npm run verify:trust-safety:media-policy`
- `npm run verify:trust-safety`
- `npm test`
- `npm run build`

---

## PHASE 1 — DATA MINIMIZATION + SMALL LEGAL PROFILE

**Goal:** Make privacy and limited retention a product requirement.

**Create:**

- `docs/privacy/data-inventory.md`
- `docs/privacy/vendor-registry.md`
- `docs/privacy/retention-policy.md`

**Data inventory must cover:** users, profiles, media assets, scanner results, private messages, posts/comments, groups, event attendance, organizations, vendors, reports, moderation cases, legal requests, legal holds, admin audit logs, login/session/IP logs, payment/billing records if present.

For each data category document: purpose, sensitivity, retention period, deletion behavior, legal-hold behavior, admin visibility, export behavior, vendor/subprocessor exposure.

**Add retention config:**

- `SECURITY_LOG_RETENTION_DAYS=30` or `60`
- `RAW_IP_RETENTION_DAYS=30`
- `RAW_SCANNER_JSON_RETENTION_DAYS=90`
- `DELETED_ACCOUNT_PURGE_DAYS=30`
- `MODERATION_RECORD_RETENTION_DAYS=365`
- `LEGAL_HOLD_OVERRIDES_RETENTION=true`

**Add scheduled retention job:** anonymize/delete expired logs; remove expired raw scanner JSON; anonymize deleted users after purge delay; skip records under legal hold; write audit log for retention action.

**Privacy defaults:** real name optional; store age_verified/self_attested status, not full DOB unless legally required later; no ID docs stored internally; coarse location only by default; event attendance private/member-only by default; group membership member-only/private by default; profile sensitive fields not public by default; no adtech pixels; no third-party analytics for sensitive behavior; no public indexing of sensitive pages.

**Acceptance criteria:**

- Data inventory exists and covers all sensitive tables.
- Retention job is testable and respects legal hold.
- Raw IP/session/scanner data has clear retention.
- No sensitive field is publicly exposed by default.
- Vendor registry exists and is required before adding new vendors.

**Verification:**

- `npm run verify:trust-safety:legal-profile`
- `npm test`
- `npm run build`

---

## PHASE 2 — LEGAL REQUEST + PRESERVATION HOLD SYSTEM

**Goal:** Create a clean lawful-response system without overcollecting data.

**Add model/table: `LegalRequest`** — fields: id, received_at, received_via, requester_name, requester_agency_or_party, jurisdiction, request_type (subpoena, warrant, court_order, preservation_request, civil_discovery, emergency_request, other), scope_summary, status (received, counsel_review, rejected, narrowed, fulfilled, closed), gag_order, user_notice_allowed, notes_private, created_by_admin_id, created_at, updated_at.

**Add model/table: `LegalHold`** — fields: id, legal_request_id nullable, target_type, target_id, starts_at, expires_at nullable, reason, active, created_by_admin_id, created_at.

**Add helper:** `isUnderLegalHold(entityType, entityId)`

**Modify deletion/anonymization:** never delete records under active legal hold; allow normal scheduled deletion when no legal hold exists; deletion after valid preservation request must be blocked for scoped entities.

**Admin UI:** Legal Requests page; Active Legal Holds page; create legal request; create legal hold; close legal hold; scoped export package; no global “export everything” button without scope/reason; all actions audit logged.

**Acceptance criteria:**

- Legal hold blocks destructive deletion.
- Admin can see active holds.
- Scoped exports require reason and role.
- Legal request and hold actions are audited.
- Retention job skips held data.

**Verification:**

- `npm run verify:trust-safety:legal-profile`
- `npm test`
- `npm run build`

---

## PHASE 3 — OPEN SOURCE SCANNER RUNTIME

**Goal:** Replace stubs/shells with open-source-first scanner runtime while keeping CI/local simulation.

**Open-source tools:** ClamAV (malware), Tesseract OCR, NudeNet (adult/nudity), optional NSFWJS (client preflight only), SHA-256 exact hash, ImageHash pHash/dHash/aHash/wHash, ffprobe (video metadata), ffmpeg (frame extraction), optional PySceneDetect later.

**Runtime config:** `SCANNER_RUNTIME_MODE=stub|oss|disabled`, `MEDIA_SCANNER_STRICT_MODE`, `MEDIA_SCANNER_ALLOW_NOOP=false` in production, per-scanner require flags, timeout/max file/concurrency/CPU-only settings.

**Production rules:** no silent noop pass; required scanner unavailable = ERROR; ERROR = quarantine/fail closed; local/dev may noop only if explicitly configured; CI may simulate pass/flag/block/error.

**Worker architecture:** scanner worker service/container; upload enters pending scan state; media not visible until scan completes; scanner results persist to `media_scanner_results`; scanner summary attaches to moderation snapshots; quarantine on FLAGGED/BLOCKED/ERROR according to policy.

**ClamAV:** production clamd down = ERROR; local clamd down can noop only with explicit flag; `NOOP_PASSED` distinct from PASSED if supported.

**Tesseract:** OCR on images and sampled video frames; normalize text; detect policy terms (minor safety, CSAM language, NCII/revenge/leak, commercial sex, spam/scam, doxxing); store labels; raw OCR in restricted private scanner JSON; access requires SITE_ADMIN or TRUST_SAFETY_ADMIN and audit reason.

**NudeNet:** real server-side adapter; normalize labels (safe, suggestive, partial_nudity, explicit_nudity, sexual_act, unknown); mismatch handling per policy mode.

**Optional NSFWJS:** browser-side preflight only; never trusted as final result.

**Acceptance criteria:**

- Production cannot silently pass scanner failures.
- Tesseract adapter works in oss mode.
- NudeNet adapter works in oss mode.
- Stub/simulate mode still works for CI.
- Raw scanner JSON remains permission-gated.
- All scanner results persist.
- Scanner ERROR quarantines in strict mode.

**Verification:**

- `npm run verify:trust-safety:oss-scanners`
- `npm run verify:trust-safety:scanners`
- `npm run verify:trust-safety`
- `npm test`
- `npm run build`

---

## PHASE 4 — EXPLICIT MEDIA PRIVACY HARDENING

**Goal:** Prevent adult media from leaking publicly.

For explicit/adult-attested media: default visibility private/member-restricted; never public by default; noindex; no unauthenticated access; no public search; no public profile preview; no unauthenticated feed; no public event page; no OG preview; no sitemap; no external embeds; no permanent public CDN URLs; use signed/authorized access.

**Server-side enforcement:** do not trust client visibility settings; every media access route checks auth and visibility; every search/index/feed route filters explicit media; OG/social metadata must never use explicit images; sitemap generator excludes adult/sensitive pages by default.

**Acceptance criteria:**

- Logged-out users cannot access explicit media.
- Explicit media never appears in public search.
- Explicit media never appears in sitemap.
- Explicit media never appears in OG previews.
- Tests cover API access, public routes, search, feed, sitemap, and OG metadata.

**Verification:**

- `npm run verify:trust-safety:media-privacy`
- `npm run verify:trust-safety`
- `npm test`
- `npm run build`

---

## PHASE 5 — HASH LIST GOVERNANCE + PERCEPTUAL HASHING

**Goal:** Create cheap re-upload prevention without pretending this is CSAM detection.

**Existing:** `media_hash_list_entries` as internal SHA-256 deny/review list.

**Harden fields:** hash_sha256, algorithm enum (sha256, phash, dhash, ahash, whash, pdq_future), action (deny, review), reason_code, source enum, notes_private, created_by_admin_id, created_at, expires_at, active, linked_case_id, original_media_asset_id, legal_hold_id.

**Rules:** Never label internal hash list as CSAM detection; never imply PhotoDNA/NCMEC replacement; hash entry requires reason code, source, and admin ID; NCII hash entries require linked case; deny = block/quarantine; review = moderation case; expired/inactive hashes do not match; perceptual match creates review, not auto-block unless high-confidence policy says otherwise.

**Add ImageHash support:** pHash, dHash, optional aHash/wHash; Hamming distance compare; video sampled frame hashes.

**Acceptance criteria:**

- Admin cannot create hash entry without reason/source.
- Hash actions are audited.
- Exact deny blocks re-upload.
- Exact review creates case.
- Perceptual match creates review case.
- NCII near-duplicate emergency-restricts and routes to review.
- Docs clearly state this is not a CSAM database.

**Verification:**

- `npm run verify:trust-safety:perceptual-hash`
- `npm run verify:trust-safety:scanners`
- `npm test`
- `npm run build`

---

## PHASE 6 — MINOR SAFETY + MANUAL NCMEC WORKFLOW

**Goal:** Build serious internal workflow for suspected minor-safety/CSAM cases. Manual first. No auto-reporting from AI alone.

**Add case fields:** minor_safety_review_status, external_report_type, external_report_reference, external_report_submitted_at, external_report_submitted_by_admin_id, evidence_preservation_status, counsel_review_required.

**Routing:** suspected_csam / minor_safety reports = critical; OCR minor-safety terms = critical/high; classifier minor-context = critical review not automatic conclusion; quarantine media immediately; restrict account visibility when appropriate; pause deletion; legal hold preserves evidence.

**Docs:** `docs/trust-safety/minor-safety-escalation.md`, `docs/trust-safety/ncmec-manual-reporting-playbook.md` (partially shipped).

**NCMEC API:** do not implement live submission; placeholders only (`NCMEC_API_ENABLED=false`); no fake credentials; no auto-submit.

**Admin UI:** Critical Minor Safety queue; case detail with reports, scanner signals, preservation, legal hold, external report status; privileged actions with reason + audit; low-privilege mods cannot view raw media/private scanner JSON.

**Acceptance criteria:**

- Minor-safety cases cannot be lost in normal queue.
- Suspected CSAM/minor reports create critical cases.
- Related media quarantines immediately.
- Deletion blocked during active review.
- External reporting status changes require privileged role.
- All actions audited.
- NCMEC API remains disabled until official onboarding.

**Verification:**

- `npm run verify:trust-safety:minor-safety`
- `npm run verify:trust-safety`
- `npm test`
- `npm run build`

---

## PHASE 7 — NCII TAKEDOWN + RE-UPLOAD PREVENTION

**Goal:** Build internal non-consensual intimate image workflow without paid vendors or fake StopNCII/Take It Down integration.

**Report reasons:** ncii_non_consensual_intimate_image, intimate_image_abuse, revenge_or_leak_threat, impersonation_intimate_media, consent_dispute.

**NCII case fields:** ncii_status, claimant_user_id, claimant_contact_email, claimant_statement_private, consent_dispute, emergency_visibility_restriction.

**Emergency restriction:** hide/quarantine pending review; preserve evidence; restrict access to TRUST_SAFETY_ADMIN/SITE_ADMIN; audit all reveals.

**Takedown flow:** report → high/critical case → emergency restrict → admin review → if approved: remove access, SHA-256 deny hash, pHash/dHash review hash, block re-upload, route similar matches to review; if denied: restore only if safe.

**External program placeholders:** `docs/trust-safety/ncii-external-programs.md`; `STOPNCII_INTEGRATION_ENABLED=false`; `TAKEITDOWN_INTEGRATION_ENABLED=false`.

**Acceptance criteria:**

- NCII report creates case.
- Emergency restriction hides media.
- Approved takedown creates internal hash block.
- Exact re-upload blocked.
- Similar-image match routes to review.
- Claimant private notes role-restricted.
- All actions audited.

**Verification:**

- `npm run verify:trust-safety:ncii`
- `npm run verify:trust-safety:perceptual-hash`
- `npm test`
- `npm run build`

---

## PHASE 8 — CHEAP VIDEO SCAN

**Goal:** Add video scanning without GPU or enterprise tools. Video uploads stay disabled until image safety workflows are stable.

**Config:** `VIDEO_UPLOADS_ENABLED=false`, `VIDEO_EXPLICIT_UPLOADS_ENABLED=false`, sample frame count, max file/duration/dimensions.

**Model updates:** media_type image/video; duration, dimensions, codec, container, bitrate, has_audio, scan_sample_count, frame_scan_status, video_scan_status, thumbnail_asset_id.

**Use ffprobe + ffmpeg:** sample frames at 5%, 10%, 25%, 50%, 75%, 90%, 95%; run malware, hash, NudeNet, Tesseract, ImageHash on frames; aggregate worst result.

**Acceptance criteria:**

- Video invisible while pending scan.
- Oversized/unsupported video fails closed.
- Explicit sampled frame flags video.
- OCR term on sampled frame creates moderation case.
- Video scanner summaries in admin.
- Video uploads disabled by default.

**Verification:**

- `npm run verify:trust-safety:video`
- `npm run verify:trust-safety:scanners`
- `npm test`
- `npm run build`

---

## PHASE 9 — DMCA + COPYRIGHT WORKFLOW

**Goal:** Protect against stolen photos, copyrighted porn, impersonation, and takedown chaos.

**Add public DMCA page:** designated agent placeholder; takedown/counter-notice instructions; repeat-infringer policy.

**Add DMCA case model:** claimant_name, claimant_email, work_identified, allegedly_infringing_url, target_content_id, status, received_at, resolved_at, notes_private.

**Admin actions:** disable content; restore content; mark repeat infringer; attach counter-notice; create hash review/deny entry for repeat stolen media.

**Acceptance criteria:**

- Public DMCA page exists.
- Admin can process takedown/counter-notice.
- Removed content not publicly accessible.
- Repeat-infringer status enforceable.
- Actions audited.

**Verification:**

- `npm run verify:trust-safety:dmca`
- `npm test`
- `npm run build`

---

## PHASE 10 — TRUST & SAFETY OPERATOR UI-2

**Goal:** Make the admin UI usable for a small team with no paid T&S platform.

**Dashboard sections:** Overview, Critical queue, Scanner flags, Minor safety, NCII, DMCA, Hash matches, Malware, OCR risk, Video scan, Legal holds, Scanner health, Hash list, Policy mode.

**Scanner health panel:** ClamAV, Tesseract, NudeNet, ffmpeg/ffprobe, worker queue depth, strict mode, noop danger warning, failed scan count.

**Case list/detail:** severity, queue, scanner badges, SLA, assigned admin, scanner/OCR/classifier/hash/video summaries, preservation/legal hold/external report/NCII/DMCA status, raw scanner JSON reveal for privileged admins only with reason.

**Hash list UI, re-scan UI, policy UI** per spec in original plan.

**Acceptance criteria:**

- One admin can operate the queue without database access.
- Sensitive reveals require role + reason.
- Scanner health makes broken scanners obvious.
- Hash entries cannot be created casually.
- Minor safety and NCII cases visually impossible to miss.
- Policy danger states obvious.

**Verification:**

- `npm run verify:trust-safety:admin-ui`
- `npm run verify:trust-safety:minor-safety`
- `npm run verify:trust-safety:ncii`
- `npm run verify:trust-safety:scanners`
- `npm test`
- `npm run build`

---

## PHASE 11 — ADMIN ACCESS, AUDIT LOGS, AND LEAST PRIVILEGE

**Goal:** Make sensitive admin access controlled, justified, and auditable.

**Roles:** SITE_ADMIN, TRUST_SAFETY_ADMIN, MODERATOR, LEGAL_ADMIN, SUPPORT, ORGANIZER, USER.

**Restrict access** per resource type (messages, legal requests, quarantined media, minor-safety cases, NCII notes, raw IP/logs, raw scanner JSON, hash list edits).

**Audit log fields:** admin_id, action, target_type, target_id, reason, timestamp, previous_state, new_state, request_context, ip/session metadata.

**Require reason for:** viewing raw scanner JSON, sensitive media, claimant notes, exports, account locks, legal holds, minor-safety external report status changes, quarantine, deletion override, hash list edits, media policy mode changes, disabling scanner strictness.

**Acceptance criteria:**

- Sensitive admin actions require permission and reason.
- Audit logs cannot be modified from normal admin UI.
- Unauthorized roles blocked.
- Tests cover role matrix and reason requirements.

**Verification:**

- `npm run verify:trust-safety:admin-ui`
- `npm run verify:trust-safety:legal-profile`
- `npm test`
- `npm run build`

---

## PHASE 12 — INFRASTRUCTURE + VENDOR SURFACE REDUCTION

**Goal:** Keep hosting/vendor exposure small and cheap.

**Preferred stack:** Swiss-owned hosting if feasible; K8s only if manageable; otherwise VPS for alpha; Postgres encrypted backups; S3-compatible storage; self-hosted analytics/logging; no adtech pixels.

**Vendor registry** must include hosting, DNS, CDN, object storage, database, backups, email, analytics, logging, error tracking, payments, support, scanner/AI, moderation tools — with country, data regions, subprocessors, data types, retention, legal request policy, U.S.-control flag, sensitive data exposure.

**Infrastructure rules:** no new third-party without registry entry; no adtech; no sensitive data to analytics; encrypted backups; least-privilege credentials; secrets not in repo; admin MFA required; production scanner strictness; upload bucket not publicly listable; explicit media not public-CDN without authorization.

**Acceptance criteria:**

- Vendor registry current.
- New vendor additions require checklist update.
- Sensitive data not sent to analytics/logging.
- Backups encrypted.
- Admin MFA required.
- Production scanner config strict.

**Verification:**

- `npm run verify:prelaunch`
- `npm run verify:trust-safety:legal-profile`
- `npm test`
- `npm run build`

---

## PHASE 13 — USER RIGHTS: EXPORT, DELETE, PRIVACY DASHBOARD

**Goal:** Give users control while preserving safety/legal exceptions.

**User privacy dashboard:** profile/event/group/search/indexing/media visibility; “view as public/member/organizer” preview.

**Profile visibility levels:** public, members_only, unlisted, private.

**User data export:** profile, posts/comments, media metadata, RSVPs, group memberships, safe reports, exportable messages; exclude protected moderation/internal notes.

**Account deletion:** immediate deactivation; remove from discovery; schedule purge/anonymization; delete media unless moderation/legal hold; preserve minimal abuse/legal records; explain exceptions.

**Acceptance criteria:**

- User can export data.
- User can request deletion.
- Deleted users disappear from discovery immediately.
- Legal/moderation exceptions explicit and logged.
- Legal hold blocks deletion.
- Sensitive fields default private/member-only.

**Verification:**

- `npm run verify:trust-safety:privacy`
- `npm test`
- `npm run build`

---

## PHASE 14 — RE-SCAN AND POLICY CHANGE JOBS

**Goal:** Allow safety improvements without losing history.

**Triggers:** scanner version changes, hash list changes, media policy mode changes, manual admin request, case reopened, NudeNet/Tesseract/ClamAV version update.

**Behavior:** re-scan eligible assets; preserve previous results; write new rows with new versions; worse status → quarantine + case; better status → do not auto-promote if case open; timeline event on case.

**Case dedupe:** one open scanner-related case per asset unless severity increases; append flags to timeline; severity escalation updates case; immutable scanner snapshot in case metadata.

**Severity mapping:** malware blocked = critical; hash deny = critical; hash review = high; minor/CSAM terms = critical; NCII terms = high; explicit mismatch = medium/high; OCR spam = medium; scanner error = high.

**Acceptance criteria:**

- Admin can re-scan one asset.
- Batch re-scan works.
- Worse results quarantine.
- Better results do not bypass open cases.
- Scanner cases do not duplicate endlessly.
- Case timeline records scanner updates.

**Verification:**

- `npm run verify:trust-safety:rescan`
- `npm run verify:trust-safety:scanners`
- `npm test`
- `npm run build`

---

## PHASE 15 — FINAL ALPHA READINESS GATES

**Goal:** Define what must be true before public-ish alpha.

**Alpha may launch only if:**

- production media policy mode known and visible
- explicit media blocked or beta-gated
- production scanners fail closed
- no scanner silently noops in production
- explicit media cannot appear publicly
- minor-safety workflow exists
- NCII takedown workflow exists
- DMCA workflow exists
- legal hold system exists
- retention job exists
- user deletion/export exists
- admin audit logs exist
- critical T&S queues visible
- admin MFA required
- vendor registry exists
- backups encrypted
- no adtech pixels
- no public indexing of sensitive pages
- video uploads disabled unless video scan complete

**Final verification commands:**

```bash
npm run verify:trust-safety
npm run verify:trust-safety:scanners
npm run verify:trust-safety:oss-scanners
npm run verify:trust-safety:media-policy
npm run verify:trust-safety:media-privacy
npm run verify:trust-safety:legal-profile
npm run verify:trust-safety:minor-safety
npm run verify:trust-safety:ncii
npm run verify:trust-safety:dmca
npm run verify:trust-safety:perceptual-hash
npm run verify:trust-safety:admin-ui
npm test
npm run build
npm run verify:prelaunch
npm run verify:alpha:auto:local
```

---

## RECOMMENDED BUILD ORDER

Do not build everything at once. Build in this order:

1. PHASE 0 — Product policy lockdown
2. PHASE 3 — Open-source scanner runtime
3. PHASE 4 — Explicit media privacy hardening
4. PHASE 6 — Minor safety + manual NCMEC workflow
5. PHASE 7 — NCII takedown + re-upload prevention
6. PHASE 5 — Hash governance + perceptual hashing
7. PHASE 2 — Legal request + preservation hold system
8. PHASE 1 — Data minimization + retention
9. PHASE 10 — Trust & Safety UI-2
10. PHASE 11 — Admin access/audit/least privilege
11. PHASE 9 — DMCA workflow
12. PHASE 13 — User export/delete/privacy dashboard
13. PHASE 14 — Re-scan and policy change jobs
14. PHASE 8 — Cheap video scan
15. PHASE 12 — Vendor/infrastructure surface reduction
16. PHASE 15 — Final alpha readiness gates

**Reasoning:** First prevent accidental explicit-media exposure. Then make scanner runtime real and strict. Then build highest-risk safety workflows. Then add legal/privacy systems. Then polish admin operations. Delay video because video multiplies risk and CPU cost.

### Next alpha compliance slice (recommended worker scope)

After foundation + T&S-4B + **T&S-5 moderation alpha pass**, the highest-value work is boring legal/compliance plumbing — **not** more scanner complexity, PhotoDNA, or full UI-2 redesign:

1. Published policy pages (Terms, Privacy, Guidelines, Adult Content, Law Enforcement, DMCA, NCII) — counsel sign-off (`VITE_LEGAL_PUBLISHED`)
2. DMCA workflow polish (repeat-infringer enforcement; intake + admin page exist)
3. Legal-request intake UI (request record, hold creation, scoped export placeholder, audit)
4. Admin MFA (SITE_ADMIN, TRUST_SAFETY_ADMIN, LEGAL_ADMIN)
5. Export/deletion pipeline (v1 JSON export, deactivation, purge, legal hold blocks)
6. Vendor registry enforcement
7. NCII emergency-restrict workflow + hash re-upload block (reasons/queues exist; workflow not built)

**Done (do not re-implement):** canonical report intake on API-backed UGC, scoped mod parity, P0 notify, reporter history.

**Do not implement:** PhotoDNA, NCMEC API, StopNCII/Take It Down, full UI-2 redesign, explicit production expansion, explicit video uploads.

**Worker prompt template:** see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) entry `LEGAL-ALPHA-1` (if queued) or copy from git history of this doc’s 2026-06-05 revision.

---

## NON-NEGOTIABLES

- Do not launch public explicit media in alpha.
- Do not launch explicit video in alpha.
- Do not auto-report to NCMEC from classifier/OCR alone.
- Do not fake StopNCII/Take It Down integrations.
- Do not call internal hash lists CSAM databases.
- Do not allow production scanner noop pass.
- Do not expose explicit media to unauthenticated users.
- Do not put explicit media in OG previews, public search, or sitemaps.
- Do not add third-party vendors without vendor registry entry.
- Do not collect real names, DOBs, IDs, or precise location unless absolutely necessary.
- Do not delete records under active legal hold.
- Do not allow sensitive admin views without role + reason + audit log.

---

## SUCCESS DEFINITION

This phase is successful when Coast to Coast Kink can say:

> “We are an adults-only community, events, education, vendors, groups, and organizer platform. We use open-source scanner signals, human moderation, privacy-first defaults, legal hold controls, DMCA handling, NCII takedown tooling, and manual minor-safety escalation workflows. We do not run an anything-goes porn marketplace, we do not support minors or illegal content, and we do not expose adult media publicly by default.”

Build toward that.
