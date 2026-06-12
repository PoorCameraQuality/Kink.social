# C2K — Project roadmap & next steps

**Last updated:** 2026-06-12 (pass 26 — VPS alpha live; doc sync)  
**Start here after UX/home work:** This file is the **single outline** for what to do next. Operational detail lives in linked docs.

**Status:** Tracks **A** and **B** complete. **VPS alpha live** at kink.social (2026-06-11). **`PILOT-MAIL`** / **`PILOT-ORG`** **in progress** on prod (formal sign-off open). **`UI-DISC-1`–`UI-DISC-6`** **done**. Track **C** (`SG-*`) partial.

| Track | Status | Queue / backlog sync |
|-------|--------|----------------------|
| **A — Alpha (organizer)** | **Done (local)** / **prod live** | Engineering complete; VPS mounted — **`PILOT-MAIL`** / **`PILOT-ORG`** sign-off **in progress** on kink.social |
| **B — Home polish** | **Done** | `PH2-F1`–`F5` done; Track B tasks B1–B5 shipped 2026-05-27; UX seeded debt **G2, G3, H1, H2, P1, S1, C1, UX-R1–R4** **done** in [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) |
| **C — Phase 2 social** | **Partial** | Pre-launch + Local meantime **`SG-*`** shipped (§2); remaining rows in [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) |
| **D — UX refactor debt** | **done (UI-DISC-*)** | **`UI-DISC-1`–`UI-DISC-6`** shipped 2026-06-06 ([`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md)); optional D1–D3 below |

| If you need… | Read |
|--------------|------|
| Agent rules & phases | [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) |
| Priority table & verification | [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) |
| Routes & API truth | [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) |
| Alpha pilot gate | [`PILOT_READINESS.md`](./PILOT_READINESS.md) |
| Home / Following product spec | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) |
| Member visual system (ECKE V2) | [`UX_REFACTOR_V2_PROGRESS.md`](./UX_REFACTOR_V2_PROGRESS.md) · ADR [`004`](./adr/004-ecke-member-presentation-layer.md) |
| Discover UI refresh (June 2026) | [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) — shells shipped; **`UI-DISC-*`** consolidation |

---

## 1. Where the product is now

### Strengths (ship-ready locally)

- **Organizer-first core:** Event Systems convention manager, org hub, door/registrants, People hub, mail/lists, hub chat + push (C212–C215).
- **Member chrome (ECKE V2):** Midnight Brass default, `dc-*` tokens, shared cards, skeletons, CI guard against legacy `c2k-*` color classes.
- **Social home (Phase 2 partial):** `feed_activities`, Following feed API, Following / Discover modes, rich composer.
- **Home IA (2026-05-27):** Persistent **`CommunityNavBar`** (feed + browse), **`ConventionCard`** aligned with **`EventCard`**, simplified Near-you feed, e2e post cleanup on seed.

### Known gaps (not blockers for local alpha)

| Gap | Impact | Doc / fix |
|-----|--------|-----------|
| `db:push` Zod on expression indexes | Use `db:migrate-incremental` | [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) §6 |
| Regional People empty without `stateId` | Run locations seed + profile state backfill | `npm run db:seed:locations -w @c2k/api` then `npm run db:seed -w @c2k/api` |
| Near-you / Following feed **HTTP 500** on some local setups | Investigate `GET /api/v1/feed/…` when resuming | [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) §9 |
| ~~Discover nav consolidation (`UI-DISC-*`)~~ | **Done 2026-06-06** | [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) — followups: Near-you API, group library APIs |
| Prod pilot org + formal SMTP sign-off | VPS live; external org not onboarded | [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) |
| **`LEGAL-ALPHA-1` owner manual smoke** | Eng shipped; freeze after pass | [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md) |
| Trending is MVP (newest posts, not scored) | OK for alpha | [`TRENDING_SCORE.md`](./TRENDING_SCORE.md) |
| 14 ComingSoon marketing routes | Footer / rare links only | [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) |
| No payments / native app | By design Phase 1 | [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) §5 |

---

## 2. What we just finished (four-phase plan — 2026-05-27)

| Track | Status | Highlights |
|-------|--------|------------|
| **A — Alpha** | Done | pilot-readiness **11/11**, attendee **7/7**, audit RBAC green, typecheck + **`npm test` 251/251** + Playwright full suite **~161 passed / 8 skipped** (**21** spec files) |
| **B — Home polish** | Done | Profile `#profile-location`, browse `browseHref`, convention hubs row gated on unread |
| **C prep — Phase 3** | **VPS mounted** | kink.social live 2026-06-11 — pilot org + mail checklist still open |
| **C — Social slices** | Partial | Phase 4: SG-080/081/087/096/121, geo browse + featured events; **pre-launch Wave 1–2** + **Local meantime Waves 1–3** (see below) |
| **Trust & safety** | Done (local) | **2026-06-06:** `SCOPED-MOD-1` scoped moderation alpha pass; `MEDIA-MOD-MINIMUM` platform media mod — [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) |

**Local meantime sprints (2026-05-27):**

| Wave | Ship |
|------|------|
| **Wave 3** | SG-093 event story cards + inline RSVP; G304 UUID group tab gating; Wave 3C `/community` redirect + ComingSoon live links |
| **Wave 2** | SG-130 post likes + connection liker preview; SG-084 muted tags; profile photos API-first |
| **Wave 1** | SG-120 Interested RSVP label; SG-138 group settings PATCH; UX B2 org hub hint; UX N1 messaging QA guide |

**Capability sprints (2026-05-27):**

| Sprint | Ship |
|--------|------|
| **Educator Contributions** | `education_articles`, `/education` hub + reader, `/education/write`, Journal, presenter Writing, org featured articles |
| **Educator follow-ups** | `/presenters/onboarding`, hub empty CTAs, `/saved` article bookmarks |
| **Vendor community** | Etsy images, policies, event credits worker, vending rails |
| **Presenter teaching history** | Worker-synced **On program** credits |
| **Vendor onboarding** | `/vendors/onboarding` wizard + settings shop section |

**Pre-launch Wave 1 (2026-05-27):**

| ID | Ship |
|----|------|
| SG-033 | Member since on public profile |
| SG-031 | Copy link overflow menus |
| SG-137 | Connection RSVP avatars on EventCard |
| SG-082 | Community event calendar (Google / webcal / ics) |
| SG-138 | Group discovery grid enrichment |
| SG-015 | Close / reopen RSVPs (`rsvpOpen`) |

Prior home/UX items (2026-05-27):

| Item | Location |
|------|----------|
| ECKE V2 waves 0–5 | [`UX_REFACTOR_V2_PROGRESS.md`](./UX_REFACTOR_V2_PROGRESS.md) |
| Persistent community nav | `packages/web/src/components/CommunityNavBar.tsx` · `packages/web/src/lib/community-nav.ts` · `RootLayout` |
| Home feed simplification | `LocalHomeFeed.tsx` — composer, optional convention hubs row, feed skeletons, max 3 event cards |
| Unified event/convention cards | `EventCard.tsx` · `ConventionCard.tsx` |
| Seed hygiene | `cleanupE2eFeedPosts()` · trending excludes `e2e-%` · strip HTML in trending titles |
| Demo profile `stateId` | `ensureDemoProfileStateIds()` in `seed.ts` (needs PA in `states` table) |

**Verify locally:**

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:seed:locations -w @c2k/api   # once, if People suggestions are empty
npm run db:seed -w @c2k/api
npm run dev
# http://localhost:5173/home?mode=discover&tab=Local
```

---

### Track A — Phase 1 alpha (organizer) — **done 2026-05-27** · queue drained

### Track B — Member home polish — **done 2026-05-27** · `PH2-F1`–`F5` shipped

### Track C — Phase 2 social — **slices shipped (local); `SG-*` backlog remains**

### Track D — UX refactor debt — **done 2026-06-06 (`UI-DISC-1`–`UI-DISC-6`)**

**Seeded debt shipped** ([`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md)): G2, G3, H1, H2, P1, S1, C1, UX-R1–R4.

**Discover refresh consolidation (2026-06-01 — shipped 2026-06-06):**

| ID | Status | Task | Exit criteria |
|----|--------|------|----------------|
| UI-DISC-1 | **done** | One browse chrome | Same sub-nav (or same `CommunityNavBar` only) on `/events`, `/groups`, `/conventions`, `/discovery`, `/education` |
| UI-DISC-2 | **done** | Create + search policy | Single global Create; page search only when scoped; no duplicate gold CTAs |
| UI-DISC-3 | **done** | Home vs standalone | Home discover tabs link to canonical `/events` etc. OR drop inline duplicate grids |
| UI-DISC-4 | **done** | Filter honesty | Wire Find people geo + convention distance or hide controls |
| UI-DISC-5 | **done** | Stub nav | No fake invitation badges; clear “coming soon” on My Groups / tickets |
| UI-DISC-6 | **done** | Legacy cleanup | Remove legacy discovery components; align mobile filter drawers |

Detail: [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md).

**Original Track A tasks (reference):**

| # | Task | Exit criteria |
|---|------|----------------|
| A1 | Run full verification suite | typecheck · tests · e2e · smokes |
| A2 | Manual door + PWA | Phone check-in; add-to-home |
| A3 | Organizer tab walk | smoke-organizer-tab-walk + DANCECARD manual |
| A4 | Attendee hub spot-check | smoke-attendee-dancecard 7/7 |
| A5 | Pilot org packet | PILOT_READINESS dry run signed |

**Original Track B tasks (reference):**

| # | Task | Notes |
|---|------|--------|
| B1 | Profile location UX | `#profile-location`, discovery empty CTA |
| B2 | Deep-link browse sections | `browseHref` / `isBrowseTabActive` |
| B3 | Convention hubs row | Unread chat/announcement only |
| B4 | Following feed cards | Filter tabs (**SG-121** shipped) |
| B5 | Playwright home | CommunityNavBar + convention Schedule tab |

---

## 3. Recommended order of work (next)

**Resume order (2026-06-06):** (1) **`LEGAL-ALPHA-1`** owner manual smoke → freeze — [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md); (2) **`PILOT-ORG`** when hosting lands; (3) one **`SG-*`** slice; (4) **`ORG-DOOR-*`** followups from mobile door walkthrough. **`UI-DISC-1`–`UI-DISC-6`** **shipped** 2026-06-06.

### Track A — Phase 1 alpha (organizer) — **complete**

Signed **2026-05-27** — all [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) alpha rows **done** except **`PILOT-MAIL`** / **`PILOT-ORG`** (server). Regression: `npm run verify:alpha`. Original tasks A1–A5: §2 reference table.

**Defer until server:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md), [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md), real DNS/TLS.

---

### Track B — Home polish (member) — **complete**

Shipped **2026-05-27** — B1–B5 + `PH2-F1`–`F5` (Following sub-filters via **`PH2-F4`** / **SG-121**). Original tasks: §2 reference table. No open Track B rows in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md).

---

### Track C — Phase 2 social (FetLife parity axis) — **next after UI-DISC P0**

Goal: Deeper social graph without duplicating organizer systems. **Do not** outrank **`UI-DISC-1`–`UI-DISC-3`** or door/convention blockers.

**Done (pre-launch Wave 1–2 + Local meantime + Phase 4):** SG-015, SG-031, SG-033, SG-080, SG-081, SG-082, SG-084, SG-085, SG-087, SG-093, SG-096, SG-105, SG-120, SG-121, SG-130, SG-134–136, SG-137, SG-138 — see §2 tables and [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) § Shipped.

| # | Task | Reference |
|---|------|-----------|
| C1 | Next **`SG-*`** backlog slice | [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) — W1 graph inbox (**SG-001–004**) or remaining W3 feed/media; one ID per PR |
| C2 | More activity verbs (love, comment, group_join) | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) §3.2 — partial via **`PH2-F5`**; extend as needed |
| C3 | Trending v1 scoring | Implement [`TRENDING_SCORE.md`](./TRENDING_SCORE.md) when feed volume warrants |
| C4 | **Social baseline batches 3–7** | [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) **SG-080–146** — browse/discovery IA, follow gates, feed filters, places directory (Waves **W0–W4**) |

---

### Track D — UX refactor debt — **done (`UI-DISC-*` shipped 2026-06-06)**

Primary queue: [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) — all **`UI-DISC-*`** rows **done**.

| # | Task | Reference |
|---|------|-----------|
| D1 | ~~**`UI-DISC-1`–`UI-DISC-3`** (P0)~~ | **done** — [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) |
| D2 | ~~**`UI-DISC-4`–`UI-DISC-5`** (P1)~~ | **done** — filter honesty + stub nav |
| D3 | ~~**`UI-DISC-6`** (P2)~~ | **done** — legacy discovery cleanup |
| D4 | Organizer-dense spacing pass (optional) | Separate from member `dc-*` chrome |
| D5 | Remaining `c2k-*` in CSS variables (optional) | Gradual; `check:dc-classes` only guards TSX utilities |
| D6 | UX walkthrough backlog (optional) | [`UX_WALKTHROUGH_AUDIT.md`](./UX_WALKTHROUGH_AUDIT.md) — triage P1/P2 |

---

## 4. What not to build next (hard rejects)

From [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md):

- Stripe / guest checkout / second forum stack
- Apple native app before PWA + web alpha
- Algorithmic “For You” as default home (engagement-first)
- Duplicate calendar or convention models
- Inline ML moderation or digest in route handlers (use BullMQ)

---

## 5. Documentation maintenance

When you ship a vertical, update **in the same PR**:

1. [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) — routes, env, status
2. [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) — backlog row + “Recently shipped”
3. This file — move items from §3 to §2 if complete
4. [`HANDOFF.md`](./HANDOFF.md) — one dated paragraph for the next engineer

---

## 6. Quick command reference

```bash
# Dev stack
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api
npm run db:seed -w @c2k/api
npm run dev

# Quality gates
npm run typecheck
npm run check:dc-classes -w web
npm test
npm run test:e2e

# Worker (digests, people sync, moderation)
npm run start:worker -w @c2k/api
```

Demo login: **`RopeDreamer`** / **`demo`** — [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md).

---

*Maintainers: treat this roadmap as the narrative source for “what’s next”; keep [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) as the operational backlog table.*
