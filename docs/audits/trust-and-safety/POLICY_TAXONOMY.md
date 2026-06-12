# Policy taxonomy (T&S-1 through T&S-5)

**Moderation source of truth:** `packages/shared/src/moderation-types.ts`  
**Media source of truth:** `packages/shared/src/media-types.ts` (`@c2k/shared`)  
**Community trust source of truth:** `packages/shared/src/community-trust-types.ts`  
**Status:** **Complete for alpha** — moderation + media enums shipped (T&S-1, T&S-2); scan/pipeline enums active (T&S-3–4A); report target types and notifications wired (T&S-5).

Canonical policy reasons replace legacy free-text `reports.category` strings on new cases. Legacy labels are mapped at intake via `mapLegacyReportCategoryToPolicyReason()`.

---

## Policy reasons (`PolicyReason`)

| Code | Label | Default severity | Default queue |
|------|-------|------------------|---------------|
| `MINOR_SAFETY` | User appears under 18 / minor safety | CRITICAL | MINOR_SAFETY_RESTRICTED |
| `CSAM_SUSPECTED` | Suspected CSAM | CRITICAL | MINOR_SAFETY_RESTRICTED |
| `NCII` | Non-consensual intimate imagery (NCII) | CRITICAL | NCII_URGENT |
| `AI_DEEPFAKE_NCII` | AI deepfake intimate imagery | CRITICAL | NCII_URGENT |
| `HIDDEN_CAMERA_LEAKED` | Hidden camera or leaked intimate media | CRITICAL | NCII_URGENT |
| `TRAFFICKING_COERCION` | Trafficking or coercion | CRITICAL | GENERAL_REVIEW |
| `DOXXING_OUTING` | Doxxing / outing / PII exposure | HIGH | GENERAL_REVIEW |
| `HARASSMENT_THREATS` | Harassment or threats of violence | HIGH | GENERAL_REVIEW |
| `COMMERCIAL_SEX_SOLICITATION` | Commercial sex solicitation | HIGH | GENERAL_REVIEW |
| `ILLEGAL_GOODS_SERVICES` | Illegal goods or services | HIGH | GENERAL_REVIEW |
| `IMPERSONATION` | Impersonation | MEDIUM | GENERAL_REVIEW |
| `CONSENT_SAFETY` | Consent or safety dispute | MEDIUM | GENERAL_REVIEW |
| `EXPLICIT_VISIBILITY_VIOLATION` | Adult content without proper labeling or visibility | LOW | MEDIA_REVIEW |
| `SPAM_SCAM` | Spam or scam | LOW | SPAM_ABUSE |
| `OTHER` | Other (note required) | LOW | GENERAL_REVIEW |

Helpers: `severityForPolicyReason()`, `queueForPolicyReason()`, `isKnownPolicyReason()`.

---

## P0 policy reasons

These require platform mod notification within 60 seconds via BullMQ job `p0_report_notify` → `notifyP0ModerationCaseCreated` (shipped T&S-5):

- `CSAM_SUSPECTED`
- `MINOR_SAFETY`
- `NCII`
- `AI_DEEPFAKE_NCII`
- `HIDDEN_CAMERA_LEAKED`
- `TRAFFICKING_COERCION`

Helper: `isP0PolicyReason()`.

---

## Platform-critical policy reasons

Scoped mods must not locally dismiss these without platform involvement. Defined in `community-trust-types.ts` as `PLATFORM_CRITICAL_POLICY_REASONS`:

- All P0 reasons above, plus:
- `CONSENT_SAFETY`
- `DOXXING_OUTING`
- `HARASSMENT_THREATS`
- `COMMERCIAL_SEX_SOLICITATION`
- `ILLEGAL_GOODS_SERVICES`

Helper: `isPlatformCriticalPolicyReason()`.

---

## Severity levels (`PolicySeverity`)

| Code | Use |
|------|-----|
| `LOW` | Spam, labeling disputes |
| `MEDIUM` | Impersonation, consent disputes |
| `HIGH` | Doxxing, harassment, solicitation |
| `CRITICAL` | Minor safety, CSAM, NCII, trafficking |

---

## Moderation queues (`ModerationQueue`)

| Code | Purpose |
|------|---------|
| `GENERAL_REVIEW` | Default human triage |
| `MEDIA_REVIEW` | Adult visibility / media labeling / scanner flags |
| `NCII_URGENT` | Non-consensual intimate imagery |
| `MINOR_SAFETY_RESTRICTED` | Minor safety / CSAM — restricted staff access |
| `SPAM_ABUSE` | Spam and scam |
| `APPEALS` | Post-decision appeals — **platform** workflow T&S-7; scoped appeals alpha separate |

---

## Case lifecycle (`ModerationCaseStatus`)

| Code | Meaning |
|------|---------|
| `OPEN` | New intake |
| `TRIAGED` | Assigned / prioritized |
| `ACTIONED` | Enforcement applied |
| `ESCALATED` | Raised to site admin or external path |
| `CLOSED_NO_VIOLATION` | No policy violation |
| `CLOSED_DUPLICATE` | Merged or duplicate intake |

Distinct from legacy `reports.status` (`OPEN`, `TRIAGED`, `RESOLVED`, `DISMISSED`).

---

## Report target types (`ModerationReportTargetType`)

Canonical types validated at intake (`moderation-ts-target-validate.ts`):

`profile`, `profile_photo`, `post`, `comment`, `message`, `group`, `group_thread`, `group_reply`, `organization`, `org_chat_message`, `org_forum_thread`, `org_forum_reply`, `event`, `convention`, `vendor`, `presenter`, `media_asset`, `education_article`, `media_show`, `media_episode`, `convention_chat_message`, `conversation`, `platform`

Legacy web aliases (e.g. forum thread variants) normalize to these at intake.

---

## Legacy report categories (pre–T&S-1 UI)

| Legacy `category` | Maps to | Re-triage? |
|-------------------|---------|------------|
| `harassment` | `HARASSMENT_THREATS` | No |
| `spam` | `SPAM_SCAM` | No |
| `impersonation` | `IMPERSONATION` | No |
| `content` | `EXPLICIT_VISIBILITY_VIOLATION` | No |
| `other` | `OTHER` | No |
| `safety` | `CONSENT_SAFETY` | **Yes** — may mean minor, consent, or threats |
| `illegal` | `OTHER` | **Yes** — split into specific P0 reasons in UI |

Do not persist legacy strings on new `moderation_cases` rows.

---

## Platform moderation action types (reference)

`HIDE_CONTENT`, `LOCK_THREAD`, `SCOPE_BAN`, `RESOLVE_REPORT`, `IDENTITY_BAN`, `SUSPEND_USER`, `FREEZE_ORG`, `ESCALATE_ONLY` — unchanged from ADR-004; case detail links proposals to these verbs.

**Case detail actions (platform API):** `mark_no_violation`, `close_duplicate`, `escalate`, `hide_content`, `keep_quarantined`, `remove_media`, `restore_media`.

---

## Moderation notification types

Registered in `packages/shared/src/notification-types.ts`:

| Constant | String | When emitted |
|----------|--------|--------------|
| `p0ModerationCaseCreated` | `p0_moderation_case_created` | P0 case intake |
| `moderationActionPending` | `moderation_action_pending` | Rule-of-two proposal |
| `moderationReportEscalated` | `moderation_report_escalated` | Scoped escalate to platform |
| `orgModerationNeeded` | `org_moderation_needed` | Org scoped inbox |
| `reportReviewed` | `report_reviewed` | Case closed or scoped report resolved |

---

## Zod schemas (API validation)

- `policyReasonSchema`
- `policySeveritySchema`
- `moderationQueueSchema`
- `moderationCaseStatusSchema`

Register new notification types in `@c2k/shared` before routes that emit them.

---

## Media taxonomy (T&S-2+)

Defined in `packages/shared/src/media-types.ts`. Used by `media_assets` schema, attestation API, visibility helpers, publish-lane routing, and upload pipeline (T&S-3–4A). Full lifecycle: [`MEDIA_LIFECYCLE.md`](./MEDIA_LIFECYCLE.md).

### Upload status (`media_upload_status`)

| Code | Meaning |
|------|---------|
| `PENDING_UPLOAD` | File stored; metadata incomplete |
| `PENDING_ATTESTATION` | Awaiting uploader attestation |
| `PENDING_SCAN` | Published path blocked pending scan completion |
| `AUTO_APPROVED` | GREEN lane — live for allowed viewers |
| `APPROVED_BLURRED` | Published with default blur contexts |
| `QUARANTINED` | YELLOW lane — human review (e.g. multi-person explicit) |
| `REJECTED` | RED lane or mod rejection — not visible |
| `REMOVED` | Post-publish takedown |
| `ESCALATED` | Legal/external escalation |
| `PRESERVED` | Legal hold — staff access only |

Helpers: `isMediaPublished(status)`.

### Content rating (`media_content_rating`)

| Code | Label | Publish lane |
|------|-------|--------------|
| `SAFE_PUBLIC` | Safe for public preview | GREEN |
| `ADULT_NON_EXPLICIT` | Adult but not explicit | GREEN |
| `EXPLICIT_ADULT` | Explicit adult (requires attestation) | GREEN if solo + attestations; **never `PUBLIC_PREVIEW`** |
| `EDGE_REVIEW` | Ambiguous — human required | YELLOW — no auto-publish |
| `BLOCKED_ILLEGAL` | Illegal content | RED — never publish |

Helpers: `isExplicitRating(rating)`, `isPublishBlocked(rating)`.

### Visibility (`media_visibility`)

| Code | Explicit adult allowed (alpha)? |
|------|----------------------------------|
| `PUBLIC_PREVIEW` | **No** for `EXPLICIT_ADULT` |
| `LOGGED_IN` | Yes (primary alpha explicit surface) |
| `FOLLOWERS` | Yes |
| `PRIVATE_PROFILE` | Yes |
| `GROUP_ONLY` | Yes |
| `ORG_ONLY` | Yes |
| `EVENT_ATTENDEES` | Yes |
| `CONVENTION_ATTENDEES` | Yes |
| `STAFF_ONLY` | Staff paths only |

Helper: `explicitCannotBePublicPreview(visibility, rating)`, `validateVisibilityRatingCombo()`.

### Depicted people (`depicted_people`)

| Code | Explicit lane (alpha) |
|------|------------------------|
| `ONLY_ME` | GREEN (solo explicit) |
| `ME_AND_OTHER_ADULTS` | **YELLOW** — review required |
| `OTHER_ADULTS` | **YELLOW** — review required |
| `NO_IDENTIFIABLE_PERSON` | GREEN for non-person imagery |
| `UNKNOWN` | YELLOW — uncertain |

### Scan status (`scan_status`) — pipeline active (T&S-3–4A)

| Code | Notes |
|------|-------|
| `NOT_REQUIRED` | GREEN path when scan skipped |
| `PENDING` | Scan queued or in progress |
| `PASSED` | No blocking action |
| `FLAGGED` | Route to `MEDIA_REVIEW` or restricted queue |
| `FAILED` | Retry; do not auto-publish explicit |
| `ERROR` | Ops alert; strict mode may block promotion |

Scanner adapters (malware, exact hash, adult classifier stub, OCR risk stub) write `media_scanner_results`. Production ML/OCR installs and PhotoDNA remain deferred.

### Adult content preference (`adultContentPreference`)

User setting in `privacy_settings` — controls blur/show/hide for signed-in viewers.

| Code | Viewer behavior (explicit media) |
|------|----------------------------------|
| `SHOW` | Render unblurred on allowed surfaces |
| `BLUR` | Blurred overlay (alpha default) |
| `HIDE` | Omit from feeds/lists |

Logged-out users never see explicit media regardless of pref.

### Publish lane (`resolvePublishLane`)

| Lane | Outcome |
|------|---------|
| `GREEN` | Auto-publish (`AUTO_APPROVED`) |
| `YELLOW` | Queue (`QUARANTINED` / `PENDING_SCAN`) → `MEDIA_REVIEW` |
| `RED` | Block (`REJECTED`) + urgent/restricted queues as applicable |

### Attestation (`MEDIA_ATTESTATION_VERSION = 1`)

Required boolean fields before explicit publish — see [`MEDIA_LIFECYCLE.md`](./MEDIA_LIFECYCLE.md) § Attestation. Helper: `allRequiredAttestationsPresent()` (API).

### Media ↔ moderation policy mapping

| Media signal | Typical `PolicyReason` | Queue |
|--------------|------------------------|-------|
| Wrong visibility / unlabeled explicit | `EXPLICIT_VISIBILITY_VIOLATION` | `MEDIA_REVIEW` |
| Suspected minor / CSAM | `MINOR_SAFETY`, `CSAM_SUSPECTED` | `MINOR_SAFETY_RESTRICTED` |
| NCII / leaked / hidden cam | `NCII`, `HIDDEN_CAMERA_LEAKED`, `AI_DEEPFAKE_NCII` | `NCII_URGENT` |
| Consent dispute on depicted person | `CONSENT_SAFETY` | `GENERAL_REVIEW` |

### Zod schemas (media)

- `mediaUploadStatusSchema`
- `mediaContentRatingSchema`
- `mediaVisibilitySchema`
- `depictedPeopleSchema`
- `scanStatusSchema`
- `adultContentPreferenceSchema`
