# Desktop Sprint 1 — Mobile Safety Report

**Status:** Checkpoint 4 complete — see below  
**Principle:** Desktop improvements must be additive, not a replacement of the mobile system.

## Checkpoint 1 (complete)

| Change | Breakpoint gate | Mobile impact |
|--------|-----------------|---------------|
| `RootLayout` unmounts `BottomNav` + `CreateFab` when viewport ≥ md | `useMaxMd()` | Mobile `< md` unchanged |
| Header `appHomeMainNav` shows at `md:flex` (was `lg:flex`) | 768–1023 handoff | Browse links available on tablet; mobile still uses bottom nav below md |
| `HomeFeedScopeNav` extracted; desktop row at `lg+` in `HomePageClient` | `lg+` only | `CommunityNavBar` still `lg:hidden` for mobile/tablet feed tabs |
| `HomeDashboardLeftRail` `omitHomeLink` on desktop 3-col | `lg+` only | Full rail unchanged below lg |
| Audit heuristic uses computed visibility for bottom nav | audit script only | N/A |

## Checkpoint 2 (complete)

| Change | Breakpoint gate | Mobile impact |
|--------|-----------------|---------------|
| Organizer `--organizer-panel-bg` / status vars bridge to `--dc-*` with hex fallbacks | `:root` CSS vars; organizer routes only | **None** — no mobile spacing, padding, typography, or nav touched |
| Token docs + deprecated root `tailwind.config.js` | docs / config comments only | N/A |

**Mobile layout primitives:** unchanged. No edits to `mobile-polish.css`, bottom-nav clearance utilities, card padding, or feed layout.

## Checkpoint 3 (complete)

| Change | Breakpoint gate | Mobile impact |
|--------|-----------------|---------------|
| `shell-contract.ts` + Tailwind `max-w-shell-wide` / `max-w-shell-feed` | `lg:` only for width expansion | **None** below lg — still `max-w-7xl` + same gutters |
| `AppShell`, `Header` (member), `DirectoryTemplate`, `PersonalUtilityPageShell` | `lg+` width tokens | **None** — mobile padding and grids unchanged |
| Priority routes: home, people, messaging, profile, settings | `lg+` outer shell | **None** — inner grids and mobile markup untouched |

## Checkpoint 4 (complete)

| Change | Breakpoint gate | Mobile impact |
|--------|-----------------|---------------|
| `/people` migrated to `DirectoryTemplate` | Same grid/slots as manual 3-col; `desktopAsideFrom="lg"` | **None** — custom header, FilterSheet, scope tabs, card grid, and `mobileCompact` unchanged |
| `DirectoryTemplate.desktopAsideFrom` prop | Optional; Events default `xl` unchanged | **None** on Events or mobile People |

## Summary

| Metric | Value |
|--------|------:|
| Mobile-protected components touched | 5 (CP1 only) |
| Confirmed mobile regressions | 0 (pending full screenshot pass at CP8) |
| Regressions fixed in sprint | 0 |
| Risks deferred | Tablet density at 768–1023 (browse + feed tabs) — monitor at CP8 |

## Components touched (mobile-relevant)

For each row: **why** it was touched, **breakpoint gate** (`lg+` / `md` handoff / shared primitive), and **mobile impact**.

| Component | File(s) | Why touched | Breakpoint gate | Mobile impact |
|-----------|---------|-------------|-----------------|---------------|
| _example: BottomNav_ | `BottomNav.tsx`, `RootLayout.tsx` | Unmount at md+ for audit/a11y tree | `useMaxMd()` — mobile unchanged | None if `< md` identical |
| | | | | |

## Protected components — not touched

Confirm unchanged unless listed above:

- [ ] BottomNav behavior below `md`
- [ ] Mobile Header drawer / menu
- [ ] Mobile composer (`HomeMobileComposer`, feed composer)
- [ ] Mobile feed cards and layout
- [ ] Mobile profile shell
- [ ] Onboarding wizard mobile layout
- [ ] Mobile settings layout / action bar
- [ ] Mobile event and directory cards
- [ ] `FilterSheet`, `CreateSheet`, `CreateFab`, mobile modals

## Screenshot matrix

Regenerate or verify at these widths for key routes.

| Route | 375 | 390 | 430 | 768 | 820 | 1024 | Notes |
|-------|-----|-----|-----|-----|-----|------|-------|
| `/home` | | | | | | | |
| `/explore` | | | | | | | |
| `/people` | | | | | | | |
| `/events` | | | | | | | |
| `/groups` | | | | | | | |
| `/messaging` | | | | | | | |
| `/notifications` | | | | | | | |
| `/profile` | | | | | | | |
| `/profile/edit` | | | | | | | |
| `/onboarding` | | | | | | | |
| `/settings/account` | | | | | | | |
| `/vendors` | | | | | | | |
| `/education` | | | | | | | |
| `/media` | | | | | | | |
| `/organizer` | | | | | | | |

Screenshot paths: `docs/audits/ui/screenshots/sprint-1-mobile-regression/` (create when capturing).

## Layout differences from pre-sprint

_Document any intentional visual delta at mobile/tablet widths. "None" is the expected answer._

## Regressions

### Found

| Route | Viewport | Issue | Severity |
|-------|----------|-------|----------|
| | | | |

### Fixed in sprint

| Route | Viewport | Fix |
|-------|----------|-----|
| | | |

### Deferred

| Route | Viewport | Risk | Reason deferred |
|-------|----------|------|-----------------|
| | | | |

## Horizontal overflow check

| Viewport | Overflow on key routes? |
|----------|-------------------------|
| 375 × 812 | |
| 390 × 844 | |
| 768 × 1024 | |
| 820 × 1180 | |

## Automated checks

| Command | Result |
|---------|--------|
| `npm run test:e2e:smoke` (mobile spec) | |
| `route-smoke.mobile.spec.ts` overflow guard | |

## Sign-off

- [ ] Mobile navigation unchanged below `md`
- [ ] Tablet handoff (768–1023) improved without mobile crowding
- [ ] Desktop goals met without mobile replacement
