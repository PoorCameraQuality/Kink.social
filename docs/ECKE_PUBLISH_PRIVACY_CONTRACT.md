# ECKE Publish Privacy Contract

**Status:** Design — extends `ECKE_PUBLIC_PUBLISHING_CONTRACT.md`  
**Rule:** ECKE is public SEO only; kink.social private data must never leak.

---

## Universal rules (fail closed)

1. Only `visibility: PUBLIC` / `public` entities may publish.
2. Envelope must set `publishToEcke: true` and `publicSafe: true`; ECKE re-validates.
3. Restricted field names rejected at ingest (see list below).
4. Private kink.social URL paths blocked in payload HTML/text.
5. Server-generated preview required before publish — operator sees exact outbound payload.
6. Every publish action permission-gated server-side.

---

## Restricted fields (never post)

Implement in `packages/api/src/lib/ecke-redaction.ts`; mirror in ECKE `kinkSocialIngestValidation.ts` L22–40.

```
privateNotes, internalNotes, memberOnlyBody, connectionOnlyBody, draftBody,
hiddenAuthorData, moderationNotes, applicationMaterials, references,
safetyReports, attendeeNames, rsvpList, privateAddress, privateContact,
staffOnlyNotes, organizerOnlyMaterials, applicationAnswers, groupMemberList,
privateGroupDescription, exactLocationWhenHidden, messages, email, phone,
legalName (unless explicitly public), government ID, background check data,
hidden/private profile fields
```

---

## Entity-specific rules

### Events & venues

| `locationVisibility` | ECKE receives |
|--------------------|---------------|
| `public` | `publicLocationSummary` or public address per product rules |
| `rsvp` / `approved` / `private` | `publicLocationSummary` only, or `null` |
| Never | Exact private address, attendee list, RSVP list |

Reference: `resolveStandaloneEventPublicLocation` — `ecke-publish-payload.ts` L327–336.

### Groups

- Private or hidden groups → not eligible; payload `visibility: 'hidden'`; publish rejected.
- Member lists never publish.
- Hidden membership privacy unchanged by ECKE.

Reference: `buildGroupListingPayload` L137 — hidden when `visibility !== 'public'`.

### Education

- Only published public articles.
- Draft / member-only / connection-only → reject.
- Body HTML sanitized.
- Author profile URL must be public-safe (no `/settings`, `/messages`, etc.).

Reference: `ecke-public-publish.ts` L67–172.

**Pass 5 Slice 1 — unified control plane redaction helpers:**

- `getEducationOmittedFields()` — drafts, member-only/connection-only body, private/internal/moderation notes, author private email, private contact, private files, staff comments, reports
- `getEducationDeferredFields()` — related public articles, learning path placement, presenter links, related classes/events, org/group context (public-safe but ECKE may not display yet)
- Preview built server-side via `buildEducationArticlePublishContext`; client payload ignored
- Publish blocked when `publicationStatus !== PUBLISHED`, `visibility !== PUBLIC`, or `eckePublish !== true`

### Vendors

- Only public vendor profiles with `eckePublish` opt-in.
- Owner/co-owner publish only; org moderators may preview featured vendors but cannot publish unless they own/co-own the shop.
- No private owner contact, payment/payout info, or shop integration secrets.
- Store links HTTPS only (`sanitizeVendorEckeWebsiteUrl`).

**Pass 5 Slice 3 — unified control plane redaction helpers:**

- `getVendorOmittedFields()` — owner legal name, private contact/email/phone, internal/moderation notes, inventory/orders, payment/payout, API/OAuth/Etsy/Shopify/Woo secrets, private files, draft products, staff comments, reports
- `getVendorDeferredFields()` — event appearances, sponsor relationships, product highlights, booth locations, review summaries (public-safe but ECKE may not display yet)
- Preview built server-side via `buildVendorProfilePublishContext`; client payload ignored
- Publish blocked when `visibility !== PUBLIC` or `eckePublish !== true`

### Dungeons / venues

- Org-flagged public listings only (`isOrgDungeonListing`).
- Private venues → region/summary only, no exact address.

### Dancecard

- Staff shifts: display names parsed from titles only — no `user_id`.
- Access codes may publish (operational); show clearly in preview drawer.
- Program slots filtered for anonymous public view.

Reference: `ecke-dancecard-staff-sync.ts` L5–17; convention routes filter `filterSlotsForPublicProgram(..., 'anonymous')`.

---

## Preview contract

Every preview response includes:

```ts
{
  posted: { label: string; value: string }[],           // Will publish now
  omitted: { label: string; reason: string }[],        // Not sent for privacy
  deferred?: { label: string; reason: string }[],      // Public-safe but ECKE does not display this yet
  affectedEckePages: string[],
  rawPayload: object  // debug expand only
}
```

### Preview categories (ECKE expansion addendum)

Each field in preview maps to exactly one category:

| Category | Meaning | Example reason text |
| -------- | ------- | ------------------- |
| **Will publish now** | In `posted[]`; included in outbound payload | “Public group description” |
| **Public-safe but ECKE does not display this yet** | In `deferred[]`; document in `ECKE_PUBLISH_PARITY_AUDIT.md` expansion table | “Public schedule blocks — ECKE group page module not built yet” |
| **Not sent for privacy** | In `omitted[]`; never sent regardless of ECKE capability | “Member list — never published” |

Pass 3 may use `posted` + `omitted` only; `deferred` is the target shape for Pass 4+ as richer modules are catalogued.

---

## ECKE ingest validation

Unsupported entity → HTTP 4xx:

```json
{
  "status": "rejected",
  "errorCode": "unsupported_entity_type",
  "errorMessage": "group_listing is not supported yet"
}
```

Reject: `visibility !== PUBLIC`, `publishToEcke !== true`, `publicSafe !== true`, restricted fields in payload.

---

## Migration note

Direct Supabase publishing bypasses ECKE ingest validation today. End-state: all paths through ingest so ECKE owns validation, slug collision, sitemap, IndexNow.

Legacy flag: `ECKE_PUBLISH_USE_LEGACY_SUPABASE=true` until parity verified.
