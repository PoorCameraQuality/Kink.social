# C2K audit remediation backlog

Mapped from the cross-repo deep research audit (Kink.social / EastCoast). Items scoped to **this repo** unless noted.

**Legend:** Done = shipped · Open = not started · EastCoast = separate repo

| Priority | Item | Status | Primary files |
|----------|------|--------|---------------|
| High | Report/case delete-now + real suspend | **Done** | `moderation-content-enforcement.ts`, moderation UI |
| High | ECKE HMAC + idempotency/correlation headers | **Done** | `ecke-ingest-auth.ts`, `ecke-publish-client.ts` |
| High | Migrate org/group/convention ECKE UI off legacy stub | **Done** | control-plane panels, `ConventionPublishActions.tsx` |
| High | Retire legacy organizer ECKE routes from runtime | **Done** | `server.ts` (unregistered); `ecke-publish-routes.ts` kept for reference/tests |
| Medium | WS scope-aware unsubscribe | **Done** | `server.ts` |
| Medium | Bridge observability (target stats + recent errors) | **Done** | `health-ecke.ts` → `/api/health/ecke` |
| Medium | Unify publish path (queue via BullMQ) | **Done** | `ecke-publish-service.ts`, `ecke-publish-final-kinds.ts` |
| Medium | Separate moderation vs PII-reveal RBAC | **Done** | T&S admin for delete/suspend; owner-only PII reveal; site admin for permanent suspend |
| Low | Remove `EckePublishStub` | **Done** | deleted |
| Low | Update `FEATURE_REGISTRY.md` ECKE section | **Done** | `docs/FEATURE_REGISTRY.md` |
| Ops | Enable HMAC in production VPS | **Open** | pair `ECKE_PUBLISH_HMAC_SECRET` ↔ ECKE `KINK_SOCIAL_INGEST_HMAC_SECRET` |
| Ops | Enable per-entity ingest flags on VPS | **Open** | `ECKE_EVENT/PLACE/VENDOR_INGEST_ENABLED` |
| EastCoast | Contact form Supabase bug + rate limits + CSP | **Done** | EastCoast `contact/route.ts`, `newsletter/subscribe`, `next.config.js`, HMAC verify |

## Production checklist

1. Set `ECKE_PUBLISH_HMAC_SECRET` on C2K and `KINK_SOCIAL_INGEST_HMAC_SECRET` (same value) on EastCoast; smoke one publish/unpublish.
2. Enable ingest flags per entity after paired secrets and worker health green (`/api/health/ecke`, `/api/health/worker`).
3. Monitor `/api/health/ecke` → `bridge.targetsByStatus` and `bridge.recentErrors` after cutover.
4. Redeploy EastCoast after contact/newsletter/CSP/HMAC changes; verify contact form saves to `submissions`.

## RBAC summary

| Capability | Role |
|------------|------|
| Report triage, hide content, case notes | Platform moderator |
| Delete content, suspend user (temporary) | Trust & safety admin |
| Permanent suspend, identity ban, org freeze | Site admin |
| Email / registration IP reveal | Site owner only |

## Notes

- Control-plane publish for articles, vendors, events, and convention anchors **queues** BullMQ jobs (unless `C2K_ECKE_PUBLISH_INLINE=true`).
- Legacy `/api/v1/organizer/ecke-publish/*` is no longer mounted; update any external scripts still calling those paths.
- When `KINK_SOCIAL_INGEST_HMAC_SECRET` is set on EastCoast, ingest requires Bearer **and** valid `X-Kink-Social-Timestamp` + `X-Kink-Social-Signature` headers.
