# Mobile Visual Fix Batch 3

**Scope:** Onboarding completion, Media, Messaging, Moderation — empty states, bottom-nav clearance, contextual FAB.  
**Verification:** Intentionally **not run** (Brax sign-off required for typecheck, build, audits, tests).

## Global: bottom nav safe area

| Change | File |
|--------|------|
| Tokens: `--c2k-mobile-breathing` (32px), `--c2k-bottom-nav-clearance`, `--c2k-mobile-nav-pb`, `--c2k-main-mobile-pb` (nav + FAB) | `packages/web/src/app/globals.css` |
| RootLayout: nav-only vs nav+FAB padding; hide bottom nav on `/onboarding`; onboarding action-bar offset | `packages/web/src/layouts/RootLayout.tsx` |
| Nested scroll helper uses nav clearance only (avoids double FAB pad) | `packages/web/src/styles/mobile-polish.css` |
| Removed duplicate pad from DirectoryTemplate / FeedTemplate (main is source of truth) | `packages/web/src/components/templates/` |
| Create FAB hidden on `/messaging` | `packages/web/src/lib/app-shell-routes.ts` |

**Formula (mobile):** `bottom nav height + safe-area inset + 32px` (+ FAB stack on Tier-A create routes).

## Screens addressed

### Onboarding final step (step 6)
- Completion title: “You're ready to explore kink.social”
- Compact consent/trust card
- Icon action cards for recommended first steps
- Sticky `MobileActionBar`: Enter kink.social + Back
- Bottom nav suppressed during onboarding
- **File:** `MemberOnboardingWizard.tsx`, `onboarding-step-icons.tsx`, `layout.tsx` (compact safety card)

### Media
- Compact empty state; CTAs above nav clearance via main padding
- Header Submit hidden on mobile (empty state owns CTA)
- Topics chip inline with format tabs on mobile
- **Files:** `MediaEmptyPanel.tsx`, `media/page.tsx`

### Messaging
- FAB not shown on Messages route
- Inbox filters hidden when empty (Main folder)
- Tighter folder tabs; hint hidden when empty
- Compact empty panel
- **Files:** `messaging/page.tsx`, `MessagingEmptyPanel.tsx`, `MessagingFolderTabs.tsx`

### Moderation (light)
- Mobile: Dashboard / Queues / Cases / Reports + “More admin” dropdown
- Compact summary cards; Refresh de-emphasized on small screens
- **Files:** `ModerationShell.tsx`, `moderation/dashboard/page.tsx`

### EmptyState primitive
- `compact` + optional `reassurance` props; mobile height cap utilities
- **Files:** `EmptyState.tsx`, `mobile-polish.css` (`.c2k-empty-state-compact`)

### Group forums empty (Batch 2 carryover)
- Compact empty card styling
- **File:** `GroupForumsSection.tsx`

## Before / after (expected)

| Surface | Before | After |
|---------|--------|--------|
| Media empty @ 360 | CTAs covered by bottom nav | Shorter card; main reserves 32px+ below nav |
| Onboarding step 6 | Document-like checklist; nav over steps | Launch screen + sticky Enter; no bottom nav |
| Messages empty | Tall control stack + generic FAB | Filters collapsed; no FAB; compact empty |
| Moderation mobile | 10+ tabs wrapped; content overlap | 4 primary tabs + More admin; tighter cards |

## Verification to run when Brax approves

```bash
npm run typecheck
npm run build
npm run audit:ui-preflight
npm run audit:ui-architecture
npm test
```

**Note:** `adult-content-preference.test.ts` schemaVersion mismatch (6 vs 7) may still fail — pre-existing.

## Constraints preserved

- Bottom nav: Home, Explore, Events, Messages, Me
- Create remains FAB/sheet (not in bottom nav)
- OnboardingGate / backend unchanged
- Report, block, privacy, moderation, safety controls retained
