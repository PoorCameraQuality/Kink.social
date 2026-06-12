# Mobile Visual Fix Batch 8

**Scope:** People directory, Events discover, Messaging inbox — chrome reduction, card density, duplicate UI removal.  
**Verification:** Not run (await Brax approval for typecheck/build/audit/test).

## 1. People (`/people`)

| Change | File |
|--------|------|
| Tighter mobile header; description hidden below `sm` | `FindPeopleDiscoverPage.tsx` |
| Scope tabs → horizontal scroll chips (no wrap stack) | `FindPeopleScopeTabs.tsx` |
| Hide sort `<select>` on mobile (tabs handle scope) | `FindPeopleDiscoverPage.tsx` |
| `mobileCompact` cards from index 1+: less padding, no bio/context/activity, max 2 badges | `FindPeopleProfileCard.tsx` |
| Outline Connect for non-recommended; accent for recommended / respond | `FindPeopleProfileCard.tsx` |
| Fix “Event verified” badge: only `badges.event_verified`, not generic `verified` | `people-directory-utils.ts` |
| Bottom scroll pad | `FindPeopleDiscoverPage.tsx` |

## 2. Events (`/events`)

| Change | File |
|--------|------|
| Mobile category chip row (above scope tabs) | `EventsCategoryChips.tsx`, `EventsDiscoverPage.tsx` |
| Reorder: chips → scope tabs → highlights → list | `EventsDiscoverPage.tsx` |
| Hide “Upcoming highlights” when fewer than 2 events | `EventsFeaturedStrip.tsx`, `EventsDiscoverPage.tsx` |
| Tighter toolbar: shorter search placeholder, compact sort on mobile | `EventsDiscoverPage.tsx` |
| Remove redundant result count (scope tabs show total) | `EventsDiscoverPage.tsx` |

## 3. Messaging (`/messaging`)

| Change | File |
|--------|------|
| Tighter page chrome; subtitle + Help hidden on mobile | `messaging/page.tsx` |
| Safety banner slimmer; remove duplicate Help link in collapsed state | `MessagingSafetyPanel.tsx` |
| Folder tabs denser; folder hint line off | `MessagingFolderTabs.tsx`, `messaging/page.tsx` |
| Search collapsed behind tap target when inbox empty (mobile) | `messaging/page.tsx` |
| Compact inbox filters + thread rows on mobile | `MessagingInboxFilters.tsx`, `messaging/page.tsx` |

## 4. Profile Media tab (`/profile/:username?tab=Media`)

| Change | File |
|--------|------|
| Hide lone “Media” tab chip + “Extended profile” chrome when only one tab | `ProfileExtendedSection.tsx` |
| Section headers beat empty-state titles; compact left-aligned empty states | `EmptyState.tsx`, `ProfileWritingTab.tsx`, `ProfilePhotoGallery.tsx` |
| Tighter mobile section spacing and dividers | `ProfileMediaTabPanel.tsx` |
| Single-photo gallery capped width on mobile; FAB scroll clearance | `ProfilePhotoGallery.tsx`, `ProfileExtendedSection.tsx` |
| Smaller profile tab pills on mobile | `ProfileTabBar.tsx` |

## Files changed

```
packages/web/src/lib/people-directory-utils.ts
packages/web/src/components/find-people/FindPeopleScopeTabs.tsx
packages/web/src/components/find-people/FindPeopleProfileCard.tsx
packages/web/src/app/discovery/FindPeopleDiscoverPage.tsx
packages/web/src/components/events/EventsCategoryChips.tsx
packages/web/src/components/events/EventsFeaturedStrip.tsx
packages/web/src/app/events/EventsDiscoverPage.tsx
packages/web/src/app/messaging/page.tsx
packages/web/src/components/messaging/MessagingSafetyPanel.tsx
packages/web/src/components/messaging/MessagingFolderTabs.tsx
packages/web/src/components/messaging/MessagingInboxFilters.tsx
docs/audits/ui/MOBILE-VISUAL-FIX-BATCH-8.md
```
