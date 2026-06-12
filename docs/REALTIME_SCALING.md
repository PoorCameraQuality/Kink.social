# Realtime scaling and staging checks (orgs + conventions)

**Last updated:** 2026-06-06 (`C2K_REALTIME_REDIS_BRIDGE` implemented in `realtime-redis-bridge.ts`)

**Audience:** Operators and engineers preparing staging/production beyond a single API process.

## 1. WebSocket fan-out today

- The API publishes schedule and org-channel events to subscribers over **`GET /api/ws`** after **`subscribe`** passes authorization (`packages/api/src/lib/ws-subscribe-auth.ts`).
- **Single Node assumption:** delivery assumes one API process holds all socket connections. If you run **multiple API replicas** behind a load balancer, a client connected to instance A will not receive events published on instance B.

## 2. Redis bridge (implemented behind flag)

**Goal:** On publish, emit to a Redis channel; every API instance subscribes and forwards to its local WebSocket clients for the same scope.

**Suggested shape:**

1. **Channel naming:** e.g. `c2k:ws:convention:{conventionId}:schedule`, `c2k:ws:org:{orgId}:channel:{channelId}` (mirror existing scope strings).
2. **Publisher path:** wherever `publishToScope` (or equivalent) runs after DB writes, also **`PUBLISH`** a small JSON payload (event type + ids) to Redis.
3. **Subscriber:** on API boot, **`SUBSCRIBE`** (or pattern subscribe) and, on message, fan out to in-memory subscribers for that scope only.
4. **Backpressure / payload size:** keep messages tiny (revision id + type); clients already refetch via `GET` when they receive an event.

**Rollout:** set `C2K_REALTIME_REDIS_BRIDGE=true` on all API pods (implemented in `packages/api/src/lib/realtime-redis-bridge.ts`). Local dev keeps in-process only unless the flag is set and Redis is running.

## 3. Staging checklist: LiveKit (voice)

- Set **`LIVEKIT_URL`**, **`LIVEKIT_API_KEY`**, **`LIVEKIT_API_SECRET`** on the API service (see `packages/api/src/routes/livekit-voice-routes.ts`).
- From the org hub **Chat** tab, open a **VOICE** (or VIDEO/LIVE_STREAM) channel and use **Join voice**; expect a token (not **503**).
- Confirm browser can reach LiveKit WebSocket URL (TURN/STUN if required for your network).

## 4. Staging checklist: mail (org digest)

- Set **`C2K_MAIL_TRANSPORT`** to `smtp` or `resend`, plus **`C2K_MAIL_FROM`**, **`C2K_PUBLIC_WEB_URL`** (and SMTP or **`RESEND_API_KEY`** as applicable). See `docs/adr/002-org-realtime-chat-and-digests.md`.
- Run the worker (`npm run start:worker -w @c2k/api`) so **`org-digest-sweep`** executes; verify a test user with **`user_notification_preferences.orgDigestEmailWeekly`** receives mail or see worker logs.

## 5. Related docs

- [ADR 002 — org realtime, voice, digests](adr/002-org-realtime-chat-and-digests.md)
- [HANDOFF.md](HANDOFF.md) (session handoff)
