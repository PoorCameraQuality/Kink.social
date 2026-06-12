# Mobile Visual Fix Batch 5

**Scope:** People directory, Presenters & authors, Policy Hub, Organization public page — humanization, card hierarchy, bottom-nav clearance, demo data.  
**Verification:** Intentionally **not run** (Brax sign-off required for typecheck, build, audits, tests).

## Global: bottom nav clearance

| Change | File |
|--------|------|
| Increased `--c2k-mobile-breathing` to `2.5rem` (40px) for all `#main-content` nav clearance | `packages/web/src/app/globals.css` |
| Org cover fallback pattern | `packages/web/src/styles/mobile-polish.css` (`.c2k-org-cover-fallback`) |

Main padding remains the single source of truth via `RootLayout` → `mobileMainPadClass()` (Batch 3/4).

## 1. People directory

| Change | File |
|--------|------|
| `PersonAvatar` — initials + gradient fallback | `packages/web/src/components/PersonAvatar.tsx` |
| Card hierarchy: overflow top-right, quiet View profile, Connect primary, recommended ring | `FindPeopleProfileCard.tsx` |
| FilterSheet + DirectoryFilterButton (active count), search + sort row | `FindPeopleDiscoverPage.tsx` |
| Hide panel footer when sheet owns Apply | `FindPeopleFiltersPanel.tsx` |
| Filter audit* usernames from display (UI only) | `useApiPeopleSearch.ts`, `people-directory-utils.ts` |
| Richer mock bios + context counts | `mock-seeds.ts` |
| `countPeopleActiveFilters()` | `people-directory-utils.ts` |

## 2. Presenters & authors

| Change | File |
|--------|------|
| Intro action card + primary/secondary CTAs | `presenters/page.tsx` |
| Horizontal expertise chips | `presenters/page.tsx` |
| Premium card layout, PersonAvatar, primary View profile | `PresenterCard.tsx` |
| Footer “Browse Education” CTA card | `presenters/page.tsx` |
| Removed prominent “Limited feedback” line | `PresenterCard.tsx` |

## 3. Policy Hub (light polish)

| Change | File |
|--------|------|
| Mobile category jump chips (Agreements, Safety, Legal, Community, Organizers) | `policies/page.tsx` |
| Softer draft banner, tighter mobile card padding | `policies/page.tsx` |
| Legal copy unchanged | — |

## 4. Organization public page

| Change | File |
|--------|------|
| Richer no-cover hero gradient, shorter mobile cover | `OrgCommunityShell.tsx` |
| Organizer stat chip when `canModerate` | `OrgCommunityShell.tsx` |
| Mobile section order via flex `order` (events → welcome → forums → modules → reviews) | `OrgHubClient.tsx` |
| Compact “Your first week here” checklist module | `OrgCommunityModules.tsx` |

## Files changed (summary)

```
packages/web/src/app/globals.css
packages/web/src/styles/mobile-polish.css
packages/web/src/components/PersonAvatar.tsx
packages/web/src/components/find-people/FindPeopleProfileCard.tsx
packages/web/src/components/find-people/FindPeopleFiltersPanel.tsx
packages/web/src/app/discovery/FindPeopleDiscoverPage.tsx
packages/web/src/hooks/useApiPeopleSearch.ts
packages/web/src/lib/people-directory-utils.ts
packages/web/src/data/mock-seeds.ts
packages/web/src/components/cards/PresenterCard.tsx
packages/web/src/app/presenters/page.tsx
packages/web/src/app/policies/page.tsx
packages/web/src/components/org/OrgCommunityShell.tsx
packages/web/src/components/org/OrgCommunityModules.tsx
packages/web/src/app/orgs/[slug]/OrgHubClient.tsx
docs/audits/ui/MOBILE-VISUAL-FIX-BATCH-5.md
```

## Manual smoke (360 / 390 / 430)

- `/people` — no audit usernames; Filters button + count; first Recommended card highlighted; cards clear bottom nav
- `/presenters` — intro card, horizontal tags, cards not clipped by nav
- `/policies` — jump chips scroll to sections; draft banner subdued
- `/orgs/:slug` — hero gradient; events above welcome on mobile; checklist compact

## Verification to run when Brax approves

```bash
npm run typecheck
npm run build
npm run audit:ui-preflight
npm run audit:ui-architecture
npm test
```

These commands were intentionally not run because Brax did not approve expensive verification for this batch.

## Constraints preserved

- Bottom nav: Home, Explore, Events, Messages, Me
- Create remains FAB/sheet
- OnboardingGate / backend unchanged (audit filter is client display only)
- Report, block, privacy, moderation, safety controls retained
