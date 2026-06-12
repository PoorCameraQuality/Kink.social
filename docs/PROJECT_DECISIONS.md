# C2K project decisions (living)

**Purpose:** Stable decisions for Cursor workers and external reviewers. Update when product/legal posture changes — do not re-litigate in every session.

**Last updated:** 2026-06-06  
**Master plan:** [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](./LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md)

---

## Product & phase

- **Kink Social** (kink.social) is the public brand for an **organizer-first** adults-only community OS — not a FetLife clone. **C2K** remains the internal codename in repo, env, and packages.
- **Phase 1 (alpha):** Event Systems, door mobile, PWA, org onboarding — not Following-feed UI unless user explicitly overrides.
- **Organizer alpha beats Following/feed work** unless the user explicitly overrides.
- **Do not** build Apple App Store focus before PWA + web alpha.

## Brand & naming

| Layer | Name | Notes |
|-------|------|-------|
| **Public brand** | **Kink Social** | kink.social — authenticated community, organizer console, attendee runtime |
| **Internal codename** | **C2K** | Repo, packages (`@c2k/*`), env vars (`C2K_*`), worker queues — unchanged |
| **Organizer product** | **Dance Card by Kink Social** | Convention attendee weekend app + organizer program tooling on Kink Social |
| **Legacy SEO bridge** | **ECKE** (East Coast Kink Events) | Public discovery/listings only; outbound publish from Kink Social — not identity or registration |

## Feed UI (alpha)

- **Generic post reactions (visible):** Love, Respect, Sympathize, Helpful — `@c2k/shared` `feed-reactions.ts`.
- **Backend:** `post_likes.kind` — one reaction per viewer per post; `PUT/DELETE /api/v1/feed/posts/:id/reactions`.
- **Legacy like API** maps to **Love** (`POST/DELETE …/like`).
- **Comments:** `feed_post_comments` — `GET/POST …/comments`, `DELETE …/comments/:commentId`.
- **Public share:** `GET /api/v1/feed/posts/:id` + share page readable without sign-in; react/comment require auth.
- **Community actions:** Discuss, Repost, Share, Report — separate from reaction pills.
- **Do not** reintroduce Collar / Brilliant / Boost / Pass along on feed cards without an ADR.

## Trust & Safety posture

- **Alpha ship mode:** `MEDIA_POLICY_MODE=community_only`.
- **Explicit media remains OFF in alpha** (`C2K_ALLOW_EXPLICIT_MEDIA=false` in production).
- **`attested_explicit_beta`** is staging-only when deliberately enabled — not production default.
- **Public explicit media is not allowed.** `EXPLICIT_ADULT` + `PUBLIC_PREVIEW` is **coerced to `logged_in`** at attestation (intentional; regression in `media-assets.test.ts`).
- **Production scanners fail closed** — no silent noop pass in production.
- **Extend existing T&S stack** before adding parallel tables/routes (`extend-before-add`).
- **Scanners are signals** — human moderation decides escalation; no auto-NCMEC from classifier/OCR alone.
- **Internal hash lists are not CSAM databases** — do not label or market them as PhotoDNA/NCMEC replacements.

## Hard rejects (do not implement without explicit user approval)

- PhotoDNA / enterprise CSAM vendor integrations
- Live NCMEC API submission (placeholders only)
- Fake StopNCII / Take It Down integrations
- Full T&S UI-2 redesign (basic T&S-3.5 console exists)
- Explicit video uploads in alpha
- Public explicit media in alpha
- `presenter_users` / `vendor_accounts` / guest checkout / second forum stack
- Inline moderation ML or digest/sync in route handlers
- Apple App Store before PWA alpha

## Payments & commerce

- **No Stripe / payments table** in registration or alpha flows.
- `paidConfirmed` is organizer-only metadata — not consumer checkout.

## Identity & data minimization

- **One `users` row** — every write sets `user_id`.
- Do not collect real names, DOBs, government IDs, or precise location unless legally required later.
- No ID document storage internally.
- No adtech pixels; no third-party analytics on sensitive behavior.
- **Legal hold blocks deletion** — do not purge records under active `legal_holds`.

## Architecture

- Side effects (email, sync, push, moderation jobs) → **BullMQ after commit**, not inline in routes.
- New table last: column → JSONB → pattern row → new table.
- Schema apply: prefer **`db:migrate-incremental`** over `db:push` (known drizzle-kit Zod warning on expression indexes).
- WS scope changes require `authorizeWebSocketSubscribe` update in same commit.
- New notification types → register in `@c2k/shared` before routes/UI.

## Anti-fiddling rule (alpha pivot)

Build **only** if the work satisfies **one** of:

1. **Blocks alpha launch**
2. **Reduces legal/safety risk**
3. **Needed by a real pilot organizer**
4. **Fixes failed verify/smoke**
5. **Removes a manual process that breaks during a live event**
6. **Makes a built feature usable for real users**

Otherwise → [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) or product backlog — **do not implement** in autonomous loops.

**Corollary:** LEGAL-ALPHA-1 is **frozen** after manual smoke pass. **SCOPED-MOD-1 complete (2026-06-06)** — moderation alpha pass; see T&S-5 in [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md).

**Exception:** MEDIA-MOD-MINIMUM — platform media case **viewer + asset actions** when profile/gallery/media reports are live. Case/triage without quarantine view or remove is not usable moderation; this is not SCOPED-MOD-1 and not legal/policy fiddling. **Shipped** — see `media-mod-minimum.test.ts`.

## Verification before claiming “done”

For **code** tasks, workers should keep green (unless explicitly docs-only):

```bash
npm run verify:trust-safety
npm run verify:prelaunch
npm test
npm run build
```

**Docs-only sync** (batched critical doc updates): grep/read against `server.ts`, `router.tsx`, `worker.ts`, `package.json` — no test/build required.

## Next planned work (post T&S-5)

| Priority | ID | Action |
|----------|-----|--------|
| **P0** | LEGAL-ALPHA-1 | **Manual smoke** (owner) — [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md); then **freeze** |
| **P1** | UI-DISC-* | Discover nav/Create/search consolidation — [`UX_REFACTOR_BACKLOG.md`](./UX_REFACTOR_BACKLOG.md) Track D |
| **P1** | Community Reputation Phase 0 | **Next T&S branch** — audit only — [`audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md`](./audits/trust-and-safety/REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md) |
| **P2** | SG-* | One social-graph ID per PR — [`SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md`](./SOCIAL_GRAPH_FETLIFE_PARITY_BACKLOG.md) |
| **deferred** | PILOT-MAIL / PILOT-ORG | Blocked until hosting — [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) |

---

*Add dated entries below when decisions change.*

| Date | Decision |
|------|----------|
| 2026-06-05 | Legal profile foundation + T&S-4B complete; alpha `community_only`; anti-fiddling rule added |
| 2026-06-05 | **MEDIA-MOD-MINIMUM** shipped — platform media quarantine viewer + asset actions (`media-mod-minimum.test.ts`) |
| 2026-06-06 | **SCOPED-MOD-1 / T&S-5 complete** — unified report intake, scoped mod parity; UGC gap audit satisfied via [`UGC_REPORT_SURFACE_AUDIT.md`](./audits/trust-and-safety/UGC_REPORT_SURFACE_AUDIT.md) |
| 2026-06-06 | Docs sync session — backlog queue drained; next product work: LEGAL-ALPHA-1 owner smoke, then **`UI-DISC-*`** or Community Reputation Phase 0 on a new branch |
| 2026-06-06 | **Kink Social rebrand** — public brand at kink.social; C2K internal codename; Dance Card by Kink Social; ECKE legacy SEO bridge only |
