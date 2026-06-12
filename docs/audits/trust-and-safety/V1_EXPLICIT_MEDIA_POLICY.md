# v1 explicit media policy (feature-flagged OFF)

**Status:** Shipped — T&S-2/3/4A pipeline remains; upload attestation is **gated**, not removed.

## Launch default

- `C2K_ALLOW_EXPLICIT_MEDIA=false` (alias `ALLOW_EXPLICIT_MEDIA`)
- `C2K_ALLOW_NUDITY=false` (alias `ALLOW_NUDITY`)
- `MEDIA_POLICY_MODE` defaults to `community_only` in production (`C2K_ENV=production`)

Explicit sexual media attestation returns **403** with:

> Explicit sexual media uploads are not supported on this platform at this time.

## Gate points

| Layer | File | Behavior |
|-------|------|----------|
| Shared flags | `packages/shared/src/content-policy.ts` | Parse env; rating allow/block helpers |
| Policy mode | `packages/shared/src/media-policy-config.ts` | Requires `ALLOW_EXPLICIT_MEDIA` + beta mode for explicit |
| API | `packages/api/src/lib/media-policy.ts` | `assertMediaContentRatingAllowed()` |
| Attestation | `media-asset-service.ts`, `PATCH .../attestation` | Throws / 403 before lane resolution |

## Enabling explicit beta (non-production)

```env
C2K_ALLOW_EXPLICIT_MEDIA=true
C2K_ALLOW_NUDITY=true
MEDIA_POLICY_MODE=attested_explicit_beta
```

T&S scanners, moderation queues, and admin console continue to operate on attested explicit uploads when enabled.

## Tests

- Unit: `packages/api/src/lib/media-policy.test.ts`
- DB: `media-assets.test.ts` — explicit block when flag false; suite enables flags for pipeline tests

See [../../privacy/LEGAL-RISK-PRINCIPLE.md](../../privacy/LEGAL-RISK-PRINCIPLE.md).
