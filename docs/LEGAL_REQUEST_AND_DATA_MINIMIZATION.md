# Legal requests and data minimization

This document describes **lawful** privacy engineering for kink.social — not evasion of valid legal process.

## Principles

1. **Collect less** — only data needed for auth, safety, and product operation.
2. **Retain less** — documented schedules; delete on ordinary cycles.
3. **Encrypt sensitive account fields** — email ciphertext + HMAC lookup; not casual DB browsing.
4. **Require valid legal process** — subpoenas, court orders, preservation requests handled formally.
5. **Produce only what is required** — no voluntary overproduction.
6. **Notify users when legally permitted** — transparency where counsel allows.
7. **Never destroy data after legal hold** — preservation overrides normal retention.

## What we may not have

Because of minimization and encryption design, responses may honestly include:

- “We do not retain raw signup IP beyond 30 days.”
- “That password reset token was purged after use.”
- “Member email is stored encrypted; routine staff cannot browse plaintext.”
- “DM content was auto-deleted per member retention setting before the request.”
- “We deleted quarantine media under normal policy before receiving the request.”

This is different from destroying evidence **after** a known legal hold or preservation demand.

## Data map (where to look)

See [DATA_INVENTORY_AND_RETENTION.md](./DATA_INVENTORY_AND_RETENTION.md).

| Request type | Likely sources |
|--------------|----------------|
| Account identity | `users` (username, encrypted email via break-glass), profiles |
| IP / abuse | Short-lived hosting logs; `registration_ip_prefix` if within retention |
| Messages | DM/hub tables unless auto-shred or legal hold applies |
| Media | `media_assets` + object storage keys |
| Moderation | `reports`, `moderation_cases`, `moderation_audit_events` |
| Legal/DMCA | `legal_requests`, `dmca_cases`, `legal_holds` |

## Staff access to sensitive fields

Platform **OWNER_ADMIN** (`C2K_SITE_OWNER_USER_IDS` or `platform_staff.role = OWNER_ADMIN`) may reveal email or signup IP via:

`POST /api/v1/admin/users/:userId/reveal-sensitive`

Requires `reason` (≥10 chars). Every reveal is written to `moderation_audit_events` (`sensitive_data.reveal`).

**SITE_ADMIN**, **TRUST_SAFETY_ADMIN**, **MODERATOR**, and **LEGAL_ADMIN** cannot use this endpoint unless they are also in `C2K_SITE_OWNER_USER_IDS`.

| `GET /api/v1/admin/owner/investigations/users/:userId/*` | **OWNER_ADMIN only** | Read-only investigation console (DMs, activity, moderation, media) |

Normal moderators do not receive decrypted email in trust-summary or case APIs.

## Request handling checklist

1. **Intake** — legal@ or designated inbox; log ticket ID, date, requester, scope.
2. **Validate process** — counsel confirms jurisdiction, authority, and scope.
3. **Preservation** — if required, create `legal_holds` for affected targets **before** any deletion.
4. **Search** — use data map; decrypt email only if legally required and authorized role.
5. **Production** — minimum responsive set; redact unrelated third parties where allowed.
6. **Delivery** — secure channel; document what was produced.
7. **User notice** — when not prohibited by law or order.
8. **Close** — release holds when counsel approves.

## Retention vs legal hold

| Situation | Action |
|-----------|--------|
| Normal operation | Scheduled jobs purge per policy |
| Active `legal_holds` row | **Skip** deletion for that target |
| Preservation letter received | Create holds; suspend auto-purge for scope |
| Subpoena for deleted data | State deletion occurred under policy if true |

## Encryption limits (honest disclosure)

- Email is **application-encrypted**, not zero-knowledge. The server can decrypt to send mail or comply with valid orders.
- DMs are **not E2EE in alpha** — readable by the platform for safety; encrypted at disk/DB layer only.
- Backups may contain ciphertext and operational data — encrypt backups off-server.

## Transparency

Publish a transparency report when volume warrants. Until then, document internal request counts in operator runbooks.

## Related docs

- [ALPHA_DEPLOYMENT.md](./ALPHA_DEPLOYMENT.md)
- [VPS_SECURITY_HARDENING.md](./VPS_SECURITY_HARDENING.md)
- [privacy/LEGAL-RISK-PRINCIPLE.md](./privacy/LEGAL-RISK-PRINCIPLE.md)
