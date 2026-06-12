# Minor-safety escalation playbook

**Audience:** Platform moderators and site admins  
**Principle:** Humans decide — scanners and reports are triage signals only.

## When to use

Escalate when any of the following appear on a `media_asset` case or report:

- OCR labels: `ocr_critical`, `ocr_minor_coded`
- Adult classifier + attestation mismatch suggesting minors
- Member report reason: minor safety / CSAM suspected
- Scanner queue: `MINOR_SAFETY_RESTRICTED`

## Immediate steps

1. **Do not reveal** restricted-queue media to non–site-admin staff.
2. Open the case in `/moderation/cases/:caseId` — check `scannerSummary` and attestation flags.
3. Set case metadata `minorSafetyReviewStatus` to `pending` via timeline events (`media.scanner_case_opened` / `media.scanner_flag_appended` payloads include `caseMetadata.minorSafetyReviewStatus`).
4. **Preserve** content — do not delete or auto-resolve.
5. If credible CSAM indicators: follow [ncmec-manual-reporting-playbook.md](./ncmec-manual-reporting-playbook.md).

## Severity mapping (scanner → case)

| Scanner signal | Default queue | Case severity |
|----------------|---------------|---------------|
| `ocr_critical` | `MINOR_SAFETY_RESTRICTED` | CRITICAL |
| `ocr_minor_coded` | `MEDIA_REVIEW` | HIGH |
| Hash DENY (internal list) | per `policy_reason` | per policy |

## Deferred automation

- NCMEC CyberTipline API integration (T&S-4+)
- PhotoDNA / vendor hash feeds
