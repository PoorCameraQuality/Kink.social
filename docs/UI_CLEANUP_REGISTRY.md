# UI Cleanup Registry

Tracks questionable, misleading, or permission-inaccurate UI across C2K. Seeded from the **Frontend UI Cleanup Audit** (June 2026). Use when adding controls so dead buttons, duplicate nav, and fake publish paths do not reappear.

**North star:** If a user can see it, it must be working, clearly informational, clearly disabled with honest explanation, permission-gated, or an intentional empty state.

**Status values:** `active` | `hidden` | `removed` | `gated` | `clarified` | `coming soon` | `needs backend`

---

## Convention Command Bridge

| Route | Component / file | UI element | Status | Backend support | Permission | Decision | Notes |
|-------|------------------|------------|--------|-----------------|------------|----------|-------|
| `?tab=import` | `ScheduleImportPanel.tsx` | Demo buttons (blank event, PAF, drag/drop) | gated | Partial (local/demo) | `scheduler` | Gate behind `import.meta.env.DEV` | H1 — production must not show dev seeding |
| `?tab=dashboard` | `DashboardAttendeeSurfaces.tsx` | Program visibility row | clarified | Partial (`ecke-publish`, slot stats) | Any bridge user | Use slot publish stats, not `event.status` | H2 — per-slot publish model |
| `?tab=dashboard` | `DashboardAttendeeSurfaces.tsx` | Build publish preview CTA | gated | Yes (`/organizer/ecke-publish`) | `isFullAdmin` or integrations tab | Hide for registration-only users | H5 — Integrations is admin-only |
| `?tab=dashboard` | `OrganizerEventDashboard.tsx` | Door mode quick link | gated | Yes | `registration` or admin | Align with sidebar rule | M4 — sidebar already gates |
| `?tab=program` | `ProgramTab.tsx` | Footer ECKE publish copy | clarified | Yes (Integrations only) | admin | Integrations only, not Exports | M6 |
| `?tab=program` | `ProgramTab.tsx` / public convention | Preview attendee schedule | clarified | Partial (slot `isPublished` filter) | Any | Rename; verify API before “published program” label | H6 |
| `?tab=integrations` | `EckePublishStub.tsx` | “2. Review preview” duplicate button | removed | Partial | admin | Single preview action | M5 |
| `?tab=integrations` | `IntegrationsPanel.tsx` | Webhook env var names / JSON examples | clarified | Yes | admin | Shorten copy; link to docs | M12 |
| `?tab=import` | `ScheduleImportPanel.tsx` | Import JSON rows (primary) | hidden | Yes | `scheduler` | Collapse under Advanced; CSV primary | M7 |
| ⌘K palette | `OrganizerCommandPalette.tsx` | Nav commands to gated tabs | gated | N/A | Per `isTabAllowed` | Filter palette entries | M3 |
| `?tab=program` | `OrganizerEventHeader.tsx` | Preview as… (staff/safety) | gated | Yes (public URL) | `staff_ops` / admin | Gate non-attendee previews | M2 |
| `?tab=program` | Bulk bar | Publish / Unpublish / Delete | active | Yes (`/program-slots/bulk`) | scheduler+ | Keep | L14 — supported |

---

## People hub & registration

| Route | Component / file | UI element | Status | Backend support | Permission | Decision | Notes |
|-------|------------------|------------|--------|-----------------|------------|----------|-------|
| `?tab=people` | `PeopleHubPanel.tsx` | Sub-tab write affordances | gated | N/A | Per `peopleTab` + `PEOPLE_SUB_TAB_PERMISSIONS` | Per-sub-tab `readOnly` | M1 |
| `?tab=people&peopleTab=signups` | `ImportSignupsMenu.tsx` | Import JSON | hidden | Yes | registration | Advanced subsection; CSV primary | M8 |
| `?tab=people&peopleTab=signups` | `RegistrantsPanel.tsx` | Registration answers display | clarified | Yes | registration | Human-readable text; raw JSON collapsed | M9 |
| `?tab=settings&settingsPanel=registration` | `RegistrationSettingsSection.tsx` | “People (coming soon)” | clarified | Yes | admin | Link to People hub signups/roster | M10 |
| `?tab=settings&settingsPanel=registration` | `RegistrationSettingsSection.tsx` | Visibility rules (JSON) textarea | clarified | Yes | admin | Label as advanced; validate | M11 |
| `?tab=people` | `PeopleHelpCard.tsx` | Internal table names in help | clarified | N/A | Varies | User-facing copy only | M13 |
| `?tab=people&peopleTab=staff` | `StaffShiftsPanel.tsx` | Hours on board (`DEMO_EXPECTED_HOURS`) | hidden | Partial | staff_ops | Hide or label estimated until wired | M14 |
| `?tab=people` | Header + Signups + Exports | Export CSV duplicated | active | Yes | registration | Demote duplicates; one primary | L1 |

---

## Organization hub & console

| Route | Component / file | UI element | Status | Backend support | Permission | Decision | Notes |
|-------|------------------|------------|--------|-----------------|------------|----------|-------|
| `/organizer/orgs/:slug` | `OrganizerOrgClient.tsx` | Edit public hub quick action | clarified | N/A | MOD+ | Link to settings content editor, not public hub | H3 |
| `/orgs` | `org-directory-utils.ts` | demo-east-collective fake counts | gated | Yes (list API) | Public | Env-gate or remove override | M16 |
| `/orgs` | `OrgDirectoryCard.tsx` | Verified organizer badge | clarified | Yes | Public | Require review threshold | M17 |
| `/orgs/:slug` | `orgHubMeta.ts` | “New organization” fallback | clarified | Yes | Public | “No public rating yet” / “Reviews building” | M18 |
| `/organizer/orgs/:slug?tab=people` | `OrganizerOrgPeoplePanel.tsx` | Invite member (disabled) | clarified | Claim link via `POST .../claim-tokens` (OWNER) | OWNER | Use **Transfer ownership** panel | L11 — claim handoff shipped |
| Org Tools | `ComingSoonPaymentsCard.tsx` | Payments coming soon | coming soon | No Stripe | admin | Keep — honest | L15 — strategy aligned |

---

## Create flow & public attendee

| Route | Component / file | UI element | Status | Backend support | Permission | Decision | Notes |
|-------|------------------|------------|--------|-----------------|------------|----------|-------|
| `?create=event` (modal) | `CreateFlowModal.tsx` step 4 | Publish event button | gated | Yes (`POST /events`) | Authenticated | `primaryDisabled` when `!isAuthenticated` | M15 — fixed in cleanup pass |
| `/conventions/:slug/register` | `RegisterFlow.tsx` | Category price (`priceCents`) | clarified | Yes (no Stripe on `POST …/registrations`) | Signed-in attendee | Payment disclaimer when any price &gt; 0 | H4 — fixed in cleanup pass |

---

## Low priority (tracked, not first pass)

| Route | Component / file | UI element | Status | Backend support | Permission | Decision | Notes |
|-------|------------------|------------|--------|-----------------|------------|----------|-------|
| Import / Program / Integrations / Dashboard | Multiple | Import schedule entry points | active | Yes | Varies | Keep sidebar + one contextual link | L2 |
| Header / Program / Dashboard | Multiple | Preview links (variants) | active | Yes | Varies | Consolidate labels over time | L3 |
| `?tab=people&peopleTab=applications` | `VettingQueuePanel.tsx` | Raw application `<pre>` | hidden | Yes | admin | Technical details expando only | L5 |
| `?tab=people` | `PeopleHubParticipationStrip.tsx` | `Access role: ATTENDEE` | clarified | Yes | Varies | Friendly label | L6 |
| Home feed | `FeedComposerQuickActions.tsx` | Poll / Video disabled | coming soon | None | Auth | Keep honest `title` tooltips | L12 |

---

## Wave 4 — Command Bridge honesty (2026-06-04)

| Route | Component / file | UI element | Status before | Decision | Status after | Backend | Permission | Tests |
|-------|------------------|------------|---------------|----------|--------------|---------|------------|-------|
| `?tab=exports` | `ExportsHubPanel.tsx` | Presenter directory / volunteer call-sheet / no-photo | active (404) | removed | removed | No route | staff_ops / registration | `organizer-export-paths.test.ts` |
| `?tab=exports` | `ExportsHubPanel.tsx` | Activities / scheduling problems | misleading (JSON default) | clarified | active | `GET …/exports/sessions?format=csv`, conflict CSV | staff_ops | export paths test |
| `?tab=exports` | `ExportsHubPanel.tsx` | Event pack ZIP label | misleading | clarified | active | JSON `event-pack` | staff_ops | — |
| `?tab=exports` | `ExportsHubPanel.tsx` | Per-room / per-presenter calendar feeds | broken scope | clarified | active | POST `calendar-feeds` (`location`/`person`) | staff_ops | — |
| `?tab=exports` | `ExportsHubPanel.tsx` | Calendar subscribe URL | partial | clarified | active + disclaimer | Mint only; GET `.ics` host-dependent | staff_ops | — |
| `?tab=messaging` | `MessagingPanel.tsx` | Test email send | broken payload | clarified | active | `POST …/message-templates/test-send` | staff_ops or scheduler | API accepts `to`/`body` |
| `?tab=messaging` | `MessagingPanel.tsx` | Announcement publish | active | active | active | campaigns + send | staff_ops or scheduler | — |
| `?tab=import` | `ScheduleImportPanel.tsx` | Staff import kind toggle | broken publish | removed | hidden | Program import only | scheduler | `schedule-import-ui.test.ts` |
| `…/door` | `DoorModePanel.tsx` | Bulk check-in | 404 | removed | removed | Single `POST …/check-in` only | registration | `door-mode-ui.test.ts` |
| `…/door` | `door/page.tsx` | Exit link | wrong context | clarified | active | N/A | registration | — |
| `?tab=integrations` | `IntegrationsPanel.tsx` | Webhook / embed Revoke | 404 DELETE | removed | clarified | Create only | admin | — |
| Hub API | `conventions-routes.ts` | Slot/settings/document mutations | MOD bypass | gated | gated | Hub routes | command grants + OWNER/ADMIN | `convention-command-permissions.test.ts` |
| DMs | `ecosystem-stubs.ts` | Create conversation / send message | privacy cosmetic | gated | gated | DB | `whoCanMessage` | `dm-privacy.test.ts` |

---

## Wave 6 — Permission & enforcement (2026-06-04)

| Route / area | Component / file | Control | Status after | Notes |
|--------------|----------------|---------|--------------|-------|
| Org hub chat | `OrgHubClient.tsx` | Message composer | gated | Hidden when `viewerScopeBanned` |
| Group forums | `GroupForumsSection.tsx` | Thread/reply | gated | Members only; locked thread banner |
| Program publish | `ConventionPublishActions.tsx` | ECKE in dialog | gated | `bridgeConnected` fetch |
| Hub gallery | API `convention-hub-ext-routes` | Upload/moderate | active | `staff_ops` command grant |

---

## Wave 5 — Workflow correctness (2026-06-04)

| Route / area | Component / file | Control | Status after | Notes |
|--------------|----------------|---------|--------------|-------|
| Exports calendar | `ExportsHubPanel.tsx` | Subscribe mint + feeds | active | `GET …/calendar-feed/:token` implemented |
| Create flow | `CreateFlowModal.tsx` | Convention shell checkbox | gated | OWNER/ADMIN only (`canCreateConventionShell`) |
| Door | `DoorModePanel.tsx` | Check-in | active | Eligibility from API; early 409 |
| ECKE entity | `EckeEntityPublishStatus.tsx` | Queue publish | gated | Disabled when `!bridgeConnected` |
| Org forum | `OrgHubClient.tsx` | Reply composer | gated | Hidden when thread locked |
| Guest landing | `LandingDiscoveryPreview.tsx` | Sample activity | clarified | Illustration labels |

---

## Wave 5 — Feed card + member nav honesty (2026-06-06)

| Route | Component / file | UI element | Status | Decision | Notes |
|-------|------------------|------------|--------|----------|-------|
| Home feed | `FeedReactionsRow.tsx` | Collar / Brilliant / Going | **removed** | Love / Respect / Sympathize / Helpful | Only **Love** wired to like API; others disabled (coming soon) |
| Home feed | `LocalPostCard.tsx` | Boost / Pass along | **renamed** | Repost / Share | Repost → `POST …/repost`; Share → `/share/post/:id` |
| Home feed | `LocalPostCard.tsx` | Discuss | coming soon | Disabled; no fake comment count | |
| Home feed | `LocalPostCard.tsx` | Report | clarified | Text button, subdued, `ml-auto` | |
| Home feed | `FollowingFeedTab.tsx` | Repost on posts | **fixed** | Pass `onRepost` from `HomePageClient` | Was missing vs Local tab |
| Home feed | `FeedComposerQuickActions.tsx` | Event quick action | **fixed** | `/events?create=event` | Was `create=1` (modal never opened) |
| Home feed | `HomeFeedDiscoverRail.tsx` | Trending See all | **fixed** | `/home?mode=discover&tab=Trending` | Was `/discovery` → `/people` |
| Home feed | `HomeFeedSuggestedPerson.tsx` | Connect | **clarified** | Label **View profile** | Still routes to profile until connect flow |
| Home feed | `HomeFeedDiscoverRail.tsx` | Gold rail footers | **clarified** | Muted footer links; no emphasize gradient on upcoming | |
| Header | `Header.tsx` | Mobile nav skip list | **removed** | Full `navPrimary` in drawer | CommunityNavBar was dead; Events/Groups were hidden |
| Profile | `ProfileOwnerActions.tsx` | Empty settings link | **fixed** | **Account settings** label | |
| Explore | `ExploreCompactTrendingRow.tsx` | Kind badge gold | **clarified** | Muted metadata color | |

**Locked vocabulary (`@c2k/shared/feed-reactions.ts`):** Reactions — Love, Respect, Sympathize, Helpful. Actions — Discuss, Repost, Share, Report. Event RSVP — Going/Maybe on event cards only.

---

## Wave 6 — Member hub honesty (2026-06-06)

| Route | Component / file | UI element | Status | Decision | Notes |
|-------|------------------|------------|--------|----------|-------|
| Saved | `SavedPageClient.tsx` | Filtered empty CTA | **fixed** | Per-filter links (events/articles/media/posts) | `SAVED_FILTER_EMPTY_CTA` |
| Home feed | `HomeFeedShellComposer.tsx` | Collapsed Photo chip | **fixed** | Opens composer (`onPhoto`) | |
| Home feed | `FeedComposerQuickActions.tsx` | Photo without handler | **clarified** | Disabled when no `onPhoto` | |
| Home feed | `CommunityNavBar.tsx` | Mobile feed tabs dead | **fixed** | `showHomeMobileFeedNav` bypasses `hideCommunityNavOnHome` | Following / Near you / Trending on mobile |
| Events | `EventsFeaturedStrip.tsx` | Fake FEATURED/SELLING FAST badges | **removed** | Badge only when `event.featured`; section renamed Upcoming highlights | |
| Groups | `GroupDiscoverListCard.tsx` | Join group (nav only) | **clarified** | View group primary; Join on group page | |
| Groups | `GroupCard.tsx` | Join group footer | **clarified** | Open group to join | |
| People | `FindPeopleProfileCard.tsx` | Connect → profile | **fixed** | Wired `POST /connections/request` when API-backed | |
| Orgs | `orgs/page.tsx`, `OrganizationsRightRail.tsx` | Explore organizer tools | **gated** | Shown only when `hasAnyScope` | |
| Feed | `LocalPostCard.tsx` | Discuss disabled | **fixed** | Routes to `/share/post/:id` for API posts | |
| Dead code | `HomeFeedLeftRail.tsx`, `HomeTodayRail.tsx` | Unused rails | **removed** | Deleted | |

---

## Maintenance

- After each cleanup PR, update **Status** and add a one-line note under **Notes**.
- Do not mark `active` until click-through confirms no post-click 403 for the viewer’s role.
- Reference audit sequence: H1 → H3 → H2/H5 → M6/M5 → H4 → permission passes → JSON Advanced → org directory (M16–M18).

**Related:** [`UI_UX_AUDIT.md`](./UI_UX_AUDIT.md), [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md), [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) (no Stripe in registration).
