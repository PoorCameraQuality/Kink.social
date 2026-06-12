# Coast to Coast Kink — Executive platform readiness

**Audience:** Leadership, sponsors, and stakeholders who need a concise picture of product maturity—not engineering task lists.  
**Prepared:** 2026-06-12 (pass 26 — VPS alpha live)  
**Posture:** **VPS invite alpha** at **https://kink.social** + local Docker dev; see [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted.  
**Engineering source of truth:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) **pass 26**. Full audit baseline: [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md). Session handoff: [`HANDOFF.md`](./HANDOFF.md).

---

## 1. Executive summary

Coast to Coast Kink (C2K) is a **kink-positive community platform** delivered as a **monorepo** (Vite/React web app + Fastify API + PostgreSQL). The product is intentionally **hybrid**: many **member-facing flows are API-backed** when `USE_DATABASE=true` (accounts, profiles, org hubs, events, conventions with full programs, presenters, vendors, messaging threads, trust/safety primitives, org realtime per ADR 002), while **guest demos, legacy mock IDs, and marketing shells** still rely on placeholders.

**Overall estimated platform maturity: 83–86%**¹ toward a credible first production release for **community orgs running events and programs**—not yet toward a full consumer marketplace with native payments and exhaustive automated QA. The largest **remaining lifts** are: **payments / ticketing integrations**, **schema sync reliability** (`db:push` blocker → use `db:migrate-incremental`), **formal prod SMTP sign-off** (transport works on kink.social; checklist A–E operator-owned), **first external pilot org**, and **LEGAL-ALPHA-1 owner manual smoke** before legal-profile freeze.

**June 2026 sync:** **VPS alpha live** (2026-06-11) — profile social rail, upload fix, mobile UX, auth gate, welcome mail on prod. SCOPED-MOD-1 / T&S-5 moderation alpha; **UI-DISC-1–6** done; Following feed **F1–F5** shipped. Prod health/mail green; `_smoke-prod-quick.mjs` **9/9**.

¹ *Maturity percentages last calibrated **2026-06-12** — [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) pass 26. Product + engineering judgments for planning — not contractual SLAs.*

---

## 2. Methodology (how to read the %)

| Range       | Meaning                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| **85–100%** | Shipped for primary users; remaining work is edge cases, polish, or scale concerns.                        |
| **70–84%**  | Core user journeys work end-to-end in production configuration; gaps are visible but not blocking a pilot. |
| **50–69%**  | Meaningful slices exist; important UX or integrations still missing for “general availability.”            |
| **25–49%**  | Prototype or partial; often mock-backed or placeholder UI.                                                 |
| **0–24%**   | Not started, “coming soon” shell, or explicitly deferred.                                                  |

**Confidence:** High for areas with clear API + UI coverage; medium where mock fallbacks remain; low where product direction is still open-ended (e.g. long-term education strategy).

---

## 3. Feature domains (what exists vs what is still needed)

| Domain                                      | Est. %  | Confidence  | What we have today                                                                                                                                                                                                                                                                               | What we still need to build                                                                                                          |
| ------------------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Identity, auth, and profiles**            | **84%** | High        | Cookie session, registration/login, profile CRUD, kinks/locations, profile ISO wishlist, public profile + ecosystem strip                                                                                                                                                                        | Stronger account security story (e.g. optional 2FA), fewer legacy localStorage mirrors on profile media                              |
| **Discovery & home experience**             | **62%** | Medium      | Discovery people (DB); **signed-in home API-first** + **nearby groups** on home join rail; Near you on `/groups` and `/discovery`; pinned conventions rail                                                                                                                                       | Guest feed still thin; 14 ComingSoon marketing routes                                                                                |
| **Events & unified calendar**               | **78%** | High        | `events` CRUD, RSVP, IRL location privacy (ADR 003), program summary on events, contributors API, group-scoped events (G301–G312), **EventOrganizerPanel** for org + group                                                                                                                                                             | Recurring events, external calendar/ticketing sync, fewer mock legacy event IDs in UI                                              |
| **Conventions & program operations**        | **88%** | High        | Full schedule model, gated program listing, WS schedule scope, public registration, hub v2 (gallery, pins, **hub channels C212**, attendee gallery **C213**), Dancecard organizer parity, **CreateFlowModal** → Manage, **unread badges C214**, **hub push C215**                                                                                                                                                      | Multi-replica WS bus; attendee gallery UX polish |
| **Organizations hub**                       | **82%** | High        | Community modules, forums, RSVP, member directory, Chat/LiveKit when configured, digest mail, scope branding; **public email list** + organizer broadcast; platform BCC when configured; org join welcome                                                                                                                                                     | Redis WS bus at scale, legal review of marketing BCC, inline org join polish (O76)                                           |
| **Groups**                                  | **78%** | Medium–High | UUID path, **`place_id` / nearby**, Near you + home rail, forums/events/feedback, group event organizer, branding, **email list signup**                                                                                                                                                                                          | Legacy mock path; group photo/channel admin stubs                                                                                  |
| **Presenters & catalog**                    | **80%** | High        | Directory, offerings, reviews, gallery/teaching credits, **Writing** (education articles), convention links, **`/presenters/onboarding`**, **sessions respect program gating** for viewers                                                                                                                                                                       | Deeper CE/CFP/session materials flows beyond current slot offering attachment                                                        |
| **Vendors & commerce paths**                | **74%** | Medium–High | **`/vendors/onboarding`** wizard, native products + multi-provider external listing cache (Etsy/Shopify/Woo), shop policies/maker story, blind feedback, community appearances                                                                                                                                                                                                       | First-party checkout still out of scope; more owner tooling and fraud/abuse playbooks                                                |
| **Messaging & notifications**               | **62%** | Medium      | REST conversations (main/requests/ISO), accept-DM, org chat over WS; **signed-in notifications API-only**; **hub push** for announcements + chat when VAPID configured                                                                                                                                                                                                                              | DM transport still primarily REST, richer notification center UX, prod push on real devices                                     |
| **Trust, safety, and moderation**           | **72%** | High        | References, peer reputation, IP-based controls, profile review flags, attendance-gated reviews, group dormancy worker jobs                                                                                                                                                                       | Product policy choices (e.g. stricter IPv6 ban modes), moderator throughput at scale                                                 |
| **Matchmaker (event-scoped)**               | **60%** | Medium      | Settings, responses, swipes, deck when enabled on events                                                                                                                                                                                                                                         | UX iteration, analytics, and “why we match” transparency if product wants it                                                         |
| **Education, places, and long-tail routes** | **60%** | Medium      | **API-backed `/education` hub + reader**, TipTap **`/education/write`**, profile Journal, presenter Writing; places route partial; **ECKE events bridge pilot verified** (2026-05-27)                                                                                                                                                                                                                               | ECKE vendor/article/dungeon publish, prod ECKE deploy, legacy feed-article migration, maps/near-me events by place, completion of “coming soon” marketing pages |
| **Settings & account preferences**          | **53%** | Medium      | Wired areas (e.g. presenter catalog, notification prefs for digest)                                                                                                                                                                                                                              | Full settings surface parity with API; mobile polish                                                                                 |
| **Engineering quality, testing, and ops**   | **74%** | Medium      | Typecheck green; **`npm test` 251/251** (55 files); **`test:db` 57** (Postgres); Playwright **85** unique cases (**161 passed / 8 skipped** full suite); **`npm run verify:alpha:auto:local`** **11/11**; **`npm run verify:trust-safety`** green; `db:migrate-incremental`; command-bridge RBAC green; **K8s mail templates** + Mailpit dev                                                                                                                                                                               | Prod observability dashboards; prod cutover smokes on live domain; LEGAL-ALPHA-1 owner smoke                                                       |

### 3.1 Weighted rollup (same domains, leadership view)

Using the **fourteen** domain rows above as equally weighted pillars, the **arithmetic mean** is approximately **71%**; the **82–85% overall** range in §1 weights flagship verticals (orgs, conventions, groups, trust, T&S) more heavily than long-tail routes. Domains **below ~60%**—settings (~53%), education/long-tail (~60%)—are the **primary drag** on raising toward **85%+**.

---

## 4. Investment themes (recommended narrative for higher-ups)

1. **Finish the “single spine” product story** — Events, conventions, org hubs, presenters, and vendors share one calendar/program model; investment should **deepen** that story (ticketing, geographic discovery, fewer mocks) rather than fork new calendars.
2. **Commercial and retention layer** — Native or deeply integrated **payments** and **notification** polish on prod devices are the main gap versus consumer-grade competitors; **push (C215) and digests (O77) shipped locally**.
3. **Trust at scale** — Core primitives exist; spend is mostly **workflow, moderation UX, and policy** as volume grows.
4. **Hardening** — Automated tests and production observability remain **below** feature velocity; `db:push` reliability affects every deploy.

---

## 5. Risks and dependencies (short list)

- **Realtime:** In-process bus is fine for a single API instance; **multiple replicas** need a shared pub/sub strategy before org/convention WS is cluster-safe.
- **Mail / LiveKit / external stores:** Feature-rich behavior **depends on environment** (`C2K_MAIL_*`, `LIVEKIT_*`, provider API keys). Staging should mirror production flags for credible demos.
- **Hybrid UI:** Mock fallbacks speed development but can **mask** missing API coverage in demos—leadership demos should prefer **`USE_DATABASE=true`** with seed data and **no** `VITE_HOME_DEMO_FALLBACK`.
- **Schema sync:** `drizzle-kit push` may fail on convention expression indexes; teams need **`db:migrate-hub-ext`** + documented manual SQL for new columns.

---

## 6. Appendix — where to drill down

| Document                                                                                 | Use                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md)                                         | **Start here** — priorities, verification, launch blockers |
| [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md)                               | 2026-06-06 full-project audit snapshot      |
| [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md)                                           | Authoritative per-route and per-API status |
| [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md)                                             | Recommended work order (alpha → social)    |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md)                                             | Alpha verification checklist               |
| [`BRANDING_AND_SOCIAL_SHARING.md`](./BRANDING_AND_SOCIAL_SHARING.md)                     | Scope branding + OG crawlers               |
| [`adr/002-org-realtime-chat-and-digests.md`](./adr/002-org-realtime-chat-and-digests.md) | Org realtime, voice, digest mail           |
| [`archive/README.md`](./archive/README.md)                                               | Historical audits — not for live routing   |

---

*Refresh when a major vertical ships (conventions, org hub, payments, messaging, T&S legal freeze) or at least quarterly.*

¹ *See §1 footnote — maturity % last calibrated **2026-06-06**.*
