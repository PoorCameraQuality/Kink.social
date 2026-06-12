# Community Reputation & Public Trust — Master Plan

**Last updated:** 2026-06-06  
**Status:** Alpha hardening complete (2026-06-06) — backend frozen for UI sprint; event/convention standing APIs live; messaging contact-after rollups real; finding→`trust_signal_events` wired; DB gates green  
**Companion:** [`REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md`](./REPUTATION_TRUST_SIGNAL_SYSTEM_AUDIT.md) · [`SCOPED_COMMUNITY_ACCOUNTABILITY_PLAN.md`](./SCOPED_COMMUNITY_ACCOUNTABILITY_PLAN.md) · [`../../FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md)

---

## Design principle

| Lane | Purpose | Visibility |
|------|---------|------------|
| **Community Trust** (public) | Earned, positive, factual credibility | Member-visible badges and context — **no numeric score, no negative labels** |
| **Safety Standing** (private) | Patterns, confirmed findings, restrictions | Platform/scoped moderators only |

**Feedback → Signals → Enforcement** — subjective input must not directly become punishment.

---

## Dangerous legacy paths (deprecated)

| Path | Risk | Phase 0 status |
|------|------|------------------|
| `profiles.trust_score` (−100..100) | Public mob-rule score | Column retained; **not extended**; removed from public serializers/UI |
| `POST /api/v1/reputation/peers` (±1) | Peer downvotes lower score | **410 Gone**; `applyPeerReputationVote()` no-op |
| Auto `identity_bans` when score &lt; 0 | Automated permanent punishment | **Disabled**; site-admin route unchanged |
| Surge → `profile_review_flags` from peer votes | Feedback → enforcement | **Disabled** with vote freeze |
| Reputation threshold in people discovery | Public shaming/filtering | **Removed** from UI and client filters |
| `TrustRing` numeric display | Implies public safety score | **Hidden** on key surfaces; component retained for later badge ring |

Historical `profile_reputation_events` rows are **not deleted** (audit/migration).

---

## Phase map

| Phase | Goal | Status |
|-------|------|--------|
| **0** | Freeze unsafe legacy score/votes/auto-ban | ✅ **Done** |
| **1** | Public Community Trust (card, badges, API) | ✅ **Done** — `GET /api/v1/users/:id/community-trust`, `CommunityTrustCard`, chips on people/DM/member cards |
| **2** | Private moderator Trust Summary | ✅ **Done** — extended summary + `ModerationTrustSummaryPanel` + incident cluster panel |
| **3** | Scoped community standing | ✅ **Alpha** — org/group/event/convention GET/PATCH standing via `scoped-standing-targets.ts`; `ScopedMemberStandingPanel` supports all scopes |
| **4** | Scoped consequence ladder (org/group/event/conv parity) | ✅ **Alpha** — hide/lock routes exist for event forum + convention hub chat; group/org ban `durationHours` + `escalateToPlatform` |
| **5** | Serious category routing to platform T&S | ✅ **Alpha** — `isPlatformCriticalPolicyReason` on incident create |
| **6** | Incident clustering + anti-dogpile | ✅ **Alpha** — intake clustering; mod case panel; duplicate reporter dedupe |
| **7** | Messaging health rollups + cooldowns | ✅ **Alpha** — block/mute/report-after-contact computed from messages/blocks/mutes/reports |
| **8** | Anti-retaliation + mod abuse protections | ✅ **Alpha** — `ORGANIZER_RETALIATION_REVIEW_RECOMMENDED` signal |
| **9** | Appeals, decay, recovery | ⚠️ **Alpha** — scoped appeals file/resolve; `trust-decay-sweep` scheduled; messaging appeal via platform TBD |
| **10** | Docs, registry, visibility matrix | 🔄 Updated in this pass |
| **11** | Tests + verification gates | ✅ Unit + prelaunch green; DB slice needs `USE_DATABASE=true` |

---

## Phase 1 — Public Community Trust (next build)

### API (proposed)

`GET /api/v1/users/:userId/community-trust` — or extend existing public profile read if safer.

**Include (positive/factual only):**

- Account age band / member since
- Age affirmed
- Profile completion band
- Accepted references count (ACCEPTED only)
- Staff-confirmed check-ins
- Presenter / vendor / organizer participation counts
- Volunteer/staff credits where reliable
- “Known in this org/group” when visibility allows

**Never include:**

- Reports, open cases, block/mute counts
- Scoped bans, consent/safety findings, identity bans
- `trust_score`, negative labels, report volume

### Public trust levels (derived from positive signals only)

- New Member
- Building Trust
- Established Member
- Community Known
- Verified Contributor

### UI components (proposed)

- `CommunityTrustCard` — profile, people cards, DM header (limited context)
- `TrustBadge` + `TrustBadgeTooltip`
- Replace static `ProfileTrustPanel` placeholder

### DM context (limited, factual)

Examples: shared org count, shared event attendance, reference count — never “low trust” or “under review.”

---

## Phase 2 — Private Trust Summary (implemented skeleton)

**API:** `GET /api/v1/moderation/users/:userId/trust-summary`  
**Auth:** `requirePlatformModerator`; org/group/convention mods **denied** unless `platform_staff`.  
**UI:** `ModerationTrustSummaryPanel` on `/moderation/cases/:caseId`

**Implemented aggregates:** account basics, positive participation, moderation context, scope bans, blocks/mutes (counts only), identity ban (site admin only).

**Placeholders (`status: unavailable`):** messaging health, incident clustering, appeals.

**Excluded:** `trust_score`, reporter identities, raw report text, PM bodies, restricted-queue counts (non–site-admin).

---

## Visibility matrix

| Audience | May see |
|----------|---------|
| **Public** | Positive/factual badges only |
| **Affected user** | Active restriction notice, reason category, duration, appeal path |
| **Scoped mods** | Local standing, incidents, warnings, scoped restrictions |
| **Platform mods** | Cross-scope summary, messaging health, clusters, escalation |
| **Site admin** | Restricted/legal queue, identity bans, minor-safety restricted details |

---

## Permission matrix (summary)

| Action | Public | Scoped mod | Platform mod | Site admin |
|--------|--------|------------|--------------|------------|
| View Community Trust | ✅ | ✅ | ✅ | ✅ |
| View Trust Summary | ❌ | ❌ | ✅ | ✅ |
| Peer ±1 vote | ❌ (deprecated) | ❌ | ❌ | ❌ |
| Identity ban | ❌ | ❌ | ⚠️ via T&S process | ✅ |
| Scoped ban/timeout | ❌ | ✅ in scope | ✅ | ✅ |

---

## Test plan (Phase 11)

| Area | Tests |
|------|-------|
| Legacy freeze | `peer-reputation-phase0.test.ts`, `trust-summary-phase0.test.ts` (DB) |
| Public leakage | Static serializer checks; no `authorTrustScore` in feed/bookmarks |
| Community Trust (Phase 1) | Badge sources only; new user = limited history not low trust |
| Trust Summary | Auth gates; no PII leakage; restricted hidden from non–site-admin |
| Scoped standing (Phase 3+) | Per-scope ladder, `expires_at`, audit |
| Incident clustering (Phase 6) | Multi-report → one incident; no stacked penalties |
| Messaging health (Phase 7) | Rollups private; cooldown no public label |

**Verification:** `npm test`, `npm run build`, `npm run verify:prelaunch`, `npm run verify:trust-safety` (Docker + DB), `npm run verify:trust-safety:admin-ui`, `npm run test:e2e:trust-safety` (optional).

---

## Deferrals (do not build yet)

- Public numeric reputation score or TrustRing-as-score
- Badges driven by reports/blocks/mutes
- Automated identity bans from reputation math
- Local organizer feedback → global punishment without escalation
- Full incident clustering schema
- `messaging_health_rollups` table
- Appeals workflow beyond skeleton
- Group moderation UI parity (Phase 4)

---

## Recommended implementation order

1. ✅ Phase 0 — legacy freeze  
2. **Phase 1** — Community Trust API + `CommunityTrustCard`  
3. **Phase 2** — extend Trust Summary (messaging health, clusters when tables exist)  
4. **Phases 3–4** — scoped standing + consequence ladder  
5. **Phases 5–6** — serious routing hardening + incident clustering  
6. **Phase 7** — messaging health  
7. **Phases 8–9** — anti-retaliation, appeals, decay  
8. **Phases 10–11** — docs/registry/verification maintenance
