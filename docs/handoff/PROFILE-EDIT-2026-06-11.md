# Profile edit — session handoff (2026-06-11)

**Reporter:** Brax (screenshots + “nothing saving / ZIP / photos / public profile”)  
**Session focus:** End-to-end investigation and fixes for `/profile/edit`  
**Verdict:** **Fixes implemented locally — not committed.** Brax should smoke-test before merge.

---

## Executive summary

Profile editing appeared broken because the **edit UI was still on a legacy upload contract** while the API had moved to **quarantine + attestation**. ZIP lookup often showed **no feedback** on exact matches, and location from ZIP was **not always persisted** when the location dropdown API was still loading. Save-button state also **missed place/state changes** after ZIP lookup.

Tonight’s work wires edit/finish-panel uploads to the same pipeline as the profile gallery, improves ZIP/location UX, adds the attestation modal to edit, and syncs `profiles.avatar_url` when the primary gallery photo is set.

---

## Symptoms reported

| Symptom | Root cause |
|--------|------------|
| Nothing saves | Photo upload failed early (`purpose` missing → 400); user may have seen generic errors or partial failure |
| Photos don’t upload | `POST /api/upload` requires `purpose: 'profile_photo'`; response is `quarantineKey`, not `url` |
| ZIP → no location to select | `formatZipLookupHint()` returned `null` for **exact** matches; preview relied on places list not yet loaded |
| Public profile empty/wrong | Photos hidden until **attestation**; `avatar_url` never updated for search/cards; location not saved if structured fields omitted |

---

## What shipped (uncommitted)

### Web

| File | Change |
|------|--------|
| `packages/web/src/lib/profile-photo-upload.ts` | **New** — shared `uploadProfilePhotoFile()` with `purpose` + `quarantineKey` |
| `packages/web/src/hooks/useProfilePhotos.ts` | Uses shared upload lib |
| `packages/web/src/contexts/ProfileEditContext.tsx` | Fixed save/upload, ZIP hint, location save, change detection, attestation hooks |
| `packages/web/src/components/profile/edit/ProfileBasicsPanel.tsx` | ZIP blur auto-lookup; manual city picker when `stateId` set |
| `packages/web/src/app/profile/edit/ProfileEditLayout.tsx` | `MediaAttestationModal` after photo save |
| `packages/web/src/components/profile/ProfileFinishPanel.tsx` | Same upload fix as edit context |
| `packages/web/src/lib/profile-edit-location.ts` | `formatZipLookupHint()` returns `display` for exact matches |

### API

| File | Change |
|------|--------|
| `packages/api/src/routes/profile-photos.ts` | `syncProfileAvatarUrl()` on primary photo (`sortOrder === 0`) |
| `packages/api/src/lib/media-pipeline.ts` | Update `profiles.avatar_url` when quarantined photo promotes to public URL |

---

## Architecture reminder (profile edit)

```
/profile/edit/*  →  ProfileEditContext  →  PATCH /api/profile/me
                    ↓ photo on save
                    POST /api/upload (purpose=profile_photo) → quarantineKey
                    POST /api/profile/me/photos { quarantineKey, ... }
                    ↓ if PENDING_ATTESTATION
                    MediaAttestationModal → PATCH /api/v1/media/assets/:id/attestation
                    ↓ after attestation + scan lane
                    Public: GET /api/profile/:username → loadPublicProfilePhotos()
```

**Canonical read paths**

- Owner draft: `GET /api/profile/me`
- Public view: `GET /api/profile/:username` (not `/api/v1/profiles/:username`)

**Location**

- ZIP: `GET /api/locations/by-zip?zip=`
- Save: `PATCH /api/profile/me` with `homeZip`, `placeId`, `stateId`, `customLocation` (server derives `location` string)

**Photos**

- Gallery on profile dashboard uses `useProfilePhotos` (already correct before tonight).
- Edit basics tab now matches that pipeline.
- **Public** photos require attestation + published media status (`isPhotoPubliclyVisible` in `profile-photos.ts`).

---

## Manual smoke checklist (Brax)

Prereqs: `docker compose -f docker-compose.dev.yml up -d`, `USE_DATABASE=true`, signed-in live user (not fallback/mock).

### 1. Profile basics save

- [ ] `/profile/edit` — change display name + short bio → **Save changes** → reload → values persist
- [ ] Footer shows “Unsaved changes” while dirty; “Save changes” disabled when clean

### 2. ZIP / location

- [ ] Enter `17240` → tab out of field (auto-lookup) or click **Look up**
- [ ] City/state hint appears (e.g. Shippensburg, PA area)
- [ ] Preview card location updates before save
- [ ] **Save changes** → **View public profile** → location visible (if field visibility is public)
- [ ] Optional: **City not right? Pick manually** → choose alternate place → save

### 3. Photo

- [ ] Pick image on basics tab → **Save changes**
- [ ] Attestation modal opens — complete all checkboxes → submit
- [ ] Preview shows photo URL (may be `/api/v1/media/assets/.../content`)
- [ ] Public profile hero + Media tab show photo after attestation

### 4. Failure modes to watch

- [ ] Upload without S3: needs `MEDIA_PIPELINE_ALLOW_NO_S3=1` or MinIO configured — error should be explicit, not silent “Saved”
- [ ] `C2K_ALPHA_DISABLE_PROFILE_PHOTO_UPLOADS=true` → upload blocked by design

---

## Verification run tonight

| Check | Result |
|-------|--------|
| `npm run typecheck` (web) | **Green** |
| `npm run typecheck` (api) | **Red** — pre-existing `profile-field-redaction.test.ts` type errors (unrelated to tonight) |
| Committed | **No** — awaiting Brax review |

---

## Known gaps / follow-ups (not fixed tonight)

1. **Short bio vs Extended about** — both bind to `ctx.bio`; no separate `extendedAbout` field. Editing one overwrites the other.
2. **Onboarding upload path** — `MemberOnboardingWizard` still uses `POST /api/v1/media/assets/upload`, not the shared edit helper. Works but is a second path to audit.
3. **Replace vs add avatar** — edit always `sortOrder: 0`; adds/reorders rather than explicit “replace avatar” semantics.
4. **Partial save** — photo POST runs before profile PATCH; profile PATCH failure can leave photo row without profile field updates.
5. **locationsMode `off`** — if `/api/locations/countries` fails, state names in manual dropdown may be empty; ZIP + `placeId` save still works if lookup succeeded.
6. **API test debt** — fix `profile-field-redaction.test.ts` readonly/missing-property types before relying on api typecheck in CI.

---

## Suggested next slice

1. Brax manual smoke (checklist above) on local stack.
2. If green: commit with message like  
   `fix(web): align profile edit upload and ZIP location with API pipeline`
3. Optional fast follow: unify onboarding photo upload with `profile-photo-upload.ts`; split short bio vs extended about if product wants both.

---

## Key code entry points

- Edit state: `packages/web/src/contexts/ProfileEditContext.tsx`
- Edit layout + attestation: `packages/web/src/app/profile/edit/ProfileEditLayout.tsx`
- Upload helper: `packages/web/src/lib/profile-photo-upload.ts`
- ZIP hint: `packages/web/src/lib/profile-edit-location.ts`
- Profile PATCH: `packages/api/src/routes/profile.ts`
- Photos + avatar sync: `packages/api/src/routes/profile-photos.ts`
- Public profile page: `packages/web/src/app/profile/[username]/page.tsx`

---

## Git status note

All changes are **local working tree only**. Run `git status` and `git diff` before commit. Do not commit `.env` or secrets.
