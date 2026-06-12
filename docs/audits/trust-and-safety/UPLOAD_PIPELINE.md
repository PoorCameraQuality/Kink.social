# T&S-3 upload safety pipeline

**Wave:** T&S-3 — quarantine storage, validation, hashing, EXIF strip, scan adapter, promotion  
**Prerequisite:** T&S-1 (moderation spine), T&S-2 (metadata + attestation + lanes)  
**Status:** Implemented — see verification in [`T&S-IMPLEMENTATION.md`](./T&S-IMPLEMENTATION.md)

---

## Architectural rule

User uploads **must not** go directly to a permanent public URL.

```text
upload → validate (magic bytes) → sanitize (EXIF strip) → quarantine S3 key
       → sha256 → media_assets row → attestation (T&S-2 lanes)
       → noop/vendor scan → promote to public prefix only when GREEN + PASSED
```

---

## Storage layout

| Prefix | Visibility | When |
|--------|------------|------|
| `quarantine/{userId}/{uuid}.ext` | Private (no public URL) | After ingest, until promotion |
| `media/{userId}/{assetId}.ext` | Public-read (dev MinIO policy) | After `APPROVED_PUBLIC` promotion |

**`media_assets` fields:** `storage_state`, `quarantine_storage_key`, `public_storage_key`, `sha256_hash`, `image_width`, `image_height`, `promoted_at`, `promoted_by_user_id`.

---

## Validation (alpha allowlist)

- `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Magic-byte detection via `file-type` (declared MIME must match)
- Max 10 MB, reject empty/malformed
- **No video** in T&S-3

Implementation: `packages/api/src/lib/media-upload-validate.ts`

---

## Sanitization

- Re-encode via `sharp` with auto-orient
- EXIF/GPS stripped before quarantine write
- Tests: `media-sanitize.test.ts`

---

## Scan adapter (no vendors yet)

`packages/api/src/lib/media-scanner.ts` — `NoopMediaScanner` implements `MediaScannerAdapter`.

| Env | Behavior |
|-----|----------|
| (default) | `PASSED` |
| `MEDIA_SCAN_SIMULATE=FLAGGED` | Quarantine after attestation |
| `MEDIA_SCAN_SIMULATE=ERROR` | `PENDING_SCAN`, no promotion |

Future adapter kinds: hash, image_moderation, OCR, malware, perceptual_hash.

---

## API routes

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/upload` | Quarantine ingest only; returns `{ quarantineKey, sha256 }` — **`url: null`** |
| `POST` | `/api/profile/me/photos` | Accepts `quarantineKey` + hash metadata |
| `POST/PATCH` | `/api/v1/media/assets` | Unchanged attestation contract; pipeline runs on attestation |
| `GET` | `/api/v1/media/assets/:id/content` | Owner/authorized proxy stream from quarantine or public key |

---

## Publish integration (T&S-2 lanes)

| Lane | Pipeline outcome |
|------|------------------|
| **GREEN** + scan **PASSED** | Promote → `APPROVED_PUBLIC`, profile `url` updated |
| **YELLOW** | Stay quarantined; moderation case + snapshot with pipeline metadata |
| **RED** | `REJECTED_PRIVATE`, no promotion |
| Scan **FLAGGED** | Force `QUARANTINED` even if lane was GREEN |
| Scan **ERROR** | `PENDING_SCAN`, no accidental publish |

---

## Local dev

- MinIO via `docker compose -f docker-compose.dev.yml`
- `MEDIA_PIPELINE_ALLOW_NO_S3=1` — DB tests without S3 (promotion updates keys only)
- Migration: incremental SQL in `apply-incremental-migration.ts` (T&S-3 block)

---

## Verification

```bash
npm run verify:trust-safety          # includes media + pipeline tests
npm run verify:trust-safety:media    # media slice
```

Test files: `media-upload-validate.test.ts`, `media-sanitize.test.ts`, `media-pipeline.test.ts`, `media-scanner.test.ts`, `test/media-pipeline.test.ts`, `test/media-scanner-pipeline.test.ts`

---

## T&S-4A scanner orchestration (extends T&S-3 scan step)

After attestation, the pipeline runs four open-source adapter shells in sequence:

```text
malware_clamav → exact_hash → adult_classifier → ocr_risk
  → persist media_scanner_results rows
  → aggregate worst status → media_assets.scan_status
  → GREEN + PASSED → promote; FLAGGED/BLOCKED/ERROR → quarantine (fail closed)
```

Details: [`SCANNER_ADAPTERS.md`](./SCANNER_ADAPTERS.md). Verify: `npm run verify:trust-safety:scanners`.

---

## Intentionally deferred (T&S-4B+)

- PhotoDNA / approval-gated hash providers
- AWS Rekognition, Hive, etc.
- CSAM external reporting automation
- NCII public takedown
- Video scanning
- DM attachments
- Perceptual hashing enforcement
- BullMQ async scan worker (sync orchestrator in T&S-4A)
- Full gallery / all upload surfaces
- Production Tesseract / NudeNet installs (stubs + simulate env documented)
