# Coast to Coast Kink (C2K) — UI Components Audit

**Audit date:** March 14, 2025  
**Scope:** `src/components/**/*.tsx` (35 components)

---

## 1. Component Inventory by Category

### 1.1 UI Primitives (`src/components/ui/`)

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **Card** | Shared card container (bg, rounded corners, border, shadow) | `children`, `className?` | Complete | None | Base building block; add padding via className |
| **EmptyState** | Empty list/state message with optional CTA | `message`, `ctaLabel?`, `ctaHref?`, `className?` | Complete | Card | Reusable; used by GroupMembersSection, GroupEventsSection, ChannelPostsSection |
| **TagSelector** | Multi-select tag chips (toggle on/off) | `tags`, `selectedTags`, `onToggle`, `size?`, `showHash?`, `className?` | Complete | None | Used by GroupPhotosSection, GroupTagsEditor |
| **TabButton** | Tab-style button for tabbed UIs | `label`, `isActive`, `onClick`, `size?`, `className?` | Complete | None | Used by profile, groups, discovery, home pages |

---

### 1.2 Cards (`src/components/cards/`)

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **EventCard** | Event preview card (date, location, RSVP, featured) | `event: { id, title, date, location, rsvpCount, imageUrl?, tags?, isFeatured?, … }` | Complete | TagLink | Verified Host badge removed 2026-05-28; reused home, discovery, events, tags, onboarding, vendor detail |
| **GroupCard** | Group preview card (name, members, description, tags) | `group: { id, name, members, description?, location?, tags? }` | Complete | TagLink | Reused: home, discovery, groups, tags |
| **PersonCard** | Person/profile preview (username, roles, trust score, verified) | `person: { id?, username, roles?, trustScore?, verified?, mutualCount?, distance? }` | Complete | TrustRing, PlaceholderAvatar | Reused: home, discovery, onboarding |
| **VendorCard** | Vendor preview (name, categories, rating, shipsTo, events) | `vendor: { id?, name, categories?, rating?, shipsTo?, upcomingEvents?, logoUrl? }` | Complete | None | Reused: home, discovery, vendors, landing |
| **EducationCard** | Education article preview (title, category, read time, credibility) | `article: { id?, title, category?, readTime?, credibilityScore?, slug?, tags? }` | Complete | TagLink | Reused: home, education, tags |
| **LocalPostCard** | Feed post card (author, trust ring, text, likes, comments, edit/delete) | `post`, `isOwnPost?`, `onEdit?`, `onDelete?` | Partial | TrustRing, PlaceholderAvatar | Love/Comment/Share/Bookmark buttons are non-functional; edit/delete wired |

---

### 1.3 Group Components (`src/components/group/`)

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **GroupHeader** | Group page hero (name, members, tags, Join button) | `group: MockGroup` | Partial | TagLink | Join button not wired (no join/leave logic) |
| **GroupMembersSection** | Member grid with role badges | `members: MockGroupMember[]` | Complete | EmptyState, GroupRoleBadge, Card | Empty state handled |
| **GroupSettingsSection** | Group settings, tags editor, role management | `members: MockGroupMember[]` | Partial | Card, GroupRoleBadge, GroupTagsEditor, GroupDetailContext | Name/description/visibility read-only; role select changes not persisted; Save disabled; invite link/vetting placeholder |
| **GroupResourcesSection** | Shared resources list + add form | 12 props (resources, add form state, handlers) | Complete | Card, GroupDetailContext | Empty state: "No resources yet." |
| **GroupPhotosSection** | Photo upload, pending approval, approved grid | 17 props (photos, pending, upload state, handlers) | Complete | PhotoUpload, TagLink, TagSelector, PhotoPlaceholder, Card, GroupDetailContext | Full CRUD flow; empty state for approved photos |
| **GroupEventsSection** | Events calendar + upcoming list | `events: MockEvent[]` | Complete | EventCard, EmptyState, GroupEventCalendar | Empty state with CTA to /events |
| **ChannelPostsSection** | Group channel posts (pinned + discussions) | 9 props (channelId, canModerate, editing state, onRefresh) | Complete | Card, mock-data | Uses mock-data; post links go to `#`; empty state for discussions |
| **GroupTagsEditor** | Inline tag selector for group tags | `groupId`, `currentTags`, `onSave` | Complete | TagSelector, mock-data | Persists via setMockGroupTags |
| **PhotoPlaceholder** | SVG placeholder when no photo | `size?`, `className?` | Complete | None | Reused in GroupPhotosSection |

---

### 1.4 Layout & Navigation

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **Header** | Sticky header: logo, search, Create, Messages, Notifications, profile dropdown | None | Partial | siteConfig, usePathname | `IS_LOGGED_IN = true` hardcoded; search non-functional; profile dropdown shows "Anbraxas"; log out not wired |
| **BottomNav** | Mobile bottom nav (Home, Explore, Create, Messages, Profile) | None | Partial | usePathname | Create opens modal via data-create-trigger; Create href is `#` |
| **Footer** | Site footer with links | None | Complete | siteConfig | Uses siteConfig.footer |
| **CreateFlowModal** | Create modal (Post, Event, Group, Vendor, Article) | None | Partial | None | Listens for data-create-trigger; Event flow is multi-step but doesn't persist; other options redirect to pages |

---

### 1.5 Auth & Onboarding

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **LoginCard** | Signup/Login tabbed form | None | Placeholder | None | Form submit prevents default; no auth integration |
| **WelcomeBanner** | Dismissible welcome message for new users | None | Complete | None | Persists dismiss in sessionStorage; links to /chat (should be /messaging?) |

---

### 1.6 Trust & Reputation

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **TrustRing** | Circular trust score visualization (5 segments) | `score`, `segments?`, `size?`, `className?`, `children?`, `showBreakdown?` | Complete | None | Reused: LocalPostCard, PersonCard, profile, education, messaging |
| **TrustTierIndicator** | Bronze/Silver/Gold tier badge | `tier?`, `size?`, `showLabel?`, `className?` | Complete | None | Not yet used in app |
| **BadgeDisplay** | Reputation badges (Event Verified, Mentor, etc.) | `badges?`, `maxVisible?`, `size?`, `className?` | Complete | None | Used on profile pages |
| **GroupRoleBadge** | Group role label (Owner, Admin, etc.) | `role: GroupRole` | Complete | mock-data types | Used in GroupMembersSection, GroupSettingsSection |

---

### 1.7 Shared Utilities

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **TagLink** | Link to tag page (`/tags/{tag}`) | `tag`, `className?` | Complete | None | Heavily reused across cards, GroupHeader, GroupPhotosSection |
| **PlaceholderAvatar** | Avatar placeholder when no photo | `size?`, `className?` | Complete | None | Reused: LocalPostCard, PersonCard, profile, education, messaging |
| **PhotoUpload** | Drag-and-drop + click file upload with preview | `onSelect`, `accept?`, `maxSize?`, `guidelines?` | Complete | None | Error handling for file type/size; used in GroupPhotosSection, profile |
| **FeedbackForm** | Post-interaction feedback (sentiment + tags) | `targetUserId`, `interactionType`, `onSubmitted?`, `className?` | Partial | None | UI complete; TODO: POST to API; not yet surfaced in UI |

---

### 1.8 Feature-Specific

| Component | Purpose | Props | Status | Dependencies | Notes |
|-----------|---------|-------|--------|--------------|-------|
| **GroupEventCalendar** | Month calendar with events by day | `events`, `onEventClick?`, `compact?`, `groupId?` | Complete | mock-data | Parses date strings; compact mode for sidebar |
| **GroupPhotoAlbumPreview** | Compact photo grid for group sidebar | `photos`, `groupId` | **Incomplete** | None | Always shows placeholder icons; does not render `photo.url` |
| **CreateFlowModal** | See Layout & Navigation | — | — | — | — |

---

## 2. Reuse Summary

### Highly Reused (3+ pages)

| Component | Used In |
|-----------|---------|
| **EventCard** | home, discovery, events, tags, onboarding, vendor detail |
| **GroupCard** | home, discovery, groups, tags |
| **PersonCard** | home, discovery, onboarding |
| **VendorCard** | home, discovery, vendors, landing |
| **TagLink** | EventCard, GroupCard, EducationCard, GroupHeader, GroupPhotosSection, discovery |
| **TabButton** | profile, groups, discovery, home |
| **TrustRing** | LocalPostCard, PersonCard, profile, education, messaging |
| **PlaceholderAvatar** | LocalPostCard, PersonCard, profile, education, messaging |
| **Card** | EmptyState, ChannelPostsSection, GroupMembersSection, GroupSettingsSection, GroupResourcesSection, GroupPhotosSection |

### One-Off / Limited Use

| Component | Used In |
|-----------|---------|
| **TrustTierIndicator** | Not used |
| **FeedbackForm** | Not used |
| **GroupPhotoAlbumPreview** | groups/[id] (sidebar) |
| **GroupEventCalendar** | GroupEventsSection |
| **GroupTagsEditor** | GroupSettingsSection |
| **PhotoPlaceholder** | GroupPhotosSection |
| **LoginCard** | Landing (/) |
| **WelcomeBanner** | Not used (defined but never imported) |

---

## 3. Empty States, Loading, Error Handling

### Empty States

| Component | Empty State | Notes |
|-----------|-------------|-------|
| EmptyState | Generic message + optional CTA | Reusable |
| GroupMembersSection | Uses EmptyState | ✓ |
| GroupEventsSection | Uses EmptyState + CTA to /events | ✓ |
| GroupResourcesSection | "No resources yet." | ✓ |
| GroupPhotosSection | "No approved photos yet." | ✓ |
| ChannelPostsSection | "No discussions yet." (discussions only) | ✓ |
| GroupPhotoAlbumPreview | "No approved photos yet." | ✓ |
| BadgeDisplay | Returns null if no badges | ✓ |

### Loading States

**None implemented.** No skeleton loaders, spinners, or loading indicators in components. Pages may need to add loading UI when switching to real API calls.

### Error Handling

| Component | Error Handling | Notes |
|-----------|----------------|-------|
| PhotoUpload | `error` state for invalid file type / size | ✓ Displays red message |
| Others | None | No network/API error handling in components |

---

## 4. Components Needing Polish or Completion

### High Priority

| Component | Issue | Recommendation |
|-----------|-------|----------------|
| **GroupPhotoAlbumPreview** | Always shows placeholder icon; never renders `photo.url` | Add `{photo.url ? <img src={photo.url} /> : <PhotoPlaceholder />}` |
| **GroupHeader** | Join button not wired | Wire to join/leave API or mock handler |
| **GroupSettingsSection** | Role select changes not persisted; Save disabled | Wire role update; add invite link/vetting when ready |

### Medium Priority

| Component | Issue | Recommendation |
|-----------|-------|----------------|
| **LocalPostCard** | Love, Comment, Share, Bookmark buttons non-functional | Wire to handlers or remove until ready |
| **Header** | Search non-functional; auth hardcoded | Wire search; connect to auth context |
| **LoginCard** | Form does not submit to auth | Integrate with auth provider |
| **CreateFlowModal** | Event creation doesn't persist | Wire to API or mock |
| **ChannelPostsSection** | Post links go to `#` | Use real post detail route when available |

### Low Priority

| Component | Issue | Recommendation |
|-----------|-------|----------------|
| **WelcomeBanner** | Links to `/chat` | Change to `/messaging` if that's the correct route |
| **TrustTierIndicator** | Not used | Add to profile when tier data exists |
| **FeedbackForm** | Not surfaced in UI | Add to profile or post-interaction flows when API ready |

---

## 5. Dependency Graph (Key Components)

```
Card ← EmptyState, ChannelPostsSection, GroupMembersSection, GroupSettingsSection, GroupResourcesSection, GroupPhotosSection
TagLink ← EventCard, GroupCard, EducationCard, GroupHeader, GroupPhotosSection, discovery
TagSelector ← GroupPhotosSection, GroupTagsEditor
TrustRing ← LocalPostCard, PersonCard, profile, education, messaging
PlaceholderAvatar ← LocalPostCard, PersonCard, profile, education, messaging
GroupRoleBadge ← GroupMembersSection, GroupSettingsSection
PhotoUpload ← GroupPhotosSection, profile
PhotoPlaceholder ← GroupPhotosSection
EmptyState ← GroupMembersSection, GroupEventsSection, groups/[id]
EventCard ← GroupEventsSection, home, discovery, events, tags, onboarding, vendor
```

---

## 6. Summary Table

| Status | Count | Components |
|--------|-------|------------|
| **Complete** | 25 | Card, EmptyState, TagSelector, TabButton, EventCard, GroupCard, PersonCard, VendorCard, EducationCard, GroupMembersSection, GroupResourcesSection, GroupPhotosSection, GroupEventsSection, ChannelPostsSection, GroupTagsEditor, PhotoPlaceholder, Footer, TrustRing, TrustTierIndicator, BadgeDisplay, GroupRoleBadge, TagLink, PlaceholderAvatar, PhotoUpload, GroupEventCalendar, WelcomeBanner |
| **Partial** | 8 | LocalPostCard, GroupHeader, GroupSettingsSection, Header, BottomNav, CreateFlowModal, LoginCard, FeedbackForm |
| **Placeholder** | 0 | — |
| **Incomplete** | 1 | GroupPhotoAlbumPreview |

---

*Generated for C2K handoff documentation.*
