# UI Component Inventory — kink.social

Generated: 2026-06-12 via `npm run audit:ui-architecture`

**Scope:** `packages/web/src/components/`, `packages/web/src/layouts/`, and `app/**/layout.tsx`.

## Summary

- **Component files scanned:** 636
- **card-feed:** 83 file assignments
- **domain:** 317 file assignments
- **form:** 142 file assignments
- **layout:** 19 file assignments
- **modal-sheet:** 22 file assignments
- **nav:** 41 file assignments
- **ui-primitive:** 32 file assignments

## Layout components

| File | Purpose |
|------|---------|
| `components/conventions/ConventionAttendeeHubShell.tsx` | ConventionAttendeeHubShell component |
| `components/dancecard/organizer/OrganizerAuthShell.tsx` | — |
| `components/dancecard/organizer/OrganizerCommandShell.tsx` | — |
| `components/dancecard/organizer/shell/OrganizerEventShell.tsx` | — |
| `components/education/EducationDiscoverShell.tsx` | Education discover uses its own left rail - no duplicate Explore sub-nav. |
| `components/group/GroupCommunityShell.tsx` | Mock/demo slug groups - full tab set including mock-only sections. |
| `components/home/HomeFeedShellComposer.tsx` | HomeFeedShellComposer component |
| `components/layout/PersonalUtilityPageShell.tsx` |  |
| `components/moderation/ModerationShell.tsx` | ModerationShell component |
| `components/org/OrgCommunityShell.tsx` | DB may still hold `/seed/paf/*` paths; serve via `/api/public-seed/paf/*` instead. |
| `components/organizer/ui/OrganizerAppShell.tsx` | OrganizerAppShell component |
| `components/presenters/onboarding/shared/OnboardingShell.tsx` | — |
| `components/profile/layout/ProfilePageShell.tsx` | * Desktop profile layout: cover header, 3-column grid (story \| tabs \| network). |
| `components/shell/AppShell.tsx` | * Authenticated mobile app shell — max-width, overflow guard, consistent horizontal padding. |
| `components/ui/ComingSoonLayout.tsx` | * Consistent “coming soon” shell for placeholder routes (audit §4.4 / §4.6). |
| `components/ui/CommunityHubShell.tsx` | CommunityHubShell component |
| `components/ui/TabShell.tsx` | ECKE-style rounded tab shell - children should be `TabShellButton` / `PillTab`. |
| `layouts/OrganizerScopeShell.tsx` | OrganizerScopeShell component |
| `layouts/RootLayout.tsx` | Must render under `AppProviders` / `AuthProvider` - see `RootLayout`. |

## Nav components

| File | Purpose |
|------|---------|
| `components/BottomNav.tsx` | BottomNav component |
| `components/browse/BrowseFilterSidebar.tsx` | Left-rail browse filters with shared geo control (SG-134). |
| `components/CommunityNavBar.tsx` |  |
| `components/conventions/ConventionsLeftRail.tsx` | ConventionsLeftRail component |
| `components/dancecard/organizer/people/PeopleHubHeader.tsx` | — |
| `components/dancecard/organizer/shell/OrganizerEventHeader.tsx` | — |
| `components/dancecard/organizer/shell/OrganizerEventSidebar.tsx` | — |
| `components/education/EducationLeftRail.tsx` | EducationLeftRail component |
| `components/education/EducationSectionHeader.tsx` | EducationSectionHeader component |
| `components/education/EducationSeriesNav.tsx` | EducationSeriesNav component |
| `components/events/EventsDiscoverLeftRail.tsx` | EventsDiscoverLeftRail component |
| `components/events/EventsLeftRail.tsx` | @deprecated Import EventsDiscoverLeftRail - discovery layout only. |
| `components/events/EventsPersonalNav.tsx` | EventsPersonalNav component |
| `components/events/EventsSectionNavLinks.tsx` | EventsSectionNavLinks component |
| `components/explore/ExploreHubHeader.tsx` | ExploreHubHeader component |
| `components/find-people/FindPeopleLeftRail.tsx` | FindPeopleLeftRail component |
| `components/groups/GroupsDiscoverLeftRail.tsx` | GroupsDiscoverLeftRail component |
| `components/groups/GroupsPersonalLeftRail.tsx` | GroupsPersonalLeftRail component |
| `components/groups/GroupsSectionNavLinks.tsx` | GroupsSectionNavLinks component |
| `components/Header.tsx` | Legacy: CommunityNavBar no longer duplicates browse links - show full nav in mobile menu. |
| `components/home/HomeDashboardLeftRail.tsx` | HomeDashboardLeftRail component |
| `components/home/homeFeedNavIcons.tsx` | — |
| `components/landing/MobilePublicNav.tsx` | MobilePublicNav component |
| `components/landing/PublicNav.tsx` | PublicNav component |
| `components/moderation/PlatformStaffNavLinks.tsx` | PlatformStaffNavLinks component |
| `components/organizer/org-console/OrganizerNavIcons.tsx` | — |
| `components/organizer/ui/OrganizerSidebarNav.tsx` | OrganizerSidebarNav component |
| `components/profile/edit/ProfileEditTabNav.tsx` | ProfileEditTabNav component |
| `components/profile/layout/ProfileCoverHeader.tsx` | Desktop cover band with overlapping avatar — identity zone top-left, actions top-right. |
| `components/profile/ProfileEditSectionNav.tsx` | ProfileEditSectionNav component |
| `components/profile/story/ProfileStorySidebar.tsx` | Condensed story cards for desktop left rail. |
| `components/RouteNavigationPending.tsx` | Thin top bar while a route transition is in flight (UI_UX follow-up C1). |
| `components/settings/SettingsBlockedSidebar.tsx` | SettingsBlockedSidebar component |
| `components/settings/SettingsMutedSidebar.tsx` | SettingsMutedSidebar component |
| `components/settings/SettingsNotificationBulkSidebar.tsx` | SettingsNotificationBulkSidebar component |
| `components/settings/SettingsPaymentHistorySidebar.tsx` | SettingsPaymentHistorySidebar component |
| `components/settings/SettingsPrivacySidebar.tsx` | SettingsPrivacySidebar component |
| `components/shell/PageHeader.tsx` | * Mobile-first page header with optional sticky behavior below site chrome. |
| `components/ui/SectionHeader.tsx` | SectionHeader component |
| `components/vendors/VendorShopHeader.tsx` | Full-bleed shop hero: banner strip + OVERLAY (text on image) or BELOW (card row for logo + title). |
| `components/vendors/VendorShopSidebar.tsx` | VendorShopSidebar component |

## Form components

| File | Purpose |
|------|---------|
| `components/activity/ActivityEmptyPanel.tsx` | ActivityEmptyPanel component |
| `components/connections/ConnectionsSendRequestPanel.tsx` | ConnectionsSendRequestPanel component |
| `components/contact/ContactForm.tsx` | ContactForm component |
| `components/contact/DmcaIntakeForm.tsx` | DmcaIntakeForm component |
| `components/conventions/ConventionAttendeeComparePanel.tsx` | ConventionAttendeeComparePanel component |
| `components/conventions/ConventionAttendeeGroupsPanel.tsx` | ConventionAttendeeGroupsPanel component |
| `components/conventions/ConventionAttendeeIsoMiniPanel.tsx` | ConventionAttendeeIsoMiniPanel component |
| `components/conventions/ConventionAttendeeProfilePanel.tsx` | ConventionAttendeeProfilePanel component |
| `components/conventions/ConventionDancecardPanel.tsx` | Value for `<input type="datetime-local" />` in the viewer's local timezone. |
| `components/conventions/ConventionFiltersPanel.tsx` | ConventionFiltersPanel component |
| `components/conventions/ConventionGetInvolvedPanel.tsx` | ConventionGetInvolvedPanel component |
| `components/conventions/ConventionProgramSchedulePanel.tsx` |  |
| `components/conventions/ConventionPublishedPoliciesPanel.tsx` | ConventionPublishedPoliciesPanel component |
| `components/create-flow/CreateFlowWizardUi.tsx` | — |
| `components/dancecard/organizer/AssignmentBoardPanel.tsx` | — |
| `components/dancecard/organizer/AttendeeGroupsModerationPanel.tsx` | — |
| `components/dancecard/organizer/BadgesPrintPanel.tsx` | — |
| `components/dancecard/organizer/DmCoveragePanel.tsx` | — |
| `components/dancecard/organizer/door/DoorModePanel.tsx` | — |
| `components/dancecard/organizer/EventSettingsPanel.tsx` | — |
| `components/dancecard/organizer/ExhibitorsOrganizerPanel.tsx` | — |
| `components/dancecard/organizer/ExportsHubPanel.tsx` | — |
| `components/dancecard/organizer/IcalBusyPreviewPanel.tsx` | — |
| `components/dancecard/organizer/ImportColumnMappingPanel.tsx` | — |
| `components/dancecard/organizer/IntegrationsPanel.tsx` | — |
| `components/dancecard/organizer/IsoModerationPanel.tsx` | — |
| `components/dancecard/organizer/KitchenMealPanel.tsx` | — |
| `components/dancecard/organizer/LiveOpsConsolePanel.tsx` | — |
| `components/dancecard/organizer/MessagingPanel.tsx` | — |
| `components/dancecard/organizer/PeopleDirectoryPanel.tsx` | — |
| `components/dancecard/organizer/PeopleHubPanel.tsx` | — |
| `components/dancecard/organizer/program/PresenterRequestsPanel.tsx` | — |
| `components/dancecard/organizer/RegistrantsPanel.tsx` | — |
| `components/dancecard/organizer/SafetyIncidentsPanel.tsx` | — |
| `components/dancecard/organizer/ScheduleImportPanel.tsx` | — |
| `components/dancecard/organizer/SessionFeedbackConfigPanel.tsx` | — |
| `components/dancecard/organizer/settings/ChannelsPanel.tsx` | — |
| `components/dancecard/organizer/settings/CommandTeamPanel.tsx` | — |
| `components/dancecard/organizer/settings/EventSettingsAdvancedForm.tsx` | — |
| `components/dancecard/organizer/settings/EventSettingsBasicsForm.tsx` | — |
| `components/dancecard/organizer/settings/EventSettingsBrandingForm.tsx` | Four-color presets that map 1:1 to `themeConfig` (accent / surface / elevated / slotPublished). |
| `components/dancecard/organizer/settings/EventSetupWizard.tsx` | — |
| `components/dancecard/organizer/settings/GalleryPanel.tsx` | — |
| `components/dancecard/organizer/settings/ParticipationSettingsPanel.tsx` | — |
| `components/dancecard/organizer/settings/PoliciesAgreementsPanel.tsx` | — |
| `components/dancecard/organizer/settings/StaffInviteLinksPanel.tsx` | — |
| `components/dancecard/organizer/ShiftSwapsPanel.tsx` | — |
| `components/dancecard/organizer/StaffShiftsPanel.tsx` | — |
| `components/dancecard/organizer/TrustedRolesPanel.tsx` | — |
| `components/dancecard/organizer/venue/VenueMapAssignPanel.tsx` | — |
| `components/dancecard/organizer/venue/VenuesSetupPanel.tsx` | — |
| `components/dancecard/organizer/venue/VenuesTabPanel.tsx` | — |
| `components/dancecard/organizer/VettingQueuePanel.tsx` | — |
| `components/dancecard/organizer/VolunteerCompliancePanel.tsx` | — |
| `components/dancecard/ui/Panel.tsx` | — |
| `components/education/EducationComingSoonPanel.tsx` | EducationComingSoonPanel component |
| `components/email/ScopeEmailBroadcastPanel.tsx` | ScopeEmailBroadcastPanel component |
| `components/email/ScopeEmailSignupForm.tsx` | ScopeEmailSignupForm component |
| `components/EventMatchmakerPanel.tsx` | EventMatchmakerPanel component |
| `components/events/EventDiscussionPanel.tsx` | EventDiscussionPanel component |
| `components/events/EventFiltersPanel.tsx` | EventFiltersPanel component |
| `components/explore/ExploreFiltersPanel.tsx` | ExploreFiltersPanel component |
| `components/FeedbackForm.tsx` | * Post-interaction feedback form for reputation. |
| `components/find-people/FindPeopleFiltersPanel.tsx` | FindPeopleFiltersPanel component |
| `components/groups/GroupsFiltersPanel.tsx` | GroupsFiltersPanel component |
| `components/home/HomeWelcomePanel.tsx` | HomeWelcomePanel component |
| `components/media/MediaEmptyPanel.tsx` | MediaEmptyPanel component |
| `components/messaging/MessagingEmptyPanel.tsx` | MessagingEmptyPanel component |
| `components/messaging/MessagingSafetyPanel.tsx` | MessagingSafetyPanel component |
| `components/moderation/ModerationIncidentClusterPanel.tsx` | ModerationIncidentClusterPanel component |
| `components/moderation/ModerationTrustSummaryPanel.tsx` | ModerationTrustSummaryPanel component |
| `components/moderation/ReputationIntegritySignalsPanel.tsx` | ReputationIntegritySignalsPanel component |
| `components/my-posts/MyPostsEmptyPanel.tsx` | MyPostsEmptyPanel component |
| `components/notifications/NotificationsEmptyPanel.tsx` | NotificationsEmptyPanel component |
| `components/onboarding/MemberOnboardingWizard.tsx` | MemberOnboardingWizard component |
| `components/org/OrgDiscordEmbedPanel.tsx` | OrgDiscordEmbedPanel component |
| `components/org/OrgVoicePanel.tsx` | OrgVoicePanel component |
| `components/organizer/admin/GroupCommunicationsAdminPanel.tsx` | GroupCommunicationsAdminPanel component |
| `components/organizer/admin/GroupForumModerationPanel.tsx` | GroupForumModerationPanel component |
| `components/organizer/admin/GroupMemberRolePanel.tsx` | Roles accepted by PATCH /api/v1/groups/:id/members/:userId |
| _…and 62 more_ | |

## Card / list / feed components

| File | Purpose |
|------|---------|
| `components/cards/ConventionCard.tsx` | ConventionCard component |
| `components/cards/EducationCard.tsx` | EducationCard component |
| `components/cards/EventCard.tsx` | EventCard component |
| `components/cards/GroupCard.tsx` | GroupCard component |
| `components/cards/LocalPostCard.tsx` | LocalPostCard component |
| `components/cards/OrgCard.tsx` | OrgCard component |
| `components/cards/PersonCard.tsx` | Mini profile preview - no gender, pronouns, or orientation (those live on the full profile only). |
| `components/cards/PresenterCard.tsx` | PresenterCard component |
| `components/cards/VendorCard.tsx` | VendorCard component |
| `components/conventions/ConventionsFeaturedCard.tsx` | ConventionsFeaturedCard component |
| `components/conventions/ConventionsListRow.tsx` | ConventionsListRow component |
| `components/conventions/DancecardOpsCard.tsx` | DancecardOpsCard component |
| `components/conventions/HostedByCard.tsx` | HostedByCard component |
| `components/conventions/RegisterToUnlockCard.tsx` | RegisterToUnlockCard component |
| `components/dancecard/organizer/BadgePrintCard.tsx` | — |
| `components/dancecard/organizer/people/PeopleHelpCard.tsx` | — |
| `components/dancecard/organizer/program/ProgramVisibilityCard.tsx` | — |
| `components/dancecard/organizer/SessionFeedbackConfigPanel.tsx` | — |
| `components/education/EducationArticleCard.tsx` | Extra pills after the eyebrow category — skips duplicates of primary category and difficulty. |
| `components/education/EducationArticleStripCard.tsx` | EducationArticleStripCard component |
| `components/education/EducationRecentTextCard.tsx` | EducationRecentTextCard component |
| `components/education/EducationVideoStripCard.tsx` | EducationVideoStripCard component |
| `components/events/EventsListRow.tsx` | EventsListRow component |
| `components/explore/ExploreFeaturedTrendingCard.tsx` | Hero-style featured trending card for Explore mobile curation. |
| `components/feed/FeedInteractionIcons.tsx` | Feed interaction iconography - reactions (Love, Respect, Sympathize, Helpful) and community actions. |
| `components/feed/FeedPostDiscussion.tsx` | FeedPostDiscussion component |
| `components/feed/FeedPostTypeBadge.tsx` | FeedPostTypeBadge component |
| `components/feed/FeedReactionsRow.tsx` | FeedReactionsRow component |
| `components/FeedbackForm.tsx` | * Post-interaction feedback form for reputation. |
| `components/find-people/FindPeopleProfileCard.tsx` | FindPeopleProfileCard component |
| `components/group/GroupFeedbackSection.tsx` | GroupFeedbackSection component |
| `components/groups/GroupDiscoverCard.tsx` | GroupDiscoverCard component |
| `components/groups/GroupDiscoverListCard.tsx` | GroupDiscoverListCard component |
| `components/home/ActivityFeedCard.tsx` | ActivityFeedCard component |
| `components/home/FeedComposerQuickActions.tsx` | FeedComposerQuickActions component |
| `components/home/FeedScopeTabs.tsx` | FeedScopeTabs component |
| `components/home/HomeFeedDiscoverRail.tsx` | HomeFeedDiscoverRail component |
| `components/home/HomeFeedMockComposer.tsx` | Short CC0 sample for mock-only audio attachment preview. |
| `components/home/homeFeedNavIcons.tsx` | — |
| `components/home/HomeFeedRichComposer.tsx` | HomeFeedRichComposer component |
| `components/home/HomeFeedShellComposer.tsx` | HomeFeedShellComposer component |
| `components/home/HomeFeedSuggestedPerson.tsx` | HomeFeedSuggestedPerson component |
| `components/home/HomeUpcomingEventCard.tsx` | HomeUpcomingEventCard component |
| `components/home/LocalHomeFeed.tsx` | LocalHomeFeed component |
| `components/home/TrendingItemCard.tsx` | TrendingItemCard component |
| `components/home/VendorListingMiniCard.tsx` | VendorListingMiniCard component |
| `components/landing/LandingDanceCardMock.tsx` | Decorative Dance Card dashboard preview — not functional. |
| `components/LoginCard.tsx` | Landing signup checkbox with 44px hit area (audit-safe). |
| `components/media/MediaChannelCard.tsx` | MediaChannelCard component |
| `components/my-posts/MyPostListCard.tsx` | MyPostListCard component |
| `components/org/hub/OrgHubSectionCard.tsx` | — |
| `components/org/OrgAnchorAttendeesCard.tsx` | OrgAnchorAttendeesCard component |
| `components/organizer/org-console/PublicHubPreviewCard.tsx` | PublicHubPreviewCard component |
| `components/organizer/org-console/QuickActionsCard.tsx` | QuickActionsCard component |
| `components/organizer/org-console/RolePermissionsCard.tsx` | RolePermissionsCard component |
| `components/organizer/org-console/UpcomingOrgEventsCard.tsx` | UpcomingOrgEventsCard component |
| `components/organizer/people/PublicPersonnelPreviewCard.tsx` | PublicPersonnelPreviewCard component |
| `components/organizer/tools/ComingSoonPaymentsCard.tsx` | ComingSoonPaymentsCard component |
| `components/organizer/tools/QuickLinksCard.tsx` | QuickLinksCard component |
| `components/organizer/ui/OrganizerSetupCard.tsx` | OrganizerSetupCard component |
| `components/orgs/OrgCreateBenefitCards.tsx` | OrgCreateBenefitCards component |
| `components/orgs/OrgDirectoryCard.tsx` | OrgDirectoryCard component |
| `components/profile/ProfileAgeConfirmationCard.tsx` | ProfileAgeConfirmationCard component |
| `components/profile/ProfileAttendedEventCard.tsx` | ProfileAttendedEventCard component |
| `components/profile/ProfileEditCompletionCard.tsx` | ProfileEditCompletionCard component |
| `components/profile/ProfileGroupCard.tsx` | ProfileGroupCard component |
| `components/profile/story/ProfileAboutCard.tsx` | ProfileAboutCard component |
| `components/profile/story/ProfileCard.tsx` | ProfileCard component |
| `components/profile/story/ProfileCommunitySnapshotCard.tsx` | ProfileCommunitySnapshotCard component |
| `components/profile/story/ProfileFeedbackCard.tsx` | ProfileFeedbackCard component |
| `components/profile/story/ProfileHeroCard.tsx` | ProfileHeroCard component |
| `components/profile/story/ProfileLookingForCard.tsx` | ProfileLookingForCard component |
| `components/profile/story/ProfileOrganizationsCard.tsx` | ProfileOrganizationsCard component |
| `components/profile/story/ProfilePersonalityCard.tsx` | ProfilePersonalityCard component |
| `components/profile/story/ProfileUpcomingEventsCard.tsx` | ProfileUpcomingEventsCard component |
| `components/profile/studio/ProfileStudioInsetCard.tsx` | ProfileStudioInsetCard component |
| `components/profile/studio/ProfileStudioSectionCard.tsx` | Wrapper matching public profile story cards for edit sections. |
| `components/profile/studio/ProfileStudioStrengthCard.tsx` | ProfileStudioStrengthCard component |
| `components/settings/SettingsActivityFeedSections.tsx` | SettingsActivityFeedSections component |
| `components/templates/FeedTemplate.tsx` | Feed surfaces — home, group, org activity. |

## Modal / sheet / dialog components

| File | Purpose |
|------|---------|
| `components/CreateFlowModal.tsx` | CreateFlowModal component |
| `components/dancecard/organizer/BadgePrintSheet.tsx` | — |
| `components/dancecard/organizer/GoogleSheetsImportSection.tsx` | — |
| `components/dancecard/organizer/PersonDetailDrawer.tsx` | — |
| `components/dancecard/organizer/ScheduleChangeImpactModal.tsx` | — |
| `components/dancecard/organizer/SessionDetailDrawer.tsx` | — |
| `components/dancecard/organizer/ui/EntityPickerModal.tsx` | — |
| `components/dancecard/organizer/ui/OrganizerConfirmDialog.tsx` | — |
| `components/dancecard/organizer/ui/useConfirmDialog.tsx` | — |
| `components/group/CreateGroupModal.tsx` | CreateGroupModal component |
| `components/group/GroupJoinRulesModal.tsx` | GroupJoinRulesModal component |
| `components/media/MediaAttestationModal.tsx` | MediaAttestationModal component |
| `components/moderation/AdminStepUpModal.tsx` | AdminStepUpModal component |
| `components/moderation/TsReportModal.tsx` | TsReportModal component |
| `components/organizer/ui/OrganizerPublishConfirmDialog.tsx` | OrganizerPublishConfirmDialog component |
| `components/profile/ProfileAgeConfirmationCard.tsx` | ProfileAgeConfirmationCard component |
| `components/settings/AccountAgeConfirmationPanel.tsx` | AccountAgeConfirmationPanel component |
| `components/shell/CreateSheet.tsx` | CreateSheet component |
| `components/support/ContentReportDialog.tsx` | ContentReportDialog component |
| `components/templates/FilterSheet.tsx` | * Mobile filter bottom sheet — canonical filter UX for directory routes. |
| `components/ui/ConfirmDialog.tsx` | In-app replacement for `window.confirm`. |
| `components/ui/Dialog.tsx` | Dialog component |

## UI primitives (`components/ui/`)

| File | Purpose |
|------|---------|
| `components/ui/AppToast.tsx` | — |
| `components/ui/Badge.tsx` | Badge component |
| `components/ui/Button.tsx` | Button component |
| `components/ui/Card.tsx` | * Shared card container - ECKE elevated panel (matches dancecard Panel). |
| `components/ui/ComingSoonLayout.tsx` | * Consistent “coming soon” shell for placeholder routes (audit §4.4 / §4.6). |
| `components/ui/CommunityHubShell.tsx` | CommunityHubShell component |
| `components/ui/ConfirmDialog.tsx` | In-app replacement for `window.confirm`. |
| `components/ui/ContentPanel.tsx` | — |
| `components/ui/CopyLinkOverflowMenu.tsx` | CopyLinkOverflowMenu component |
| `components/ui/Dialog.tsx` | Dialog component |
| `components/ui/empty-state-presets.tsx` | — |
| `components/ui/EmptyState.tsx` | EmptyState component |
| `components/ui/FormField.tsx` | FormField component |
| `components/ui/LabelCombobox.tsx` | LabelCombobox component |
| `components/ui/LegalDocumentTemplate.tsx` | * Shared layout for long policy / legal document pages — draft banner, section anchors, |
| `components/ui/LegalDraftPage.tsx` | — |
| `components/ui/LoadErrorBanner.tsx` | LoadErrorBanner component |
| `components/ui/MarkdownContent.tsx` | MarkdownContent component |
| `components/ui/MediaCard.tsx` | MediaCard component |
| `components/ui/PermissionDeniedPanel.tsx` | Signed-in user lacks access - explain why and offer a clear exit. |
| `components/ui/PlaceholderPanel.tsx` |  |
| `components/ui/PolicyStandardPage.tsx` |  |
| `components/ui/primitives/dashboard.tsx` | — |
| `components/ui/primitives/layout.tsx` | — |
| `components/ui/SectionHeader.tsx` | SectionHeader component |
| `components/ui/skeleton/C2kSkeleton.tsx` | Feed rail / activity card placeholder grid. |
| `components/ui/StatusBanner.tsx` | StatusBanner component |
| `components/ui/TabButton.tsx` | TabButton component |
| `components/ui/TabShell.tsx` | ECKE-style rounded tab shell - children should be `TabShellButton` / `PillTab`. |
| `components/ui/TagMultiSelect.tsx` | TagMultiSelect component |
| `components/ui/TagSelector.tsx` | TagSelector component |
| `components/ui/TextInput.tsx` | — |

## Duplication matrix

| Group | Severity | Files | Notes |
|-------|----------|-------|-------|
| button | high | 0 | Twin Button implementations with different size APIs —  |
| confirm-dialog | high | 1 | Parallel confirm dialog stacks — `hooks/useConfirm.tsx` |
| card-panel | high | 0 | Card vs Panel vs OrganizerPanel containers —  |
| left-rails | medium | 8 | Per-vertical discover/personal left rails (8+ files) — `components/conventions/ConventionsLeftRail.tsx`, `components/education/EducationLeftRail.tsx`, `components/events/EventsDiscoverLeftRail.tsx`… |
| settings-sidebars | medium | 0 | Repeated settings sub-nav sidebars —  |
| organizer-shells | high | 1 | Three organizer layout systems — `layouts/OrganizerScopeShell.tsx` |
| skeleton | medium | 0 | Twin skeleton libraries —  |
| toast | low | 0 | Toast re-exports / aliases —  |
| community-hub | medium | 0 | Near-identical org/group hub wrappers —  |
| public-nav | low | 0 | Twin public landing headers —  |
| feed-composers | medium | 0 | Three feed composer implementations —  |
| group-discover-cards | medium | 0 | Grid vs list card for same entity —  |
| tab-systems | medium | 0 | Multiple tab button implementations —  |

## Component consolidation plan

| Family | Canonical | Deprecate | Risk | Import refs | Replacement API |
|--------|-----------|-----------|------|-------------|-----------------|
| button | components/ui/Button.tsx | `components/dancecard/ui/Button.tsx` | high | ~17 | `variant` primary\|secondary\|ghost\|danger; `size` sm\|md\|lg; mobile min-h-11 |
| confirm-dialog | components/ui/ConfirmDialog.tsx + hooks/useConfirm.tsx | `components/dancecard/organizer/ui/OrganizerConfirmDialog.tsx`, `useConfirmDialog.tsx` | high | ~24 | Promise-based confirm via `useConfirm()`; single portal + focus trap |
| card-panel | components/ui/Card.tsx | `components/dancecard/ui/Panel.tsx`, `components/organizer/ui/OrganizerPanel.tsx` | high | ~27 | Elevated surface with `dc-*` tokens; optional title/footer slots |
| organizer-shells | components/organizer/ui/OrganizerAppShell.tsx | `components/dancecard/organizer/shell/OrganizerEventShell.tsx`, `layouts/OrganizerScopeShell.tsx` | high | ~7 | Single organizer frame: sidebar, breadcrumbs, command palette, mobile tab collapse |
| left-rails | NEW: DirectorySidebar or FilterSheet | `components/conventions/ConventionsLeftRail.tsx`, `components/education/EducationLeftRail.tsx`… | medium | ~17 | Desktop sidebar + mobile bottom sheet from one filter state hook |
| tab-systems | components/ui/TabShell.tsx + TabButton.tsx | `components/dancecard/ui/PillTab.tsx`, `GroupsSectionTabs`… | medium | ~5 | Pill tabs with keyboard roving; scrollable on mobile |
| form-controls | components/ui/FormField.tsx + TextInput.tsx | `DatetimeLocalField (organizer-only)`, `inline raw inputs in panels` | medium | ~5 | Label + hint + error; 44px touch targets |
| modals-sheets | components/ui/Dialog.tsx | `OrganizerConfirmDialog portal`, `feature-specific modals without Dialog base` | medium | ~8 | centered modal + mobile bottom sheet modes; wizard layout slot |

## Contract primitives — readiness matrix

| Primitive | Status | Nearest file | Notes |
|-----------|--------|--------------|-------|
| AppShell | **Missing** | `layouts/RootLayout.tsx` | No unified mobile frame; chrome split across Header, CommunityNavBar, BottomNav |
| MobileBottomNav | **Exists and usable** | `components/BottomNav.tsx` | Works but Create slot should become FAB/sheet |
| MobileActionBar | **Missing** | `—` | Critical for forms, wizards, moderation — no shared sticky submit |
| PageHeader | **Exists but not mobile-ready** | `components/ui/SectionHeader.tsx` | No sticky/safe-area contract |
| SectionCard | **Exists and usable** | `components/ui/primitives/layout.tsx` | SectionCard + FeatureCard in primitives |
| EntityCard | **Exists but duplicated** | `components/cards/*` | Per-entity cards; grid/list twins for groups |
| FeedCard | **Exists and usable** | `components/cards/LocalPostCard.tsx` | Report/mute access varies by surface |
| WizardShell | **Exists but not mobile-ready** | `OnboardingShell, CreateFlowWizardUi` | No shared sticky bottom primary action |
| StickySubmitBar | **Missing** | `—` | Profile edit save bar is page-local only |
| BottomSheet | **Exists and usable** | `components/ui/Dialog.tsx` | Dialog supports sheet mode |
| FilterSheet | **Exists but not mobile-ready** | `*FiltersPanel.tsx` | Desktop panels; not bottom sheets on mobile |
| EmptyState | **Exists and usable** | `components/ui/EmptyState.tsx` |  |
| SkeletonCard | **Exists but duplicated** | `C2kSkeleton + DancecardSkeleton` | Twin skeleton systems |
| ReportButton | **Exists and usable** | `ContentReportDialog, PlatformReportForm` | Not on every feed card consistently |
| BlockUserButton | **Exists but not mobile-ready** | `settings/blocked` | Settings-only; not inline on profiles everywhere |
| PrivacyVisibilityChip | **Partial** | `profile edit panels` | No shared chip component |
| TrustSafetyBadge | **Exists and usable** | `TrustRing, Badge` |  |

## Proposed contract gap table (legacy)

| Primitive | Status | Nearest existing file(s) |
|-----------|--------|--------------------------|
| AppShell | **duplicate** | `components/organizer/ui/OrganizerAppShell.tsx`, `components/shell/AppShell.tsx`, `layouts/RootLayout.tsx` |
| MobileBottomNav | **duplicate** | `components/BottomNav.tsx`, `components/shell/AppShell.tsx`, `layouts/RootLayout.tsx` |
| DesktopTopNav | **duplicate** | `components/dancecard/organizer/people/PeopleHubHeader.tsx`, `components/dancecard/organizer/shell/OrganizerEventHeader.tsx`, `components/education/EducationSectionHeader.tsx`, `components/explore/ExploreHubHeader.tsx`, `components/Header.tsx` |
| PageHeader | **duplicate** | `components/education/EducationPathsPage.tsx`, `components/education/EducationSectionHeader.tsx`, `components/explore/ExploreHubHeader.tsx`, `components/organizer/admin/OrganizerGroupModerationPanel.tsx`, `components/organizer/communications/OrganizerOrgCommunicationsPanel.tsx` |
| MobileActionBar | **duplicate** | `components/profile/studio/ProfileStudioSaveBar.tsx`, `components/shell/MobileActionBar.tsx`, `components/templates/DetailTemplate.tsx`, `components/templates/SettingsTemplate.tsx`, `components/templates/WizardTemplate.tsx` |
| SectionCard | **duplicate** | `components/group/CreateGroupModal.tsx`, `components/landing/LandingValuePillars.tsx`, `components/org/hub/OrgHubAboutTab.tsx`, `components/org/hub/OrgHubCalendarTab.tsx`, `components/org/hub/OrgHubSectionCard.tsx` |
| EntityCard | **duplicate** | `components/cards/GroupCard.tsx`, `components/cards/OrgCard.tsx`, `components/cards/PersonCard.tsx`, `components/profile/ProfileGroupCard.tsx` |
| FeedCard | **duplicate** | `components/cards/LocalPostCard.tsx`, `components/home/ActivityFeedCard.tsx`, `components/home/LocalHomeFeed.tsx` |
| ProfilePreviewCard | **duplicate** | `components/explore/ExplorePeopleMayKnowSection.tsx`, `components/find-people/FindPeopleProfileCard.tsx` |
| EventCard | **duplicate** | `components/cards/ConventionCard.tsx`, `components/cards/EventCard.tsx`, `components/group/GroupEventsSection.tsx`, `components/home/HomeUpcomingEventCard.tsx`, `components/home/LocalHomeFeed.tsx` |
| GroupCard | **duplicate** | `components/cards/GroupCard.tsx`, `components/groups/GroupDiscoverCard.tsx`, `components/groups/GroupDiscoverListCard.tsx`, `components/profile/ProfileGroupCard.tsx` |
| OrgCard | **duplicate** | `components/cards/OrgCard.tsx`, `components/orgs/OrgDirectoryCard.tsx` |
| TrustSafetyBadge | **duplicate** | `components/TrustRing.tsx`, `components/TrustTierIndicator.tsx` |
| PrivacyVisibilityChip | **partial** | — |
| ReportButton | **duplicate** | `components/moderation/ReportAction.tsx`, `components/moderation/TsReportModal.tsx`, `components/support/ContentReportDialog.tsx`, `components/support/PlatformReportForm.tsx` |
| BlockUserButton | **duplicate** | `components/profile/ProfileMeHub.tsx`, `components/settings/BlockedMembersPanel.tsx`, `components/settings/SettingsBlockedSections.tsx`, `components/settings/SettingsBlockedSidebar.tsx`, `components/settings/SettingsMessagingPresets.tsx` |
| SearchFilterBar | **duplicate** | `components/explore/ExploreFiltersPanel.tsx`, `components/explore/ExploreHubHeader.tsx`, `components/find-people/FindPeopleFiltersPanel.tsx`, `components/find-people/FindPeopleLeftRail.tsx` |
| FilterSheet | **duplicate** | `components/conventions/ConventionFiltersPanel.tsx`, `components/conventions/ConventionsLeftRail.tsx`, `components/events/EventFiltersPanel.tsx`, `components/events/EventsDiscoverLeftRail.tsx`, `components/explore/ExploreFiltersPanel.tsx` |
| Tabs | **duplicate** | `components/conventions/ConventionScheduleAgenda.tsx`, `components/dancecard/organizer/ui/OrganizerSectionTabs.tsx`, `components/dancecard/ui/PillTab.tsx`, `components/groups/GroupsSectionTabs.tsx`, `components/profile/ProfileTabBar.tsx` |
| BottomSheet | **partial** | — |
| OverflowMenu | **duplicate** | `components/cards/LocalPostCard.tsx`, `components/group/GroupCommunityShell.tsx`, `components/home/ActivityFeedCard.tsx`, `components/ui/CopyLinkOverflowMenu.tsx` |
| WizardShell | **duplicate** | `components/create-flow/CreateFlowWizardUi.tsx`, `components/group/CreateGroupModal.tsx`, `components/presenters/onboarding/shared/OfferingCatalogStep.tsx`, `components/presenters/onboarding/shared/OnboardingShell.tsx`, `components/presenters/onboarding/shared/ProfileBasicsStep.tsx` |
| StepProgress | **duplicate** | `components/CreateFlowModal.tsx`, `components/group/CreateGroupModal.tsx` |
| StickySubmitBar | **missing** | — |
| EmptyState | **duplicate** | `components/dancecard/organizer/people/PeopleEmptyState.tsx`, `components/dancecard/organizer/SafetyIncidentsPanel.tsx`, `components/dancecard/organizer/ShiftSwapsPanel.tsx`, `components/dancecard/organizer/VolunteerCompliancePanel.tsx`, `components/events/EventDiscussionPanel.tsx` |
| SkeletonCard | **duplicate** | `components/dancecard/organizer/IntegrationsPanel.tsx`, `components/dancecard/organizer/MessagingPanel.tsx`, `components/dancecard/organizer/ui/DancecardSkeleton.tsx`, `components/profile/ProfilePhotoManager.tsx`, `components/settings/SettingsBlockedSections.tsx` |
| UploadDropzone | **duplicate** | `components/group/GroupPhotosSection.tsx`, `components/PhotoUpload.tsx`, `components/profile/ProfileIsoEditor.tsx`, `components/profile/ProfilePhotoManager.tsx` |
| MediaSafetyNotice | **duplicate** | `components/media/MediaAttestationModal.tsx`, `components/profile/ProfilePhotoManager.tsx` |
| AdvancedDisclosure | **partial** | — |

## Architecture notes

- **Primary shared layer:** `components/ui/` — intended design system entry point.
- **Parallel stack:** `components/dancecard/` and `components/organizer/` maintain duplicate primitives (Button, Panel, confirm, skeleton).
- **Consolidation priority:** Button → ConfirmDialog → Panel/Card → Tabs → LeftRails before page template migration.
