# T&S-4A — Open-source scanner adapters

**Status:** Implemented in the upload pipeline (T&S-3 orchestration extended).

## Purpose

Open-source scanners are **triage signals**, not legal truth. They do not replace future PhotoDNA, NCMEC, or NCII provider integrations (deferred). **Nudity is allowed** on C2K/ECKE; explicit adult classification is not a violation when attestation and lanes are correct.

Scanner **ERROR** and **BLOCKED** outcomes fail closed — content does not auto-publish.

## Adapters

| Scanner | Name constant | Default local behavior |
|---------|---------------|------------------------|
| Malware (ClamAV) | `malware_clamav` | **Local:** noop pass with `NOOP_PASSED` label + warning; **staging/production:** ERROR if clamd down |
| Exact hash list | `exact_hash` | Internal C2K deny/review SHA-256 list (not a CSAM database) |
| Adult classifier | `adult_classifier` | Deterministic stub; validates rating vs inferred explicit |
| OCR risk | `ocr_risk` | Filename/metadata term shell (Tesseract deferred) |

## Storage

- **`media_scanner_results`** — per-scanner rows (status, labels, policy routing, private raw JSON).
- **`media_hash_list_entries`** — internal deny/review hash registry. **Not a CSAM database** — operator-added SHA-256 deny/review rows with `reason_code`, `source`, and optional `expires_at`; admin `POST /api/v1/moderation/media-hash-list` requires `reasonCode`.

Aggregate asset `scan_status` on `media_assets` is the rollup (worst outcome wins).

## Production strictness (T&S-4B)

| Runtime | `MEDIA_SCANNER_STRICT_MODE` (default) | `MEDIA_SCANNER_ALLOW_NOOP` (default) | clamd down |
|---------|----------------------------------------|--------------------------------------|------------|
| local/dev | false unless `NODE_ENV=production` | true | noop pass + `NOOP_PASSED` in summary |
| staging | true | false | **ERROR** (fail closed) |
| production | true | false | **ERROR** (fail closed) |
| test | simulate envs OK | per env | simulate only |

**Boot guard:** `NODE_ENV=production` + `MEDIA_SCANNER_ALLOW_NOOP=true` without `MEDIA_SCANNER_ALLOW_NOOP_PRODUCTION_ACK=true` → fatal startup error.

Admin scanner summaries show `NOOP_PASSED` (not plain `PASSED`) when dev noop was used.

## Environment variables

| Variable | Effect |
|----------|--------|
| `MEDIA_SCANNER_STRICT_MODE` | Default true in staging/production |
| `MEDIA_SCANNER_ALLOW_NOOP` | Default false in staging/production; true in local |
| `MEDIA_SCANNER_ALLOW_NOOP_PRODUCTION_ACK` | Required `true` to allow noop in production |
| `MEDIA_SCANNER_REQUIRE_MALWARE` | Optional — default follows strict mode |
| `MEDIA_SCANNER_REQUIRE_HASH` | Optional — default false |
| `MEDIA_SCANNER_REQUIRE_ADULT_CLASSIFIER` | Optional — default false |
| `MEDIA_SCANNER_REQUIRE_OCR` | Optional — default false |
| `MEDIA_SCANNER_MALWARE` | `auto`, `noop`, or `clamav` (legacy; strict runtime maps to `clamav`) |
| `CLAMD_HOST` / `CLAMD_PORT` | ClamAV daemon (optional `docker compose --profile scanners up -d clamav`) |
| `MEDIA_SCAN_SIMULATE` | Legacy aggregate override: `FLAGGED`, `ERROR`, `FAILED` |
| `MEDIA_SCAN_SIMULATE_MALWARE` | `BLOCKED`, `ERROR` |
| `MEDIA_SCAN_SIMULATE_HASH` | `DENY`, `REVIEW` |
| `MEDIA_SCAN_SIMULATE_CLASSIFIER` | `MISMATCH`, `EXPLICIT`, `SAFE` |
| `MEDIA_SCAN_SIMULATE_OCR` | `NCII`, `MINOR`, `SPAM`, `CRITICAL` |

## Lane influence

- **PASSED** scanners + GREEN lane + attestation → promote (normal adult flow).
- **FLAGGED** → quarantine + moderation case/queue when appropriate.
- **BLOCKED** → failed scan status, no publish.
- **ERROR** → `PENDING_SCAN`, quarantined, no publish.

## Admin visibility

Moderation case snapshots include `mediaMetadata.scannerSummary` and optional `pipeline.scannerSummary` (malware, hash, classifier, OCR status lines — no raw storage URLs).

## Verification

```bash
npm run verify:trust-safety:scanners
USE_DATABASE=true npm run verify:trust-safety:scanners
npm run verify:trust-safety   # includes scanner unit + DB via media-* discovery
```

## Deferred (not T&S-4A)

- PhotoDNA / approval-gated vendors
- CSAM external reporting automation
- NCII public takedown workflows
- Video scanning
- Private-message attachments
- Full Tesseract / NudeNet production installs (adapter shells + simulate documented above)
