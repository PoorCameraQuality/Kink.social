# QA tester guide (C2K web)

**Last updated:** 2026-06-06 (moderation routes, verify commands vs `package.json`)

Quick reference for beta and pilot testers. Covers wayfinding conventions (G1), home feed data sources (G4), messaging surfaces (N1), and platform moderation (N2).

**Alpha environment:** **https://kink.social** is a **public-facing alpha** test server — anyone may browse. It is **not** final public launch: expect bugs, incomplete areas, and fictional seeded test data in some surfaces. Structured QA: [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md). Operator prep: [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md).

**Related:** [`docs/WAYFINDING.md`](./WAYFINDING.md) · [`docs/FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) · [`docs/PILOT_READINESS.md`](./PILOT_READINESS.md) · [`docs/ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) · [`docs/VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) · [`docs/E2E.md`](./E2E.md) · [`docs/SMOKE_CHECKLIST.md`](./SMOKE_CHECKLIST.md)

**Automated coverage:** `npm run test:e2e` (full Playwright matrix) · `npm run verify:alpha` (local alpha gate) · `npm run audit:ui-inventory` (static route table in [`audits/ui/generated/ROUTES_TABLE.md`](./audits/ui/generated/ROUTES_TABLE.md))

---

## G1 — Wayfinding: breadcrumbs vs back link vs URL tabs

C2K uses three different navigation patterns. Pick the one that matches how the user got there.

### URL tabs (`?tab=`)

**Use when:** the page has multiple sections the user should bookmark or share.

| Surface | Param | Example |
|---------|-------|---------|
| Home feed | `tab=` | `/home?tab=Local` · `/home?tab=Events` |
| Home mode | `mode=` | `/home?mode=following` · `/home?mode=discover` |
| Org hub | `tab=` | `/orgs/demo-east-collective?tab=Calendar` |
| Group detail | `tab=` | `/groups/{uuid}?tab=Forums` |
| Convention (attendee hub) | `tab=` | `/conventions/preview-c2k-weekend?tab=Schedule` · `/conventions/seed-demo-con-program?tab=Schedule` |
| Organizer console | `tab=` | `/organizer/orgs/demo-east-collective?tab=schedule` · `?tab=people` · `?tab=communications` |
| Organizer convention | `tab=` | `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend?tab=dashboard` |

**What to test:** changing tabs updates the URL; refresh and share links land on the same tab.

### Breadcrumbs

**Use when:** the user navigated **down a hierarchy** and needs a labeled path back up (not a generic “Back”).

| Pattern | Example |
|---------|---------|
| Organizer → org → convention Manage | Convention page with `?organizerOrg=` shows breadcrumb to org Schedule |
| Group header → parent org | Group detail links to `/orgs/{slug}` |

**What to test:** breadcrumb labels match the parent context (org name, “Organizer console”); clicking returns to the correct parent, not always `/home`.

### Back links

**Use when:** the flow is **linear** or there is no stable parent in the information architecture.

| Pattern | Example |
|---------|---------|
| Profile edit | “Back to profile” |
| Education article | “← Back to Education” |
| Legal / policy pages | “Back to home” on `/privacy`, `/terms`, `/guidelines`; hub at `/policies` |
| 404 | Home + Advanced Search |
| Onboarding wizard | Back between steps |

**What to test:** back target is specific (not always home) on edit/wizard flows. Hub pages with tabs should **not** rely on Back alone — use breadcrumb + tabs instead.

### Quick decision table

| Situation | Pattern |
|-----------|---------|
| Multi-section hub (org, group, convention, organizer) | URL tabs (+ breadcrumb when nested under organizer) |
| Nested admin / manage context | Breadcrumb |
| Single-purpose form or article | Back link |
| Global marketing / legal draft | Back to home |

Full detail: [`docs/WAYFINDING.md`](./WAYFINDING.md).

---

## G4 — Home mock / API matrix (`VITE_HOME_DEMO_FALLBACK`)

The home feed (`/home`), events list (`/events`), and vendors list (`/vendors`) can show **live API data** or **sample mock catalogs**. Behavior depends on sign-in state and one build-time flag.

### Environment flag

| `VITE_HOME_DEMO_FALLBACK` | Set where | Production |
|---------------------------|-----------|------------|
| unset or `false` | Default | **Required** — prod builds must use `false` |
| `true` | `.env.development` or `.env.local` (repo root) | Do not enable in production |

Implementation: `packages/web/src/hooks/useHomeSurface.ts`, `HomePageClient.tsx`, `events/page.tsx`, `vendors/page.tsx`.

### Matrix — what you should see

| Viewer | `VITE_HOME_DEMO_FALLBACK` | `/home` data source | `/events` & `/vendors` |
|--------|---------------------------|----------------------|-------------------------|
| **Guest** (not signed in) | `false` | Mock/sample rails for layout; Local tab → sign-in CTA | Mock catalog while API loads or on failure; empty after API 200 with no items |
| **Guest** | `true` | Mock catalogs fill empty rails (dev banner may show “Sample catalogs”) | Mock catalog used as demo fallback |
| **Signed in** (real session, not demo viewer) | `false` | **API only** — empty sections stay empty on empty 200 | **API only** — honest empty states |
| **Signed in** | `true` | **Still API only** — flag is gated to guests only | **Still API only** |
| **Demo / fallback viewer** (`isFallback`) | any | Sample browsing mode banner; not a DB session | Same — treat as guest sample mode |

### Headline indicators (signed-in, dev)

When signed in with a real local session, `/home` may show a one-line status under the hero:

| Message | Meaning |
|---------|---------|
| “Live home — empty sections mean the API returned no rows…” | API-backed; empty rails are real empties, not demo backfill |
| “Demo backfill (VITE_HOME_DEMO_FALLBACK)…” | Should **not** appear for signed-in users (if it does, file a bug) |
| “Loading your home feed from the API…” | Session ready; API requests in flight |

### Dev banners (`MockDataBanner`)

Visible only in `NODE_ENV=development`:

| Banner | When |
|--------|------|
| **Sample browsing mode** | Not signed in (`isFallback`) |
| **Sample catalogs** | Guest + `VITE_HOME_DEMO_FALLBACK=true` |
| **Local development** | Signed in to dev server |

### Test scenarios

1. **Pilot / staging:** confirm `VITE_HOME_DEMO_FALLBACK=false`; sign in; verify empty home rails show empty states, not mock IDs like `g1`.
2. **Local demo screenshots:** set `VITE_HOME_DEMO_FALLBACK=true`; stay **signed out**; confirm sample event/vendor cards appear.
3. **Signed-in regression:** with flag `true`, sign in — rails must still come from API, not mock backfill.
4. **Guest Local tab:** unsigned user should see sign-in / Discovery CTA, not a fictional rich feed (unless demo fallback fills other tabs).

### Other mock surfaces (unchanged by this flag)

Guests and legacy routes may still use mock data elsewhere: legacy group IDs (`g1`…), ComingSoon marketing routes, education/tags landing, demo viewer mode. See [`docs/FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) §2 hybrid notes.

---

## N0 — Activity inbox, conventions list, door camera (2026-06-01)

| Surface | URL | What to test |
|---------|-----|----------------|
| **Activity** | `/activity` | Signed-in unified timeline; filters All / Messages / Social / Requests; row opens correct destination |
| **Conventions directory** | `/conventions` | Multi-day list loads; card opens convention hub (e.g. `preview-c2k-weekend`, `seed-demo-con-program`) |
| **Home Media tab** | `/home?mode=discover&tab=Media` | Grid + link to `/media`; community nav highlights **Media** on `/media` |
| **Door camera** | `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend/door` | **Use camera** toggles scan on **HTTPS or localhost**; paste/wedge still works; mobile viewport required for door UX |

Playwright: `door.spec.ts`, `alpha-flows.spec.ts` (door auth + door-staff load). Sign-off checklist: [`UI_UX_COMPLETION.md`](./UI_UX_COMPLETION.md).

---

## N1 — Messaging vs `/chat` vs org Chat

C2K has **three different chat-related surfaces**. Testers should not expect one inbox to cover all of them.

### Quick map

| Surface | Route / location | What it is | Status |
|---------|------------------|------------|--------|
| **Messaging (DMs)** | `/messaging` · header/bottom nav **Messages** | Private inbox: **Main** (friends/accepted), **Requests** (pending DMs), **ISO** (ISO-board replies) | Live when signed in (API-backed) |
| **Global Chat** | `/chat` | Marketing placeholder for future site-wide chat rooms | **Coming soon** — CTA sends you to `/messaging` or `/orgs` |
| **Org Chat** | `/orgs/{slug}?tab=Chat` | Organization **group channels** (text/voice per org config); visible to members when org has chat enabled | Live on org hubs with `chatEnabled` |

### What to test

1. **`/chat`** — copy explains it is not wired; primary CTA → `/messaging`; secondary → `/orgs`.
2. **`/messaging`** — top banner distinguishes inbox folders from org Chat; conversations load from API when signed in (not org channels). If inbox fails with 500, run `npm run db:migrate-incremental -w @c2k/api` (`user_follows` table).
3. **Org hub Chat tab** — only on orgs with chat enabled; messages are **not** in `/messaging`; org disclaimer notes group chat is not private (moderators/admins can see).
4. **Wayfinding** — bottom nav **Messages** always opens `/messaging`, never org Chat or `/chat`.

### Common confusion (file a bug if you see this)

- Org channel messages appearing in `/messaging` inbox.
- `/chat` showing live rooms instead of Coming soon.
- Signed-in user with no org membership seeing org Chat tabs on `/orgs/{slug}` when chat is disabled for that org.

UI copy reference: [`packages/web/src/app/messaging/page.tsx`](../packages/web/src/app/messaging/page.tsx), [`packages/web/src/app/chat/page.tsx`](../packages/web/src/app/chat/page.tsx), org hub Chat tab in [`OrgHubClient.tsx`](../packages/web/src/app/orgs/[slug]/OrgHubClient.tsx).

---

## N2 — Platform moderation (2026-06-06)

Platform moderators (`C2K_PLATFORM_MODERATOR_USER_IDS`) use **`/moderation/*`** — separate from org/group scoped mod tabs on organizer consoles.

| Route | Purpose |
|-------|---------|
| `/moderation` | Index / landing |
| `/moderation/dashboard` | Overview |
| `/moderation/queues` | Queue list |
| `/moderation/cases` | Case list |
| `/moderation/cases/:caseId` | Case detail (media quarantine, actions) |
| `/moderation/reports` | Report intake backlog |
| `/moderation/profile-flags` | Profile review flags |
| `/moderation/actions` | Enforcement actions log |
| `/moderation/audit` | Audit trail |
| `/moderation/legal` | Legal/compliance tools |
| `/moderation/dmca` | DMCA workflow |
| `/moderation/admin` | Admin settings |

**Scoped mod (org / group / event / convention):** organizer console **Moderation** tab — same `ReportAction` intake as platform; see [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](./audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5.

**Automated T&S:** `npm run verify:trust-safety` · Playwright `e2e/moderation-ts.spec.ts`, `e2e/media-ts.spec.ts`, `e2e/legal-alpha-smoke.spec.ts`.

---

## Automated QA quick reference

| Goal | Command |
|------|---------|
| Refresh route inventory from app source | `npm run audit:ui-inventory` |
| Fast route + auth smokes | `npm run test:e2e:smoke` |
| Full Playwright matrix (**21** spec files) | `npm run test:e2e` |
| Local alpha gate (Docker + DB + Mailpit) | `npm run verify:alpha` |
| T&S unit + DB + admin checks | `npm run verify:trust-safety` |
| Manual demo pass | [`SMOKE_CHECKLIST.md`](./SMOKE_CHECKLIST.md) |

Seeded demo login: **`RopeDreamer`** / **`demo`**. Default slugs: org **`demo-east-collective`**, preview convention **`preview-c2k-weekend`**, program convention **`seed-demo-con-program`**.

---

*Update when a new multi-tab surface ships, mock boundaries change, or pilot env vars are finalized.*
