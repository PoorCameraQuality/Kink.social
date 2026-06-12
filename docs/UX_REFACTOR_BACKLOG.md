# UX Refactor Backlog

**Last updated:** 2026-06-12 (`UI-DISC-*` **done**; prod doc sync pass 26)

## Purpose



Execution backlog and ownership matrix for the phased 12-agent UI/UX refactor.



## Wave 0 contract



1. Canonical global stylesheet entrypoint is `packages/web/src/app/globals.css`.

2. `docs/C2K-DESIGN-SYSTEM.md` is in-repo and linked from planning docs.

3. Agents must only edit files in their owned slice.

4. No broad rewrite PRs; each slice is vertical and test-gated.



## File ownership matrix



| File / area | Owner agent |

|-------------|-------------|

| `globals.css`, `tailwind.config.js` | A01 only |

| `components/ui/Button|TextInput|FormField|Badge` | A02 only |

| `StatusBanner|LoadErrorBanner|EmptyState` | A03 only |

| `Card|MediaCard`, `components/cards/*` | A04 only |

| `CommunityHubShell`, group/org shells, `TabButton` | A05 only |

| `Header|Footer|BottomNav|site.config` | A06 only |

| `app/settings/*`, `useSettingsBundle` | A07 only |

| `useHomeSurface`, `HomePageClient` data refactor | A08 only |

| `components/home/*`, `FollowingFeedTab` styling | A09 only |

| `conventions/[slug]/panels/*`, `useConventionHub` | A10 only |

| `organizer/ui/*`, one convention panel | A11 only |

| `e2e/*`, backlog docs, stale `src/app/` cleanup | A12 only |



## Discover refresh consolidation (2026-06-01 → 2026-06-06 audit)



**Progress doc:** [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) — shipped surfaces, preview URLs, remaining NAV/WIR/POL debt.



| ID | Status | Priority | Scope |

|----|--------|----------|-------|

| UI-DISC-1 | **done** | P0 | Unify `ExploreSubNav` vs `CommunityNavBar` on all discover routes — `showExploreSubNav()` retired (`explore-page-layout.ts`); `CommunityNavBar` is home-only (Following / Near you / Trending, mobile); discover pages hide community nav via `*-page-layout.ts` and use top nav + page left rails |

| UI-DISC-2 | **done** | P0 | Deduplicate Create + search — Header **+ Create** owns global create; `?create=group` opens Groups modal; header search people-only, hidden on scoped-search routes (`discover-nav-policy.ts`); page search owns list filters |

| UI-DISC-3 | **done** | P0 | Home discover tabs vs standalone routes — `?tab=Events|Groups|…` redirects to `/events`, `/groups`, etc.; home left rail links to standalone directories |

| UI-DISC-4 | **done** | P1 | Wire or hide Find people geo; conventions distance; events list bookmarks — people **country/city** client filter wired (`rankPeople` + `FindPeopleFiltersPanel` honesty); removed dead convention geo state; event category counts show **0** when no live count (no fake backfill); events list save already wired (`EventSaveButton` → `useApiBookmarks`); **followup:** Near you → `GET /connections/suggested?source=nearby` still client-side mock distance |
| UI-DISC-5 | **done** | P1 | Replace stub nav empty states / fake invitation counts — conventions notifications **Soon** chip; education hub honest when API-backed (`apiBacked` prop, mock paths/educators hidden, fake endorsement count removed, Follow disabled); Groups personal sections already honest |
| UI-DISC-6 | **done** | P2 | Remove legacy discovery components — deleted `ExploreDiscoverShell`, `ExploreSubNav`, `DiscoveryPeopleFilters`; removed `showExploreSubNav()` from `explore-page-layout.ts`; mobile filter drawers already shipped on discover pages |

| UI-CLEAN-5 | **done** | P1 | Feed card vocabulary + nav honesty — Love/Respect/Sympathize/Helpful reactions; Discuss/Repost/Share/Report actions; remove Collar/Brilliant/Boost/Going from generic posts; composer event link fix; mobile nav; discover rail trending link — see [`UI_CLEANUP_REGISTRY.md`](./UI_CLEANUP_REGISTRY.md) Wave 5 |

| UI-CLEAN-6 | **done** | P1 | Member hub honesty — Saved per-filter CTAs; composer Photo; mobile CommunityNavBar; events badges; groups join copy; Connect API; organizer gate; Discuss routing; dead rails — Wave 6 |



## Seeded debt items (from UX walkthrough Appendix A + current audit)



| ID | Status | Priority | Scope |

|----|--------|----------|-------|

| G2 | done | P1 | Remove/wire `navSecondary` mock counts in `site.config.ts` |

| G3 | done | P2 | Deduplicate `navMore` vs `navPrimary` |

| H1 | done | P2 | Home live-vs-demo indicator |

| H2 | done | P3 | Unified empty-state next-steps usage |

| P1 | done | P1 | Settings/profile local override warning copy |

| S1 | done | P3 | Settings moderation tools subsection label |

| C1 | done | P2 | Convention manage breadcrumb/backlink |

| UX-R1 | done | P1 | Consolidate duplicate global style entrypoints |

| UX-R2 | done | P2 | Card pattern dedupe via shared card primitives |

| UX-R3 | done | P1 | Move home mock/API branching into boundary hook |

| UX-R4 | done | P1 | Start convention page decomposition into panel files |



## Regression gates



- `npm run typecheck`

- `npm test -w @c2k/api`

- `node scripts/pilot-readiness-smoke.mjs`

- `npx playwright test`


