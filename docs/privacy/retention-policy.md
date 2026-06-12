# C2K retention and secure deletion (operator)

Member-facing summary: [Privacy Policy](/privacy#retention). Legal requests: [Law Enforcement Guidelines](/law-enforcement).

## Principles

1. **Smallest footprint** — collect and keep only what operations, safety, and law require.
2. **Permanent member deletion** — removed from active DB and object storage; text fields get multi-pass overwrite before row delete where supported.
3. **Legal minimum beyond that** — no discretionary long-term archives of DMs or activity.
4. **Legal holds win** — active `legal_holds` block purge and member auto-shred for scoped targets.

## Platform retention defaults

Configured in `@c2k/shared` `retention-policy.ts` (env overrides in FEATURE_REGISTRY):

| Category | Default | Env |
|----------|---------|-----|
| Security / API logs (hosting) | 30 days | `SECURITY_LOG_RETENTION_DAYS` |
| Signup IP prefix after account deletion | 30 days | `RAW_IP_RETENTION_DAYS` |
| Soft-deleted account hard purge | 30 days | `DELETED_ACCOUNT_PURGE_DAYS` |
| Moderation cases / reports | 365 days | `MODERATION_RECORD_RETENTION_DAYS` |
| Encrypted backup snapshots | 30 days | `BACKUP_SNAPSHOT_RETENTION_DAYS` |

## Member auto-shred

Privacy settings (`user_settings.privacy_settings`, schema v5):

- `directMessageAutoDeleteDays` — DMs **sent by** the member
- `hubChatAutoDeleteDays` — convention hub messages **sent by** the member
- `activityAutoDeleteDays` — `feed_activities` rows for the member

Allowed values: `null` (off), `7`, `10`, `30`, `90`, `365`.

Job: `runUserAutoDeleteSweep()` from `retention-sweep` / `npm run db:retention-sweep -w @c2k/api`.

Secure delete: `secure-delete.ts` — 7 overwrite passes on `body`, then `DELETE`.

## Not yet implemented (alpha)

- Full account purge pipeline after `user_privacy_requests` DELETE
- Hosting log purge automation

## Implemented (security hardening sprint)

- Scheduled `retention-sweep` in worker (disable: `C2K_RETENTION_DISABLE_REPEAT=true`)
- Password reset token purge
- Registration IP prefix nulling after `RAW_IP_RETENTION_DAYS`
- Stale quarantine media cleanup (`QUARANTINE_STALE_MS`, default 7 days)
- CLI: `npm run db:retention-sweep -w @c2k/api`

## Legal hold

See `packages/api/src/lib/legal-hold.ts`. Targets: `user`, `message_thread`, `media`, etc.

Per-category inventory: [data-inventory.md](./data-inventory.md).
