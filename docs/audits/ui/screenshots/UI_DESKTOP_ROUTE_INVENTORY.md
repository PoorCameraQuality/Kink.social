# UI Desktop Route Inventory — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

**Scope:** Desktop-first audit of all React Router entries. No route or auth behavior was changed.

**Source of truth:** `packages/web/src/router.tsx` enriched with AuthGate, OnboardingGate, layout shells, and static backend-language scan.

## Summary

- **Total router entries:** 131
- **Active pages:** 103
- **Redirects:** 27
- **Orphan page files:** 14

### Access classification legend

| Tag | Meaning |
|-----|---------|
| `public` | Reachable without session (`public-routes.ts`) |
| `auth` | Requires real session via AuthGate |
| `member` | Member-facing product surface |
| `organizer` | Org/group/convention staff tools |
| `moderator` | Platform moderation workspace |
| `admin` | Site owner / SITE_ADMIN surfaces |
| `legal` | Policy and legal documents |
| `onboarding` | Member onboarding destination |
| `marketing` | Public intent but may require login (AuthGate mismatch) |
| `system` | Auth flows, email confirm, 404 |

### By access tag

- `admin`: 2
- `auth`: 89
- `legal`: 18
- `member`: 68
- `moderator`: 14
- `onboarding`: 1
- `onboarding-exempt`: 33
- `organizer`: 11
- `public`: 15
- `redirect`: 27
- `system`: 3

## Full route table

| Path | Component | Layout | Access | Onboarding gate | Desktop flags | Backend/dev language |
|------|-----------|--------|--------|-----------------|---------------|----------------------|
| `/` | Navigate | RootLayout | redirect | No | — | — |
| `/` | LandingPage | RootLayout | public | No | — | — |
| `/*` | NotFoundPage | RootLayout | auth, member | Yes | — | — |
| `/about` | AboutPage | RootLayout | auth, member | Yes | legal-doc | — |
| `/accessibility` | AccessibilityPage | RootLayout | auth, member | Yes | — | — |
| `/activity` | ActivityHubPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/admin/owner/investigations` | OwnerInvestigationsIndexPage | RootLayout | auth, onboarding-exempt, system | No | — | — |
| `/admin/owner/investigations` | OwnerInvestigationsIndexPage | RootLayout | auth, onboarding-exempt, system | No | — | — |
| `/admin/owner/investigations/users/:userId` | OwnerInvestigationUserPage | RootLayout | auth, onboarding-exempt, system | No | — | — |
| `/adult-content-consent` | AdultContentConsentPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/calendar` | Navigate | RootLayout | redirect | No | — | — |
| `/calendar/erobay-community` | ErobayCommunityMirrorPage | RootLayout | auth, member | Yes | — | — |
| `/chat` | Navigate | RootLayout | redirect | No | — | — |
| `/community` | Navigate | RootLayout | redirect | No | — | — |
| `/community-guidelines` | Navigate | RootLayout | redirect | No | — | — |
| `/connections` | ConnectionsPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/contact` | ContactPage | RootLayout | auth, onboarding-exempt | No | legal-doc | — |
| `/conventions` | ConventionsListPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/conventions/:slug` | ConventionProgramPage | RootLayout + ConventionAttendeeHubShell | auth, member | Yes | — | command-bridge, ecke |
| `/conventions/:slug/apply/:applySlug` | TrustedRoleApplyPage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/conventions/:slug/dancecard/s/:token` | ConventionDancecardSharedPage | RootLayout | auth, member | Yes | — | — |
| `/conventions/:slug/my-offers` | ConventionMyOffersPage | RootLayout | auth, member | Yes | — | — |
| `/conventions/:slug/present/apply` | ConventionPresentApplyPage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/conventions/:slug/register` | ConventionRegisterPage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/conventions/:slug/vend/apply` | ConventionVendApplyPage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/discovery` | DiscoveryRoute | RootLayout | auth, member | Yes | — | — |
| `/dmca` | DmcaPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/dungeons` | DungeonsPage | RootLayout | auth, member | Yes | — | — |
| `/education` | EducationPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/education/:slug` | EducationArticlePage | RootLayout | auth, member | Yes | — | — |
| `/education/series/:slug` | EducationSeriesPage | RootLayout | auth, member | Yes | — | — |
| `/education/series/manage` | EducationSeriesManagePage | RootLayout | auth, member | Yes | — | — |
| `/education/series/manage/:id` | EducationSeriesManageEditPage | RootLayout | auth, member | Yes | — | — |
| `/education/write` | EducationWritePage | RootLayout | auth, member | Yes | — | ecke |
| `/education/write/:id` | EducationWritePage | RootLayout | auth, member | Yes | — | ecke |
| `/email/confirm` | EmailConfirmPage | RootLayout | public | No | — | — |
| `/email/unsubscribe` | EmailUnsubscribePage | RootLayout | public | No | — | — |
| `/events` | EventsPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/events/:id` | EventDetailPage | RootLayout | auth, member | Yes | — | — |
| `/explore` | ExplorePage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/explore/people` | Navigate | RootLayout | redirect | No | — | — |
| `/feed` | Navigate | RootLayout | redirect | No | — | — |
| `/forgot-password` | ForgotPasswordPage | RootLayout | public, onboarding-exempt | No | — | — |
| `/forums` | Navigate | RootLayout | redirect | No | — | — |
| `/groups` | GroupsPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/groups/:id` | GroupDetailPage | RootLayout + CommunityHubShell | auth, member | Yes | — | — |
| `/guidelines` | GuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/home` | HomePage | RootLayout | auth, member | Yes | directory-or-hub | — |
| `/join` | Navigate | RootLayout | redirect | No | — | — |
| `/law-enforcement` | LawEnforcementPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/login` | LoginRedirectPage | RootLayout | public, onboarding-exempt | No | — | — |
| `/media` | MediaPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/media/:slug` | MediaShowPage | RootLayout | auth, member | Yes | — | — |
| `/media/submit` | MediaSubmitPage | RootLayout | auth, member | Yes | — | — |
| `/messages` | Navigate | RootLayout | redirect | No | — | — |
| `/messaging` | MessagingPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/minor-safety` | MinorSafetyPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/moderation` | ModerationShell | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation` | ModerationIndexPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation/actions` | ModerationActionsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | rule-of-two |
| `/moderation/admin` | ModerationAdminPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, admin | No | moderation-console | command-bridge |
| `/moderation/audit` | ModerationAuditPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, admin | No | moderation-console | — |
| `/moderation/cases` | ModerationCasesPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation/cases/:caseId` | ModerationCaseDetailPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | internal-notes |
| `/moderation/contact` | ModerationContactPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | moderation-console, legal-doc | — |
| `/moderation/dashboard` | ModerationDashboardPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation/dmca` | ModerationDmcaPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | moderation-console, legal-doc | — |
| `/moderation/legal` | ModerationLegalPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | moderation-console, legal-doc | — |
| `/moderation/profile-flags` | ModerationProfileFlagsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation/queues` | ModerationQueuesPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/moderation/reports` | ModerationReportsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | moderation-console | — |
| `/my-posts` | MyPostsPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/ncii` | NciiPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/notifications` | NotificationsPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/onboarding` | OnboardingPage | RootLayout + MemberOnboardingWizard | auth, onboarding, onboarding-exempt | No | wizard-flow | — |
| `/online` | Navigate | RootLayout | redirect | No | — | — |
| `/organizations` | Navigate | RootLayout | redirect | No | — | — |
| `/organizer` | OrganizerHubPage | RootLayout + OrganizerAppShell | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/conventions/:slug` | OrganizerConventionRedirectPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/dancecard` | Navigate | RootLayout | redirect | No | organizer-shell, organizer-console | — |
| `/organizer/dancecard/:slug` | OrganizerConventionRedirectPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/groups/:id` | OrganizerGroupPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/groups/:id/events/:eventId` | OrganizerGroupEventPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/orgs/:slug` | OrganizerOrgPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/orgs/:slug/conventions/:convSlug` | OrganizerOrgConventionPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/organizer/orgs/:slug/conventions/:convSlug/door` | — | RootLayout | auth, member, organizer | No | organizer-shell, organizer-console | — |
| `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` | OrganizerConventionPrintSchedulePage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | command-bridge |
| `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` | OrganizerConventionPrintVenueSignsPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | command-bridge |
| `/organizer/orgs/:slug/events/:eventId` | OrganizerOrgEventPage | RootLayout | auth, member, organizer | Yes | organizer-shell, organizer-console | — |
| `/orgs` | OrgsListPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/orgs/:slug` | OrgHubPage | RootLayout | auth, member | Yes | — | — |
| `/orgs/new` | OrgCreatePage | RootLayout | auth, member | Yes | wizard-flow | ecke |
| `/people` | PeopleDirectoryPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/places` | PlacesPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/policies` | PoliciesIndexPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/adult-content-and-consent` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/adult-content-records` | AdultContentRecordsPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/appeals` | AppealsPolicyPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/community-guidelines` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/dmca` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/events` | EventGuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/groups` | GroupGuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/law-enforcement` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/minor-safety` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/moderator-code-of-conduct` | ModeratorCodeOfConductPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/policies/ncii` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/organizers` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/privacy` | Navigate | RootLayout | redirect | No | — | — |
| `/policies/terms` | Navigate | RootLayout | redirect | No | — | — |
| `/presenters` | PresentersDirectoryPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/presenters/:username` | PresenterProfilePage | RootLayout | auth, member | Yes | — | — |
| `/presenters/onboarding` | PresenterOnboardingPage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/privacy` | PrivacyPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/profile` | Navigate | RootLayout | redirect | No | — | — |
| `/rendezvous` | Navigate | RootLayout | redirect | No | — | — |
| `/reset-password` | ResetPasswordPage | RootLayout | public, onboarding-exempt | No | — | — |
| `/safety` | Navigate | RootLayout | redirect | No | — | — |
| `/saved` | SavedPage | RootLayout | auth, member | Yes | focused-personal | — |
| `/settings` | Navigate | RootLayout | redirect | No | focused-personal | — |
| `/share/post/:id` | SharePostPage | RootLayout | auth, member | Yes | — | — |
| `/staff/:username` | StaffProfilePage | RootLayout | auth, member | Yes | — | — |
| `/states` | Navigate | RootLayout | redirect | No | — | — |
| `/support` | SupportPage | RootLayout | auth, onboarding-exempt | No | legal-doc | — |
| `/support/branding` | BrandingGuidePage | RootLayout | auth, onboarding-exempt | No | — | — |
| `/tags/:tag` | TagsPage | RootLayout | auth, member | Yes | — | — |
| `/terms` | TermsPage | RootLayout | public, onboarding-exempt, legal | No | legal-doc | — |
| `/vendor-organizer-terms` | VendorOrganizerTermsPage | RootLayout | auth, member, legal | Yes | legal-doc | — |
| `/vendors` | VendorsPage | RootLayout | auth, member | Yes | discover-3col, directory-or-hub | — |
| `/vendors/:id` | VendorDetailPage | RootLayout | auth, member | Yes | — | — |
| `/vendors/new` | VendorCreatePage | RootLayout | auth, member | Yes | wizard-flow | — |
| `/vendors/onboarding` | VendorOnboardingPage | RootLayout | auth, member | Yes | wizard-flow | — |

## Layout component map (desktop)

| Layout | File | Desktop role |
|--------|------|--------------|
| **RootLayout** | `packages/web/src/layouts/RootLayout.tsx` | Global header, optional CommunityNavBar, footer; hides bottom nav on md+ |
| **AppShell** | `components/shell/AppShell.tsx` | Tier-A member pages: home, explore, events, profile |
| **DirectoryTemplate** | `components/templates/DirectoryTemplate.tsx` | 3-column discover: left filters, center list, right rail |
| **PersonalUtilityPageShell** | `components/layout/PersonalUtilityPageShell.tsx` | Messaging, notifications, connections — left rail + center |
| **OrganizerAppShell** | `components/organizer/ui/OrganizerAppShell.tsx` | Sidebar nav, breadcrumbs, command palette, status bar |
| **ModerationShell** | `components/moderation/ModerationShell.tsx` | Staff workspace sidebar |
| **SettingsLayout** | `app/settings/SettingsLayout.tsx` | Settings tab nav + content |
| **ProfileEditLayout** | `app/profile/edit/ProfileEditLayout.tsx` | Profile edit two-column |
| **CommunityHubShell** | `components/ui/CommunityHubShell.tsx` | Org/group hub with cover + tabs |
| **ConventionAttendeeHubShell** | `components/conventions/ConventionAttendeeHubShell.tsx` | Convention program hub |

## Routes that redirect to onboarding

**Destination:** `/onboarding` (`MemberOnboardingWizard`)

**Legacy redirects:**
- `/profile/complete` → `/onboarding?redirect=…`
- `/profile/edit?onboarding=1` → `/onboarding?redirect=…`

**OnboardingGate:** All authenticated routes except onboarding-exempt paths redirect when `feed.onboardingCompletedAt` is unset.

Exempt prefixes: `/onboarding`, `/login`, password flows, `/terms`, `/privacy`, `/guidelines`, `/policies`, `/moderation`, `/admin`, `/support`, `/contact`.

### Gated routes (sample — full list in table above where Onboarding gate = Yes)

- `/*`
- `/about`
- `/accessibility`
- `/activity`
- `/adult-content-consent`
- `/calendar/erobay-community`
- `/connections`
- `/conventions`
- `/conventions/:slug`
- `/conventions/:slug/apply/:applySlug`
- `/conventions/:slug/dancecard/s/:token`
- `/conventions/:slug/my-offers`
- `/conventions/:slug/present/apply`
- `/conventions/:slug/register`
- `/conventions/:slug/vend/apply`
- `/discovery`
- `/dmca`
- `/dungeons`
- `/education`
- `/education/:slug`
- `/education/series/:slug`
- `/education/series/manage`
- `/education/series/manage/:id`
- `/education/write`
- `/education/write/:id`
- `/events`
- `/events/:id`
- `/explore`
- `/groups`
- `/groups/:id`
- _…and 37 more_

## Routes with backend / developer language in UI

| Path | Detected patterns |
|------|-------------------|
| `/conventions/:slug` | command-bridge, ecke |
| `/education/write` | ecke |
| `/education/write/:id` | ecke |
| `/moderation/actions` | rule-of-two |
| `/moderation/admin` | command-bridge |
| `/moderation/cases/:caseId` | internal-notes |
| `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` | command-bridge |
| `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` | command-bridge |
| `/orgs/new` | ecke |

**Global (DEV):** `MockDataBanner` on most routes when `import.meta.env.DEV`.

## AuthGate marketing mismatches

These paths are marketing/discover intent but require login (not in `public-routes.ts`):

- `/explore` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/events` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/groups` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/education` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/vendors` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/people` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/orgs` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/conventions` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/about` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/dmca` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/contact` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session
- `/media` — Listed as discoverable/public in FEATURE_REGISTRY; AuthGate requires session

## Orphan pages (not in router)

- `/profile/complete` → `packages/web/src/app/profile/complete/page.tsx`
- `/profile/edit` → `packages/web/src/app/profile/edit/page.tsx`
- `/profile/:username` → `packages/web/src/app/profile/[username]/page.tsx`
- `/settings/account` → `packages/web/src/app/settings/account/page.tsx`
- `/settings/activity` → `packages/web/src/app/settings/activity/page.tsx`
- `/settings/blocked` → `packages/web/src/app/settings/blocked/page.tsx`
- `/settings/ecosystem` → `packages/web/src/app/settings/ecosystem/page.tsx`
- `/settings/muted` → `packages/web/src/app/settings/muted/page.tsx`
- `/settings/notifications` → `packages/web/src/app/settings/notifications/page.tsx`
- `/settings/payment-history` → `packages/web/src/app/settings/payment-history/page.tsx`
- `/settings/privacy` → `packages/web/src/app/settings/privacy/page.tsx`
- `/settings/profile` → `packages/web/src/app/settings/profile/page.tsx`
- `/settings/trust` → `packages/web/src/app/settings/trust/page.tsx`
- `/settings/vendor` → `packages/web/src/app/settings/vendor/page.tsx`