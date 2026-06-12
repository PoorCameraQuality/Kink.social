# Manual Visual Review — Screenshot Index

Generated: 2026-06-12T17:26:38.709Z

Package for human visual design review after mobile foundation, template, organizer, and visual polish passes.

## Package summary

| Metric | Value |
|--------|------:|
| PNG screenshots | 234 |
| Index entries | 244 |
| Mobile viewports | 360×800, 390×844, 430×932 |
| Desktop viewport | 1440×900 |
| Personas | guest, new-member, member, organizer, mod-admin |

**Capture types:** `top` (viewport at load — primary review asset), `full` (full-page when ≤5200px tall), `middle` / `bottom` (section fallbacks for very long pages).

**Coverage highlights:** landing/auth, home feed + Create sheet, explore/events directories + FilterSheets, event/group/org detail, creation wizards, organizer dashboards, privacy/safety, moderation, empty search states, report flows.

**Gaps (not captured or data-dependent):** empty home feed (feed had posts), skeleton loading (transient), empty messages inbox (mock threads present), moderation case detail (no open case in seed).

Screenshots directory: [`screenshots/manual-visual-review/`](screenshots/manual-visual-review/)

Zip archive: [`manual-visual-review.zip`](../manual-visual-review.zip)

| filename | route | persona | viewport | type | note | known issue |
|----------|-------|---------|----------|------|------|-------------|
| 360-guest-landing-top.png | / | guest | 360 | top | Landing signup default |  |
| 360-guest-landing-full.png | / | guest | 360 | full | Landing signup default |  |
| 390-guest-landing-top.png | / | guest | 390 | top | Landing signup default |  |
| 390-guest-landing-full.png | / | guest | 390 | full | Landing signup default |  |
| 430-guest-landing-top.png | / | guest | 430 | top | Landing signup default |  |
| 430-guest-landing-full.png | / | guest | 430 | full | Landing signup default |  |
| 1440-guest-landing-top.png | / | guest | 1440 | top | Landing desktop |  |
| 1440-guest-landing-full.png | / | guest | 1440 | full | Landing desktop |  |
| 360-guest-landing-login-top.png | / | guest | 360 | top | Login tab |  |
| 390-guest-landing-login-top.png | / | guest | 390 | top | Login tab |  |
| 430-guest-landing-login-top.png | / | guest | 430 | top | Login tab |  |
| 360-guest-landing-register-policies-top.png | / | guest | 360 | top | Signup policy + reassurance block |  |
| 390-guest-landing-register-policies-top.png | / | guest | 390 | top | Signup policy + reassurance block |  |
| 430-guest-landing-register-policies-top.png | / | guest | 430 | top | Signup policy + reassurance block |  |
| 360-guest-terms-top.png | /terms | guest | 360 | top | Terms page |  |
| 360-guest-terms-top.png | /terms | guest | 360 | top | Terms page (section: top — page too tall for single full capture) |  |
| 360-guest-terms-middle.png | /terms | guest | 360 | middle | Terms page mid-scroll section |  |
| 360-guest-terms-bottom.png | /terms | guest | 360 | bottom | Terms page bottom/action area |  |
| 390-guest-terms-top.png | /terms | guest | 390 | top | Terms page |  |
| 390-guest-terms-top.png | /terms | guest | 390 | top | Terms page (section: top — page too tall for single full capture) |  |
| 390-guest-terms-middle.png | /terms | guest | 390 | middle | Terms page mid-scroll section |  |
| 390-guest-terms-bottom.png | /terms | guest | 390 | bottom | Terms page bottom/action area |  |
| 430-guest-terms-top.png | /terms | guest | 430 | top | Terms page |  |
| 430-guest-terms-top.png | /terms | guest | 430 | top | Terms page (section: top — page too tall for single full capture) |  |
| 430-guest-terms-middle.png | /terms | guest | 430 | middle | Terms page mid-scroll section |  |
| 430-guest-terms-bottom.png | /terms | guest | 430 | bottom | Terms page bottom/action area |  |
| 360-guest-login-wall-home-top.png | /home | guest | 360 | top | Protected route login wall / redirect |  |
| 390-guest-login-wall-home-top.png | /home | guest | 390 | top | Protected route login wall / redirect |  |
| 430-guest-login-wall-home-top.png | /home | guest | 430 | top | Protected route login wall / redirect |  |
| 360-member-home-feed-top.png | /home | member | 360 | top | Home feed with bottom nav + composer |  |
| 360-member-home-feed-top.png | /home | member | 360 | top | Home feed with bottom nav + composer (section: top — page too tall for single full capture) |  |
| 360-member-home-feed-middle.png | /home | member | 360 | middle | Home feed with bottom nav + composer mid-scroll section |  |
| 360-member-home-feed-bottom.png | /home | member | 360 | bottom | Home feed with bottom nav + composer bottom/action area |  |
| 390-member-home-feed-top.png | /home | member | 390 | top | Home feed with bottom nav + composer |  |
| 390-member-home-feed-full.png | /home | member | 390 | full | Home feed with bottom nav + composer |  |
| 430-member-home-feed-top.png | /home | member | 430 | top | Home feed with bottom nav + composer |  |
| 430-member-home-feed-full.png | /home | member | 430 | full | Home feed with bottom nav + composer |  |
| 1440-member-home-feed-top.png | /home | member | 1440 | top | Home feed desktop |  |
| 1440-member-home-feed-full.png | /home | member | 1440 | full | Home feed desktop |  |
| 360-member-create-sheet-top.png | /home | member | 360 | top | Create FAB sheet open |  |
| 390-member-create-sheet-top.png | /home | member | 390 | top | Create FAB sheet open |  |
| 430-member-create-sheet-top.png | /home | member | 430 | top | Create FAB sheet open |  |
| 360-member-explore-top.png | /explore | member | 360 | top | Explore directory |  |
| 360-member-explore-full.png | /explore | member | 360 | full | Explore directory |  |
| 390-member-explore-top.png | /explore | member | 390 | top | Explore directory |  |
| 390-member-explore-full.png | /explore | member | 390 | full | Explore directory |  |
| 430-member-explore-top.png | /explore | member | 430 | top | Explore directory |  |
| 430-member-explore-full.png | /explore | member | 430 | full | Explore directory |  |
| 360-member-explore-filter-sheet-top.png | /explore | member | 360 | top | FilterSheet open |  |
| 390-member-explore-filter-sheet-top.png | /explore | member | 390 | top | FilterSheet open |  |
| 430-member-explore-filter-sheet-top.png | /explore | member | 430 | top | FilterSheet open |  |
| 360-member-events-list-top.png | /events | member | 360 | top | Events directory |  |
| 360-member-events-list-full.png | /events | member | 360 | full | Events directory |  |
| 390-member-events-list-top.png | /events | member | 390 | top | Events directory |  |
| 390-member-events-list-full.png | /events | member | 390 | full | Events directory |  |
| 430-member-events-list-top.png | /events | member | 430 | top | Events directory |  |
| 430-member-events-list-full.png | /events | member | 430 | full | Events directory |  |
| 360-member-events-filter-sheet-top.png | /events | member | 360 | top | Events FilterSheet |  |
| 390-member-events-filter-sheet-top.png | /events | member | 390 | top | Events FilterSheet |  |
| 430-member-events-filter-sheet-top.png | /events | member | 430 | top | Events FilterSheet |  |
| 360-member-event-detail-top.png | /events/1 | member | 360 | top | Event detail hero + RSVP |  |
| 360-member-event-detail-full.png | /events/1 | member | 360 | full | Event detail hero + RSVP |  |
| 390-member-event-detail-top.png | /events/1 | member | 390 | top | Event detail hero + RSVP |  |
| 390-member-event-detail-full.png | /events/1 | member | 390 | full | Event detail hero + RSVP |  |
| 430-member-event-detail-top.png | /events/1 | member | 430 | top | Event detail hero + RSVP |  |
| 430-member-event-detail-full.png | /events/1 | member | 430 | full | Event detail hero + RSVP |  |
| 1440-member-event-detail-top.png | /events/1 | member | 1440 | top | Event detail desktop |  |
| 1440-member-event-detail-full.png | /events/1 | member | 1440 | full | Event detail desktop |  |
| 360-member-messages-inbox-top.png | /messaging | member | 360 | top | Messages inbox |  |
| 390-member-messages-inbox-top.png | /messaging | member | 390 | top | Messages inbox |  |
| 430-member-messages-inbox-top.png | /messaging | member | 430 | top | Messages inbox |  |
| 360-member-message-thread-top.png | /messaging | member | 360 | top | Message thread with trust context |  |
| 390-member-message-thread-top.png | /messaging | member | 390 | top | Message thread with trust context |  |
| 430-member-message-thread-top.png | /messaging | member | 430 | top | Message thread with trust context |  |
| 360-member-me-profile-hub-top.png | /profile | member | 360 | top | Me tab — account hub + profile story |  |
| 360-member-me-profile-hub-top.png | /profile | member | 360 | top | Me tab — account hub + profile story (section: top — page too tall for single full capture) |  |
| 360-member-me-profile-hub-middle.png | /profile | member | 360 | middle | Me tab — account hub + profile story mid-scroll section |  |
| 360-member-me-profile-hub-bottom.png | /profile | member | 360 | bottom | Me tab — account hub + profile story bottom/action area |  |
| 390-member-me-profile-hub-top.png | /profile | member | 390 | top | Me tab — account hub + profile story |  |
| 390-member-me-profile-hub-top.png | /profile | member | 390 | top | Me tab — account hub + profile story (section: top — page too tall for single full capture) |  |
| 390-member-me-profile-hub-middle.png | /profile | member | 390 | middle | Me tab — account hub + profile story mid-scroll section |  |
| 390-member-me-profile-hub-bottom.png | /profile | member | 390 | bottom | Me tab — account hub + profile story bottom/action area |  |
| 430-member-me-profile-hub-top.png | /profile | member | 430 | top | Me tab — account hub + profile story |  |
| 430-member-me-profile-hub-top.png | /profile | member | 430 | top | Me tab — account hub + profile story (section: top — page too tall for single full capture) |  |
| 430-member-me-profile-hub-middle.png | /profile | member | 430 | middle | Me tab — account hub + profile story mid-scroll section |  |
| 430-member-me-profile-hub-bottom.png | /profile | member | 430 | bottom | Me tab — account hub + profile story bottom/action area |  |
| 360-member-public-profile-top.png | /profile/Brax | member | 360 | top | Public profile view |  |
| 360-member-public-profile-full.png | /profile/Brax | member | 360 | full | Public profile view |  |
| 390-member-public-profile-top.png | /profile/Brax | member | 390 | top | Public profile view |  |
| 390-member-public-profile-full.png | /profile/Brax | member | 390 | full | Public profile view |  |
| 430-member-public-profile-top.png | /profile/Brax | member | 430 | top | Public profile view |  |
| 430-member-public-profile-full.png | /profile/Brax | member | 430 | full | Public profile view |  |
| 360-member-profile-report-menu-top.png | /profile/Brax | member | 360 | top | Report profile affordance |  |
| 390-member-profile-report-menu-top.png | /profile/Brax | member | 390 | top | Report profile affordance |  |
| 430-member-profile-report-menu-top.png | /profile/Brax | member | 430 | top | Report profile affordance |  |
| 360-member-profile-edit-top.png | /profile/edit | member | 360 | top | Profile edit / studio |  |
| 360-member-profile-edit-full.png | /profile/edit | member | 360 | full | Profile edit / studio |  |
| 390-member-profile-edit-top.png | /profile/edit | member | 390 | top | Profile edit / studio |  |
| 390-member-profile-edit-full.png | /profile/edit | member | 390 | full | Profile edit / studio |  |
| 430-member-profile-edit-top.png | /profile/edit | member | 430 | top | Profile edit / studio |  |
| 430-member-profile-edit-full.png | /profile/edit | member | 430 | full | Profile edit / studio |  |
| 360-new-member-home-new-member-top.png | /home | new-member | 360 | top | New member home (onboarding incomplete) |  |
| 360-new-member-home-new-member-full.png | /home | new-member | 360 | full | New member home (onboarding incomplete) |  |
| 390-new-member-home-new-member-top.png | /home | new-member | 390 | top | New member home (onboarding incomplete) |  |
| 390-new-member-home-new-member-full.png | /home | new-member | 390 | full | New member home (onboarding incomplete) |  |
| 430-new-member-home-new-member-top.png | /home | new-member | 430 | top | New member home (onboarding incomplete) |  |
| 430-new-member-home-new-member-full.png | /home | new-member | 430 | full | New member home (onboarding incomplete) |  |
| 360-member-groups-directory-top.png | /groups | member | 360 | top | Groups directory |  |
| 360-member-groups-directory-full.png | /groups | member | 360 | full | Groups directory |  |
| 390-member-groups-directory-top.png | /groups | member | 390 | top | Groups directory |  |
| 390-member-groups-directory-full.png | /groups | member | 390 | full | Groups directory |  |
| 430-member-groups-directory-top.png | /groups | member | 430 | top | Groups directory |  |
| 430-member-groups-directory-full.png | /groups | member | 430 | full | Groups directory |  |
| 360-member-group-detail-top.png | /groups/g1 | member | 360 | top | Group community hub |  |
| 360-member-group-detail-full.png | /groups/g1 | member | 360 | full | Group community hub |  |
| 390-member-group-detail-top.png | /groups/g1 | member | 390 | top | Group community hub |  |
| 390-member-group-detail-full.png | /groups/g1 | member | 390 | full | Group community hub |  |
| 430-member-group-detail-top.png | /groups/g1 | member | 430 | top | Group community hub |  |
| 430-member-group-detail-full.png | /groups/g1 | member | 430 | full | Group community hub |  |
| 360-member-org-detail-top.png | /orgs/demo-east-collective | member | 360 | top | Organization hub |  |
| 360-member-org-detail-full.png | /orgs/demo-east-collective | member | 360 | full | Organization hub |  |
| 390-member-org-detail-top.png | /orgs/demo-east-collective | member | 390 | top | Organization hub |  |
| 390-member-org-detail-full.png | /orgs/demo-east-collective | member | 390 | full | Organization hub |  |
| 430-member-org-detail-top.png | /orgs/demo-east-collective | member | 430 | top | Organization hub |  |
| 430-member-org-detail-full.png | /orgs/demo-east-collective | member | 430 | full | Organization hub |  |
| 360-member-orgs-directory-top.png | /orgs | member | 360 | top | Organizations directory |  |
| 360-member-orgs-directory-full.png | /orgs | member | 360 | full | Organizations directory |  |
| 390-member-orgs-directory-top.png | /orgs | member | 390 | top | Organizations directory |  |
| 390-member-orgs-directory-full.png | /orgs | member | 390 | full | Organizations directory |  |
| 430-member-orgs-directory-top.png | /orgs | member | 430 | top | Organizations directory |  |
| 430-member-orgs-directory-full.png | /orgs | member | 430 | full | Organizations directory |  |
| 360-organizer-org-create-top.png | /orgs/new | organizer | 360 | top | Organization creation wizard |  |
| 360-organizer-org-create-full.png | /orgs/new | organizer | 360 | full | Organization creation wizard |  |
| 390-organizer-org-create-top.png | /orgs/new | organizer | 390 | top | Organization creation wizard |  |
| 390-organizer-org-create-full.png | /orgs/new | organizer | 390 | full | Organization creation wizard |  |
| 430-organizer-org-create-top.png | /orgs/new | organizer | 430 | top | Organization creation wizard |  |
| 430-organizer-org-create-full.png | /orgs/new | organizer | 430 | full | Organization creation wizard |  |
| 360-organizer-org-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective | organizer | 360 | top | Org organizer console home |  |
| 360-organizer-org-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective | organizer | 360 | full | Org organizer console home |  |
| 390-organizer-org-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective | organizer | 390 | top | Org organizer console home |  |
| 390-organizer-org-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective | organizer | 390 | full | Org organizer console home |  |
| 430-organizer-org-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective | organizer | 430 | top | Org organizer console home |  |
| 430-organizer-org-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective | organizer | 430 | full | Org organizer console home |  |
| 360-member-group-create-step-1-top.png | /groups?create=group | member | 360 | top | Group creation step 1 — basics |  |
| 390-member-group-create-step-1-top.png | /groups?create=group | member | 390 | top | Group creation step 1 — basics |  |
| 430-member-group-create-step-1-top.png | /groups?create=group | member | 430 | top | Group creation step 1 — basics |  |
| 360-member-group-create-step-2-top.png | /groups?create=group | member | 360 | top | Group creation step 2 — community rules |  |
| 390-member-group-create-step-2-top.png | /groups?create=group | member | 390 | top | Group creation step 2 — community rules |  |
| 430-member-group-create-step-2-top.png | /groups?create=group | member | 430 | top | Group creation step 2 — community rules |  |
| 360-member-group-create-step-3-top.png | /groups?create=group | member | 360 | top | Group creation step 3 — review |  |
| 390-member-group-create-step-3-top.png | /groups?create=group | member | 390 | top | Group creation step 3 — review |  |
| 430-member-group-create-step-3-top.png | /groups?create=group | member | 430 | top | Group creation step 3 — review |  |
| 360-member-event-create-step-1-top.png | /events?create=event | member | 360 | top | Event creation step 1 |  |
| 390-member-event-create-step-1-top.png | /events?create=event | member | 390 | top | Event creation step 1 |  |
| 430-member-event-create-step-1-top.png | /events?create=event | member | 430 | top | Event creation step 1 |  |
| 360-member-event-create-step-2-top.png | /events?create=event | member | 360 | top | Event creation step 2 |  |
| 390-member-event-create-step-2-top.png | /events?create=event | member | 390 | top | Event creation step 2 |  |
| 430-member-event-create-step-2-top.png | /events?create=event | member | 430 | top | Event creation step 2 |  |
| 360-member-event-create-step-3-top.png | /events?create=event | member | 360 | top | Event creation step 3 |  |
| 390-member-event-create-step-3-top.png | /events?create=event | member | 390 | top | Event creation step 3 |  |
| 430-member-event-create-step-3-top.png | /events?create=event | member | 430 | top | Event creation step 3 |  |
| 360-member-event-create-step-4-top.png | /events?create=event | member | 360 | top | Event creation review / publish step |  |
| 390-member-event-create-step-4-top.png | /events?create=event | member | 390 | top | Event creation review / publish step |  |
| 430-member-event-create-step-4-top.png | /events?create=event | member | 430 | top | Event creation review / publish step |  |
| 360-organizer-organizer-dashboard-top.png | /organizer | organizer | 360 | top | Organizer home dashboard |  |
| 360-organizer-organizer-dashboard-full.png | /organizer | organizer | 360 | full | Organizer home dashboard |  |
| 390-organizer-organizer-dashboard-top.png | /organizer | organizer | 390 | top | Organizer home dashboard |  |
| 390-organizer-organizer-dashboard-full.png | /organizer | organizer | 390 | full | Organizer home dashboard |  |
| 430-organizer-organizer-dashboard-top.png | /organizer | organizer | 430 | top | Organizer home dashboard |  |
| 430-organizer-organizer-dashboard-full.png | /organizer | organizer | 430 | full | Organizer home dashboard |  |
| 1440-organizer-organizer-dashboard-top.png | /organizer | organizer | 1440 | top | Organizer dashboard desktop |  |
| 1440-organizer-organizer-dashboard-full.png | /organizer | organizer | 1440 | full | Organizer dashboard desktop |  |
| 360-organizer-convention-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 360 | top | Convention organizer dashboard | May timeout if convention seed missing |
| 360-organizer-convention-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 360 | full | Convention organizer dashboard | May timeout if convention seed missing |
| 390-organizer-convention-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 390 | top | Convention organizer dashboard | May timeout if convention seed missing |
| 390-organizer-convention-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 390 | full | Convention organizer dashboard | May timeout if convention seed missing |
| 430-organizer-convention-organizer-dashboard-top.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 430 | top | Convention organizer dashboard | May timeout if convention seed missing |
| 430-organizer-convention-organizer-dashboard-full.png | /organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend | organizer | 430 | full | Convention organizer dashboard | May timeout if convention seed missing |
| 360-member-report-flow-step-1-top.png | /profile/Brax | member | 360 | top | Report modal — reason selection |  |
| 390-member-report-flow-step-1-top.png | /profile/Brax | member | 390 | top | Report modal — reason selection |  |
| 430-member-report-flow-step-1-top.png | /profile/Brax | member | 430 | top | Report modal — reason selection |  |
| 390-member-report-flow-review-top.png | /profile/Brax | member | 390 | top | Report modal — filled note ready to submit |  |
| 360-member-settings-account-top.png | /settings/account | member | 360 | top | Account settings |  |
| 360-member-settings-account-full.png | /settings/account | member | 360 | full | Account settings |  |
| 390-member-settings-account-top.png | /settings/account | member | 390 | top | Account settings |  |
| 390-member-settings-account-full.png | /settings/account | member | 390 | full | Account settings |  |
| 430-member-settings-account-top.png | /settings/account | member | 430 | top | Account settings |  |
| 430-member-settings-account-full.png | /settings/account | member | 430 | full | Account settings |  |
| 360-organizer-org-management-top.png | /organizer/orgs/demo-east-collective | organizer | 360 | top | Organization management console |  |
| 360-organizer-org-management-full.png | /organizer/orgs/demo-east-collective | organizer | 360 | full | Organization management console |  |
| 390-organizer-org-management-top.png | /organizer/orgs/demo-east-collective | organizer | 390 | top | Organization management console |  |
| 390-organizer-org-management-full.png | /organizer/orgs/demo-east-collective | organizer | 390 | full | Organization management console |  |
| 430-organizer-org-management-top.png | /organizer/orgs/demo-east-collective | organizer | 430 | top | Organization management console |  |
| 430-organizer-org-management-full.png | /organizer/orgs/demo-east-collective | organizer | 430 | full | Organization management console |  |
| 360-organizer-group-management-top.png | /groups/g1 | organizer | 360 | top | Group page with organizer affordances if member |  |
| 360-organizer-group-management-full.png | /groups/g1 | organizer | 360 | full | Group page with organizer affordances if member |  |
| 390-organizer-group-management-top.png | /groups/g1 | organizer | 390 | top | Group page with organizer affordances if member |  |
| 390-organizer-group-management-full.png | /groups/g1 | organizer | 390 | full | Group page with organizer affordances if member |  |
| 430-organizer-group-management-top.png | /groups/g1 | organizer | 430 | top | Group page with organizer affordances if member |  |
| 430-organizer-group-management-full.png | /groups/g1 | organizer | 430 | full | Group page with organizer affordances if member |  |
| 360-guest-policies-hub-top.png | /policies | guest | 360 | top | Policies hub |  |
| 360-guest-policies-hub-full.png | /policies | guest | 360 | full | Policies hub |  |
| 390-guest-policies-hub-top.png | /policies | guest | 390 | top | Policies hub |  |
| 390-guest-policies-hub-full.png | /policies | guest | 390 | full | Policies hub |  |
| 430-guest-policies-hub-top.png | /policies | guest | 430 | top | Policies hub |  |
| 430-guest-policies-hub-full.png | /policies | guest | 430 | full | Policies hub |  |
| 360-member-privacy-settings-top.png | /settings/privacy | member | 360 | top | Privacy and visibility settings |  |
| 360-member-privacy-settings-top.png | /settings/privacy | member | 360 | top | Privacy and visibility settings (section: top — page too tall for single full capture) |  |
| 360-member-privacy-settings-middle.png | /settings/privacy | member | 360 | middle | Privacy and visibility settings mid-scroll section |  |
| 360-member-privacy-settings-bottom.png | /settings/privacy | member | 360 | bottom | Privacy and visibility settings bottom/action area |  |
| 390-member-privacy-settings-top.png | /settings/privacy | member | 390 | top | Privacy and visibility settings |  |
| 390-member-privacy-settings-top.png | /settings/privacy | member | 390 | top | Privacy and visibility settings (section: top — page too tall for single full capture) |  |
| 390-member-privacy-settings-middle.png | /settings/privacy | member | 390 | middle | Privacy and visibility settings mid-scroll section |  |
| 390-member-privacy-settings-bottom.png | /settings/privacy | member | 390 | bottom | Privacy and visibility settings bottom/action area |  |
| 430-member-privacy-settings-top.png | /settings/privacy | member | 430 | top | Privacy and visibility settings |  |
| 430-member-privacy-settings-top.png | /settings/privacy | member | 430 | top | Privacy and visibility settings (section: top — page too tall for single full capture) |  |
| 430-member-privacy-settings-middle.png | /settings/privacy | member | 430 | middle | Privacy and visibility settings mid-scroll section |  |
| 430-member-privacy-settings-bottom.png | /settings/privacy | member | 430 | bottom | Privacy and visibility settings bottom/action area |  |
| 360-member-safety-blocked-top.png | /settings/blocked | member | 360 | top | Blocked accounts / safety settings |  |
| 360-member-safety-blocked-full.png | /settings/blocked | member | 360 | full | Blocked accounts / safety settings |  |
| 390-member-safety-blocked-top.png | /settings/blocked | member | 390 | top | Blocked accounts / safety settings |  |
| 390-member-safety-blocked-full.png | /settings/blocked | member | 390 | full | Blocked accounts / safety settings |  |
| 430-member-safety-blocked-top.png | /settings/blocked | member | 430 | top | Blocked accounts / safety settings |  |
| 430-member-safety-blocked-full.png | /settings/blocked | member | 430 | full | Blocked accounts / safety settings |  |
| 360-member-feed-post-report-top.png | /home | member | 360 | top | Report on feed post (overflow menu) |  |
| 390-member-feed-post-report-top.png | /home | member | 390 | top | Report on feed post (overflow menu) |  |
| 430-member-feed-post-report-top.png | /home | member | 430 | top | Report on feed post (overflow menu) |  |
| 360-mod-admin-moderation-queue-top.png | /moderation/dashboard | mod-admin | 360 | top | Moderation dashboard |  |
| 360-mod-admin-moderation-queue-full.png | /moderation/dashboard | mod-admin | 360 | full | Moderation dashboard |  |
| 390-mod-admin-moderation-queue-top.png | /moderation/dashboard | mod-admin | 390 | top | Moderation dashboard |  |
| 390-mod-admin-moderation-queue-full.png | /moderation/dashboard | mod-admin | 390 | full | Moderation dashboard |  |
| 430-mod-admin-moderation-queue-top.png | /moderation/dashboard | mod-admin | 430 | top | Moderation dashboard |  |
| 430-mod-admin-moderation-queue-full.png | /moderation/dashboard | mod-admin | 430 | full | Moderation dashboard |  |
| 1440-mod-admin-moderation-queue-top.png | /moderation/dashboard | mod-admin | 1440 | top | Moderation desktop |  |
| 1440-mod-admin-moderation-queue-full.png | /moderation/dashboard | mod-admin | 1440 | full | Moderation desktop |  |
| 360-member-empty-events-search-top.png | /events?q=zzzznonexistent999visualreview | member | 360 | top | No events found empty state |  |
| 390-member-empty-events-search-top.png | /events?q=zzzznonexistent999visualreview | member | 390 | top | No events found empty state |  |
| 430-member-empty-events-search-top.png | /events?q=zzzznonexistent999visualreview | member | 430 | top | No events found empty state |  |
| 360-member-empty-groups-search-top.png | /groups?q=zzzznonexistent999visualreview | member | 360 | top | No groups found empty state |  |
| 390-member-empty-groups-search-top.png | /groups?q=zzzznonexistent999visualreview | member | 390 | top | No groups found empty state |  |
| 430-member-empty-groups-search-top.png | /groups?q=zzzznonexistent999visualreview | member | 430 | top | No groups found empty state |  |
| 360-member-empty-people-search-top.png | /people?q=zzzznonexistent999visualreview | member | 360 | top | No search results — people |  |
| 390-member-empty-people-search-top.png | /people?q=zzzznonexistent999visualreview | member | 390 | top | No search results — people |  |
| 430-member-empty-people-search-top.png | /people?q=zzzznonexistent999visualreview | member | 430 | top | No search results — people |  |

**Total captures:** 244
