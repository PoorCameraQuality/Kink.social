# Mobile Visual Fix Batch 6

**Scope:** Profile Studio mobile edit mode, member profile hierarchy, minor guest landing.  
**Verification:** Intentionally **not run** (Brax sign-off required for typecheck, build, audits, tests).

## Priority: Profile Studio mobile overlap

| Change | File |
|--------|------|
| Hide bottom nav on `/profile/edit/*` (focused edit mode) | `packages/web/src/lib/mobile-chrome.ts` |
| Main padding uses `c2k-onboarding-no-bottom-nav` (save bar at safe area, no nav stack) | `mobile-chrome.ts`, `RootLayout.tsx` (via existing helper) |
| Scroll padding: save bar + breathing + safe-area only (removed double nav clearance) | `ProfileEditLayout.tsx` |
| Compact mobile header; smaller title block | `ProfileEditLayout.tsx` |

**Formula (mobile Profile Studio):** `pb = save-bar-h + mobile-breathing + safe-area + 1.25rem`

## Profile Studio section navigation

| Change | File |
|--------|------|
| Horizontal chip row with fade edge | `ProfileEditTabNav.tsx` |
| Progress text: “Story · Section 1 of 8” | `ProfileEditTabNav.tsx` |
| Completed sections show ✓ on chips | `ProfileEditTabNav.tsx` |
| Tighter mobile inset card padding | `profile-studio-classes.ts`, `ProfileStudioSectionCard.tsx` |

## Profile Studio save bar

| Change | File |
|--------|------|
| `ProfileStudioSaveBar` → `MobileActionBar`: Discard, Save changes, Done | `ProfileStudioSaveBar.tsx` (unchanged API; bar sits at `bottom: 0` when nav suppressed) |

## Member profile (`/profile` Me page)

| Change | File |
|--------|------|
| Compact completion card on mobile (% + 2 steps + Improve profile) | `ProfileStudioStrengthCard.tsx` (`compact` prop) |
| Full checklist hidden on small screens; desktop coach rail unchanged | `ProfileStudioStrengthCard.tsx` |
| Story order: snapshot before strength; upcoming events before orgs | `ProfileStoryView.tsx` |
| Personality moved below community cards on mobile | `ProfileStoryView.tsx` |
| Profile tools before account hub; account hub collapsed on mobile | `ProfilePageClient.tsx`, `ProfileMeHub.tsx` |
| Profile tools: hide social sidebar on mobile; tighter section intro | `ProfileExtendedSection.tsx` |

## Guest landing (minor)

| Change | File |
|--------|------|
| “Swipe to explore” hint under product preview carousel | `LandingProductPreview.tsx` |
| Log in tab uses accent underline when active (parity with Join free) | `LoginCard.tsx` |

## Files changed (summary)

```
packages/web/src/lib/mobile-chrome.ts
packages/web/src/app/profile/edit/ProfileEditLayout.tsx
packages/web/src/components/profile/edit/ProfileEditTabNav.tsx
packages/web/src/components/profile/studio/profile-studio-classes.ts
packages/web/src/components/profile/studio/ProfileStudioSectionCard.tsx
packages/web/src/components/profile/studio/ProfileStudioStrengthCard.tsx
packages/web/src/components/profile/studio/ProfileStudioSaveBar.tsx
packages/web/src/components/profile/story/ProfileStoryView.tsx
packages/web/src/app/profile/ProfilePageClient.tsx
packages/web/src/components/profile/ProfileMeHub.tsx
packages/web/src/components/profile/ProfileExtendedSection.tsx
packages/web/src/components/landing/LandingProductPreview.tsx
packages/web/src/components/LoginCard.tsx
docs/audits/ui/MOBILE-VISUAL-FIX-BATCH-6.md
```

## Manual smoke (360 / 390 / 430)

- `/profile/edit` — no bottom nav; last form field clears save bar; Discard / Save / Done visible
- `/profile/edit/interests` — section chips scroll with fade; section N of 8 label
- `/profile` (signed in) — hero → about → snapshot → compact completion → community → tools tabs → collapsed account
- Guest `/` — preview carousel swipe hint; Join free / Log in tab parity

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

- Bottom nav destinations unchanged (hidden only in Profile Studio edit mode)
- Create remains FAB/sheet
- OnboardingGate / backend unchanged
- Profile completion logic unchanged (UI compaction only)
- Report, block, privacy, moderation, safety controls retained
