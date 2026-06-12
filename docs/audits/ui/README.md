# C2K UI & interaction QA system

**Last updated:** 2026-06-12 (UI architecture audit packet — `npm run audit:ui-architecture`)

Three layers — use together before staging, not page-by-page screenshots.

| Layer | Artifact | Command |
|-------|----------|---------|
| **0. Desktop architecture audit** | [`docs/UI_DESKTOP_ROUTE_INVENTORY.md`](../UI_DESKTOP_ROUTE_INVENTORY.md), [`UI_DESKTOP_COMPONENT_INVENTORY.md`](../UI_DESKTOP_COMPONENT_INVENTORY.md), [`UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md`](../UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md), [`UI_DESKTOP_SCREENSHOT_AUDIT.md`](../UI_DESKTOP_SCREENSHOT_AUDIT.md), [`UI_DESKTOP_REDESIGN_RISK_REPORT.md`](../UI_DESKTOP_REDESIGN_RISK_REPORT.md), [`UI_DESKTOP_IMPLEMENTATION_PLAN.md`](../UI_DESKTOP_IMPLEMENTATION_PLAN.md) | `npm run audit:ui-desktop` (requires dev stack for screenshots) |
| **0b. Mobile architecture audit** | [`docs/UI_ROUTE_INVENTORY.md`](../UI_ROUTE_INVENTORY.md), [`UI_COMPONENT_INVENTORY.md`](../UI_COMPONENT_INVENTORY.md), [`UI_MOBILE_AUDIT.md`](../UI_MOBILE_AUDIT.md), [`UI_DESIGN_SYSTEM_AUDIT.md`](../UI_DESIGN_SYSTEM_AUDIT.md), [`UI_REDESIGN_RISK_REPORT.md`](../UI_REDESIGN_RISK_REPORT.md) | `npm run audit:ui-architecture` (requires dev stack + Docker for full screenshots/mobile) |
| **1. Static inventory** | [`INTERACTION_REGISTRY.md`](./INTERACTION_REGISTRY.md), [`generated/ROUTES_TABLE.md`](./generated/ROUTES_TABLE.md) | `npm run audit:ui-inventory` |
| **2. Automated E2E** | **21** spec files in `e2e/`, `e2e/helpers/*` | `npm run test:e2e:install` then `npm run test:e2e` |
| **3. Human review** | [`MOBILE_UX_AUDIT.md`](./MOBILE_UX_AUDIT.md), [`MANUAL_QA_CHECKLIST.md`](./MANUAL_QA_CHECKLIST.md) | Manual on device + 390×844 |

## Static inventory (`audit:ui-inventory`)

Scans `packages/web/src/app` for routes and `packages/web/src` for `data-testid` controls.

```bash
npm run audit:ui-inventory
```

**Outputs** (under `docs/audits/ui/generated/`):

| File | Contents |
|------|----------|
| `ROUTES_TABLE.md` | Markdown table — route, access class, source `page.tsx` |
| `routes.json` | Machine-readable route list |
| `controls-summary.json` | Per-file `data-testid` scan |

Refresh after adding or renaming app routes. E2E smokes use a **curated** subset in `e2e/helpers/routes.ts` — not every generated route has a Playwright case.

## Interaction contract (source of truth)

Every workflow-critical control should have a row in **INTERACTION_REGISTRY** with:

```text
Role:
Starting state:
User action:
Expected API:
Expected immediate UI:
Expected persisted state after refresh:
Expected public-facing result:
Expected unauthorized behavior:
```

## Test IDs

Convention: `data-testid="[domain]-[screen]-[element]-[action]"`

Add only to primary actions, saves, publishes, destructive controls, and ambiguous icon buttons — not every `div`.

Current IDs are listed in the registry § Workflow-critical controls.

## E2E layout (21 spec files)

### npm script slices

| Script | Specs included |
|--------|----------------|
| `npm run test:e2e` | All `e2e/*.spec.ts` (desktop project runs full set; mobile project re-runs `route-smoke.mobile` + `door`) |
| `npm run test:e2e:smoke` | `route-smoke.desktop`, `route-smoke.mobile`, `auth` |
| `npm run test:e2e:alpha` | `alpha-routes`, `alpha-flows` |
| `npm run test:e2e:alpha-gate` | Smokes + alpha routes/flows + `door` + `moderation-ts` (**used by `verify:alpha:auto`**) |
| `npm run test:e2e:workflows` | `auth`, `organization`, `event-create`, `convention-dashboard`, `door`, `permissions`, `exports-integrations` |
| `npm run test:e2e:trust-safety` | `moderation-ts` |
| `npm run test:e2e:trust-safety:media` | `media-ts` |

**Alpha gate:** `npm run verify:alpha` → Docker + DB + dev + Mailpit + `verify:alpha:auto` (prelaunch, alpha-gate E2E, screenshots, pilot smokes). Full matrix remains `npm run test:e2e`. See [`docs/E2E.md`](../../E2E.md).

### Spec reference

| Spec | Purpose |
|------|---------|
| `route-smoke.desktop.spec.ts` | Major routes @ 1440×900, console/500 guard |
| `route-smoke.mobile.spec.ts` | Critical paths @ 390×844, overflow check |
| `smoke.spec.ts` | API health, home feed, calendar, events/groups, settings, PWA |
| `auth.spec.ts` | Login/logout/public vs organizer |
| `alpha-routes.spec.ts` | Pilot-critical route load set |
| `alpha-flows.spec.ts` | Onboarding, profile nudge, door auth, moderation panel, mobile overflow |
| `permissions.spec.ts` | API 401/403 contracts |
| `event-create.spec.ts` | Create flow modal + validation |
| `organization.spec.ts` | Org hub calendar + organizer console |
| `convention-dashboard.spec.ts` | Dashboard/program navigation, door link |
| `door.spec.ts` | Mobile door check-in (seeded `preview-c2k-weekend`) |
| `registration.spec.ts` | Public register UI |
| `mail.spec.ts` | Email confirm + Mailpit double opt-in |
| `feed-following.spec.ts` | Following feed pagination |
| `exports-integrations.spec.ts` | Exports tab, ECKE integrations |
| `messaging.spec.ts` | Global messaging + convention messaging tab |
| `people-signups.spec.ts` | Signups sub-tab |
| `program.spec.ts` | Program tab publish affordance |
| `moderation-ts.spec.ts` | Profile report + admin case review |
| `legal-alpha-smoke.spec.ts` | Policy routes, legal/DMCA admin, privacy settings |
| `media-ts.spec.ts` | Profile photo attestation/blur/report (trust-safety) |

**Route smoke catalog** (`e2e/helpers/routes.ts`): public (`/`, `/explore`, `/events`, `/groups`, `/education`, `/vendors`, `/people`, `/orgs`, `/conventions`, `/privacy`, `/terms`), authenticated (`/home`, `/saved`, `/settings`, `/notifications`, `/messaging`, `/connections`), organizer console + convention tabs + door. **Alpha routes** add `/profile/edit`, `/settings/account`, `/settings/privacy`, `/organizer`.

Helpers: `e2e/helpers/auth.ts`, `fixtures.ts` (seed slugs), `assertions.ts`, `routes.ts`, `viewports.ts`, `seed-users.ts`.

## Fix priority (Phase 7)

P0 security → P1 broken core workflow → P2 stale UI → P3 misleading/dead UI → P4 mobile polish.

Update registry **Current status** when fixing; do not change product behavior unless broken or misleading.

## Related docs

- [`docs/UI_CLEANUP_REGISTRY.md`](../../UI_CLEANUP_REGISTRY.md) — controls hidden/disabled in prior waves
- [`docs/FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) — routes and API map
- [`docs/PILOT_READINESS.md`](../../PILOT_READINESS.md) — alpha operator gate (supersedes prelaunch audit waves)
- [`docs/E2E.md`](../../E2E.md) — Playwright setup, env vars, full spec inventory
