# Mobile Visual Fix Batch 4

**Scope:** Notifications, final onboarding polish, Organizer hub, Door Mode — mobile hierarchy, bottom-nav clearance, actionable CTAs, staff-focused door check-in.  
**Verification:** Intentionally **not run** (Brax sign-off required for typecheck, build, audits, tests).

## Global: bottom nav overlap (centralized)

| Change | File |
|--------|------|
| `suppressMobileBottomNav()`: `/onboarding`, paths ending in `/door` | `packages/web/src/lib/mobile-chrome.ts` |
| `mobileMainPadClass()`: nav+FAB pad, onboarding pad, door `pb-0` | `packages/web/src/lib/mobile-chrome.ts` |
| RootLayout wires suppress for bottom nav + FAB; main padding from helper | `packages/web/src/layouts/RootLayout.tsx` |
| Bottom nav returns null when suppressed | `packages/web/src/components/BottomNav.tsx` |
| Batch 3 tokens unchanged: `--c2k-mobile-nav-pb` = nav height + safe-area + 32px | `packages/web/src/app/globals.css` |

**Door / onboarding:** No member bottom nav or Create FAB on these routes. Main content uses route-specific padding so sticky actions and full-viewport door UI are not double-padded.

## Screens addressed

### 1. Notifications
- Compact “Mark all read” on mobile (`min-h-9`, smaller type); desktop unchanged
- Per-notification CTA chip via `notificationActionLabel()` (e.g. Review report, Open moderation, View event)
- Safety/support footer spacing; clears bottom nav via global main padding
- Mobile no longer surfaces “My Kink Social” drawer toggle on this page
- **Files:** `NotificationsPageClient.tsx`, `notifications-display.ts`, `NotificationsSafetyFooter.tsx`

### 2. Final onboarding step (launch screen)
- Success checkmark hero; title “You're ready to explore kink.social”
- Compact trust/safety card; icon action cards for recommended first steps
- Sticky `MobileActionBar`: Enter kink.social (primary), Back (secondary/quiet)
- Bottom nav suppressed on `/onboarding` (Batch 3 + Batch 4 chrome helper)
- **Files:** `MemberOnboardingWizard.tsx`, `onboarding-step-icons.tsx`, `mobile-chrome.ts`, `RootLayout.tsx`

### 3. Organizer dashboard hub
- Hero: “Manage your communities” + scope summary (`1 organization · 1 group`)
- Header primary: Create event
- Tighter quick actions grid; “Looking for another organization?” copy
- Rich org/group `ScopeCard`: type label, name, role badge, slug, Open dashboard + Public page
- Create links use existing query routes: `/events?create=event`, `/groups?create=group`
- **Files:** `packages/web/src/app/organizer/page.tsx`, `DashboardTemplate.tsx` (minor mobile bottom spacing)

### 4. Door Mode (staff tool)
- Full-viewport focused layout; no bottom nav / FAB
- Operational header: Door mode label, event title, status line (camera ready vs ready to check in)
- Scan QR / Manual lookup tab modes
- Prominent “Use camera” primary in scan mode
- Selected attendee check-in card; recent check-ins list (session-local, up to 8)
- Empty state: “No check-ins yet” + guidance copy
- Exit visible, secondary styling
- **Files:** `DoorModePanel.tsx`, door route unchanged (`…/conventions/[convSlug]/door/page.tsx`)

## Shared patterns

- Door recent-check-ins empty uses `.c2k-empty-state-compact` (Batch 3 primitive)
- Organizer hub inherits global `--c2k-mobile-nav-pb` on `#main-content`

## Before / after (expected)

| Surface | Before | After |
|---------|--------|--------|
| Notifications @ 360 | Large Mark all read; report rows without CTA | Compact secondary; “Review report” chip on actionable rows |
| Onboarding step 6 | Checklist feel; nav overlap on steps | Launch moment; sticky Enter; no bottom nav |
| Organizer hub | Sparse placeholder cards | Hub hero, scope cards with dual actions, correct create links |
| Door Mode | Single stacked form | Tab modes, camera CTA, recent activity + empty state; no social chrome |

## Files changed (summary)

```
packages/web/src/lib/mobile-chrome.ts
packages/web/src/layouts/RootLayout.tsx
packages/web/src/components/BottomNav.tsx
packages/web/src/app/notifications/NotificationsPageClient.tsx
packages/web/src/lib/notifications-display.ts
packages/web/src/components/notifications/NotificationsSafetyFooter.tsx
packages/web/src/components/onboarding/MemberOnboardingWizard.tsx
packages/web/src/components/onboarding/onboarding-step-icons.tsx
packages/web/src/app/organizer/page.tsx
packages/web/src/components/templates/DashboardTemplate.tsx
packages/web/src/components/dancecard/organizer/door/DoorModePanel.tsx
docs/audits/ui/MOBILE-VISUAL-FIX-BATCH-4.md
```

## Verification to run when Brax approves

```bash
npm run typecheck
npm run build
npm run audit:ui-preflight
npm run audit:ui-architecture
npm test
```

**Manual smoke (mobile widths 360 / 390 / 430):**

- `/notifications` — safety card above nav; org report row shows CTA
- `/onboarding` step 6 — Enter always visible; no bottom nav overlap
- `/organizer` — org/group cards tappable; Organizations section clears nav
- `…/door` — scan/manual tabs, camera button, recent check-ins empty state; no bottom nav

**Note:** These commands were intentionally not run because Brax did not approve expensive verification for this batch.

## Constraints preserved

- Bottom nav: Home, Explore, Events, Messages, Me
- Create remains FAB/sheet (not in bottom nav); hidden on door + onboarding
- OnboardingGate / backend unchanged
- Report, block, privacy, moderation, safety controls retained
- No duplicate layout primitives (extends AppShell, MobileActionBar, EmptyState compact)
