# UI Desktop Component Inventory — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

**Scope:** `packages/web/src/components/` (~631 files). Desktop-relevant shells, rails, and duplicate clusters.

## Summary

- **Component files scanned:** 636
- **High-severity duplicate groups:** 4
- **Contract primitive gaps:** 1 missing, 3 partial

## App shell components (desktop)

| Component | Path | Desktop role |
|-----------|------|--------------|
| Header | `components/Header.tsx` | Primary top bar — search, create menu, notifications, profile |
| Footer | `components/Footer.tsx` | Marketing/legal footer (desktop visible) |
| RootLayout | `layouts/RootLayout.tsx` | Wraps all routes except door kiosk |
| AppShell | `components/shell/AppShell.tsx` | Max-width member page container |
| DirectoryTemplate | `components/templates/DirectoryTemplate.tsx` | 3-col discover layout |
| DetailTemplate | `components/templates/DetailTemplate.tsx` | Entity detail with hero + tabs |
| DashboardTemplate | `components/templates/DashboardTemplate.tsx` | Organizer/moderation dashboards |
| PersonalUtilityPageShell | `components/layout/PersonalUtilityPageShell.tsx` | Left rail personal utilities |
| OrganizerAppShell | `components/organizer/ui/OrganizerAppShell.tsx` | Organizer sidebar + command palette |
| ModerationShell | `components/moderation/ModerationShell.tsx` | Moderation workspace |
| CommunityHubShell | `components/ui/CommunityHubShell.tsx` | Org/group community hub |

### Desktop left rails (8)

`BrowseFilterSidebar`, `HomeDashboardLeftRail`, `EventsDiscoverLeftRail`, `GroupsDiscoverLeftRail`, `ConventionsLeftRail`, `EducationLeftRail`, `FindPeopleLeftRail`, settings sidebars.

### Desktop right rails (12)

`ActivityRightRail`, `ConnectionsRightRail`, `EducationRightRail`, `EventsRightRail`, `FindPeopleRightRail`, `GroupsRightRail`, `MediaRightRail`, `MyPostsRightRail`, `OrganizationsRightRail`, `SavedRightRail`, `VendorsRightRail`, `EventsPersonalRightRail`.

## App shell / layout

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

## Navigation

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

## Cards & feed items

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
| `components/trust/CommunityTrustCard.tsx` | CommunityTrustCard component |
| `components/ui/Card.tsx` | * Shared card container - ECKE elevated panel (matches dancecard Panel). |
| `components/ui/MediaCard.tsx` | MediaCard component |

## Forms & wizards

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
| `components/organizer/admin/GroupSettingsPanel.tsx` | GroupSettingsPanel component |
| `components/organizer/admin/OrganizerGroupModerationPanel.tsx` | OrganizerGroupModerationPanel component |
| `components/organizer/admin/OrganizerOrgModerationPanel.tsx` | — |
| `components/organizer/admin/OrgBioEditorPanel.tsx` | OrgBioEditorPanel component |
| `components/organizer/admin/OrgChatModerationPanel.tsx` | OrgChatModerationPanel component |
| `components/organizer/admin/OrgContentEditorPanel.tsx` | OrgContentEditorPanel component |
| `components/organizer/admin/OrgEmailListPanel.tsx` | OrgEmailListPanel component |
| `components/organizer/admin/OrgForumModerationPanel.tsx` | OrgForumModerationPanel component |
| `components/organizer/admin/OrgGalleryAdminPanel.tsx` | DB may still hold `/seed/paf/*` paths; serve via `/api/public-seed/paf/*` instead. |
| `components/organizer/admin/OrgMemberAdminPanel.tsx` | OrgMemberAdminPanel component |
| `components/organizer/admin/OrgSubgroupAdminPanel.tsx` | OrgSubgroupAdminPanel component |
| `components/organizer/communications/OrganizerOrgCommunicationsPanel.tsx` | OrganizerOrgCommunicationsPanel component |
| `components/organizer/EventContributorsPanel.tsx` | EventContributorsPanel component |
| `components/organizer/EventOrganizerPanel.tsx` | EventOrganizerPanel component |
| `components/organizer/moderation/OrganizerOrgModerationPanel.tsx` | OrganizerOrgModerationPanel component |
| `components/organizer/org-console/OrganizerOrgHomePanel.tsx` | OrganizerOrgHomePanel component |
| `components/organizer/OrganizerCommunicationsPanel.tsx` | OrganizerCommunicationsPanel component |
| `components/organizer/OrganizerGroupSettingsPanel.tsx` | OrganizerGroupSettingsPanel component |
| `components/organizer/OrganizerHomePanel.tsx` | OrganizerHomePanel component |
| `components/organizer/OrganizerOrgSettingsPanel.tsx` | OrganizerOrgSettingsPanel component |
| `components/organizer/OrganizerPeoplePanel.tsx` | OrganizerPeoplePanel component |
| `components/organizer/OrganizerSchedulePanel.tsx` | OrganizerSchedulePanel component |
| `components/organizer/OrganizerToolsPanel.tsx` | OrganizerToolsPanel component |
| `components/organizer/people/OrganizerOrgPeoplePanel.tsx` | OrganizerOrgPeoplePanel component |
| `components/organizer/schedule/OrganizerOrgSchedulePanel.tsx` | OrganizerOrgSchedulePanel component |
| `components/organizer/ScopeBrandingPanel.tsx` | ScopeBrandingPanel component |
| `components/organizer/tools/OrganizerOrgToolsPanel.tsx` | OrganizerOrgToolsPanel component |
| `components/organizer/ui/OrganizerFormSection.tsx` | OrganizerFormSection component |
| `components/organizer/ui/OrganizerPanel.tsx` | OrganizerPanel component |
| `components/presenters/PresenterOnboardingWizard.tsx` | — |
| `components/profile/edit/AboutPanel.tsx` | AboutPanel component |
| `components/profile/edit/CommunityIdentityPanel.tsx` | CommunityIdentityPanel component |
| `components/profile/edit/FetishesPanel.tsx` | @deprecated Use InterestsPanel - route redirects to /profile/edit/interests |
| `components/profile/edit/InterestsPanel.tsx` | InterestsPanel component |
| `components/profile/edit/LookingForPanel.tsx` | LookingForPanel component |
| `components/profile/edit/PrivacyPanel.tsx` | PrivacyPanel component |
| `components/profile/edit/ProfileBasicsPanel.tsx` | ProfileBasicsPanel component |
| `components/profile/edit/RelationshipsPanel.tsx` | RelationshipsPanel component |
| `components/profile/edit/WebsitesPanel.tsx` | WebsitesPanel component |
| `components/profile/layout/ProfileMediaTabPanel.tsx` | Desktop: writing left, photos right. Mobile: stacked. |
| `components/profile/ProfileEditEcosystemPanel.tsx` | ProfileEditEcosystemPanel component |
| `components/profile/ProfileFinishPanel.tsx` | ProfileFinishPanel component |
| `components/profile/ProfileReferencesPanel.tsx` | ProfileReferencesPanel component |
| `components/profile/ProfileTrustPanel.tsx` | ProfileTrustPanel component |
| `components/saved/SavedEmptyPanel.tsx` | SavedEmptyPanel component |
| `components/settings/AccountAgeConfirmationPanel.tsx` | AccountAgeConfirmationPanel component |
| `components/settings/BlockedMembersPanel.tsx` | Embedded blocked list (legacy privacy composite). Prefer `/settings/blocked`. |
| `components/settings/SettingsMutedTagsPanel.tsx` | SettingsMutedTagsPanel component |
| `components/settings/SettingsPrivacyDataPanel.tsx` | SettingsPrivacyDataPanel component |
| `components/support/PlatformReportForm.tsx` | PlatformReportForm component |
| `components/templates/WizardTemplate.tsx` | Multi-step create/setup flows. |
| `components/trust/ScopedMemberStandingPanel.tsx` | ScopedMemberStandingPanel component |
| `components/ui/ContentPanel.tsx` | — |
| `components/ui/FormField.tsx` | FormField component |
| `components/ui/LabelCombobox.tsx` | LabelCombobox component |
| `components/ui/PermissionDeniedPanel.tsx` | Signed-in user lacks access - explain why and offer a clear exit. |
| `components/ui/PlaceholderPanel.tsx` |  |
| `components/ui/TextInput.tsx` | — |
| `components/VendorExternalStorePanel.tsx` | VendorExternalStorePanel component |
| `components/vendors/VendorOnboardingWizard.tsx` | VendorOnboardingWizard component |
| `components/vendors/VendorsFiltersPanel.tsx` | VendorsFiltersPanel component |
| `components/vendors/VendorShopAppearancePanel.tsx` | VendorShopAppearancePanel component |

## Modals, sheets, tables

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

## UI primitives

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

## Card taxonomy (desktop)

| Category | Canonical | Variants / duplicates |
|----------|-----------|----------------------|
| Event | `cards/EventCard.tsx` | `EventsListRow`, `ExploreCompactEventRow`, `HomeUpcomingEventCard`, `ProfileAttendedEventCard` |
| Convention | `cards/ConventionCard.tsx` | `ConventionsFeaturedCard`, list rows |
| Group | `cards/GroupCard.tsx` | `GroupDiscoverCard`, `GroupDiscoverListCard` |
| Person/Profile | `find-people/FindPeopleProfileCard.tsx` | `cards/PersonCard`, `ProfileHeroCard`, 10+ story cards |
| Vendor | `cards/VendorCard.tsx` | `VendorListingMiniCard` |
| Education | `cards/EducationCard.tsx` | `EducationArticleCard`, strip cards, video cards |
| Feed | `cards/LocalPostCard.tsx` | `ActivityFeedCard`, trending rows |
| Dashboard | `templates/DashboardTemplate` → `DashboardCard` | Organizer setup/quick-action cards |
| Empty state | `ui/EmptyState.tsx` | 10+ domain `*EmptyPanel` copies |

## Duplicate components (same visual problem)

| Cluster | Severity | Files | Recommendation |
|---------|----------|-------|----------------|
| — | high |  | Consolidate before page redesign |
| — | high | hooks/useConfirm.tsx | Consolidate before page redesign |
| — | high |  | Consolidate before page redesign |
| — | medium | components/conventions/ConventionsLeftRail.tsx, components/education/EducationLeftRail.tsx, components/events/EventsDiscoverLeftRail.tsx | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |
| — | high | layouts/OrganizerScopeShell.tsx | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |
| — | low |  | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |
| — | low |  | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |
| — | medium |  | Consolidate before page redesign |

## Desktop consolidation hotspots

1. **Empty states** — unify on `EmptyState` + presets
2. **Discover filter panels** — seven parallel implementations
3. **Left/right rails** — parameterize `DirectoryTemplate`
4. **Scope tab bars** — ~12 wrappers over `TabShell`
5. **Card containers** — `Card` vs `Panel` vs `SectionCard` vs `DashboardCard`
6. **Confirm dialogs** — three stacks (ui, dancecard, organizer)

Full machine-readable inventory: [`docs/audits/ui/generated/components-inventory.json`](audits/ui/generated/components-inventory.json)
