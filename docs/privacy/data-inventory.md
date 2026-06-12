# C2K data inventory (v1 foundation)

Lawful compliance minimization: document what we store, why, and default retention. See [LEGAL-RISK-PRINCIPLE.md](./LEGAL-RISK-PRINCIPLE.md) and [retention-policy.md](./retention-policy.md).

## Identity & profiles

| Table / area | Primary data | Purpose | Default retention |
|--------------|--------------|---------|-------------------|
| `users` | username, email, password hash, signup IP prefix, age/terms timestamps, policy version | Authentication, abuse signals, 18+ affirmation | Active account; see purge policy |
| `profiles` | display name, bio, location, roles, optional DOB-derived age, visibility | Member discovery & self-expression | With account |
| `user_settings` | privacy, notification, feed JSON | Preferences | With account |

## Media & uploads

| Table / area | Primary data | Purpose | Default retention |
|--------------|--------------|---------|-------------------|
| `media_assets` | quarantine/published keys, ratings, attestation, scan status | T&S upload pipeline | Until deleted or moderation outcome |
| `media_scanner_results` | scanner labels, private raw JSON | Safety review | `MODERATION_RECORD_RETENTION_DAYS` (365) |
| `media_hash_list_entries` | deny/review hashes | Block known-bad content | While active + moderation retention |
| `profile_photos` | FK to media assets | Profile gallery | With account / asset |

## Messaging & social

| Table / area | Primary data | Purpose | Default retention |
|--------------|--------------|---------|-------------------|
| Convention hub channels/messages | text bodies, sender id | Event community chat | Event lifecycle + org policy |
| DMs (when enabled) | thread metadata, message bodies | Private communication | Member auto-shred TTL or account lifecycle; 7-pass body overwrite on purge |
| `feed_activities` | actor, verb, object refs | Following feed (phase 2) | Member auto-shred TTL or rolling platform cap TBD |

## Trust & safety

| Table / area | Primary data | Purpose | Default retention |
|--------------|--------------|---------|-------------------|
| `reports` | reporter, target, policy reason | User reports (T&S-1) | `MODERATION_RECORD_RETENTION_DAYS` |
| `moderation_cases` / `moderation_queue_items` | case state, queue, severity | Staff workflow | `MODERATION_RECORD_RETENTION_DAYS` |
| `moderation_events` | audit trail JSON | Case history | `MODERATION_RECORD_RETENTION_DAYS` |
| `identity_bans` / `scope_bans` | ban scope, reason | Enforcement | While active + retention window |

## Legal & compliance (stub)

| Table / area | Primary data | Purpose | Default retention |
|--------------|--------------|---------|-------------------|
| `legal_requests` | request type, status, requester metadata, notes | Inbound legal/subpoena (Epic 4+) | Until closed + hold release |
| `legal_holds` | target type/id, active flag, actor | Block purge during investigation | Until `released_at` |
| `dmca_cases` | claimant, work ID, infringing URL, status | DMCA takedown workflow (LEGAL-ALPHA-1) | Until closed + moderation retention |
| `user_privacy_requests` | export/deactivate/delete type, status, JSON export | User data rights foundation | Until completed + retention window |
| `platform_staff.last_step_up_at` | timestamp | Privileged admin password step-up | With staff role row |

## Logs & telemetry

| Area | Primary data | Purpose | Default retention |
|------|--------------|---------|-------------------|
| API request logs (hosting) | IP, path, status | Operations / security | `SECURITY_LOG_RETENTION_DAYS` (30) |
| `users.registration_ip_prefix` | normalized signup IP | Abuse prevention | `RAW_IP_RETENTION_DAYS` (30) after account deletion |

## Config

Retention defaults live in `@c2k/shared` (`retention-policy.ts`) and are overridable via env:

- `SECURITY_LOG_RETENTION_DAYS` (default 30)
- `RAW_IP_RETENTION_DAYS` (default 30)
- `DELETED_ACCOUNT_PURGE_DAYS` (default 30)
- `MODERATION_RECORD_RETENTION_DAYS` (default 365)

Skeleton job: `packages/api/src/lib/retention-sweep.ts` (BullMQ lifecycle job `retention-sweep`; CLI `npm run db:retention-sweep -w @c2k/api` when script added).
