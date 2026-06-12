# UI Route Inventory — kink.social

Generated: 2026-06-12 via `npm run audit:ui-architecture`

**Source of truth:** `packages/web/src/router.tsx` enriched with AuthGate, OnboardingGate, and static analysis.

## Summary

- **Total router entries:** 131
- **Active pages:** 103
- **Redirects:** 27
- **Orphan page files (not in router):** 14

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

### By page archetype

- `dashboard`: 28
- `detail`: 41
- `directory`: 11
- `feed`: 1
- `media`: 3
- `policy`: 10
- `redirect`: 27
- `system`: 1
- `wizard`: 9

## Full route table

| Path | Component | Layout | Access | Onboarding redirect | Archetype | Mobile flags | Backend language |
|------|-----------|--------|--------|---------------------|-----------|--------------|------------------|
| `/` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/` | LandingPage | RootLayout | public | No | detail | — | — |
| `/*` | NotFoundPage | RootLayout | auth, member | Yes | system | — | — |
| `/about` | AboutPage | RootLayout | auth, member | Yes | policy | — | — |
| `/accessibility` | AccessibilityPage | RootLayout | auth, member | Yes | detail | — | — |
| `/activity` | ActivityHubPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/admin/owner/investigations` | OwnerInvestigationsIndexPage | RootLayout | auth, onboarding-exempt, system | No | dashboard | — | — |
| `/admin/owner/investigations` | OwnerInvestigationsIndexPage | RootLayout | auth, onboarding-exempt, system | No | dashboard | — | — |
| `/admin/owner/investigations/users/:userId` | OwnerInvestigationUserPage | RootLayout | auth, onboarding-exempt, system | No | dashboard | — | — |
| `/adult-content-consent` | AdultContentConsentPage | RootLayout | auth, member, legal | Yes | detail | — | — |
| `/calendar` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/calendar/erobay-community` | ErobayCommunityMirrorPage | RootLayout | auth, member | Yes | detail | — | — |
| `/chat` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/community` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/community-guidelines` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/connections` | ConnectionsPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/contact` | ContactPage | RootLayout | auth, onboarding-exempt | No | policy | — | — |
| `/conventions` | ConventionsListPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/conventions/:slug` | ConventionProgramPage | RootLayout + ConventionAttendeeHubShell | auth, member | Yes | detail | — | command-bridge, ecke |
| `/conventions/:slug/apply/:applySlug` | TrustedRoleApplyPage | RootLayout | auth, member | Yes | wizard | — | — |
| `/conventions/:slug/dancecard/s/:token` | ConventionDancecardSharedPage | RootLayout | auth, member | Yes | detail | — | — |
| `/conventions/:slug/my-offers` | ConventionMyOffersPage | RootLayout | auth, member | Yes | detail | — | — |
| `/conventions/:slug/present/apply` | ConventionPresentApplyPage | RootLayout | auth, member | Yes | wizard | — | — |
| `/conventions/:slug/register` | ConventionRegisterPage | RootLayout | auth, member | Yes | wizard | — | — |
| `/conventions/:slug/vend/apply` | ConventionVendApplyPage | RootLayout | auth, member | Yes | wizard | — | — |
| `/discovery` | DiscoveryRoute | RootLayout | auth, member | Yes | directory | — | — |
| `/dmca` | DmcaPage | RootLayout | auth, member, legal | Yes | detail | — | — |
| `/dungeons` | DungeonsPage | RootLayout | auth, member | Yes | detail | — | — |
| `/education` | EducationPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/education/:slug` | EducationArticlePage | RootLayout | auth, member | Yes | detail | — | — |
| `/education/series/:slug` | EducationSeriesPage | RootLayout | auth, member | Yes | detail | — | — |
| `/education/series/manage` | EducationSeriesManagePage | RootLayout | auth, member | Yes | detail | — | — |
| `/education/series/manage/:id` | EducationSeriesManageEditPage | RootLayout | auth, member | Yes | detail | — | — |
| `/education/write` | EducationWritePage | RootLayout | auth, member | Yes | detail | — | ecke |
| `/education/write/:id` | EducationWritePage | RootLayout | auth, member | Yes | detail | — | ecke |
| `/email/confirm` | EmailConfirmPage | RootLayout | public | No | detail | — | — |
| `/email/unsubscribe` | EmailUnsubscribePage | RootLayout | public | No | detail | — | — |
| `/events` | EventsPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/events/:id` | EventDetailPage | RootLayout | auth, member | Yes | detail | — | — |
| `/explore` | ExplorePage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/explore/people` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/feed` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/forgot-password` | ForgotPasswordPage | RootLayout | public, onboarding-exempt | No | detail | — | — |
| `/forums` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/groups` | GroupsPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/groups/:id` | GroupDetailPage | RootLayout + CommunityHubShell | auth, member | Yes | detail | — | — |
| `/guidelines` | GuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/home` | HomePage | RootLayout | auth, member | Yes | feed | feed-3col | — |
| `/join` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/law-enforcement` | LawEnforcementPage | RootLayout | auth, member, legal | Yes | detail | — | — |
| `/login` | LoginRedirectPage | RootLayout | public, onboarding-exempt | No | detail | — | — |
| `/media` | MediaPage | RootLayout | auth, member | Yes | media | discover-3col | — |
| `/media/:slug` | MediaShowPage | RootLayout | auth, member | Yes | media | — | — |
| `/media/submit` | MediaSubmitPage | RootLayout | auth, member | Yes | media | — | — |
| `/messages` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/messaging` | MessagingPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/minor-safety` | MinorSafetyPage | RootLayout | auth, member, legal | Yes | detail | — | — |
| `/moderation` | ModerationShell | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation` | ModerationIndexPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation/actions` | ModerationActionsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | rule-of-two |
| `/moderation/admin` | ModerationAdminPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, admin | No | dashboard | moderation-shell | command-bridge |
| `/moderation/audit` | ModerationAuditPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, admin | No | dashboard | moderation-shell | — |
| `/moderation/cases` | ModerationCasesPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation/cases/:caseId` | ModerationCaseDetailPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | internal-notes |
| `/moderation/contact` | ModerationContactPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | dashboard | moderation-shell | — |
| `/moderation/dashboard` | ModerationDashboardPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation/dmca` | ModerationDmcaPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | dashboard | moderation-shell | — |
| `/moderation/legal` | ModerationLegalPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator, legal | No | dashboard | moderation-shell | — |
| `/moderation/profile-flags` | ModerationProfileFlagsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation/queues` | ModerationQueuesPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/moderation/reports` | ModerationReportsPage | RootLayout → ModerationShell | auth, onboarding-exempt, moderator | No | dashboard | moderation-shell | — |
| `/my-posts` | MyPostsPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/ncii` | NciiPage | RootLayout | auth, member, legal | Yes | detail | — | — |
| `/notifications` | NotificationsPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/onboarding` | OnboardingPage | RootLayout + MemberOnboardingWizard | auth, onboarding, onboarding-exempt | No | wizard | — | — |
| `/online` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/organizations` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/organizer` | OrganizerHubPage | RootLayout + OrganizerAppShell | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/conventions/:slug` | OrganizerConventionRedirectPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/dancecard` | Navigate | RootLayout | redirect | No | redirect | organizer-shell | — |
| `/organizer/dancecard/:slug` | OrganizerConventionRedirectPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/groups/:id` | OrganizerGroupPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/groups/:id/events/:eventId` | OrganizerGroupEventPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/orgs/:slug` | OrganizerOrgPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/orgs/:slug/conventions/:convSlug` | OrganizerOrgConventionPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/organizer/orgs/:slug/conventions/:convSlug/door` | — | RootLayout | auth, member, organizer | No | dashboard | organizer-shell | — |
| `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` | OrganizerConventionPrintSchedulePage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | command-bridge |
| `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` | OrganizerConventionPrintVenueSignsPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | command-bridge |
| `/organizer/orgs/:slug/events/:eventId` | OrganizerOrgEventPage | RootLayout | auth, member, organizer | Yes | dashboard | organizer-shell | — |
| `/orgs` | OrgsListPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/orgs/:slug` | OrgHubPage | RootLayout | auth, member | Yes | detail | — | — |
| `/orgs/new` | OrgCreatePage | RootLayout | auth, member | Yes | wizard | — | ecke |
| `/people` | PeopleDirectoryPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/places` | PlacesPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/policies` | PoliciesIndexPage | RootLayout | public, onboarding-exempt, legal | No | detail | — | — |
| `/policies/adult-content-and-consent` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/adult-content-records` | AdultContentRecordsPage | RootLayout | public, onboarding-exempt, legal | No | detail | — | — |
| `/policies/appeals` | AppealsPolicyPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/policies/community-guidelines` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/dmca` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/events` | EventGuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/policies/groups` | GroupGuidelinesPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/policies/law-enforcement` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/minor-safety` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/moderator-code-of-conduct` | ModeratorCodeOfConductPage | RootLayout | public, onboarding-exempt, legal | No | detail | — | — |
| `/policies/ncii` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/organizers` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/privacy` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/policies/terms` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/presenters` | PresentersDirectoryPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/presenters/:username` | PresenterProfilePage | RootLayout | auth, member | Yes | detail | — | — |
| `/presenters/onboarding` | PresenterOnboardingPage | RootLayout | auth, member | Yes | wizard | — | — |
| `/privacy` | PrivacyPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/profile` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/rendezvous` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/reset-password` | ResetPasswordPage | RootLayout | public, onboarding-exempt | No | detail | — | — |
| `/safety` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/saved` | SavedPage | RootLayout | auth, member | Yes | detail | focused-personal | — |
| `/settings` | Navigate | RootLayout | redirect | No | redirect | focused-personal | — |
| `/share/post/:id` | SharePostPage | RootLayout | auth, member | Yes | detail | — | — |
| `/staff/:username` | StaffProfilePage | RootLayout | auth, member | Yes | detail | — | — |
| `/states` | Navigate | RootLayout | redirect | No | redirect | — | — |
| `/support` | SupportPage | RootLayout | auth, onboarding-exempt | No | policy | — | — |
| `/support/branding` | BrandingGuidePage | RootLayout | auth, onboarding-exempt | No | detail | — | — |
| `/tags/:tag` | TagsPage | RootLayout | auth, member | Yes | detail | — | — |
| `/terms` | TermsPage | RootLayout | public, onboarding-exempt, legal | No | policy | — | — |
| `/vendor-organizer-terms` | VendorOrganizerTermsPage | RootLayout | auth, member, legal | Yes | policy | — | — |
| `/vendors` | VendorsPage | RootLayout | auth, member | Yes | directory | discover-3col | — |
| `/vendors/:id` | VendorDetailPage | RootLayout | auth, member | Yes | detail | — | — |
| `/vendors/new` | VendorCreatePage | RootLayout | auth, member | Yes | wizard | — | — |
| `/vendors/onboarding` | VendorOnboardingPage | RootLayout | auth, member | Yes | wizard | — | — |

## Onboarding redirect list

Routes that redirect incomplete members to `/onboarding?redirect=…` (auth required, not onboarding-exempt):

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
- `/home`
- `/law-enforcement`
- `/media`
- `/media/:slug`
- `/media/submit`
- `/messaging`
- `/minor-safety`
- `/my-posts`
- `/ncii`
- `/notifications`
- `/organizer`
- `/organizer/conventions/:slug`
- `/organizer/dancecard/:slug`
- `/organizer/groups/:id`
- `/organizer/groups/:id/events/:eventId`
- `/organizer/orgs/:slug`
- `/organizer/orgs/:slug/conventions/:convSlug`
- `/organizer/orgs/:slug/conventions/:convSlug/print/schedule`
- `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs`
- `/organizer/orgs/:slug/events/:eventId`
- `/orgs`
- `/orgs/:slug`
- `/orgs/new`
- `/people`
- `/places`
- `/presenters`
- `/presenters/:username`
- `/presenters/onboarding`
- `/saved`
- `/share/post/:id`
- `/staff/:username`
- `/tags/:tag`
- `/vendor-organizer-terms`
- `/vendors`
- `/vendors/:id`
- `/vendors/new`
- `/vendors/onboarding`

## OnboardingGate migration classification (planning only — no behavior change)

Future soft-gate migration targets. **Current behavior:** all rows below redirect to `/onboarding` when `feed.onboardingCompletedAt` is unset.

| Path | Current gate | Recommended class | Rationale |
|------|--------------|-------------------|-----------|
| `/*` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/about` | Yes | should_not_gate | Informational/support — should remain reachable during onboarding |
| `/accessibility` | Yes | should_not_gate | Informational/support — should remain reachable during onboarding |
| `/activity` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/adult-content-consent` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/calendar/erobay-community` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/connections` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/conventions` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/conventions/:slug` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/conventions/:slug/apply/:applySlug` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/conventions/:slug/dancecard/s/:token` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/conventions/:slug/my-offers` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/conventions/:slug/present/apply` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/conventions/:slug/register` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/conventions/:slug/vend/apply` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/discovery` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/dmca` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/dungeons` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/:slug` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/series/:slug` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/series/manage` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/series/manage/:id` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/write` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/education/write/:id` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/events` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/events/:id` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/explore` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/groups` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/groups/:id` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/home` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/law-enforcement` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/media` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/media/:slug` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/media/submit` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/messaging` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/minor-safety` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/my-posts` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/ncii` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/notifications` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/organizer` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/conventions/:slug` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/dancecard/:slug` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/groups/:id` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/groups/:id/events/:eventId` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/orgs/:slug` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/orgs/:slug/conventions/:convSlug` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/organizer/orgs/:slug/events/:eventId` | Yes | hard_block | Legal/safety, staff tools, or account integrity action |
| `/orgs` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/orgs/:slug` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/orgs/new` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/people` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/places` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/presenters` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/presenters/:username` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/presenters/onboarding` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/saved` | Yes | setup_prompt | Personal hub — allow access with inline setup nudges |
| `/share/post/:id` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/staff/:username` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/tags/:tag` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/vendor-organizer-terms` | Yes | setup_prompt | Default — soft gate with contextual prompt unless legal/staff |
| `/vendors` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/vendors/:id` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/vendors/new` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |
| `/vendors/onboarding` | Yes | read_only_banner | Discovery/browse — user should explore value with onboarding banner, not full redirect |

### Classification summary

- `hard_block`: 15
- `read_only_banner`: 32
- `setup_prompt`: 18
- `should_not_gate`: 2

## AuthGate mismatch list

Routes commonly described as public in marketing/registry but require login at runtime (not in `public-routes.ts`):

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

## Orphan pages (filesystem, not wired in router)

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

## Recommended template mapping (planning only)

### feed

- `/home`

### directory

- `/conventions`
- `/discovery`
- `/education`
- `/events`
- `/explore`
- `/groups`
- `/orgs`
- `/people`
- `/places`
- `/presenters`
- `/vendors`

### detail

- `/`
- `/accessibility`
- `/activity`
- `/adult-content-consent`
- `/calendar/erobay-community`
- `/connections`
- `/conventions/:slug`
- `/conventions/:slug/dancecard/s/:token`
- `/conventions/:slug/my-offers`
- `/dmca`
- `/dungeons`
- `/education/:slug`
- `/education/series/:slug`
- `/education/series/manage`
- `/education/series/manage/:id`
- `/education/write`
- `/education/write/:id`
- `/email/confirm`
- `/email/unsubscribe`
- `/events/:id`
- `/forgot-password`
- `/groups/:id`
- `/law-enforcement`
- `/login`
- `/messaging`
- `/minor-safety`
- `/my-posts`
- `/ncii`
- `/notifications`
- `/orgs/:slug`
- `/policies`
- `/policies/adult-content-records`
- `/policies/moderator-code-of-conduct`
- `/presenters/:username`
- `/reset-password`
- `/saved`
- `/share/post/:id`
- `/staff/:username`
- `/support/branding`
- `/tags/:tag`
- _…and 1 more_

### wizard

- `/conventions/:slug/apply/:applySlug`
- `/conventions/:slug/present/apply`
- `/conventions/:slug/register`
- `/conventions/:slug/vend/apply`
- `/onboarding`
- `/orgs/new`
- `/presenters/onboarding`
- `/vendors/new`
- `/vendors/onboarding`

### dashboard

- `/admin/owner/investigations`
- `/admin/owner/investigations`
- `/admin/owner/investigations/users/:userId`
- `/moderation`
- `/moderation`
- `/moderation/actions`
- `/moderation/admin`
- `/moderation/audit`
- `/moderation/cases`
- `/moderation/cases/:caseId`
- `/moderation/contact`
- `/moderation/dashboard`
- `/moderation/dmca`
- `/moderation/legal`
- `/moderation/profile-flags`
- `/moderation/queues`
- `/moderation/reports`
- `/organizer`
- `/organizer/conventions/:slug`
- `/organizer/dancecard/:slug`
- `/organizer/groups/:id`
- `/organizer/groups/:id/events/:eventId`
- `/organizer/orgs/:slug`
- `/organizer/orgs/:slug/conventions/:convSlug`
- `/organizer/orgs/:slug/conventions/:convSlug/print/schedule`
- `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs`
- `/organizer/orgs/:slug/events/:eventId`

### settings

_None_

### policy

- `/about`
- `/contact`
- `/guidelines`
- `/policies/appeals`
- `/policies/events`
- `/policies/groups`
- `/privacy`
- `/support`
- `/terms`
- `/vendor-organizer-terms`

### media

- `/media`
- `/media/:slug`
- `/media/submit`

### redirect

_None_

### system

- `/*`
