# NCMEC manual reporting playbook (C2K)

**Status:** Manual process only — no automated CyberTipline submission in v1.

## When reporting is required

Report to the [NCMEC CyberTipline](https://report.cybertip.org/) when staff determines that uploaded or reported material **depicts apparent child sexual abuse material (CSAM)** or meets your jurisdiction's mandatory reporting threshold.

Scanner flags (`ocr_critical`, `csamSuspected` policy reason) are **not** sufficient alone — a trained human must review.

## Before you report

1. Confirm case is in `MINOR_SAFETY_RESTRICTED` or equivalent urgent queue.
2. Document in moderation case notes: what was seen, why CSAM is suspected, uploader id, timestamps.
3. Ensure content is **preserved** (`preservation_status` / legal hold if available).
4. Do **not** share suspected CSAM outside the reporting channel.

## Report package (internal checklist)

- C2K case id and media asset id
- Uploader `user_id` and account creation date
- Upload timestamps (`created_at`, `attested_at`)
- SHA-256 from `media_assets.sha256_hash` (if present)
- Scanner summary (no raw private JSON in external email)
- IP/session evidence if available from security logs (retention-limited)

## After submission

1. Record CyberTipline report id in case internal notes (not public).
2. Set `minorSafetyReviewStatus` to `escalated` in case event metadata.
3. Suspend or restrict uploader per policy (T&S-6 when automated suspend ships).
4. Coordinate with legal counsel if law enforcement follow-up is likely.

## What we do not do

- Store or maintain a "CSAM hash database" locally — internal hash list is **deny/review for previously removed NCII/abuse content on C2K**, not a substitute for NCMEC or PhotoDNA.
- Auto-submit to NCMEC without human review.
