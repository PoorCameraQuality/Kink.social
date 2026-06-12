# Vendor / subprocessor registry (scaffold)

Track third parties that process member data. Fill rows before production launch; link DPAs and data-flow notes.

| Vendor | Category | Data touched | Region | DPA status | Notes |
|--------|----------|--------------|--------|------------|-------|
| _(hosting provider)_ | Infrastructure | All persisted data, logs | TBD | TBD | Postgres, Redis, object storage |
| _(email)_ | Transactional mail | Email addresses, message bodies | TBD | TBD | When `C2K_MAIL_TRANSPORT` ≠ disabled |
| _(optional ClamAV)_ | Malware scan | Uploaded file bytes (local) | On-prem | N/A | `docker-compose.dev.yml` profile |
| Resend / SMTP relay | Email delivery | Email, templates | Per vendor | TBD | If configured |
| LiveKit | Real-time AV | Session metadata | Per vendor | TBD | When `LIVEKIT_*` set |
| AWS S3 / MinIO | Media storage | Images, metadata keys | TBD | TBD | Upload pipeline |
| ECKE (outbound) | Directory sync | Public convention/org fields | Per contract | TBD | Publish-only |

## Process

1. Add a row before integrating a new SDK or SaaS that receives PII.
2. Record retention and deletion obligations in [data-inventory.md](./data-inventory.md).
3. Block production use until DPA or equivalent is filed (Epic 10+).
