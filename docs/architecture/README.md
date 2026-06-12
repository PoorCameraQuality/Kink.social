# C2K runtime architecture

**Last updated:** 2026-06-06 (70 API registrars; 9 BullMQ queues in `worker.ts`)

**Purpose:** Onboarding, scaling review, interoperability design, and modular domain evolution.  
**Audience:** Backend, full-stack, and platform engineers.  
**Not:** UI component catalogs or generic stack tutorials.

**Source of truth for routes/features:** [`../FEATURE_REGISTRY.md`](../FEATURE_REGISTRY.md)  
**Strategic + agent rules (read first):** [`../C2K-STRATEGIC-GUIDANCE.md`](../C2K-STRATEGIC-GUIDANCE.md) · Cursor: `.cursor/rules/c2k-strategic-guidance.mdc`  
**Product boundaries (C2K vs ECKE):** [`../PLATFORM_VISION.md`](../PLATFORM_VISION.md)  
**Identity ADR:** [`../EVENT_SYSTEMS_IDENTITY.md`](../EVENT_SYSTEMS_IDENTITY.md)

---

## Documents

| Doc | Read when |
|-----|-----------|
| [01-domain-boundaries.md](./01-domain-boundaries.md) | Splitting services, federation, avoiding duplicate models |
| [02-entity-relationships.md](./02-entity-relationships.md) | Schema changes, FK design, participation vs identity |
| [03-permission-systems.md](./03-permission-systems.md) | AuthZ bugs, new organizer capabilities |
| [04-event-workflows.md](./04-event-workflows.md) | Calendar vs convention lifecycles |
| [05-realtime-architecture.md](./05-realtime-architecture.md) | WS scaling, multi-replica, hub invalidation |
| [06-organizer-systems.md](./06-organizer-systems.md) | Event Systems / command bridge |
| [07-convention-operations.md](./07-convention-operations.md) | Attendee hub, registration, check-in, hub chat |
| [08-notification-systems.md](./08-notification-systems.md) | In-app, email, push, digests |
| [09-api-surface.md](./09-api-surface.md) | Route ownership, extension points |
| [10-websocket-scopes.md](./10-websocket-scopes.md) | Subscribe contracts |
| [11-background-workers.md](./11-background-workers.md) | BullMQ jobs, env flags |
| [12-moderation-systems.md](./12-moderation-systems.md) | Reports, jobs, gallery, trust |
| [13-interoperability-federation.md](./13-interoperability-federation.md) | ECKE publish, future federation APIs |

---

## Companion ops docs

| Architecture topic | Operator / product doc |
|--------------------|-------------------------|
| 05 Realtime | [REALTIME_SCALING.md](../REALTIME_SCALING.md) |
| 06 Organizer | [ORGANIZER_CONSOLE.md](../ORGANIZER_CONSOLE.md) |
| 08 Notifications | [DEPLOY_MAIL_K8S.md](../DEPLOY_MAIL_K8S.md), [PUSH_VAPID_DEV.md](../PUSH_VAPID_DEV.md) |
| 09 API inventory | [FEATURE_REGISTRY.md](../FEATURE_REGISTRY.md) §4 |
| 12 Moderation ops | [audits/trust-and-safety/MODERATOR_WORKFLOW.md](../audits/trust-and-safety/MODERATOR_WORKFLOW.md) |
| Deploy | [DEPLOYMENT_RUNBOOK.md](../DEPLOYMENT_RUNBOOK.md), [SERVER_MOUNT_RUNBOOK.md](../SERVER_MOUNT_RUNBOOK.md) |

---

## Runtime processes

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  c2k-web    │────▶│  c2k-api    │────▶│  PostgreSQL  │
│  (Vite SPA) │     │  Fastify    │     │  Drizzle ORM │
└─────────────┘     │  + /api/ws  │     └──────────────┘
                    │  in-proc    │            ▲
                    │  realtime-  │            │
                    │  bus        │     ┌──────┴───────┐
                    └──────┬──────┘     │  c2k-worker │
                           │            │  BullMQ      │
                           ▼            └──────────────┘
                    ┌─────────────┐            │
                    │  Redis      │◀───────────┘
                    │  (9 queues) │
                    └─────────────┘
```

**Hidden coupling hotspots:** `convention-organizer-routes.ts` size, `ecosystem-stubs.ts` naming, in-process `publishToScope` ↔ WS on same pod, `syncConventionPeopleDirectory` called from multiple write paths.

---

## Mirror copy

A duplicate of this folder may exist at  
`Desktop/Crossreference archtecture/architecture/` for external advisors (ChatGPT). Prefer **this repo path** when docs diverge.
