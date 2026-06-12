# Desktop Sprint 1 — Mobile Safety Report

**Status:** Template — fill at Sprint 1 completion  
**Principle:** Desktop improvements must be additive, not a replacement of the mobile system.

## Summary

| Metric | Value |
|--------|------:|
| Mobile-protected components touched | _TBD_ |
| Confirmed mobile regressions | _TBD_ |
| Regressions fixed in sprint | _TBD_ |
| Risks deferred | _TBD_ |

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
