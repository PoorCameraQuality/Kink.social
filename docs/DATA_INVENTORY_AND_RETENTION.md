# Data inventory and retention (kink.social)

**Philosophy:** User controls deletion when it affects their experience. Platform controls retention when it affects safety, abuse prevention, legal compliance, and system integrity. Nothing private lives forever by default. Legal holds pause deletion.

Companion: [privacy/retention-policy.md](./privacy/retention-policy.md), [LEGAL_REQUEST_AND_DATA_MINIMIZATION.md](./LEGAL_REQUEST_AND_DATA_MINIMIZATION.md).

## User-facing disclosure

> We do not keep private data forever by default. Some information is deleted automatically when it is no longer needed. You can delete many types of content yourself, including messages, profile information, and uploaded media. Some records may be retained for limited periods for safety, abuse prevention, platform security, legal compliance, backups, or active reports. Legal holds pause deletion where required.

## Retention matrix (alpha defaults)

| Data type | Purpose | Owner | User-visible | User can delete? | Auto cleanup? | Default retention | Deleted account | Abandoned account | Report / legal hold | Backup retention | Encrypted | OWNER_ADMIN access |
|-----------|---------|-------|--------------|------------------|---------------|-------------------|-----------------|-------------------|---------------------|------------------|-----------|-------------------|
| **users** (account row) | Identity, auth | Platform | Partial | Account delete request | Yes (purge) | Account lifetime | Soft-delete immediately; anonymize after **30 days** | Dormant **548d** → notice → soft-delete after **60d** grace | Blocks purge | Until backup window (**14–30d**) | Partial (email encrypted) | Investigation console only |
| **users.email_ciphertext** | Login, recovery | Member | No | Via account delete | Yes | Account lifetime | Null after purge window | Same | Blocks purge | Backup window | **AES-256-GCM** | Reveal API (logged) |
| **users.email_lookup_hash** | Uniqueness lookup | Platform | No | Via account delete | Yes | Account lifetime | Null after purge | Same | Blocks purge | Backup window | HMAC only | Reveal API (logged) |
| **users.password_hash** | Authentication | Member | No | Password reset | No | Account lifetime | Overwritten on purge | Same | N/A | Backup window | bcrypt | Never |
| **password_reset_tokens** | Recovery flow | Member | No | N/A (expires) | **Yes** | **24h** after expiry/use | Deleted on purge | Same | N/A | Backup window | SHA-256 hash | Never |
| **sessions** | Auth cookies | Member | No | Logout / account delete | **Yes** | **90d** stale | Deleted immediately on delete request | Same | N/A | Backup window | token hash | Never |
| **posts** | Public/social content | Member | Yes | Yes (author) | Partial | Until user deletes | Hidden with account | Unchanged until purge | Case snapshot preserved | Backup window | Disk encryption | Moderation UI |
| **comments** | Thread replies | Member | Yes | Yes (author) | Partial | Until user deletes | Hidden with account | Same | Case snapshot | Backup window | Disk encryption | Moderation UI |
| **messages** (DMs) | Private chat | Members | Yes | Per-message shred + conversation delete | **Yes** | **365d** default; user **180/365/730** or keep | Erased on purge (non-case) | Same | **content_snapshots** + hold | Backup window | Disk encryption | Owner investigation (logged) |
| **DM attachments** | Media in threads | Member | Yes | With message/conversation | **Yes** | Same as DMs | Purged with media job | Same | Case + hold | Backup window | S3 SSE | Metadata in investigation |
| **conversation_participants.deleted_at** | User-side delete | Member | Yes | Yes | **Yes** | Purge thread **30d** after all parties delete | N/A | Same | Hold blocks | Backup window | No | Investigation list |
| **reports** | Safety intake | Reporter | Partial | No | No | **3 years** | Minimized with case | Same | Always preserved | Backup window | No | Moderation staff |
| **moderation_cases** | T&S workflow | Platform | No | No | Archive later | **3 years** | Minimized reference | Same | Extended | Backup window | No | Moderation staff |
| **content_snapshots** | Case evidence | Platform | No | No | With case policy | **3 years** | Preserved | Same | Always | Backup window | No | Moderation staff |
| **admin audit logs** | Privileged actions | Platform | No | No | Archive | **5 years** | Preserved (minimized) | Same | Extended | Backup window | No | OWNER_ADMIN |
| **profiles** (fields) | Public identity | Member | Yes | Yes | With account | Account lifetime | Anonymized on purge | Same | N/A | Backup window | No | Public / investigation |
| **profile_photos** | Avatar/gallery | Member | Yes | Yes | With account | Account lifetime | Removed on purge | Same | Case/hold | Backup window | S3 | Moderation if reported |
| **media_assets** (uploads) | User/org media | Member | Yes | Yes (owner API) | **Yes** | Until deleted | **30d** after REMOVED | Same | Hold + case | Backup window | S3 SSE | Moderation / investigation metadata |
| **quarantine files** | Pre-scan staging | Platform | No | N/A | **Yes** | **7 days** stale | Purged | Same | Hold skips | Backup window | S3 | Never (ops) |
| **rejected media** | Failed scan | Platform | No | N/A | **Yes** | **30 days** | Purged | Same | Hold skips | Backup window | S3 | Never |
| **IP logs / registration_ip_prefix** | Abuse signal | Platform | No | No | **Yes** | **30 days** raw prefix | Nulled on purge | Same | Per-user hold | Hosting logs | No | Owner reveal (logged) |
| **notifications** | In-app alerts | Member | Yes | Mark read / time | **Yes** | **90 days** | Deleted on purge | Same | N/A | Backup window | No | Not by default |
| **email delivery logs** | SMTP audit | Platform | No | No | Planned | **90 days** (host/Mailpit) | N/A | Same | N/A | N/A | No | Ops only |
| **invites** | Registration gate | Organizer | Partial | Revoke (organizer) | Partial | Event/org policy | N/A | Same | N/A | Backup window | No | Organizer |
| **search / activity logs** | Product analytics | Platform | No | No | **Yes** | **30 days** security | N/A | Same | N/A | Hosting | No | Never |
| **backups** | Disaster recovery | Platform | No | No | **Yes** | **14–30 days** alpha | Encrypted at rest; lag behind user delete | Same | May preserve specific snapshot | Self | **Encrypted before upload** | Break-glass only |

## Cleanup jobs (worker `retention-sweep`)

| Job module | Schedule | What it does |
|------------|----------|--------------|
| `retention-jobs.ts` | Daily | Password reset tokens, stale IP prefixes, quarantine/rejected/deleted media, notifications, stale sessions |
| `user-auto-delete-sweep.ts` | Daily | Member auto-shred preferences (sent DMs, hub chat, feed activity) |
| `dm-retention-sweep.ts` | Daily | Platform DM age retention + user-deleted conversation purge |
| `deleted-account-sweep.ts` | Daily | Anonymize accounts past `deleted_at` + purge window |
| `abandoned-account-sweep.ts` | Weekly | Dormant notice + queue soft-delete after grace |

## User privacy controls (`/settings/privacy`)

- **Download my data** — JSON export via `/api/v1/me/privacy/requests`
- **Delete account** — soft-delete immediately; private purge after retention window
- **Delete uploaded media** — `DELETE /api/v1/me/media/:id`
- **Delete DM conversation (your side)** — `DELETE /api/v1/me/conversations/:id`
- **DM retention preference** — `dmRetentionDays`: 180 / 365 / 730 / null (keep until delete); default **365**
- **Manual privacy review** — `POST /api/v1/me/privacy/manual-review`

## Environment overrides

| Variable | Default | Meaning |
|----------|---------|---------|
| `PLATFORM_DM_RETENTION_DAYS` | 365 | Platform default when unset |
| `DELETED_CONVERSATION_PURGE_DAYS` | 30 | Purge fully-deleted threads |
| `DELETED_ACCOUNT_PURGE_DAYS` | 30 | Private data anonymization delay |
| `NOTIFICATION_RETENTION_DAYS` | 90 | In-app notification TTL |
| `REJECTED_MEDIA_RETENTION_DAYS` | 30 | Rejected upload object TTL |
| `BACKUP_SNAPSHOT_RETENTION_DAYS` | 14 | Documented backup window |
| `ABANDONED_ACCOUNT_DORMANT_DAYS` | 548 | ~18 months inactivity |
| `ABANDONED_ACCOUNT_NOTICE_GRACE_DAYS` | 60 | Notice before queued delete |
| `RAW_IP_RETENTION_DAYS` | 30 | Registration IP prefix nulling |
| `PASSWORD_RESET_TOKEN_PURGE_MS` | 86400000 | 24h after expiry/use |

## Backups (alpha)

- **Retention:** 14–30 days rolling snapshots (hosting provider / `scripts/backup-postgres.sh`).
- **Encryption:** Encrypt before upload where supported.
- **User delete lag:** User deletion removes data from active DB immediately (soft-delete) and purges on schedule; backups may retain ciphertext until the backup window expires unless a legal hold requires preserving a specific snapshot.

## Implementation references

- Policy defaults: `packages/shared/src/retention-policy.ts`
- Privacy settings: `packages/shared/src/user-settings.ts` (`dmRetentionDays`, schema v6)
- Sweeps: `packages/api/src/lib/retention-sweep.ts`
- Legal hold: `packages/api/src/lib/legal-hold.ts`
- Case evidence: `content_snapshots` via `moderation-ts-intake.ts`
