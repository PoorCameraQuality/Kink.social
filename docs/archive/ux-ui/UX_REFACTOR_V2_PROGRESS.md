# ECKE Visual Overhaul V2 — progress

Reference: [ADR 004](./adr/004-ecke-member-presentation-layer.md), [C2K-DESIGN-SYSTEM.md](./C2K-DESIGN-SYSTEM.md).

## Done

| Wave | Scope |
|------|--------|
| V2-0 | `DancecardAppearanceProvider` (midnight-brass default), `dancecard-motion.css`, skeletons, Settings appearance, ADR |
| V2-1 | Header, Footer, BottomNav, MockDataBanner |
| V2-2 | `SectionHeader`, `TabShell`, `ContentPanel`, `TabButton` ECKE active state |
| V2-3 | Home, settings panels, convention program panel, `CommunityHubShell` |
| V2-4 | Shared `Card` / `EmptyState` / `Badge` / `TextInput`; bulk `c2k-*` → `dc-*` migration (`npm run migrate-dc -w web`); discovery + messaging skeletons |
| V2-5 | `check:dc-classes` CI; Playwright appearance tests; privacy copy |
| V2-6 | **Home IA:** `CommunityNavBar` in `RootLayout`; `community-nav.ts`; `LocalHomeFeed`; `ConventionCard` ≈ `EventCard`; removed duplicate home tab/browse rows |
| V2-7 | **Discover refresh shells (2026-06-01):** Events, Groups, Conventions, Find people, Education overview — 3-col mockup layouts, `*-page-layout.ts`, `ExploreSubNav` on some routes; feed reactions + themes. **Consolidation backlog:** [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md) |

## Optional follow-ups

- Organizer-dense panels: tune spacing separately from member chrome
- `data/mock-seeds.ts` image URL seeds still contain `c2k-` in strings (not CSS)
- Home: convention hubs row only when actionable; `/events` vs home tab consolidation — tracked as **UI-DISC-3** in [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md)
- Discover refresh: duplicate nav/Create/search (**UI-DISC-1**, **UI-DISC-2**)

## Verify

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:seed -w @c2k/api
npm run dev
```

- http://localhost:5173 — landing + login
- http://localhost:5173/home?mode=discover&tab=Local — Near you + persistent browse nav
- http://localhost:5173/home?mode=following — Following feed
- http://localhost:5173/settings — appearance + panels
